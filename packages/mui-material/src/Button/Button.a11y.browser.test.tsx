import { createRenderer } from '@mui/internal-test-utils';
import Button from '@mui/material/Button';
import expectNoAxeViolations from '../../test/axe.browser';

describe('<Button /> browser accessibility', () => {
  const { render } = createRenderer();

  it('has no axe violations across variants', async () => {
    const { container } = await render(
      <div>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
      </div>,
    );
    await expectNoAxeViolations(container);
  });

  it('has no axe violations when disabled', async () => {
    const { container } = await render(
      <Button disabled>Disabled</Button>,
    );
    await expectNoAxeViolations(container);
  });
});
