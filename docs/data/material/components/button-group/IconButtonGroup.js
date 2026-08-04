import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

export default function IconButtonGroup() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > *': {
          m: 1,
        },
      }}
    >
      <ButtonGroup variant="outlined" aria-label="Icon button group">
        <Button>Close issue</Button>
        <IconButton aria-label="More options">
          <ArrowDropDownIcon />
        </IconButton>
      </ButtonGroup>
      <ButtonGroup variant="contained" aria-label="Pagination button group">
        <IconButton aria-label="Previous page">
          <ArrowLeftIcon />
        </IconButton>
        <IconButton aria-label="Next page">
          <ArrowRightIcon />
        </IconButton>
      </ButtonGroup>
    </Box>
  );
}
