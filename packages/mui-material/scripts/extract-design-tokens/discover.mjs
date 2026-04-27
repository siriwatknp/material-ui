import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_SKIP = new Set([
  'Box',
  'Portal',
  'NoSsr',
  'ClickAwayListener',
  'InitColorSchemeScript',
  'CssBaseline',
  'ScopedCssBaseline',
  'GlobalStyles',
  'TextareaAutosize',
  'SwipeableDrawer',
  'Unstable_TrapFocus',
  'PigmentContainer',
  'PigmentGrid',
  'PigmentStack',
  'Slide',
  'Fade',
  'Grow',
  'Zoom',
  'Collapse',
  'Popper',
  'Modal',
]);

const NAME_RE = /\bname:\s*['"]Mui[A-Z][A-Za-z]*['"]/;

export function discoverComponents({ srcDir, only }) {
  const includeFilter = only ? new Set(only) : null;
  const dirs = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => /^[A-Z]/.test(name));

  const found = [];
  const skipped = [];

  for (const dir of dirs) {
    const file = path.join(srcDir, dir, `${dir}.js`);
    if (!fs.existsSync(file)) {
      skipped.push({ name: dir, reason: 'no <Name>.js' });
      continue;
    }
    if (includeFilter && !includeFilter.has(dir)) {
      continue;
    }
    if (!includeFilter && DEFAULT_SKIP.has(dir)) {
      skipped.push({ name: dir, reason: 'default skip-list' });
      continue;
    }
    const src = fs.readFileSync(file, 'utf8');
    if (!NAME_RE.test(src)) {
      skipped.push({ name: dir, reason: 'no styled(...) with name: Mui*' });
      continue;
    }
    found.push({ name: dir, file });
  }
  return { found, skipped };
}
