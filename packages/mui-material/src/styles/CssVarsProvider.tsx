import { unstable_createCssVarsProvider as createCssVarsProvider } from '@mui/system';
import createTheme, { ThemeOptions } from './createTheme';
import { PaletteOptions } from './createPalette';

interface ThemeInput extends Omit<ThemeOptions, 'palette'> {
  colorSchemes?: Partial<
    Record<
      'light' | 'dark',
      Omit<PaletteOptions, 'getContrastText' | 'contrastThreshold' | 'tonalOffset' | 'mode'>
    >
  >;
}

const { palette: lightPalette, ...lightTheme } = createTheme();
const { palette: darkPalette } = createTheme({ palette: { mode: 'dark' } });

const { CssVarsProvider, useColorScheme, getInitColorSchemeScript } = createCssVarsProvider<
  'light' | 'dark',
  ThemeInput
>({
  prefix: 'mui',
  theme: {
    ...lightTheme,
    colorSchemes: {
      // TODO: Shuold we remove the non color scheme values from here, like getContrastText, contrastThreshold etc.
      light: { palette: lightPalette },
      dark: { palette: darkPalette },
    },
  },
  defaultColorScheme: {
    light: 'light',
    dark: 'dark',
  },
  shouldSkipGeneratingVar: (keys) =>
    keys[0] === 'typography' || keys[0] === 'mixins' || keys[0] === 'breakpoints',
});

export { useColorScheme, getInitColorSchemeScript, CssVarsProvider };
