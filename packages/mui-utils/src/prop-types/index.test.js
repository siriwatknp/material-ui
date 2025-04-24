import PropTypes from '@mui/utils/prop-types';
import { expect } from 'chai';

describe('prop-types', () => {
  it('should not warn for React 19 element', () => {
    expect(() =>
      PropTypes.checkPropTypes(
        {
          children: PropTypes.node,
        },
        {
          children: {
            $$typeof: Symbol.for('react.transitional.element'),
          },
        },
        'prop',
      ),
    ).not.toErrorDev();
  });
});
