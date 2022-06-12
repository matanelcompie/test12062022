import React from 'react';
import { connect } from 'react-redux';
import * as campaignActions from 'tm/actions/campaignActions';
import {withRouter } from 'react-router';
import ModalWindow from 'components/global/ModalWindow';
import Combo from 'components/global/Combo'
import * as systemActions from 'tm/actions/systemActions';


class ChangeCampaignView extends React.Component {
    constructor(props) {
        super(props);
		this.state={
			selectedCampaign:{selectedValue:'' , selectedItem:null} ,
			showModalWindow:false,
			timeleft:60,
		};
		this.modalTitle = "החלפת קמפיין";
		this.possibleViews = [
									{id:1 , name:'דשבורד ראשי' , url:'' } ,
									{id:2 , name:'ביצועי חיוג' , url:'calls_performance' } ,
									{id:3 , name:'ביצועי נציגים' , url:'agents_performance' } ,
									{id:4 , name:'עבודת נציגים' , url:'agents_work' } ,
							 ];
		this.dashboardsURL = 'telemarketing/dashboards/';
    }
	
	componentWillUnmount(){
		clearInterval(this.downloadTimer);
	}
	
	componentWillMount(){
		this.loadDataByLinkType();
		campaignActions.getAllCampaignsRaw(this.props.dispatch);
		let self = this;
		this.downloadTimer = setInterval(function () {
			self.setState({ timeleft: (self.state.timeleft - 1) });
			if (self.state.timeleft <= 0) {
				self.reloadData();
			}
		}, 1000);
		this.updateBreadcrumbs( this.props);
	}
	
