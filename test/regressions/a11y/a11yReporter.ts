import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import type { Reporter, TestCase, TestModule, TestSuite } from 'vitest/node';
import type { A11yMeta } from './axe';

const OUT_DIR = path.resolve(__dirname, '../../../docs/data/material/a11y');

interface DemoResult {
  passedRules: string[];
  failedRules: string[];
  testedRules: Record<string, string[]>;
}

interface ComponentResult {
  passed: number;
  failed: number;
  total: number;
  passedRules: string[];
  failedRules: Record<string, string[]>;
  testedRules: Record<string, string[]>;
  demos: Record<string, DemoResult>;
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
  const demos: Record<string, DemoResult> = {};

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
      list.push(entry.demo);
      failed.set(rule, list);
    }

    const violationSet = new Set(entry.violations);
    demos[entry.demo] = {
      passedRules: entry.collectedRules.filter((r) => !violationSet.has(r)).sort(),
      failedRules: [...entry.violations].sort(),
      testedRules: entry.testedRules,
    };
  }

  const failedIds = new Set(failed.keys());
  const passedRules = [...collected].filter((r) => !failedIds.has(r)).sort();

  return {
    passed: passedRules.length,
    failed: failedIds.size,
    total: collected.size,
    passedRules,
    failedRules: Object.fromEntries(failed),
    testedRules: Object.fromEntries(Object.entries(tested).map(([tag, ids]) => [tag, [...ids]])),
    demos,
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

    if (byComponent.size === 0) {
      return;
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });

    const names = [...byComponent.keys()].sort();
    const results: Record<string, ComponentResult> = {};
    for (const component of names) {
      const result = aggregate(byComponent.get(component)!);
      results[component] = result;
      fs.writeFileSync(
        path.join(OUT_DIR, `${component}.json`),
        `${JSON.stringify(result, null, 2)}\n`,
      );
    }

    const pass = names.filter((n) => results[n].failed === 0);
    const partial = names.filter((n) => results[n].failed > 0);
    // eslint-disable-next-line no-console
    console.log(
      [
        '',
        chalk.bold(
          `a11y results (${names.length} components) -> ${path.relative(process.cwd(), OUT_DIR)}/`,
        ),
        '',
        `  ✅ Pass (${pass.length}):     ${pass.join(', ') || '—'}`,
        `  ⚠️  Partial (${partial.length}):  ${partial.join(', ') || '—'}`,
        '',
      ].join('\n'),
    );
  }
}
