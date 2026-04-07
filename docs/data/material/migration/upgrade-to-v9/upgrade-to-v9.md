# Upgrade to v9

<p class="description">This guide explains how to upgrade from Material UI v7 to v9.</p>

## Start using the alpha release

In the `package.json` file, change the package version from `latest` to `next`.

```diff title="package.json"
-"@mui/material": "latest",
+"@mui/material": "next",
```

Using `next` ensures your project always uses the latest v9 pre-releases.
Alternatively, you can also target and fix it to a specific version, for example, `9.0.0-alpha.0`.

## Supported browsers and versions

The default bundle targets have changed in v9.

<!-- #stable-snapshot -->

- Chrome 117 (up from 109)
- Edge 121
- Firefox 121 (up from 115)
- Safari 17.0 in both macOS and iOS (up from 15.4)
- and more (see [.browserslistrc `stable` entry](https://github.com/mui/material-ui/blob/master/.browserslistrc#L9))

## Breaking changes

Since v9 is a new major release, it contains some changes that affect the public API.
The steps you need to take to migrate from Material UI v7 to v9 are described below.

:::info
This list is a work in progress.
Expect updates as new breaking changes are introduced.
:::

### Autocomplete

#### Listbox toggle on right click

The listbox does not toggle anymore when using right click on the input. The left click toggle behavior remains unchanged.

#### freeSolo type related changes

When the `freeSolo` prop is passed as `true`, the `getOptionLabel` and `isOptionEqualToValue` props
accept `string` as well for their `option` and, respectively, `value` arguments:

```diff
- isOptionEqualToValue?: (option: Value, value: Value) => boolean;
+ isOptionEqualToValue?: (
+  option: Value,
+  value: AutocompleteValueOrFreeSoloValueMapping<Value, FreeSolo>,
+ ) => boolean;
```

```diff
- getOptionLabel?: (option: Value | AutocompleteFreeSoloValueMapping<FreeSolo>) => string;
+ getOptionLabel?: (option: AutocompleteValueOrFreeSoloValueMapping<Value, FreeSolo>) => string;
```

For reference:

```ts
type AutocompleteFreeSoloValueMapping<FreeSolo> = FreeSolo extends true
  ? string
  : never;

type AutocompleteValueOrFreeSoloValueMapping<Value, FreeSolo> = FreeSolo extends true
  ? Value | string
  : Value;
```

### Backdrop

The Backdrop component no longer adds the `aria-hidden="true"` attribute to the Root slot by default.

### ButtonBase

#### Click event propagation from Enter and Spacebar

When sending Enter and Spacebar keys on the ButtonBase or components that are composed from ButtonBase,
the click event now bubbles to their ancestors.

Also, the `event` passed to the `onClick` prop is a `MouseEvent` instead of the `KeyboardEvent` captured
in the ButtonBase keyboard handlers. This is actually the expected behavior.

#### Event handlers on disabled non-native buttons

When ButtonBase renders a non-native element like a `<span>`, keyboard and click event handlers will no longer run when the component is disabled.

#### Replacing native button elements with non-interactive elements

The `nativeButton` prop is available on `<ButtonBase>` and all button-like components to ensure that they are rendered with the correct HTML attributes before hydration, for example during server-side rendering.

This should be specified when passing a React component to the `component` prop of a button-like component that either replaces the default rendered element:

- From a native `<button>` to a non-interactive element like a `<div>`, or
- From a non-button like a `<div>` to a native `<button>`

```jsx
const CustomButton = React.forwardRef(function CustomButton(props, ref) {
  return <div ref={ref} {...props} />;
})

<Button component={CustomButton} nativeButton={false}>
  OK
</Button>
```

A warning will be shown in development mode if the `nativeButton` prop is incorrectly omitted, or if the resolved element
does not match the value of the prop.

The prop can be used for: `<ButtonBase>`, `<Button>`, `<Fab>`, `<IconButton>`, `<ListItemButton>`, `<MenuItem>`, `<StepButton>`, `<Tab>`, `<ToggleButton>`, `<AccordionSummary>`, `<BottomNavigationAction>`, `<CardActionArea>`, `<TableSortLabel>` and `<PaginationItem>`.

### Dialog & Modal

The `disableEscapeKeyDown` prop has been removed. The same behavior could be achieved
by checking the value of the `reason` argument in `onClose`:

```diff
  const [open, setOpen] = React.useState(true);
- const handleClose = () => {
-   setOpen(false);
- };
+ const handleClose = (_event: React.SyntheticEvent<unknown>, reason: string) => {
+   if (reason !== 'escapeKeyDown') {
+     setOpen(false);
+   }
+ };
  return (
-  <Dialog open={open} disableEscapeKeyDown onClose={handleClose}>
+  <Dialog open={open} onClose={handleClose}>
    {/* ... */}
  </Dialog>
  );
```

The `Modal` change is the same.

### GridLegacy

The `GridLegacy` component is **removed**, use the `Grid` component instead.

The main API differences are:

- The `item` prop is no longer needed.
- The `xs`, `sm`, `md`, `lg`, `xl` props are replaced by the `size` prop.

```diff
-import Grid from '@mui/material/GridLegacy';
+import Grid from '@mui/material/Grid';

 <Grid container spacing={2}>
-  <Grid item xs={12} sm={6}>
+  <Grid size={{ xs: 12, sm: 6 }}>
     ...
   </Grid>
 </Grid>
```

See the [Grid v2 migration guide](/material-ui/migration/upgrade-to-grid-v2/) for more details.

`MuiGridLegacy` has also been removed from the theme `components` types (`ComponentsProps`, `ComponentsOverrides`, and `ComponentsVariants`).

### List

`ListItemIcon` default min-width changes to `36px` (was `56px`) to be consistent with the menu item and uses `theme.spacing` instead of a hardcoded number.

### Material Icons

23 legacy icon exports that ended with `Outline` (without the "d") have been removed.
These were exact duplicates of their `Outlined` counterparts (for example, `InfoOutline` had the same SVG as `InfoOutlined`).

To migrate, rename the import to use the `Outlined` suffix:

```diff
-import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
+import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
```

The full list of removed exports: `AddCircleOutline`, `ChatBubbleOutline`, `CheckCircleOutline`, `DeleteOutline`, `DoneOutline`, `DriveFileMoveOutline`, `ErrorOutline`, `HelpOutline`, `InfoOutline`, `LabelImportantOutline`, `LightbulbOutline`, `LockOutline`, `MailOutline`, `ModeEditOutline`, `PauseCircleOutline`, `PeopleOutline`, `PersonOutline`, `PieChartOutline`, `PlayCircleOutline`, `RemoveCircleOutline`, `StarOutline`, `WorkOutline`, `WorkspacesOutline`.

Theme variants of these icons (for example, `InfoOutlineRounded`, `DeleteOutlineSharp`) are **not** affected and remain available.

### Menu and MenuList

When using `variant="selectedMenu"`, the `tabindex` attribute for each menu item will change on Arrow Key, Home / End or Character Key navigation. Previously, keyboard navigation moved DOM focus without updating `tabindex` on focused items. Now, we move DOM focus and also add `tabindex="0"` to the focused element. The previously focused element will have its `tabindex` updated to `-1` in order to keep only one focusable `MenuItem` at a time.

This change also applies both `Menu` and `MenuList` with `variant="selectedMenu"`.

The `autoFocus` prop in `MenuList` does not set `tabindex="0"` on the `List` component anymore. It will always stay as `-1`.

`MenuItem`s will throw an error when rendered outside of `Menu` or `MenuList`.

Keyboard navigation now supports `MenuItem`s inside `React.Fragment`.

Custom non-interactive menu content such as `ListSubheader` or `Divider` no longer need to set `muiSkipListHighlight` to opt-out of the menu's focus management.

Custom children that set `role="menuitem"` but do not wrap the `MenuItem` component are no longer supported inside `Menu` or `MenuList`.

### Slider

The `Slider` component uses pointer events instead of mouse events. Previously `onMouseDown={(event) => event.preventDefault()}` will cancel a drag from starting, now `onPointerDown` must be used instead.

### Stepper, Step and StepButton

The `Stepper` and `Step` markups have changed to improve their semantics:

- `Stepper` returns a `<ol>` element instead of `<div>`.
- `Step` returns a `<li>` element instead of `<div>`.

The `Stepper` component now supports keyboard navigation when used with `StepButton` descendants. The navigation is implemented as a roving tabindex, supporting Arrow Keys as well as Home and End. Only one `StepButton` is focusable at a time, by having `tabindex="0"`, while the rest all have `tabindex="-1"`. Once selection is changed by Arrow Keys or Home / End, the `tabindex` value is also updated.

The markup for a `Stepper` with `StepButton` descendants has changed further to reflect this behavior. These changes apply on top of the tag changes described above.

The `Stepper` has:

- The `role` of `tablist`.
- The `aria-orientation` added. The value is either `horizontal` or `vertical` depending on the `orientation` prop.

The `StepButton` has:

- The `role` of `tab`.
- The `aria-current` changed to `aria-selected`. The value is `true` when step is selected, and `false` otherwise.
- The `aria-setsize` added. The value is the total number of steps.
- The `aria-posinset` added. The value is the index of the step inside the list, 1-based.

### TablePagination numbers are formatted by default

Pagination numbers in `TablePagination` are now formatted using `Intl.NumberFormat` according to the locale.
For example, `103177` is displayed as `103,177` in `en-US` or `103.177` in `de-DE`.

To opt out of number formatting, provide a custom `labelDisplayedRows` function:

```jsx
<TablePagination
  labelDisplayedRows={({ from, to, count }) =>
    `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
  }
/>
```

Or when using a locale:

```jsx
import { enUS } from '@mui/material/locale';

const theme = createTheme(
  {
    palette: {
      primary: { main: '#1976d2' },
    },
  },
  enUS,
  {
    components: {
      MuiTablePagination: {
        defaultProps: {
          labelDisplayedRows: ({ from, to, count }) =>
            `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`,
        },
      },
    },
  },
);
```

### Tabs

The `tabindex` attribute for each tab will be changed on Arrow Key or Home / End navigation. Previously, keyboard navigation moved DOM focus without updating `tabindex` on the focused `Tab`. Now, we move DOM focus and also add the `tabindex="0"` to the focused `Tab`. Other tabs will have `tabindex="-1"` to keep only one focusable `Tab` at a time.

Selecting a `Tab` will update the focus and `tabindex` as before.

`Tab`s not placed inside `Tabs` will now throw an error.

### TextField

When specifying `<TextField select />` to render a `<Select>`, the underlying `<InputLabel>` renders a `<div>` instead of a native `<label>` element. This does not affect `<InputLabel>` on its own.

### Theme

`MuiTouchRipple` has been removed from the theme `components` types (`ComponentsProps`, `ComponentsOverrides`, and `ComponentsVariants`).
TouchRipple has been an internal component since v5 and never consumed theme overrides or default props, so the types were misleading.

If you were using `MuiTouchRipple` in your theme, remove it and use global CSS with the `MuiTouchRipple-*` class names instead:

```diff
 const theme = createTheme({
   components: {
-    MuiTouchRipple: {
-      styleOverrides: {
-        root: { color: 'red' },
-      },
-    },
+    MuiButtonBase: {
+      styleOverrides: {
+        root: {
+          '& .MuiTouchRipple-root': { color: 'red' },
+        },
+      },
+    },
   },
 });
```

### jsdom support

The behavior of the components in test environments has been improved to be more reliable.
The use of `process.env.NODE_ENV === 'test'` was replaced with feature detection or user-agent sniffing wherever it's more accurate with the intention of the code.
This change shouldn't impact most users, but it might lead to unintended CI changes.
For example, the code has been updated to auto-detect DOM environments that don't support layout, such as [jsdom](https://github.com/jsdom/jsdom) and [happy-dom](https://github.com/capricorn86/happy-dom), with user-agent sniffing.

## Deprecated APIs removed (Breaking)

APIs that were deprecated earlier have been removed in v9.

### Accordion props

Use the [accordion-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#accordion-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/accordion-props <path>
```

The following deprecated props have been removed from the `Accordion` component:

- `TransitionComponent` → use `slots.transition`
- `TransitionProps` → use `slotProps.transition`

```diff
 <Accordion
-  TransitionComponent={CustomTransition}
-  TransitionProps={{ unmountOnExit: true }}
+  slots={{ transition: CustomTransition }}
+  slotProps={{ transition: { unmountOnExit: true } }}
 >
```

### AccordionSummary CSS classes

Use the [accordion-summary-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#accordion-summary-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/accordion-summary-classes <path>
```

The deprecated `AccordionSummary` CSS class `contentGutters` has been removed.
Use the combination of `.MuiAccordionSummary-gutters` and `.MuiAccordionSummary-content` classes instead:

```diff
-.MuiAccordionSummary-contentGutters {
+.MuiAccordionSummary-gutters .MuiAccordionSummary-content {
   margin: 20px 0;
 }
```

### Alert CSS classes

Use the [alert-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#alert-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/alert-classes <path>
```

The following deprecated `Alert` CSS classes have been removed:

- `standardSuccess` → use `.MuiAlert-standard.MuiAlert-colorSuccess`
- `standardInfo` → use `.MuiAlert-standard.MuiAlert-colorInfo`
- `standardWarning` → use `.MuiAlert-standard.MuiAlert-colorWarning`
- `standardError` → use `.MuiAlert-standard.MuiAlert-colorError`
- `outlinedSuccess` → use `.MuiAlert-outlined.MuiAlert-colorSuccess`
- `outlinedInfo` → use `.MuiAlert-outlined.MuiAlert-colorInfo`
- `outlinedWarning` → use `.MuiAlert-outlined.MuiAlert-colorWarning`
- `outlinedError` → use `.MuiAlert-outlined.MuiAlert-colorError`
- `filledSuccess` → use `.MuiAlert-filled.MuiAlert-colorSuccess`
- `filledInfo` → use `.MuiAlert-filled.MuiAlert-colorInfo`
- `filledWarning` → use `.MuiAlert-filled.MuiAlert-colorWarning`
- `filledError` → use `.MuiAlert-filled.MuiAlert-colorError`

If you were using these deprecated class names as `styleOverrides` keys in your theme, use the `variants` array in the `root` override instead:

```diff
 const theme = createTheme({
   components: {
     MuiAlert: {
       styleOverrides: {
-        standardSuccess: { color: 'green' },
-        standardInfo: { color: 'blue' },
-        standardWarning: { color: 'orange' },
-        standardError: { color: 'red' },
-        outlinedSuccess: { borderColor: 'green' },
-        outlinedInfo: { borderColor: 'blue' },
-        outlinedWarning: { borderColor: 'orange' },
-        outlinedError: { borderColor: 'red' },
-        filledSuccess: { backgroundColor: 'green' },
-        filledInfo: { backgroundColor: 'blue' },
-        filledWarning: { backgroundColor: 'orange' },
-        filledError: { backgroundColor: 'red' },
+        root: {
+          variants: [
+            { props: { variant: 'standard', color: 'success' }, style: { color: 'green' } },
+            { props: { variant: 'standard', color: 'info' }, style: { color: 'blue' } },
+            { props: { variant: 'standard', color: 'warning' }, style: { color: 'orange' } },
+            { props: { variant: 'standard', color: 'error' }, style: { color: 'red' } },
+            { props: { variant: 'outlined', color: 'success' }, style: { borderColor: 'green' } },
+            { props: { variant: 'outlined', color: 'info' }, style: { borderColor: 'blue' } },
+            { props: { variant: 'outlined', color: 'warning' }, style: { borderColor: 'orange' } },
+            { props: { variant: 'outlined', color: 'error' }, style: { borderColor: 'red' } },
+            { props: { variant: 'filled', color: 'success' }, style: { backgroundColor: 'green' } },
+            { props: { variant: 'filled', color: 'info' }, style: { backgroundColor: 'blue' } },
+            { props: { variant: 'filled', color: 'warning' }, style: { backgroundColor: 'orange' } },
+            { props: { variant: 'filled', color: 'error' }, style: { backgroundColor: 'red' } },
+          ],
+        },
       },
     },
   },
 });
```

### Alert props

Use the [alert-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#alert-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/alert-props <path>
```

The following deprecated props have been removed from the `Alert` component:

- `components` → use `slots`
- `componentsProps` → use `slotProps`

```diff
 <Alert
   onClose={handleClose}
-  components={{ CloseIcon: MyCloseIcon, CloseButton: MyCloseButton }}
-  componentsProps={{ closeButton: { size: 'large' }, closeIcon: { fontSize: 'small' } }}
+  slots={{ closeIcon: MyCloseIcon, closeButton: MyCloseButton }}
+  slotProps={{ closeButton: { size: 'large' }, closeIcon: { fontSize: 'small' } }}
 />
```

### Avatar props

Use the [avatar-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#avatar-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/avatar-props <path>
```

The following deprecated props have been removed from the `Avatar` component:

- `imgProps` → use `slotProps.img`

```diff
-<Avatar imgProps={{ crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' }} />
+<Avatar slotProps={{ img: { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' } }} />
```

### AvatarGroup props

Use the [avatar-group-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#avatar-group-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/avatar-group-props <path>
```

The following deprecated props have been removed from the `AvatarGroup` component:

- `componentsProps` → use `slotProps` (the `additionalAvatar` key has been renamed to `surplus`)

```diff
-<AvatarGroup componentsProps={{ additionalAvatar: { className: 'my-class' } }}>
+<AvatarGroup slotProps={{ surplus: { className: 'my-class' } }}>
```

If you were already using the `surplus` key via `componentsProps`, move it to `slotProps`:

```diff
-<AvatarGroup componentsProps={{ surplus: { className: 'my-class' } }}>
+<AvatarGroup slotProps={{ surplus: { className: 'my-class' } }}>
```

### Autocomplete props

Use the [autocomplete-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#autocomplete-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/autocomplete-props <path>
```

The following deprecated props have been removed from the `Autocomplete` component:

- `ChipProps` → use `slotProps.chip`
- `componentsProps` → use `slotProps`
- `ListboxComponent` → use `slots.listbox`
- `ListboxProps` → use `slotProps.listbox`
- `PaperComponent` → use `slots.paper`
- `PopperComponent` → use `slots.popper`
- `renderTags` → use `renderValue`

```diff
 <Autocomplete
   multiple
   options={options}
   renderInput={(params) => <TextField {...params} />}
-  ChipProps={{ size: 'small' }}
-  componentsProps={{
-    clearIndicator: { size: 'large' },
-    paper: { elevation: 2 },
-    popper: { placement: 'bottom-end' },
-    popupIndicator: { size: 'large' },
-  }}
-  ListboxComponent={CustomListbox}
-  ListboxProps={{ style: { maxHeight: 200 }, ref }}
-  PaperComponent={CustomPaper}
-  PopperComponent={(props) => {
-    const { disablePortal, anchorEl, open, ...other } = props;
-    return <Box {...other} />;
-  }}
-  renderTags={(value, getTagProps, ownerState) =>
-    value.map((option, index) => (
-      <Chip label={option.label} {...getTagProps({ index })} />
-    ))
-  }
+  slots={{
+    listbox: CustomListbox,
+    paper: CustomPaper,
+    popper: (props) => {
+      const { disablePortal, anchorEl, open, ...other } = props;
+      return <Box {...other} />;
+    },
+  }}
+  slotProps={{
+    chip: { size: 'small' },
+    clearIndicator: { size: 'large' },
+    listbox: { style: { maxHeight: 200 }, ref },
+    paper: { elevation: 2 },
+    popper: { placement: 'bottom-end' },
+    popupIndicator: { size: 'large' },
+  }}
+  renderValue={(value, getItemProps, ownerState) =>
+    value.map((option, index) => (
+      <Chip label={option.label} {...getItemProps({ index })} />
+    ))
+  }
 />
```

---

### useAutocomplete fields

Use the [autocomplete-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#autocomplete-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/autocomplete-props <path>
```

The following deprecated members have been removed from the `useAutocomplete` hook return value:

- `getTagProps` → use `getItemProps`
- `focusedTag` → use `focusedItem`

#### getTagProps

```diff
 const {
-  getTagProps,
+  getItemProps,
 } = useAutocomplete(props);

 // ...
-<Chip {...getTagProps({ index })} />
+<Chip {...getItemProps({ index })} />
```

#### focusedTag

```diff
 const {
-  focusedTag,
+  focusedItem,
 } = useAutocomplete(props);
```

### Backdrop props

Use the [backdrop-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#backdrop-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/backdrop-props <path>
```

The following deprecated `Backdrop` props have been removed:

- `components` — use `slots` instead
- `componentsProps` — use `slotProps` instead
- `TransitionComponent` — use `slots.transition` instead

```diff
 <Backdrop
-  components={{ Root: CustomRoot }}
-  componentsProps={{ root: { className: 'my-class' } }}
-  TransitionComponent={CustomTransition}
+  slots={{ root: CustomRoot, transition: CustomTransition }}
+  slotProps={{ root: { className: 'my-class' } }}
```

### Badge props

Use the [badge-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#badge-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/badge-props <path>
```

The following deprecated props have been removed from the `Badge` component:

- `components` → use `slots`
- `componentsProps` → use `slotProps`

```diff
 <Badge
-  components={{ Root: CustomRoot, Badge: CustomBadge }}
-  componentsProps={{ root: { className: 'my-root' }, badge: { className: 'my-badge' } }}
+  slots={{ root: CustomRoot, badge: CustomBadge }}
+  slotProps={{ root: { className: 'my-root' }, badge: { className: 'my-badge' } }}
 />
```

### Button CSS classes

Use the [button-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#button-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/button-classes <path>
```

The following deprecated `Button` CSS classes have been removed:

- `textInherit` → use `.MuiButton-text.MuiButton-colorInherit`
- `textPrimary` → use `.MuiButton-text.MuiButton-colorPrimary`
- `textSecondary` → use `.MuiButton-text.MuiButton-colorSecondary`
- `textSuccess` → use `.MuiButton-text.MuiButton-colorSuccess`
- `textError` → use `.MuiButton-text.MuiButton-colorError`
- `textInfo` → use `.MuiButton-text.MuiButton-colorInfo`
- `textWarning` → use `.MuiButton-text.MuiButton-colorWarning`
- `outlinedInherit` → use `.MuiButton-outlined.MuiButton-colorInherit`
- `outlinedPrimary` → use `.MuiButton-outlined.MuiButton-colorPrimary`
- `outlinedSecondary` → use `.MuiButton-outlined.MuiButton-colorSecondary`
- `outlinedSuccess` → use `.MuiButton-outlined.MuiButton-colorSuccess`
- `outlinedError` → use `.MuiButton-outlined.MuiButton-colorError`
- `outlinedInfo` → use `.MuiButton-outlined.MuiButton-colorInfo`
- `outlinedWarning` → use `.MuiButton-outlined.MuiButton-colorWarning`
- `containedInherit` → use `.MuiButton-contained.MuiButton-colorInherit`
- `containedPrimary` → use `.MuiButton-contained.MuiButton-colorPrimary`
- `containedSecondary` → use `.MuiButton-contained.MuiButton-colorSecondary`
- `containedSuccess` → use `.MuiButton-contained.MuiButton-colorSuccess`
- `containedError` → use `.MuiButton-contained.MuiButton-colorError`
- `containedInfo` → use `.MuiButton-contained.MuiButton-colorInfo`
- `containedWarning` → use `.MuiButton-contained.MuiButton-colorWarning`
- `textSizeSmall` → use `.MuiButton-text.MuiButton-sizeSmall`
- `textSizeMedium` → use `.MuiButton-text.MuiButton-sizeMedium`
- `textSizeLarge` → use `.MuiButton-text.MuiButton-sizeLarge`
- `outlinedSizeSmall` → use `.MuiButton-outlined.MuiButton-sizeSmall`
- `outlinedSizeMedium` → use `.MuiButton-outlined.MuiButton-sizeMedium`
- `outlinedSizeLarge` → use `.MuiButton-outlined.MuiButton-sizeLarge`
- `containedSizeSmall` → use `.MuiButton-contained.MuiButton-sizeSmall`
- `containedSizeMedium` → use `.MuiButton-contained.MuiButton-sizeMedium`
- `containedSizeLarge` → use `.MuiButton-contained.MuiButton-sizeLarge`
- `iconSizeSmall` → use `.MuiButton-root.MuiButton-sizeSmall > .MuiButton-icon`
- `iconSizeMedium` → use `.MuiButton-root.MuiButton-sizeMedium > .MuiButton-icon`
- `iconSizeLarge` → use `.MuiButton-root.MuiButton-sizeLarge > .MuiButton-icon`

If you were using these deprecated class names as `styleOverrides` keys in your theme, use the `variants` array in the `root` override instead:

```diff
 const theme = createTheme({
   components: {
     MuiButton: {
       styleOverrides: {
-        textInherit: { color: 'inherit' },
-        textPrimary: { color: 'blue' },
-        textSecondary: { color: 'purple' },
-        textSuccess: { color: 'green' },
-        textError: { color: 'red' },
-        textInfo: { color: 'cyan' },
-        textWarning: { color: 'orange' },
-        outlinedInherit: { borderColor: 'inherit' },
-        outlinedPrimary: { borderColor: 'blue' },
-        outlinedSecondary: { borderColor: 'purple' },
-        outlinedSuccess: { borderColor: 'green' },
-        outlinedError: { borderColor: 'red' },
-        outlinedInfo: { borderColor: 'cyan' },
-        outlinedWarning: { borderColor: 'orange' },
-        containedInherit: { backgroundColor: 'inherit' },
-        containedPrimary: { backgroundColor: 'blue' },
-        containedSecondary: { backgroundColor: 'purple' },
-        containedSuccess: { backgroundColor: 'green' },
-        containedError: { backgroundColor: 'red' },
-        containedInfo: { backgroundColor: 'cyan' },
-        containedWarning: { backgroundColor: 'orange' },
-        textSizeSmall: { fontSize: '0.75rem' },
-        textSizeMedium: { fontSize: '0.875rem' },
-        textSizeLarge: { fontSize: '1rem' },
-        outlinedSizeSmall: { fontSize: '0.75rem' },
-        outlinedSizeMedium: { fontSize: '0.875rem' },
-        outlinedSizeLarge: { fontSize: '1rem' },
-        containedSizeSmall: { fontSize: '0.75rem' },
-        containedSizeMedium: { fontSize: '0.875rem' },
-        containedSizeLarge: { fontSize: '1rem' },
-        iconSizeSmall: { fontSize: '18px' },
-        iconSizeMedium: { fontSize: '20px' },
-        iconSizeLarge: { fontSize: '22px' },
+        root: {
+          variants: [
+            { props: { variant: 'text', color: 'inherit' }, style: { color: 'inherit' } },
+            { props: { variant: 'text', color: 'primary' }, style: { color: 'blue' } },
+            { props: { variant: 'text', color: 'secondary' }, style: { color: 'purple' } },
+            { props: { variant: 'text', color: 'success' }, style: { color: 'green' } },
+            { props: { variant: 'text', color: 'error' }, style: { color: 'red' } },
+            { props: { variant: 'text', color: 'info' }, style: { color: 'cyan' } },
+            { props: { variant: 'text', color: 'warning' }, style: { color: 'orange' } },
+            { props: { variant: 'outlined', color: 'inherit' }, style: { borderColor: 'inherit' } },
+            { props: { variant: 'outlined', color: 'primary' }, style: { borderColor: 'blue' } },
+            { props: { variant: 'outlined', color: 'secondary' }, style: { borderColor: 'purple' } },
+            { props: { variant: 'outlined', color: 'success' }, style: { borderColor: 'green' } },
+            { props: { variant: 'outlined', color: 'error' }, style: { borderColor: 'red' } },
+            { props: { variant: 'outlined', color: 'info' }, style: { borderColor: 'cyan' } },
+            { props: { variant: 'outlined', color: 'warning' }, style: { borderColor: 'orange' } },
+            { props: { variant: 'contained', color: 'inherit' }, style: { backgroundColor: 'inherit' } },
+            { props: { variant: 'contained', color: 'primary' }, style: { backgroundColor: 'blue' } },
+            { props: { variant: 'contained', color: 'secondary' }, style: { backgroundColor: 'purple' } },
+            { props: { variant: 'contained', color: 'success' }, style: { backgroundColor: 'green' } },
+            { props: { variant: 'contained', color: 'error' }, style: { backgroundColor: 'red' } },
+            { props: { variant: 'contained', color: 'info' }, style: { backgroundColor: 'cyan' } },
+            { props: { variant: 'contained', color: 'warning' }, style: { backgroundColor: 'orange' } },
+            { props: { variant: 'text', size: 'small' }, style: { fontSize: '0.75rem' } },
+            { props: { variant: 'text', size: 'medium' }, style: { fontSize: '0.875rem' } },
+            { props: { variant: 'text', size: 'large' }, style: { fontSize: '1rem' } },
+            { props: { variant: 'outlined', size: 'small' }, style: { fontSize: '0.75rem' } },
+            { props: { variant: 'outlined', size: 'medium' }, style: { fontSize: '0.875rem' } },
+            { props: { variant: 'outlined', size: 'large' }, style: { fontSize: '1rem' } },
+            { props: { variant: 'contained', size: 'small' }, style: { fontSize: '0.75rem' } },
+            { props: { variant: 'contained', size: 'medium' }, style: { fontSize: '0.875rem' } },
+            { props: { variant: 'contained', size: 'large' }, style: { fontSize: '1rem' } },
+            { props: { size: 'small' }, style: { '& .MuiButton-icon': { fontSize: '18px' } } },
+            { props: { size: 'medium' }, style: { '& .MuiButton-icon': { fontSize: '20px' } } },
+            { props: { size: 'large' }, style: { '& .MuiButton-icon': { fontSize: '22px' } } },
+          ],
+        },
       },
     },
   },
 });
```

### ButtonGroup CSS classes

Use the [button-group-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#button-group-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/button-group-classes <path>
```

The following deprecated `ButtonGroup` CSS classes have been removed:

- `groupedHorizontal` → use `.MuiButtonGroup-horizontal > .MuiButtonGroup-grouped`
- `groupedVertical` → use `.MuiButtonGroup-vertical > .MuiButtonGroup-grouped`
- `groupedText` → use `.MuiButtonGroup-text > .MuiButtonGroup-grouped`
- `groupedTextHorizontal` → use `.MuiButtonGroup-text.MuiButtonGroup-horizontal > .MuiButtonGroup-grouped`
- `groupedTextVertical` → use `.MuiButtonGroup-text.MuiButtonGroup-vertical > .MuiButtonGroup-grouped`
- `groupedTextPrimary` → use `.MuiButtonGroup-text.MuiButtonGroup-colorPrimary > .MuiButtonGroup-grouped`
- `groupedTextSecondary` → use `.MuiButtonGroup-text.MuiButtonGroup-colorSecondary > .MuiButtonGroup-grouped`
- `groupedOutlined` → use `.MuiButtonGroup-outlined > .MuiButtonGroup-grouped`
- `groupedOutlinedHorizontal` → use `.MuiButtonGroup-outlined.MuiButtonGroup-horizontal > .MuiButtonGroup-grouped`
- `groupedOutlinedVertical` → use `.MuiButtonGroup-outlined.MuiButtonGroup-vertical > .MuiButtonGroup-grouped`
- `groupedOutlinedPrimary` → use `.MuiButtonGroup-outlined.MuiButtonGroup-colorPrimary > .MuiButtonGroup-grouped`
- `groupedOutlinedSecondary` → use `.MuiButtonGroup-outlined.MuiButtonGroup-colorSecondary > .MuiButtonGroup-grouped`
- `groupedContained` → use `.MuiButtonGroup-contained > .MuiButtonGroup-grouped`
- `groupedContainedHorizontal` → use `.MuiButtonGroup-contained.MuiButtonGroup-horizontal > .MuiButtonGroup-grouped`
- `groupedContainedVertical` → use `.MuiButtonGroup-contained.MuiButtonGroup-vertical > .MuiButtonGroup-grouped`
- `groupedContainedPrimary` → use `.MuiButtonGroup-contained.MuiButtonGroup-colorPrimary > .MuiButtonGroup-grouped`
- `groupedContainedSecondary` → use `.MuiButtonGroup-contained.MuiButtonGroup-colorSecondary > .MuiButtonGroup-grouped`

If you were using these deprecated class names as `styleOverrides` keys in your theme, use the `variants` array in the `root` override instead:

```diff
 const theme = createTheme({
   components: {
     MuiButtonGroup: {
       styleOverrides: {
-        groupedContainedPrimary: { borderColor: 'red' },
+        root: {
+          variants: [
+            {
+              props: { variant: 'contained', color: 'primary' },
+              style: {
+                '& > .MuiButtonGroup-grouped': { borderColor: 'red' },
+              },
+            },
+          ],
+        },
       },
     },
   },
 });
```

### CardHeader props

Use the [card-header-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#card-header-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/card-header-props <path>
```

The following deprecated props have been removed from the `CardHeader` component:

- `titleTypographyProps` → use `slotProps.title`
- `subheaderTypographyProps` → use `slotProps.subheader`

```diff
 <CardHeader
-  titleTypographyProps={{ className: 'my-title' }}
-  subheaderTypographyProps={{ className: 'my-subheader' }}
+  slotProps={{ title: { className: 'my-title' }, subheader: { className: 'my-subheader' } }}
 />
```

### Checkbox props

Use the [checkbox-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#checkbox-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/checkbox-props <path>
```

The following deprecated `Checkbox` props have been removed:

- `inputProps` — use `slotProps.input` instead
- `inputRef` — use `slotProps.input.ref` instead

```diff
 <Checkbox
-  inputProps={{ 'aria-label': 'Checkbox' }}
-  inputRef={ref}
+  slotProps={{ input: { 'aria-label': 'Checkbox', ref } }}
 />
```

### Chip CSS classes

Use the [chip-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#chip-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/chip-classes <path>
```

The following deprecated `Chip` CSS classes have been removed:

- `clickableColorPrimary` → use `.MuiChip-clickable.MuiChip-colorPrimary`
- `clickableColorSecondary` → use `.MuiChip-clickable.MuiChip-colorSecondary`
- `deletableColorPrimary` → use `.MuiChip-deletable.MuiChip-colorPrimary`
- `deletableColorSecondary` → use `.MuiChip-deletable.MuiChip-colorSecondary`
- `outlinedPrimary` → use `.MuiChip-outlined.MuiChip-colorPrimary`
- `outlinedSecondary` → use `.MuiChip-outlined.MuiChip-colorSecondary`
- `filledPrimary` → use `.MuiChip-filled.MuiChip-colorPrimary`
- `filledSecondary` → use `.MuiChip-filled.MuiChip-colorSecondary`
- `avatarSmall` → use `.MuiChip-sizeSmall > .MuiChip-avatar`
- `avatarMedium` → use `.MuiChip-sizeMedium > .MuiChip-avatar`
- `avatarColorPrimary` → use `.MuiChip-colorPrimary > .MuiChip-avatar`
- `avatarColorSecondary` → use `.MuiChip-colorSecondary > .MuiChip-avatar`
- `iconSmall` → use `.MuiChip-sizeSmall > .MuiChip-icon`
- `iconMedium` → use `.MuiChip-sizeMedium > .MuiChip-icon`
- `iconColorPrimary` → use `.MuiChip-colorPrimary > .MuiChip-icon`
- `iconColorSecondary` → use `.MuiChip-colorSecondary > .MuiChip-icon`
- `labelSmall` → use `.MuiChip-sizeSmall > .MuiChip-label`
- `labelMedium` → use `.MuiChip-sizeMedium > .MuiChip-label`
- `deleteIconSmall` → use `.MuiChip-sizeSmall > .MuiChip-deleteIcon`
- `deleteIconMedium` → use `.MuiChip-sizeMedium > .MuiChip-deleteIcon`
- `deleteIconColorPrimary` → use `.MuiChip-colorPrimary > .MuiChip-deleteIcon`
- `deleteIconColorSecondary` → use `.MuiChip-colorSecondary > .MuiChip-deleteIcon`
- `deleteIconOutlinedColorPrimary` → use `.MuiChip-outlined.MuiChip-colorPrimary > .MuiChip-deleteIcon`
- `deleteIconOutlinedColorSecondary` → use `.MuiChip-outlined.MuiChip-colorSecondary > .MuiChip-deleteIcon`
- `deleteIconFilledColorPrimary` → use `.MuiChip-filled.MuiChip-colorPrimary > .MuiChip-deleteIcon`
- `deleteIconFilledColorSecondary` → use `.MuiChip-filled.MuiChip-colorSecondary > .MuiChip-deleteIcon`

If you were using these deprecated class names as `styleOverrides` keys in your theme, use the `variants` array in the `root` override instead.
For classes that targeted child elements (`avatar`, `icon`, `deleteIcon`), use CSS child selectors inside the `root` variants since those are not standalone styled slots.
The `label` slot is a proper styled component and can use `variants` directly in `styleOverrides.label`:

```diff
 const theme = createTheme({
   components: {
     MuiChip: {
       styleOverrides: {
-        clickableColorPrimary: { boxShadow: 'none' },
-        outlinedPrimary: { borderWidth: 2 },
-        filledSecondary: { opacity: 0.9 },
-        avatarColorPrimary: { color: 'white' },
-        iconSmall: { fontSize: 14 },
-        deleteIconColorPrimary: { color: 'red' },
-        labelSmall: { padding: '0 6px' },
+        root: {
+          variants: [
+            { props: { clickable: true, color: 'primary' }, style: { boxShadow: 'none' } },
+            { props: { variant: 'outlined', color: 'primary' }, style: { borderWidth: 2 } },
+            { props: { variant: 'filled', color: 'secondary' }, style: { opacity: 0.9 } },
+            { props: { color: 'primary' }, style: { '& .MuiChip-avatar': { color: 'white' } } },
+            { props: { size: 'small' }, style: { '& .MuiChip-icon': { fontSize: 14 } } },
+            { props: { color: 'primary' }, style: { '& .MuiChip-deleteIcon': { color: 'red' } } },
+          ],
+        },
+        label: {
+          variants: [
+            { props: { size: 'small' }, style: { padding: '0 6px' } },
+          ],
+        },
       },
     },
   },
 });
```

### CircularProgress CSS classes

Use the [circular-progress-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#circular-progress-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/circular-progress-classes <path>
```

The following deprecated `CircularProgress` CSS classes have been removed:

- `circleDeterminate` → use `.MuiCircularProgress-determinate .MuiCircularProgress-circle`
- `circleIndeterminate` → use `.MuiCircularProgress-indeterminate .MuiCircularProgress-circle`

If you were using these deprecated class names as `styleOverrides` keys in your theme, use the `variants` array in the `circle` override instead:

```diff
 const theme = createTheme({
   components: {
     MuiCircularProgress: {
       styleOverrides: {
-        circleDeterminate: { strokeDashoffset: '10px' },
-        circleIndeterminate: { animationDuration: '1.4s' },
+        circle: {
+          variants: [
+            {
+              props: { variant: 'determinate' },
+              style: { strokeDashoffset: '10px' },
+            },
+            {
+              props: { variant: 'indeterminate' },
+              style: { animationDuration: '1.4s' },
+            },
+          ],
+        },
       },
     },
   },
 });
```

### Dialog CSS classes

Use the [dialog-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#dialog-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/dialog-classes <path>
```

The following deprecated `Dialog` CSS classes have been removed:

- `paperScrollPaper` → use `.MuiDialog-scrollPaper > .MuiDialog-paper`
- `paperScrollBody` → use `.MuiDialog-scrollBody > .MuiDialog-paper`

If you were using these classes in `styleOverrides`, use the `variants` array in the `paper` slot instead:

```diff
 const theme = createTheme({
   components: {
     MuiDialog: {
       styleOverrides: {
-        paperScrollPaper: {
-          maxHeight: '80vh',
-        },
-        paperScrollBody: {
-          verticalAlign: 'bottom',
-        },
+        paper: {
+          variants: [
+            {
+              props: { scroll: 'paper' },
+              style: {
+                maxHeight: '80vh',
+              },
+            },
+            {
+              props: { scroll: 'body' },
+              style: {
+                verticalAlign: 'bottom',
+              },
+            },
+          ],
+        },
       },
     },
   },
 });
```

### Dialog props

Use the [dialog-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#dialog-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/dialog-props <path>
```

The following deprecated props have been removed from the `Dialog` component:

- `BackdropComponent` → use `slots.backdrop`
- `BackdropProps` → use `slotProps.backdrop`
- `PaperProps` → use `slotProps.paper`
- `TransitionComponent` → use `slots.transition`
- `TransitionProps` → use `slotProps.transition`

```diff
 <Dialog
-  BackdropComponent={CustomBackdrop}
-  BackdropProps={{ invisible: true }}
-  PaperProps={{ elevation: 3 }}
-  TransitionComponent={CustomTransition}
-  TransitionProps={{ timeout: 500 }}
+  slots={{ backdrop: CustomBackdrop, transition: CustomTransition }}
+  slotProps={{ backdrop: { invisible: true }, paper: { elevation: 3 }, transition: { timeout: 500 } }}
 />
```

### Drawer props

Use the [drawer-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#drawer-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/drawer-props <path>
```

The following deprecated props have been removed from the `Drawer` component:

- `BackdropComponent` → use `slots.backdrop`
- `BackdropProps` → use `slotProps.backdrop`
- `PaperProps` → use `slotProps.paper`
- `SlideProps` → use `slotProps.transition`
- `TransitionComponent` → use `slots.transition`

```diff
 <Drawer
-  BackdropComponent={CustomBackdrop}
-  BackdropProps={{ invisible: true }}
-  PaperProps={{ elevation: 2 }}
-  SlideProps={{ timeout: 500 }}
-  TransitionComponent={CustomTransition}
+  slots={{ backdrop: CustomBackdrop, transition: CustomTransition }}
+  slotProps={{ backdrop: { invisible: true }, paper: { elevation: 2 }, transition: { timeout: 500 } }}
 />
```

### Drawer CSS classes

Use the [drawer-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#drawer-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/drawer-classes <path>
```

The following deprecated classes have been removed:

- `paperAnchorLeft` — combine `.MuiDrawer-anchorLeft` and `.MuiDrawer-paper` instead
- `paperAnchorRight` — combine `.MuiDrawer-anchorRight` and `.MuiDrawer-paper` instead
- `paperAnchorTop` — combine `.MuiDrawer-anchorTop` and `.MuiDrawer-paper` instead
- `paperAnchorBottom` — combine `.MuiDrawer-anchorBottom` and `.MuiDrawer-paper` instead
- `paperAnchorDockedLeft` — combine `.MuiDrawer-anchorLeft`, `.MuiDrawer-docked`, and `.MuiDrawer-paper` instead
- `paperAnchorDockedRight` — combine `.MuiDrawer-anchorRight`, `.MuiDrawer-docked`, and `.MuiDrawer-paper` instead
- `paperAnchorDockedTop` — combine `.MuiDrawer-anchorTop`, `.MuiDrawer-docked`, and `.MuiDrawer-paper` instead
- `paperAnchorDockedBottom` — combine `.MuiDrawer-anchorBottom`, `.MuiDrawer-docked`, and `.MuiDrawer-paper` instead

```diff
-.MuiDrawer-paperAnchorLeft
+.MuiDrawer-anchorLeft > .MuiDrawer-paper

-.MuiDrawer-paperAnchorDockedLeft
+.MuiDrawer-anchorLeft.MuiDrawer-docked > .MuiDrawer-paper
```

### Divider props

Use the [codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#divider-props) below to migrate the code as described in the following sections:

```bash
npx @mui/codemod@latest deprecations/divider-props <path>
```

The deprecated `Divider` prop have been removed.
Use `sx={{ opacity : "0.6" }}` (or any opacity):

```diff
 <Divider
-  light
+  sx={{ opacity: 0.6 }}
 />
```

### Divider CSS classes

The following deprecated class has been removed:

- `withChildrenVertical` — combine the `.MuiDivider-withChildren` and `.MuiDivider-vertical` classes instead

```diff
-.MuiDivider-withChildrenVertical
+.MuiDivider-withChildren.MuiDivider-vertical
```

### FormControlLabel props

Use the [form-control-label-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#form-control-label-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/form-control-label-props <path>
```

The following deprecated prop has been removed:

- `componentsProps` — use `slotProps` instead

```diff
 <FormControlLabel
-  componentsProps={{ typography: { fontWeight: 'bold' } }}
+  slotProps={{ typography: { fontWeight: 'bold' } }}
 />
```

### FilledInput props

Use the [filled-input-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#filled-input-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/filled-input-props <path>
```

The following deprecated `FilledInput` props have been removed:

- `components` → use `slots` instead
- `componentsProps` → use `slotProps` instead

```diff
 <FilledInput
-  components={{ Root: CustomRoot, Input: CustomInput }}
-  componentsProps={{ root: { id: 'root' }, input: { id: 'input' } }}
+  slots={{ root: CustomRoot, input: CustomInput }}
+  slotProps={{ root: { id: 'root' }, input: { id: 'input' } }}
 />
```

### ImageListItemBar CSS classes

Use the [image-list-item-bar-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#image-list-item-bar-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/image-list-item-bar-classes <path>
```

The following deprecated `ImageListItemBar` CSS classes have been removed:

- `titleWrapBelow` → use `.MuiImageListItemBar-titleWrap` with `.MuiImageListItemBar-positionBelow` on the root
- `titleWrapActionPosLeft` → use `.MuiImageListItemBar-titleWrap` with `.MuiImageListItemBar-actionPositionLeft` on the root
- `titleWrapActionPosRight` → use `.MuiImageListItemBar-titleWrap` with `.MuiImageListItemBar-actionPositionRight` on the root
- `actionIconActionPosLeft` → use `.MuiImageListItemBar-actionIcon` with `.MuiImageListItemBar-actionPositionLeft` on the root

### Input props

Use the [input-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#input-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/input-props <path>
```

The following deprecated `Input` props have been removed:

- `components` → use `slots` instead
- `componentsProps` → use `slotProps` instead

```diff
 <Input
-  components={{ Root: CustomRoot, Input: CustomInput }}
-  componentsProps={{ root: { id: 'root' }, input: { id: 'input' } }}
+  slots={{ root: CustomRoot, input: CustomInput }}
+  slotProps={{ root: { id: 'root' }, input: { id: 'input' } }}
 />
```

### InputBase CSS classes

Use the [input-base-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#input-base-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/input-base-classes <path>
```

The following deprecated `InputBase` CSS classes have been removed:

- `inputSizeSmall` → use `.MuiInputBase-sizeSmall > .MuiInputBase-input`
- `inputMultiline` → use `.MuiInputBase-multiline > .MuiInputBase-input`
- `inputAdornedStart` → use `.MuiInputBase-adornedStart > .MuiInputBase-input`
- `inputAdornedEnd` → use `.MuiInputBase-adornedEnd > .MuiInputBase-input`
- `inputHiddenLabel` → use `.MuiInputBase-hiddenLabel > .MuiInputBase-input`

If you were using these deprecated class names as `styleOverrides` keys in your theme, use the `root` slot with combined class selectors instead:

```diff
 import { inputBaseClasses } from '@mui/material/InputBase';

 const theme = createTheme({
   components: {
     MuiInputBase: {
       styleOverrides: {
-        inputSizeSmall: { padding: 1 },
-        inputMultiline: { resize: 'none' },
-        inputAdornedStart: { paddingLeft: 0 },
-        inputAdornedEnd: { paddingRight: 0 },
-        inputHiddenLabel: { paddingTop: 8 },
+        root: {
+          [`&.${inputBaseClasses.sizeSmall} > .${inputBaseClasses.input}`]: { padding: 1 },
+          [`&.${inputBaseClasses.multiline} > .${inputBaseClasses.input}`]: { resize: 'none' },
+          [`&.${inputBaseClasses.adornedStart} > .${inputBaseClasses.input}`]: { paddingLeft: 0 },
+          [`&.${inputBaseClasses.adornedEnd} > .${inputBaseClasses.input}`]: { paddingRight: 0 },
+          [`&.${inputBaseClasses.hiddenLabel} > .${inputBaseClasses.input}`]: { paddingTop: 8 },
+        },
       },
     },
   },
 });
```

### InputBase props

Use the [input-base-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#input-base-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/input-base-props <path>
```

The following deprecated `InputBase` props have been removed:

- `components` → use `slots` instead
- `componentsProps` → use `slotProps` instead

```diff
 <InputBase
-  components={{ Root: CustomRoot, Input: CustomInput }}
-  componentsProps={{ root: { id: 'root' }, input: { id: 'input' } }}
+  slots={{ root: CustomRoot, input: CustomInput }}
+  slotProps={{ root: { id: 'root' }, input: { id: 'input' } }}
 />
```

### LinearProgress CSS classes

Use the [linear-progress-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#linear-progress-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/linear-progress-classes <path>
```

The following deprecated `LinearProgress` CSS classes have been removed:

- `bar1Buffer` → use `.MuiLinearProgress-buffer > .MuiLinearProgress-bar1`
- `bar1Determinate` → use `.MuiLinearProgress-determinate > .MuiLinearProgress-bar1`
- `bar1Indeterminate` → use `.MuiLinearProgress-indeterminate > .MuiLinearProgress-bar1`
- `bar2Buffer` → use `.MuiLinearProgress-buffer > .MuiLinearProgress-bar2`
- `bar2Indeterminate` → use `.MuiLinearProgress-indeterminate > .MuiLinearProgress-bar2`
- `barColorPrimary` → use `.MuiLinearProgress-colorPrimary > .MuiLinearProgress-bar`
- `barColorSecondary` → use `.MuiLinearProgress-colorSecondary > .MuiLinearProgress-bar`
- `dashedColorPrimary` → use `.MuiLinearProgress-colorPrimary > .MuiLinearProgress-dashed`
- `dashedColorSecondary` → use `.MuiLinearProgress-colorSecondary > .MuiLinearProgress-dashed`

If you were using these deprecated class names as `styleOverrides` keys in your theme, use the `variants` array in the appropriate slot override instead:

```diff
 const theme = createTheme({
   components: {
     MuiLinearProgress: {
       styleOverrides: {
-        bar1Determinate: { transition: 'none' },
-        bar1Indeterminate: { width: 'auto' },
-        bar1Buffer: { zIndex: 1 },
-        barColorPrimary: { backgroundColor: 'red' },
-        dashedColorPrimary: { backgroundSize: '10px 10px' },
+        bar1: {
+          variants: [
+            { props: { variant: 'determinate' }, style: { transition: 'none' } },
+            { props: { variant: 'indeterminate' }, style: { width: 'auto' } },
+            { props: { variant: 'buffer' }, style: { zIndex: 1 } },
+          ],
+        },
+        bar: {
+          variants: [
+            { props: { color: 'primary' }, style: { backgroundColor: 'red' } },
+          ],
+        },
+        dashed: {
+          variants: [
+            { props: { color: 'primary' }, style: { backgroundSize: '10px 10px' } },
+          ],
+        },
       },
     },
   },
 });
```

### ListItem props

Use the [list-item-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#list-item-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/list-item-props <path>
```

The following deprecated props have been removed:

- `components` — use `slots` instead
- `componentsProps` — use `slotProps` instead
- `ContainerComponent` — use `component` or `slots.root` instead
- `ContainerProps` — use `slotProps.root` instead

```diff
 <ListItem
-  components={{ Root: CustomRoot }}
-  componentsProps={{ root: { className: 'custom' } }}
+  slots={{ root: CustomRoot }}
+  slotProps={{ root: { className: 'custom' } }}
 />
```

The theming `styleOverrides` key `secondaryAction` now targets the `secondaryAction` slot instead of the root slot.

```diff
 const theme = createTheme({
   components: {
     MuiListItem: {
       styleOverrides: {
-        secondaryAction: {
-          [`& .${listItemClasses.secondaryAction}`]: {
-            // styles
-          },
-        },
+        secondaryAction: {
+          // styles applied directly to the secondaryAction slot
+        },
       },
     },
   },
 });
```

### ListItemText props

Use the [list-item-text-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#list-item-text-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/list-item-text-props <path>
```

The following deprecated props have been removed:

- `primaryTypographyProps` — use `slotProps.primary` instead
- `secondaryTypographyProps` — use `slotProps.secondary` instead

```diff
 <ListItemText
-  primaryTypographyProps={{ variant: 'h6' }}
-  secondaryTypographyProps={{ color: 'textSecondary' }}
+  slotProps={{
+    primary: { variant: 'h6' },
+    secondary: { color: 'textSecondary' },
+  }}
 />
```

### Menu props

Use the [menu-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#menu-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/menu-props <path>
```

The following deprecated props have been removed:

- `MenuListProps` — use `slotProps.list` instead
- `PaperProps` — use `slotProps.paper` instead
- `TransitionProps` — use `slotProps.transition` instead

```diff
 <Menu
-  MenuListProps={{ disablePadding: true }}
-  PaperProps={{ elevation: 12 }}
-  TransitionProps={{ timeout: 500 }}
+  slotProps={{
+    list: { disablePadding: true },
+    paper: { elevation: 12 },
+    transition: { timeout: 500 },
+  }}
 />
```

If you pass these props via `Select`'s `MenuProps`, update them the same way:

```diff
 <Select
   MenuProps={{
-    PaperProps: { style: { maxHeight: 200 } },
-    MenuListProps: { disablePadding: true },
-    TransitionProps: { timeout: 500 },
+    slotProps: {
+      paper: { style: { maxHeight: 200 } },
+      list: { disablePadding: true },
+      transition: { timeout: 500 },
+    },
   }}
 />
```

### MobileStepper props

Use the [mobile-stepper-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#mobile-stepper-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/mobile-stepper-props <path>
```

The following deprecated props have been removed:

- `LinearProgressProps` — use `slotProps.progress` instead

```diff
 <MobileStepper
-  LinearProgressProps={{ className: 'progress' }}
+  slotProps={{ progress: { className: 'progress' } }}
 />
```

### Modal props

Use the [modal-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#modal-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/modal-props <path>
```

The following deprecated props have been removed from the `Modal` component:

- `BackdropComponent` → use `slots.backdrop`
- `BackdropProps` → use `slotProps.backdrop`
- `components` → use `slots`
- `componentsProps` → use `slotProps`

```diff
 <Modal
-  BackdropComponent={CustomBackdrop}
-  BackdropProps={{ invisible: true }}
-  components={{ Root: CustomRoot }}
-  componentsProps={{ root: { className: 'custom' } }}
+  slots={{ backdrop: CustomBackdrop, root: CustomRoot }}
+  slotProps={{ backdrop: { invisible: true }, root: { className: 'custom' } }}
 />
```

### OutlinedInput props

Use the [outlined-input-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#outlined-input-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/outlined-input-props <path>
```

The following deprecated `OutlinedInput` props have been removed:

- `components` → use `slots` instead
- `componentsProps` → use `slotProps` instead

```diff
 <OutlinedInput
-  components={{ Root: CustomRoot, Input: CustomInput }}
-  componentsProps={{ root: { id: 'root' }, input: { id: 'input' } }}
+  slots={{ root: CustomRoot, input: CustomInput }}
+  slotProps={{ root: { id: 'root' }, input: { id: 'input' } }}
 />
```

### PaginationItem props

Use the [pagination-item-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#pagination-item-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/pagination-item-props <path>
```

The following deprecated props have been removed:

- `components` — use `slots` instead

```diff
 <PaginationItem
-  components={{
-    first: MyFirstIcon,
-    last: MyLastIcon,
-    previous: MyPreviousIcon,
-    next: MyNextIcon,
-  }}
+  slots={{
+    first: MyFirstIcon,
+    last: MyLastIcon,
+    previous: MyPreviousIcon,
+    next: MyNextIcon,
+  }}
 />
```

### PaginationItem CSS classes

Use the [pagination-item-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#pagination-item-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/pagination-item-classes <path>
```

The following deprecated classes have been removed:

- `textPrimary` — combine the `.MuiPaginationItem-text` and `.MuiPaginationItem-colorPrimary` classes instead
- `textSecondary` — combine the `.MuiPaginationItem-text` and `.MuiPaginationItem-colorSecondary` classes instead
- `outlinedPrimary` — combine the `.MuiPaginationItem-outlined` and `.MuiPaginationItem-colorPrimary` classes instead
- `outlinedSecondary` — combine the `.MuiPaginationItem-outlined` and `.MuiPaginationItem-colorSecondary` classes instead

```diff
-.MuiPaginationItem-textPrimary
+.MuiPaginationItem-text.MuiPaginationItem-colorPrimary

-.MuiPaginationItem-outlinedPrimary
+.MuiPaginationItem-outlined.MuiPaginationItem-colorPrimary
```

### Popper props

Use the [popper-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#popper-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/popper-props <path>
```

The following deprecated props have been removed:

- `components` — use `slots` instead
- `componentsProps` — use `slotProps` instead

```diff
 <Popper
-  components={{ Root: CustomRoot }}
-  componentsProps={{ root: { className: 'custom' } }}
+  slots={{ root: CustomRoot }}
+  slotProps={{ root: { className: 'custom' } }}
 />
```

### Popover props

Use the [popover-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#popover-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/popover-props <path>
```

The following deprecated props have been removed:

- `BackdropComponent` — use `slots.backdrop` instead
- `BackdropProps` — use `slotProps.backdrop` instead
- `PaperProps` — use `slotProps.paper` instead
- `TransitionComponent` — use `slots.transition` instead
- `TransitionProps` — use `slotProps.transition` instead

```diff
 <Popover
-  BackdropComponent={CustomBackdrop}
-  BackdropProps={{ invisible: true }}
-  PaperProps={{ elevation: 12 }}
-  TransitionComponent={CustomTransition}
-  TransitionProps={{ timeout: 500 }}
+  slots={{ backdrop: CustomBackdrop, transition: CustomTransition }}
+  slotProps={{
+    backdrop: { invisible: true },
+    paper: { elevation: 12 },
+    transition: { timeout: 500 },
+  }}
 />
```

### Radio props

Use the [radio-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#radio-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/radio-props <path>
```

The following deprecated `Radio` props have been removed:

- `inputProps` — use `slotProps.input` instead
- `inputRef` — use `slotProps.input.ref` instead

```diff
 <Radio
-  inputProps={{ 'aria-label': 'Radio' }}
-  inputRef={ref}
+  slotProps={{ input: { 'aria-label': 'Radio', ref } }}
 />
```

### Rating props

Use the [rating-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#rating-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/rating-props <path>
```

The following deprecated prop has been removed:

- `IconContainerComponent` — use `slotProps.icon.component` instead

```diff
 <Rating
-  IconContainerComponent={CustomIconContainer}
+  slotProps={{ icon: { component: CustomIconContainer } }}
 />
```

### Select CSS classes

Use the [select-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#select-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/select-classes <path>
```

The following deprecated `Select` CSS classes have been removed:

- `iconFilled` → use `.MuiSelect-filled ~ .MuiSelect-icon`
- `iconOutlined` → use `.MuiSelect-outlined ~ .MuiSelect-icon`
- `iconStandard` → use `.MuiSelect-standard ~ .MuiSelect-icon`

If you were using these deprecated class names as `styleOverrides` in your theme, use sibling selectors in the `root` override instead:

```diff
 import { selectClasses } from '@mui/material/Select';

 const theme = createTheme({
   components: {
     MuiSelect: {
       styleOverrides: {
         root: {
-          [`& .${selectClasses.iconFilled}`]: {
+          [`& .${selectClasses.filled} ~ .${selectClasses.icon}`]: {
             color: 'red',
           },
-          [`& .${selectClasses.iconOutlined}`]: {
+          [`& .${selectClasses.outlined} ~ .${selectClasses.icon}`]: {
             color: 'red',
           },
-          [`& .${selectClasses.iconStandard}`]: {
+          [`& .${selectClasses.standard} ~ .${selectClasses.icon}`]: {
             color: 'red',
           },
         },
       },
     },
   },
 });
```

### Slider props

Use the [slider-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#slider-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/slider-props <path>
```

The following deprecated props have been removed from the `Slider` component:

- `components` — use `slots` instead
- `componentsProps` — use `slotProps` instead

```diff
 <Slider
-  components={{ Track: CustomTrack }}
-  componentsProps={{ track: { testid: 'test-id' } }}
+  slots={{ track: CustomTrack }}
+  slotProps={{ track: { testid: 'test-id' } }}
 />
```

### Slider CSS classes

Use the [slider-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#slider-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/slider-classes <path>
```

The following deprecated classes have been removed:

- `thumbColorPrimary` — use `.MuiSlider-colorPrimary > .MuiSlider-thumb` instead
- `thumbColorSecondary` — use `.MuiSlider-colorSecondary > .MuiSlider-thumb` instead
- `thumbColorError` — use `.MuiSlider-colorError > .MuiSlider-thumb` instead
- `thumbColorInfo` — use `.MuiSlider-colorInfo > .MuiSlider-thumb` instead
- `thumbColorSuccess` — use `.MuiSlider-colorSuccess > .MuiSlider-thumb` instead
- `thumbColorWarning` — use `.MuiSlider-colorWarning > .MuiSlider-thumb` instead
- `thumbSizeSmall` — use `.MuiSlider-sizeSmall > .MuiSlider-thumb` instead

```diff
-.MuiSlider-thumbColorPrimary
+.MuiSlider-colorPrimary > .MuiSlider-thumb

-.MuiSlider-thumbColorSecondary
+.MuiSlider-colorSecondary > .MuiSlider-thumb

-.MuiSlider-thumbSizeSmall
+.MuiSlider-sizeSmall > .MuiSlider-thumb
```

### Snackbar props

Use the [snackbar-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#snackbar-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/snackbar-props <path>
```

The following deprecated `Snackbar` props have been removed:

- `ClickAwayListenerProps` — use `slotProps.clickAwayListener` instead
- `ContentProps` — use `slotProps.content` instead
- `TransitionComponent` — use `slots.transition` instead
- `TransitionProps` — use `slotProps.transition` instead

```diff
 <Snackbar
-  ClickAwayListenerProps={CustomClickAwayListenerProps}
-  ContentProps={CustomContentProps}
-  TransitionComponent={CustomTransition}
-  TransitionProps={CustomTransitionProps}
+  slots={{ transition: CustomTransition }}
+  slotProps={{
+    clickAwayListener: CustomClickAwayListenerProps,
+    content: CustomContentProps,
+    transition: CustomTransitionProps,
+  }}
 />
```

### StepConnector CSS classes

Use the [step-connector-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#step-connector-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/step-connector-classes <path>
```

The following deprecated `StepConnector` CSS classes have been removed:

- `lineHorizontal` → use `.MuiStepConnector-horizontal .MuiStepConnector-line`
- `lineVertical` → use `.MuiStepConnector-vertical .MuiStepConnector-line`

If you were using these deprecated class names as `styleOverrides` keys in your theme, use the `variants` array in the `line` override instead:

```diff
 const theme = createTheme({
   components: {
     MuiStepConnector: {
       styleOverrides: {
-        lineHorizontal: { borderTopWidth: 3 },
-        lineVertical: { borderLeftWidth: 3 },
+        line: {
+          variants: [
+            { props: { orientation: 'horizontal' }, style: { borderTopWidth: 3 } },
+            { props: { orientation: 'vertical' }, style: { borderLeftWidth: 3 } },
+          ],
+        },
       },
     },
   },
 });
```

### StepContent props

Use the [step-content-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#step-content-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/step-content-props <path>
```

The following deprecated `StepContent` props have been removed:

- `TransitionComponent` → use `slots.transition` instead
- `TransitionProps` → use `slotProps.transition` instead

```diff
 <StepContent
-  TransitionComponent={CustomTransition}
-  TransitionProps={{ unmountOnExit: true }}
+  slots={{ transition: CustomTransition }}
+  slotProps={{ transition: { unmountOnExit: true } }}
 />
```

### StepLabel props

Use the [step-label-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#step-label-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/step-label-props <path>
```

The following deprecated `StepLabel` props have been removed:

- `componentsProps` → use `slotProps` instead
- `StepIconComponent` → use `slots.stepIcon` instead
- `StepIconProps` → use `slotProps.stepIcon` instead

```diff
 <StepLabel
-  StepIconComponent={CustomIcon}
-  StepIconProps={{ error: true }}
-  componentsProps={{ label: { className: 'my-label' } }}
+  slots={{ stepIcon: CustomIcon }}
+  slotProps={{ stepIcon: { error: true }, label: { className: 'my-label' } }}
 />
```

### SpeedDial props

Use the [speed-dial-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#speed-dial-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/speed-dial-props <path>
```

The deprecated `SpeedDial` props have been removed.
Use the `slots` and `slotProps` props instead:

```diff
 <SpeedDial
-  TransitionComponent={CustomTransition}
-  TransitionProps={{ timeout: 500 }}
+  slots={{ transition: CustomTransition }}
+  slotProps={{ transition: { timeout: 500 } }}
 >
```

### SpeedDialAction props

Use the [speed-dial-action-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#speed-dial-action-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/speed-dial-action-props <path>
```

The deprecated `SpeedDialAction` props have been removed.
Use the `slotProps` prop instead:

```diff
 <SpeedDialAction
-  FabProps={{ size: 'large' }}
-  tooltipTitle="Add"
-  tooltipPlacement="right"
-  tooltipOpen
-  TooltipClasses={{ tooltip: 'custom' }}
+  slotProps={{
+    fab: { size: 'large' },
+    tooltip: {
+      title: 'Add',
+      placement: 'right',
+      open: true,
+      classes: { tooltip: 'custom' },
+    },
```

### Switch props

Use the [switch-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#switch-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/switch-props <path>
```

The following deprecated `Switch` props have been removed:

- `inputProps` — use `slotProps.input` instead
- `inputRef` — use `slotProps.input.ref` instead

```diff
 <Switch
-  inputProps={{ 'aria-label': 'Switch' }}
-  inputRef={ref}
+  slotProps={{ input: { 'aria-label': 'Switch', ref } }}
 />
```

### SwipeableDrawer props

Use the [drawer-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#drawer-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/drawer-props <path>
```

The following deprecated props have been removed from the `SwipeableDrawer` component:

- `BackdropComponent` → use `slots.backdrop`
- `BackdropProps` → use `slotProps.backdrop`
- `SwipeAreaProps` → use `slotProps.swipeArea`

```diff
 <SwipeableDrawer
-  BackdropComponent={CustomBackdrop}
-  BackdropProps={{ invisible: true }}
-  SwipeAreaProps={{ className: 'custom' }}
+  slots={{ backdrop: CustomBackdrop }}
+  slotProps={{ backdrop: { invisible: true }, swipeArea: { className: 'custom' } }}
 />
```

### TablePagination props

Use the [table-pagination-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#table-pagination-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/table-pagination-props <path>
```

The following deprecated props have been removed:

- `backIconButtonProps` — use `slotProps.actions.previousButton` instead
- `nextIconButtonProps` — use `slotProps.actions.nextButton` instead
- `SelectProps` — use `slotProps.select` instead

```diff
 <TablePagination
-  backIconButtonProps={{ disabled: true }}
-  nextIconButtonProps={{ disabled: true }}
-  SelectProps={{ variant: 'outlined' }}
+  slotProps={{
+    actions: {
+      previousButton: { disabled: true },
+      nextButton: { disabled: true },
+    },
+    select: { variant: 'outlined' },
+  }}
 />
```

### TableSortLabel CSS classes

Use the [table-sort-label-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#table-sort-label-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/table-sort-label-classes <path>
```

The following deprecated classes have been removed:

- `iconDirectionDesc` — combine the `.MuiTableSortLabel-directionDesc` and `.MuiTableSortLabel-icon` classes instead
- `iconDirectionAsc` — combine the `.MuiTableSortLabel-directionAsc` and `.MuiTableSortLabel-icon` classes instead

```diff
-.MuiTableSortLabel-iconDirectionDesc
+.MuiTableSortLabel-directionDesc > .MuiTableSortLabel-icon

-.MuiTableSortLabel-iconDirectionAsc
+.MuiTableSortLabel-directionAsc > .MuiTableSortLabel-icon
```

If you were using these deprecated class names as `styleOverrides` keys in your theme, use the `variants` array in the `icon` override instead:

```diff
 const theme = createTheme({
   components: {
     MuiTableSortLabel: {
       styleOverrides: {
-        iconDirectionDesc: { opacity: 1 },
-        iconDirectionAsc: { opacity: 1 },
+        icon: {
+          variants: [
+            { props: { direction: 'desc' }, style: { opacity: 1 } },
+            { props: { direction: 'asc' }, style: { opacity: 1 } },
+          ],
+        },
       },
     },
   },
 });
```

### Tabs props

Use the [tabs-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#tabs-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/tabs-props <path>
```

The following deprecated props have been removed:

- `ScrollButtonComponent` — use `slots.scrollButtons` instead
- `TabIndicatorProps` — use `slotProps.indicator` instead
- `TabScrollButtonProps` — use `slotProps.scrollButtons` instead
- `slots.StartScrollButtonIcon` — use `slots.startScrollButtonIcon` instead
- `slots.EndScrollButtonIcon` — use `slots.endScrollButtonIcon` instead

```diff
 <Tabs
-  ScrollButtonComponent={CustomScrollButton}
-  TabIndicatorProps={{ style: { backgroundColor: 'green' } }}
-  TabScrollButtonProps={{ disableRipple: true }}
+  slots={{ scrollButtons: CustomScrollButton }}
+  slotProps={{
+    indicator: { style: { backgroundColor: 'green' } },
+    scrollButtons: { disableRipple: true },
+  }}
 />
```

```diff
 <Tabs
-  slots={{ StartScrollButtonIcon: CustomIcon, EndScrollButtonIcon: CustomIcon2 }}
+  slots={{ startScrollButtonIcon: CustomIcon, endScrollButtonIcon: CustomIcon2 }}
 />
```

### Tab CSS classes

Use the [tab-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#tab-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/tab-classes <path>
```

The following deprecated class has been removed:

- `iconWrapper` — use the `icon` class instead

```diff
-.MuiTab-iconWrapper
+.MuiTab-icon
```

### Tabs CSS classes

The following deprecated classes have been removed:

- `flexContainer` — use the `list` class instead
- `flexContainerVertical` — combine the `list` and `vertical` classes instead

```diff
-.MuiTabs-flexContainer
+.MuiTabs-list

-.MuiTabs-flexContainerVertical
+.MuiTabs-list.MuiTabs-vertical
```

### ToggleButtonGroup CSS classes

Use the [toggle-button-group-classes codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#toggle-button-group-classes) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/toggle-button-group-classes <path>
```

The following deprecated `ToggleButtonGroup` CSS classes have been removed:

- `groupedHorizontal` → use `.MuiToggleButtonGroup-horizontal > .MuiToggleButtonGroup-grouped`
- `groupedVertical` → use `.MuiToggleButtonGroup-vertical > .MuiToggleButtonGroup-grouped`

If you were using these deprecated class names as `styleOverrides` keys in your theme, use the `variants` array in the `grouped` override instead:

```diff
 const theme = createTheme({
   components: {
     MuiToggleButtonGroup: {
       styleOverrides: {
-        groupedHorizontal: { borderRadius: 0 },
-        groupedVertical: { borderRadius: 0 },
+        grouped: {
+          variants: [
+            { props: { orientation: 'horizontal' }, style: { borderRadius: 0 } },
+            { props: { orientation: 'vertical' }, style: { borderRadius: 0 } },
+          ],
+        },
       },
     },
   },
 });
```

### TextField props

Use the [text-field-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#text-field-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/text-field-props <path>
```

The following deprecated props have been removed from the `TextField` component:

- `InputProps` → use `slotProps.input`
- `inputProps` → use `slotProps.htmlInput`
- `SelectProps` → use `slotProps.select`
- `InputLabelProps` → use `slotProps.inputLabel`
- `FormHelperTextProps` → use `slotProps.formHelperText`

```diff
 <TextField
-  InputProps={CustomInputProps}
-  inputProps={CustomHtmlInputProps}
-  SelectProps={CustomSelectProps}
-  InputLabelProps={CustomInputLabelProps}
-  FormHelperTextProps={CustomFormHelperTextProps}
+  slotProps={{
+    input: CustomInputProps,
+    htmlInput: CustomHtmlInputProps,
+    select: CustomSelectProps,
+    inputLabel: CustomInputLabelProps,
+    formHelperText: CustomFormHelperTextProps,
+  }}
 />
```

Use the [autocomplete-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#autocomplete-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/autocomplete-props <path>
```

If you render a `TextField` from `Autocomplete`, the `params` shape also changed to match the new `TextField` API:

```diff
 <Autocomplete
   renderInput={(params) => (
     <TextField
       {...params}
-      inputProps={{
-        ...params.inputProps,
-        autoComplete: 'new-password',
+      slotProps={{
+        ...params.slotProps,
+        htmlInput: {
+          ...params.slotProps.htmlInput,
+          autoComplete: 'new-password',
+        },
       }}
     />
   )}
```

### Tooltip props

Use the [tooltip-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#tooltip-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/tooltip-props <path>
```

The following deprecated props have been removed from the `Tooltip` component:

- `components` → use `slots`
- `componentsProps` → use `slotProps`
- `PopperComponent` → use `slots.popper`
- `PopperProps` → use `slotProps.popper`
- `TransitionComponent` → use `slots.transition`
- `TransitionProps` → use `slotProps.transition`

```diff
 <Tooltip
   title="Hello World"
-  components={{ Popper: CustomPopper, Tooltip: CustomTooltip, Transition: CustomTransition, Arrow: CustomArrow }}
-  componentsProps={{ popper: { placement: 'top' }, tooltip: { className: 'custom' }, arrow: { className: 'arrow' } }}
-  PopperComponent={CustomPopper}
-  PopperProps={{ disablePortal: true }}
-  TransitionComponent={CustomTransition}
-  TransitionProps={{ timeout: 500 }}
+  slots={{ popper: CustomPopper, tooltip: CustomTooltip, transition: CustomTransition, arrow: CustomArrow }}
+  slotProps={{
+    popper: { placement: 'top', disablePortal: true },
+    tooltip: { className: 'custom' },
+    transition: { timeout: 500 },
+    arrow: { className: 'arrow' },
+  }}
 />
```

### Typography CSS classes

The deprecated `paragraph` CSS class has been removed.
Use CSS `.MuiTypography-root:where(p)` to apply custom styles for the paragraph element instead:

```diff
-.MuiTypography-paragraph {
-  margin-bottom: 16px;
-}
+.MuiTypography-root:where(p) {
+  margin-bottom: 16px;
+}
```

### Typography props

Use the [typography-props codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#typography-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest deprecations/typography-props <path>
```

The following deprecated props have been removed from the `Typography` component:

- `paragraph` → use the `sx` prop to add a margin bottom instead

```diff
-<Typography paragraph />
+<Typography sx={{ marginBottom: '16px' }} />
```

### System props

Use the [system-props codemod](/material-ui/migration/migrating-from-deprecated-apis/#system-props) below to migrate the code as described in the following section:

```bash
npx @mui/codemod@latest v9.0.0/system-props <path/to/folder>
```

The deprecated system props have been removed from the following components:

- `Box`
- `DialogContentText`
- `Grid`
- `Link`
- `Stack`
- `Typography`
- `TimelineContent`
- `TimelineOppositeContent`

```diff
-<Box mt={2} color="primary.main" />
+<Box sx={{ mt: 2, color: 'primary.main' }} />

-<DialogContentText mt={2} color="text.secondary" />
+<DialogContentText sx={{ mt: 2, color: 'text.secondary' }} />

-<Grid mt={2} mr={1} />
+<Grid sx={{ mt: 2, mr: 1 }} />

-<Link mt={2} color="text.secondary" />
+<Link sx={{ mt: 2, color: 'text.secondary' }} />

-<Stack mt={2} alignItems="center" />
+<Stack sx={{ mt: 2, alignItems: 'center' }} />

-<Typography mt={2} fontWeight="bold" />
+<Typography sx={{ mt: 2, fontWeight: 'bold' }} />

-<TimelineContent mt={2} color="text.secondary" />
+<TimelineContent sx={{ mt: 2, color: 'text.secondary' }} />

-<TimelineOppositeContent mt={2} color="text.secondary" />
+<TimelineOppositeContent sx={{ mt: 2, color: 'text.secondary' }} />
```

This also fixes an issue where props like `color` were consumed by the component instead of being forwarded to the element rendered via the `component` prop:

```jsx
// `color` is now correctly forwarded to Button
<Grid component={Button} color="secondary" variant="contained">
  hello
</Grid>
```
