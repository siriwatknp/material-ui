---
productId: material-ui
title: React Menu v2 component
components: Menu2, Menu2CheckboxItem, Menu2CheckboxItemIndicator, Menu2Group, Menu2GroupLabel, Menu2Item, Menu2LinkItem, Menu2RadioGroup, Menu2RadioItem, Menu2RadioItemIndicator, Menu2Separator, Menu2Submenu
githubLabel: 'scope: menu'
materialDesign: https://m2.material.io/components/menus
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
githubSource: packages/mui-material/src/Unstable_Menu2
---

# Menu v2

<p class="description">Menus display a list of choices on temporary surfaces. Menu v2 adds submenus, checkbox and radio items, and grouping.</p>

{{"component": "@mui/internal-core-docs/ComponentLinkHeader"}}

:::warning
Menu v2 is published as an unstable component, so it's imported from the `Unstable_Menu2` subpaths and its API can still change in a minor release.

The [current Menu](/material-ui/react-menu/) is unaffected—it keeps working exactly as before. Menu v2 becomes the canonical `Menu` in the next major version.
:::

## Introduction

Menu v2 is a set of components that compose into a menu:

- **Menu 2**: the trigger and the menu surface. One component configures both.
- **Item**: an option for users to select.
- **Submenu**: a nested menu, opened from an item.
- **Checkbox Item** and **Radio Item**: items that carry a checked state.
- **Group**, **Group Label**, and **Separator**: structure within a menu.
- **Link Item**: an item that navigates.

```jsx
import Menu2 from '@mui/material/Unstable_Menu2';
import Menu2Item from '@mui/material/Unstable_Menu2Item';
```

Each component lives in its own subpath and is exported as a default export, so you can drop the `Unstable_` prefix from the local name and your JSX already matches the future stable API.

## Why a new menu component

