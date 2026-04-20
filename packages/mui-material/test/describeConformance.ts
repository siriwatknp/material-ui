import {
  describeConformance as baseDescribeConformance,
  ConformanceOptions,
} from '@mui/internal-test-utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DefaultPropsProvider from '@mui/material/DefaultPropsProvider';
import { expectNoAxeViolations } from './a11y/axe';

interface A11yConformanceOptions extends ConformanceOptions {
  enableAxe?: boolean;
  axeDisabledRules?: string[];
}

export default function describeConformance(
  minimalElement: React.ReactElement<unknown>,
  getOptions: () => A11yConformanceOptions,
) {
  function getOptionsWithDefaults() {
    return {
      ThemeProvider,
      createTheme,
      DefaultPropsProvider,
      ...getOptions(),
    };
  }

  baseDescribeConformance(minimalElement, getOptionsWithDefaults);

  const { render, enableAxe, axeDisabledRules } = getOptions();
  if (enableAxe) {
    describe('accessibility', () => {
      it('has no axe violations', async () => {
        const { container } = await render(minimalElement as React.ReactElement<any>);
        await expectNoAxeViolations(container, axeDisabledRules);
      });
    });
  }
}
