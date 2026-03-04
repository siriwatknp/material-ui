import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import * as prettier from 'prettier';

const SCRIPT_DIR = path.dirname(url.fileURLToPath(import.meta.url));
const MUI_MATERIAL_SRC = path.resolve(SCRIPT_DIR, '../packages/mui-material/src');
const OUTPUT_DIR = path.resolve(
  SCRIPT_DIR,
  '../docs/data/material/getting-started/accessibility-compliance',
);
const MD_PATH = path.join(OUTPUT_DIR, 'accessibility-compliance.md');
const COMPONENT_PATH = path.resolve(
  SCRIPT_DIR,
  '../docs/src/modules/components/MaterialAccessibilityCompliance.js',
);

const EXCLUDED_COMPONENTS = [
  // Layout
  'Box',
  'Container',
  'Grid',
  'GridLegacy',
  'Stack',
  'ImageList',
  'ImageListItem',
  'ImageListItemBar',
  // Transitions
  'Collapse',
  'Fade',
  'Grow',
  'Slide',
  'Zoom',
  // Style/rendering utilities
  'GlobalStyles',
  'CssBaseline',
  'ScopedCssBaseline',
  'InitColorSchemeScript',
  'Portal',
  'NoSsr',
  'Popper',
  'ClickAwayListener',
  'TextareaAutosize',
];

// Maps a parent component to its sub-components that should be grouped into one row.
const COMPONENT_FAMILIES: Record<string, string[]> = {
  Accordion: ['AccordionActions', 'AccordionDetails', 'AccordionSummary'],
  Alert: ['AlertTitle'],
  Avatar: ['AvatarGroup'],
  BottomNavigation: ['BottomNavigationAction'],
  Button: ['ButtonBase', 'ButtonGroup'],
  Card: ['CardActionArea', 'CardActions', 'CardContent', 'CardHeader', 'CardMedia'],
  Dialog: ['DialogActions', 'DialogContent', 'DialogContentText', 'DialogTitle'],
  FormControl: ['FormControlLabel', 'FormGroup', 'FormHelperText', 'FormLabel'],
  Input: ['InputAdornment', 'InputBase', 'InputLabel'],
  List: [
    'ListItem',
    'ListItemAvatar',
    'ListItemButton',
    'ListItemIcon',
    'ListItemSecondaryAction',
    'ListItemText',
    'ListSubheader',
  ],
  Pagination: ['PaginationItem'],
  Snackbar: ['SnackbarContent'],
  SpeedDial: ['SpeedDialAction', 'SpeedDialIcon'],
  Step: ['StepButton', 'StepConnector', 'StepContent', 'StepIcon', 'StepLabel'],
  Table: [
    'TableBody',
    'TableCell',
    'TableContainer',
    'TableFooter',
    'TableHead',
    'TablePagination',
    'TablePaginationActions',
    'TableRow',
    'TableSortLabel',
  ],
  ToggleButton: ['ToggleButtonGroup'],
};

const SUB_COMPONENTS = new Set(Object.values(COMPONENT_FAMILIES).flat());

interface ComponentInfo {
  name: string;
  jsdom: boolean;
  browserTest: boolean;
  skip: string[];
  skipReason: string;
}

interface FamilyInfo {
  name: string;
  status: 'pass' | 'partial' | 'upcoming';
  skip: string[];
  skipReason: string;
}

function getComponents(): string[] {
  const excludeSet = new Set(EXCLUDED_COMPONENTS);
  return fs
    .readdirSync(MUI_MATERIAL_SRC)
    .filter((name) => {
      if (excludeSet.has(name)) {
        return false;
      }
      if (!/^[A-Z]/.test(name)) {
        return false;
      }
      const dir = path.join(MUI_MATERIAL_SRC, name);
      if (!fs.statSync(dir).isDirectory()) {
        return false;
      }
      const hasComponent =
        fs.existsSync(path.join(dir, `${name}.tsx`)) ||
        fs.existsSync(path.join(dir, `${name}.js`));
      const hasTest =
        fs.existsSync(path.join(dir, `${name}.test.js`)) ||
        fs.existsSync(path.join(dir, `${name}.test.tsx`));
      return hasComponent && hasTest;
    })
    .sort();
}

function readTestFile(componentName: string): string | null {
  const dir = path.join(MUI_MATERIAL_SRC, componentName);
  for (const ext of ['.test.js', '.test.tsx']) {
    const testFile = path.join(dir, `${componentName}${ext}`);
    if (fs.existsSync(testFile)) {
      return fs.readFileSync(testFile, 'utf-8');
    }
  }
  return null;
}

function hasEnableAxe(testContent: string): boolean {
  return /enableAxe:\s*true/.test(testContent);
}

