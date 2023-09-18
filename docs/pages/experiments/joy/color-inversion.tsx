import * as React from 'react';
import { CssVarsProvider, applySolidInversion } from '@mui/joy/styles';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import CssBaseline from '@mui/joy/CssBaseline';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function JoyToggleButton() {
  return (
    <CssVarsProvider>
      <CssBaseline />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: 3,
          p: 3,
        }}
      >
        <Card
          variant="solid"
          color="primary"
          sx={[
            {
              gap: 2,
              maxWidth: 300,
              boxShadow: 'md',
              '& *, && [data-color-inverted]': applySolidInversion('primary'),
            },
          ]}
        >
          <Chip size="sm" variant="soft" sx={{ alignSelf: 'flex-start', borderRadius: 'xl' }}>
            New
          </Chip>
          <IconButton
            variant="outlined"
            size="sm"
            sx={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
          >
            <BookmarkOutlinedIcon />
          </IconButton>
          <Typography level="h3">Learn how to build super fast websites.</Typography>
          <Button variant="solid" endDecorator={<KeyboardArrowRightIcon />}>
            Read more
          </Button>
        </Card>

        <Card
          variant="solid"
          color="primary"
          sx={[
            {
              gap: 2,
              maxWidth: 300,
              boxShadow: 'md',
              '& *, && [data-color-inverted]': applySolidInversion('primary'),
            },
          ]}
        >
          <Chip size="sm" variant="soft" sx={{ alignSelf: 'flex-start', borderRadius: 'xl' }}>
            New
          </Chip>
          <IconButton
            variant="outlined"
            size="sm"
            sx={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
          >
            <BookmarkOutlinedIcon />
          </IconButton>
          <Typography level="h3">Instance color prop is applied to the button.</Typography>
          <Button variant="solid" color="success" endDecorator={<KeyboardArrowRightIcon />}>
            Read more
          </Button>
        </Card>
      </Box>
    </CssVarsProvider>
  );
}