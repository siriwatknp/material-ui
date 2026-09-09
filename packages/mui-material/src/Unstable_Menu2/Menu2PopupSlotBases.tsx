'use client';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import Paper from '../Paper';
import List from '../List';

/**
 * Nameless shared styled layers for the two collapsed popups. `Menu2Popup` and
 * `Menu2SubmenuPopup` wrap them with their own `name`/`slot` (`MuiMenu2`,
 * `MuiMenu2Submenu`), so each popup keeps its own theme key and classes.
 */

// The classic Modal root carries `zIndex.modal`. Base UI sets no z-index, so
// the positioner, the positioned element, carries it here.
export const Menu2PositionerBase = styled('div')(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.modal,
  })),
);

export const Menu2PaperBase = styled(Paper)({
  outline: 0,
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: 'touch',
  // In the classic Menu the Paper sits in a full-viewport Modal, so its
  // `maxHeight: calc(100% - 96px)` means "viewport minus 96px". Inside the
  // content-sized Base UI popup that percentage resolves against the popup
  // itself (browser-dependent), clipping the end of the menu. Use the
  // collision-aware space provided by the positioner instead.
  maxHeight: 'min(calc(100vh - 96px), var(--available-height))',
  overflowY: 'auto',
  // Grow animates the popup itself, where Base UI observes animation
  // completion. The positioner supplies the origin so the surface grows
  // from its anchor.
  transformOrigin: 'var(--transform-origin)',
});

export const Menu2ListBase = styled(List)({
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0,
});
