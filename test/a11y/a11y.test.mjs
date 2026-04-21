import * as path from 'node:path';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
/* eslint-disable import/no-relative-packages -- test helper lives inside @mui/material but isn't a published entry */
import {
  recordA11y,
  WCAG_TAGS,
  GLOBAL_DISABLED_RULES,
} from '../../packages/mui-material/test/a11y/axe.ts';
/* eslint-enable import/no-relative-packages */

const currentDirectory = path.dirname(url.fileURLToPath(import.meta.url));
const AXE_SCRIPT = path.resolve(currentDirectory, '../../node_modules/axe-core/axe.min.js');

/**
 * Grouped enrollment: { ComponentName: { demos: [<suite>/<DemoFile>, ...] } }
 *
 * POC scope — see AGENTS.md for how to enroll more components.
 */
const ENROLLED = {
  Button: {
    demos: ['buttons/BasicButtons', 'buttons/ColorButtons'],
  },
  Card: {
    demos: ['cards/BasicCard', 'cards/OutlinedCard'],
  },
};

async function main() {
  const baseUrl = 'http://localhost:5001';
  const browser = await chromium.launch({
    args: ['--font-render-hinting=none'],
  });
  const page = await browser.newPage({
    viewport: { width: 1000, height: 700 },
    reducedMotion: 'reduce',
  });

  // Block images — color-contrast doesn't need them and they slow the run.
  await page.route(/./, async (route, request) => {
    const type = await request.resourceType();
    if (type === 'image') {
      route.abort();
    } else {
      route.continue();
    }
  });

  await page.goto(`${baseUrl}#dev`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-webfontloader="active"]', { state: 'attached' });
  const axeSource = await fs.readFile(AXE_SCRIPT, 'utf8');

  async function renderAndAudit(route) {
    await page.evaluate((_route) => {
      window.muiFixture.navigate(`${_route}#no-dev`);
    }, route);

    const testcase = await page.waitForSelector(
      `[data-testid="testcase"][data-testpath="${route}"]:not([aria-busy="true"])`,
    );

    // Inject axe fresh each run — page.addScriptTag can leak between navigations.
    await page.evaluate(axeSource);
    return page.evaluate(
      async ({ element, disabledRules, tags }) => {
        window.axe.configure({
          rules: disabledRules.map((id) => ({ id, enabled: false })),
        });
        return window.axe.run(element, {
          runOnly: { type: 'tag', values: tags },
        });
      },
      { element: testcase, disabledRules: GLOBAL_DISABLED_RULES, tags: WCAG_TAGS },
    );
  }

  describe('Accessibility (axe-core, demo-based)', () => {
    afterAll(async () => {
      await browser.close();
    });

    for (const [component, config] of Object.entries(ENROLLED)) {
      // eslint-disable-next-line vitest/valid-title
      describe(component, () => {
        for (const entry of config.demos) {
          const spec = typeof entry === 'string' ? { demo: entry } : entry;
          const demoName = spec.demo.split('/').pop();
          const route = `/docs-components-${spec.demo}`;

          // eslint-disable-next-line vitest/valid-title
          it(demoName, async (ctx) => {
            const results = await renderAndAudit(route);
            recordA11y(ctx, results, {
              component,
              demo: demoName,
              skipRules: spec.skipRules,
            });
          });
        }
      });
    }
  });
}

await main();
