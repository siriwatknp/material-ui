import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs, { useTabsContext } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

/**
 * TODO: Move to `@mui/material/TabPanel`
 */
function TabPanel(props) {
  const { children, value, ...other } = props;

  const context = useTabsContext();

  return (
    <div
      role="tabpanel"
      hidden={value !== context.tabsValue}
      id={`simple-tabpanel-${context.tabsValue}`}
      aria-labelledby={`simple-tab-${context.tabsValue}`}
      {...other}
    >
      {value === context.tabsValue && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function PanelsTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
        panels={
          <div>
            <Divider />
            <TabPanel value={0}>Item One</TabPanel>
            <TabPanel value={1}>Item Two</TabPanel>
            <TabPanel value={2}>Item Three</TabPanel>
          </div>
        }
      >
        <Tab label="Item One" {...a11yProps(0)} />
        <Tab label="Item Two" {...a11yProps(1)} />
        <Tab label="Item Three" {...a11yProps(2)} />
      </Tabs>
    </Box>
  );
}
