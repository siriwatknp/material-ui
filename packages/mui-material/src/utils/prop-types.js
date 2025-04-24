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

function validate(props, propName, componentName, location, propFullName) {
  if (!isNode(props[propName])) {
    return new PropTypeError(
      `Invalid ${location} \`${propFullName}\` supplied to ` +
        `\`${componentName}\`, expected a ReactNode.`,
    );
  }
  return null;
}

export default validate;
