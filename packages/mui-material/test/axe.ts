import axe, { type AxeResults } from 'axe-core';
import { expect } from 'chai';

const JSDOM_INCOMPATIBLE_RULES = ['color-contrast', 'link-in-text-block', 'region'];

export default async function expectNoAxeViolations(
  container: HTMLElement,
  disabledRules?: string[],
) {
  const results: AxeResults = await axe.run(container, {
    rules: Object.fromEntries(
      [...JSDOM_INCOMPATIBLE_RULES, ...(disabledRules || [])].map((rule) => [
        rule,
        { enabled: false },
      ]),
    ),
  });
  expect(results.violations).to.have.lengthOf(
    0,
    results.violations
      .map(
        (v) =>
          `[${v.id}] ${v.help} (${v.impact})\n  ${v.helpUrl}\n  ${v.nodes.map((n) => n.html).join('\n  ')}`,
      )
      .join('\n\n'),
  );
}
