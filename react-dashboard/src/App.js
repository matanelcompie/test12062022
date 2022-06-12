import React, { useState }  from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import "../scss/style.scss";

// import {  connect } from "react-redux";
import Header from "./components/header/Header";
import Menu from "./components/header/Menu";
import Footer from "./components/Footer";
import Breadcrombs from './components/header/Breadcrombs';
import ModalWindow from './components/global/ModalWindow';
import Dashboard from './pages/Dashboard.jsx';
import DashboardDetailed from './pages/DashboardDetailed.jsx';
import { permissionContext } from './context/permissionContext.jsx';

const App = () => {

  const [permissionLevel, setPermissionLevel] = useState(false);

  return (
    <>
    <Router basename={window.Laravel.baseURL + 'quarters-dashboards'}>
      <Header></Header>
      <Menu></Menu>
      <Breadcrombs/>
      <Switch>
        <permissionContext.Provider value={{permissionLevel, setPermissionLevel}}>
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/" component={Dashboard} />
          <Route exact path="/dashboard-detailed" component={DashboardDetailed} />
        </permissionContext.Provider>
      </Switch>
      <Footer/>
    </Router>
    </>
  );
}

export default App;




// class App extends React.Component {
//   render() {
//     return (
      
//         <BrowserRouter basename={window.Laravel.baseURL + 'quarters-dashboards'}>
//           <React.Fragment>
//             <Header></Header>
//             <Menu></Menu>
//               <Breadcrombs></Breadcrombs>
//               <AppContext.Provider>
//               <Switch>
//                 <Route exact path="/dashboard" component={Dashboard} />
//               </Switch>
//               </AppContext.Provider>
//               <Footer></Footer>
//             <ModalWindow show={this.props.displayErrorModalDialog} buttonX={this.closeErrorMsgModalDialog.bind(this)}
//                                  buttonOk={this.closeErrorMsgModalDialog.bind(this)} title='הודעה'>
//                         <div>{this.props.modalDialogErrorMessage}</div>
//             </ModalWindow>
//           </React.Fragment>
//         </BrowserRouter>
//     );
//   }
// }

// closeErrorMsgModalDialog() {
//   this.props.dispatch({type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: false, errorMessage: ''});
// }
// function mapStateToProps(state) {
//   return {
//       displayErrorModalDialog: state.system.displayErrorModalDialog,
//       modalDialogErrorMessage: state.system.modalDialogErrorMessage,
//       savingChanges: state.system.savingChanges,
//       changesSaved: state.system.changesSaved,
//       changesNotSaved: state.system.changesNotSaved,
//       maintenanceMode: state.system.maintenanceMode,
//       maintenanceDate: state.system.maintenanceDate,
//   }
// }
// export default connect(mapStateToProps)(App);
