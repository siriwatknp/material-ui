import { walkStyle, resolveLocalVars, collectLocalVars } from './value-emit.mjs';

// Discriminator props we're willing to enumerate. Anything else (booleans like
// startIcon, fullWidth, loading) is ignored as a discriminator — variant rules
// gated only by such props are skipped.
const DISCRIMINATOR_NAMES = new Set([
  'variant',
  'color',
  'colorSeverity',
  'severity',
  'size',
  'orientation',
  'edge',
  'underline',
  'placement',
  'elevation',
  'square',
]);

// Compute the set of discriminator combinations that appear in a variants[] array.
// Returns { axes: { variant: Set<string>, color: Set<string>, ... }, hasFunctionPredicates: bool }
export function collectAxes(variants) {
  const axes = {};
  let hasFunctionPredicates = 0;
  for (const v of variants || []) {
    if (typeof v.props === 'function') {
      hasFunctionPredicates++;
      continue;
    }
    if (!v.props || typeof v.props !== 'object') continue;
    for (const [k, val] of Object.entries(v.props)) {
      if (!DISCRIMINATOR_NAMES.has(k)) continue;
      if (typeof val !== 'string' && typeof val !== 'boolean' && typeof val !== 'number') continue;
      if (!axes[k]) axes[k] = new Set();
      axes[k].add(String(val));
    }
  }
  return { axes, hasFunctionPredicates };
}

// Test whether a variant rule's props match a candidate combination.
function matchesCombo(varProps, combo) {
  for (const [k, v] of Object.entries(varProps)) {
    if (!DISCRIMINATOR_NAMES.has(k)) {
      // Boolean/non-discriminator gates: skip the rule for token extraction
      return false;
    }
    if (combo[k] === undefined) return false;
    if (String(combo[k]) !== String(v)) return false;
  }
  return true;
}

// Cartesian product of axes
function cartesian(axes) {
  const keys = Object.keys(axes);
  if (!keys.length) return [{}];
  const lists = keys.map((k) => [...axes[k]]);
  const out = [];
  function rec(i, acc) {
    if (i === keys.length) {
      out.push({ ...acc });
      return;
    }
    for (const v of lists[i]) {
      acc[keys[i]] = v;
      rec(i + 1, acc);
    }
  }
  rec(0, {});
  return out;
}

// Merge two raw style objects. `variants` arrays are concatenated; nested
// selector objects are deep-merged.
export function mergeStyleObjects(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (k === 'variants') {
      out.variants = [...(out.variants || []), ...(Array.isArray(v) ? v : [])];
      continue;
    }
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      out[k] &&
      typeof out[k] === 'object' &&
      !Array.isArray(out[k])
    ) {
      out[k] = mergeStyleObjects(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// For a slot: produce a map of compoundKey → walkedStyle.
//   compoundKey shape: '' (base), or '-variant-color', etc.
// Recipe:
//   1. Walk the base (top-level) style.
//   2. For each cross-product combo across discriminator axes:
//      - Find matching variant rules, merge their style objects in declaration order.
//      - Walk merged style; collect local --variant-* setters from the BASE's local
//        vars and any variant's own local-var setters.
//      - Resolve local vars in the walked base.
//      - Emit if non-empty.
export function expandSlot(rawStyle) {
  const out = new Map();
  const baseWalked = walkStyle(rawStyle);
  const baseLocalVars = collectLocalVars(baseWalked);
  resolveLocalVars(baseWalked, baseLocalVars);

  // Always emit base if it has anything
  if (Object.keys(baseWalked.base).length || Object.keys(baseWalked.states).length) {
    out.set('', baseWalked);
  }

  const variants = Array.isArray(rawStyle?.variants) ? rawStyle.variants : [];
  if (!variants.length) {
    return { combos: out, baseWalked, axes: {}, skippedFunctionPredicates: 0 };
  }

  const { axes, hasFunctionPredicates } = collectAxes(variants);
  if (!Object.keys(axes).length) {
    return { combos: out, baseWalked, axes: {}, skippedFunctionPredicates: hasFunctionPredicates };
  }

  // First pass: collect all local-var setters from ALL variant rules into a
  // combo-aware map. For each combo, we'll merge setters from matching rules.
  const combos = cartesian(axes);
  for (const combo of combos) {
    const matching = variants.filter(
      (v) => typeof v.props === 'object' && v.props !== null && matchesCombo(v.props, combo),
    );
    if (!matching.length) continue;
    let merged = {};
    for (const m of matching) {
      merged = mergeStyleObjects(merged, m.style || {});
    }
    const walked = walkStyle(merged);
    if (!Object.keys(walked.base).length && !Object.keys(walked.states).length) continue;

    // Local vars: setters declared in this combo's matching rules + base
    const localVars = { ...baseLocalVars, ...collectLocalVars(walked) };
    resolveLocalVars(walked, localVars);

    out.set(comboKey(combo, axes), walked);
  }

  return { combos: out, baseWalked, axes, skippedFunctionPredicates: hasFunctionPredicates };
}

// Build the suffix part of the component key from a combo.
//   axesOrder defines the canonical order of discriminators.
const AXIS_ORDER = ['size', 'variant', 'color', 'colorSeverity', 'severity', 'orientation', 'edge', 'underline', 'placement', 'elevation', 'square'];

function comboKey(combo, _axes) {
  const segs = [];
  for (const ax of AXIS_ORDER) {
    if (combo[ax] !== undefined) segs.push(String(combo[ax]));
  }
  for (const ax of Object.keys(combo).sort()) {
    if (!AXIS_ORDER.includes(ax)) segs.push(String(combo[ax]));
  }
  return '-' + segs.join('-');
}
