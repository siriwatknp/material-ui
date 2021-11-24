import * as React from 'react';
import { experimental_ClassNameProvider as ClassNameProvider } from '@mui/system';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const fooGenerator = (componentName) => `foo-${componentName}`;

const barGenerator = (componentName) => `bar-${componentName}`;

export default function Playground() {
  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <ClassNameProvider generator={fooGenerator}>
        <Button variant="contained">Foo</Button>
      </ClassNameProvider>
      <ClassNameProvider generator={barGenerator}>
        <Button variant="contained">Bar</Button>
      </ClassNameProvider>
    </Box>
  );
}
