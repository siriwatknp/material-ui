import axe, { type AxeResults } from 'axe-core';
import { expect } from 'chai';

const JSDOM_INCOMPATIBLE_RULES = ['color-contrast', 'link-in-text-block', 'region'];
const VISUAL_RULES = ['color-contrast', 'link-in-text-block'];

function formatNode(node: AxeResults['violations'][number]['nodes'][number]): string {
  const lines = [`    HTML: ${node.html}`];
  if (node.failureSummary) {
    lines.push(`    Summary: ${node.failureSummary.replace(/\n/g, '\n      ')}`);
  }
  const checks = [...node.any, ...node.all, ...node.none];
  for (const check of checks) {
    lines.push(`    - ${check.message}`);
    if (check.data && typeof check.data === 'object') {
      const { fgColor, bgColor, contrastRatio, fontSize, fontWeight, expectedContrastRatio } =
        check.data;
      if (contrastRatio !== undefined) {
        lines.push(
          `      Foreground: ${fgColor}, Background: ${bgColor}, Ratio: ${contrastRatio}, Expected: ${expectedContrastRatio}, Font: ${fontSize} / ${fontWeight}`,
        );
      }
    }
  }
  return lines.join('\n');
}

function formatResults(results: AxeResults['violations']) {
  return results
    .map((v) => {
      const header = `  [${v.id}] ${v.help} (${v.impact})\n  ${v.helpUrl}`;
      const nodes = v.nodes.map((n) => formatNode(n)).join('\n\n');
      return `${header}\n\n${nodes}`;
    })
    .join('\n\n');
}

function assertNoViolations(results: AxeResults) {
  if (results.violations.length > 0) {
    expect.fail(
      `${results.violations.length} axe violation(s):\n\n${formatResults(results.violations)}`,
    );
  }
  if (results.incomplete.length > 0) {
    expect.fail(
      `${results.incomplete.length} axe incomplete (needs review):\n\n${formatResults(results.incomplete)}`,
    );
  }
}

export async function expectNoAxeViolations(container: HTMLElement, disabledRules?: string[]) {
  const results: AxeResults = await axe.run(container, {
    rules: Object.fromEntries(
      [...JSDOM_INCOMPATIBLE_RULES, ...(disabledRules || [])].map((rule) => [
        rule,
        { enabled: false },
      ]),
    ),
  });
  assertNoViolations(results);
}

export async function expectNoVisualAxeViolations(container: HTMLElement) {
  const results: AxeResults = await axe.run(container, {
    runOnly: VISUAL_RULES,
  });
  assertNoViolations(results);
}
