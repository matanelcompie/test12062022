import React from 'react';
import { connect } from 'react-redux';
import Gauge from 'components/global/D3/Gague/Gauge';
import ChangeCampaignView from '../ChangeCampaignView';
import constants from 'tm/constants/constants';
import {arraySort,getCurrentArcArray,getFormattedTimeFromSeconds} from 'libs/globalFunctions';
import * as campaignActions from 'tm/actions/campaignActions';

import CallListeningModal from './CallListeningModal';

class AgentsPerformance extends React.Component {
    constructor(props) {
        super(props);
		this.initConstants();
		this.state = {
			filterByType: null,
			sortedTable:null,
			filteredDataArray:null,
			sortDirections: { first_name: 'asc', status_id: 'asc', state_duration_seconds: 'asc', dialer_id: 'asc', voter_name: 'asc', phone_number: 'asc' },
			totalAgentsCount: <i className="fa fa-spinner fa-spin"></i>,
			totalInCallAgentsCount: <i className="fa fa-spinner fa-spin"></i>,
			totalWaitingAgentsCount: <i className="fa fa-spinner fa-spin"></i>,
			totalBreakingAgentsCount: <i className="fa fa-spinner fa-spin"></i>,
			totalConnectedAgentsCount: <i className="fa fa-spinner fa-spin"></i>
		}
    }
	/*
		Init constant variables : 
	*/
    initConstants() {
        this.blueArcColor = "#339999";
        this.yellowArcColor = "#DEAB23";
        this.greyArcBG = "#eceeef";
		this.styles={
			blueFont : {fontSize:'19px' , fontWeight:'600' , color:"#55CACA"},
			yellowFont:{fontSize:'19px' , fontWeight:'600' , color:"#F9BF42"},
		}
    }

	componentWillReceiveProps(nextProps){
		let allAgents = nextProps.agentsPerformanceStats.all_agents ;
		if(allAgents != undefined && allAgents != this.props.agentsPerformanceStats.all_agents){
			let newState = {};
			newState.totalAgentsCount = allAgents.length;
			newState.totalInCallAgentsCount = 0;
			newState.totalWaitingAgentsCount = 0;
			newState.totalBreakingAgentsCount = 0;
			newState.totalConnectedAgentsCount = 0;
			
			for(let i = 0 ; i < allAgents.length ; i++){
				switch(allAgents[i].status_id){
					case constants.TM.AGENT.CALLING_STATUS.CALL : 
						newState.totalInCallAgentsCount++;
						break;
					case constants.TM.AGENT.CALLING_STATUS.WAITING : 
						newState.totalWaitingAgentsCount++;
						break;
					case constants.TM.AGENT.CALLING_STATUS.BREAK : 
						newState.totalBreakingAgentsCount++;
						break;
				}
			}

			newState.totalConnectedAgentsCount = newState.totalInCallAgentsCount + newState.totalWaitingAgentsCount;				

			if(this.state.filterByType){
				 let dataArray = _.cloneDeep(allAgents);
				 let newDataArray = [];
				 switch(this.state.filterByType){
					case 'connected':
						newDataArray = dataArray.filter(item=> (item.status_id == constants.TM.AGENT.CALLING_STATUS.CALL || item.status_id==constants.TM.AGENT.CALLING_STATUS.WAITING));
						break;
					case 'call':
						newDataArray = dataArray.filter(item=> (item.status_id == constants.TM.AGENT.CALLING_STATUS.CALL));
						break;
					case 'waiting':
						newDataArray = dataArray.filter(item=> (item.status_id == constants.TM.AGENT.CALLING_STATUS.WAITING));
						break;
					case 'break':
						newDataArray = dataArray.filter(item=> (item.status_id == constants.TM.AGENT.CALLING_STATUS.BREAK));
						break;

				}
				allAgents = newDataArray;
			}

			newState.sortedTable = this.generateTableRows(allAgents, '','','');
			this.setState(newState);
		} 
	}


