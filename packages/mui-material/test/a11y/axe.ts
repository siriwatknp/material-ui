import axe, { type AxeResults } from 'axe-core';
import { expect } from 'chai';
import type * as React from 'react';
import type { TestContext } from 'vitest';

// Rules that depend on page-level usage, not component correctness (e.g. `region`
// requires a landmark, `page-has-heading-one` requires an `<h1>`). Disabled
// globally so they never fail for isolated component renders.
axe.configure({
  rules: [
    { id: 'region', enabled: false },
    { id: 'page-has-heading-one', enabled: false },
  ],
});

export const VISUAL_RULES = ['color-contrast', 'link-in-text-block'];

const JSDOM_INCOMPATIBLE_RULES = [...VISUAL_RULES];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export interface A11yScenario {
  id: string;
  render: () => React.ReactElement<{ [key: `data-${string}`]: string }>;
  /** Skip the visual-violations assertion (still records the result). */
  skipAssert?: boolean;
}

export interface A11yScenarioModule {
  component: string;
  scenarios: A11yScenario[];
}

export function describeA11y(
  component: string,
  options: { scenarios: A11yScenario[] },
): A11yScenarioModule {
  return { component, scenarios: options.scenarios };
}

export interface A11yMeta {
  component: string;
  scenario: string;
  collectedRules: string[];
  testedRules: Record<string, string[]>;
  violations: string[];
}

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
    runOnly: {
      type: 'tag',
      values: WCAG_TAGS,
    },
    rules: Object.fromEntries(
      [...JSDOM_INCOMPATIBLE_RULES, ...(disabledRules || [])].map((rule) => [
        rule,
        { enabled: false },
      ]),
    ),
  });
  assertNoViolations(results);
}

interface RecordA11yOptions {
  component: string;
  scenario: string;
  /** Skip the visual-violations assertion (still records the result). */
  skipAssert?: boolean;
}

/**
 * Single-pass a11y check for browser tests.
 *
 * Runs axe-core once with the full WCAG rule set, records a structured
 * summary on `ctx.task.meta.a11y`, and asserts no visual violations
 * (unless `skipAssert` is set). The accompanying reporter
 * (`a11yReporter.ts`) aggregates all `task.meta.a11y` entries into
 * `a11y-results.json` at the end of the run.
 */
export async function recordA11y(
  ctx: TestContext,
  container: HTMLElement,
  { component, scenario, skipAssert = false }: RecordA11yOptions,
): Promise<void> {
  const results: AxeResults = await axe.run(container, {
    runOnly: { type: 'tag', values: WCAG_TAGS },
  });

  const collectedRules = new Set<string>();
  const testedRules = new Map<string, Set<string>>();
  for (const list of [results.passes, results.violations, results.incomplete]) {
    for (const rule of list) {
      collectedRules.add(rule.id);
      for (const tag of rule.tags) {
        if (WCAG_TAGS.includes(tag)) {
          if (!testedRules.has(tag)) {
            testedRules.set(tag, new Set());
          }
          testedRules.get(tag)!.add(rule.id);
        }
      }
    }
  }

  const violations = [...new Set([...results.violations, ...results.incomplete].map((v) => v.id))];

  const meta: A11yMeta = {
    component,
    scenario,
    collectedRules: [...collectedRules],
    testedRules: Object.fromEntries(
      [...testedRules.entries()].map(([tag, ids]) => [tag, [...ids]]),
    ),
    violations,
  };
  (ctx.task.meta as { a11y?: A11yMeta }).a11y = meta;

  if (!skipAssert) {
    const visualOnly = results.violations.filter((v) => VISUAL_RULES.includes(v.id));
    const visualIncomplete = results.incomplete.filter((v) => VISUAL_RULES.includes(v.id));
    assertNoViolations({
      ...results,
      violations: visualOnly,
      incomplete: visualIncomplete,
    });
  }
}
