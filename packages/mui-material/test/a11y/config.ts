/**
 * A11y testing roster for `@mui/material`.
 *
 * Each entry maps a docs page (`docs/data/material/components/{slug}`) to a
 * canonical component name (used as the key in `a11y-results.json`).
 *
 * Rollout state:
 * - `status: 'enabled'` — runs in CI via `test/a11y/a11y.test.mjs`
 * - `status: 'pending'` — reserved; not yet tested, no data in `a11y-results.json`
 *
 * Enroll a component by flipping `'pending'` → `'enabled'` and adding a `demos`
 * list. See AGENTS.md → "Accessibility Testing" for the full workflow.
 */
export interface ComponentA11yConfig {
  /** PascalCase component name. Keys entries in `a11y-results.json`. */
  component: string;
  /** Directory under `docs/data/material/components/`. */
  slug: string;
  /** Rollout state. */
  status: 'enabled' | 'pending';
  /**
   * Demo filenames (no extension) under the slug directory.
   * Required when `status === 'enabled'`. Each entry maps to the VRT route
   * `/docs-components-{slug}/{demo}`.
   */
  demos?: string[];
  /**
   * Axe rule ids whose violations are recorded but not asserted on.
   * Used to track known issues without failing CI.
   */
  skipRules?: string[];
}

export const COMPONENTS: ComponentA11yConfig[] = [
  { component: 'Accordion', slug: 'accordion', status: 'pending' },
  { component: 'Alert', slug: 'alert', status: 'pending' },
  { component: 'AppBar', slug: 'app-bar', status: 'pending' },
  { component: 'Autocomplete', slug: 'autocomplete', status: 'pending' },
  { component: 'Avatar', slug: 'avatars', status: 'pending' },
  { component: 'Backdrop', slug: 'backdrop', status: 'pending' },
  { component: 'Badge', slug: 'badges', status: 'pending' },
  { component: 'BottomNavigation', slug: 'bottom-navigation', status: 'pending' },
  { component: 'Box', slug: 'box', status: 'pending' },
  { component: 'Breadcrumbs', slug: 'breadcrumbs', status: 'pending' },
  {
    component: 'Button',
    slug: 'buttons',
    status: 'enabled',
    demos: ['BasicButtons', 'ColorButtons'],
  },
  { component: 'ButtonGroup', slug: 'button-group', status: 'pending' },
  {
    component: 'Card',
    slug: 'cards',
    status: 'enabled',
    demos: ['BasicCard', 'OutlinedCard'],
  },
  { component: 'Checkbox', slug: 'checkboxes', status: 'pending' },
  { component: 'Chip', slug: 'chips', status: 'pending' },
  { component: 'ClickAwayListener', slug: 'click-away-listener', status: 'pending' },
  { component: 'Container', slug: 'container', status: 'pending' },
  { component: 'CssBaseline', slug: 'css-baseline', status: 'pending' },
  { component: 'Dialog', slug: 'dialogs', status: 'pending' },
  { component: 'Divider', slug: 'dividers', status: 'pending' },
  { component: 'Drawer', slug: 'drawers', status: 'pending' },
  { component: 'Fab', slug: 'floating-action-button', status: 'pending' },
  { component: 'Grid', slug: 'grid', status: 'pending' },
  { component: 'Icon', slug: 'icons', status: 'pending' },
  { component: 'ImageList', slug: 'image-list', status: 'pending' },
  { component: 'Link', slug: 'links', status: 'pending' },
  { component: 'List', slug: 'lists', status: 'pending' },
  { component: 'Masonry', slug: 'masonry', status: 'pending' },
  { component: 'Menubar', slug: 'menubar', status: 'pending' },
  { component: 'Menu', slug: 'menus', status: 'pending' },
  { component: 'Modal', slug: 'modal', status: 'pending' },
  { component: 'NoSsr', slug: 'no-ssr', status: 'pending' },
  { component: 'NumberField', slug: 'number-field', status: 'pending' },
  { component: 'Pagination', slug: 'pagination', status: 'pending' },
  { component: 'Paper', slug: 'paper', status: 'pending' },
  { component: 'Popover', slug: 'popover', status: 'pending' },
  { component: 'Popper', slug: 'popper', status: 'pending' },
  { component: 'Portal', slug: 'portal', status: 'pending' },
  { component: 'Progress', slug: 'progress', status: 'pending' },
  { component: 'Radio', slug: 'radio-buttons', status: 'pending' },
  { component: 'Rating', slug: 'rating', status: 'pending' },
  { component: 'Select', slug: 'selects', status: 'pending' },
  { component: 'Skeleton', slug: 'skeleton', status: 'pending' },
  { component: 'Slider', slug: 'slider', status: 'pending' },
  { component: 'Snackbar', slug: 'snackbars', status: 'pending' },
  { component: 'SpeedDial', slug: 'speed-dial', status: 'pending' },
  { component: 'Stack', slug: 'stack', status: 'pending' },
  { component: 'Stepper', slug: 'steppers', status: 'pending' },
  { component: 'Switch', slug: 'switches', status: 'pending' },
  { component: 'Table', slug: 'table', status: 'pending' },
  { component: 'Tabs', slug: 'tabs', status: 'pending' },
  { component: 'TextField', slug: 'text-fields', status: 'pending' },
  { component: 'TextareaAutosize', slug: 'textarea-autosize', status: 'pending' },
  { component: 'Timeline', slug: 'timeline', status: 'pending' },
  { component: 'ToggleButton', slug: 'toggle-button', status: 'pending' },
  { component: 'Tooltip', slug: 'tooltips', status: 'pending' },
  { component: 'Typography', slug: 'typography', status: 'pending' },
];
