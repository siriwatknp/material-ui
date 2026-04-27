import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import * as babel from '@babel/core';

const require = createRequire(import.meta.url);

function makePermissive() {
  const fn = function MockedExport() {};
  const cache = new Map();
  let proxy;
  const handler = {
    get(target, prop) {
      if (prop === '__esModule') return true;
      if (prop === Symbol.toPrimitive) return () => 'mock';
      if (prop === Symbol.iterator) return undefined;
      if (prop === Symbol.asyncIterator) return undefined;
      if (prop === 'then') return undefined;
      if (prop === 'prototype') return target;
      if (typeof prop === 'symbol') return undefined;
      if (prop === 'default') return proxy;
      if (cache.has(prop)) return cache.get(prop);
      if (Object.prototype.hasOwnProperty.call(target, prop)) {
        return target[prop];
      }
      const child = makePermissive();
      cache.set(prop, child);
      return child;
    },
    set(target, prop, value) {
      cache.set(prop, value);
      target[prop] = value;
      return true;
    },
    apply(_target, _thisArg, args) {
      if (typeof args[0] === 'function') return args[0];
      return makePermissive();
    },
    construct() {
      return makePermissive();
    },
  };
  proxy = new Proxy(fn, handler);
  return proxy;
}

function makeReactMock() {
  const React = makePermissive();
  React.forwardRef = (fn) => fn;
  React.memo = (fn) => fn;
  React.createElement = () => null;
  React.cloneElement = () => null;
  React.isValidElement = () => false;
  React.Fragment = 'Fragment';
  React.Children = { map: () => [], forEach: () => {}, count: () => 0, toArray: () => [], only: (x) => x };
  React.useRef = () => ({ current: null });
  React.useState = (init) => [typeof init === 'function' ? init() : init, () => {}];
  React.useEffect = () => {};
  React.useMemo = (fn) => fn();
  React.useCallback = (fn) => fn;
  React.useContext = () => ({});
  React.useId = () => 'mock-id';
  React.useReducer = (_, init) => [init, () => {}];
  React.useLayoutEffect = () => {};
  React.useImperativeHandle = () => {};
  React.createContext = () => ({ Provider: () => null, Consumer: () => null });
  React.startTransition = (fn) => fn();
  React.useTransition = () => [false, (fn) => fn()];
  React.useDeferredValue = (v) => v;
  return React;
}

function makePropTypesMock() {
  return makePermissive();
}

function makeClsxMock() {
  const clsx = (...args) => args.filter(Boolean).join(' ');
  clsx.default = clsx;
  return clsx;
}

const SRC_ROOT = path.resolve(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), '../../src');

function isLocalSource(id) {
  return id.startsWith('./') || id.startsWith('../');
}

