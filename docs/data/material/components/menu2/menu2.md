---
productId: material-ui
title: React Menu v2 component
githubLabel: 'scope: menu'
materialDesign: https://m2.material.io/components/menus
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
githubSource: packages/mui-material/src/Unstable_Menu2
---

# Menu v2

<p class="description">Menus display a list of choices on temporary surfaces. Menu v2 adds submenus, checkbox and radio items, and grouping.</p>

{{"component": "@mui/internal-core-docs/ComponentLinkHeader"}}

:::warning
Menu v2 is an unstable component.
Import it from the `Unstable_Menu2` subpaths.
Its API can change in a minor release.

The [current Menu](/material-ui/react-menu/) doesn't change, and you can use both components in the same app.
:::

## Introduction

Menu v2 is a set of components that compose into a menu:

- **Menu**: the trigger and the menu surface. One component configures both.
- **Item**: an option your users select.
- **Link Item**: an item that navigates.
- **Checkbox Item**, **Radio Group**, and **Radio Item**: items with a checked state.
- **Submenu** and **Submenu Trigger**: a nested menu and the item that opens it.
- **Group**, **Group Label**, and **Separator**: the structure in a menu.

```jsx
import Menu from '@mui/material/Unstable_Menu2';
import MenuItem from '@mui/material/Unstable_Menu2Item';
```

Each component is the default export of its own subpath.
These examples use local names such as `Menu` and `MenuItem` for the components imported from `Unstable_Menu2` subpaths.
The import paths, theme keys, and CSS classes keep their `Menu2` names.

## Why a new menu component

