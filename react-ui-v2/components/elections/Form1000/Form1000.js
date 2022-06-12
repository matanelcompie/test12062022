import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ModalWindow from '../../global/ModalWindow';

import SearchPanel from './SearchPanel';
import BallotboxInfoPanel from './BallotboxInfoPanel';
import SupportersPercentageBar from './SupportersPercentageBar';
import VotesTable from './VotesTable';
 
import * as SystemActions from '../../../actions/SystemActions';
import * as ElectionsActions from '../../../actions/ElectionsActions';
import store from '../../../store';
import globalSaving from '../../hoc/globalSaving';

class Form1000 extends React.Component {

    constructor(props) {
        super(props);
		 this.state={
			routeDataCleaned : false
		}
        this.initConstants();
    }

	/*
		Function that inits constant variables
	*/
    initConstants() {
        this.systemTitle = "טופס 1000";
		this.styles = {
			loadingStyle : {
				textAlign:'center',
				fontSize:'30px'
			}
		}
		this.screenPermission = 'elections.form1000';
    }

    componentWillMount(){
		if(this.props.router.params.ballotKey){ //load by ballot key if it exists in url
			ElectionsActions.loadBallotboxVotersVotesData(this.props.dispatch , this.props.router , this.props.router.params.ballotKey , true);
		}
    	this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: this.systemTitle }); // update header browser title
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission); // load initial area , sub areas and cities by user's geographical filters
    }
   
	/*
		This function on every new search - by clicking "search" button at top left - it resets
		the previous found results and also cleans the search parameters.
		
		@param - value - true/false - it gets it from <SearchPanel> sub window
	*/
    setRouteDataCleaned(value){
		this.setState({routeDataCleaned:value});
	}
   
    componentWillReceiveProps(nextProps) {
        if(!this.props.router.params.ballotKey){
			if(!this.state.routeDataCleaned){
				this.props.dispatch({type:ElectionsActions.ActionTypes.FORM1000.CLEAN_SEARCH_SCREEN});
				this.props.dispatch({type:ElectionsActions.ActionTypes.FORM1000.CLEAN_RESULTS_SCREEN});
				this.setRouteDataCleaned(true);
			}
		}
		if (this.props.currentUser.admin==false && nextProps.currentUser.permissions[this.screenPermission]!=true && this.props.currentUser.first_name.length>1){          	  
		  this.props.router.replace('/unauthorized');
        } 

    }
    
	componentWillUnmount(){
		//  this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CLEAN_ALL_DATA});
	}
	
	/*
	Handles closing error modal dialog
	*/
	closeModalWindow(){
		this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SET_ERROR_MODAL_WINDOW_PARAMS, displayErrorMessage:false,modalErrorTitle :'' ,modalErrorContent :'' });
	}

    render() {
        return (
            <div>
               <div className="row">
                     <div className="col-md-6 text-right">
                         <h1>{this.systemTitle}</h1>
                     </div>
               </div>
              <SearchPanel setRouteDataClean={this.setRouteDataCleaned.bind(this)}/>
			  {this.props.searchScreen.isLoadingSearchResults && <div style={this.styles.loadingStyle}><i className="fa fa-spinner fa-spin"></i></div>}
              {(this.props.searchScreen.showSearchResults && !this.props.searchScreen.isLoadingSearchResults) && 
			        <div>
						<BallotboxInfoPanel/>
						<SupportersPercentageBar/>
						<VotesTable />
					</div>  
			  }
			<ModalWindow show={this.props.errorModalScreen.displayErrorMessage}  title={this.props.errorModalScreen.modalErrorTitle} buttonOk={this.closeModalWindow.bind(this)} buttonX={this.closeModalWindow.bind(this)}>
				<div>
				    {this.props.errorModalScreen.modalErrorContent}
				</div>
			</ModalWindow>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
          searchScreen:state.elections.form1000Screen.searchScreen,
          errorModalScreen:state.elections.form1000Screen.errorModalScreen,
		  currentUser: state.system.currentUser,
    }
}

export default globalSaving(connect(mapStateToProps)(withRouter(Form1000)));