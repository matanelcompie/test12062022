import React from 'react';
import { connect } from 'react-redux';
import * as campaignActions from 'tm/actions/campaignActions';
import ModalWindow from 'tm/components/common/ModalWindow';
import Combo from 'components/global/Combo';
import ChangeCampaignView from '../ChangeCampaignView';
import {withRouter } from 'react-router';
import {getFormattedTimeFromSeconds,getTmCallEndStatusName , parseDateToPicker, parseDateFromPicker} from 'libs/globalFunctions';
import Pagination from 'components/global/Pagination';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import ReactWidgets from 'react-widgets';

import SmallAudio from 'tm/components/common/SmallAudio'


class AgentCalls extends React.Component {
    constructor(props) {
        super(props);
		momentLocalizer(moment);
		this.state={
			selectedAgentsOption:{id:1 , name:'כל הנציגים'} ,
			fromTime:null,
			toTime:null,
			fromDate:null,
			toDate:null,
			showAllCampaigns:this.props.agentsWorkShowAllCampaigns,
			searchResultsShowAllCampaigns:this.props.agentsWorkShowAllCampaigns,
			showChangeAgentModalWindow:false,
			selectedAgentToChange : {selectedValue:'' , selectedItem:null}
		};
		this.initConstants();
		 
    }
	
	/*
		Init constant variables : 
	*/
    initConstants() {
		this.itemsPerPage = 15;
		this.agentsOptions = [
			{id:1 , name:'כל הנציגים'},
			{id:2 , name:'נציגים פעילים בלבד'},
		];
		this.modalTitle = "החלפת נציג";
	}
	
	
	/*
		Handles changes in combo of agents types filtering
	*/
	changeSelectedAgentsType(e){
		this.setState({selectedAgentsOption:e.target.selectedItem});
	}
	
	navigateToPage(pageIndex) {
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentPage' , fieldValue:pageIndex });
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentCallsStats' , fieldValue:{} });
		let params = {current_page:pageIndex};
		campaignActions.getDashboardCampaignDataByParams(this.props.dispatch , this.props.router.params.key , 'agent_calls' , campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , 'agentCallsStats' , this.props.router.params.agentKey , params);
		/*
		if(this.props.agentCallsStats.all_calls_list.length < this.props.agentCallsStats.total_count ){
			if(!this.props.loadingMoreAgentCalls){
				campaignActions.loadMoreAgentCalls(this.props.dispatch , this.props.router.params.key , this.props.router.params.agentKey, {current_page:(this.props.agentsWorkCurrentLoadedIndex+1)});
				this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentLoadedIndex' , fieldValue:(this.props.agentsWorkCurrentLoadedIndex+1) });
			}
		}
		*/
	}
	
	/*
		Handles clicking on user details left button - redirects to user calls page : 
	*/
	showCallDetails(callKey){
		this.props.router.push('telemarketing/dashboards/'+this.props.router.params.key+'/agent_calls/'+this.props.router.params.agentKey+'/calls/'+callKey);
	}
	
	/*
		Handle change of 'from time'
	*/
	fromTimeChange(value, filter) {
        this.setState({fromTime:value});
    }
	
	/*
		Handle change of 'to time'
	*/
	toTimeChange(value, filter) {
        this.setState({toTime:value});
    }
	
	/*
		Handle change of 'from date'
	*/
	fromDateChange(value, filter) {
        this.setState({fromDate:value});
		if(!value && this.state.fromTime){
			this.setState({fromTime:null});
		}
    }
	
	/*
		Handle change of 'to date'
	*/
	toDateChange(value, filter) {
        this.setState({toDate:value});
		if(!value && this.state.toTime){
			this.setState({toTime:null});
		}
    }
	
	/*
		Handles checking/unchecking checkbox :
	*/
	clickCheckbox(e){
		 this.setState({showAllCampaigns:(e.target.checked ? 1 : 0)});
	}
	
