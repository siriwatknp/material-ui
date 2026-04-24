/**
 * Per-demo configuration for VRT tooling.
 *
 * Two exclusion layers:
 *   - Slug-level (whole slug has no consumer) → glob negation in `index.jsx`.
 *     Keeps those demos out of the bundle entirely.
 *   - Per-demo (one demo inside an otherwise-enrolled slug) → this file,
 *     so screenshot-specific reasons ("Redundant", "Flaky image loading")
 *     don't also drop a11y coverage on demos where axe still has value.
 *
 * Replaces the previous a11y-only roster (`a11y/a11yConfig.ts`, removed) and
 * the per-demo negations that used to live inline in the `index.jsx` glob.
 *
 * Keys use the docs path format `docs/data/material/components/{slug}/{DemoName}`
 * — same string shape as the glob negations.
 */

export interface ScreenshotMeta {
  enabled: boolean;
  /** Playwright waits for this selector before snapshotting. */
  waitForSelector?: string;
}

export interface A11yMeta {
  enabled: boolean;
  /** Axe rule IDs recorded into results JSON but not asserted on. */
  skipAssertions?: string[];
}

export interface DemoMeta {
  screenshot?: ScreenshotMeta;
  a11y?: A11yMeta;
}

export interface SlugA11y {
  /** PascalCase key for `results/{Component}.json` grouping. */
  component: string;
  /**
   * If set, only these demo filenames have a11y enabled for this slug.
   * Omit to enroll every VRT-exposed demo under the slug.
   */
  demos?: string[];
  /** Axe rule IDs recorded but not asserted on for this whole slug. */
  skipAssertions?: string[];
}

const PARTIAL_CONTRAST = ['color-contrast'];

/**
 * Slug-level a11y enrollment. Slugs absent here have a11y disabled.
 * Per-demo entries in `DEMO_META` can override with `a11y.enabled: false`
 * (e.g. Redux-isolation demos that can't render standalone).
 */
export const SLUG_A11Y = new Map<string, SlugA11y>([
  ['accordion', { component: 'Accordion', skipAssertions: PARTIAL_CONTRAST }],
  ['alert', { component: 'Alert', skipAssertions: PARTIAL_CONTRAST }],
  ['app-bar', { component: 'AppBar', skipAssertions: PARTIAL_CONTRAST }],
  ['autocomplete', { component: 'Autocomplete', skipAssertions: PARTIAL_CONTRAST }],
  ['avatars', { component: 'Avatar', skipAssertions: PARTIAL_CONTRAST }],
  ['badges', { component: 'Badge' }],
  ['bottom-navigation', { component: 'BottomNavigation' }],
  ['breadcrumbs', { component: 'Breadcrumbs', skipAssertions: PARTIAL_CONTRAST }],
  ['button-group', { component: 'ButtonGroup' }],
  ['buttons', { component: 'Button', demos: ['BasicButtons', 'ColorButtons'] }],
  ['cards', { component: 'Card', demos: ['BasicCard', 'OutlinedCard'] }],
  ['checkboxes', { component: 'Checkbox', skipAssertions: PARTIAL_CONTRAST }],
  ['chips', { component: 'Chip', skipAssertions: PARTIAL_CONTRAST }],
  ['dividers', { component: 'Divider', skipAssertions: PARTIAL_CONTRAST }],
  ['drawers', { component: 'Drawer', skipAssertions: PARTIAL_CONTRAST }],
  ['floating-action-button', { component: 'Fab' }],
  ['icons', { component: 'Icon' }],
  ['links', { component: 'Link' }],
  ['lists', { component: 'List', skipAssertions: PARTIAL_CONTRAST }],
  ['menubar', { component: 'Menubar' }],
  ['modal', { component: 'Modal', skipAssertions: PARTIAL_CONTRAST }],
  ['number-field', { component: 'NumberField', skipAssertions: PARTIAL_CONTRAST }],
  ['pagination', { component: 'Pagination', skipAssertions: PARTIAL_CONTRAST }],
  ['popover', { component: 'Popover' }],
  ['radio-buttons', { component: 'Radio', skipAssertions: PARTIAL_CONTRAST }],
  ['rating', { component: 'Rating' }],
  ['selects', { component: 'Select', skipAssertions: PARTIAL_CONTRAST }],
  ['skeleton', { component: 'Skeleton' }],
  ['slider', { component: 'Slider', skipAssertions: PARTIAL_CONTRAST }],
  ['snackbars', { component: 'Snackbar', skipAssertions: PARTIAL_CONTRAST }],
  ['steppers', { component: 'Stepper', skipAssertions: PARTIAL_CONTRAST }],
  ['switches', { component: 'Switch', skipAssertions: PARTIAL_CONTRAST }],
  ['table', { component: 'Table', skipAssertions: PARTIAL_CONTRAST }],
  ['tabs', { component: 'Tabs', skipAssertions: PARTIAL_CONTRAST }],
  ['text-fields', { component: 'TextField', skipAssertions: PARTIAL_CONTRAST }],
  ['timeline', { component: 'Timeline' }],
  ['toggle-button', { component: 'ToggleButton', skipAssertions: PARTIAL_CONTRAST }],
  ['typography', { component: 'Typography' }],
]);

