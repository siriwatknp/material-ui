'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import getValidReactChildren from '@mui/utils/getValidReactChildren';
import capitalize from '../utils/capitalize';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import createSimplePaletteValueFilter from '../utils/createSimplePaletteValueFilter';
import { useDefaultProps } from '../DefaultPropsProvider';
import iconButtonClasses, { getIconButtonUtilityClass } from '../IconButton/iconButtonClasses';
import buttonGroupClasses, { getButtonGroupUtilityClass } from './buttonGroupClasses';
import ButtonGroupContext from './ButtonGroupContext';
import ButtonGroupButtonContext from './ButtonGroupButtonContext';

// `IconButton` children are styled to look like `Button`s. The selector is one class more specific
// than `IconButton`'s own styles, but less specific than the position (first/middle/last) styles.
const iconButtonSelector = `& .${iconButtonClasses.root}`;
const iconButtonColorSelector = (color) =>
  `${iconButtonSelector}.${getIconButtonUtilityClass(`color${capitalize(color)}`)}`;
// The color styles above set `borderColor`, so the divider between two buttons has to be hidden
// at the same specificity.
const iconButtonDividerSelector = `& .${buttonGroupClasses.firstButton}.${iconButtonClasses.root},& .${buttonGroupClasses.middleButton}.${iconButtonClasses.root}`;
// The icon matches the size of a `Button` icon, and the padding makes the button as tall as a
// `Button` of the same size, e.g. a medium `Button` is 36.5px tall: (36.5 - 20) / 2 = 8.25.
const iconButtonMetrics = {
  small: { padding: 6.375, fontSize: 18 },
  medium: { padding: 8.25, fontSize: 20 },
  large: { padding: 10.125, fontSize: 22 },
};

const iconButtonSizeStyles = (theme, borderWidth = 0) =>
  Object.fromEntries(
    Object.entries(iconButtonMetrics).map(([size, { padding, fontSize }]) => [
      `${iconButtonSelector}.${getIconButtonUtilityClass(`size${capitalize(size)}`)}`,
      {
        padding: padding - borderWidth,
        fontSize: theme.typography.pxToRem(fontSize),
        // the icon does not inherit the font size, `Button` sizes its icons the same way
        '& > *:nth-of-type(1)': {
          fontSize: theme.typography.pxToRem(fontSize),
        },
      },
    ]),
  );

const iconButtonColorStyles = (theme, getStyle) =>
  Object.fromEntries(
    Object.entries(theme.palette)
      .filter(createSimplePaletteValueFilter())
      .map(([color]) => [iconButtonColorSelector(color), getStyle(color)]),
  );

// Same values as the `Button` contained styles for `color="inherit"`.
const getInheritContainedBg = (theme) => {
  if (theme.vars) {
    return theme.vars.palette.Button.inheritContainedBg;
  }
  return theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[800];
};

const getInheritContainedHoverBg = (theme) => {
  if (theme.vars) {
    return theme.vars.palette.Button.inheritContainedHoverBg;
  }
  return theme.palette.mode === 'light' ? theme.palette.grey.A100 : theme.palette.grey[700];
};

