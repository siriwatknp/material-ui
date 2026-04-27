/**
 * Per-tool VRT configuration as two independent rule arrays — one for
 * screenshots, one for axe — so editing one tool can never stomp on the
 * other. Each list is evaluated last-match-wins, merging fields from every
 * matching rule, against the docs path
 * `docs/data/material/components/{slug}/{Demo}`.
 *
 * Whole-slug exclusions where *no* tool wants anything live in the
 * `index.jsx` glob — dropping them from the bundle entirely, not just from
 * the tools.
 */

import { minimatch } from 'minimatch';

export interface ScreenshotRule {
  /** Minimatch glob against `docs/data/material/components/{slug}/{Demo}`. */
  test: string;
  enabled?: boolean;
  /** Playwright waits for this selector before snapshotting. */
  waitForSelector?: string;
}

export interface A11yRule {
  /** Minimatch glob against `docs/data/material/components/{slug}/{Demo}`. */
  test: string;
  enabled?: boolean;
  /** Axe rule IDs recorded into results JSON but not asserted on. */
  skipAssertions?: string[];
}

/**
 * Screenshots default to enabled. Add a rule with `enabled: false` to opt out.
 * Trailing comments preserve the prose used in the old glob so `git grep` on a
 * reason still finds every affected demo.
 */
