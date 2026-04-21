/**
 * A11y testing roster for `@mui/material`.
 *
 * Each entry maps a docs page (`docs/data/material/components/{slug}`) to a
 * canonical component name (used as the key in the `results/{Component}.json`
 * output file).
 *
 * Rollout state:
 * - `status: 'enabled'` — runs in CI via `test/a11y/a11y.test.mjs`.
 * - `status: 'pending'` — reserved; not yet tested. Use for slugs with no
 *   VRT-exposed demos (need interaction, portal-only, etc.).
 *
 * Enroll a component by flipping `'pending'` → `'enabled'`. If `demos` is
 * omitted, the test auto-discovers every VRT-exposed demo for this slug.
 * Explicit `demos` narrows that set. `skipRules` records known violations
 * without failing CI — use it to track issues that need follow-up.
 *
 * See AGENTS.md → "Accessibility Testing" for the full workflow.
 */
export interface ComponentA11yConfig {
  /** PascalCase component name. Keys the `results/{Component}.json` output file. */
  component: string;
  /** Directory under `docs/data/material/components/`. */
  slug: string;
  /** Rollout state. */
  status: 'enabled' | 'pending';
  /**
   * Demo filenames (no extension) under the slug directory. Each entry maps to
   * the VRT route `/docs-components-{slug}/{demo}`. When omitted, the test
   * auto-discovers every VRT-exposed demo for this slug from the fixture nav
   * (i.e. inherits VRT's exclusion list).
   */
  demos?: string[];
  /**
   * Axe rule ids whose violations are recorded but not asserted on.
   * Used to track known issues without failing CI.
   */
  skipRules?: string[];
}

// Components whose demos currently trip `color-contrast` (labels/icons near
// the 4.5:1 threshold, or overlapped elements axe can't analyze). Recorded as
// failedRules in the results JSON so the team can see what needs fixing;
// asserting on them would block every CI run.
const PARTIAL_SKIP = ['color-contrast'];

export const COMPONENTS: ComponentA11yConfig[] = [
  { component: 'Accordion', slug: 'accordion', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Alert', slug: 'alert', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'AppBar', slug: 'app-bar', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Autocomplete', slug: 'autocomplete', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Avatar', slug: 'avatars', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Backdrop', slug: 'backdrop', status: 'pending' }, // VRT: needs interaction
  { component: 'Badge', slug: 'badges', status: 'enabled' },
  { component: 'BottomNavigation', slug: 'bottom-navigation', status: 'enabled' },
  { component: 'Box', slug: 'box', status: 'enabled' },
  { component: 'Breadcrumbs', slug: 'breadcrumbs', status: 'enabled', skipRules: PARTIAL_SKIP },
  {
    component: 'Button',
    slug: 'buttons',
    status: 'enabled',
    demos: ['BasicButtons', 'ColorButtons'],
  },
  { component: 'ButtonGroup', slug: 'button-group', status: 'enabled' },
  {
    component: 'Card',
    slug: 'cards',
    status: 'enabled',
    demos: ['BasicCard', 'OutlinedCard'],
  },
  { component: 'Checkbox', slug: 'checkboxes', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Chip', slug: 'chips', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'ClickAwayListener', slug: 'click-away-listener', status: 'pending' }, // VRT: needs interaction
  { component: 'Container', slug: 'container', status: 'pending' }, // VRT: can't see the impact
  { component: 'CssBaseline', slug: 'css-baseline', status: 'pending' }, // no demos
  { component: 'Dialog', slug: 'dialogs', status: 'pending' }, // VRT: needs interaction
  { component: 'Divider', slug: 'dividers', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Drawer', slug: 'drawers', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Fab', slug: 'floating-action-button', status: 'enabled' },
  { component: 'Grid', slug: 'grid', status: 'enabled' },
  { component: 'Icon', slug: 'icons', status: 'enabled' },
  { component: 'ImageList', slug: 'image-list', status: 'pending' }, // VRT: images don't load
  { component: 'Link', slug: 'links', status: 'enabled' },
  { component: 'List', slug: 'lists', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Masonry', slug: 'masonry', status: 'enabled' },
  { component: 'Menu', slug: 'menus', status: 'pending' }, // VRT: needs interaction
  { component: 'Menubar', slug: 'menubar', status: 'enabled' },
  { component: 'Modal', slug: 'modal', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'NoSsr', slug: 'no-ssr', status: 'enabled' },
  { component: 'NumberField', slug: 'number-field', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Pagination', slug: 'pagination', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Paper', slug: 'paper', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Popover', slug: 'popover', status: 'enabled' },
  { component: 'Popper', slug: 'popper', status: 'pending' }, // VRT: needs interaction
  { component: 'Portal', slug: 'portal', status: 'enabled' },
  { component: 'Progress', slug: 'progress', status: 'pending' }, // VRT: flaky
  { component: 'Radio', slug: 'radio-buttons', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Rating', slug: 'rating', status: 'enabled' },
  { component: 'Select', slug: 'selects', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Skeleton', slug: 'skeleton', status: 'enabled' },
  { component: 'Slider', slug: 'slider', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Snackbar', slug: 'snackbars', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'SpeedDial', slug: 'speed-dial', status: 'pending' }, // VRT: needs interaction
  { component: 'Stack', slug: 'stack', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Stepper', slug: 'steppers', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Switch', slug: 'switches', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Table', slug: 'table', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Tabs', slug: 'tabs', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'TextField', slug: 'text-fields', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'TextareaAutosize', slug: 'textarea-autosize', status: 'pending' }, // superseded by regression
  { component: 'Timeline', slug: 'timeline', status: 'enabled' },
  { component: 'ToggleButton', slug: 'toggle-button', status: 'enabled', skipRules: PARTIAL_SKIP },
  { component: 'Tooltip', slug: 'tooltips', status: 'pending' }, // VRT: needs interaction
  { component: 'Typography', slug: 'typography', status: 'enabled' },
];
