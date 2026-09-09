'use client';
import { styled } from '../zero-styled';
import slotShouldForwardProp from '../styles/slotShouldForwardProp';
import MenuItemBase from '../MenuItem/MenuItemBase';

/**
 * Shared styled layer for the `Menu2*` item family, on top of the classic
 * `MenuItemBase`. It carries no theme name: each part wraps it with its own
 * `name`/`slot`. It forwards `ownerState` so the base `variants` still match.
 */
const Menu2ItemBase = styled(MenuItemBase, {
  shouldForwardProp: (prop: string) => slotShouldForwardProp(prop) || prop === 'ownerState',
})({
  // The Base UI parts render as a div, so they reset the button styles that
  // ButtonBase normally gets from the browser button element.
  WebkitTapHighlightColor: 'transparent',
  backgroundColor: 'transparent',
  border: 0,
  margin: 0,
  borderRadius: 0,
  color: 'inherit',
  cursor: 'pointer',
  userSelect: 'none',
  verticalAlign: 'middle',
  MozAppearance: 'none',
  WebkitAppearance: 'none',
  outline: 0,
  '&::-moz-focus-inner': {
    borderStyle: 'none',
  },
  // The classic item relies on the parent list for this; the Base UI items
  // own it, because a disabled item stays focusable per the menu pattern.
  '&.Mui-disabled': {
    pointerEvents: 'none',
    cursor: 'default',
  },
});

export default Menu2ItemBase;
