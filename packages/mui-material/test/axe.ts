import axe, { type AxeResults } from 'axe-core';
import { expect } from 'chai';

const JSDOM_INCOMPATIBLE_RULES = ['color-contrast', 'link-in-text-block', 'region'];
export const VISUAL_RULES = ['color-contrast', 'link-in-text-block'];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export interface AxeCollector {
  collectAxeRules: (
    container: HTMLElement,
    testName: string,
    options?: { rules?: string[] },
  ) => Promise<void>;
  getCollectedRules: () => string[];
  getFailedRulesMap: () => Record<string, string[]>;
  getTestedRules: () => Record<string, string[]>;
  clear: () => void;
}

export function createAxeCollector(): AxeCollector {
  const collectedRules = new Set<string>();
  const failedRulesMap = new Map<string, string[]>();
  const testedRules = new Map<string, Set<string>>();

  function addRules(results: AxeResults) {
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
  }

  return {
    async collectAxeRules(
      container: HTMLElement,
      testName: string,
      options?: { rules?: string[] },
    ) {
      const { rules } = options || {};
      const results: AxeResults = await axe.run(container, {
        runOnly: rules || { type: 'tag', values: WCAG_TAGS },
        rules: rules ? undefined : { region: { enabled: false } },
      });
      addRules(results);
      for (const v of results.violations) {
        const tests = failedRulesMap.get(v.id) || [];
        tests.push(testName);
        failedRulesMap.set(v.id, tests);
      }
    },
    getCollectedRules: () => [...collectedRules],
    getFailedRulesMap: () => Object.fromEntries(failedRulesMap),
    getTestedRules: () => {
      const result: Record<string, string[]> = {};
      for (const [tag, rules] of testedRules) {
        result[tag] = [...rules];
      }
      return result;
    },
    clear: () => {
      collectedRules.clear();
      failedRulesMap.clear();
      testedRules.clear();
    },
  };
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

export async function expectNoVisualAxeViolations(container: HTMLElement) {
  const results: AxeResults = await axe.run(container, {
    runOnly: VISUAL_RULES,
  });
  assertNoViolations(results);
}
