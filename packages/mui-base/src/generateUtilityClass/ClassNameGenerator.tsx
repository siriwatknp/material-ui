import * as React from 'react';

const defaultGenerator = (componentName: string) => componentName;

const createClassNameGenerator = () => {
  let generate = defaultGenerator;
  return {
    configure(generator: typeof generate) {
      generate = generator;
    },
    generate(componentName: string) {
      return generate(componentName);
    },
    reset() {
      generate = defaultGenerator;
    },
  };
};

const ClassNameGenerator = createClassNameGenerator();

const ClassNameContext = React.createContext({
  generator: defaultGenerator,
});

const globalStateClassesMapping = {
  active: 'Mui-active',
  checked: 'Mui-checked',
  completed: 'Mui-completed',
  disabled: 'Mui-disabled',
  error: 'Mui-error',
  expanded: 'Mui-expanded',
  focused: 'Mui-focused',
  focusVisible: 'Mui-focusVisible',
  required: 'Mui-required',
  selected: 'Mui-selected',
};

export const useClassNameGenerator = ({ name }) => {
  const { generator } = React.useContext(ClassNameContext);

  return (slot) => {
    const globalStateClass = globalStateClassesMapping[slot];
    return globalStateClass || `${generator(name)}-${slot}`;
  };
};

export const ClassNameProvider = ({ children, generator }) => {
  const value = React.useMemo(() => ({ generator }), [generator]);
  return <ClassNameContext.Provider value={value}>{children}</ClassNameContext.Provider>;
};

export default ClassNameGenerator;