	componentWillReceiveProps(nextProps){
		if (this.props.currentUser.admin==false && nextProps.currentUser.permissions['tm.dashboard']!=true && this.props.currentUser.permissions['tm.dashboard']!=true && this.props.currentUser.first_name.length>1){          
		   this.props.router.replace('/unauthorized');
        }
		if(this.props.params.key != nextProps.params.key || this.props.params.agentKey != nextProps.params.agentKey){
			this.cleanDataByLinkType();
			this.loadDataByLinkType();
		}
		if( this.props.campaignNames[this.props.router.params.key] != nextProps.campaignNames[nextProps.router.params.key]){
			this.updateBreadcrumbs(nextProps);
		}

	}
	updateBreadcrumbs(nextProps){
		let currentCampaignKey = nextProps.router.params.key;
		let campaignName = nextProps.campaignNames[currentCampaignKey];
		if (!campaignName) { return; }
		
		let self = this;
		setTimeout(function () {
			self.props.dispatch({
				type: systemActions.types.ADD_BREADCRUMBS,
				newLocation: {
					url: 'telemarketing/campaigns/' + currentCampaignKey,
					title: ' קמפיין ' + campaignName,
					elmentType: 'ChangeCampaignView',
				}
			});
			self.props.dispatch({
				type: systemActions.types.ADD_BREADCRUMBS,
				newLocation: {
					url: 'telemarketing/dashboards/' + currentCampaignKey,
					title: ' בקרת קמפיין ' + campaignName,
					elmentType: 'ChangeCampaignView',
				}
			});
			let systemTitle = ' בקרת קמפיין - ' + campaignName;
			self.props.dispatch({ type: systemActions.types.SET_SYSTEM_TITLE, systemTitle: systemTitle });
		})

	}
 
	
	cleanDataByLinkType(){
		 
		let currentLocation = this.props.location.pathname;
		if(currentLocation.indexOf('calls_performance') != -1){
			 this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , fieldName:'callsPerformanceStats' , fieldValue:{}});
		}
		else if(currentLocation.indexOf('agents_performance') != -1){
			 this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , fieldName:'agentsPerformanceStats' , fieldValue:{}});
		}
		else if(currentLocation.indexOf('agents_work') != -1){
			 this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , fieldName:'agentsWorkDataStats' , fieldValue:{}});
		}
		else if(currentLocation.indexOf('agent_calls') != -1){ // agent calls screen
			this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , fieldName:'agentCallsStats' , fieldValue:{}});
		}
		else{ // this is main dashboard screen
			 this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , fieldName:'basicCampaignStats' , fieldValue:{}});
		}
	}
	
	loadDataByLinkType(){
		 
		let currentLocation = this.props.location.pathname;
		if(currentLocation.indexOf('calls_performance') != -1){
			campaignActions.loadDashboardCallsPerformaceByParts(this.props.dispatch , this.props.router.params.key );
			//campaignActions.getDashboardCampaignDataByParams(this.props.dispatch , this.props.router.params.key , 'calls_performance' , campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , 'callsPerformanceStats');	
		}
		else if(currentLocation.indexOf('agents_performance') != -1){ // agents performance screen
			//campaignActions.getDashboardCampaignDataByParams(this.props.dispatch , this.props.router.params.key , 'agents_performance' , campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , 'agentsPerformanceStats');	
			campaignActions.loadDashboardAgentsPerformaceByParts(this.props.dispatch , this.props.router.params.key );
		}
		else if(currentLocation.indexOf('agents_work') != -1){ // agents work screen
			//this.props.resetToFirstPage();
			campaignActions.getDashboardCampaignDataByParams(this.props.dispatch , this.props.router.params.key , 'agents_work' , campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , 'agentsWorkDataStats' , null, { load_connected_only:this.props.loadConnectedOnly , current_page:this.props.agentsWorkCurrentPage , up_to_page:true , all_campaigns:this.props.agentsWorkShowAllCampaigns});	
		}
		else if(currentLocation.indexOf('agent_calls') != -1){ // agent calls screen
			//this.props.resetToFirstPage();
			let params = {show_all_campaigns:this.props.showAllCampaigns};
			if(this.props.agentsWorkCurrentPage != 1){
				params.current_page = this.props.agentsWorkCurrentPage;
			}
			campaignActions.getDashboardCampaignDataByParams(this.props.dispatch , this.props.router.params.key , 'agent_calls' , campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , 'agentCallsStats' , this.props.router.params.agentKey , params);	
		}
		else if(currentLocation.indexOf('call_details') != -1){ // call details screen
			
		}
		else{ // this is main dashboard screen
		    campaignActions.loadMainDashboardByParts(this.props.dispatch , this.props.router.params.key );
			//campaignActions.getDashboardCampaignDataByParams(this.props.dispatch , this.props.router.params.key , '' , campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , 'basicCampaignStats');	
		}
	}
	
	reloadData(){
		this.setState({timeleft:60});
		this.loadDataByLinkType();
	}
	
	/*
		This function will prevent writing text in combo box - only select existing item
	*/
	onKeyDown(event) {
		event.preventDefault();
	}
	
	/*
		Function that handles choosing a view from combo box , and transfers the user to the correct page
	*/
	changeSelectedView(e){
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentPage' , fieldValue:1 });
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentCallsStats' , fieldValue:{} });
		if(e.target.selectedItem.url == ""){
			this.props.router.push('telemarketing/dashboards/' + this.props.router.params.key );
		}
		else{
			this.props.router.push('telemarketing/dashboards/' + this.props.router.params.key + '/' + e.target.selectedItem.url );
		}
	}
	
	/*
		Handles displaying modal window of choosing other campaign
	*/
	showChooseCampaignModal(){
		this.setState({showModalWindow:true});
	}
	
	/*
		Handles hiding modal window of choosing other campaign
	*/
	hideChooseCampaignModal(){
		this.setState({showModalWindow:false , selectedCampaign:{selectedValue:'' , selectedItem:null}});
	}
	
	/*
		Handles change in campaigns list combo
	*/
	changeCampaign(e){
		this.setState({selectedCampaign:{selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
	}
	
	/*
		Handles clicking 'ok' button in selecting other campaign modal window
	*/
	gotoCampaign(){
		if(!this.state.selectedCampaign.selectedItem || this.state.selectedCampaign.selectedValue == ''){
			return;
		}
		let currentLocation = this.props.location.pathname;
		let subPathName='';
		if(currentLocation.indexOf('calls_performance') != -1){
			subPathName = '/calls_performance';
			this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentPage' , fieldValue:1 });
			this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentCallsStats' , fieldValue:{} });
		}
		else if(currentLocation.indexOf('agents_performance') != -1){
			 subPathName = '/agents_performance';
			 this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentPage' , fieldValue:1 });
			 this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentCallsStats' , fieldValue:{} });
		}
		else if(currentLocation.indexOf('agents_work') != -1){
			 subPathName = '/agents_work';
			 this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentPage' , fieldValue:1 });
			 this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentCallsStats' , fieldValue:{} });
		}
		this.props.router.push(this.dashboardsURL + this.state.selectedCampaign.selectedItem.key + subPathName);
		this.hideChooseCampaignModal();
	}
	 
    render() {
		let baseURL = window.Laravel.baseURL;
        return (
				<div className="row campain-first-ontainer">
					<div className="col-md-6 blue-title nopadding">
						<div className="pull-right">{this.props.campaignNames[this.props.router.params.key] || <i className="fa fa-spinner fa-spin"></i>}</div>
						<div className="pull-right padding-30-R">
							<button title="החלף" type="button" className="btn btn-primary btn-xs" onClick={this.showChooseCampaignModal.bind(this)}>החלף</button>
						</div>
					</div>
					<div className="col-md-6 nopadding">
						<div className="col-md-4  pull-left nopadding">
							<Combo items={this.possibleViews} itemIdProperty="id" itemDisplayProperty='name' placeholder="בחר תצוגה" onKeyDown={this.onKeyDown.bind(this)} onChange={this.changeSelectedView.bind(this)} />
						</div>
						<div className="col-md-2 sand-clock-campain">
						{"00:" + (this.state.timeleft < 10 ? ("0"+this.state.timeleft) : this.state.timeleft )}	<a className="cursor-pointer" title="ריענון" onClick={this.reloadData.bind(this)}> <img src={baseURL + "Images/sand-clock-refresh-icon.png"} alt="ריענון"/></a>
						</div>
					</div>
					<ModalWindow show={this.state.showModalWindow} title={this.modalTitle} buttonX={this.hideChooseCampaignModal.bind(this)} buttonCancel={this.hideChooseCampaignModal.bind(this)} buttonOk={this.gotoCampaign.bind(this)} >
						<div className="row">
							<div className="col-md-4">
							שם קמפיין : 
							</div>
							<div className="col-md-8">
								<Combo items={this.props.campaignsList} placeholder={this.props.campaignsList.length ? "בחר קמפיין" :"טוען נתונים..."}  
										maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' 
										value={this.state.selectedCampaign.selectedValue}  onChange={this.changeCampaign.bind(this)}  
										inputStyle={{borderColor:((this.state.selectedCampaign.selectedItem && this.state.selectedCampaign.selectedValue != '') ? '#ccc':'#ff0000')}}
										/>
							</div>
						</div>
					</ModalWindow>
				</div>
        );
    }
}


function mapStateToProps(state) {
    return {
        campaignsList: state.tm.campaign.list,
        campaignNames: state.tm.campaign.campaignNames,
		currentUser: state.system.currentUser,
        basicCampaignStats: state.tm.campaign.basicCampaignStats,
		agentsWorkCurrentPage: state.tm.campaign.agentsWorkCurrentPage,
		agentsWorkCurrentLoadedIndex: state.tm.campaign.agentsWorkCurrentLoadedIndex,
		agentsWorkShowAllCampaigns: state.tm.campaign.agentsWorkShowAllCampaigns,
    };
}


export default connect(mapStateToProps)(withRouter(ChangeCampaignView));
