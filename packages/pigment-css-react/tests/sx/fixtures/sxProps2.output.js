import { styled as _styled, sx as _sx4, sx as _sx5, sx as _sx6 } from '@pigment-css/react';
const SliderRail = /*#__PURE__*/ _styled('span', {
  name: 'MuiSlider',
  slot: 'Rail',
})({
  classes: ['sdbmcs3', 'sdbmcs3-1'],
});
const A = {
  SliderRail,
};
const _exp5 = /*#__PURE__*/ () => ({});
function App(props) {
  return <SliderRail {..._sx4('si7ulc4', _exp5)} />;
}
const _exp8 = /*#__PURE__*/ () => ({
  component: 'li',
});
function App2() {
  return <SliderRail {..._sx5('sliig2s', _exp8)} component="li" {...props} />;
}
const _exp11 = /*#__PURE__*/ () => ({});
function App3(props) {
  return (
    <A.SliderRail
      {..._sx6(
        {
          className: 'so956n',
          vars: {
            'so956n-0': [props.isRed ? 'h1-fontSize' : 'h2-fontSize', false],
          },
        },
        _exp11,
      )}
    />
  );
}
