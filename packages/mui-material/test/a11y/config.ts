/**
 * A11y testing roster for `@mui/material`.
 *
 * Each entry maps a docs page (`docs/data/material/components/{slug}`) to a
 * canonical component name (used as the key in the `results/{Component}.json`
 * output file). Components not yet ready to test live as commented `TODO`
 * entries with the blocker noted inline.
 *
 * - `demos` — filenames under the slug directory (no extension). Each maps to
 *   the VRT route `/docs-components-{slug}/{demo}`. Omit to auto-discover
 *   every VRT-exposed demo for this slug (inherits VRT's exclusion list).
 * - `skipAssertions` — axe rule ids whose violations are recorded but not
 *   asserted on. Used to track known issues without failing CI.
 *
 * See AGENTS.md → "Accessibility Testing" for the full workflow.
 */
export interface ComponentA11yConfig {
  /** PascalCase component name. Keys the `results/{Component}.json` output file. */
  component: string;
  /** Directory under `docs/data/material/components/`. */
  slug: string;
  /**
   * Demo filenames (no extension) under the slug directory. Each entry maps to
   * the VRT route `/docs-components-{slug}/{demo}`. When omitted, the test
   * auto-discovers every VRT-exposed demo for this slug from the fixture nav
   * (i.e. inherits VRT's exclusion list).
   */
  demos?: string[];
  /**
   * Axe rule ids whose violations are recorded but not asserted on. The rule
   * still runs; only the test-failing assertion is suppressed. Used to track
   * known issues without failing CI.
   */
  skipAssertions?: string[];
}

// Components whose demos currently trip `color-contrast` (labels/icons near
// the 4.5:1 threshold, or overlapped elements axe can't analyze). Recorded as
// failedRules in the results JSON so the team can see what needs fixing;
// asserting on them would block every CI run.
const PARTIAL_SKIP = ['color-contrast'];

export const COMPONENTS: ComponentA11yConfig[] = [
  { component: 'Accordion', slug: 'accordion', skipAssertions: PARTIAL_SKIP },
  { component: 'Alert', slug: 'alert', skipAssertions: PARTIAL_SKIP },
  { component: 'AppBar', slug: 'app-bar', skipAssertions: PARTIAL_SKIP },
  { component: 'Autocomplete', slug: 'autocomplete', skipAssertions: PARTIAL_SKIP },
  { component: 'Avatar', slug: 'avatars', skipAssertions: PARTIAL_SKIP },
  { component: 'Badge', slug: 'badges' },
  { component: 'BottomNavigation', slug: 'bottom-navigation' },
  { component: 'Breadcrumbs', slug: 'breadcrumbs', skipAssertions: PARTIAL_SKIP },
  { component: 'Button', slug: 'buttons', demos: ['BasicButtons', 'ColorButtons'] },
  { component: 'ButtonGroup', slug: 'button-group' },
  { component: 'Card', slug: 'cards', demos: ['BasicCard', 'OutlinedCard'] },
  { component: 'Checkbox', slug: 'checkboxes', skipAssertions: PARTIAL_SKIP },
  { component: 'Chip', slug: 'chips', skipAssertions: PARTIAL_SKIP },
  // TODO: Dialog — VRT excludes demos (need interaction)
  { component: 'Divider', slug: 'dividers', skipAssertions: PARTIAL_SKIP },
  { component: 'Drawer', slug: 'drawers', skipAssertions: PARTIAL_SKIP },
  { component: 'Fab', slug: 'floating-action-button' },
  { component: 'Icon', slug: 'icons' },
  // TODO: ImageList — VRT excludes demos (images don't load)
  { component: 'Link', slug: 'links' },
  { component: 'List', slug: 'lists', skipAssertions: PARTIAL_SKIP },
  // TODO: Menu — VRT excludes demos (need interaction)
  { component: 'Menubar', slug: 'menubar' },
  { component: 'Modal', slug: 'modal', skipAssertions: PARTIAL_SKIP },
  { component: 'NumberField', slug: 'number-field', skipAssertions: PARTIAL_SKIP },
  { component: 'Pagination', slug: 'pagination', skipAssertions: PARTIAL_SKIP },
  { component: 'Popover', slug: 'popover' },
  // TODO: Popper — VRT excludes demos (need interaction)
  // TODO: Progress — VRT excludes demos (flaky)
  { component: 'Radio', slug: 'radio-buttons', skipAssertions: PARTIAL_SKIP },
  { component: 'Rating', slug: 'rating' },
  { component: 'Select', slug: 'selects', skipAssertions: PARTIAL_SKIP },
  { component: 'Skeleton', slug: 'skeleton' },
  { component: 'Slider', slug: 'slider', skipAssertions: PARTIAL_SKIP },
  { component: 'Snackbar', slug: 'snackbars', skipAssertions: PARTIAL_SKIP },
  // TODO: SpeedDial — VRT excludes demos (need interaction)
  { component: 'Stepper', slug: 'steppers', skipAssertions: PARTIAL_SKIP },
  { component: 'Switch', slug: 'switches', skipAssertions: PARTIAL_SKIP },
  { component: 'Table', slug: 'table', skipAssertions: PARTIAL_SKIP },
  { component: 'Tabs', slug: 'tabs', skipAssertions: PARTIAL_SKIP },
  { component: 'TextField', slug: 'text-fields', skipAssertions: PARTIAL_SKIP },
  // TODO: TextareaAutosize — superseded by dedicated regression test
  { component: 'Timeline', slug: 'timeline' },
  { component: 'ToggleButton', slug: 'toggle-button', skipAssertions: PARTIAL_SKIP },
  // TODO: Tooltip — VRT excludes demos (need interaction)
  { component: 'Typography', slug: 'typography' },
];