function getBrowserTestInfo(
  componentName: string,
): { exists: boolean; skip: string[]; skipReason: string } {
  const browserTestPath = path.join(
    MUI_MATERIAL_SRC,
    componentName,
    `${componentName}.browser.test.tsx`,
  );
  if (!fs.existsSync(browserTestPath)) {
    return { exists: false, skip: [], skipReason: '' };
  }
  const content = fs.readFileSync(browserTestPath, 'utf-8');

  const skip: string[] = [];
  let skipReason = '';

  const skipMatch = content.match(/const SKIP\s*=\s*\[([\s\S]*?)\]/);
  if (skipMatch) {
    for (const m of skipMatch[1].matchAll(/['"]([^'"]+)['"]/g)) {
      skip.push(m[1]);
    }
    const lines = content.split('\n');
    const skipLineIndex = lines.findIndex((l) => /const SKIP\s*=/.test(l));
    if (skipLineIndex > 0) {
      for (let i = skipLineIndex - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('//')) {
          const commentText = line.replace(/^\/\/\s*/, '');
          // Extract axe rule name (e.g., "color-contrast") and convert to readable label
          const ruleMatch = commentText.match(/\b(color-contrast|link-in-text-block)\b/);
          if (ruleMatch) {
            skipReason = ruleMatch[1]
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');
          } else {
            skipReason = commentText.replace(/^TODO:\s*/i, '');
          }
          break;
        }
        if (line !== '') {
          break;
        }
      }
    }
  }

  return { exists: true, skip, skipReason };
}

function getStatus(info: ComponentInfo): 'pass' | 'partial' | 'upcoming' {
  if (!info.jsdom && !info.browserTest) {
    return 'upcoming';
  }
  if (info.skip.length > 0) {
    return 'partial';
  }
  return 'pass';
}

function buildFamilies(components: ComponentInfo[]): FamilyInfo[] {
  const componentMap = new Map(components.map((c) => [c.name, c]));
  const families: FamilyInfo[] = [];

  for (const comp of components) {
    if (SUB_COMPONENTS.has(comp.name)) {
      continue;
    }

    const subNames = COMPONENT_FAMILIES[comp.name] ?? [];
    let familyStatus = getStatus(comp);
    if (familyStatus === 'pass') {
      for (const memberName of subNames) {
        const member = componentMap.get(memberName);
        if (member && getStatus(member) === 'partial') {
          familyStatus = 'partial';
          break;
        }
      }
    }

    families.push({
      name: comp.name,
      status: familyStatus,
      skip: comp.skip,
      skipReason: comp.skipReason,
    });
  }

  return families;
}

function generateComponent(families: FamilyInfo[]): string {
  const dataEntries = families
    .map((f) => {
      const entry: Record<string, string | string[]> = {
        name: f.name,
        status: f.status,
      };
      if (f.skip.length > 0) {
        entry.skip = f.skip;
      }
      if (f.skipReason) {
        entry.skipReason = f.skipReason;
      }
      return entry;
    });

  return `// Generated by scripts/generateA11yDoc.ts. Do not edit directly.
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const components = ${JSON.stringify(dataEntries, null, 2)};

const statusConfig = {
  pass: { label: 'Pass', color: 'success' },
  partial: { label: 'Partial', color: 'warning' },
  upcoming: { label: 'Upcoming', color: 'default' },
};

export default function AccessibilityCompliance() {
  return (
    <Paper sx={{ width: '100%' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Component</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Known Failures</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {components.map((component) => {
            const config = statusConfig[component.status];
            return (
              <TableRow key={component.name}>
                <TableCell>
                  <Typography variant="body2">{component.name}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={config.label} color={config.color} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  {component.skip ? (
                    <div>
                      {component.skipReason ? (
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {component.skipReason}
                        </Typography>
                      ) : null}
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {component.skip.map((item) => (
                          <li key={item}>
                            <Typography variant="body2" color="text.secondary">
                              {item}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
`;
}

function generateMarkdown(): string {
  return `# Accessibility Compliance

<p class="description">Automated accessibility test coverage for Material UI components using axe-core.</p>

Material UI uses [axe-core](https://github.com/dequelabs/axe-core) for automated accessibility testing:

- **JSDOM tests** check structural accessibility rules (ARIA attributes, roles, labels).
- **Browser tests** check visual rules (color contrast, link-in-text-block) in real Chrome.

{{"component": "modules/components/MaterialAccessibilityCompliance.js"}}
`;
}

async function main() {
  const componentNames = getComponents();
  const components: ComponentInfo[] = componentNames.map((name) => {
    const testContent = readTestFile(name);
    const jsdom = testContent ? hasEnableAxe(testContent) : false;
    const browserInfo = getBrowserTestInfo(name);

    return {
      name,
      jsdom,
      browserTest: browserInfo.exists,
      skip: browserInfo.skip,
      skipReason: browserInfo.skipReason,
    };
  });

  const families = buildFamilies(components);

  const prettierConfig = await prettier.resolveConfig(process.cwd(), {
    config: path.join(SCRIPT_DIR, '../prettier.config.mjs'),
  });

  const markdown = generateMarkdown();
  const formattedMd = await prettier.format(markdown, {
    ...prettierConfig,
    filepath: MD_PATH,
  });

  const component = generateComponent(families);
  const formattedComponent = await prettier.format(component, {
    ...prettierConfig,
    filepath: COMPONENT_PATH,
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(MD_PATH, formattedMd, 'utf-8');
  fs.writeFileSync(COMPONENT_PATH, formattedComponent, 'utf-8');

  const passCount = families.filter((f) => f.status === 'pass').length;
  const partialCount = families.filter((f) => f.status === 'partial').length;
  const upcomingCount = families.filter((f) => f.status === 'upcoming').length;

  console.log(`Generated ${MD_PATH}`);
  console.log(`Generated ${COMPONENT_PATH}`);
  console.log(`  Pass: ${passCount}, Partial: ${partialCount}, Upcoming: ${upcomingCount}`);
}

main();
