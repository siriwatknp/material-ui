'use client';
import * as React from 'react';
import clsx from 'clsx';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import type { SlotProps } from '../utils/types';
import type { Menu2SlotRender } from './menu2Utils';
import { menu2StartColumnStyles } from './Menu2ItemAdornment';

// Merge the icon classes and default to the small size, as Checkbox and Radio do.
export function getMenu2IndicatorIcon(icon: React.ReactNode, className: string) {
  if (
    !React.isValidElement<{ className?: string | undefined; fontSize?: string | undefined }>(icon)
  ) {
    return icon;
  }
  return React.cloneElement(icon, {
    className: clsx(className, icon.props.className),
    fontSize: icon.props.fontSize ?? 'small',
  });
}

// Each item supplies the theme overrides for its indicator slot.
/**
 * @ignore - internal component.
 */
const Menu2IndicatorBase = styled('span', { slot: 'root' })(
  memoTheme(({ theme }) => ({
    ...menu2StartColumnStyles,
    // Match Checkbox and Radio colors.
    color: (theme.vars || theme).palette.text.secondary,
    '&[data-checked]': {
      color: (theme.vars || theme).palette.primary.main,
    },
  })),
);

interface IndicatorSlotProps<State> {
  /**
   * Whether to keep the indicator mounted when the item is not checked.
   * @default true
   */
  keepMounted?: boolean | undefined;
  /**
   * The element to render, or a function that returns it. The indicator styles stay.
   */
  render?: Menu2SlotRender<State> | undefined;
  component?: never | undefined;
}

export type Menu2IndicatorSlotProps<OwnerState, State> = SlotProps<
  'span',
  IndicatorSlotProps<State>,
  OwnerState
>;

export default Menu2IndicatorBase;
