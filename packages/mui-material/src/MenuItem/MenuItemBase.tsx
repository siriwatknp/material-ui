'use client';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import ButtonBase from '../ButtonBase';
import slotShouldForwardProp from '../styles/slotShouldForwardProp';
import { applyInsetFocusVisible } from '../styles/focusVisible';
import { dividerClasses } from '../Divider';
import { listItemIconClasses } from '../ListItemIcon';
import { listItemTextClasses } from '../ListItemText';

interface MenuItemBaseOwnerState {
  dense: boolean;
  divider: boolean;
  disableGutters: boolean;
}

// `generateUtilityClass` maps these state slugs to the same `Mui-*` class for
// every component name, so one shared layer can select on them for all families.
const selectedClass = 'Mui-selected';
const disabledClass = 'Mui-disabled';
// The classic item highlights through ButtonBase focus tracking (`Mui-focusVisible`),
// the Base UI items through the `data-highlighted` attribute Base UI renders.
// At most one of the two matches in a given family.
const highlightedSelector = '&.Mui-focusVisible, &[data-highlighted]';
const selectedHighlightedSelector = `&.${selectedClass}.Mui-focusVisible, &.${selectedClass}[data-highlighted]`;

/**
 * Shared styled layer for the classic `MenuItem` and the `Menu2*` item family.
 * It carries no theme name: each family wraps it with its own `name`/`slot`
 * so only that family's `styleOverrides` and classes apply.
 *
 * Wrappers must forward `ownerState` (`shouldForwardProp`), because the
 * `variants` below read it. This layer consumes it and keeps it off ButtonBase.
 */
const MenuItemBase = styled(ButtonBase, {
  shouldForwardProp: slotShouldForwardProp,
})<{ ownerState?: (MenuItemBaseOwnerState) | undefined }>(
  memoTheme(({ theme }) => {
    // The focus ring replaces the highlight background.
    const themeRing = Boolean(theme.focusVisible);

    return {
      ...theme.typography.body1,
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      textDecoration: 'none',
      minHeight: 48,
      paddingTop: 6,
      paddingBottom: 6,
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
      '&:hover': {
        textDecoration: 'none',
        backgroundColor: (theme.vars || theme).palette.action.hover,
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: 'transparent',
        },
      },
      [`&.${selectedClass}`]: {
        backgroundColor: theme.alpha(
          (theme.vars || theme).palette.primary.main,
          (theme.vars || theme).palette.action.selectedOpacity,
        ),
      },
      ...(!themeRing && {
        [selectedHighlightedSelector]: {
          backgroundColor: theme.alpha(
            (theme.vars || theme).palette.primary.main,
            `${(theme.vars || theme).palette.action.selectedOpacity} + ${
              (theme.vars || theme).palette.action.focusOpacity
            }`,
          ),
        },
      }),
      [`&.${selectedClass}:hover`]: {
        backgroundColor: theme.alpha(
          (theme.vars || theme).palette.primary.main,
          `${(theme.vars || theme).palette.action.selectedOpacity} + ${
            (theme.vars || theme).palette.action.hoverOpacity
          }`,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: theme.alpha(
            (theme.vars || theme).palette.primary.main,
            (theme.vars || theme).palette.action.selectedOpacity,
          ),
        },
      },
      // Inset the ring: a scrolling Menu/MenuList clips an outset ring.
      ...(themeRing && applyInsetFocusVisible(1)),
      ...(!themeRing && {
        [highlightedSelector]: {
          backgroundColor: (theme.vars || theme).palette.action.focus,
        },
      }),
      [`&.${disabledClass}`]: {
        opacity: (theme.vars || theme).palette.action.disabledOpacity,
      },
      [`& + .${dividerClasses.root}`]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
      [`& + .${dividerClasses.inset}`]: {
        marginLeft: 52,
      },
      [`& .${listItemTextClasses.root}`]: {
        marginTop: 0,
        marginBottom: 0,
      },
      [`& .${listItemTextClasses.inset}`]: {
        paddingLeft: 36,
      },
      [`& .${listItemIconClasses.root}`]: {
        minWidth: 36,
      },
      variants: [
        {
          props: ({ ownerState }: { ownerState?: (MenuItemBaseOwnerState) | undefined }) => !ownerState?.disableGutters,
          style: {
            paddingLeft: 16,
            paddingRight: 16,
          },
        },
        {
          props: ({ ownerState }: { ownerState?: (MenuItemBaseOwnerState) | undefined }) => Boolean(ownerState?.divider),
          style: {
            borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
            backgroundClip: 'padding-box',
          },
        },
        {
          props: ({ ownerState }: { ownerState?: (MenuItemBaseOwnerState) | undefined }) => !ownerState?.dense,
          style: {
            [theme.breakpoints.up('sm')]: {
              minHeight: 'auto',
            },
          },
        },
        {
          props: ({ ownerState }: { ownerState?: (MenuItemBaseOwnerState) | undefined }) => Boolean(ownerState?.dense),
          style: {
            minHeight: 32, // https://m2.material.io/components/menus#specs > Dense
            paddingTop: 4,
            paddingBottom: 4,
            ...theme.typography.body2,
            [`& .${listItemIconClasses.root} svg`]: {
              fontSize: '1.25rem',
            },
          },
        },
      ],
    };
  }),
);

export default MenuItemBase;