export const SCREENSHOT_RULES: ScreenshotRule[] = [
  { test: 'docs/data/material/components/alert/TransitionAlerts', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/app-bar/BackToTop', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/app-bar/ElevateAppBar', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/app-bar/HideAppBar', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/app-bar/MenuAppBar', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/Asynchronous', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/CheckboxesTags', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/CountrySelect', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/DisabledOptions', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/Filter', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/FreeSolo', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/GoogleMaps', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/Grouped', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/Highlights', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/Playground', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/UseAutocomplete', enabled: false }, // Redundant
  { test: 'docs/data/material/components/autocomplete/Virtualize', enabled: false }, // Redundant
  { test: 'docs/data/material/components/badges/BadgeAlignment', enabled: false }, // Redux isolation
  { test: 'docs/data/material/components/badges/BadgeVisibility', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/bottom-navigation/FixedBottomNavigation', enabled: false }, // Redundant
  { test: 'docs/data/material/components/breadcrumbs/ActiveLastBreadcrumb', enabled: false }, // Redundant
  { test: 'docs/data/material/components/chips/ChipsPlayground', enabled: false }, // Redux isolation
  { test: 'docs/data/material/components/drawers/SwipeableEdgeDrawer', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/drawers/SwipeableTemporaryDrawer', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/drawers/TemporaryDrawer', enabled: false }, // Needs interaction
  {
    test: 'docs/data/material/components/floating-action-button/FloatingActionButtonZoom',
    enabled: false,
  }, // Needs interaction
  { test: 'docs/data/material/components/masonry/ImageMasonry', enabled: false }, // Images don't load
  { test: 'docs/data/material/components/masonry/Sequential', enabled: false }, // Flaky
  { test: 'docs/data/material/components/modal/BasicModal', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/modal/KeepMountedModal', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/modal/SpringModal', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/modal/TransitionsModal', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/no-ssr/FrameDeferring', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/popover/AnchorPlayground', enabled: false }, // Redux isolation
  { test: 'docs/data/material/components/popover/BasicPopover', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/popover/PopoverPopupState', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/selects/ControlledOpenSelect', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/selects/DialogSelect', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/selects/GroupedSelect', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/skeleton/Animations', enabled: false }, // Animation disabled
  { test: 'docs/data/material/components/skeleton/Facebook', enabled: false }, // Flaky image loading
  { test: 'docs/data/material/components/skeleton/SkeletonChildren', enabled: false }, // Flaky image loading
  { test: 'docs/data/material/components/skeleton/YouTube', enabled: false }, // Flaky image loading
  { test: 'docs/data/material/components/snackbars/ConsecutiveSnackbars', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/snackbars/CustomizedSnackbars', enabled: false }, // Redundant
  { test: 'docs/data/material/components/snackbars/DirectionSnackbar', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/snackbars/FabIntegrationSnackbar', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/snackbars/IntegrationNotistack', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/snackbars/PositionedSnackbar', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/snackbars/SimpleSnackbar', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/snackbars/TransitionsSnackbar', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/stack/InteractiveStack', enabled: false }, // Redundant
  { test: 'docs/data/material/components/steppers/HorizontalNonLinearStepper', enabled: false }, // Redundant
  { test: 'docs/data/material/components/steppers/TextMobileStepper', enabled: false }, // Flaky image loading
  { test: 'docs/data/material/components/tabs/AccessibleTabs1', enabled: false }, // Needs interaction
  { test: 'docs/data/material/components/tabs/AccessibleTabs2', enabled: false }, // Needs interaction
];

/**
 * A11y defaults to off — only matched-and-enabled rules produce results.
 * Slug-wide rules use `*`; brace-globs narrow enrolment to specific demos;
 * later opt-out rules disable individual demos.
 */
export const A11Y_RULES: A11yRule[] = [
  {
    test: 'docs/data/material/components/accordion/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/alert/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/app-bar/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/autocomplete/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/avatars/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  { test: 'docs/data/material/components/badges/*', enabled: true },
  {
    test: 'docs/data/material/components/bottom-navigation/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/breadcrumbs/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  { test: 'docs/data/material/components/button-group/*', enabled: true },
  { test: 'docs/data/material/components/buttons/{BasicButtons,ColorButtons}', enabled: true },
  { test: 'docs/data/material/components/cards/{BasicCard,OutlinedCard}', enabled: true },
  {
    test: 'docs/data/material/components/checkboxes/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/chips/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/dividers/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/drawers/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/floating-action-button/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  { test: 'docs/data/material/components/icons/*', enabled: true },
  { test: 'docs/data/material/components/links/*', enabled: true },
  {
    test: 'docs/data/material/components/lists/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  { test: 'docs/data/material/components/menubar/*', enabled: true },
  {
    test: 'docs/data/material/components/modal/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/number-field/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/pagination/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  { test: 'docs/data/material/components/popover/*', enabled: true },
  {
    test: 'docs/data/material/components/radio-buttons/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  { test: 'docs/data/material/components/rating/*', enabled: true },
  {
    test: 'docs/data/material/components/selects/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/skeleton/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/slider/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/snackbars/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/steppers/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/switches/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/table/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/tabs/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  {
    test: 'docs/data/material/components/text-fields/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  { test: 'docs/data/material/components/timeline/*', enabled: true },
  {
    test: 'docs/data/material/components/toggle-button/*',
    enabled: true,
    skipAssertions: ['color-contrast'],
  },
  { test: 'docs/data/material/components/typography/*', enabled: true },
  // Per-demo opt-outs inside otherwise-enrolled slugs (must come after the slug-wide rule).
  { test: 'docs/data/material/components/badges/BadgeAlignment', enabled: false }, // Redux isolation
  { test: 'docs/data/material/components/chips/ChipsPlayground', enabled: false }, // Redux isolation
  { test: 'docs/data/material/components/popover/AnchorPlayground', enabled: false }, // Redux isolation
];

/**
 * Walk a rule list, merging fields from every matching rule (last write wins
 * per field). Returns the merged config minus the `test` key.
 */
function getConfig<T extends { test: string }>(
  rules: ReadonlyArray<T>,
  pathStr: string,
): Partial<Omit<T, 'test'>> {
  const merged: Record<string, unknown> = {};
  for (const rule of rules) {
    if (minimatch(pathStr, rule.test)) {
      for (const [key, value] of Object.entries(rule)) {
        if (key !== 'test' && value !== undefined) {
          merged[key] = value;
        }
      }
    }
  }
  return merged as Partial<Omit<T, 'test'>>;
}

const ROUTE_RE = /^\/docs-components-([^/]+)\/(.+)$/;

function parseRoute(route: string): { path: string; slug: string; demo: string } | null {
  const match = route.match(ROUTE_RE);
  if (!match) {
    return null;
  }
  const [, slug, demo] = match;
  return { path: `docs/data/material/components/${slug}/${demo}`, slug, demo };
}

/**
 * Decide whether to run the screenshot tool on a route. Non-component routes
 * (regression fixtures) default to enabled.
 */
export function shouldScreenshot(route: string): boolean {
  const parsed = parseRoute(route);
  if (!parsed) {
    return true;
  }
  const config = getConfig(SCREENSHOT_RULES, parsed.path);
  return config.enabled ?? true;
}

/**
 * Resolve a VRT route to its a11y settings, or `null` if the route isn't a
 * component demo, isn't enrolled, or has been opted out.
 */
export function resolveA11y(route: string): {
  slug: string;
  demoName: string;
  skipAssertions?: string[];
} | null {
  const parsed = parseRoute(route);
  if (!parsed) {
    return null;
  }
  const config = getConfig(A11Y_RULES, parsed.path);
  if (config.enabled !== true) {
    return null;
  }
  return {
    slug: parsed.slug,
    demoName: parsed.demo,
    skipAssertions: config.skipAssertions,
  };
}
