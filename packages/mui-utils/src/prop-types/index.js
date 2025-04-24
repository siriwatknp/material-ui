/* eslint-disable no-dupe-else-if */
/* eslint-disable no-plusplus */
/* eslint-disable block-scoped-var */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import PropTypes from 'prop-types';

/**
 * We use an Error-like object for backward compatibility as people may call
 * PropTypes directly and inspect their output. However, we don't use real
 * Errors anymore. We don't inspect their stack anyway, and creating them
 * is prohibitively expensive if they are created too often, such as what
 * happens in oneOfType() for any type before the one that matched.
 */
function PropTypeError(message, data) {
  this.message = message;
  this.data = data && typeof data === 'object' ? data : {};
  this.stack = '';
}
// Make `instanceof Error` still work for returned errors.
PropTypeError.prototype = Error.prototype;

/* global */
const ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
const FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

// eslint-disable-next-line func-names
var printWarning = function () {};

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line func-names
  printWarning = function (text) {
    const message = `Warning: ${text}`;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {
      /* empty */
    }
  };
}

var ANONYMOUS = '<<anonymous>>';
var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

function createChainableTypeChecker(validate) {
  if (process.env.NODE_ENV !== 'production') {
    var manualPropTypeCallCache = {};
    var manualPropTypeWarningCount = 0;
  }
  function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
    componentName = componentName || ANONYMOUS;
    propFullName = propFullName || propName;

    if (secret !== ReactPropTypesSecret) {
      if (process.env.NODE_ENV !== 'production') {
        // New behavior only for users of `prop-types` package
        const err = new Error(
          'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types',
        );
        err.name = 'Invariant Violation';
        throw err;
      } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
        // Old behavior for people using React.PropTypes
        const cacheKey = `${componentName}:${propName}`;
        if (
          !manualPropTypeCallCache[cacheKey] &&
          // Avoid spamming the console because they are often not actionable except for lib authors
          manualPropTypeWarningCount < 3
        ) {
          printWarning(
            `You are manually calling a React.PropTypes validation ` +
              `function for the \`${propFullName}\` prop on \`${
                componentName
              }\`. This is deprecated ` +
              `and will throw in the standalone \`prop-types\` package. ` +
              `You may be seeing this warning due to a third-party PropTypes ` +
              `library. See https://fb.me/react-warning-dont-call-proptypes ` +
              `for details.`,
          );
          manualPropTypeCallCache[cacheKey] = true;
          manualPropTypeWarningCount++;
        }
      }
    }
    if (props[propName] == null) {
      if (isRequired) {
        if (props[propName] === null) {
          return new PropTypeError(
            `The ${location} \`${propFullName}\` is marked as required ` +
              `in \`${componentName}\`, but its value is \`null\`.`,
          );
        }
        return new PropTypeError(
          `The ${location} \`${propFullName}\` is marked as required in ` +
            `\`${componentName}\`, but its value is \`undefined\`.`,
        );
      }
      return null;
    }
    return validate(props, propName, componentName, location, propFullName);
  }

  const chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

/**
 * Returns the iterator method function contained on the iterable object.
 *
 * Be sure to invoke the function with the iterable as context:
 *
 *     var iteratorFn = getIteratorFn(myIterable);
 *     if (iteratorFn) {
 *       var iterator = iteratorFn.call(myIterable);
 *       ...
 *     }
 *
 * @param {?object} maybeIterable
 * @return {?function}
 */
// eslint-disable-next-line consistent-return
function getIteratorFn(maybeIterable) {
  const iteratorFn =
    maybeIterable &&
    ((ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL]) || maybeIterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

function isValidElement(object) {
  return (
    typeof object === 'object' &&
    object !== null &&
    (object.$$typeof === Symbol.for('react.element') || // React <= 18
      object.$$typeof === Symbol.for('react.transitional.element')) // React 19+
  );
}
function isNode(propValue) {
  switch (typeof propValue) {
    case 'number':
    case 'string':
    case 'undefined':
      return true;
    case 'boolean':
      return !propValue;
    case 'object':
      if (Array.isArray(propValue)) {
        return propValue.every(isNode);
      }
      if (propValue === null || isValidElement(propValue)) {
        return true;
      }

      // eslint-disable-next-line no-case-declarations
      const iteratorFn = getIteratorFn(propValue);
      if (iteratorFn) {
        const iterator = iteratorFn.call(propValue);
        let step;
        if (iteratorFn !== propValue.entries) {
          // eslint-disable-next-line no-cond-assign
          while (!(step = iterator.next()).done) {
            if (!isNode(step.value)) {
              return false;
            }
          }
        } else {
          // Iterator will provide entry [k,v] tuples rather than values.
          // eslint-disable-next-line no-cond-assign
          while (!(step = iterator.next()).done) {
            const entry = step.value;
            if (entry) {
              if (!isNode(entry[1])) {
                return false;
              }
            }
          }
        }
      } else {
        return false;
      }

      return true;
    default:
      return false;
  }
}

PropTypes.node = createChainableTypeChecker(
  (props, propName, componentName, location, propFullName) => {
    if (!isNode(props[propName])) {
      return new PropTypeError(
        `Invalid ${location} \`${propFullName}\` supplied to \`${
          componentName
        }\`, expected a ReactNode.`,
      );
    }
    return null;
  },
);

export default PropTypes;
