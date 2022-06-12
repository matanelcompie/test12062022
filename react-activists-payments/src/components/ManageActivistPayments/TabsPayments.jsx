import React ,{useState} from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TabSummeryActivistsPayment from './TabSummeryActivistsPayment.jsx'
import TabCreateRecordPayments from './TabPanels/TabCreateRecordPayments.jsx'
import TabPaymentGroup from './TabPanels/TabPaymentGroup.jsx'
//redux
import { useDispatch } from 'react-redux';

//css
import '../../../scss/scssComponents/TabsPayment.scss'
import TabActivistPaymentInvalid from './TabPanels/TabActivistPaymentInvalid.jsx';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  

  return (
    <div
      role="tabpanel"
     
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      <div style={{display:value === index?'block':'none'}}>
        <Box p={3}>
          {children}
          {/* <Typography>{children}</Typography> */}
        </Box>
      </div>
     
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    marginTop:'15px'
  },
}));

export default function TabsPayments() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [needLoadTable, setNeedLoadTable] = useState(true);
  const dispatch = useDispatch()

  const handleChange = (event, newValue) =>{
    setValue(newValue);
    dispatch({type:{actionName:'setTabSelectedInStore'},tabSelected:newValue});
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tab label="תשלומי פעילים" {...a11yProps(0)} />
          <Tab label="רשומות הממתינות לתשלום" {...a11yProps(1)} />
          <Tab label='קבצי מס"ב' {...a11yProps(2)} />
          <Tab label="חוזרים" {...a11yProps(3)} />
        </Tabs>

      </AppBar>
      <TabPanel value={value} index={0}>
         <TabSummeryActivistsPayment ></TabSummeryActivistsPayment>
      </TabPanel>
      <TabPanel value={value} index={1}>
            <TabCreateRecordPayments loadArrPaymentNeed={needLoadTable}></TabCreateRecordPayments>
      </TabPanel>
      <TabPanel value={value} index={2}>
           <TabPaymentGroup loadArrPaymentGroup={needLoadTable}></TabPaymentGroup>
      </TabPanel>
      <TabPanel value={value} index={3}>
       <TabActivistPaymentInvalid></TabActivistPaymentInvalid>
      </TabPanel>
  
    </div>
  );
}
