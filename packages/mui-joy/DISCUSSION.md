# Second design system and theme structure


**Table of Contents**

- [Introduction](#introduction)
- [Objectives](#objective)
- [Non-objectives](#non-objectives)
- [Rethinking the Theme](#rethinking-the-theme)
  - [Color schemes](#color-schemes)
  - [Adopting CSS variables](#adopting-css-variables)
    - [Perfect dark mode](#perfect-dark-mode)
    - [Component customization via variables](#component-customization-via-variables)
    - [Improved debugging experience](#improved-debugging-experience)
    - [Side benefits](#side-benefits)
  - [The default theme structure](#the-default-theme-structure)
    - [Colors](#colors)
    - [Typography](#typography)
    - [Shadow](#shadow)
    - [Shape properties](#shape-properties)
    - [Other properties](#other-properties)
  - [Unlimited color schemes](#unlimited-color-schemes)
- [Next steps](#next-steps)
- [Closed feedback group](#closed-feedback-group)

## Introduction

We've mentioned on the v5 release blog post, a previous GitHub discussion, and on some issues here and there, that we were planning on developing a second design system (code name "Joy"). Our main purpose is to offer a different design apart from Material Design to expand the audience. We have a conclusion that this product will be a design system with its own design language and principle, instead of being a theme of `@mui/material`. It will be built on top of the our developing unstyled components - which will also be very convenient since it's an opportunity to stress both packages at the same time. We hope to create a feedback loop that increases the speed of evolution of both.

One of the main benefits of thinking of it as a design system is that it can be a stand-alone product, with different default values, and therefore in its own package. We could use it to not only bring a completely new design language to the MUI audience but to also experiment with improvements and ideas that are a bit too risky/heavy to initially do on the /material package. It hopefully will help us to broaden our reach and to grow outside of Material Design. Moreover, having a great aesthetics out of the box with powerful customizability features is definitely a principle we're following. At the end, Joy will have a similar set of components compare to the current `@mui/material` but with its own design principle)

> From now on, we will use "Joy" to refer to the second design system.

This is the first look at the initial work on `Joy` theme structure. But before diving into it, let me state what are the objectives and non-objectives of this write-up so we can have a more assertive discussion and focus on what we have so far:

## Objectives

This discussion is meant mainly to get early feedback on the default theme structure and some ideas about the implementation surface. We'll also share thoughts (and early prototypes) about how to customize and extend it.

## Non-objectives

We do not expect to discuss the presented content in detail, like API specification, for example. There's also no definition around the design direction as of now, so we won't be presenting any values for the properties on the theme nor talking about visual design as a whole.

---

If you are ready, let's dive in.

## Rethinking the Theme

Customizability will be a huge part of Joy. Even though we're focusing on having sensible and opinionated defaults that act as a great starting point for your projects, we'll still optimize it for extensive customizability. To do so, we have been studying ways to add improvements to the current theming approach in `@mui/material` v5. We'll first introduce them on Joy to get early feedback and iterate until they are solid, later on, bring back to the `@mui/material` as well. Among them are:

### 1. Color schemes

Sometimes, we use the word *theme* referring to the whole design language (specific values for each styling property) of an application (Material Design, iOS, Microsoft's Fluent, etc). Other times, we use *theme* referring only to the color scheme currently selected (light or dark). This can get confusing especially if you have an API where, on your ThemeProvider component, you pass to the `theme` prop a `lightTheme` or `darkTheme` value. Most often, this means that only colors are changing, all other properties remain intact.

To get rid of the confusion, we think that an application should have one theme at a time. For example, you can theme Joy components to match your branding and call it "Company" theme. Any theme can have one or many `colorSchemes` (different sets of palette that you can define at the beginning) which is way clearer than having `lightTheme` or `darkTheme` separated. We have tested this concept and we think that it is more intuitive when you have to customize multiple color schemes. We will talk about what's the code looks like in the [Unlimited color schemes](#unlimited-color-schemes) section.

<img src="https://user-images.githubusercontent.com/18292247/136911050-6107eac6-36ad-4491-bd0d-cd1c70868ffe.jpg" style="width: 700px; max-width: 100%;" />

### 2. Adopting CSS variables

CSS variables will play an important role in Joy. It allows for building APIs that provide a much better customization experience and with a [high percentage of browsers](https://caniuse.com/css-variables) supporting it already, we are confident to bring it on. Some highlights of things we can do with it:

#### 2.1 Perfect dark mode

The flashy dark mode problem is one we've been aware of for some time now. With CSS variables, we can create a stylesheet that contains all of the color schemes at build time and then pick the right color when users enter the website. To understand more details about it, check [the dedicated RFC](https://github.com/mui-org/material-ui/issues/27651).

![Group 43](https://user-images.githubusercontent.com/18292247/136911533-7eefc155-5813-4f21-b057-5d1dac668540.jpg)

> This picture above illustrate the terms `design system`, `theme` and `colorSchemes`. This does not mean that Joy will provide Material & iOS Theme by default.

#### 2.2 Component customization via variables

As we've said, Joy components will be built on top of the unstyled. To visualize how CSS variables actually provide a better customization experience, let's use one of the [unstyled components already available: the switch](https://mui.com/components/switches/#unstyled). A switch basically has two parts: the track and the thumb.

<img src="https://user-images.githubusercontent.com/18292247/136911706-00565fd5-a31c-47bd-858c-413547ef5f51.png" style="width: 240px; max-width: 100%;" />

Let's say we want to do something basic such as reducing the size of the thumb to be a little smaller. On `@mui/material`  v5 this is how we'd normally do that:

```jsx
<Switch
  sx={{
    '& .MuiSwitch-thumb': {
      size: '12px',
      height: '12px',
    }
  }}
/>
```

<img src="https://user-images.githubusercontent.com/18292247/136911763-7ed8d2ee-074b-4923-a652-0e737e5968e2.png" style="width: 360px; max-width: 100%;" />

Unfortunately, the result is not really that good. Only changing the thumb size actually messes up its positioning and makes the overall component disproportionate. To fix that, we'd also have to change the track width and fix the position. But with CSS variables, we can compose the styling of each part of the component so they actually change accordingly - or synchronized. We couldn't do that before using JavaScript. Here's a [proof of concept](https://deploy-preview-28637--material-ui.netlify.app/joy/) using CSS variables to compose the Switch component. You can play around with the properties values in the panel. You'll see that as you change one, the other follows. 

https://user-images.githubusercontent.com/18292247/136912088-7de5b547-3c59-4aac-a50a-bf32e7d0676f.mov

We also used [this POC](https://deploy-preview-28637--material-ui.netlify.app/joy/) to experiment with having multiple color schemes. But we're going to dive more into this below. If you'd gotten this Switch and wanted to customize it, you could do it by just changing the values for some of its variables (basically, in code, what is happening on the proof of concept GUI):

```jsx
<Switch
  sx={{
    --switch-track-width: '106px',
    --switch-track-height: '16px',
    --switch-track-radius: '26px',
    --switch-thumb-size: '51px',
    --switch-thumb-offset: '-18px',
  }}
/>
```

#### 2.3 Improved debugging experience

The CSS variables help developers and also designers to understand the token structure of a given element without even touching the codebase. It's way easier to read and to play around with values for reaching the desired design.

https://user-images.githubusercontent.com/18292247/136912044-ad763b1c-b552-4ee7-8248-4aa08c3a466d.mov

#### 2.4 Side benefits

From the POC, we found that css variables provide some side benefits that we get for free!

- **Slight performance improvement**

  In the current approach of `@mui/material` , toggling between modes causes the whole application to re-render and recalculate the styles (className change) so that they reflect the change on the screen. This process could take around 100-300ms but ultimately depends on the number of components on the page. With the use of CSS variables, the processing time drops significantly because the className does not regenerate* (the component still re-render though). For more details about this topic, check out this [blog post](https://epicreact.dev/css-variables/) from Kent C Dodds.

  Here is our quick benchmark between `@mui/material` v5 and [the POC version](https://deploy-preview-28637--material-ui.netlify.app/joy/). We profile the rendering time versus `x` number of Switches when toggle between light & dark mode.

  |                     	| 10 switches 	| 100 switches 	| 500 switches 	| 1000 switches 	|
  |---------------------	|-------------	|--------------	|--------------	|---------------	|
  | @mui/material       	| ~25ms       	| ~75ms        	| ~360ms       	| ~600ms        	|
  | POC (CSS Variables) 	| ~8ms        	| ~11ms        	| ~37ms        	| ~60ms         	|

  > Note: This benchmark is done on macOS Big Sur, MacBook Pro (13-inch, M1, 2020) Memory 16 GB.

  The result has shown that CSS variables approach is significantly more performant than the current implementation in `@mui/material`. Here are the links that you can compare them by yourself.
  
  - [`@mui/material` Switch](https://deploy-preview-28637--material-ui.netlify.app/perf/switch-md/)
  - [CSS Variables Switch](https://deploy-preview-28637--material-ui.netlify.app/perf/switch-joy/)

- **Variable Reference**

  It is quite common if you want to refer to other variable when defining a theme, take this as an example in `@mui/material` v5. The button color should use the `palette.primary.main` . To make this value reusable, we will need to abstract the `primary.main` color to a variable.

  ```jsx
  const primary = {
    main: '#ff5252',
  }
  <ThemeProvider
    theme={{
      palette: {
        primary,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            color: primary.main,
          }
        }
      }
    }}
  />
  ```

  But with css variables, you can just refer to a variable via `var(--{variable-name})`. This is the [native syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) for using other variable in CSS.


  ```jsx
  <CssVarsProvider
    theme={{
      colorSchemes: {
        light: {
          palette:{
            primary: {
              main: '#ff5252',
            },
          }
        },
        dark: {...}
      },
      shadow: {
        md: '0 0 12px 0 rgba(0,0,0,0.12)',
      },
      components: {
        MuiButton: {
          styleOverrides: {
            color: 'var(--palette-primary-main)',
            border: '1px solid var(--palette-primary-main)',
            boxShadow: 'var(--shadow-md)',
          }
        }
      }
    }}
  />
  ```

### 3. The default theme structure

When looking for opportunities we could bring to Joy theme structure, in comparison to the Material default, we noticed that it could benefit from the usage of more low-level tokens as it enforces even more consistency on the components while providing a set of opinionated values. Low-level implies that we'll have different layers of abstraction for given properties of the theme. A lower level token would be descriptive, holding the hard value of a given property and a high level would be semantic, holding indication info for how to use it. There will be instances where it's good to have it and others where not necessarily. We'll dive into the examples but keep in mind that this is all regarding the default structure - what comes out of the box for you. If these don't make sense to you, you'll be able to change them to fit whatever structure design you wish. 

#### 3.1 Colors

Colors are probably the most illustrative example of the separation between descriptive and semantic tokens. At first, we'd have colors declared descriptively in a 50 to 900 value range. For example:

```jsx
export const grey = {
    50: '',
    // ...
    900: '',
};

export const blue = {
    50: '',
    // ...
    900: '',
};

export const red = {
    50: '',
    // ...
    900: '',
};
```

On the semantic side of things, we'd have the following structure: 

```js
  palette: {
    brand: blue, 
    highlight: gray,
    danger: red,
    warning: ...,
    success: ...,
    text: {
      headings: '',
      mainContent: '',
      blockquote: '',
    },
    bgBrand: {
      subtle: 'var(--palette-brand-500)',
      plain: 'var(--palette-brand-200)',
      strong: 'var(--palette-brand-700)',
    },
    bgNeutral: {
      suble: ...,
      plain: ...,
      strong: ...,
    },
    bgHighlight: {
      suble: ...,
      plain: ...,
      strong: ...,
    },
    bgDanger: {
      suble: ...,
      plain: ...,
      strong: ...,
    }
  }
```

Instead of having primary and secondary, which can cause confusion as to where to use which, we'd have instead only a brand color, the one that is the defining color for your product and company. Also, instead of having a light, main and dark value for each color, we'd have only one that defines each semantic variant: 

- Highlight: meant for components like info callouts.
- Danger: we changed from *error* to *danger* because it sounds like a more broad use case word to use. For example, if you want your button to be red when in a deleting account use case, it's weird to use the "error" color, it's not an error at all. It's just a "dangerous" activity, one to be very aware of - probably with irreversible consequences.
- Warning and success weren't changed.
- Text: instead of having a primary and secondary text color variants, we'd have variants for a specific type of text like heading, main content (body page paragraphs), blockquotes, etc.
- Background: we'd have a three intensity scale of background for every semantic variant.

#### 3.2 Typography

Similar to colors, the idea is to have every low-level property defined in a descriptive way and then use them for semantic variations. The descriptive values structure:

```jsx
  htmlFontSize: 16,
  fontFamily: {
    sans: '',
    mono: '',
  },
  fontSize: { // example values
    xs: pxToRem(12), // 0.75rem
    sm: pxToRem(14), // 0.875rem
    md: pxToRem(16), // 1rem
    lg: pxToRem(20), // 1.25rem
    xl: pxToRem(24), // 1.5rem
    xl2: pxToRem(30), // 1.875rem
    xl3: pxToRem(36), // 2.25rem
    xl4: pxToRem(42), // 2.625rem
    xl5: pxToRem(50), // 3.125rem
    xl6: pxToRem(62), // 3.875rem
  },
  fontWeight: {
    regular: 500,
    medium: 600,
    bold: 700,
  },
  lineHeight: {
    normal: 1.5,
    sm: 1,
    ...
    lg: 3,
  },
```

And the semantic value structure, which directly consumes the descriptive tokens:

```jsx
  h1: {
    fontFamily: fontFamily.sans,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.xl6,
    color: palette.text.headings,
    lineHeight: lineHeight.normal,
  },
```

You'll notice that we're also using an `xs` to `xl6` scale for font sizes. This is mainly to give still a broad range of choices but constrained enough into a sufficient set of sizes that match one another. We'd also have a different, compared to the Material Design, set of semantic variants. There'd be one to hold each font size variant. We're still discussing these specifically but the current list is this:

```jsx
  h1...h5
  subtitle
  body
  caption
  detail
  overline
```

#### 3.3 Shadow

We're planning on having only 4 levels, ranging from extra small to large. In addition, since shadow can have multiple layer, we plan to add `ring` property for convenient customization. The ring property acts as an inner shadow to make the element standout from rest. We are still working on the conclusion about making it visible/invisible in the default theme.

```jsx
shadow: {
	none: 'none',
	ring: '0 0 0 0 rgba(0,0,0,0)', // this mean the ring is invisible
	xs: 'var(--shadows-ring), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
	sm: 'var(--shadows-ring), 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
	md: 'var(--shadows-ring), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
	lg: 'var(--shadows-ring), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
}
```

![Rectangle 40](https://user-images.githubusercontent.com/18292247/136915558-b96f259a-fd57-436a-b30a-5a075af3fe41.jpg)

#### 3.4 Shape properties

We're also planning on tokenizing properties that are usually applied to shapes (your everyday `div` or `<Box>`) to enforce consistency. The idea is to have extra-small to extra-large scale for them:

```jsx
borderRadius: {
  xs: '',
  sm: '',
  md: '',
  lg: '',
  xl: ''
},
```

#### 3.5 Other properties

There were some properties that didn't need to be changed from Material Design, we believe them to be good enough already.

```jsx
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  },
  direction: 'ltr',
  spacing: 'f n(4)',
  transition: {
    easing: {
      easingInOut,
      easeOut,
      easeIn,
      sharp,
    },
    duration: {
      shorter: '',
      short: '',
      normal: '',
      long: 375,
    },
  },
```

### 4. Unlimited color schemes

Light and dark will be built-in color schemes but it really won't be any limitation to add more custom ones. On the [Switch demo mentioned above](https://deploy-preview-28637--material-ui.netlify.app/joy/), there's already a proof of concept of this working.

```ts
// NOT available on npm yet, just for demonstration purpose.
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';

declare module "@mui/joy/styles" {
  interface JoyColorSchemesOverrides {
    // extend two more color schemes to your application
    comfort: true,
    trueDark: true,
  }
}

<CssVarsProvider
  theme={{
    colorSchemes: { // light & dark are built-in
      comfort: {
        palette: {
          brand: '#888',
        }
      },
      trueDark: {
        palette: {
          brand: '#000',
        }
      }
    }
  }}
/>
  {children}
</CssVarsProvider>

// somewhere in your application
const { allColorSchemes } = useColorScheme();

// you can get all color schemes defined in the theme via this variable
console.log(allColorSchemes); // ["light", "dark", "comfort", "trueDark"]
```

## Next steps

We hope that with his write-up we can gather as much feedback as we can to refine the overall idea and to start development with a clearer design in mind. As the development of the unstyled component progresses (you can help out with that!), we'll be getting them into Joy. Meanwhile, we're also evolving with designs explorations.

## Closed feedback group

For this project, we're considering forming a closed group of contributors willing to test Joy and provide quick feedback. We're aiming to have the first iteration, with the first set of components, available still in this quarter so the folks in it would be of immense help to achieve this deadline. There's a comment in this discussion where you can leave a "hey! I'm interested in being a part of the feedback group" message as a thread. Let us know ways to contact you as well. We appreciate anyone that is available to help us with that :]
