import * as React from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Masonry from '@mui/lab/Masonry';
import MasonryItem from '@mui/lab/MasonryItem';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Pagination from '@mui/material/Pagination';
import Slider from '@mui/material/Slider';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import MoreIcon from '@mui/icons-material/MoreVert';
import WifiIcon from '@mui/icons-material/Wifi';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import BrandingProvider from 'docs/src/BrandingProvider';
import Section from 'docs/src/layouts/Section';
import customTheme from '../src/modules/components/data.json';

const lightTheme = createTheme(customTheme);
const darkModeTheme = createTheme({
  ...customTheme,
  palette: { mode: 'dark', ...customTheme.palette },
});

const getTheme = (outerTheme) => {
  const resultTheme = outerTheme?.palette?.mode === 'dark' ? darkModeTheme : lightTheme;
  resultTheme.direction = outerTheme?.direction;
  return resultTheme;
};

const buttons = [
  <Button key="one">One</Button>,
  <Button key="two">Two</Button>,
  <Button key="three">Three</Button>,
];

const label = { inputProps: { 'aria-label': 'Switch demo' } };

function valuetext(value) {
  return `${value}°C`;
}

const marks = [
  {
    value: 0,
    label: '0°C',
  },
  {
    value: 20,
    label: '20°C',
  },
  {
    value: 37,
    label: '37°C',
  },
  {
    value: 100,
    label: '100°C',
  },
];

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  alignItems: 'flex-start',
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(2),
  // Override media queries injected by theme.mixins.toolbar
  '@media all': {
    minHeight: 128,
  },
}));

const steps = [
  {
    label: 'Select campaign settings',
    description: `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`,
  },
  {
    label: 'Create an ad group',
    description: 'An ad group contains one or more ads which target a shared set of keywords.',
  },
  {
    label: 'Create an ad',
    description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
  },
];

const shapeStyles = { bgcolor: 'primary.main', width: 40, height: 40 };
const shapeCircleStyles = { borderRadius: '50%' };
const rectangle = <Box component="span" sx={shapeStyles} />;
const circle = <Box component="span" sx={{ ...shapeStyles, ...shapeCircleStyles }} />;

