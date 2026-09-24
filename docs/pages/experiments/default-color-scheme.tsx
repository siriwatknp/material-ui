'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
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
} from '@mui/material/styles';

const BRANDS = ['blue', 'gray'] as const;
const CONTRASTS = ['high', 'low'] as const;
const MODES = ['light', 'dark'] as const;

type Brand = (typeof BRANDS)[number];
type Contrast = (typeof CONTRASTS)[number];
type Mode = (typeof MODES)[number];
type FlatScheme = `${Brand}-${Mode}-${Contrast}`;

/**
 * An app declares its scheme names once and every MUI API accepts them:
 *
 *   declare module '@mui/material/styles' {
 *     interface ColorSchemeOverrides extends Record<FlatScheme, true> {}
 *   }
 *
 * Module augmentation is global, and the docs workspace has themes that only define `light`/`dark`,
 * so this page casts at the call sites instead.
 */
const asScheme = (name: FlatScheme) => name as unknown as SupportedColorScheme;

const DEFAULT_BRAND: Brand = 'blue';
const DEFAULT_CONTRAST: Contrast = 'high';

function flatScheme(brand: Brand, mode: Mode, contrast: Contrast): FlatScheme {
  return `${brand}-${mode}-${contrast}`;
}

const BRAND_MAIN = {
  blue: { light: '#1565c0', dark: '#90caf9' },
  gray: { light: '#455a64', dark: '#b0bec5' },
};

const SURFACE = {
  light: {
    high: { default: '#ffffff', paper: '#ffffff', text: '#000000' },
    low: { default: '#eceff1', paper: '#f5f7f8', text: '#37474f' },
  },
  dark: {
    high: { default: '#000000', paper: '#0b0b0b', text: '#ffffff' },
    low: { default: '#1c2226', paper: '#252c31', text: '#cfd8dc' },
  },
};

function buildPalette(brand: Brand, mode: Mode, contrast: Contrast) {
  const surface = SURFACE[mode][contrast];
  return {
    mode,
    primary: { main: BRAND_MAIN[brand][mode] },
    background: { default: surface.default, paper: surface.paper },
    text: { primary: surface.text },
  };
}

// Only the default scheme is run through `createPalette` by `createTheme`, every other one has to
// arrive complete.
function buildScheme(brand: Brand, mode: Mode, contrast: Contrast) {
  return createColorScheme({ palette: buildPalette(brand, mode, contrast) });
}

const flatColorSchemes = Object.fromEntries(
  BRANDS.flatMap((brand) =>
    MODES.flatMap((mode) =>
      CONTRASTS.map((contrast) => [
        flatScheme(brand, mode, contrast),
        buildScheme(brand, mode, contrast),
      ]),
    ),
  ),
);

// A. Only the flattened schemes exist, no `light` or `dark` keys.
const flatOnlyTheme = createTheme({
  // A distinct prefix keeps the two themes on this page from overwriting each other's `:root` vars.
  cssVariables: { colorSchemeSelector: 'data-flat-color-scheme', cssVarPrefix: 'flat' },
  colorSchemes: flatColorSchemes,
  defaultColorScheme: asScheme(flatScheme(DEFAULT_BRAND, 'light', DEFAULT_CONTRAST)),
});

// B. The same schemes, plus `light` and `dark` aliasing the ones we want as defaults.
const aliasedTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-aliased-color-scheme', cssVarPrefix: 'aliased' },
  colorSchemes: {
    ...flatColorSchemes,
    light: { palette: buildPalette(DEFAULT_BRAND, 'light', DEFAULT_CONTRAST) },
    dark: { palette: buildPalette(DEFAULT_BRAND, 'dark', DEFAULT_CONTRAST) },
  },
  defaultColorScheme: 'light',
});

