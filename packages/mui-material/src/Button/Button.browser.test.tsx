import { createRenderer, isJsdom } from '@mui/internal-test-utils';
import Button from '@mui/material/Button';
import expectNoVisualAxeViolations from '../../test/axe.browser';

const variants = ['contained', 'outlined', 'text'] as const;
const colors = ['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const;

// TODO: fix color-contrast violations for these combinations
const SKIP = [
  'contained info',
  'contained warning',
  'outlined info',
  'outlined warning',
  'text info',
  'text warning',
];

describe.skipIf(isJsdom())('Button Visual Accessibility', () => {
  const { render } = createRenderer();

  variants.forEach((variant) => {
    colors.forEach((color) => {
      const name = `${variant} ${color}`;
      const testFn = SKIP.includes(name) ? it.skip : it;

      testFn(name, async () => {
        const { container } = await render(
          <Button variant={variant} color={color}>
            Button
          </Button>,
        );
        await expectNoVisualAxeViolations(container);
      });
    });
  });
});
