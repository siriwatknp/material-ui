import * as React from 'react';
import { expectType } from '@mui/types';
import { mergeSlotProps } from '@mui/material/utils';
import { Popover, PopoverProps } from '@mui/material';

function Test() {
  return (
    <React.Fragment>
      <Popover open />;
      <Popover open slotProps={{ paper: { elevation: 12 } }} />
    </React.Fragment>
  );
}

<Popover
  open
  slotProps={{
    paper: {
      sx: (theme) => ({ backgroundColor: theme.palette.primary.main }),
    },
  }}
/>;

function Custom(props: PopoverProps) {
  const { slotProps, ...other } = props;
  return (
    <Popover
      slotProps={{
        ...slotProps,
        transition: (ownerState) => {
          const transitionProps =
            typeof slotProps?.transition === 'function'
              ? slotProps.transition(ownerState)
              : slotProps?.transition;
          return {
            ...transitionProps,
            onExited: (node) => {
              transitionProps?.onExited?.(node);
            },
          };
        },
      }}
      {...other}
    >
      test
    </Popover>
  );
}

function Custom2(props: PopoverProps) {
  const { slotProps, ...other } = props;
  return (
    <Popover
      slotProps={{
        ...slotProps,
        transition: mergeSlotProps(slotProps?.transition, {
          onExited: (node) => {
            expectType<HTMLElement, typeof node>(node);
          },
        }),
      }}
      {...other}
    >
      test
    </Popover>
  );
}

function TestAnchorElementFunctionReturnType() {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return <Popover open anchorEl={() => buttonRef.current} />;
}
