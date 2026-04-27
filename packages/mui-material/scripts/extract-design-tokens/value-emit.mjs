// Property keep-list (per Q9). Emit CSS prop names directly (no rename).
// Other props are dropped (with warning aggregation upstream).
const KEEP_PROPS = new Set([
  'color',
  'backgroundColor',
  'borderRadius',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingInline',
  'paddingBlock',
  'width',
  'height',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
]);

// Pseudo-class state selectors that map to component variant suffix
const STATE_SELECTOR_RE = /^&:(hover|focus|active|disabled|focus-visible|focus-within|visited)$/;
const CLASS_STATE_RE = /^&\.(mock|Mui[A-Z][A-Za-z]*-(disabled|focusVisible|selected|checked|active|expanded))(?:,|$)/;

// Recognize & .className-disabled style (state via class)
const CLASS_STATE_FRAG = /Mui[A-Z][A-Za-z]*-(disabled|focusVisible|selected|checked|active|expanded)/;

const SPACING_CALC_RE = /calc\((-?\d+(?:\.\d+)?)\s*\*\s*var\(--mui-spacing(?:,\s*8px)?\)\)/g;
const SPACING_BARE_RE = /var\(--mui-spacing(?:,\s*8px)?\)/g;
const PALETTE_VAR_RE = /^var\(--mui-palette-([A-Za-z0-9-]+)\)$/;

// Strip default fallback args from var(...) — paren-aware to handle nested vars.
//   "var(--mui-X, var(--mui-Y, #abc))" → "var(--mui-X)"
function stripVarFallbacks(input) {
  let out = '';
  let i = 0;
  while (i < input.length) {
    const idx = input.indexOf('var(', i);
    if (idx === -1) {
      out += input.slice(i);
      break;
    }
    out += input.slice(i, idx);
    // Find matching closing paren
    let depth = 1;
    let j = idx + 4;
    while (j < input.length && depth > 0) {
      const ch = input[j];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (depth === 0) break;
      j++;
    }
    if (depth !== 0) {
      // Unbalanced — bail
      out += input.slice(idx);
      break;
    }
    const inner = input.slice(idx + 4, j); // contents inside var(...)
    const commaIdx = findTopLevelComma(inner);
    const name = (commaIdx === -1 ? inner : inner.slice(0, commaIdx)).trim();
    out += `var(${name})`;
    i = j + 1;
  }
  return out;
}

function findTopLevelComma(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ',' && depth === 0) return i;
  }
  return -1;
}

const UNITLESS_PROPS = new Set([
  'fontWeight',
  'lineHeight',
  'opacity',
  'zIndex',
  'flex',
  'flexGrow',
  'flexShrink',
  'order',
  'columnCount',
  'orphans',
  'widows',
]);

export function transformValue(v, propName) {
  if (v == null) return undefined;
  if (typeof v === 'number') {
    if (UNITLESS_PROPS.has(propName)) return String(v);
    return `${v}px`;
  }
  if (typeof v !== 'string') return undefined;

  let out = v;
  // Resolve theme.spacing(N) → "Npx" (calc form, factor != 1)
  out = out.replace(SPACING_CALC_RE, (_, n) => `${parseFloat(n) * 8}px`);
  // Resolve theme.spacing(1) → "8px" (bare form, factor == 1)
  out = out.replace(SPACING_BARE_RE, '8px');
  // Strip default fallbacks (paren-aware)
  out = stripVarFallbacks(out);
  // Rewrite a *single* palette var to a {colors.X} ref
  const m = out.match(PALETTE_VAR_RE);
  if (m) return `{colors.${m[1]}}`;
  return out;
}

function emptyObject(o) {
  return o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).length === 0;
}

// Walk a CSS-in-JS style object. Returns:
//   { base: { prop: value, ... }, states: { hover: {...}, disabled: {...} } }
// `base` contains keep-listed props only; `states` recursively walked.
// Anything dropped contributes to `dropped` (returned for warnings).
export function walkStyle(style) {
  const base = {};
  const states = {};
  const dropped = [];

  if (!style || typeof style !== 'object') return { base, states, dropped };

  for (const [k, v] of Object.entries(style)) {
    if (k === 'variants') continue;
    if (v == null) continue;

    // State pseudo-class
    const stateMatch = STATE_SELECTOR_RE.exec(k);
    if (stateMatch) {
      const stateName = stateMatch[1].replace('focus-visible', 'focusVisible');
      const sub = walkStyle(v);
      if (Object.keys(sub.base).length || Object.keys(sub.states).length) {
        states[stateName] = sub;
      }
      continue;
    }
    // State via MUI class selector
    if (typeof k === 'string' && k.startsWith('&') && CLASS_STATE_FRAG.test(k)) {
      const stateMatch2 = k.match(CLASS_STATE_FRAG);
      const stateName = stateMatch2[1];
      const sub = walkStyle(v);
      if (Object.keys(sub.base).length || Object.keys(sub.states).length) {
        // Merge if same state already seen
        const prev = states[stateName] || { base: {}, states: {}, dropped: [] };
        states[stateName] = {
          base: { ...prev.base, ...sub.base },
          states: { ...prev.states, ...sub.states },
          dropped: [...prev.dropped, ...sub.dropped],
        };
      }
      continue;
    }
    // Skip other selectors (child, media, descendant)
    if (typeof k === 'string' && (k.startsWith('&') || k.startsWith('@') || k.includes(' ') || k.includes('.'))) {
      if (!emptyObject(v)) dropped.push({ key: k, reason: 'non-state selector' });
      continue;
    }
    // Local CSS var setter (e.g., '--variant-containedBg: ...') — record for trace
    if (typeof k === 'string' && k.startsWith('--')) {
      dropped.push({ key: k, value: v, reason: 'local-css-var-setter' });
      continue;
    }

    if (KEEP_PROPS.has(k)) {
      const transformed = transformValue(v, k);
      if (transformed !== undefined) {
        base[k] = transformed;
      }
    } else {
      dropped.push({ key: k, reason: 'non-design-token property' });
    }
  }

  return { base, states, dropped };
}

// Resolve local --variant-* CSS-var indirection inside a merged style.
// Walks `base` values: any "var(--variant-foo)" reference is substituted with
// the value defined by an earlier setter (provided via `localVars` map).
export function resolveLocalVars(walked, localVars) {
  const sub = (str, propName) => {
    if (typeof str !== 'string') return str;
    return str.replace(/var\((--variant-[A-Za-z0-9-]+)\)/g, (whole, name) => {
      if (localVars[name] != null) {
        const v = transformValue(localVars[name], propName);
        return v !== undefined ? v : whole;
      }
      return whole;
    });
  };

  for (const k of Object.keys(walked.base)) {
    walked.base[k] = sub(walked.base[k], k);
  }
  for (const stateName of Object.keys(walked.states)) {
    resolveLocalVars(walked.states[stateName], localVars);
  }
  return walked;
}

// Collect local --variant-* setters from a raw style object's `dropped`
// entries (recursive). Returns { '--variant-X': value, ... }.
export function collectLocalVars(walked) {
  const out = {};
  for (const d of walked.dropped) {
    if (d.reason === 'local-css-var-setter') out[d.key] = d.value;
  }
  for (const s of Object.values(walked.states)) {
    Object.assign(out, collectLocalVars(s));
  }
  return out;
}
