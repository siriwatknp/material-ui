import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import * as prettier from 'prettier';

const SCRIPT_DIR = path.dirname(url.fileURLToPath(import.meta.url));
const DOCS_COMPONENTS_DIR = path.resolve(
  SCRIPT_DIR,
  '../docs/data/material/components',
);
const MUI_MATERIAL_SRC = path.resolve(SCRIPT_DIR, '../packages/mui-material/src');
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

interface ComponentInfo {
  name: string;
  jsdom: boolean;
  browserTest: boolean;
  skip: string[];
  skipReason: string;
}

function getParentComponents(): string[] {
  const excludeSet = new Set(EXCLUDED_COMPONENTS);
  const components = new Set<string>();

  const dirs = fs.readdirSync(DOCS_COMPONENTS_DIR);
  for (const dir of dirs) {
    const dirPath = path.join(DOCS_COMPONENTS_DIR, dir);
    if (!fs.statSync(dirPath).isDirectory()) {
      continue;
    }
    const mdFiles = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'));
    for (const mdFile of mdFiles) {
      const content = fs.readFileSync(path.join(dirPath, mdFile), 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        continue;
      }
      const frontmatter = frontmatterMatch[1];

      let componentName: string | null = null;

      const githubSourceMatch = frontmatter.match(/^githubSource:\s*(.+)$/m);
      if (githubSourceMatch) {
        const sourcePath = githubSourceMatch[1].trim();
        if (sourcePath.startsWith('packages/mui-material/src/')) {
          componentName = sourcePath.split('/').pop()!;
        }
      }

      if (!componentName) {
        const componentsMatch = frontmatter.match(/^components:\s*(.+)$/m);
        if (componentsMatch) {
          const first = componentsMatch[1].split(',')[0].trim();
          const componentDir = path.join(MUI_MATERIAL_SRC, first);
          if (fs.existsSync(componentDir) && fs.statSync(componentDir).isDirectory()) {
            componentName = first;
          }
        }
      }

      if (!componentName || excludeSet.has(componentName) || !/^[A-Z]/.test(componentName)) {
        continue;
      }

      const compDir = path.join(MUI_MATERIAL_SRC, componentName);
      if (!fs.existsSync(compDir) || !fs.statSync(compDir).isDirectory()) {
        continue;
      }
      const hasTest =
        fs.existsSync(path.join(compDir, `${componentName}.test.js`)) ||
        fs.existsSync(path.join(compDir, `${componentName}.test.tsx`));
      if (!hasTest) {
        continue;
      }

      components.add(componentName);
    }
  }

  return [...components].sort();
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

async function main() {
  const componentNames = getParentComponents();
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

  const dataEntries = components.map((comp) => {
    const status = getStatus(comp);
    const entry: Record<string, string | string[]> = {
      name: comp.name,
      status,
    };
    if (comp.skip.length > 0) {
      entry.skip = comp.skip;
    }
    if (comp.skipReason) {
      entry.skipReason = comp.skipReason;
    }
    return entry;
  });

  const existing = fs.readFileSync(COMPONENT_PATH, 'utf-8');
  const updated = existing.replace(
    /const components = \[[\s\S]*?\];/,
    `const components = ${JSON.stringify(dataEntries, null, 2)};`,
  );

  const prettierConfig = await prettier.resolveConfig(process.cwd(), {
    config: path.join(SCRIPT_DIR, '../prettier.config.mjs'),
  });

  const formatted = await prettier.format(updated, {
    ...prettierConfig,
    filepath: COMPONENT_PATH,
  });

  fs.writeFileSync(COMPONENT_PATH, formatted, 'utf-8');

  const passCount = dataEntries.filter((e) => e.status === 'pass').length;
  const partialCount = dataEntries.filter((e) => e.status === 'partial').length;
  const upcomingCount = dataEntries.filter((e) => e.status === 'upcoming').length;

  console.log(`Updated ${COMPONENT_PATH}`);
  console.log(
    `  Components: ${dataEntries.length} (Pass: ${passCount}, Partial: ${partialCount}, Upcoming: ${upcomingCount})`,
  );
}

main();
