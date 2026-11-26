'use client';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';

export const menu2StartColumnStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  minWidth: 36,
} as const;

/**
 * @ignore - internal component.
 */
export const Menu2ItemStartAdornment = styled('span', {
  name: 'MuiMenu2Item',
  slot: 'startAdornment',
})(
  memoTheme(({ theme }) => ({
    ...menu2StartColumnStyles,
    color: (theme.vars || theme).palette.action.active,
  })),
);

/**
 * @ignore - internal component.
 */
export const Menu2ItemEndAdornment = styled('span', {
  name: 'MuiMenu2Item',
  slot: 'endAdornment',
})(
  memoTheme(({ theme }) => ({
    ...theme.typography.body2,
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: 'auto',
    paddingLeft: 16,
    color: (theme.vars || theme).palette.text.secondary,
  })),
);