/**
 * Shorthand: screenshot disabled; a11y falls back to slug defaults.
 * Accepts either a full demo path or a slug path — a slug path applies
 * to every demo in the slug.
 */
function noShot(path: string): [string, DemoMeta] {
  return [path, { screenshot: { enabled: false } }];
}

/** Shorthand: both tools disabled (demo doesn't render). */
function noTools(path: string): [string, DemoMeta] {
  return [path, { screenshot: { enabled: false }, a11y: { enabled: false } }];
}

/**
 * Per-tool overrides. Keys are docs paths:
 *   - `docs/data/material/components/{slug}/{DemoName}` — applies to that demo.
 *   - `docs/data/material/components/{slug}` — applies to every demo in the slug
 *     (demo-level entries take precedence when both exist).
 *
 * Whole-slug exclusions where *no* tool wants anything live in the `index.jsx`
 * glob — dropping them from the bundle entirely, not just from the tools.
 *
 * Trailing comments match the prose used in the old glob so `git grep` on a
 * reason still finds every affected demo.
 */
export const DEMO_META = new Map<string, DemoMeta>([
  noShot('docs/data/material/components/alert/TransitionAlerts'), // Needs interaction
  noShot('docs/data/material/components/app-bar/BackToTop'), // Needs interaction
  noShot('docs/data/material/components/app-bar/ElevateAppBar'), // Needs interaction
  noShot('docs/data/material/components/app-bar/HideAppBar'), // Needs interaction
  noShot('docs/data/material/components/app-bar/MenuAppBar'), // Redundant
  noShot('docs/data/material/components/autocomplete/Asynchronous'), // Redundant
  noShot('docs/data/material/components/autocomplete/CheckboxesTags'), // Redundant
  noShot('docs/data/material/components/autocomplete/CountrySelect'), // Redundant
  noShot('docs/data/material/components/autocomplete/DisabledOptions'), // Redundant
  noShot('docs/data/material/components/autocomplete/Filter'), // Redundant
  noShot('docs/data/material/components/autocomplete/FreeSolo'), // Redundant
  noShot('docs/data/material/components/autocomplete/GoogleMaps'), // Redundant
  noShot('docs/data/material/components/autocomplete/Grouped'), // Redundant
  noShot('docs/data/material/components/autocomplete/Highlights'), // Redundant
  noShot('docs/data/material/components/autocomplete/Playground'), // Redundant
  noShot('docs/data/material/components/autocomplete/UseAutocomplete'), // Redundant
  noShot('docs/data/material/components/autocomplete/Virtualize'), // Redundant
  noTools('docs/data/material/components/badges/BadgeAlignment'), // Redux isolation
  noShot('docs/data/material/components/badges/BadgeVisibility'), // Needs interaction
  noShot('docs/data/material/components/bottom-navigation/FixedBottomNavigation'), // Redundant
  noShot('docs/data/material/components/breadcrumbs/ActiveLastBreadcrumb'), // Redundant
  noTools('docs/data/material/components/chips/ChipsPlayground'), // Redux isolation
  noShot('docs/data/material/components/drawers/SwipeableEdgeDrawer'), // Needs interaction
  noShot('docs/data/material/components/drawers/SwipeableTemporaryDrawer'), // Needs interaction
  noShot('docs/data/material/components/drawers/TemporaryDrawer'), // Needs interaction
  noShot('docs/data/material/components/floating-action-button/FloatingActionButtonZoom'), // Needs interaction
  noShot('docs/data/material/components/masonry/ImageMasonry'), // Images don't load
  noShot('docs/data/material/components/masonry/Sequential'), // Flaky
  noShot('docs/data/material/components/modal/BasicModal'), // Needs interaction
  noShot('docs/data/material/components/modal/KeepMountedModal'), // Needs interaction
  noShot('docs/data/material/components/modal/SpringModal'), // Needs interaction
  noShot('docs/data/material/components/modal/TransitionsModal'), // Needs interaction
  noShot('docs/data/material/components/no-ssr/FrameDeferring'), // Needs interaction
  noTools('docs/data/material/components/popover/AnchorPlayground'), // Redux isolation
  noShot('docs/data/material/components/popover/BasicPopover'), // Needs interaction
  noShot('docs/data/material/components/popover/PopoverPopupState'), // Needs interaction
  noShot('docs/data/material/components/selects/ControlledOpenSelect'), // Needs interaction
  noShot('docs/data/material/components/selects/DialogSelect'), // Needs interaction
  noShot('docs/data/material/components/selects/GroupedSelect'), // Needs interaction
  noShot('docs/data/material/components/skeleton/Animations'), // Animation disabled
  noShot('docs/data/material/components/skeleton/Facebook'), // Flaky image loading
  noShot('docs/data/material/components/skeleton/SkeletonChildren'), // Flaky image loading
  noShot('docs/data/material/components/skeleton/YouTube'), // Flaky image loading
  noShot('docs/data/material/components/snackbars/ConsecutiveSnackbars'), // Needs interaction
  noShot('docs/data/material/components/snackbars/CustomizedSnackbars'), // Redundant
  noShot('docs/data/material/components/snackbars/DirectionSnackbar'), // Needs interaction
  noShot('docs/data/material/components/snackbars/FabIntegrationSnackbar'), // Needs interaction
  noShot('docs/data/material/components/snackbars/IntegrationNotistack'), // Needs interaction
  noShot('docs/data/material/components/snackbars/PositionedSnackbar'), // Needs interaction
  noShot('docs/data/material/components/snackbars/SimpleSnackbar'), // Needs interaction
  noShot('docs/data/material/components/snackbars/TransitionsSnackbar'), // Needs interaction
  noShot('docs/data/material/components/stack/InteractiveStack'), // Redundant
  noShot('docs/data/material/components/steppers/HorizontalNonLinearStepper'), // Redundant
  noShot('docs/data/material/components/steppers/TextMobileStepper'), // Flaky image loading
  noShot('docs/data/material/components/tabs/AccessibleTabs1'), // Needs interaction
  noShot('docs/data/material/components/tabs/AccessibleTabs2'), // Needs interaction
]);

