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
    expect(resolveA11y('/docs-components-accordion/BasicAccordion')).to.equal(null);
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
    expect(resolveA11y('/docs-components-buttons/ColorButtons')).to.deep.equal({
      slug: 'buttons',
      demoName: 'ColorButtons',
      skipAssertions: undefined,
    });
  });
});

describe('rule data sanity', () => {
  it('rule arrays are non-empty (catches accidental import regression)', () => {
    expect(SCREENSHOT_RULES.length).to.be.greaterThan(0);
    expect(A11Y_RULES.length).to.be.greaterThan(0);
  });
});
