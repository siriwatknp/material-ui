import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import type { Reporter, TestCase, TestModule, TestSuite } from 'vitest/node';
import type { A11yMeta } from './axe';

const OUT_DIR = path.resolve(__dirname, '../../../docs/data/material/a11y');

interface DemoFile {
  slug: string;
  demo: string;
  passedRules: string[];
  failedRules: string[];
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

function toFile(meta: A11yMeta): DemoFile {
  const violations = new Set(meta.violations);
  return {
    slug: meta.slug,
    demo: meta.demo,
    passedRules: meta.collectedRules.filter((r) => !violations.has(r)).sort(),
    failedRules: [...meta.violations].sort(),
    testedRules: meta.testedRules,
  };
}

export default class A11yReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>) {
    const entries: A11yMeta[] = [];
    for (const mod of testModules) {
      for (const test of walkTests(mod)) {
        const meta = (test.meta() as { a11y?: A11yMeta }).a11y;
        if (meta) {
          entries.push(meta);
        }
      }
    }

    if (entries.length === 0) {
      return;
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });

    for (const meta of entries) {
      fs.writeFileSync(
        path.join(OUT_DIR, `${meta.slug}-${meta.demo}.json`),
        `${JSON.stringify(toFile(meta), null, 2)}\n`,
      );
    }

    const bySlug = new Map<string, A11yMeta[]>();
    for (const meta of entries) {
      const list = bySlug.get(meta.slug) ?? [];
      list.push(meta);
      bySlug.set(meta.slug, list);
    }
    const slugs = [...bySlug.keys()].sort();
    const pass = slugs.filter((s) => bySlug.get(s)!.every((m) => m.violations.length === 0));
    const partial = slugs.filter((s) => bySlug.get(s)!.some((m) => m.violations.length > 0));
    // eslint-disable-next-line no-console
    console.log(
      [
        '',
        chalk.bold(
          `a11y results (${entries.length} demos, ${slugs.length} slugs) -> ${path.relative(process.cwd(), OUT_DIR)}/`,
        ),
        '',
        `  ✅ Pass (${pass.length}):     ${pass.join(', ') || '—'}`,
        `  ⚠️  Partial (${partial.length}):  ${partial.join(', ') || '—'}`,
        '',
      ].join('\n'),
    );
  }
}
