import { createRenderer, isJsdom } from '@mui/internal-test-utils';
import { recordA11y } from './axe';
import ButtonA11y from './scenarios/Button.a11y';
import CardA11y from './scenarios/Card.a11y';

const modules = [ButtonA11y, CardA11y];

describe.skipIf(isJsdom())('Visual accessibility (axe-core, browser)', () => {
  const { render } = createRenderer();

  modules.forEach(({ component, scenarios }) => {
    // eslint-disable-next-line vitest/valid-title
    describe(component, () => {
      scenarios.forEach(({ id, render: renderScenario, skipAssert }) => {
        // eslint-disable-next-line vitest/valid-title
        it(id, async (ctx) => {
          const { container } = await render(renderScenario());
          await recordA11y(ctx, container, { component, scenario: id, skipAssert });
        });
      });
    });
  });
});