Submenus have been [the most requested Menu feature since 2018](https://github.com/mui/material-ui/issues/11723), but they aren't possible in the current Menu: every open menu is a full `Modal`, and nesting modals breaks the backdrop, the focus traps, the arrow keys, and the accessibility tree all at once.

Menu v2 is built on [Base UI](https://base-ui.com/react/components/menu), which already solves that behavior. Material UI supplies the visuals, the theming, and the API.

- **Nothing extra to install.** Base UI is a dependency of `@mui/material`, the way `@popperjs/core` is. You never import from it, and apps that don't use Menu v2 don't pay for it.
- **No change to existing code.** The current Menu is untouched and isn't deprecated. Both can coexist, so you can adopt Menu v2 one menu at a time.
- **The same theming you already use.** `sx`, `classes`, `slots`/`slotProps`, and theme `defaultProps`/`styleOverrides`/`variants`, under `MuiMenu2*` keys.

Menu v2 becomes the canonical `Menu` in the next major version, at which point today's Menu is renamed `MenuLegacy` and a codemod handles the rename.

For the full reasoning and a step-by-step guide, see [Upgrade to Menu v2](/material-ui/migration/upgrade-to-menu-v2/).

## Major changes

Beyond submenus, Menu v2 adds checkbox and radio items, groups with labels, link items, per-level typeahead, and collision-aware positioning that flips and follows the anchor. The trigger is part of the component, so there's no anchor state to manage and no ARIA attributes to wire up.

Three changes are worth knowing before you start:

- **Opening with a pointer highlights nothing**, so pressing Enter can't fire an item the user didn't choose. Opening with the keyboard highlights the first item. `variant="selectedMenu"` is gone—use radio items to show a current value.
- **`onClose` becomes `onOpenChange`**, and positioning moves from `anchorOrigin`/`transformOrigin` to `side`/`align`. Transitions are CSS instead of a transition component.
- **Disabled items stay focusable** and sibling content stays in the accessibility tree, both per the [WAI-ARIA menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).

[Upgrade to Menu v2](/material-ui/migration/upgrade-to-menu-v2/) covers every prop mapping, the removed props, and the full list of behavior changes.

## Basic menu

Pass the element that opens the menu to the `trigger` prop, and the items as children. There's no anchor state to manage and no ARIA attributes to wire up.

{{"demo": "BasicMenu2.js"}}

`trigger` accepts either content or an element. Content renders inside the default trigger, which is a [Button](/material-ui/react-button/):

```jsx
<Menu2 trigger="Dashboard">
```

An element is used as-is, with the trigger behavior merged into it, so you keep your own component:

```jsx
<Menu2 trigger={<IconButton aria-label="More actions"><MoreVertIcon /></IconButton>}>
```

To configure the default trigger instead of replacing it, use `slotProps.trigger`—it takes Button props:

```jsx
<Menu2
  trigger="Dashboard"
  slotProps={{ trigger: { variant: 'contained', endIcon: <KeyboardArrowDownIcon /> } }}
>
```

Selecting an item closes the menu. Set `closeOnClick={false}` on an item to keep it open.

## Submenu

Nest a `Menu2Submenu` anywhere in the item list. Its `trigger` prop is the label of the item that opens it, and its children are the submenu's own items—the same shape as the root menu, one level down.

Submenus open on hover after a short delay as well as on click, flip when they run out of room, and can nest to any depth. Escape closes the innermost submenu and returns focus to its trigger.

{{"demo": "SubmenuMenu2.js"}}

Unlike the root menu, a submenu's `trigger` takes content rather than an element: a submenu trigger is already a menu item, so passing a `Menu2Item` would nest an item inside an item. Use `slots.trigger` to swap the component.

Hover behavior is configured on the trigger slot:

```jsx
<Menu2Submenu
  trigger="Share"
  slotProps={{ trigger: { openOnHover: true, delay: 100, closeDelay: 0 } }}
>
```

By default Escape closes only the submenu. Pass `closeParentOnEsc` to close the whole tree.

:::warning
While a submenu is open, Base UI keeps focus-guard elements next to its trigger so the tab order stays correct. CSS that relies on sibling selectors (`+`, `~`, `:last-child`) near a submenu trigger won't match what you expect—style each part directly instead. The guards carry a `data-base-ui-focus-guard` attribute.
:::

## Icon menu

Compose the same list primitives you use with the current Menu—`ListItemIcon`, `ListItemText`, and `Typography` for a shortcut hint.

{{"demo": "IconMenu2.js"}}

## Dense menu

Use the `dense` prop on items to reduce padding and text size.

{{"demo": "DenseMenu2.js"}}

## Checkbox and radio items

`Menu2CheckboxItem` renders `role="menuitemcheckbox"` with `aria-checked` and its own indicator—there's no separate indicator component to add.

Toggling an item doesn't close the menu, so several options can be changed in one visit.

{{"demo": "CheckboxMenu2.js"}}

For a single choice within a set, wrap `Menu2RadioItem` components in a `Menu2RadioGroup`:

{{"demo": "RadioMenu2.js"}}

Both components report changes through `onChange(event, value, eventDetails)`, and both accept an uncontrolled counterpart (`defaultChecked` and `defaultValue`). To replace the tick or the dot, pass your own component to `slots.indicator`.

:::info
Use radio items to show a current value. The `selected` prop still exists on `Menu2Item`, but it's visual only.
:::

## Grouped menu

`Menu2Group` and `Menu2GroupLabel` label a set of related items, and connect the label to the group with `aria-labelledby`. Use `Menu2Separator` between groups.

{{"demo": "GroupedMenu2.js"}}

## Link items

`Menu2LinkItem` renders a real anchor with `role="menuitem"`, so links behave like links—middle click, right click, and keyboard activation all work.

{{"demo": "LinkItemsMenu2.js"}}

## Positioned menu

`side` and `align` place the menu relative to its anchor, and `sideOffset` and `alignOffset` nudge it. The defaults are `side="bottom"` and `align="start"`.

Use the logical `inline-start` and `inline-end` sides to get the correct direction in RTL automatically.

{{"demo": "PositionedMenu2.js"}}

The menu flips when it would collide with the edge of its container, and follows its anchor on scroll and resize. Pass `disableAnchorTracking` to opt out.

## Controlled menu

Omit `trigger` and drive the menu with `open`, `onOpenChange`, and `anchor` to keep the pattern you use today with `anchorEl`.

{{"demo": "ControlledMenu2.js"}}

`onOpenChange` receives the reason the menu is closing—`escape-key`, `outside-press`, `focus-out`, `trigger-press`, or `item-press`—along with the native event, and lets you cancel the change:

```jsx
<Menu2
  open={open}
  onOpenChange={(nextOpen, eventDetails) => {
    if (!nextOpen && eventDetails.reason === 'outside-press') {
      eventDetails.cancel();
      return;
    }
    setOpen(nextOpen);
  }}
>
```

## Max height menu

The menu limits its height to the space available and scrolls internally. Set an explicit limit through the `paper` slot.

Type while the menu is open to jump to an item.

{{"demo": "LongMenu2.js"}}

## Context menu

Pass a virtual anchor to place the menu at the pointer.

{{"demo": "ContextMenu2.js"}}

:::warning
A menu with no trigger has no element to return focus to when it closes. Always pass `finalFocus` pointing at the surface the user invoked, otherwise focus can land on an unrelated element.
:::

## Customization

`sx` and `styled` target the popup, and each part keeps its own class hook, so you can reach the surface and the items from one place.

{{"demo": "CustomizedMenu2.js"}}

The slots are `portal`, `positioner`, `popup`, `paper`, `list`, `backdrop`, and `trigger`. `elevation` is a top-level prop that forwards to the `paper` slot, so the common case doesn't need `slotProps`.

Theme-level customization uses two keys—`MuiMenu2` and `MuiMenu2Submenu`:

```js
const theme = createTheme({
  components: {
    MuiMenu2: {
      defaultProps: { sideOffset: 8 },
      styleOverrides: {
        paper: { borderRadius: 12 },
      },
    },
    MuiMenu2Item: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
});
```

### Transitions

Menu v2 animates with CSS rather than a transition component. The default matches the current `Grow`, and stops under `prefers-reduced-motion`. Override it through the `popup` slot:

```jsx
<Menu2 trigger="Options" slotProps={{ popup: { sx: { transition: 'none' } } }}>
```

The popup carries `data-starting-style` and `data-ending-style` attributes while it enters and leaves, which is what you hook your own animation onto.

### Backdrop

There's no backdrop by default—the menu closes on an outside press without one. Opt in through the `backdrop` slot when you want to dim the page:

```jsx
<Menu2
  trigger="Options"
  slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0, 0, 0, 0.5)' } } }}
>
```

## Accessibility

Menu v2 follows the [WAI-ARIA menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/). The trigger, the roles, the keyboard behavior, focus management, and dismissal are all handled for you:

- The trigger gets `aria-haspopup`, `aria-expanded`, and `aria-controls`.
- Arrow keys move between items and respect RTL. Home and End jump to the ends.
- Typeahead matches items by their text content, or by the `label` prop when the content isn't plain text.
- Disabled items stay focusable and are announced as disabled, so they aren't silently skipped.
- Escape closes one level at a time and returns focus to the trigger of that level.

Two things stay your responsibility:

- **Label an icon-only trigger.** Pass `aria-label` to the element you supply as `trigger`.
- **Keep custom item content readable.** Anything you compose inside an item—icons, secondary text, shortcut hints—needs sufficient contrast on its own.