	/*
		Handles clicking 'show' button on top left
	*/
	filterResults(){
		this.setState({searchResultsShowAllCampaigns:this.state.showAllCampaigns});
		let fromDate = null;
		let toDate = null;
		if(this.state.fromDate){
			fromDate = this.state.fromDate + ' ';
			if(this.state.fromTime){
				fromDate += this.state.fromTime + ":00";
			}
			else{
				fromDate += "00:00:00";
			}
		}
		if(this.state.toDate){
			toDate = this.state.toDate + ' ';
			if(this.state.toTime){
				toDate += this.state.toTime + ":00";
			}
			else{
				toDate += "23:59:00";
			}
		}
		let params = {};
		if(fromDate){
			params.from_date_time = fromDate;
		}
		if(toDate){
			params.to_date_time = toDate;
		}
		params.show_all_campaigns = this.state.showAllCampaigns;
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , fieldName:'agentCallsStats' , fieldValue:{}});
		campaignActions.getDashboardCampaignDataByParams(this.props.dispatch , this.props.router.params.key , 'agent_calls' , campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , 'agentCallsStats' , this.props.router.params.agentKey , params);
		this.resetToFirstPage();
	}
	
	/*
		Handles showing/hiding modal window of changing agent
	*/
	showHideChangeAgentWindow(isShow){
		this.setState({showChangeAgentModalWindow:isShow});
	}
	
	resetToFirstPage(){
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentPage' , fieldValue:1 });
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentLoadedIndex' , fieldValue:1 });
	}
	
	/*
		Handles clicking 'ok' button in the modal window which switches to other agent calls
	*/
	clickChangeToOtherAgent(){
		if(!this.state.selectedAgentToChange.selectedItem){return;}
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentPage' , fieldValue:1 });
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentLoadedIndex' , fieldValue:1 });
		this.setState({selectedAgentsOption:{id:1 , name:'כל הנציגים'} ,
						fromTime:null,
						toTime:null,
						fromDate:null,
						toDate:null,
						showAllCampaigns:0,
						searchResultsShowAllCampaigns:0,
						showChangeAgentModalWindow:false,
						selectedAgentToChange : {selectedValue:'' , selectedItem:null}});
		this.props.router.push('telemarketing/dashboards/'+this.props.router.params.key+'/agent_calls/' + this.state.selectedAgentToChange.selectedItem.key);
	}
	
	/*
		Handles change in combo box of agent inside the modal window 
	*/
	changeSelectedAgent(e){
		let otherSelectedAgentToChange = {
				selectedValue: e.target.value,
				selectedItem: e.target.selectedItem,
		};
        this.setState({ selectedAgentToChange : otherSelectedAgentToChange});
	}

	/**
	 * Set render variables
	 * 
	 * @return void
	 */
	setVariables() {
		let fromDate = null;
		let toDate = null;
		if(this.state.fromDate){
			fromDate = this.state.fromDate + ' ';
			if(this.state.fromTime){
				fromDate += this.state.fromTime + ":00";
			}
			else{
				fromDate += "00:00:00";
			}
		}
		if(this.state.toDate){
			toDate = this.state.toDate + ' ';
			if(this.state.toTime){
				toDate += this.state.toTime + ":00";
			}
			else{
				toDate += "23:59:00";
			}
		}
		let params = {export: 'excel'};
		if(fromDate){
			params.from_date_time = fromDate;
		}
		if(toDate){
			params.to_date_time = toDate;
		}
		params.show_all_campaigns = this.state.showAllCampaigns;
		this.csvExport = window.Laravel.baseURL +
							"api/tm/dashboards/" +
							this.props.router.params.key +
							'/agent_calls/' +
							this.props.router.params.agentKey +
							"/?";

		for (var key in params) {
			this.csvExport += key + "=" + params[key] + "&";
		}
	}
	
    render() {
		 
		let self = this;
		this.setVariables();

        return (
			<div className="stripMain campain-management">
				<div className="tm-first-box-on-page">
					<ChangeCampaignView showAllCampaigns={this.state.searchResultsShowAllCampaigns} resetToFirstPage={this.resetToFirstPage.bind(this)} />
				</div>
				<div style={{margin:"20px 0 0 0"}}></div>
				 
				<div className="dtlsBox srchRsltsBox box-content margin-top20">
            <div className="row rsltsTitleRow calls-filters">
                <div className="col-lg-12">
                    <div className="blue-title nopadding pull-right">שיחות לנציג</div>
                    <div className="devider-vertical pull-right"></div>
                    <div className="form-group pull-right">
                        <label htmlFor="from-date" className="control-label pull-right">מתאריך</label>
                        <div className="datepicker-container">
                            <div className="input-group date">
                                <ReactWidgets.DateTimePicker
                                                isRtl={true} time={false}
                                                value={parseDateToPicker(this.state.fromDate)}
                                                onChange={parseDateFromPicker.bind(this, {callback: this.fromDateChange,
                                                    format: "YYYY-MM-DD",
                                                    functionParams: 'dateTime'})
                                                } format="DD/MM/YYYY"/>
                            </div>
                        </div>
                    </div>
                    <div className="form-group pull-right">
                        <label htmlFor="from-hour" className="control-label pull-right">משעה</label>
                        <div className="pull-right">
                            <ReactWidgets.DateTimePicker
                                    isRtl={true} time={true} calendar={false}
                                    value={parseDateToPicker(this.state.fromTime)}
                                    onChange={parseDateFromPicker.bind(this, {callback: this.fromTimeChange,
                                                                              format: "HH:mm",
                                                                              functionParams: 'dateTime'})}
                                    format="HH:mm"
									timeFormat="HH:mm"
									style={{width:'100px'}} disabled={!this.state.fromDate} />
                        </div>
                    </div>
                    <div className="form-group pull-right">
                        <label htmlFor="until-date" className="control-label pull-right">עד תאריך</label>
                        <div className="datepicker-container">
                            <div className="input-group date">
                                <ReactWidgets.DateTimePicker
                                                isRtl={true} time={false}
                                                value={parseDateToPicker(this.state.toDate)}
                                                onChange={parseDateFromPicker.bind(this, {callback: this.toDateChange,
                                                    format: "YYYY-MM-DD",
                                                    functionParams: 'dateTime'})
                                                } format="DD/MM/YYYY"/>
                            </div>
                        </div>
                    </div>
                    <div className="form-group pull-right">
                        <label htmlFor="until-hour" className="control-label pull-right">עד שעה</label>
                        <div className="pull-right">
                            <ReactWidgets.DateTimePicker
                                    isRtl={true} time={true} calendar={false}
                                    value={parseDateToPicker(this.state.toTime)}
                                    onChange={parseDateFromPicker.bind(this, {callback: this.toTimeChange,
                                                                              format: "HH:mm",
                                                                              functionParams: 'dateTime'})}
                                    format="HH:mm" 
									timeFormat="HH:mm"
									style={{width:'100px'}}   disabled={!this.state.toDate} />
                        </div>
                    </div>
					<div className="form-group pull-right">
                        <label htmlFor="all-campaigns" className="control-label pull-right"><input type="checkbox" checked={this.state.showAllCampaigns == 1} onChange={this.clickCheckbox.bind(this)} /> כל הקמפיינים</label>
                    </div>
                    <div className="form-group pull-right"> 
                        <button title="הצג" type="button" className="btn btn-primary btn-xs" 
								onClick={this.filterResults.bind(this)}
								
								disabled={(this.state.toDate < this.state.fromDate || (this.state.toDate == this.state.fromDate && this.state.toTime < this.state.fromTime))}>הצג</button>
                    </div>
                    <div className="form-group pull-right">
                    	<a title="יצוא ל-אקסל" className="icon-box excel" target="_blank" href={this.csvExport}></a>
                    </div>
					

                </div>
                <div className="row nomargin">
                    <div className="col-md-12 ">
                        <div className="border-top-gray"></div>
                <div className="pull-right name-representive ">
				{
					((this.props.agentsUserData &&  this.props.agentsUserData[this.props.router.params.agentKey])?
						(this.props.agentsUserData[this.props.router.params.agentKey].first_name + ' ' + this.props.agentsUserData[this.props.router.params.agentKey].last_name + " | ת.ז " + this.props.agentsUserData[this.props.router.params.agentKey].personal_identity)
						:
						<i className="fa fa-spinner fa-spin"></i>)
				}
							
				</div>
                <div className="pull-right padding-30-R">
                    <button title="החלף" type="button" 
							className="btn btn-primary btn-xs" data-toggle="modal" 
							onClick={this.showHideChangeAgentWindow.bind(this,true)} disabled={!((this.props.agentsUserData &&  this.props.agentsUserData[this.props.router.params.agentKey]))}>החלף נציג</button>
                </div>
                </div>
            </div>

            </div>
			{this.state.showChangeAgentModalWindow && 
					<ModalWindow show={this.state.showChangeAgentModalWindow } title={this.modalTitle} buttonX={this.showHideChangeAgentWindow.bind(this , false)}
					 buttonCancel={this.showHideChangeAgentWindow.bind(this , false)} buttonOk={this.clickChangeToOtherAgent.bind(this)} >
						<div className="row">
							<div className="col-md-4">
							שם נציג
							</div>
							<div className="col-md-8">
							{(this.props.agentCallsStats && this.props.agentCallsStats.all_agents_list) &&<Combo items={this.props.agentCallsStats.all_agents_list} placeholder="בחר נציג"  
										maxDisplayItems={5}  itemIdProperty="user_id" itemDisplayProperty='full_name'
							value={this.state.selectedAgentToChange.selectedValue}  onChange={this.changeSelectedAgent.bind(this)}  />}
							</div>
						</div>
					</ModalWindow>
			}
            <div className="table-container">
                <table className="table table-striped line-around table-calls-representatives">
                    <thead>
                    <tr className="second-line">
                        <th>שם קמפיין</th>
                        <th>תאריך</th>
                        <th>שעת שיחה</th>
                        <th>זמן טיפול</th>
                        <th>זמן שיחה</th>
                        <th>ת.ז. תושב</th>
                        <th>שם תושב</th>
                        <th>סיכום שיחה</th>
                        <th>מענה לשאלון</th>
                        <th>קובץ שמע</th>
                    </tr>
                    </thead>
                    <tbody>
						{
							(this.props.agentCallsStats && this.props.agentCallsStats.all_calls_list) ? 
							this.props.agentCallsStats.all_calls_list.map(function(item,index){
								//if(index < ((self.props.agentsWorkCurrentPage-1)*self.itemsPerPage) || index >= (self.props.agentsWorkCurrentPage*self.itemsPerPage)){return;}
								return (<tr key={index}>
											<td>{item.campaign_name}</td>
											<td>{item.created_at.split(' ')[0].split("-").reverse().join("/")}</td>
											<td>{item.created_at.split(' ')[1]}</td>
											<td>{getFormattedTimeFromSeconds(Math.abs(item.action_call_seconds ), false)}</td>
											<td>{getFormattedTimeFromSeconds(Math.abs(item.regular_call_seconds) , false)}</td>
											<td>{item.personal_identity }</td>
											<td>{item.first_name + ' '+ item.last_name}</td>
											<td>{getTmCallEndStatusName(item.call_end_status)}</td>
											<td>{!item.voters_answers_count  ? "לא" :"כן"}</td>
											<td>{item.audio_file_name? <SmallAudio audioFileName={item.audio_file_name} campaign_id={item.campaign_id}/> : "" }</td>
											<td><a title="צפייה" className="arrow-circle cursor-pointer" onClick={self.showCallDetails.bind(self,  item.call_key)}></a></td>
										</tr>)
							})
							:
							<tr><td colSpan="10" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים ...</td></tr>
						}
                    </tbody>
                </table>
            </div>

            {(this.props.agentCallsStats && this.props.agentCallsStats.all_calls_list) && 
						<Pagination resultsCount={this.props.agentCallsStats.total_count}
							displayItemsPerPage={this.itemsPerPage}
							currentPage={this.props.agentsWorkCurrentPage}
							navigateToPage={this.navigateToPage.bind(this)} />
			}
        </div> 
			</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        campaignsList: state.tm.campaign.list,
		agentCallsStats: state.tm.campaign.agentCallsStats,
		loadingMoreAgentCalls: state.tm.campaign.loadingMoreAgentCalls,
		agentsWorkCurrentPage: state.tm.campaign.agentsWorkCurrentPage,
		agentsWorkCurrentLoadedIndex: state.tm.campaign.agentsWorkCurrentLoadedIndex,
		agentsUserData: state.tm.campaign.agentsUserData,
		agentsWorkShowAllCampaigns: state.tm.campaign.agentsWorkShowAllCampaigns,
    };
}

export default connect(mapStateToProps)(withRouter(AgentCalls));