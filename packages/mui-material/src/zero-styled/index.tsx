import { Interpolation } from '@mui/system';
import { Theme } from '../styles/createTheme';
import useTheme from '../styles/useTheme';
import GlobalStyles, { GlobalStylesProps } from '../GlobalStyles';

export { css, keyframes } from '@mui/system';

export { default as styled } from '../styles/styled';

export function globalCss(styles: Interpolation<{ theme: Theme }>) {
  return function GlobalStylesWrapper(props: Record<string, any>) {
    return (
      // Pigment CSS `globalCss` support callback with theme inside an object but `GlobalStyles` support theme as a callback value.
      <GlobalStyles
        styles={
          (typeof styles === 'function'
            ? (theme) => styles({ theme, ...props })
            : styles) as GlobalStylesProps['styles']
        }
      />
    );
  };
}

export { useTheme };
