import {
  styled as _styled,
  sx as _sx5,
  sx as _sx6,
  sx as _sx7,
  sx as _sx8,
  sx as _sx9,
} from '@pigment-css/react';
export const SliderRail = /*#__PURE__*/ _styled('span', {
  name: 'MuiSlider',
  slot: 'Rail',
})({
  classes: ['sjfloo5', 'sjfloo5-1'],
});
function App() {
  return (
    <SliderRail
      className="foo"
      style={{
        color: 'red',
      }}
      {..._sx5('s1o8xp19', {
        className: 'foo',
        style: {
          color: 'red',
        },
      })}
    />
  );
}
function App2(props) {
  return (
    <SliderRail
      {...(props.variant === 'secondary'
        ? _sx6(
            {
              className: 's1xbsywq',
              vars: {
                's1xbsywq-0': [props.isRed ? 'red' : 'blue', false],
              },
            },
            {},
          )
        : _sx7('s1wnk6s5', {}))}
    />
  );
}
function App3(props) {
  return (
    <SliderRail
      {...(props.variant === 'secondary' &&
        _sx8(
          {
            className: 'stzaibv',
            vars: {
              'stzaibv-0': [props.isRed ? 'red' : 'blue', false],
            },
          },
          {},
        ))}
    />
  );
}
function App4(props) {
  return <SliderRail {..._sx9('sazg8ol', {})} />;
}
