import * as React from 'react';
import Menu2 from '@mui/material/Unstable_Menu2';
import Menu2RadioGroup from '@mui/material/Unstable_Menu2RadioGroup';
import Menu2RadioItem from '@mui/material/Unstable_Menu2RadioItem';

export default function RadioMenu2() {
  const [zoom, setZoom] = React.useState('fit');

  return (
    <Menu2 trigger="Zoom">
      <Menu2RadioGroup value={zoom} onChange={(event, value) => setZoom(value)}>
        <Menu2RadioItem value="50">50%</Menu2RadioItem>
        <Menu2RadioItem value="100">100%</Menu2RadioItem>
        <Menu2RadioItem value="200">200%</Menu2RadioItem>
        <Menu2RadioItem value="fit">Fit to window</Menu2RadioItem>
      </Menu2RadioGroup>
    </Menu2>
  );
}
