import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import store from '../../../store';

import * as SystemActions from 'actions/SystemActions';
import * as ElectionsActions from 'actions/ElectionsActions';


import ModalWindow from '../../global/ModalWindow';
import DataDefinitionFirstStep from './DataDefinitionFirstStep';
import DataSummaryLastStep from './DataSummaryLastStep';

class WizardSteps extends React.Component {

    constructor(props) {
        super(props);
		this.state = {};
		this.state.definedTitle = false;
		this.screenPermission = 'elections.household_support_status_change.execute';	
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
    }
 
    componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin == false && nextProps.currentUser.permissions[this.screenPermission] != true && this.props.currentUser.permissions[this.screenPermission] != true && this.props.currentUser.first_name.length > 1) {
			this.props.router.replace('/unauthorized');
		}
	}
	
	/*
	go back to dashboard
	*/
	goToDashboard(){
		this.props.dispatch({type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CLEAN_STAGES_DATA });
		this.props.router.push('elections/household_status_change');
	}

	componentWillUpdate(){
		if(this.props.searchScreen.updateName != '' && !this.state.definedTitle){
			this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: ('עדכון סטטוס לבתי אב:'+this.props.searchScreen.updateName)}); 
			this.setState({definedTitle:true});
		}
	}
	
	/*general function that closes all types of dialogues */
    closeModalDialog() {
        this.props.dispatch({
            type: ElectionsActions.ActionTypes.SET_MODAL_DIALOG_DATA , visible:false , headerText:'' , modalText :''
        });
    }

	
    componentWillMount() {
 
		this.props.dispatch({type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CLEAN_STAGES_DATA });
		if(this.props.searchScreen.supportStatuses.length == 0){
 
		    ElectionsActions.householdStatusChangeLoadAllSupportStatuses(this.props.dispatch);
		}
		if(this.props.router.params.updateKey != 'new'){
			   this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'עדכון סטטוס לבתי אב'}); 
			   this.props.dispatch({type:ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE , fieldName:'currentStageNumber' , fieldValue:2 });
			   ElectionsActions.getUpdateRowInfo(this.props.dispatch , this.props.router , this.props.router.params.updateKey);
		 }
		 else{
			this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'עדכון סטטוס לבתי אב'}); 
		 }
		 
	}
   
    /*
	Init dynamic variables for render function
	*/
    initDynamicVariables(){
		let headerItem= <h1>עדכון סטטוס לבתי אב</h1>;
		 
		let modalWindowItem= <ModalWindow show={this.props.showModalDialog} buttonX={this.closeModalDialog.bind(this)} buttonOk={this.closeModalDialog.bind(this)} title={this.props.modalHeaderText} style={{ zIndex: '9001' }}>
                                  <div>{this.props.modalContentText}</div>
                             </ModalWindow>;
		let selectedStage = null;
		if(this.props.searchScreen.currentStageNumber == 1){
			selectedStage = <DataDefinitionFirstStep goToDashboard={this.goToDashboard.bind(this)} />;
		}
		else{
		  selectedStage = <DataSummaryLastStep goToDashboard={this.goToDashboard.bind(this)} />;
		}
			
		return <div>{headerItem}{selectedStage}{modalWindowItem}</div>;	
	}
 

    render() {
		return this.initDynamicVariables();
	}
       
   
}


function mapStateToProps(state) {
    return {
         currentUser: state.system.currentUser,
		 currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		 searchScreen:state.elections.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen,
		 showModalDialog: state.elections.showModalDialog,
         modalHeaderText: state.elections.modalHeaderText,
         modalContentText: state.elections.modalContentText,
    }
}

export default connect(mapStateToProps)(withRouter(WizardSteps));