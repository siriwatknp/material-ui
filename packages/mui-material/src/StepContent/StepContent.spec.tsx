import { expectType } from '@mui/types';
import { mergeSlotProps } from '@mui/material/utils';
import StepContent, { StepContentProps } from '@mui/material/StepContent';
import Collapse from '@mui/material/Collapse';

<StepContent slots={{ transition: Collapse }}>Step Content</StepContent>;

function Custom(props: StepContentProps) {
  const { slotProps, ...other } = props;
  return (
    <StepContent
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
    </StepContent>
  );
}

function Custom2(props: StepContentProps) {
  const { slotProps, ...other } = props;
  return (
    <StepContent
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
    </StepContent>
  );
}
