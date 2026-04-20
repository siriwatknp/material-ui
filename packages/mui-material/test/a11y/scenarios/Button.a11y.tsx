import Button from '@mui/material/Button';
import { describeA11y } from '../axe';

const variants = ['contained', 'outlined', 'text'] as const;
const colors = ['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const;

// TODO: fix color-contrast violations for these combinations
const SKIP_ASSERT = new Set<string>([
  'variant:contained, color:info',
  'variant:contained, color:warning',
  'variant:outlined, color:info',
  'variant:outlined, color:warning',
  'variant:text, color:info',
  'variant:text, color:warning',
]);

export default describeA11y('Button', {
  scenarios: variants.flatMap((variant) =>
    colors.map((color) => {
      const id = `variant:${variant}, color:${color}`;
      return {
        id,
        skipAssert: SKIP_ASSERT.has(id),
        render: () => (
          <Button variant={variant} color={color}>
            Button
          </Button>
        ),
      };
    }),
  ),
});
