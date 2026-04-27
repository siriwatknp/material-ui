#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverComponents } from './discover.mjs';
import { evalComponent } from './eval-component.mjs';
import { buildTheme } from './build-theme.mjs';
import { expandSlot, mergeStyleObjects } from './merge-variants.mjs';
import { emitYaml } from './yaml-emit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../../src');

function parseArgs(argv) {
  const out = { components: null, schemes: ['light', 'dark'], outDir: './design-md-output' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--components') out.components = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--scheme') out.schemes = [argv[++i]];
    else if (a === '--out') out.outDir = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: node index.mjs [--components Alert,Button] [--scheme light|dark] [--out ./design-md-output]',
      );
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      process.exit(1);
    }
  }
  return out;
}

function lowerFirst(s) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function slotKey(componentName, slot) {
  const base = lowerFirst(componentName);
  if (!slot || slot === 'Root') return base;
  return `${base}_${lowerFirst(slot)}`;
}

// elem is { kind: 'tag'|'component', name }. For a component named like
// "MuiPaper-Root" or "MuiPaper", return "paper". For tags or unrecognized, null.
function inheritsFromOf(elem, ownComponentName) {
  if (!elem || elem.kind !== 'component') return null;
  const m = elem.name && elem.name.match(/^Mui([A-Z][A-Za-z]*)/);
  if (!m) return null;
  const parent = m[1];
  if (parent === ownComponentName) return null;
  return lowerFirst(parent);
}

function flattenStates(slotName, walked, out) {
  if (Object.keys(walked.base).length) out.set(slotName, walked.base);
  for (const [stateName, sub] of Object.entries(walked.states)) {
    flattenStates(`${slotName}-${stateName}`, sub, out);
  }
}

function processComponent({ name, file, theme }) {
  const allCaptures = evalComponent({ name, file });
  const muiName = `Mui${name}`;
  const captures = allCaptures.filter((c) => c.options?.name === muiName);

  const componentsMap = new Map();
  const warnings = [];

  if (!captures.length) {
    warnings.push(`No styled() calls with name='${muiName}' found in ${path.basename(file)}`);
    return { componentsMap, warnings };
  }

  for (const c of captures) {
    const slot = c.options.slot || 'Root';
    const slotName = slotKey(name, slot);

    // Merge all style args from styled(...)(...) (multi-arg form)
    let style = {};
    try {
      const args = Array.isArray(c.stylesArgs) ? c.stylesArgs : [c.stylesArg];
      for (const arg of args) {
        if (arg == null) continue;
        const evald = typeof arg === 'function' ? arg({ theme }) : arg;
        if (evald && typeof evald === 'object') {
          style = mergeStyleObjects(style, evald);
        }
      }
    } catch (err) {
      warnings.push(`${name}/${slot}: stylesArg threw: ${err.message}`);
      continue;
    }

    // Inheritance marker: applies only to base slot key
    const parentKey = inheritsFromOf(c.elementType, name);

    const { combos, baseWalked, axes, skippedFunctionPredicates } = expandSlot(style);

    if (skippedFunctionPredicates) {
      warnings.push(
        `${name}/${slot}: skipped ${skippedFunctionPredicates} function-based variant predicate(s)`,
      );
    }

    for (const [comboSuffix, walked] of combos) {
      const keyPrefix = slotName + comboSuffix;
      const localMap = new Map();
      flattenStates(keyPrefix, walked, localMap);
      for (const [k, v] of localMap) {
        if (Object.keys(v).length) componentsMap.set(k, v);
      }
    }

    // If inheritance exists, ensure the base slot key is present (even if it
    // had no design-token props of its own) so the marker is visible.
    if (parentKey) {
      const existing = componentsMap.get(slotName) || {};
      existing.inheritsFrom = parentKey;
      componentsMap.set(slotName, existing);
    }

    // Collect drop warnings (non-design-token props), de-duped
    const dropped = new Set();
    function gatherDrops(w) {
      for (const d of w.dropped || []) {
        if (d.reason === 'non-design-token property') dropped.add(d.key);
      }
      for (const s of Object.values(w.states || {})) gatherDrops(s);
    }
    gatherDrops(baseWalked);
    for (const w of combos.values()) gatherDrops(w);
    if (dropped.size) {
      warnings.push(
        `${name}/${slot}: dropped ${dropped.size} non-design-token props: ${[...dropped].sort().join(', ')}`,
      );
    }
  }

  return { componentsMap, warnings };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { found, skipped } = discoverComponents({ srcDir: SRC_DIR, only: args.components });
  console.log(`Discovered ${found.length} components (skipped ${skipped.length} dirs)`);

  fs.mkdirSync(args.outDir, { recursive: true });

  const totalWarnings = [];

  for (const scheme of args.schemes) {
    const theme = buildTheme(scheme);
    const aggregated = new Map();
    let okCount = 0;
    let errCount = 0;

    for (const comp of found) {
      try {
        const { componentsMap, warnings } = processComponent({ name: comp.name, file: comp.file, theme });
        for (const [k, v] of componentsMap) aggregated.set(k, v);
        for (const w of warnings) totalWarnings.push(`[${scheme}] ${w}`);
        okCount++;
      } catch (err) {
        errCount++;
        totalWarnings.push(`[${scheme}] ${comp.name}: FATAL: ${err.message}`);
      }
    }

    const fileName = scheme === 'light' ? 'components.yaml' : `components-${scheme}.yaml`;
    const outPath = path.join(args.outDir, fileName);
    const yaml = emitYaml(aggregated, {
      header: `Generated by extract-design-tokens (scheme: ${scheme}). Do not edit by hand.`,
    });
    fs.writeFileSync(outPath, yaml);
    console.log(
      `[${scheme}] ${aggregated.size} component keys → ${path.relative(process.cwd(), outPath)} (${okCount} ok, ${errCount} failed)`,
    );
  }

  if (totalWarnings.length) {
    const wpath = path.join(args.outDir, 'components.warnings.txt');
    fs.writeFileSync(wpath, totalWarnings.join('\n') + '\n');
    console.log(`${totalWarnings.length} warnings → ${path.relative(process.cwd(), wpath)}`);
  }

  if (skipped.length) {
    console.log('\nSkipped dirs:');
    for (const s of skipped) console.log(`  - ${s.name} (${s.reason})`);
  }
}

main();