function resolveLocalImport(fromFile, id) {
  const base = path.resolve(path.dirname(fromFile), id);
  const candidates = [
    base + '.js',
    base + '.tsx',
    base + '.ts',
    path.join(base, 'index.js'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

const ROOT = path.resolve(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), '../../../..');

function resolvePnpm(pkgKebab) {
  const pnpmDir = path.join(ROOT, 'node_modules/.pnpm');
  const entries = fs.readdirSync(pnpmDir).filter((d) => d.startsWith(pkgKebab + '@'));
  if (!entries.length) throw new Error(`Cannot resolve pnpm pkg: ${pkgKebab}`);
  // Pick first match (any peer-suffixed variant works for presets)
  return path.join(pnpmDir, entries[0], 'node_modules', pkgKebab.replace('+', '/'));
}

const PRESET_ENV = resolvePnpm('@babel+preset-env');
const PRESET_REACT = resolvePnpm('@babel+preset-react');
const PRESET_TS = resolvePnpm('@babel+preset-typescript');

function transpile(file) {
  const code = fs.readFileSync(file, 'utf8');
  const result = babel.transformSync(code, {
    filename: file,
    babelrc: false,
    configFile: false,
    presets: [
      [PRESET_ENV, { targets: { node: 'current' }, modules: 'cjs' }],
      [PRESET_REACT, { runtime: 'classic', development: false }],
      ...(file.endsWith('.tsx') || file.endsWith('.ts') ? [[PRESET_TS, { allExtensions: true, isTSX: file.endsWith('.tsx') }]] : []),
    ],
    sourceType: 'module',
  });
  return result.code;
}

export function evalComponent({ name, file }) {
  const captures = [];
  // Tag map: default exports of evaluated modules → component dir name
  const elementToComponentName = new WeakMap();

  const captureFn = (elementType, options, stylesArgs) => {
    let elem;
    if (typeof elementType === 'string') {
      elem = { kind: 'tag', name: elementType };
    } else {
      const tagged = elementType && elementToComponentName.get(elementType);
      const display = tagged || elementType?.displayName || elementType?.name || 'Unknown';
      elem = { kind: 'component', name: tagged ? `Mui${tagged}` : display };
    }
    captures.push({
      elementType: elem,
      options: options || {},
      stylesArgs,
    });
    const mockComponent = function MockStyledComponent() {};
    mockComponent.displayName = `${options?.name || 'styled'}-${options?.slot || ''}`;
    // Tag the styled-mock by its options.name too, so direct uses (rare) work
    if (options?.name) {
      try {
        elementToComponentName.set(mockComponent, options.name.replace(/^Mui/, ''));
      } catch {}
    }
    return mockComponent;
  };

  const sandbox = {};
  sandbox.console = console;
  sandbox.process = process;
  sandbox.Buffer = Buffer;
  sandbox.setTimeout = setTimeout;
  sandbox.clearTimeout = clearTimeout;
  sandbox.setImmediate = setImmediate;
  sandbox.clearImmediate = clearImmediate;
  sandbox.URL = URL;
  sandbox.URLSearchParams = URLSearchParams;
  sandbox.globalThis = sandbox;
  sandbox.global = sandbox;
  sandbox.__captureStyled = captureFn;

  const ctx = vm.createContext(sandbox);

  // Module cache to handle circular imports + reuse
  const cache = new Map();

  function evalModule(filePath) {
    if (cache.has(filePath)) return cache.get(filePath).exports;
    const mod = { exports: {} };
    cache.set(filePath, mod);

    const code = transpile(filePath);
    const wrapped = `(function(module, exports, require, __filename, __dirname){${code}\n});`;
    const fn = vm.runInContext(wrapped, ctx, { filename: filePath });

    const localRequire = (id) => doRequire(filePath, id);
    fn(mod, mod.exports, localRequire, filePath, path.dirname(filePath));

    // Tag default export with component name (containing dir basename) so
    // when this export is later passed to styled() as elementType, we can
    // resolve "inheritsFrom: <name>".
    const dirName = path.basename(path.dirname(filePath));
    if (/^[A-Z]/.test(dirName)) {
      const def = mod.exports?.default;
      if (def && (typeof def === 'function' || typeof def === 'object')) {
        try {
          if (!elementToComponentName.has(def)) {
            elementToComponentName.set(def, dirName);
          }
        } catch {}
      }
    }
    return mod.exports;
  }

  function doRequire(fromFile, id) {
    // Mocks for "interesting" boundaries
    if (id.endsWith('zero-styled') || id.endsWith('zero-styled/index') || /\/zero-styled$/.test(id)) {
      return {
        styled: (elementType, options) => (...stylesArgs) =>
          captureFn(elementType, options, stylesArgs),
        keyframes: () => 'mock-keyframes',
        css: (...args) => args,
        globalCss: () => () => null,
        internal_createExtendSxProp: () => () => ({}),
        default: undefined,
        __esModule: true,
      };
    }
    if (/\/memoTheme(\.js)?$/.test(id) || id.endsWith('utils/memoTheme')) {
      return { default: (fn) => fn, __esModule: true };
    }
    if (/\/internal\/svg-icons\//.test(id)) {
      return { default: () => null, __esModule: true };
    }

    // External package mocks
    if (id === 'react') return makeReactMock();
    if (id === 'react-dom' || id === 'react-dom/client' || id === 'react-dom/server') return makePermissive();
    if (id === 'react-is') {
      const m = makePermissive();
      m.isFragment = () => false;
      m.isMemo = () => false;
      m.isForwardRef = () => false;
      m.isElement = () => false;
      m.isValidElementType = () => false;
      return m;
    }
    if (id === 'prop-types') return makePropTypesMock();
    if (id === 'clsx') return makeClsxMock();
    if (id.startsWith('@mui/utils') || id.startsWith('@mui/system') || id.startsWith('@mui/material-pigment-css')) {
      // Return a real-enough impl for generateUtilityClass(es) so component
      // class names resolve to "MuiX-slot" strings (used in & .className selectors).
      const genUtilClass = (componentName, slot) => `${componentName}-${slot}`;
      const genUtilClasses = (componentName, slots) => {
        const out = {};
        for (const s of slots) out[s] = `${componentName}-${s}`;
        return out;
      };
      if (id.endsWith('/generateUtilityClass') || id === '@mui/utils/generateUtilityClass') {
        return { default: genUtilClass, __esModule: true };
      }
      if (id.endsWith('/generateUtilityClasses') || id === '@mui/utils/generateUtilityClasses') {
        return { default: genUtilClasses, __esModule: true };
      }
      const m = makePermissive();
      m.unstable_useId = () => 'mock-id';
      m.unstable_composeClasses = () => ({});
      m.composeClasses = () => ({});
      m.unstable_generateUtilityClass = genUtilClass;
      m.generateUtilityClass = genUtilClass;
      m.unstable_generateUtilityClasses = genUtilClasses;
      m.generateUtilityClasses = genUtilClasses;
      m.unstable_capitalize = (s) => s && s[0] ? s[0].toUpperCase() + s.slice(1) : s;
      m.capitalize = (s) => s && s[0] ? s[0].toUpperCase() + s.slice(1) : s;
      return m;
    }
    if (id === '@popperjs/core') return makePermissive();
    if (id === 'react-transition-group') return makePermissive();
    if (id.startsWith('@emotion/')) return makePermissive();
    if (id.startsWith('@babel/runtime')) {
      // Use real Babel runtime
      return require(id);
    }

    // Local relative imports — actually evaluate them so styled() registrations
    // for sub-slots within the same file get captured. But guard against pulling
    // in heavy graphs: if we can resolve, evaluate; else permissive mock.
    if (isLocalSource(id)) {
      const resolved = resolveLocalImport(fromFile, id);
      if (resolved) {
        try {
          return evalModule(resolved);
        } catch {
          return makePermissive();
        }
      }
      return makePermissive();
    }

    // Unknown bare specifier — permissive
    return makePermissive();
  }

  evalModule(file);
  return captures;
}
