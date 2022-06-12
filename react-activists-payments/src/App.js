import React, { useState }  from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import "../scss/style.scss";

// import {  connect } from "react-redux";
import Header from "./components/header/Header";
import Menu from "./components/header/Menu";
import Footer from "./components/Footer";
import Breadcrombs from './components/header/Breadcrombs';
import AlertDialog from './components/global/AlertDialog/AlertDialog.jsx'
import ModalWindow from './components/global/ModalWindow';
import ManageActivistPayment from './pages/ManageActivistPayment.jsx';
import { displayContext } from './context/displayContext.jsx';

const App = () => {

  // structure data to put into context:
  const [display, setDisplay] = useState({
    isPartyHover: null, 
    isComparisonArea: false, 
    isComparisonCity: false,
    currentDataDisplayed : {regular:[], compared:[]},
    ballotList: [],
    currentScreenDisplayed: {type:null, id:[]},
    currentTab: "",
    isReportVotes:false
  });

  return (
    <>
    <Router basename={window.Laravel.baseURL + 'activists-payments'}>
      <Header></Header>
      <Menu></Menu>
      <Switch>
        <displayContext.Provider value={{display, setDisplay}}>
          <Route exact path="/dashboard" component={ManageActivistPayment} />
          <Route exact path="/" component={ManageActivistPayment} />
        </displayContext.Provider>
      </Switch>
      {/* <Footer/> */}
    </Router>
     <AlertDialog></AlertDialog>
    </>
  );
}

export default App;

