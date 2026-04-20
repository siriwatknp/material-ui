import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { describeA11y } from '../axe';

export default describeA11y('Card', {
  scenarios: [
    {
      id: 'variant:elevation (default)',
      render: () => (
        <Card>
          <CardContent>
            <Typography>Content</Typography>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'variant:outlined',
      render: () => (
        <Card variant="outlined">
          <CardContent>
            <Typography>Content</Typography>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'with CardHeader and CardActions',
      render: () => (
        <Card>
          <CardHeader title="Title" subheader="Subheader" />
          <CardContent>
            <Typography variant="body2">Card content</Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      ),
    },
    {
      id: 'with CardMedia',
      render: () => (
        <Card>
          <CardMedia component="img" height="140" image="/fake.jpg" alt="placeholder" />
          <CardContent>
            <Typography variant="h5">Heading</Typography>
            <Typography variant="body2">Description</Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Share</Button>
          </CardActions>
        </Card>
      ),
    },
    {
      id: 'with CardActionArea',
      render: () => (
        <Card>
          <CardActionArea>
            <CardContent>
              <Typography variant="h5">Clickable card</Typography>
              <Typography variant="body2">Description</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ),
    },
    {
      id: 'with CardHeader action',
      render: () => (
        <Card>
          <CardHeader
            title="Title"
            subheader="Subheader"
            action={<IconButton aria-label="settings">⚙</IconButton>}
          />
          <CardContent>
            <Typography variant="body2">Content</Typography>
          </CardContent>
        </Card>
      ),
    },
  ],
});
