import * as React from 'react';
import { ListItemText } from '@mui/material';

function slotPropsTest() {
  <ListItemText slotProps={{ primary: { variant: 'h1' } }} />;
  <ListItemText slotProps={{ primary: { align: 'left' } }} />;
  <ListItemText
    slotProps={{
      primary: {
        color: 'primary',
        display: 'block',
        gutterBottom: true,
        noWrap: true,
        variantMapping: { h1: 'h1' },
      },
    }}
  />;
  <ListItemText slotProps={{ secondary: { variant: 'h1' } }} />;
  <ListItemText slotProps={{ secondary: { align: 'left' } }} />;
  <ListItemText
    slotProps={{
      secondary: {
        color: 'primary',
        display: 'block',
        gutterBottom: true,
        noWrap: true,
        variantMapping: { h1: 'h1' },
      },
    }}
  />;
  <ListItemText
    slotProps={{
      primary: { variant: 'h1' },
      secondary: { variant: 'h1' },
    }}
  />;
}
