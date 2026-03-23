'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import Typography, { typographyClasses } from '../Typography';
import ListContext from '../List/ListContext';
import { styled } from '../zero-styled';
import { useDefaultProps } from '../DefaultPropsProvider';
import listItemTextClasses, { getListItemTextUtilityClass } from './listItemTextClasses';
import useSlot from '../utils/useSlot';

const useUtilityClasses = (ownerState) => {
  const { classes, inset, primary, secondary, dense } = ownerState;

  const slots = {
    root: ['root', inset && 'inset', dense && 'dense', primary && secondary && 'multiline'],
    primary: ['primary'],
    secondary: ['secondary'],
  };

  return composeClasses(slots, getListItemTextUtilityClass, classes);
};

const ListItemTextRoot = styled('div', {
  name: 'MuiListItemText',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      { [`& .${listItemTextClasses.primary}`]: styles.primary },
      { [`& .${listItemTextClasses.secondary}`]: styles.secondary },
      styles.root,
      ownerState.inset && styles.inset,
      ownerState.primary && ownerState.secondary && styles.multiline,
      ownerState.dense && styles.dense,
    ];
  },
})({
  flex: '1 1 auto',
  minWidth: 0,
  marginTop: 4,
  marginBottom: 4,
  // Combine this and the below selector once https://github.com/emotion-js/emotion/issues/3366 is solved
  [`.${typographyClasses.root}:where(& .${listItemTextClasses.primary})`]: {
    display: 'block',
  },
  [`.${typographyClasses.root}:where(& .${listItemTextClasses.secondary})`]: {
    display: 'block',
  },
  variants: [
    {
      props: ({ ownerState }) => ownerState.primary && ownerState.secondary,
      style: {
        marginTop: 6,
        marginBottom: 6,
      },
    },
    {
      props: ({ ownerState }) => ownerState.inset,
      style: {
        paddingLeft: 56,
      },
    },
  ],
});

const ListItemText = React.forwardRef(function ListItemText(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiListItemText' });
  const {
    children,
    className,
    disableTypography = false,
    inset = false,
    primary: primaryProp,
    secondary: secondaryProp,
    slots = {},
    slotProps = {},
    ...other
  } = props;
  const { dense } = React.useContext(ListContext);

  let primary = primaryProp != null ? primaryProp : children;
  let secondary = secondaryProp;

  const ownerState = {
    ...props,
    disableTypography,
    inset,
    primary: !!primary,
    secondary: !!secondary,
    dense,
  };

  const classes = useUtilityClasses(ownerState);

  const externalForwardedProps = {
    slots,
    slotProps,
  };

  const [RootSlot, rootSlotProps] = useSlot('root', {
    className: clsx(classes.root, className),
    elementType: ListItemTextRoot,
    externalForwardedProps: {
      ...externalForwardedProps,
      ...other,
    },
    ownerState,
    ref,
  });

  const [PrimarySlot, primarySlotProps] = useSlot('primary', {
    className: classes.primary,
    elementType: Typography,
    externalForwardedProps,
    ownerState,
  });
  const [SecondarySlot, secondarySlotProps] = useSlot('secondary', {
    className: classes.secondary,
    elementType: Typography,
    externalForwardedProps,
    ownerState,
  });

  if (primary != null && primary.type !== Typography && !disableTypography) {
    primary = (
      <PrimarySlot
        variant={dense ? 'body2' : 'body1'}
        component={primarySlotProps?.variant ? undefined : 'span'}
        {...primarySlotProps}
      >
        {primary}
      </PrimarySlot>
    );
  }

  if (secondary != null && secondary.type !== Typography && !disableTypography) {
    secondary = (
      <SecondarySlot variant="body2" color="textSecondary" {...secondarySlotProps}>
        {secondary}
      </SecondarySlot>
    );
  }

  return (
    <RootSlot {...rootSlotProps}>
      {primary}
      {secondary}
    </RootSlot>
  );
});

