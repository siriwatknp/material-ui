import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import chalk from 'chalk';

const SCRIPT_DIR = path.dirname(url.fileURLToPath(import.meta.url));
const A11Y_RESULTS_PATH = path.resolve(
  SCRIPT_DIR,
  '../packages/mui-material/test/a11y/a11y-results.json',
);

interface A11yResult {
  passed: number;
  failed: number;
  total: number;
}

function main() {
  if (!fs.existsSync(A11Y_RESULTS_PATH)) {
    // eslint-disable-next-line no-console
    console.log(chalk.yellow('No a11y-results.json found. Run browser tests first.'));
    return;
  }

  const results: Record<string, A11yResult> = JSON.parse(
    fs.readFileSync(A11Y_RESULTS_PATH, 'utf-8'),
  );
  const names = Object.keys(results).sort();
  const passComponents = names.filter((n) => results[n].failed === 0);
  const partialComponents = names.filter((n) => results[n].failed > 0);

  // eslint-disable-next-line no-console
  console.log(
    [
      '',
      chalk.bold(`a11y results (${names.length} components)`),
      '',
      `  ✅ Pass (${passComponents.length}):     ${passComponents.join(', ') || '—'}`,
      `  ⚠️  Partial (${partialComponents.length}):  ${partialComponents.join(', ') || '—'}`,
      '',
    ].join('\n'),
  );
}

main();
