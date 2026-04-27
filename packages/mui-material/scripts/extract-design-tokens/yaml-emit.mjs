// Hand-rolled YAML serializer for the narrow shape:
//   components:
//     <key>:
//       <prop>: <value>
//
// Values are always strings. Quote with double quotes if the value contains
// a colon, leading/trailing whitespace, special chars, or is a {ref}. Otherwise
// emit unquoted (for readability).

const NEEDS_QUOTE_RE = /[:#&*!|>'"%@`,\[\]{}]|^\s|\s$/;

function quoteIfNeeded(v) {
  if (v === '') return '""';
  if (NEEDS_QUOTE_RE.test(v)) {
    return JSON.stringify(v);
  }
  // Token references like {colors.X-Y} contain { } — always quote
  if (v.includes('{') || v.includes('}')) return JSON.stringify(v);
  return v;
}

export function emitYaml(componentsMap, { header } = {}) {
  const lines = [];
  if (header) {
    for (const line of header.split('\n')) lines.push('# ' + line);
  }
  lines.push('components:');
  const keys = [...componentsMap.keys()].sort();
  for (const key of keys) {
    const props = componentsMap.get(key);
    const propKeys = Object.keys(props);
    if (!propKeys.length) continue;
    lines.push(`  ${key}:`);
    for (const pk of propKeys.sort()) {
      lines.push(`    ${pk}: ${quoteIfNeeded(String(props[pk]))}`);
    }
  }
  return lines.join('\n') + '\n';
}
