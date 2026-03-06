import { server } from 'vitest/browser';
import type { AxeCollector } from './axe';

const A11Y_RESULTS_PATH = './test/a11y-results.json';

interface FlushAxeResultsOptions {
  component: string;
  collector: AxeCollector;
}

/**
 * Writes collected axe rule results to a JSON file via Vitest's browser server commands.
 * This file lives in a separate module from axe.ts because it imports `vitest/browser`
 * which is only available in browser tests — axe.ts is shared with jsdom tests.
 */
export async function flushAxeResults({ component, collector }: FlushAxeResultsOptions) {
  const collectedRules = collector.getCollectedRules();
  const failedRules = collector.getFailedRulesMap();
  const testedRules = collector.getTestedRules();

  const existing = await server.commands.readFile(A11Y_RESULTS_PATH).catch(() => '{}');
  const all = JSON.parse(existing);
  const failedRuleIds = new Set(Object.keys(failedRules));
  const allRules = new Set([...collectedRules, ...failedRuleIds]);
  const passedRules = [...allRules].filter((r) => !failedRuleIds.has(r));
  all[component] = {
    passed: passedRules.length,
    failed: failedRuleIds.size,
    total: allRules.size,
    passedRules,
    failedRules,
    testedRules,
  };
  await server.commands.writeFile(A11Y_RESULTS_PATH, JSON.stringify(all, null, 2));
  collector.clear();
}
