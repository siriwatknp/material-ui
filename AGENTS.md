# AGENTS.md

This file provides guidance for AI agents working with code in this repository.

## Package Manager

**Only pnpm is supported** (yarn/npm will fail). Use the `-F` flag for workspace operations:

```bash
pnpm -F @mui/material add some-package    # Add dependency to a package
pnpm -F @mui/material build               # Build a specific package
```

Never use `cd` to navigate into package directories for commands.

## Common Commands

### Development

```bash
pnpm install                  # Install deps if necessary
pnpm docs:dev                 # Start docs dev server only
```

### Building

```bash
pnpm release:build            # Build all packages (except docs)
pnpm docs:build               # Build documentation site
```

### Testing

```bash
pnpm test:unit                # Run all unit tests (jsdom)
pnpm test:unit ComponentName  # Run tests matching pattern
pnpm test:unit -t "test name" # Grep for specific test name
pnpm test:browser             # Run tests in real browsers (Chrome, Firefox, WebKit)
pnpm test:e2e                 # End-to-end tests
pnpm test:regressions         # Visual regression tests
```

### Code Quality

```bash
pnpm prettier                 # Format staged changes
pnpm eslint                   # Lint with cache
pnpm typescript               # Type check all packages
```

### API Documentation

After changing component props or TypeScript declarations:

```bash
pnpm proptypes && pnpm docs:api
```

### Docs demos

Always author the TypeScript version of the demos. To generate the JavaScript variant, run:

```bash
pnpm docs:typescript:formatted
```

## Architecture

This is a monorepo managed by Lerna with Nx for caching. Key packages:

- `@mui/material` - Core Material UI components
- `@mui/system` - Styling system (sx prop, styled, theme)
- `@mui/lab` - Experimental components (new components go here first)
- `@mui/icons-material` - Material Design icons
- `@mui/utils` - Internal utilities
- `@mui/styled-engine` - CSS-in-JS abstraction (Emotion by default)

Internal packages (not published): `@mui-internal/*`, `@mui/internal-*`

## Code Conventions

### TypeScript

- Use `interface` (not `type`) for component props
- Export `{ComponentName}Props` interface from component files
- Path aliases available: `@mui/material` → `./packages/mui-material/src`

### Errors

These guidelines only apply for errors thrown from public packages.

Every error message must:

1. **Say what happened** - Describe the problem clearly
2. **Say why it's a problem** - Explain the consequence
3. **Point toward how to solve it** - Give actionable guidance

Format:

<!-- markdownlint-disable MD038 -->

- Prefix with `MUI: `
- Use string concatenation for readability
- Include a documentation link when applicable (`https://mui.com/r/...`)

#### Error Minifier

Use the `/* minify-error */` comment to activate the babel plugin:

```tsx
throw /* minify-error */ new Error(
  'MUI: Expected valid input target. ' +
    'Did you use a custom `inputComponent` and forget to forward refs? ' +
    'See https://mui.com/r/input-component-ref-interface for more info.',
);
```

The minifier works with both `Error` and `TypeError` constructors.

#### After Adding/Updating Errors

Run `pnpm extract-error-codes` to update `docs/public/static/error-codes.json`.

**Important:** If the update created a new error code, but the new and original message have the same number of arguments and semantics haven't changed, update the original error in `error-codes.json` instead of creating a new code.

### Component Structure

```text
packages/mui-material/src/Button/
├── Button.tsx           # Component implementation
├── Button.d.ts          # TypeScript declarations (for JSDoc API docs)
├── Button.test.js       # Unit tests
├── buttonClasses.ts     # CSS classes
└── index.ts             # Public exports
```

### Testing

- Use `createRenderer()` from `@mui/internal-test-utils`
- Use Chai BDD-style assertions (`expect(x).to.equal(y)`)
- Custom matchers: `toErrorDev()`, `toWarnDev()` for console assertions

```js
import { createRenderer } from '@mui/internal-test-utils';

describe('Button', () => {
  const { render } = createRenderer();

  it('renders children', () => {
    const { getByRole } = render(<Button>Hello</Button>);
    expect(getByRole('button')).to.have.text('Hello');
  });
});
```

### Accessibility Testing

Automated axe-core coverage runs inside the visual-regression Playwright loop in `test/regressions/index.test.js`. For each enrolled demo, `axe.run` runs on the rendered `[data-testid="testcase"]` element — no separate browser session is spun up. A11y can run independently of screenshots: a demo can be screenshot-excluded (flaky image, redundant) and still be audited by axe.

- `test/regressions/demoMeta.ts` — two independent rule arrays, `SCREENSHOT_RULES` and `A11Y_RULES`, evaluated last-match-wins with field-merge against the docs path `docs/data/material/components/{slug}/{Demo}` (minimatch globs). Keeping screenshot and a11y in separate arrays means editing one tool can't stomp the other. `shouldScreenshot(route)` and `resolveA11y(route)` are the resolvers the test runner uses.
- `test/regressions/a11y/axe.ts` — `recordA11y` records per-demo results onto `ctx.task.meta.a11y` and asserts visual rules (`color-contrast`, `link-in-text-block`) unless listed in `skipAssertions`.
- `test/regressions/a11y/a11yReporter.ts` — Vitest reporter (attached in `test/regressions/vitest.config.ts`) that writes one file per demo at `docs/data/material/a11y/{slug}-{Demo}.json`. Files are slug-prefixed to prevent collisions when two components share a demo name (e.g. `switches-FormControlLabelPosition.json` vs `checkboxes-FormControlLabelPosition.json`). Downstream docs consumers can lazy-import a single demo's file.

Enroll a component: add a slug-wide rule to `A11Y_RULES`.

```ts
// test/regressions/demoMeta.ts
{ test: 'docs/data/material/components/alert/*',
  enabled: true,
  skipAssertions: ['color-contrast'] }, // optional: record known issues without failing CI
```

Narrow enrolment to specific demos with a brace-glob (used today for `buttons` and `cards`):

```ts
{ test: 'docs/data/material/components/buttons/{BasicButtons,ColorButtons}', enabled: true },
```

Enrol an interaction-heavy slug (screenshots can't run but a11y can): un-negate the slug in `index.jsx`, add the a11y rule above, and add a `SCREENSHOT_RULES` opt-out per demo. Screenshots and a11y are independent — a demo with screenshot off still runs axe.

Override a specific demo in an otherwise-enrolled slug — append a per-demo opt-out _after_ the slug-wide rule (last-match-wins). Field merge means you only repeat what changes:

```ts
// keeps the slug-wide skipAssertions; only flips enabled to false for this demo.
{ test: 'docs/data/material/components/popover/AnchorPlayground', enabled: false }, // Redux isolation
```

Then run `pnpm test:regressions` to refresh `docs/data/material/a11y/`. CI enforces the directory is up to date via a git-diff check.

### Imports

Use one-level deep imports to avoid bundling entire packages:

```js
import Button from '@mui/material/Button'; // Good
import { Button } from '@mui/material'; // Avoid in packages
```

## Pre-PR Checklist

1. `pnpm prettier` - Format code
2. `pnpm eslint` - Pass linting
3. `pnpm typescript` - Pass type checking
4. `pnpm test:unit` - Pass unit tests
5. If API changed: `pnpm proptypes && pnpm docs:api`
6. If demos changed: `pnpm docs:typescript:formatted`
7. If `.md` files changed: `pnpm vale <file1> <file2> ...` - Check prose style and grammar

## PR Title Format

`[product-name][Component] Imperative description`

Examples:

- `[material-ui][Button] Add loading state`
- `[docs] Fix typo in Grid documentation`