const Content = () => {
  const [alignment, setAlignment] = React.useState('left');

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const children = [
    <ToggleButton value="left" key="left">
      <FormatAlignLeftIcon fontSize="small" />
    </ToggleButton>,
    <ToggleButton value="center" key="center">
      <FormatAlignCenterIcon fontSize="small" />
    </ToggleButton>,
    <ToggleButton value="right" key="right">
      <FormatAlignRightIcon fontSize="small" />
    </ToggleButton>,
    <ToggleButton value="justify" key="justify">
      <FormatAlignJustifyIcon fontSize="small" />
    </ToggleButton>,
  ];

  const control = {
    value: alignment,
    onChange: handleChange,
    exclusive: true,
  };
  return (
    <ThemeProvider theme={(outerTheme) => getTheme(outerTheme)}>
      <Masonry columns={4} spacing={4}>
        <MasonryItem>
          <Box>
            <Stack spacing={2} direction="row">
              <Button variant="text">Text</Button>
              <Button variant="contained">Contained</Button>
              <Button variant="outlined">Outlined</Button>
            </Stack>
            <Box
              sx={{
                display: 'flex',
                '& > *': {
                  m: 1,
                },
              }}
            >
              <ButtonGroup orientation="vertical" aria-label="vertical outlined button group">
                {buttons}
              </ButtonGroup>
              <ButtonGroup
                orientation="vertical"
                aria-label="vertical contained button group"
                variant="contained"
              >
                {buttons}
              </ButtonGroup>
              <ButtonGroup
                orientation="vertical"
                aria-label="vertical contained button group"
                variant="text"
              >
                {buttons}
              </ButtonGroup>
            </Box>
          </Box>
        </MasonryItem>
        <MasonryItem>
          <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
            <FormLabel component="legend">Assign responsibility</FormLabel>
            <FormGroup>
              <FormControlLabel control={<Checkbox name="gilad" checked />} label="Gilad Gray" />
              <FormControlLabel control={<Checkbox name="jason" checked />} label="Jason Killian" />
              <FormControlLabel
                control={<Checkbox name="antoine" checked />}
                label="Antoine Llorca"
              />
            </FormGroup>
            <FormHelperText>Be careful</FormHelperText>
          </FormControl>
        </MasonryItem>
        <MasonryItem>
          <FormControl component="fieldset">
            <FormLabel component="legend">Gender</FormLabel>
            <RadioGroup aria-label="gender" defaultValue="female" name="radio-buttons-group">
              <FormControlLabel value="female" control={<Radio />} label="Female" />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>
        </MasonryItem>
        <MasonryItem>
          <Stack sx={{ height: 300 }} spacing={1} direction="row">
            <Slider
              aria-label="Temperature"
              orientation="vertical"
              getAriaValueText={valuetext}
              defaultValue={30}
            />
            <Slider aria-label="Temperature" orientation="vertical" defaultValue={30} disabled />
            <Slider
              getAriaLabel={() => 'Temperature'}
              orientation="vertical"
              getAriaValueText={valuetext}
              defaultValue={[20, 37]}
              marks={marks}
            />
          </Stack>
        </MasonryItem>
        <MasonryItem>
          <Box>
            <Switch {...label} defaultChecked />
            <Switch {...label} />
            <Switch {...label} disabled defaultChecked />
            <Switch {...label} disabled />
          </Box>
        </MasonryItem>
        <MasonryItem>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              // TODO Replace with Stack
              '& > :not(style) + :not(style)': { mt: 2 },
            }}
          >
            <ToggleButtonGroup size="small" {...control}>
              {children}
            </ToggleButtonGroup>
            <ToggleButtonGroup {...control}>{children}</ToggleButtonGroup>
            <ToggleButtonGroup size="large" {...control}>
              {children}
            </ToggleButtonGroup>
          </Box>
        </MasonryItem>
        <MasonryItem>
          <Stack spacing={3} direction="row">
            <Badge color="secondary" badgeContent=" ">
              {rectangle}
            </Badge>
            <Badge color="secondary" badgeContent=" " variant="dot">
              {rectangle}
            </Badge>
            <Badge color="secondary" overlap="circular" badgeContent=" ">
              {circle}
            </Badge>
            <Badge color="secondary" overlap="circular" badgeContent=" " variant="dot">
              {circle}
            </Badge>
          </Stack>
        </MasonryItem>
        <MasonryItem>
          <Box>
            <Stack direction="row" spacing={1}>
              <Chip label="primary" color="primary" />
              <Chip label="success" color="success" />
            </Stack>
            <br />
            <Stack direction="row" spacing={1}>
              <Chip label="primary" color="primary" variant="outlined" />
              <Chip label="success" color="success" variant="outlined" />
            </Stack>
          </Box>
        </MasonryItem>
        <MasonryItem>
          <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
            subheader={<ListSubheader>Settings</ListSubheader>}
          >
            <ListItem>
              <ListItemIcon>
                <WifiIcon />
              </ListItemIcon>
              <ListItemText id="switch-list-label-wifi" primary="Wi-Fi" />
              <Switch
                edge="end"
                inputProps={{
                  'aria-labelledby': 'switch-list-label-wifi',
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <BluetoothIcon />
              </ListItemIcon>
              <ListItemText id="switch-list-label-bluetooth" primary="Bluetooth" />
              <Switch
                edge="end"
                checked
                inputProps={{
                  'aria-labelledby': 'switch-list-label-bluetooth',
                }}
              />
            </ListItem>
          </List>
        </MasonryItem>
        <MasonryItem>
          <Box sx={{ width: '100%', maxWidth: 500 }}>
            <Typography variant="h1" component="div" gutterBottom>
              h1. Heading
            </Typography>
            <Typography variant="h2" gutterBottom component="div">
              h2. Heading
            </Typography>
            <Typography variant="h3" gutterBottom component="div">
              h3. Heading
            </Typography>
            <Typography variant="h4" gutterBottom component="div">
              h4. Heading
            </Typography>
            <Typography variant="h5" gutterBottom component="div">
              h5. Heading
            </Typography>
            <Typography variant="h6" gutterBottom component="div">
              h6. Heading
            </Typography>
            <Typography variant="subtitle1" gutterBottom component="div">
              subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis
              tenetur
            </Typography>
            <Typography variant="subtitle2" gutterBottom component="div">
              subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis
              tenetur
            </Typography>
            <Typography variant="body1" gutterBottom>
              body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis
              tenetur unde suscipit, quam beatae rerum inventore consectetur, neque doloribus,
              cupiditate numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
            </Typography>
            <Typography variant="body2" gutterBottom>
              body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis
              tenetur unde suscipit, quam beatae rerum inventore consectetur, neque doloribus,
              cupiditate numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
            </Typography>
            <Typography variant="button" display="block" gutterBottom>
              button text
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              caption text
            </Typography>
            <Typography variant="overline" display="block" gutterBottom>
              overline text
            </Typography>
          </Box>
        </MasonryItem>
        <MasonryItem>
          <Stack sx={{ width: '100%' }} spacing={2}>
            <Alert severity="error">This is an error alert — check it out!</Alert>
            <Alert severity="warning">This is a warning alert — check it out!</Alert>
            <Alert severity="info">This is an info alert — check it out!</Alert>
            <Alert severity="success">This is a success alert — check it out!</Alert>
          </Stack>
        </MasonryItem>
        <MasonryItem>
          <Stack sx={{ width: '100%', color: 'grey.500' }} spacing={2}>
            <LinearProgress />
            <LinearProgress color="secondary" />
            <LinearProgress color="success" />
            <LinearProgress color="inherit" />
          </Stack>
        </MasonryItem>
        <MasonryItem>
          <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
              <StyledToolbar>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="h5"
                  noWrap
                  component="div"
                  sx={{ flexGrow: 1, alignSelf: 'flex-end' }}
                >
                  MUI
                </Typography>
                <IconButton size="large" aria-label="search" color="inherit">
                  <SearchIcon />
                </IconButton>
                <IconButton
                  size="large"
                  aria-label="display more actions"
                  edge="end"
                  color="inherit"
                >
                  <MoreIcon />
                </IconButton>
              </StyledToolbar>
            </AppBar>
          </Box>
        </MasonryItem>
        <MasonryItem>
          <Card sx={{ maxWidth: 345 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                  R
                </Avatar>
              }
              action={
                <IconButton aria-label="settings">
                  <MoreIcon />
                </IconButton>
              }
              title="Shrimp and Chorizo Paella"
              subheader="September 14, 2016"
            />
            <CardMedia
              component="img"
              height="194"
              image="/static/images/cards/paella.jpg"
              alt="Paella dish"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                This impressive paella is a perfect party dish and a fun meal to cook together with
                your guests. Add 1 cup of frozen peas along with the mussels, if you like.
              </Typography>
            </CardContent>
            <CardActions disableSpacing>
              <IconButton aria-label="add to favorites">
                <FavoriteIcon />
              </IconButton>
              <IconButton aria-label="share">
                <ShareIcon />
              </IconButton>
            </CardActions>
          </Card>
        </MasonryItem>
        <MasonryItem>
          <Stack spacing={2}>
            <Pagination count={10} />
            <Pagination count={10} color="primary" />
            <Pagination count={10} color="secondary" />
            <Pagination count={10} disabled />
          </Stack>
        </MasonryItem>
        <MasonryItem>
          <Box sx={{ maxWidth: 400 }}>
            <Stepper activeStep={0} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      index === 2 ? <Typography variant="caption">Last step</Typography> : null
                    }
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    <Box sx={{ mb: 2 }}>
                      <div>
                        <Button variant="contained" sx={{ mt: 1, mr: 1 }}>
                          {index === steps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button disabled={index === 0} sx={{ mt: 1, mr: 1 }}>
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        </MasonryItem>
      </Masonry>
    </ThemeProvider>
  );
};

export default function FigmaPluginDemo() {
  return (
    <BrandingProvider>
      <AppHeader />
      <main>
        <Section bg="gradient" sx={{ py: { xs: 2, sm: 4 } }}>
          <Typography variant="h2" component="h1" align="center" sx={{ mb: 4 }}>
            Figma Plugin Demo
          </Typography>
          <Content />
        </Section>
      </main>
      <AppFooter />
    </BrandingProvider>
  );
}
