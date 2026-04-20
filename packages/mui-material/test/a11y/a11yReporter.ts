import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import type { Reporter, TestCase, TestModule, TestSuite } from 'vitest/node';
import type { A11yMeta } from './axe';

const OUT = path.resolve(__dirname, 'a11y-results.json');

interface ComponentResult {
  passed: number;
  failed: number;
  total: number;
  passedRules: string[];
  failedRules: Record<string, string[]>;
  testedRules: Record<string, string[]>;
}

function* walkTests(node: TestModule | TestSuite): Generator<TestCase, undefined, void> {
  for (const child of node.children) {
    if (child.type === 'test') {
      yield child;
    } else if (child.type === 'suite') {
      yield* walkTests(child);
    }
  }
}

function aggregate(entries: A11yMeta[]): ComponentResult {
  const collected = new Set<string>();
  const tested: Record<string, Set<string>> = {};
  const failed = new Map<string, string[]>();

  for (const entry of entries) {
    for (const rule of entry.collectedRules) {
      collected.add(rule);
    }
    for (const [tag, ids] of Object.entries(entry.testedRules)) {
      if (!tested[tag]) {
        tested[tag] = new Set();
      }
      for (const id of ids) {
        tested[tag].add(id);
      }
    }
    for (const rule of entry.violations) {
      const list = failed.get(rule) ?? [];
      list.push(entry.scenario);
      failed.set(rule, list);
    }
  }

  const failedIds = new Set(failed.keys());
  const passedRules = [...collected].filter((r) => !failedIds.has(r));

  return {
    passed: passedRules.length,
    failed: failedIds.size,
    total: collected.size,
    passedRules,
    failedRules: Object.fromEntries(failed),
    testedRules: Object.fromEntries(Object.entries(tested).map(([tag, ids]) => [tag, [...ids]])),
  };
}

export default class A11yReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>) {
    const byComponent = new Map<string, A11yMeta[]>();
    for (const mod of testModules) {
      for (const test of walkTests(mod)) {
        const meta = (test.meta() as { a11y?: A11yMeta }).a11y;
        if (meta) {
          const list = byComponent.get(meta.component) ?? [];
          list.push(meta);
          byComponent.set(meta.component, list);
        }
      }
    }

    const output: Record<string, ComponentResult> = {};
    for (const component of [...byComponent.keys()].sort()) {
      output[component] = aggregate(byComponent.get(component)!);
    }

    fs.writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`);

    const names = Object.keys(output);
    const pass = names.filter((n) => output[n].failed === 0);
    const partial = names.filter((n) => output[n].failed > 0);
    // eslint-disable-next-line no-console
    console.log(
      [
        '',
        chalk.bold(
          `a11y results (${names.length} components) -> ${path.relative(process.cwd(), OUT)}`,
        ),
        '',
        `  ✅ Pass (${pass.length}):     ${pass.join(', ') || '—'}`,
        `  ⚠️  Partial (${partial.length}):  ${partial.join(', ') || '—'}`,
        '',
      ].join('\n'),
    );
  }
}
