import * as React from 'react';
import { createTheme, ThemeProvider, Button } from '@mui/material';
import { NonForwardedProps } from '@mui/system';

NonForwardedProps.set('MuiButton', ['rounded']);
// NonForwardedProps.set('MuiButtonBase', ['rounded']);
// NonForwardedProps.set('MuiTouchRipple', ['rounded']);

declare module '@mui/material/Button' {
  interface ButtonExtraProps {
    rounded?: boolean;
  }
}

const theme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: { rounded: true }, // this works great! but there is no way to update the TS
          style: {
            borderRadius: 50,
          },
        },
      ],
    },
  },
});

export default function RoundedButton() {
  return (
    <ThemeProvider theme={theme}>
      <Button rounded variant="contained">
        Rounded
      </Button>
    </ThemeProvider>
  );
}
