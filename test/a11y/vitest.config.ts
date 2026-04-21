import * as path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: __dirname,
    include: ['**/*.test.mjs'],
    globals: true,
    testTimeout: 60_000,
  },
  cacheDir: path.resolve(__dirname, 'node_modules/.vite'),
});
