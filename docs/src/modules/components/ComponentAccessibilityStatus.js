import PropTypes from 'prop-types';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
// eslint-disable-next-line import/no-relative-packages -- data lives outside the docs package
import a11yResults from '../../../../packages/mui-material/test/a11y-results.json';

const AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const AAA_TAGS = ['wcag2aaa'];

function groupRulesByLevel(data) {
  const { failedRules = {}, testedRules = {} } = data;
  const failedRuleIds = new Set(Object.keys(failedRules));

  function buildRules(tags) {
    const ruleIds = new Set();
    for (const tag of tags) {
      for (const id of testedRules[tag] || []) {
        ruleIds.add(id);
      }
    }
    return [...ruleIds].sort().map((id) => ({
      id,
      result: failedRuleIds.has(id) ? 'fail' : 'pass',
      knownIssues: failedRuleIds.has(id) ? failedRules[id] : [],
    }));
  }

  return {
    aa: { label: 'WCAG 2.x AA', rules: buildRules(AA_TAGS) },
    aaa: { label: 'WCAG 2.x AAA', rules: buildRules(AAA_TAGS) },
  };
}

function LevelAccordion({ group }) {
  const passed = group.rules.filter((r) => r.result === 'pass').length;
  const total = group.rules.length;
  if (total === 0) {
    return null;
  }
  const allPassed = passed === total;

  return (
    <Accordion
      variant="outlined"
      disableGutters
      defaultExpanded={false}
      sx={{ '&::before': { display: 'none' } }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        slotProps={{ content: { sx: { alignItems: 'baseline' } } }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
          {group.label}
        </Typography>
        <Chip
          label={`${passed}/${total} Passed`}
          color={allPassed ? 'success' : 'warning'}
          size="small"
        />
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 'fit-content' }}>Rule name</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Known issues</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {group.rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Link
                      href={`https://dequeuniversity.com/rules/axe/4.11/${rule.id}`}
                      target="_blank"
                      rel="noopener"
                      variant="body2"
                    >
                      {rule.id}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {rule.result === 'pass' ? (
                      <CheckCircleRoundedIcon color="success" fontSize="small" />
                    ) : (
                      <ErrorRoundedIcon color="warning" fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell sx={{ width: '100%' }}>
                    {rule.knownIssues.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {rule.knownIssues.map((issue) => (
                          <Chip key={issue} label={issue} size="small" variant="outlined" />
                        ))}
                      </div>
                    ) : (
                      '\u2014'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}

LevelAccordion.propTypes = {
  group: PropTypes.shape({
    label: PropTypes.string.isRequired,
    rules: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        knownIssues: PropTypes.arrayOf(PropTypes.string).isRequired,
        result: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

export default function ComponentAccessibilityStatus(props) {
  const { name, markdown } = props;
  const headers = markdown?.headers || {};

  let componentName = name || null;
  if (!componentName && headers.githubSource) {
    componentName = headers.githubSource.split('/').pop();
  }
  if (!componentName && headers.components) {
    componentName = headers.components.split(',')[0].trim();
  }

  const data = a11yResults[componentName];
  if (!data) {
    return null;
  }

  const groups = groupRulesByLevel(data);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography>
        The accessibility test is done by{' '}
        <Link href="https://www.deque.com/axe/" target="_blank" rel="noopener">
          Axe
        </Link>
        . Expand the sections below to see the details of the tested rules.
      </Typography>
      <LevelAccordion group={groups.aa} />
      <LevelAccordion group={groups.aaa} />
    </Box>
  );
}

ComponentAccessibilityStatus.propTypes = {
  markdown: PropTypes.shape({
    headers: PropTypes.shape({
      components: PropTypes.string,
      githubSource: PropTypes.string,
    }),
  }),
  name: PropTypes.string,
};
