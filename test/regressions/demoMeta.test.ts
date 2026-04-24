import { afterEach, describe, it } from 'vitest';
import { expect } from 'chai';
import { DEMO_META, SLUG_A11Y, resolveA11y, shouldScreenshot } from './demoMeta';
import type { SlugA11y } from './demoMeta';

describe('shouldScreenshot', () => {
  it('returns true for non-component routes (regression fixtures)', () => {
    expect(shouldScreenshot('/regression-Autocomplete/Virtualize')).to.equal(true);
  });

  it('returns true by default for enrolled demos with no DEMO_META entry', () => {
    expect(shouldScreenshot('/docs-components-accordion/BasicAccordion')).to.equal(true);
  });

  it('honours a demo-level screenshot.enabled=false override', () => {
    // autocomplete/Asynchronous is a `noShot` entry (Redundant screenshot).
    expect(shouldScreenshot('/docs-components-autocomplete/Asynchronous')).to.equal(false);
  });

  describe('slug-level screenshot override', () => {
    const slugKey = 'docs/data/material/components/dialogs';
    const demoKey = 'docs/data/material/components/dialogs/FormDialog';

    afterEach(() => {
      DEMO_META.delete(slugKey);
      DEMO_META.delete(demoKey);
    });

    it('applies to every demo in the slug', () => {
      DEMO_META.set(slugKey, { screenshot: { enabled: false } });
      expect(shouldScreenshot('/docs-components-dialogs/AlertDialog')).to.equal(false);
      expect(shouldScreenshot('/docs-components-dialogs/FormDialog')).to.equal(false);
    });

    it('is overridden by a demo-level entry when both exist', () => {
      DEMO_META.set(slugKey, { screenshot: { enabled: false } });
      DEMO_META.set(demoKey, { screenshot: { enabled: true } });
      expect(shouldScreenshot('/docs-components-dialogs/AlertDialog')).to.equal(false);
      expect(shouldScreenshot('/docs-components-dialogs/FormDialog')).to.equal(true);
    });
  });
});

describe('resolveA11y', () => {
  it('returns null for non-component routes', () => {
    expect(resolveA11y('/regression-Rating/FocusVisibleRating')).to.equal(null);
  });

  it('returns null for slugs absent from SLUG_A11Y', () => {
    // `container` is glob-negated and not a11y-enrolled; absence is the same
    // runtime signal we'd see if the route weren't in the bundle.
    expect(resolveA11y('/docs-components-container/SimpleContainer')).to.equal(null);
  });

  it('returns null for demos not in the slug `demos` filter', () => {
    // `buttons` enrolment is narrowed to ['BasicButtons', 'ColorButtons'].
    expect(resolveA11y('/docs-components-buttons/DisabledButtons')).to.equal(null);
  });

  it('returns a config for demos inside a narrowed slug enrolment', () => {
    expect(resolveA11y('/docs-components-buttons/BasicButtons')).to.deep.equal({
      component: 'Button',
      demoName: 'BasicButtons',
      skipAssertions: undefined,
    });
  });

  it('inherits slug-level skipAssertions when the demo has no override', () => {
    expect(resolveA11y('/docs-components-accordion/BasicAccordion')).to.deep.equal({
      component: 'Accordion',
      demoName: 'BasicAccordion',
      skipAssertions: ['color-contrast'],
    });
  });

  it('returns null when DEMO_META disables a11y per-demo (noTools)', () => {
    // popover is enrolled; AnchorPlayground is noTools (Redux isolation).
    expect(resolveA11y('/docs-components-popover/AnchorPlayground')).to.equal(null);
  });

  it('runs independently of screenshots (separation of exclusions)', () => {
    // The core migration promise: screenshot off does not drop a11y coverage.
    expect(shouldScreenshot('/docs-components-autocomplete/Asynchronous')).to.equal(false);
    expect(resolveA11y('/docs-components-autocomplete/Asynchronous')).to.deep.equal({
      component: 'Autocomplete',
      demoName: 'Asynchronous',
      skipAssertions: ['color-contrast'],
    });
  });
});

describe('future workflow: enabling a11y for `dialogs` (screenshot-off slug)', () => {
  // Simulates the 3-line change documented in AGENTS.md:
  //   1. Un-negate the slug in `index.jsx`        (out of this test's scope)
  //   2. Add the slug to SLUG_A11Y
  //   3. Add a slug-level `noShot` entry to DEMO_META
  const slugKey = 'docs/data/material/components/dialogs';
  const customKey = 'docs/data/material/components/dialogs/CustomizedDialogs';
  const original: SlugA11y | undefined = SLUG_A11Y.get('dialogs');

  afterEach(() => {
    DEMO_META.delete(slugKey);
    DEMO_META.delete(customKey);
    if (original) {
      SLUG_A11Y.set('dialogs', original);
    } else {
      SLUG_A11Y.delete('dialogs');
    }
  });

  it('enables a11y on every dialog demo while every screenshot stays off', () => {
    SLUG_A11Y.set('dialogs', { component: 'Dialog', skipAssertions: ['color-contrast'] });
    DEMO_META.set(slugKey, { screenshot: { enabled: false } });

    expect(shouldScreenshot('/docs-components-dialogs/AlertDialog')).to.equal(false);
    expect(shouldScreenshot('/docs-components-dialogs/ScrollDialog')).to.equal(false);

    expect(resolveA11y('/docs-components-dialogs/AlertDialog')).to.deep.equal({
      component: 'Dialog',
      demoName: 'AlertDialog',
      skipAssertions: ['color-contrast'],
    });
    expect(resolveA11y('/docs-components-dialogs/ScrollDialog')).to.deep.equal({
      component: 'Dialog',
      demoName: 'ScrollDialog',
      skipAssertions: ['color-contrast'],
    });
  });

  it('supports per-demo a11y exceptions inside the enrolled slug', () => {
    SLUG_A11Y.set('dialogs', { component: 'Dialog', skipAssertions: ['color-contrast'] });
    DEMO_META.set(slugKey, { screenshot: { enabled: false } });
    // Hypothetical: one dialog demo can't render standalone, skip a11y too.
    DEMO_META.set(customKey, {
      screenshot: { enabled: false },
      a11y: { enabled: false },
    });

    expect(resolveA11y('/docs-components-dialogs/CustomizedDialogs')).to.equal(null);
    expect(resolveA11y('/docs-components-dialogs/AlertDialog')).to.not.equal(null);
  });
});