	/*
		This function renders rows of all agents , and considers the parameters that it gets - filtering or sorting (not mandatory)
	*/
	generateTableRows(dataArray , filterName , sortFieldName , sortDirection){
		let self = this;
		return dataArray.map(function(item , index){
			let statusName = "לא מחובר";
			let className= "";
			let listenToCallButton = null;
			let isConnected = false;
			switch(item.status_id){
				case constants.TM.AGENT.CALLING_STATUS.CALL : 
					isConnected = true;
					statusName = "בשיחה";
					className="light-green2-bg";
					listenToCallButton = <a style={{ cursor: 'pointer' }} title="האזן לשיחה"
						onClick={self.showCallListeningModal.bind(self, item)}>
						<img style={{ height: '22px', }} src={window.Laravel.baseURL + "Images/support_man.svg"}></img>
					</a>
					break;
				case constants.TM.AGENT.CALLING_STATUS.WAITING : 
					statusName = "ממתין";
					isConnected = true;
					className="light-orange2-bg";
					listenToCallButton = <a style={{ cursor: 'pointer' }} title="האזן לשיחה"
						onClick={self.showCallListeningModal.bind(self, item)}>
						<img style={{ height: '22px', }} src={window.Laravel.baseURL + "Images/support_man.svg"}></img>
					</a>
					break;
				case constants.TM.AGENT.CALLING_STATUS.BREAK : 
					statusName = "בהפסקה";
					isConnected = true;
					className="light-orange3-bg";
					listenToCallButton = <a style={{ cursor: 'pointer' }} title="האזן לשיחה"
						onClick={self.showCallListeningModal.bind(self, item)}>
						<img style={{ height: '22px', }} src={window.Laravel.baseURL + "Images/support_man.svg"}></img>
					</a>
					break;
			}
	 
			return (<tr className={className} key={index}>
                        <td>{item.first_name + ' '+ item.last_name}</td>
                        <td>{statusName} </td>
                        <td>{item.state_duration_seconds ? getFormattedTimeFromSeconds(item.state_duration_seconds,false) : "---"}</td>
                        <td>{(item.dialer_id && isConnected ) ? item.dialer_id:  "---"}</td>
                        <td>{(item.voter_name && isConnected ) ? item.voter_name: "---"}</td>
                        <td>{(item.phone_number  && isConnected ) ? item.phone_number :  "---"}</td>
                        <td>{listenToCallButton}</td>
                    </tr>)
		});
	}
	showCallListeningModal(callListenData, e){
		this.props.dispatch({type: campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , fieldName:'callListenData' , fieldValue:callListenData});
		//this.setState({callListenData})
	}
	/*
		Perform filter by agent calling status
	*/
	filterBy(filterBy){
		let dataArray = _.cloneDeep(this.props.agentsPerformanceStats.all_agents);
		let filterByType = this.state.filterByType;
		let newDataArray = [];
		switch(filterBy){
			case 'connected':
				filterByType = 'connected';
				newDataArray = dataArray.filter(item=> (item.status_id == constants.TM.AGENT.CALLING_STATUS.CALL || item.status_id==constants.TM.AGENT.CALLING_STATUS.WAITING));
				break;
			case 'call':
				filterByType = 'call';
				newDataArray = dataArray.filter(item=> (item.status_id == constants.TM.AGENT.CALLING_STATUS.CALL));
				break;
			case 'waiting':
				filterByType = 'waiting';
				newDataArray = dataArray.filter(item=> (item.status_id == constants.TM.AGENT.CALLING_STATUS.WAITING));
				break;
			case 'break':
				filterByType = 'break';
				newDataArray = dataArray.filter(item=> (item.status_id == constants.TM.AGENT.CALLING_STATUS.BREAK));
				break;
			case '':
			default :
				filterByType = null;
				newDataArray = dataArray;
				this.setState({filteredDataArray:null});
				break;
		}
		this.setState({sortedTable:this.generateTableRows(newDataArray, '','','')});
		if(filterBy){
			this.setState({filteredDataArray:newDataArray });
		}
		this.setState({filterByType});
	}
	
	/*
		Perform sort by column name
	*/
	sortBy(sortBy){
		let theNeededArray = this.props.agentsPerformanceStats.all_agents;
		if(this.state.filteredDataArray){
			theNeededArray = this.state.filteredDataArray
		}
		let dataArray = _.cloneDeep(theNeededArray);
		dataArray.sort(arraySort(this.state.sortDirections[sortBy], sortBy));
		let sortDirections = this.state.sortDirections;
		sortDirections[sortBy] = (sortDirections[sortBy] == 'asc' ? 'desc' : 'asc');
		this.setState({sortedTable:this.generateTableRows(dataArray, '','','') , sortDirections});
		
	}
	
