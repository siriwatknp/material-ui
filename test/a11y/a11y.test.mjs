import * as path from 'node:path';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
/* eslint-disable import/no-relative-packages -- test helpers live inside @mui/material but aren't published entries */
import {
  recordA11y,
  WCAG_TAGS,
  GLOBAL_DISABLED_RULES,
} from '../../packages/mui-material/test/a11y/axe.ts';
import { COMPONENTS } from '../../packages/mui-material/test/a11y/config.ts';
/* eslint-enable import/no-relative-packages */

const currentDirectory = path.dirname(url.fileURLToPath(import.meta.url));
const AXE_SCRIPT = path.resolve(currentDirectory, '../../node_modules/axe-core/axe.min.js');

const ENROLLED = COMPONENTS.filter((entry) => entry.status === 'enabled');

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

  // Scrape the VRT nav to discover every available /docs-components-{slug}/{demo}
  // route, so config entries without an explicit `demos` list fall back to
  // "every VRT-exposed demo for this slug".
  const allRoutes = await page.$$eval('#tests a', (links) =>
    links.map((l) => new URL(l.href).pathname),
  );
  const demosBySlug = new Map();
  for (const route of allRoutes) {
    const match = route.match(/^\/docs-components-(.+?)\/(.+)$/);
    if (!match) {
      continue;
    }
    const [, slug, demoName] = match;
    if (!demosBySlug.has(slug)) {
      demosBySlug.set(slug, []);
    }
    demosBySlug.get(slug).push(demoName);
  }

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

    for (const { component, slug, demos: configured, skipAssertions } of ENROLLED) {
      const demos = configured ?? demosBySlug.get(slug) ?? [];
      if (demos.length === 0) {
        continue;
      }
      // eslint-disable-next-line vitest/valid-title
      describe(component, () => {
        for (const demoName of demos) {
          const route = `/docs-components-${slug}/${demoName}`;

          // eslint-disable-next-line vitest/valid-title
          it(demoName, async (ctx) => {
            const results = await renderAndAudit(route);
            recordA11y(ctx, results, { component, demo: demoName, skipAssertions });
          });
        }
      });
    }
  });
}

await main();
