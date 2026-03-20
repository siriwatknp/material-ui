import * as React from 'react';
import { SxProps } from '@mui/system';
import { Theme } from '../styles';
import { InternalStandardProps as StandardProps } from '../internal';
import { ListItemSecondaryActionClasses } from './listItemSecondaryActionClasses';

export interface ListItemSecondaryActionProps extends StandardProps<
  React.HTMLAttributes<HTMLDivElement>
> {
  /**
   * The content of the component, normally an `IconButton` or selection control.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ListItemSecondaryActionClasses> | undefined;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme> | undefined;
}

/**
 * @ignore - internal component.
 */
declare const ListItemSecondaryAction: ((
  props: ListItemSecondaryActionProps,
) => React.JSX.Element) & {
  muiName: string;
};

export default ListItemSecondaryAction;