    render() {
        return (
			<div className="stripMain campain-management">
				<div className="container status-2-erea">
					<div className="tm-first-box-on-page">
						<ChangeCampaignView />	 
						<div className="row contentContainer contentContainer2">
							<div className="col-md-12 blue-title nopadding" >ביצועי נציגים</div>
								<div className="col-md-1 nopadding margin-top20" >
									<div className="time-box-performance margin-top30">מתחילת הקמפיין</div>
									<div className="time-box-performance margin-top10 פ">שעה אחרונה</div>
								</div>
								<div className="col-md-11">
									<div className="col-md-5ths nopadding" >
										<div className="average-title">ממוצע שיחות לשעה</div>
										<div className="numberss-average margin-top20 turkiz2">{this.props.agentsPerformanceStats.total_average_calls_time || "-"}</div>
										<div className="numberss-average yellow">{this.props.agentsPerformanceStats.houry_average_calls_time || "-"}</div>
									</div>
									<div className="col-md-5ths nopadding">
										<div className="average-title">זמן טיפול ממוצע</div>
										<div className="average-graph margin-top20">
											{this.props.agentsPerformanceStats.total_average_action_calls_time?<div>
												<Gauge value={0.5}
														size={20}
														radius={67}
														height = {69}
														sections={getCurrentArcArray(0.5 , this.blueArcColor)}
														arrow={{height: 60, width: 2, color: "#000"}}
														legend={[]}
														label="15%"
												/>
												<span style={this.styles.blueFont}>{getFormattedTimeFromSeconds(this.props.agentsPerformanceStats.total_average_action_calls_time , false)}</span>
											</div> : <div className="numberss-average margin-top20 turkiz2">-</div>}
										</div>
										<div className="average-graph padding-top10">
											{this.props.agentsPerformanceStats.houry_average_action_calls_time ? <div>
												<Gauge value={(parseInt(this.props.agentsPerformanceStats.houry_average_action_calls_time)/parseInt(this.props.agentsPerformanceStats.total_average_action_calls_time))}
														size={20}
														radius={67}
														height = {69}
														sections={getCurrentArcArray((parseInt(this.props.agentsPerformanceStats.houry_average_action_calls_time)/parseInt(this.props.agentsPerformanceStats.total_average_action_calls_time)) , this.yellowArcColor)}
														arrow={{height: 60, width: 2, color: "#000"}}
														legend={[]}
														label="15%"
												/>
												<span style={this.styles.yellowFont}>{getFormattedTimeFromSeconds(this.props.agentsPerformanceStats.houry_average_action_calls_time , false)}</span>
											</div>: <div className="numberss-average yellow">-</div>}
										</div>
									</div>
									<div className="col-md-5ths nopadding" >
										<div className="average-title">זמן שיחה ממוצע</div>
										<div className="average-graph margin-top20">
											{this.props.agentsPerformanceStats.total_average_regular_calls_time?<div>
											<Gauge value={(parseInt(this.props.agentsPerformanceStats.total_average_regular_calls_time)/parseInt(this.props.agentsPerformanceStats.total_average_action_calls_time))}
													size={20}
													radius={67}
													height = {69}
													sections={getCurrentArcArray((parseInt(this.props.agentsPerformanceStats.total_average_regular_calls_time)/parseInt(this.props.agentsPerformanceStats.total_average_action_calls_time)) , this.blueArcColor)}
													arrow={{height: 60, width: 2, color: "#000"}}
													legend={[]}
													label="15%"
											/>
											<span style={this.styles.blueFont}>{getFormattedTimeFromSeconds(this.props.agentsPerformanceStats.total_average_regular_calls_time , false)}</span>
											</div>: <div className="numberss-average margin-top20 turkiz2">-</div>}
										</div>
										<div className="average-graph padding-top10">
											{this.props.agentsPerformanceStats.houry_average_regular_calls_time ?<div>
												<Gauge value={(parseInt(this.props.agentsPerformanceStats.houry_average_regular_calls_time)/parseInt(this.props.agentsPerformanceStats.total_average_regular_calls_time))}
														size={20}
														radius={67}
														height = {69}
														sections={getCurrentArcArray((parseInt(this.props.agentsPerformanceStats.houry_average_regular_calls_time)/parseInt(this.props.agentsPerformanceStats.total_average_regular_calls_time)) , this.yellowArcColor)}
														arrow={{height: 60, width: 2, color: "#000"}}
														legend={[]}
														label="15%"
												/>
												<span style={this.styles.yellowFont}>{getFormattedTimeFromSeconds(this.props.agentsPerformanceStats.houry_average_regular_calls_time , false)}</span>
											</div>: <div className="numberss-average yellow">-</div>}
										</div>
									</div>
									<div className="col-md-5ths nopadding" >
										<div className="average-title">זמן המתנה ממוצע</div>
										<div className="average-graph margin-top20">
											{this.props.agentsPerformanceStats.total_average_waiting_time?<div>
												<Gauge value={(parseInt(this.props.agentsPerformanceStats.total_average_waiting_time)/parseInt(this.props.agentsPerformanceStats.total_average_action_calls_time))}
														size={20}
														radius={67}
														height = {69}
														sections={getCurrentArcArray((parseInt(this.props.agentsPerformanceStats.total_average_waiting_time)/parseInt(this.props.agentsPerformanceStats.total_average_action_calls_time)) , this.blueArcColor)}
														arrow={{height: 60, width: 2, color: "#000"}}
														legend={[]}
														label="15%"
												/>
												<span style={this.styles.blueFont}>{getFormattedTimeFromSeconds(this.props.agentsPerformanceStats.total_average_waiting_time,false)}</span>
											</div>: <div className="numberss-average margin-top20 turkiz2">-</div>}
										</div>
										<div className="average-graph padding-top10">
											{this.props.agentsPerformanceStats.houry_average_waiting_time?<div>
												<Gauge value={(parseInt(this.props.agentsPerformanceStats.houry_average_waiting_time)/parseInt(this.props.agentsPerformanceStats.total_average_waiting_time))}
														size={20}
														radius={67}
														height = {69}
														sections={getCurrentArcArray((parseInt(this.props.agentsPerformanceStats.houry_average_waiting_time)/parseInt(this.props.agentsPerformanceStats.total_average_waiting_time)) , this.yellowArcColor)}
														arrow={{height: 60, width: 2, color: "#000"}}
														legend={[]}
														label="15%"
												/>
												<span style={this.styles.yellowFont}>{getFormattedTimeFromSeconds(this.props.agentsPerformanceStats.houry_average_waiting_time , false )}</span>
											</div>: <div className="numberss-average yellow">-</div>}
									</div>
								</div>
								<div className="col-md-5ths nopadding" style={{float:'right', width:'20%'}}>
									<div className="average-title">זמן הפסקה</div>
									<div className="numberss-average margin-top20 light-blue">{getFormattedTimeFromSeconds(this.props.agentsPerformanceStats.total_break_time)}</div>
									<div className="numberss-average light-blue">{getFormattedTimeFromSeconds(this.props.agentsPerformanceStats.houry_break_time)}</div>
								</div>
							</div>
						</div>
						<div className="row nomargin">
							<div className="contentContainer col-md-3 boxes-campain right-bittom-box-performance">
								<div className="blue-title">נציגים בקמפיין </div>
								<div className="row numbers40" onClick={this.filterBy.bind(this , '')}>
									<div className="col-md-3 numbers40">{this.state.totalAgentsCount}</div>
									<div className="col-md-9 representors-left">משובצים</div>
								</div>
								<div className="row numbers40" onClick={this.filterBy.bind(this , 'connected')}>
									<div className="col-md-3 numbers40">{this.state.totalConnectedAgentsCount }</div>
									<div className="col-md-9 representors-left">מחוברים</div>
								</div>
								<div className="row numbers40" onClick={this.filterBy.bind(this , 'call')}>
									<div className="col-md-3 numbers40">{this.state.totalInCallAgentsCount}</div>
									<div className="col-md-9 representors-left">בשיחה פעילה</div>
								</div>
								<div className="row numbers40" onClick={this.filterBy.bind(this , 'waiting')}>
									<div className="col-md-3 numbers40">{this.state.totalWaitingAgentsCount}</div>
									<div className="col-md-9 representors-left">ממתינים</div>
								</div>
								<div className="row numbers40" onClick={this.filterBy.bind(this , 'break')}>
									<div className="col-md-3 numbers40">{this.state.totalBreakingAgentsCount}</div>
									<div className="col-md-9 representors-left representors-left-last">בהפסקה</div>
								</div>
								<div className="row padding-top10">
									<button type="submit" className="btn btn-primary btn-sm btn-100">תצוגה מפורטת</button> 
								</div>
							</div>
							<div className="contentContainer col-md-9 boxes-campain performance-bottom-box">
								<div style={{overflow:'auto' , height:'380px'}}>
									<table className="table-performance">
										<thead>
											<tr>
												<th><span className="cursor-pointer" onClick={this.sortBy.bind(this,'first_name')}>שם נציג</span></th>
												<th><span className="cursor-pointer" onClick={this.sortBy.bind(this,'status_id')}>מצב</span></th>
												<th><span className="cursor-pointer" onClick={this.sortBy.bind(this,'state_duration_seconds')}>זמן מצב</span></th>
												<th><span className="cursor-pointer" onClick={this.sortBy.bind(this,'dialer_id')}>שלוחה</span></th>
												<th><span className="cursor-pointer" onClick={this.sortBy.bind(this,'voter_name')}>תושב</span></th>
												<th width="15%"><span className="cursor-pointer" onClick={this.sortBy.bind(this,'phone_number')}>מספר טלפון</span></th>
												<th><span className="cursor-pointer"></span></th>
											</tr>
										</thead>
										<tbody>{this.state.sortedTable}</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
				{(this.props.callListenData && this.props.callListenData.status_id) && <CallListeningModal
					campaignKey={this.props.agentsPerformanceStats.campaign_key}
					hideModal={this.showCallListeningModal.bind(this)}
					 >
				</CallListeningModal>}
			</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        campaignsList: state.tm.campaign.list,
		agentsPerformanceStats: state.tm.campaign.agentsPerformanceStats,
		callListenData: state.tm.campaign.callListenData,
    };
}

export default connect(mapStateToProps)(AgentsPerformance);