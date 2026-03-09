import { createRenderer, isJsdom } from '@mui/internal-test-utils';
import Button from '@mui/material/Button';
import { expectNoVisualAxeViolations, createAxeCollector } from '../../test/axe';
import flushAxeResults from '../../test/axeFlush';

const collector = createAxeCollector();

const variants = ['contained', 'outlined', 'text'] as const;
const colors = ['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const;

// TODO: fix color-contrast violations for these combinations
const SKIP = [
  'variant:contained, color:info',
  'variant:contained, color:warning',
  'variant:outlined, color:info',
  'variant:outlined, color:warning',
  'variant:text, color:info',
  'variant:text, color:warning',
];

describe.skipIf(isJsdom())('Button Visual Accessibility', () => {
  const { render } = createRenderer();

  afterAll(async () => {
    await flushAxeResults({ component: 'Button', collector });
  });

  variants.forEach((variant) => {
    colors.forEach((color) => {
      const testName = `variant:${variant}, color:${color}`;
      const skipped = SKIP.includes(testName);

      // eslint-disable-next-line vitest/valid-title
      it(testName, async () => {
        const { container } = await render(
          <Button variant={variant} color={color}>
            Button
          </Button>,
        );
        await collector.collectAxeRules(container, testName);
        if (!skipped) {
          await expectNoVisualAxeViolations(container);
        }
      });
    });
  });
});