/**
 * Decide whether to run the screenshot tool on a route. Checks the demo-level
 * `DEMO_META` entry first, then falls back to the slug-level entry.
 * Non-component routes (regression fixtures) default to enabled.
 */
export function shouldScreenshot(route: string): boolean {
  const match = route.match(/^\/docs-components-([^/]+)\/(.+)$/);
  if (!match) {
    return true;
  }
  const [, slug, demoName] = match;
  const demoOverride = DEMO_META.get(
    `docs/data/material/components/${slug}/${demoName}`,
  )?.screenshot;
  if (demoOverride) {
    return demoOverride.enabled;
  }
  const slugOverride = DEMO_META.get(`docs/data/material/components/${slug}`)?.screenshot;
  if (slugOverride) {
    return slugOverride.enabled;
  }
  return true;
}

/**
 * Resolve a VRT route to its a11y settings, or `null` if a11y is off / the
 * route isn't a `/material/components/` demo. Combines slug-level enrollment
 * (`SLUG_A11Y`) with per-demo overrides (`DEMO_META`).
 */
export function resolveA11y(route: string): {
  component: string;
  demoName: string;
  skipAssertions?: string[];
} | null {
  const match = route.match(/^\/docs-components-([^/]+)\/(.+)$/);
  if (!match) {
    return null;
  }
  const [, slug, demoName] = match;
  const slugConfig = SLUG_A11Y.get(slug);
  if (!slugConfig) {
    return null;
  }
  if (slugConfig.demos && !slugConfig.demos.includes(demoName)) {
    return null;
  }
  const override = DEMO_META.get(`docs/data/material/components/${slug}/${demoName}`)?.a11y;
  if (override?.enabled === false) {
    return null;
  }
  return {
    component: slugConfig.component,
    demoName,
    skipAssertions: override?.skipAssertions ?? slugConfig.skipAssertions,
  };
}
