import * as React from 'react';
import MDButton from '@mui/material/Button';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { alpha, styled } from '@mui/material/styles';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';

export interface DemoA11yResult {
  slug: string;
  demo: string;
  passedRules: string[];
  failedRules: string[];
  testedRules: Record<string, string[]>;
}

const WCAG_LABEL: Record<string, string> = {
  wcag2a: 'WCAG 2.0 A',
  wcag2aa: 'WCAG 2.0 AA',
  wcag2aaa: 'WCAG 2.0 AAA',
  wcag21a: 'WCAG 2.1 A',
  wcag21aa: 'WCAG 2.1 AA',
  wcag22a: 'WCAG 2.2 A',
  wcag22aa: 'WCAG 2.2 AA',
};

function tagLabel(tag: string) {
  return WCAG_LABEL[tag] ?? tag.toUpperCase();
}

const Pill = styled(MDButton, {
  shouldForwardProp: (prop) => prop !== 'hasFailures',
})<{ hasFailures?: boolean }>(({ theme, hasFailures }) => ({
  height: 26,
  padding: '7px 8px 8px 8px',
  flexShrink: 0,
  borderRadius: 999,
  border: '1px solid',
  borderColor: hasFailures
    ? alpha(theme.palette.error.main, 0.4)
    : alpha(theme.palette.grey[200], 0.8),
  fontSize: theme.typography.pxToRem(13),
  fontWeight: theme.typography.fontWeightMedium,
  color: hasFailures ? theme.palette.error.main : theme.palette.primary[600],
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  '& .MuiSvgIcon-root': {
    fontSize: 14,
    color: hasFailures ? theme.palette.error.main : theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: hasFailures
      ? alpha(theme.palette.error.main, 0.08)
      : theme.palette.primary[50],
    borderColor: hasFailures ? alpha(theme.palette.error.main, 0.6) : theme.palette.primary[200],
    '@media (hover: none)': {
      backgroundColor: 'transparent',
    },
  },
  ...theme.applyDarkStyles({
    color: hasFailures ? theme.palette.error[300] : theme.palette.primary[300],
    borderColor: hasFailures
      ? alpha(theme.palette.error[300], 0.4)
      : alpha(theme.palette.primary[300], 0.2),
    '& .MuiSvgIcon-root': {
      color: hasFailures ? theme.palette.error[300] : theme.palette.primary[300],
    },
    '&:hover': {
      borderColor: hasFailures
        ? alpha(theme.palette.error[300], 0.6)
        : alpha(theme.palette.primary[300], 0.5),
      backgroundColor: hasFailures
        ? alpha(theme.palette.error[300], 0.16)
        : alpha(theme.palette.primary[500], 0.2),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
  }),
}));

interface RuleListProps {
  rules: string[];
  failed: boolean;
}

function RuleList({ rules, failed }: RuleListProps) {
  return (
    <Box
      component="ul"
      sx={{ listStyle: 'none', m: 0, pl: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}
    >
      {rules.map((rule) => (
        <Box
          key={rule}
          component="li"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            fontSize: 12,
          }}
        >
          {failed ? (
            <ErrorRoundedIcon sx={{ fontSize: 14, color: 'error.main' }} />
          ) : (
            <CheckCircleRoundedIcon sx={{ fontSize: 14, color: 'success.main' }} />
          )}
          <Box component="code" sx={{ fontSize: 12 }}>
            {rule}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

interface A11yContentProps {
  data: DemoA11yResult;
}

function A11yContent({ data }: A11yContentProps) {
  const total = data.passedRules.length + data.failedRules.length;
  const failed = data.failedRules.length > 0;
  const failedSet = new Set(data.failedRules);
  const tags = Object.keys(data.testedRules);

  return (
    <Box sx={{ p: 1.5, width: 280 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {failed ? (
          <ErrorRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
        ) : (
          <CheckCircleRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />
        )}
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {failed
            ? `${data.failedRules.length} of ${total} failed`
            : `${data.passedRules.length} of ${total} passed`}
        </Typography>
      </Box>
      {failed && (
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            sx={{ display: 'block', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5 }}
          >
            Failures
          </Typography>
          <RuleList rules={data.failedRules} failed />
          <Divider sx={{ my: 1 }} />
        </Box>
      )}
      {tags.map((tag) => {
        const ruleIds = data.testedRules[tag] ?? [];
        if (ruleIds.length === 0) {
          return null;
        }
        const passedInTag = ruleIds.filter((id) => !failedSet.has(id));
        return (
          <Box key={tag} sx={{ mb: 1, '&:last-child': { mb: 0 } }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textTransform: 'uppercase',
                color: 'text.secondary',
                mb: 0.5,
              }}
            >
              {tagLabel(tag)} ({ruleIds.length})
            </Typography>
            <RuleList rules={passedInTag} failed={false} />
          </Box>
        );
      })}
      <Divider sx={{ my: 1 }} />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Audited by axe-core in CI
      </Typography>
    </Box>
  );
}

export interface DemoA11yButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'> {
  data: DemoA11yResult;
}

export const DemoA11yButton = React.forwardRef<HTMLButtonElement, DemoA11yButtonProps>(
  function DemoA11yButton(props, ref) {
    const { data, ...other } = props;
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const total = data.passedRules.length + data.failedRules.length;
    const passed = data.passedRules.length;
    const hasFailures = data.failedRules.length > 0;

    return (
      <React.Fragment>
        <Pill
          {...other}
          ref={ref}
          hasFailures={hasFailures}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-haspopup="dialog"
          aria-expanded={anchorEl ? true : undefined}
          aria-label={
            hasFailures
              ? `Accessibility: ${data.failedRules.length} of ${total} rules failed`
              : `Accessibility: ${passed} of ${total} rules passed`
          }
          data-ga-event-category="demo"
          data-ga-event-action="a11y-open"
          data-ga-event-label={`${data.slug}/${data.demo}`}
          sx={{ mr: 0.5 }}
        >
          <AccessibilityNewRoundedIcon />
          <span>
            {passed}/{total}
          </span>
        </Pill>
        <Popper
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          placement="bottom-end"
          sx={{ zIndex: (theme) => theme.zIndex.modal }}
        >
          <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <Paper
              elevation={8}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setAnchorEl(null);
                }
              }}
              sx={{ mt: 0.5 }}
            >
              <A11yContent data={data} />
            </Paper>
          </ClickAwayListener>
        </Popper>
      </React.Fragment>
    );
  },
);