// Must be declared after the color styles so that they win, and before the position styles so
// that a disabled group still draws its dividers.
const iconButtonStateStyles = (theme, disabledStyle) => ({
  [`${iconButtonSelector}.${iconButtonClasses.disabled}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    ...disabledStyle,
  },
  [`${iconButtonSelector}.${iconButtonClasses.loading}`]: {
    color: 'transparent',
  },
});

const overridesResolver = (props, styles) => {
  const { ownerState } = props;

  return [
    { [`& .${buttonGroupClasses.grouped}`]: styles.grouped },
    {
      [`& .${buttonGroupClasses.firstButton}`]: styles.firstButton,
    },
    {
      [`& .${buttonGroupClasses.lastButton}`]: styles.lastButton,
    },
    {
      [`& .${buttonGroupClasses.middleButton}`]: styles.middleButton,
    },
    styles.root,
    styles[ownerState.variant],
    ownerState.disableElevation === true && styles.disableElevation,
    ownerState.fullWidth && styles.fullWidth,
    ownerState.orientation === 'vertical' && styles.vertical,
  ];
};

const useUtilityClasses = (ownerState) => {
  const { classes, color, disabled, disableElevation, fullWidth, orientation, variant } =
    ownerState;

  const slots = {
    root: [
      'root',
      variant,
      orientation,
      fullWidth && 'fullWidth',
      disableElevation && 'disableElevation',
      `color${capitalize(color)}`,
    ],
    grouped: ['grouped', disabled && 'disabled'],
    firstButton: ['firstButton'],
    lastButton: ['lastButton'],
    middleButton: ['middleButton'],
  };

  return composeClasses(slots, getButtonGroupUtilityClass, classes);
};

const ButtonGroupRoot = styled('div', {
  name: 'MuiButtonGroup',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    display: 'inline-flex',
    borderRadius: (theme.vars || theme).shape.borderRadius,
    variants: [
      {
        props: { variant: 'contained' },
        style: {
          boxShadow: (theme.vars || theme).shadows[2],
          [`& .${buttonGroupClasses.grouped}`]: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      {
        props: { disableElevation: true },
        style: {
          boxShadow: 'none',
        },
      },
      {
        props: { fullWidth: true },
        style: {
          width: '100%',
          [iconButtonSelector]: {
            flex: '1 1 auto',
          },
        },
      },
      {
        props: { orientation: 'vertical' },
        style: {
          flexDirection: 'column',
          [`& .${buttonGroupClasses.lastButton},& .${buttonGroupClasses.middleButton}`]: {
            borderTopRightRadius: 0,
            borderTopLeftRadius: 0,
          },
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
          },
        },
      },
      {
        props: { orientation: 'horizontal' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
          [`& .${buttonGroupClasses.lastButton},& .${buttonGroupClasses.middleButton}`]: {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          },
        },
      },
      {
        props: { variant: 'text' },
        style: {
          ...iconButtonSizeStyles(theme),
          ...iconButtonColorStyles(theme, (color) => ({
            color: (theme.vars || theme).palette[color].main,
            '@media (hover: hover)': {
              '&:hover': {
                backgroundColor: theme.alpha(
                  (theme.vars || theme).palette[color].main,
                  (theme.vars || theme).palette.action.hoverOpacity,
                ),
              },
            },
          })),
          [`${iconButtonSelector}.${iconButtonClasses.colorInherit}`]: {
            color: 'inherit',
            '@media (hover: hover)': {
              '&:hover': {
                backgroundColor: theme.alpha(
                  (theme.vars || theme).palette.text.primary,
                  (theme.vars || theme).palette.action.hoverOpacity,
                ),
              },
            },
          },
          ...iconButtonStateStyles(theme),
        },
      },
      {
        props: { variant: 'outlined' },
        style: {
          [iconButtonSelector]: {
            border: '1px solid currentColor',
          },
          ...iconButtonSizeStyles(theme, 1),
          ...iconButtonColorStyles(theme, (color) => ({
            color: (theme.vars || theme).palette[color].main,
            borderColor: theme.alpha((theme.vars || theme).palette[color].main, 0.5),
            '@media (hover: hover)': {
              '&:hover': {
                borderColor: (theme.vars || theme).palette[color].main,
                backgroundColor: theme.alpha(
                  (theme.vars || theme).palette[color].main,
                  (theme.vars || theme).palette.action.hoverOpacity,
                ),
              },
            },
          })),
          [`${iconButtonSelector}.${iconButtonClasses.colorInherit}`]: {
            color: 'inherit',
            borderColor: 'currentColor',
            '@media (hover: hover)': {
              '&:hover': {
                backgroundColor: theme.alpha(
                  (theme.vars || theme).palette.text.primary,
                  (theme.vars || theme).palette.action.hoverOpacity,
                ),
              },
            },
          },
          ...iconButtonStateStyles(theme, {
            border: `1px solid ${(theme.vars || theme).palette.action.disabledBackground}`,
          }),
        },
      },
      {
        props: { variant: 'contained' },
        style: {
          ...iconButtonSizeStyles(theme),
          ...iconButtonColorStyles(theme, (color) => ({
            color: (theme.vars || theme).palette[color].contrastText,
            backgroundColor: (theme.vars || theme).palette[color].main,
            '@media (hover: hover)': {
              '&:hover': {
                backgroundColor: (theme.vars || theme).palette[color].dark,
              },
            },
          })),
          [`${iconButtonSelector}.${iconButtonClasses.colorInherit}`]: {
            color: 'inherit',
            backgroundColor: getInheritContainedBg(theme),
            '@media (hover: hover)': {
              '&:hover': {
                backgroundColor: getInheritContainedHoverBg(theme),
              },
            },
          },
          ...iconButtonStateStyles(theme, {
            backgroundColor: (theme.vars || theme).palette.action.disabledBackground,
          }),
        },
      },
      {
        props: { variant: 'text', orientation: 'horizontal' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderRight: theme.vars
              ? `1px solid ${theme.alpha(theme.vars.palette.common.onBackground, 0.23)}`
              : `1px solid ${
                  theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, 0.23)'
                    : 'rgba(255, 255, 255, 0.23)'
                }`,
            [`&.${buttonGroupClasses.disabled}`]: {
              borderRight: `1px solid ${(theme.vars || theme).palette.action.disabled}`,
            },
          },
        },
      },
      {
        props: { variant: 'text', orientation: 'vertical' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderBottom: theme.vars
              ? `1px solid ${theme.alpha(theme.vars.palette.common.onBackground, 0.23)}`
              : `1px solid ${
                  theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, 0.23)'
                    : 'rgba(255, 255, 255, 0.23)'
                }`,
            [`&.${buttonGroupClasses.disabled}`]: {
              borderBottom: `1px solid ${(theme.vars || theme).palette.action.disabled}`,
            },
          },
        },
      },
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter())
        .flatMap(([color]) => [
          {
            props: { variant: 'text', color },
            style: {
              [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
                borderColor: theme.alpha((theme.vars || theme).palette[color].main, 0.5),
              },
            },
          },
        ]),
      {
        props: { variant: 'outlined', orientation: 'horizontal' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderRightColor: 'transparent',
            '&:hover': {
              borderRightColor: 'currentColor',
            },
          },
          [iconButtonDividerSelector]: {
            borderRightColor: 'transparent',
            '&:hover': {
              borderRightColor: 'currentColor',
            },
          },
          [`& .${buttonGroupClasses.lastButton},& .${buttonGroupClasses.middleButton}`]: {
            marginLeft: -1,
          },
        },
      },
      {
        props: { variant: 'outlined', orientation: 'vertical' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderBottomColor: 'transparent',
            '&:hover': {
              borderBottomColor: 'currentColor',
            },
          },
          [iconButtonDividerSelector]: {
            borderBottomColor: 'transparent',
            '&:hover': {
              borderBottomColor: 'currentColor',
            },
          },
          [`& .${buttonGroupClasses.lastButton},& .${buttonGroupClasses.middleButton}`]: {
            marginTop: -1,
          },
        },
      },
      {
        props: { variant: 'contained', orientation: 'horizontal' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderRight: `1px solid ${(theme.vars || theme).palette.grey[400]}`,
            [`&.${buttonGroupClasses.disabled}`]: {
              borderRight: `1px solid ${(theme.vars || theme).palette.action.disabled}`,
            },
          },
        },
      },
      {
        props: { variant: 'contained', orientation: 'vertical' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderBottom: `1px solid ${(theme.vars || theme).palette.grey[400]}`,
            [`&.${buttonGroupClasses.disabled}`]: {
              borderBottom: `1px solid ${(theme.vars || theme).palette.action.disabled}`,
            },
          },
        },
      },
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter(['dark']))
        .map(([color]) => ({
          props: { variant: 'contained', color },
          style: {
            [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
              borderColor: (theme.vars || theme).palette[color].dark,
            },
          },
        })),
    ],
    [`& .${buttonGroupClasses.grouped}`]: {
      minWidth: 40,
    },
    [iconButtonSelector]: {
      borderRadius: (theme.vars || theme).shape.borderRadius,
      transition: theme.transitions.create(
        ['background-color', 'box-shadow', 'border-color', 'color'],
        {
          duration: theme.transitions.duration.short,
        },
      ),
    },
  })),
);

const ButtonGroup = React.forwardRef(function ButtonGroup(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiButtonGroup' });
  const {
    children,
    className,
    color = 'primary',
    component = 'div',
    disabled = false,
    disableElevation = false,
    disableFocusRipple = false,
    disableRipple = false,
    fullWidth = false,
    orientation = 'horizontal',
    size = 'medium',
    variant = 'outlined',
    ...other
  } = props;

  const ownerState = {
    ...props,
    color,
    component,
    disabled,
    disableElevation,
    disableFocusRipple,
    disableRipple,
    fullWidth,
    orientation,
    size,
    variant,
  };

  const classes = useUtilityClasses(ownerState);

  const context = React.useMemo(
    () => ({
      className: classes.grouped,
      color,
      disabled,
      disableElevation,
      disableFocusRipple,
      disableRipple,
      fullWidth,
      size,
      variant,
    }),
    [
      color,
      disabled,
      disableElevation,
      disableFocusRipple,
      disableRipple,
      fullWidth,
      size,
      variant,
      classes.grouped,
    ],
  );

  const validChildren = getValidReactChildren(children);
  const childrenCount = validChildren.length;

  const getButtonPositionClassName = (index) => {
    const isFirstButton = index === 0;
    const isLastButton = index === childrenCount - 1;

    if (isFirstButton && isLastButton) {
      return '';
    }
    if (isFirstButton) {
      return classes.firstButton;
    }
    if (isLastButton) {
      return classes.lastButton;
    }
    return classes.middleButton;
  };

  return (
    <ButtonGroupRoot
      as={component}
      role="group"
      className={clsx(classes.root, className)}
      ref={ref}
      ownerState={ownerState}
      {...other}
    >
      <ButtonGroupContext.Provider value={context}>
        {validChildren.map((child, index) => {
          return (
            <ButtonGroupButtonContext.Provider
              key={index}
              value={getButtonPositionClassName(index)}
            >
              {child}
            </ButtonGroupButtonContext.Provider>
          );
        })}
      </ButtonGroupContext.Provider>
    </ButtonGroupRoot>
  );
});

ButtonGroup.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['inherit', 'primary', 'secondary', 'error', 'info', 'success', 'warning']),
    PropTypes.string,
  ]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the component is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, no elevation is used.
   * @default false
   */
  disableElevation: PropTypes.bool,
  /**
   * If `true`, the button keyboard focus ripple is disabled.
   * @default false
   */
  disableFocusRipple: PropTypes.bool,
  /**
   * If `true`, the button ripple effect is disabled.
   * @default false
   */
  disableRipple: PropTypes.bool,
  /**
   * If `true`, the buttons will take up the full width of its container.
   * @default false
   */
  fullWidth: PropTypes.bool,
  /**
   * The component orientation (layout flow direction).
   * @default 'horizontal'
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  /**
   * The size of the component.
   * `small` is equivalent to the dense button styling.
   * @default 'medium'
   */
  size: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large']),
    PropTypes.string,
  ]),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The variant to use.
   * @default 'outlined'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['contained', 'outlined', 'text']),
    PropTypes.string,
  ]),
};

export default ButtonGroup;
