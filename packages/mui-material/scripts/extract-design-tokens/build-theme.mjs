import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stylesPath = path.resolve(__dirname, '../../build/styles/index.js');
const { createTheme } = require(stylesPath);

export function buildTheme(scheme) {
  const theme = createTheme({
    cssVariables: true,
    colorSchemes: { light: true, dark: true },
    palette: { mode: scheme },
  });
  return theme;
}
