import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import accordionA11y from 'docs/data/material/a11y/Accordion.json';

export default function AccordionAccessibility() {
  const demoCount = Object.keys(accordionA11y.demos).length;
  const failedRuleIds = Object.keys(accordionA11y.failedRules);
  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Accessibility status
      </Typography>
      <Stack direction="row" spacing={1}>
        <Chip
          size="small"
          color="success"
          label={`${accordionA11y.passed} rules passing`}
        />
        <Chip
          size="small"
          color={failedRuleIds.length ? 'warning' : 'default'}
          label={`${accordionA11y.failed} rules with issues`}
        />
        <Chip size="small" label={`${demoCount} demos audited`} />
      </Stack>
      {failedRuleIds.length > 0 ? (
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          Known issues: {failedRuleIds.join(', ')}
        </Typography>
      ) : null}
    </Box>
  );
}
