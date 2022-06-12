import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import store from '../../../../../store';
import TopFirstSearch from './TopFirstSearch';
import TopFiletersSearch from './TopFiletersSearch';
import ReportSearchResults from './ReportSearchResults';
import * as voterFilterActions from '../../../../../actions/VoterFilterActions';
import { bindActionCreators } from 'redux';

class ReportScreen extends React.Component {

    constructor(props) {
		super(props);
		this.screenPermission = 'elections.reports.captain_of_fifty_walker';
    }
	
	componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin==false && nextProps.currentUser.permissions[this.screenPermission]!=true && this.props.currentUser.first_name.length>1){          	  
		  this.props.router.replace('/unauthorized');
        }  
    }
 
	
	componentWillMount(){
		ElectionsActions.loadAllSupportStatusesForReport(store.dispatch);
        ElectionsActions.loadEthnicGroups(store.dispatch);		
        ElectionsActions.loadReligiousGroups(store.dispatch);		
		store.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'הליכון שר מאה'});
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
		let voterFilter = _.cloneDeep(this.props.voterFilter);
		this.props.voterFilterActions.loadElectionCampaigns();
        this.props.voterFilterActions.loadCurrentElectionCampaign();
        this.props.voterFilterActions.getVoterFilterDefinitions('captain50_walker_report');
        this.props.voterFilterActions.loadVoterFilter(voterFilter, this.props.moduleType);		
	}
	
	/*
	   Handle closing global modal dialog
	*/
	closeGlobalModalWindow(){
	    store.dispatch({type:ElectionsActions.ActionTypes.REPORTS.SHOW_HIDE_GLOBAL_MODAL_DIALOG , show:false , modalHeader:'' , modalContent:'' });
	}
	
	/*
	Performs field validations for render() method
	*/
	validateFields(){
		this.validatorsObject = {};
		let validatedArea  = true;
		let validatedSubArea  = true;
		let validatedCity  = true;
		let validatedNeighborhood  = true;
		let validatedCluster  = true;
		let validatedBallotBox  = true;
		let validatedPersonalIdentity  = true;
		let validatedMinimumSearch = true;
		if(!this.props.searchScreen.selectedArea.selectedItem && this.props.searchScreen.selectedArea.selectedValue && this.props.searchScreen.selectedArea.selectedValue.split(' ').join('') != ''){
			validatedArea = false;
		}
		if(!this.props.searchScreen.selectedSubArea.selectedItem && this.props.searchScreen.selectedSubArea.selectedValue && this.props.searchScreen.selectedSubArea.selectedValue.split(' ').join('') != ''){
			validatedSubArea = false;
		}
		if(!this.props.searchScreen.selectedCity.selectedItem && this.props.searchScreen.selectedCity.selectedValue && this.props.searchScreen.selectedCity.selectedValue.split(' ').join('') != ''){
			validatedCity = false;
		}
		if(!this.props.searchScreen.selectedNeighborhood.selectedItem && this.props.searchScreen.selectedNeighborhood.selectedValue && this.props.searchScreen.selectedNeighborhood.selectedValue.split(' ').join('') != ''){
			validatedNeighborhood = false;
		}
		if(!this.props.searchScreen.selectedCluster.selectedItem && this.props.searchScreen.selectedCluster.selectedValue && this.props.searchScreen.selectedCluster.selectedValue.split(' ').join('') != ''){
			validatedCluster = false;
		}
		if(!this.props.searchScreen.selectedBallotBox.selectedItem && this.props.searchScreen.selectedBallotBox.selectedValue && this.props.searchScreen.selectedBallotBox.selectedValue.split(' ').join('') != ''){
			validatedBallotBox = false;
		}
		if (!this.props.searchScreen.selectedCity.selectedItem && this.props.searchScreen.ministerFirstName.length < 2 && this.props.searchScreen.ministerLastName.length < 2 && this.props.searchScreen.ministerID.length < 3) {
			validatedMinimumSearch = false;
		}
		 
	    this.validatorsObject.validatedArea = validatedArea;
		this.validatorsObject.validatedSubArea = validatedSubArea;
		this.validatorsObject.validatedCity = validatedCity;
		this.validatorsObject.validatedNeighborhood = validatedNeighborhood;
		this.validatorsObject.validatedCluster = validatedCluster;
		this.validatorsObject.validatedBallotBox = validatedBallotBox;
		this.validatorsObject.validatedPersonalIdentity = validatedPersonalIdentity;
		this.validatorsObject.validatedMinimumSearch = validatedMinimumSearch;
	}
	
 
    render() {
		 this.validateFields();
        return (
		  <div className="container">
		       <div className="row">
                     <div className="col-md-6 text-right">
                         <h1>הליכון שר מאה</h1>
                     </div>
               </div>
		       <TopFirstSearch  validatorsObject={this.validatorsObject} />
               <TopFiletersSearch  validatorsObject={this.validatorsObject} />
			   <br/>
			   <div style={{textAlign:'center'}}>
			   {this.props.captain50WalkerReport.loadingSearchResults ? <div><i className="fa fa-spinner fa-spin"></i> טוען...</div>:null}
			   {this.props.captain50WalkerReport.reportSearchResults && !this.props.captain50WalkerReport.loadingSearchResults ? <ReportSearchResults /> : ''}
			   </div>
			   <ModalWindow show={this.props.captain50WalkerReport.showGlobalMessageModal} title={this.props.captain50WalkerReport.globalModalMessageHeader}  buttonOk={this.closeGlobalModalWindow.bind(this)} buttonX={this.closeGlobalModalWindow.bind(this)}>
			      <div>{this.props.captain50WalkerReport.globalModalMessageContent}</div>
			   </ModalWindow>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
	    modules:state.global.voterFilter.modules,
		captain50WalkerReport:state.elections.reportsScreen.captain50WalkerReport,
		voterFilter:state.global.voterFilter.general_report.vf,
		currentUser: state.system.currentUser,
		currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		searchScreen:state.elections.reportsScreen.captain50WalkerReport.searchScreen,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        voterFilterActions: bindActionCreators(voterFilterActions, dispatch)
    };
}

export default connect(mapStateToProps , mapDispatchToProps)(withRouter(ReportScreen));