Submenus are [one of the most requested Menu features since 2018](https://github.com/mui/material-ui/issues/11723), but the current modal-based Menu can't support them.
Menu v2 uses [Base UI](https://base-ui.com/react/components/menu) to provide more menu building blocks and improve keyboard and screen reader support:

- **Nested menus** coordinate focus and keyboard navigation. Positioning follows the anchor and flips to avoid collisions.
- **Checkbox and radio items**, labeled groups, and link items provide built-in roles and ARIA attributes.
- **Disabled items stay focusable**, and content outside the menu remains available to screen readers.
- **The trigger prop** handles anchor state and ARIA attributes. Opening with a pointer highlights no item; opening with the keyboard highlights the first item.

Material UI supplies the styles and theming.
Base UI is included in `@mui/material`; you don't install anything else, and apps that don't import Menu v2 don't bundle it.

See [Upgrade to Menu v2](/material-ui/migration/upgrade-to-menu-v2/) for the architecture, prop mappings, and behavior changes.

## Basic menu

Pass the element that opens the menu to the `trigger` prop, and the items as children.

{{"demo": "BasicMenu2.js"}}

Selecting an item closes the menu.
Set `closeOnClick={false}` on an item to keep it open.

:::warning
A custom trigger component must forward props and ref to the element it renders, the same as [Tooltip](/material-ui/react-tooltip/), or the menu doesn't open.
Set `slotProps.trigger.nativeButton` to `false` when it doesn't render a native `<button>`.
:::

## Account menu

The trigger can be a composed element, such as an `IconButton` in a `Tooltip`.
`align="end"` aligns the menu with the end of the trigger.

{{"demo": "AccountMenu2.js"}}

## Submenu

Nest a `MenuSubmenu` in the item list, and pass a `MenuSubmenuTrigger` to its `trigger` prop.
The children of the submenu are its items, the same shape as the root menu one level down.

{{"demo": "SubmenuMenu2.js"}}

A submenu opens on hover and with the ArrowRight key, or ArrowLeft in right-to-left text.
Submenus nest to any depth and flip when they run out of room.
Escape closes the innermost submenu and returns focus to its trigger.

## Icon menu

Compose the same list primitives that you use with the current Menu: `ListItemIcon`, `ListItemText`, and `Typography` for a shortcut hint.

{{"demo": "IconMenu2.js"}}

## Dense menu

Set `dense` on the `list` slot to make all the items compact.
An item can also set its own `dense` prop.

{{"demo": "DenseMenu2.js"}}

## Checkbox and radio items

`MenuCheckboxItem` renders `role="menuitemcheckbox"` with its own indicator, and `MenuRadioItem` components in a `MenuRadioGroup` give a single choice in a set.
A click on a checkbox item doesn't close the menu, so your users can change several options in one visit.

{{"demo": "CheckboxRadioMenu2.js"}}

Both report the new value in the first callback argument: `onCheckedChange(checked, eventDetails)` and `onValueChange(value, eventDetails)`.
For an uncontrolled item or group, use `defaultChecked` or `defaultValue`.
To change the indicator icons, see [Checkbox and radio indicators](#checkbox-and-radio-indicators).

:::info
Menu v2 items do not have a `selected` prop.
Use checkbox or radio items for checked state.
:::

## Composed menu

The parts compose freely: checkbox items with shortcut hints, a submenu with a radio group, icon items, and a disabled item.

{{"demo": "ComposedMenu2.js"}}

## Grouped menu

`MenuGroup` and `MenuGroupLabel` label a set of related items.
The group refers to its label with `aria-labelledby`.
Use `MenuSeparator` between groups.

{{"demo": "GroupedMenu2.js"}}

## Link items

`MenuLinkItem` renders a real anchor with `role="menuitem"`, so middle-click, right-click, and keyboard activation behave like a link.

{{"demo": "LinkItemsMenu2.js"}}

A link item doesn't close the menu on click by default.
Set `closeOnClick` to close it, for example with client-side routing.

:::warning
Unlike a classic `MenuItem` with `href`, `MenuLinkItem` does not support `disabled`.
:::

## Positioned menu

`side` and `align` place the menu relative to its anchor, and `sideOffset` and `alignOffset` move it.
The defaults are `side="bottom"` and `align="start"`.
Use the logical `inline-start` and `inline-end` sides to get the correct direction in right-to-left text.

{{"demo": "PositionedMenu2.js"}}

The menu flips when it collides with the edge of its container, and it follows its anchor on scroll and resize.

## Open on hover

Set `openOnHover` to open the menu when the pointer rests on the trigger.

{{"demo": "HoverMenu2.js"}}

A menu that opens on hover isn't modal, so the rest of the page stays interactive.

## Controlled menu

Pass `open` and `onOpenChange` to control the open state.
The trigger still sets the ARIA attributes and receives focus when the menu closes.

{{"demo": "ControlledMenu2.js"}}

### Keep the menu open

`onOpenChange` fires before the menu closes, with the reason for the change in `eventDetails.reason`.
Call `eventDetails.cancel()` to veto a close, for example on an outside press.
This works for controlled and uncontrolled menus alike:

```jsx
<Menu
  trigger={<Button>Options</Button>}
  onOpenChange={(open, eventDetails) => {
    if (!open && eventDetails.reason === 'outside-press') {
      eventDetails.cancel();
    }
  }}
>
```

### Without a trigger

Omit `trigger` and pass `anchor` to position the menu against an element that you control, the same as `anchorEl` in the current Menu.
The menu can't connect to that element, so you do the wiring:

- Add `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls` to the element. Set the matching `id` on the menu with `slotProps.paper`.
- Give the menu an accessible name with `aria-label` or `aria-labelledby`.
- Pass `finalFocus` to return focus to the element when the menu closes. Otherwise, focus can move to an unrelated element.

## Max height menu

The menu limits its height to the viewport and to the space available at the anchor, and scrolls its content.
Set a smaller limit on the `paper` slot.

{{"demo": "LongMenu2.js"}}

## Customization

Style the menu with `sx`, the slots, or the `MuiMenu2*` theme keys.
See the [theme components](/material-ui/customization/theme-components/) guide for `defaultProps` and `styleOverrides`.

### Slots

The slots are `root`, `backdrop`, `paper`, `list`, and `transition`.
`elevation` is a top-level prop for the `paper` slot.
Use `slotProps.paper` for the ref and other attributes on the element with `role="menu"`.
`MenuSubmenuTrigger` adds an `indicator` slot for the arrow; set `slots.indicator` to `null` to remove it and keep another visible cue that the item opens a submenu.

This demo wraps Menu in `styled()` to set defaults such as `elevation` and `sideOffset`, and styles the surface and the items through their class selectors:

{{"demo": "CustomizedMenu2.js"}}

### Trigger

The trigger isn't a slot, because you supply the element.
Style it directly.
It has the `.MuiMenu2Trigger-root` class, and the global `.Mui-open` class while the menu is open, so a state selector reads `.MuiMenu2Trigger-root.Mui-open`.
`slotProps.trigger` accepts only `nativeButton`, `className`, and `ref`.

While a menu or a submenu is open, Base UI renders hidden `span` elements next to its trigger.
They keep the tab order and the accessibility tree correct.
The focus guards among them have a `data-base-ui-focus-guard` attribute.

:::warning
CSS sibling selectors (`+`, `~`, `:last-child`) near a trigger can match these hidden elements.
Style each part directly instead.
:::

For menus directly inside a `Stack`, set `useFlexGap` to use CSS gap instead of sibling margins.
This prevents the trigger from moving when a focus guard is inserted before it.

### Checkbox and radio indicators

Use `icon` and `checkedIcon` on `MenuCheckboxItem` and `MenuRadioItem` to change the unchecked and checked icons.
Custom icons keep their own size.

{{"demo": "IndicatorIconsMenu2.js"}}

### Transitions

The menu uses the `Grow` transition, the same as the current Menu.
With the default `transitionDuration="auto"`, the duration depends on the height of the menu.
Pass a different transition component to `slots.transition`, and its props to `slotProps.transition`:

{{"demo": "FadeMenu2.js"}}

Grow, Fade, and Zoom work with Menu v2.
A custom transition must forward its child's props and ref, animate that same popup element, and add no DOM wrapper.
The animation must start in time for Base UI to detect it.
Test other transitions before use.

The adapter controls `in`, `appear`, `mountOnEnter`, and `unmountOnExit`.
Base UI controls mounting and can unmount the transition before its completion timer fires.

:::warning
Use `onOpenChangeComplete(open)` for completion, not the transition's `onEntered` or `onExited`.
:::

Set `transitionDuration={0}` to remove the animation.
To animate with CSS, set `slots.transition` to `null`.
The menu surface has the `data-starting-style` attribute while it enters and the `data-ending-style` attribute while it leaves:

```jsx
<Menu
  trigger={<Button>Options</Button>}
  slots={{ transition: null }}
  slotProps={{
    paper: {
      sx: {
        transition: 'opacity 150ms',
        '&[data-starting-style], &[data-ending-style]': { opacity: 0 },
      },
    },
  }}
>
```

`Grow` and the other Material UI transitions follow [`theme.motion.reducedMotion`](/material-ui/customization/transitions/#reduced-motion).
CSS animations need their own reduced-motion handling.

### Backdrop

Base UI uses an internal, transparent backdrop for modal menus.
This layer is absent when a menu opens on hover or has `modal={false}`.

The optional visual backdrop is separate, and Menu v2 doesn't render it by default.
Set `slots.backdrop` or `slotProps.backdrop` to render it.
Its default styles are transparent and do not capture pointer events.
To dim the page:

```jsx
<Menu
  trigger={<Button>Options</Button>}
  slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0, 0, 0, 0.5)' } } }}
>
```

Set `slots={{ backdrop: null }}` to omit this layer, including when the theme supplies backdrop slot props.
This does not change modal behavior.
Base UI does not hide this optional layer when the menu opens on hover.
Submenus have no backdrop slot.

## TypeScript

:::warning
TypeScript apps that use Menu v2 require TypeScript 5.0 or later.
Apps that use only existing Material UI components can continue to use TypeScript 4.9.
:::

Import the theme augmentation once in your app to type all `MuiMenu2*` theme keys.
Component imports do not add these types:

```ts
import type {} from '@mui/material/Unstable_Menu2/themeAugmentation';
```

This import adds no runtime code.
The separate module keeps Base UI types out of apps that do not use Menu v2.

## Accessibility

Menu v2 follows the [WAI-ARIA menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).
It handles the trigger, the roles, the keyboard behavior, focus management, and dismissal:

- The trigger gets `aria-haspopup`, `aria-expanded`, and `aria-controls`.
- Arrow keys move between items and respect right-to-left text. Home and End move to the first and the last item.
- Typeahead matches items by their text content, or by the `label` prop when the content isn't plain text.
- Disabled items stay focusable, and screen readers announce them as disabled.
- Escape closes one level at a time and returns focus to the trigger of that level.

The menu takes its accessible name from the trigger.
`aria-label` or `aria-labelledby` on `Menu` replaces it, and an explicit `aria-labelledby` wins over `aria-label`.
Matching attributes on `slotProps.paper` take precedence over the top-level ones.

Two things stay your responsibility:

- **Label an icon-only trigger.** Pass `aria-label` to the element that you supply as `trigger`.
- **Keep custom item content readable.** Icons, secondary text, and shortcut hints in an item need sufficient contrast.