ListItemText.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Alias for the `primary` prop.
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
   * If `true`, the children won't be wrapped by a Typography component.
   * This can be useful to render an alternative Typography variant by wrapping
   * the `children` (or `primary`) text, and optional `secondary` text
   * with the Typography component.
   * @default false
   */
  disableTypography: PropTypes.bool,
  /**
   * If `true`, the children are indented.
   * This should be used if there is no left avatar or left icon.
   * @default false
   */
  inset: PropTypes.bool,
  /**
   * The main content element.
   */
  primary: PropTypes.node,
  /**
   * The secondary content element.
   */
  secondary: PropTypes.node,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    primary: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        align: PropTypes.oneOf(['center', 'inherit', 'justify', 'left', 'right']),
        children: PropTypes.node,
        classes: PropTypes.object,
        className: PropTypes.string,
        color: PropTypes.string,
        component: PropTypes.oneOfType([
          PropTypes.func,
          PropTypes.shape({
            '__@iterator@4297': PropTypes.func.isRequired,
            anchor: PropTypes.func.isRequired,
            at: PropTypes.func.isRequired,
            big: PropTypes.func.isRequired,
            blink: PropTypes.func.isRequired,
            bold: PropTypes.func.isRequired,
            charAt: PropTypes.func.isRequired,
            charCodeAt: PropTypes.func.isRequired,
            codePointAt: PropTypes.func.isRequired,
            concat: PropTypes.func.isRequired,
            endsWith: PropTypes.func.isRequired,
            fixed: PropTypes.func.isRequired,
            fontcolor: PropTypes.func.isRequired,
            fontsize: PropTypes.func.isRequired,
            includes: PropTypes.func.isRequired,
            indexOf: PropTypes.func.isRequired,
            italics: PropTypes.func.isRequired,
            lastIndexOf: PropTypes.func.isRequired,
            length: PropTypes.number.isRequired,
            link: PropTypes.func.isRequired,
            localeCompare: PropTypes.func.isRequired,
            match: PropTypes.func.isRequired,
            matchAll: PropTypes.func.isRequired,
            normalize: PropTypes.func.isRequired,
            padEnd: PropTypes.func.isRequired,
            padStart: PropTypes.func.isRequired,
            repeat: PropTypes.func.isRequired,
            replace: PropTypes.func.isRequired,
            search: PropTypes.func.isRequired,
            slice: PropTypes.func.isRequired,
            small: PropTypes.func.isRequired,
            split: PropTypes.func.isRequired,
            startsWith: PropTypes.func.isRequired,
            strike: PropTypes.func.isRequired,
            sub: PropTypes.func.isRequired,
            substr: PropTypes.func.isRequired,
            substring: PropTypes.func.isRequired,
            sup: PropTypes.func.isRequired,
            toLocaleLowerCase: PropTypes.func.isRequired,
            toLocaleUpperCase: PropTypes.func.isRequired,
            toLowerCase: PropTypes.func.isRequired,
            toString: PropTypes.func.isRequired,
            toUpperCase: PropTypes.func.isRequired,
            trim: PropTypes.func.isRequired,
            trimEnd: PropTypes.func.isRequired,
            trimLeft: PropTypes.func.isRequired,
            trimRight: PropTypes.func.isRequired,
            trimStart: PropTypes.func.isRequired,
            valueOf: PropTypes.func.isRequired,
          }),
        ]),
        gutterBottom: PropTypes.bool,
        noWrap: PropTypes.bool,
        style: PropTypes.object,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        variant: PropTypes.oneOf([
          'body1',
          'body2',
          'button',
          'caption',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'inherit',
          'overline',
          'subtitle1',
          'subtitle2',
        ]),
        variantMapping: PropTypes.shape({
          body1: PropTypes.string,
          body2: PropTypes.string,
          button: PropTypes.string,
          caption: PropTypes.string,
          h1: PropTypes.string,
          h2: PropTypes.string,
          h3: PropTypes.string,
          h4: PropTypes.string,
          h5: PropTypes.string,
          h6: PropTypes.string,
          inherit: PropTypes.string,
          overline: PropTypes.string,
          subtitle1: PropTypes.string,
          subtitle2: PropTypes.string,
        }),
      }),
    ]),
    root: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    secondary: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        align: PropTypes.oneOf(['center', 'inherit', 'justify', 'left', 'right']),
        children: PropTypes.node,
        classes: PropTypes.object,
        className: PropTypes.string,
        color: PropTypes.string,
        component: PropTypes.oneOfType([
          PropTypes.func,
          PropTypes.shape({
            '__@iterator@4297': PropTypes.func.isRequired,
            anchor: PropTypes.func.isRequired,
            at: PropTypes.func.isRequired,
            big: PropTypes.func.isRequired,
            blink: PropTypes.func.isRequired,
            bold: PropTypes.func.isRequired,
            charAt: PropTypes.func.isRequired,
            charCodeAt: PropTypes.func.isRequired,
            codePointAt: PropTypes.func.isRequired,
            concat: PropTypes.func.isRequired,
            endsWith: PropTypes.func.isRequired,
            fixed: PropTypes.func.isRequired,
            fontcolor: PropTypes.func.isRequired,
            fontsize: PropTypes.func.isRequired,
            includes: PropTypes.func.isRequired,
            indexOf: PropTypes.func.isRequired,
            italics: PropTypes.func.isRequired,
            lastIndexOf: PropTypes.func.isRequired,
            length: PropTypes.number.isRequired,
            link: PropTypes.func.isRequired,
            localeCompare: PropTypes.func.isRequired,
            match: PropTypes.func.isRequired,
            matchAll: PropTypes.func.isRequired,
            normalize: PropTypes.func.isRequired,
            padEnd: PropTypes.func.isRequired,
            padStart: PropTypes.func.isRequired,
            repeat: PropTypes.func.isRequired,
            replace: PropTypes.func.isRequired,
            search: PropTypes.func.isRequired,
            slice: PropTypes.func.isRequired,
            small: PropTypes.func.isRequired,
            split: PropTypes.func.isRequired,
            startsWith: PropTypes.func.isRequired,
            strike: PropTypes.func.isRequired,
            sub: PropTypes.func.isRequired,
            substr: PropTypes.func.isRequired,
            substring: PropTypes.func.isRequired,
            sup: PropTypes.func.isRequired,
            toLocaleLowerCase: PropTypes.func.isRequired,
            toLocaleUpperCase: PropTypes.func.isRequired,
            toLowerCase: PropTypes.func.isRequired,
            toString: PropTypes.func.isRequired,
            toUpperCase: PropTypes.func.isRequired,
            trim: PropTypes.func.isRequired,
            trimEnd: PropTypes.func.isRequired,
            trimLeft: PropTypes.func.isRequired,
            trimRight: PropTypes.func.isRequired,
            trimStart: PropTypes.func.isRequired,
            valueOf: PropTypes.func.isRequired,
          }),
        ]),
        gutterBottom: PropTypes.bool,
        noWrap: PropTypes.bool,
        style: PropTypes.object,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        variant: PropTypes.oneOf([
          'body1',
          'body2',
          'button',
          'caption',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'inherit',
          'overline',
          'subtitle1',
          'subtitle2',
        ]),
        variantMapping: PropTypes.shape({
          body1: PropTypes.string,
          body2: PropTypes.string,
          button: PropTypes.string,
          caption: PropTypes.string,
          h1: PropTypes.string,
          h2: PropTypes.string,
          h3: PropTypes.string,
          h4: PropTypes.string,
          h5: PropTypes.string,
          h6: PropTypes.string,
          inherit: PropTypes.string,
          overline: PropTypes.string,
          subtitle1: PropTypes.string,
          subtitle2: PropTypes.string,
        }),
      }),
    ]),
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    primary: PropTypes.elementType,
    root: PropTypes.elementType,
    secondary: PropTypes.elementType,
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default ListItemText;
