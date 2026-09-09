'use client';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';

/**
 * Nameless shared styled layer for the checkbox and radio item indicators.
 * Each indicator wraps it with its own `name`/`slot`, keeping its theme key.
 *
 * The indicators render the same icons as Checkbox and Radio, so they take the
 * same colors: `text.secondary` until checked, then `primary.main`.
 */
const Menu2IndicatorBase = styled('span')(
  memoTheme(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    color: (theme.vars || theme).palette.text.secondary,
    '&[data-checked]': {
      color: (theme.vars || theme).palette.primary.main,
    },
  })),
);

export default Menu2IndicatorBase;
