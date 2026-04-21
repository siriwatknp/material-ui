import * as url from 'url';
import * as path from 'path';
import * as fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
/* eslint-disable import/no-relative-packages, import/extensions -- test helpers live inside @mui/material but aren't published entries */
import {
  recordA11y,
  WCAG_TAGS,
  GLOBAL_DISABLED_RULES,
} from '../../packages/mui-material/test/a11y/axe.ts';
import { COMPONENTS } from '../../packages/mui-material/test/a11y/a11yConfig.ts';
/* eslint-enable import/no-relative-packages, import/extensions */

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));
const AXE_SCRIPT = path.resolve(currentDirectory, '../../node_modules/axe-core/axe.min.js');

async function main() {
  const baseUrl = 'http://localhost:5001';
  const screenshotDir = path.resolve(currentDirectory, './screenshots/chrome');

  const browser = await chromium.launch({
    args: ['--font-render-hinting=none'],
    // otherwise the loaded google Roboto font isn't applied
    headless: false,
  });
  // reuse viewport from `vrtest`
  // https://github.com/nathanmarks/vrtest/blob/1185b852a6c1813cedf5d81f6d6843d9a241c1ce/src/server/runner.js#L44
  const page = await browser.newPage({
    viewport: { width: 1000, height: 700 },
    reducedMotion: 'reduce',
  });

  // Block images since they slow down tests (need download).
  // They're also most likely decorative for documentation demos
  await page.route(/./, async (route, request) => {
    const type = await request.resourceType();
    if (type === 'image') {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Wait for all requests to finish.
  // This should load shared resources such as fonts.
  await page.goto(`${baseUrl}#dev`, { waitUntil: 'networkidle0' });
  // If we still get flaky fonts after awaiting this try `document.fonts.ready`
  await page.waitForSelector('[data-webfontloader="active"]', { state: 'attached' });

  // Simulate portrait mode for date pickers.
  // See `useIsLandscape`.
  await page.evaluate(() => {
    Object.defineProperty(window.screen.orientation, 'angle', {
      get() {
        return 0;
      },
    });
  });

  let routes = await page.$$eval('#tests a', (links) => {
    return links.map((link) => link.href);
  });
  routes = routes.map((route) => route.replace(baseUrl, ''));

  // Build a11y enrollment map: route -> { component, demo, skipAssertions }.
  // Entries without explicit `demos` inherit every VRT-exposed demo for the slug.
  const demosBySlug = new Map();
  for (const route of routes) {
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
  const a11yEnrollment = new Map();
  for (const { component, slug, demos: configured, skipAssertions } of COMPONENTS) {
    const demos = configured ?? demosBySlug.get(slug) ?? [];
    for (const demoName of demos) {
      a11yEnrollment.set(`/docs-components-${slug}/${demoName}`, {
        component,
        demo: demoName,
        skipAssertions,
      });
    }
  }
  const axeSource = await fs.readFile(AXE_SCRIPT, 'utf8');

  /**
   * @param {string} route
   */
  async function renderFixture(route) {
    await page.evaluate((_route) => {
      // Use client-side routing which is much faster than full page navigation via page.goto().
      window.muiFixture.navigate(`${_route}#no-dev`);

      // Playwright hides scrollbar when capturing a screenshot on an element or with fullPage: true.
      // When the body has a scrollbar, this causes a brief layout shift. Disable the body overflow
      // altogether to prevent this
      window.document.body.style.overflow = 'hidden';
    }, route);

    // Move cursor offscreen to not trigger unwanted hover effects.
    await page.mouse.move(0, 0);

    const testcase = await page.waitForSelector(
      `[data-testid="testcase"][data-testpath="${route}"]:not([aria-busy="true"])`,
    );

    return testcase;
  }

  async function takeScreenshot({ testcase, route }) {
    const screenshotPath = path.resolve(screenshotDir, `.${route}.png`);
    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });

    const explicitScreenshotTarget = await page.$('[data-testid="screenshot-target"]');
    const screenshotTarget = explicitScreenshotTarget || testcase;

    await screenshotTarget.screenshot({
      path: screenshotPath,
      type: 'png',
      animations: 'disabled',
    });
  }

  // prepare screenshots
  await fs.rm(screenshotDir, { recursive: true, force: true });
  await fs.mkdir(screenshotDir, { recursive: true });

  describe('visual regressions', () => {
    beforeEach(async () => {
      await page.evaluate(() => {
        localStorage.clear();
      });
    });

    afterAll(async () => {
      await browser.close();
    });

    routes.forEach((route) => {
      it(`creates screenshots of ${route}`, async function test(ctx) {
        // With the playwright inspector we might want to call `page.pause` which would lead to a timeout.
        if (process.env.PWDEBUG) {
          this?.timeout?.(0);
        }

        const testcase = await renderFixture(route);

        switch (route) {
          case '/docs-components-table/ReactVirtualizedTable': {
            await page.waitForSelector('[data-index="1"]');
            break;
          }
          default:
            break;
        }

        // Run axe before the screenshot so it observes the natural DOM —
        // Playwright's `animations: 'disabled'` injects inline `!important`
        // styles that otherwise perturb rule applicability.
        const enrollment = a11yEnrollment.get(route);
        if (enrollment) {
          // Inject axe fresh each run — page.addScriptTag can leak between navigations.
          await page.evaluate(axeSource);
          const results = await page.evaluate(
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
          recordA11y(ctx, results, enrollment);
        }

        await takeScreenshot({ testcase, route });
      });
    });

    describe('Rating', () => {
      it('should handle focus-visible correctly', async () => {
        const testcase = await renderFixture('/regression-Rating/FocusVisibleRating');
        await page.keyboard.press('Tab');
        await takeScreenshot({ testcase, route: '/regression-Rating/FocusVisibleRating2' });
        await page.keyboard.press('ArrowLeft');
        await takeScreenshot({ testcase, route: '/regression-Rating/FocusVisibleRating3' });
      });

      it('should handle focus-visible with precise ratings correctly', async () => {
        const testcase = await renderFixture('/regression-Rating/PreciseFocusVisibleRating');
        await page.keyboard.press('Tab');
        await takeScreenshot({ testcase, route: '/regression-Rating/PreciseFocusVisibleRating2' });
        await page.keyboard.press('ArrowRight');
        await takeScreenshot({ testcase, route: '/regression-Rating/PreciseFocusVisibleRating3' });
      });
    });

    describe('Autocomplete', () => {
      it('should not close immediately when textbox expands', async () => {
        const testcase = await renderFixture(
          '/regression-Autocomplete/TextboxExpandsOnListboxOpen',
        );
        await page.getByRole('combobox').click();
        await page.waitForTimeout(10);
        await takeScreenshot({
          testcase,
          route: '/regression-Autocomplete/TextboxExpandsOnListboxOpen2',
        });
      });

      it('should style virtualized listbox correctly', async () => {
        const testcase = await renderFixture('/regression-Autocomplete/Virtualize');
        await page.getByRole('combobox').click();
        await takeScreenshot({ testcase, route: '/regression-Autocomplete/Virtualize2' });
        await page.hover('[role="option"]');
        await takeScreenshot({ testcase, route: '/regression-Autocomplete/Virtualize3' });
        await page.click('[role="option"]');
        await takeScreenshot({ testcase, route: '/regression-Autocomplete/Virtualize4' });
      });
    });

    describe('Switch', () => {
      it('should render standard variant correctly in forced-colors mode', async () => {
        await page.emulateMedia({ forcedColors: 'active' });
        try {
          const testcase = await renderFixture('/regression-Switch/SimpleSwitch');
          await takeScreenshot({
            testcase,
            route: '/regression-Switch/SimpleSwitchForcedColors',
          });
        } finally {
          await page.emulateMedia({ forcedColors: 'none' });
        }
      });
    });

    describe('TextField', () => {
      it('should render standard variant correctly in forced-colors mode', async () => {
        await page.emulateMedia({ forcedColors: 'active' });
        try {
          const testcase = await renderFixture('/regression-TextField/StandardTextField');
          await takeScreenshot({
            testcase,
            route: '/regression-TextField/StandardTextFieldForcedColors',
          });
        } finally {
          await page.emulateMedia({ forcedColors: 'none' });
        }
      });
    });

    describe('Textarea', () => {
      it('should keep input caret position at the end when adding a newline', async () => {
        await renderFixture('/regression-Textarea/TextareaAutosize');
        await page.getByTestId('input').focus();

        const textWithEndline = `abc def abc def abc def\n`;
        await page.evaluate((text) => {
          navigator.clipboard.writeText(text);
        }, textWithEndline);

        const pasteCommand = process.platform === 'darwin' ? 'Meta+V' : 'Control+V';

        await page.keyboard.press(pasteCommand);
        await page.keyboard.press(pasteCommand);
        await page.keyboard.press(pasteCommand);

        await page.evaluate(() => {
          const textarea = document.querySelector('textarea');
          if (textarea.selectionStart !== textarea.value.length) {
            throw new Error('The caret is not at the end of the textarea');
          }
        });
      });
    });
  });
}

await main();
