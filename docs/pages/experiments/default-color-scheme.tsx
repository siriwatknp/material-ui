'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import {
  createColorScheme,
  createTheme,
  ThemeProvider,
  useColorScheme,
  type SupportedColorScheme,
  type ThemeOptions,
} from '@mui/material/styles';

// `createTheme` only runs the default scheme and the built-in `light`/`dark` keys through
// `createPalette`, so every custom scheme has to arrive complete via `createColorScheme`.
const colorSchemes = {
  'blue-light-high': createColorScheme({
    palette: { mode: 'light', primary: { main: '#0b57d0' } },
  }),
  'blue-dark-high': createColorScheme({
    palette: { mode: 'dark', primary: { main: '#a8c7fa' } },
  }),
  'gray-light-high': createColorScheme({
    palette: { mode: 'light', primary: { main: '#3c4043' } },
  }),
  'gray-dark-high': createColorScheme({
    palette: { mode: 'dark', primary: { main: '#dadce0' } },
  }),
  'gray-light-low': createColorScheme({
    palette: { mode: 'light', primary: { main: '#9aa0a6' } },
  }),
};

const DEFAULT_LIGHT = 'blue-light-high' as SupportedColorScheme;
const DEFAULT_DARK = 'blue-dark-high' as SupportedColorScheme;

// An app declares these names once and every MUI API accepts them without a cast:
//
//   declare module '@mui/material/styles' {
//     interface ColorSchemeOverrides {
//       'blue-light-high': true;
//       // ...
//     }
//   }
//
// The augmentation is global, and the docs workspace has themes that only define `light`/`dark`,
// so this page casts instead.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-color-scheme' },
  // Decides which scheme is written to `:root`, nothing else.
  defaultColorScheme: DEFAULT_LIGHT,
  colorSchemes: colorSchemes as ThemeOptions['colorSchemes'],
});

function Playground() {
  const { mode, setMode, colorScheme, setColorScheme, lightColorScheme, darkColorScheme } =
    useColorScheme();

  // The provider seeds its state with `light`/`dark`, which do not exist here, so the default has
  // to be mapped onto both slots. `InitColorSchemeScript` below does the same for the first paint.
  React.useEffect(() => {
    setColorScheme({ light: DEFAULT_LIGHT, dark: DEFAULT_DARK });
  }, [setColorScheme]);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const rows = [
    ['mode', mode],
    ['colorScheme', colorScheme],
    ['lightColorScheme', lightColorScheme],
    ['darkColorScheme', darkColorScheme],
  ] as const;

  return (
    <Stack
      spacing={3}
      sx={{
        alignItems: 'flex-start',
        p: 4,
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Typography variant="h5">Default color scheme</Typography>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode ?? null}
        onChange={(event, value) => value && setMode(value)}
      >
        <ToggleButton value="light">light</ToggleButton>
        <ToggleButton value="dark">dark</ToggleButton>
        <ToggleButton value="system">system</ToggleButton>
      </ToggleButtonGroup>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={colorScheme ?? null}
        onChange={(event, value) => value && setColorScheme(value)}
      >
        {Object.keys(colorSchemes).map((scheme) => (
          <ToggleButton key={scheme} value={scheme}>
            {scheme}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Box
        component="dl"
        sx={{
          m: 0,
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr',
          columnGap: 3,
          rowGap: 0.5,
          fontFamily: 'monospace',
          fontSize: 13,
        }}
      >
        {rows.map(([key, value]) => (
          <React.Fragment key={key}>
            <Box component="dt" sx={{ opacity: 0.6 }}>
              {key}
            </Box>
            <Box component="dd" sx={{ m: 0 }}>
              {mounted ? String(value) : '…'}
            </Box>
          </React.Fragment>
        ))}
      </Box>

      <Button variant="contained">Primary</Button>
    </Stack>
  );
}

export default function DefaultColorSchemeExperiment() {
  return (
    <React.Fragment>
      {/* Belongs in `_document`/`layout` in a real app, it runs before React to avoid a flash. */}
      <InitColorSchemeScript
        attribute="data-color-scheme"
        defaultLightColorScheme={DEFAULT_LIGHT}
        defaultDarkColorScheme={DEFAULT_DARK}
      />
      <ThemeProvider theme={theme} disableNestedContext>
        <Playground />
      </ThemeProvider>
    </React.Fragment>
  );
}
