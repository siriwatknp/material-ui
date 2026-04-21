import { defineConfig } from 'vitest/config';
// eslint-disable-next-line import/no-relative-packages -- test helpers live inside @mui/material but aren't published entries
import A11yReporter from '../../packages/mui-material/test/a11y/a11yReporter';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 60_000,
    reporters: [['default', {}], new A11yReporter()],
  },
});
