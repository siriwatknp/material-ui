import { createRenderer, isJsdom } from '@mui/internal-test-utils';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { expectNoVisualAxeViolations, createAxeCollector } from '../../test/axe';
import { flushAxeResults } from '../../test/axeFlush';

const collector = createAxeCollector();

describe.skipIf(isJsdom())('Card Visual Accessibility', () => {
  const { render } = createRenderer();

  afterAll(async () => {
    await flushAxeResults({ component: 'Card', collector });
  });

  it('variant:elevation (default)', async () => {
    const { container } = render(
      <Card>
        <CardContent>
          <Typography>Content</Typography>
        </CardContent>
      </Card>,
    );
    await collector.collectAxeRules(container, 'variant:elevation (default)');
    await expectNoVisualAxeViolations(container);
  });

  it('variant:outlined', async () => {
    const { container } = render(
      <Card variant="outlined">
        <CardContent>
          <Typography>Content</Typography>
        </CardContent>
      </Card>,
    );
    await collector.collectAxeRules(container, 'variant:outlined');
    await expectNoVisualAxeViolations(container);
  });

  it('with CardHeader and CardActions', async () => {
    const { container } = render(
      <Card>
        <CardHeader title="Title" subheader="Subheader" />
        <CardContent>
          <Typography variant="body2">Card content</Typography>
        </CardContent>
        <CardActions>
          <Button size="small">Learn More</Button>
        </CardActions>
      </Card>,
    );
    await collector.collectAxeRules(container, 'with CardHeader and CardActions');
    await expectNoVisualAxeViolations(container);
  });

  it('with CardMedia', async () => {
    const { container } = render(
      <Card>
        <CardMedia component="img" height="140" image="/fake.jpg" alt="placeholder" />
        <CardContent>
          <Typography variant="h5">Heading</Typography>
          <Typography variant="body2">Description</Typography>
        </CardContent>
        <CardActions>
          <Button size="small">Share</Button>
        </CardActions>
      </Card>,
    );
    await collector.collectAxeRules(container, 'with CardMedia');
    await expectNoVisualAxeViolations(container);
  });

  it('with CardActionArea', async () => {
    const { container } = render(
      <Card>
        <CardActionArea>
          <CardContent>
            <Typography variant="h5">Clickable card</Typography>
            <Typography variant="body2">Description</Typography>
          </CardContent>
        </CardActionArea>
      </Card>,
    );
    await collector.collectAxeRules(container, 'with CardActionArea');
    await expectNoVisualAxeViolations(container);
  });

  it('with CardHeader action', async () => {
    const { container } = render(
      <Card>
        <CardHeader
          title="Title"
          subheader="Subheader"
          action={<IconButton aria-label="settings">⚙</IconButton>}
        />
        <CardContent>
          <Typography variant="body2">Content</Typography>
        </CardContent>
      </Card>,
    );
    await collector.collectAxeRules(container, 'with CardHeader action');
    await expectNoVisualAxeViolations(container);
  });
});
