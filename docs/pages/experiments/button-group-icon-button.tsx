import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const variants = ['text', 'outlined', 'contained'] as const;
const sizes = ['small', 'medium', 'large'] as const;
const colors = ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'inherit'] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function ButtonGroupIconButton() {
  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        IconButton inside ButtonGroup
      </Typography>

      {variants.map((variant) => (
        <Section key={variant} title={`variant="${variant}" — colors × sizes`}>
          {sizes.map((size) => (
            <Stack
              key={size}
              direction="row"
              spacing={2}
              sx={{ mb: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}
            >
              {colors.map((color) => (
                <ButtonGroup key={color} variant={variant} size={size} color={color}>
                  <Button>Close issue</Button>
                  <IconButton>
                    <ArrowDropDownIcon />
                  </IconButton>
                </ButtonGroup>
              ))}
            </Stack>
          ))}
        </Section>
      ))}

      <Section title="Icon-only groups (keep their own size, next to a Button-only group)">
        {variants.map((variant) => (
          <Stack key={variant} direction="row" spacing={2} sx={{ mb: 2, alignItems: 'flex-start' }}>
            {sizes.map((size) => (
              <Stack key={size} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <ButtonGroup variant={variant} size={size}>
                  <IconButton>
                    <ArrowLeftIcon />
                  </IconButton>
                  <IconButton>
                    <ArrowRightIcon />
                  </IconButton>
                </ButtonGroup>
                <ButtonGroup variant={variant} size={size}>
                  <Button>Text</Button>
                </ButtonGroup>
              </Stack>
            ))}
          </Stack>
        ))}
      </Section>

      <Section title="Disabled / loading">
        {variants.map((variant) => (
          <Stack key={variant} direction="row" spacing={2} sx={{ mb: 2, alignItems: 'flex-start' }}>
            <ButtonGroup variant={variant} disabled>
              <Button>Close issue</Button>
              <IconButton>
                <ArrowDropDownIcon />
              </IconButton>
            </ButtonGroup>
            <ButtonGroup variant={variant}>
              <Button>Close issue</Button>
              <IconButton disabled>
                <ArrowDropDownIcon />
              </IconButton>
            </ButtonGroup>
            <ButtonGroup variant={variant}>
              <Button>Close issue</Button>
              <IconButton loading>
                <ArrowDropDownIcon />
              </IconButton>
            </ButtonGroup>
          </Stack>
        ))}
      </Section>

      <Section title="Vertical">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          {variants.map((variant) => (
            <ButtonGroup key={variant} orientation="vertical" variant={variant}>
              <Button>Close issue</Button>
              <IconButton>
                <ArrowDropDownIcon />
              </IconButton>
              <IconButton>
                <ArrowLeftIcon />
              </IconButton>
            </ButtonGroup>
          ))}
        </Stack>
      </Section>

      <Section title="fullWidth">
        <Stack spacing={2}>
          {variants.map((variant) => (
            <ButtonGroup key={variant} fullWidth variant={variant}>
              <Button>Close issue</Button>
              <IconButton>
                <ArrowDropDownIcon />
              </IconButton>
            </ButtonGroup>
          ))}
        </Stack>
      </Section>

      <Section title="Per-child overrides (own size/color win over the group)">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <ButtonGroup variant="outlined" color="primary">
            <Button>Close issue</Button>
            <IconButton color="error">
              <ArrowDropDownIcon />
            </IconButton>
          </ButtonGroup>
          <ButtonGroup variant="contained" color="primary">
            <Button>Close issue</Button>
            <IconButton color="success">
              <ArrowDropDownIcon />
            </IconButton>
          </ButtonGroup>
        </Stack>
      </Section>
    </Container>
  );
}
