import { describe, it } from 'vitest';
import { expect } from 'chai';
import { A11Y_RULES, SCREENSHOT_RULES, resolveA11y, shouldScreenshot } from './demoMeta';

describe('shouldScreenshot', () => {
  it('returns true for non-component routes (regression fixtures)', () => {
    expect(shouldScreenshot('/regression-Autocomplete/Virtualize')).to.equal(true);
  });

  it('returns true by default for demos with no matching rule', () => {
    expect(shouldScreenshot('/docs-components-accordion/BasicAccordion')).to.equal(true);
  });

  it('honours an opt-out rule', () => {
    expect(shouldScreenshot('/docs-components-autocomplete/Asynchronous')).to.equal(false);
  });
});

describe('resolveA11y', () => {
  it('returns null for non-component routes', () => {
    expect(resolveA11y('/regression-Rating/FocusVisibleRating')).to.equal(null);
  });

  it('returns null for slugs with no matching rule', () => {
    expect(resolveA11y('/docs-components-container/SimpleContainer')).to.equal(null);
  });

  it('returns null for demos outside a brace-glob enrolment', () => {
    // `buttons` enrols only {BasicButtons,ColorButtons}.
    expect(resolveA11y('/docs-components-buttons/DisabledButtons')).to.equal(null);
  });

  it('returns config for a brace-glob enrolment', () => {
    expect(resolveA11y('/docs-components-buttons/BasicButtons')).to.deep.equal({
      slug: 'buttons',
      demoName: 'BasicButtons',
      skipAssertions: undefined,
    });
  });

  it('inherits slug-wide skipAssertions when no per-demo override exists', () => {
    expect(resolveA11y('/docs-components-accordion/BasicAccordion')).to.deep.equal({
      slug: 'accordion',
      demoName: 'BasicAccordion',
      skipAssertions: ['color-contrast'],
    });
  });

  it('returns null when a per-demo opt-out rule sets enabled: false', () => {
    expect(resolveA11y('/docs-components-popover/AnchorPlayground')).to.equal(null);
  });

  it('runs independently of screenshots — opt-out for one tool does not affect the other', () => {
    expect(shouldScreenshot('/docs-components-autocomplete/Asynchronous')).to.equal(false);
    expect(resolveA11y('/docs-components-autocomplete/Asynchronous')).to.deep.equal({
      slug: 'autocomplete',
      demoName: 'Asynchronous',
      skipAssertions: ['color-contrast'],
    });
  });
});

describe('rule precedence (last-match-wins, field merge)', () => {
  it('a later rule overrides an earlier rule per field, leaving untouched fields intact', () => {
    // `chips/*` sets {enabled, skipAssertions}; `chips/ChipsPlayground` sets only
    // {enabled: false}. The opt-out wins on enabled but doesn't repeat skipAssertions.
    expect(resolveA11y('/docs-components-chips/ChipsPlayground')).to.equal(null);
    expect(resolveA11y('/docs-components-chips/BasicChips')).to.deep.equal({
      slug: 'chips',
      demoName: 'BasicChips',
      skipAssertions: ['color-contrast'],
    });
  });
});

describe('rule data sanity', () => {
  it('rule arrays are non-empty (catches accidental import regression)', () => {
    expect(SCREENSHOT_RULES.length).to.be.greaterThan(0);
    expect(A11Y_RULES.length).to.be.greaterThan(0);
  });
});