function StateReadout({ attribute }: { attribute: string }) {
  const { mode, systemMode, lightColorScheme, darkColorScheme, colorScheme, allColorSchemes } =
    useColorScheme();
  // The state only exists on the client, so reading it during hydration would mismatch the server.
  const [mounted, setMounted] = React.useState(false);
  const [domValue, setDomValue] = React.useState<string | null>(null);
  React.useEffect(() => {
    setMounted(true);
    setDomValue(document.documentElement.getAttribute(attribute));
  }, [attribute, colorScheme]);

  const entries: [string, unknown, boolean][] = [
    ['mode', mode, false],
    ['systemMode', systemMode, false],
    ['lightColorScheme', lightColorScheme, true],
    ['darkColorScheme', darkColorScheme, true],
    ['colorScheme', colorScheme, true],
    [`html[${attribute}]`, domValue, true],
  ];
  const rows = entries.map(([key, value, checked]) => ({
    key,
    value: mounted ? String(value) : '…',
    invalid: mounted && checked && !allColorSchemes.includes(value as SupportedColorScheme),
  }));

  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr',
        columnGap: 2,
        rowGap: 0.5,
        fontFamily: 'monospace',
        fontSize: 13,
      }}
    >
      {rows.map((item) => (
        <React.Fragment key={item.key}>
          <Box component="dt" sx={{ opacity: 0.6 }}>
            {item.key}
          </Box>
          <Box component="dd" sx={{ m: 0, color: item.invalid ? 'error.main' : 'inherit' }}>
            {item.value}
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
}

function ModeControl() {
  const { mode, setMode } = useColorScheme();
  return (
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
  );
}

/**
 * The provider seeds its state from `defaultLightColorScheme`/`defaultDarkColorScheme`, which are
 * hardcoded to `light`/`dark` for Material UI and are not reachable through `ThemeProvider`.
 * Remapping both slots is what makes a flattened scheme the default on the React side.
 */
function SchemeMapper({
  brand,
  contrast,
  enabled,
}: {
  brand: Brand;
  contrast: Contrast;
  enabled: boolean;
}) {
  const { setColorScheme } = useColorScheme();
  React.useEffect(() => {
    if (!enabled) {
      setColorScheme(null);
      return;
    }
    setColorScheme({
      light: asScheme(flatScheme(brand, 'light', contrast)),
      dark: asScheme(flatScheme(brand, 'dark', contrast)),
    });
  }, [brand, contrast, enabled, setColorScheme]);
  return null;
}

function Panel({
  title,
  note,
  attribute,
}: {
  title: string;
  note: React.ReactNode;
  attribute: string;
}) {
  return (
    <Paper
      sx={{
        p: 3,
        flex: 1,
        minWidth: 340,
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          {note}
        </Typography>
        <Divider flexItem />
        <ModeControl />
        <StateReadout attribute={attribute} />
        <Paper variant="outlined" sx={{ p: 2, alignSelf: 'stretch' }}>
          <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="subtitle2">Preview</Typography>
            <Button variant="contained">Primary</Button>
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default function DefaultColorSchemeExperiment() {
  const [brand, setBrand] = React.useState<Brand>(DEFAULT_BRAND);
  const [contrast, setContrast] = React.useState<Contrast>(DEFAULT_CONTRAST);
  const [mapped, setMapped] = React.useState(true);

  const isCustomAxis = brand !== DEFAULT_BRAND || contrast !== DEFAULT_CONTRAST;

  return (
    <Box sx={{ p: 4 }}>
      {/* Belongs in `_document`/`layout` in a real app, it runs before React to avoid a flash. */}
      <InitColorSchemeScript
        attribute="data-flat-color-scheme"
        modeStorageKey="flat-mode"
        colorSchemeStorageKey="flat-color-scheme"
        defaultLightColorScheme={flatScheme(DEFAULT_BRAND, 'light', DEFAULT_CONTRAST)}
        defaultDarkColorScheme={flatScheme(DEFAULT_BRAND, 'dark', DEFAULT_CONTRAST)}
      />
      <InitColorSchemeScript
        attribute="data-aliased-color-scheme"
        modeStorageKey="aliased-mode"
        colorSchemeStorageKey="aliased-color-scheme"
      />

      <Stack spacing={2} sx={{ mb: 3, alignItems: 'flex-start' }}>
        <Typography variant="h5">Default color scheme with flattened schemes</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 780 }}>
          Both panels hold the same eight schemes named brand-mode-contrast. They differ only in
          whether <code>light</code> and <code>dark</code> also exist. Red values are keys that are
          not in <code>theme.colorSchemes</code>.
        </Typography>
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={brand}
            onChange={(event, value) => value && setBrand(value)}
          >
            {BRANDS.map((item) => (
              <ToggleButton key={item} value={item}>
                {item}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={contrast}
            onChange={(event, value) => value && setContrast(value)}
          >
            {CONTRASTS.map((item) => (
              <ToggleButton key={item} value={item}>
                {item}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Button size="small" variant="outlined" onClick={() => setMapped((prev) => !prev)}>
            {mapped ? 'Drop panel A mapping' : 'Restore panel A mapping'}
          </Button>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        spacing={3}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
      >
        <ThemeProvider
          theme={flatOnlyTheme}
          disableNestedContext
          defaultMode="system"
          modeStorageKey="flat-mode"
          colorSchemeStorageKey="flat-color-scheme"
        >
          <SchemeMapper brand={brand} contrast={contrast} enabled={mapped} />
          <Panel
            title="A. Flattened schemes only"
            attribute="data-flat-color-scheme"
            note={
              <React.Fragment>
                <code>defaultColorScheme</code> only decides which scheme is written to{' '}
                <code>:root</code>, so the first paint looks right while the React state still
                starts on the built-in <code>light</code>/<code>dark</code> keys. Drop the mapping
                to see them go invalid. <code>defaultMode</code> is ignored too: without{' '}
                <code>light</code> and <code>dark</code> the provider falls back to the default
                scheme&apos;s <code>palette.mode</code>.
              </React.Fragment>
            }
          />
        </ThemeProvider>

        <ThemeProvider
          theme={aliasedTheme}
          disableNestedContext
          defaultMode="system"
          modeStorageKey="aliased-mode"
          colorSchemeStorageKey="aliased-color-scheme"
        >
          <SchemeMapper brand={brand} contrast={contrast} enabled={isCustomAxis} />
          <Panel
            title="B. Flattened schemes plus light/dark aliases"
            attribute="data-aliased-color-scheme"
            note={
              <React.Fragment>
                <code>light</code> and <code>dark</code> alias the schemes we want as defaults, so
                nothing needs remapping on mount, <code>defaultMode=&quot;system&quot;</code> is
                respected, and <code>InitColorSchemeScript</code> needs no extra props. Picking a
                non-default brand or contrast still goes through{' '}
                <code>setColorScheme(&#123; light, dark &#125;)</code>, and returning to the default
                is <code>setColorScheme(null)</code>.
              </React.Fragment>
            }
          />
        </ThemeProvider>
      </Stack>
    </Box>
  );
}
