import React from 'react';
import { connect } from 'react-redux';
import * as campaignActions from 'tm/actions/campaignActions';
import ModalWindow from 'tm/components/common/ModalWindow';
import Combo from 'components/global/Combo';
import Gauge from 'components/global/D3/Gague/Gauge';
import ChangeCampaignView from '../ChangeCampaignView';
import constants from 'tm/constants/constants';
import {withRouter } from 'react-router';
import {arraySort,getCurrentArcArray,getFormattedTimeFromSeconds} from 'libs/globalFunctions';
import Pagination from 'components/global/Pagination';

import ReactWidgets from 'react-widgets';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import moment from 'moment';
import { parseDateToPicker, parseDateFromPicker } from '../../../../libs/globalFunctions';


class AgentsWork extends React.Component {
    constructor(props) {
        super(props);
		
		this.state={
			selectedAgentsOption:{id:1 , name:'כל הנציגים'} ,
			selectedAgentsOptionLabel : 'כל הנציגים',
			currentSelectedOptionID:1,
			checkedShowAllCampaigns:0,
			//currentPage:1,
			currentLoadedIndex:1,
			summaryDateValue: null
		};
        momentLocalizer(moment);

		this.initConstants();
		 
    }
	
	/*
		Init constant variables : 
	*/
    initConstants() {
		this.itemsPerPage=15;
		this.agentsOptions = [
			{id:1 , name:'כל הנציגים'},
			{id:2 , name:'נציגים פעילים בלבד'},
		];
	}
	
 
	
	/*
		Handles changes in combo of agents types filtering
	*/
	changeSelectedAgentsType(e){
		this.setState({selectedAgentsOption : e.target.selectedItem , selectedAgentsOptionLabel:e.target.value});
		
	}
	
	/*
		Handles clicking on user details left button - redirects to user calls page : 
	*/
	redirectToAgentCalls(userKey){
	 
		this.props.router.push('telemarketing/dashboards/' + this.props.router.params.key + '/agent_calls/'+userKey);
	}
	
	/*
		Handles clicking on filter button on top right side
	*/
	filterAgentsList(){
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentPage' , fieldValue:1 });
		this.props.dispatch({type: campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , fieldName:'agentsWorkDataStats' , fieldValue:{}});
		this.props.dispatch({type: campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , fieldName:'agentsWorkShowAllCampaigns' , fieldValue:this.state.checkedShowAllCampaigns});
		this.setState({currentSelectedOptionID:this.state.selectedAgentsOption.id , currentLoadedIndex:1});
		campaignActions.getDashboardCampaignDataByParams(this.props.dispatch , this.props.router.params.key , 'agents_work' , campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , 'agentsWorkDataStats' , null , {load_connected_only:((this.state.selectedAgentsOption && this.state.selectedAgentsOption.id == 1)? '0':'1') , all_campaigns:(this.state.checkedShowAllCampaigns==1?'1':'0')});
	}
	
	resetToFirstPage(){
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentPage' , fieldValue:1 });
		this.setState({ currentLoadedIndex:1});
	}
 
	navigateToPage(pageIndex) {
		this.props.dispatch({type:campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE  , fieldName:'agentsWorkCurrentPage' , fieldValue:pageIndex });
		if(this.props.agentsWorkDataStats.agents_list.length < this.props.agentsWorkDataStats.total_count ){
			if(!this.props.loadingMoreAgentsWorks){
				if(this.state.currentLoadedIndex+1 == pageIndex){
					campaignActions.loadMoreAgentsWorks(this.props.dispatch , this.props.router.params.key , {current_page:(this.state.currentLoadedIndex+1) , load_connected_only:((this.state.selectedAgentsOption && this.state.selectedAgentsOption.id == 1)? '0':'1') , all_campaigns:(this.props.agentsWorkShowAllCampaigns==1?'1':'0')});
				}
				else{
					campaignActions.loadMoreAgentsWorks(this.props.dispatch , this.props.router.params.key , {current_page:(this.state.currentLoadedIndex+1) , load_connected_only:((this.state.selectedAgentsOption && this.state.selectedAgentsOption.id == 1)? '0':'1') , all_campaigns:(this.props.agentsWorkShowAllCampaigns==1?'1':'0')});
					campaignActions.loadMoreAgentsWorks(this.props.dispatch , this.props.router.params.key , {current_page:(pageIndex) , load_connected_only:((this.state.selectedAgentsOption && this.state.selectedAgentsOption.id == 1)? '0':'1') , all_campaigns:(this.props.agentsWorkShowAllCampaigns==1?'1':'0')});
				}
				this.setState({currentLoadedIndex:(this.state.currentLoadedIndex+1)});
			}
		}
		/*
		this.setState({ currentPage: pageIndex });
		if(this.props.agentsWorkDataStats.agents_list.length < this.props.agentsWorkDataStats.total_count ){
			if(!this.props.loadingMoreAgentsWorks){
				campaignActions.loadMoreAgentsWorks(this.props.dispatch , this.props.router.params.key , {current_page:(this.state.currentLoadedIndex+1)});
				this.setState({currentLoadedIndex:(this.state.currentLoadedIndex+1)});
			}
		}
		*/
	}
	
	checkAllCampaignsChanhe(e){
		this.setState({checkedShowAllCampaigns : (e.target.checked?1:0)});
	}
	updateDateValue(value, format) {
		this.setState({
			summaryDateValue : value
		})
    }
	printData(){
    let exportUrl =	window.Laravel.baseURL +
      "api/tm/dashboards/" +
      this.props.router.params.key +
      "/agents_work?load_connected_only=" +
      (this.state.selectedAgentsOption &&
      this.state.selectedAgentsOption.id == 1
        ? "0"
        : "1") +
      "&all_campaigns=" +
      (this.state.checkedShowAllCampaigns == 1 ? "1" : "0") +
      "&export=print";
    window.open(exportUrl, "_blank");
	}
	
	excelSummaryData(){
		let checkedShowAllCampaigns = this.state.checkedShowAllCampaigns== 1 ;
		let exportUrl = window.Laravel.baseURL +
		"api/tm/dashboards/" +
		this.props.router.params.key +
		"/agents_work_summary/export?all_campaigns=" + (checkedShowAllCampaigns ? "1" : "0");

		if(this.state.summaryDateValue){
			exportUrl += '&summary_date=' + this.state.summaryDateValue;
		} else if(checkedShowAllCampaigns) {
				alert('חובה לבחור תאריך לדוח!');
				return;
		}
		window.open(exportUrl, "_blank");
	}
	
    render() {
		 
		let self = this;
		let rowsCount = 0;
		let baseURL = window.Laravel.baseURL;
 
		let agentsDataHadLoaded = (this.props.agentsWorkDataStats.campaign_name && this.props.agentsWorkDataStats.agents_list != undefined ) && !this.props.loadingMoreAgentsWorks;
        
		return (
			<div className="stripMain campain-management">
				<div className="tm-first-box-on-page">
					<ChangeCampaignView resetToFirstPage={this.resetToFirstPage.bind(this)} loadConnectedOnly={((this.state.selectedAgentsOption && this.state.selectedAgentsOption.id == 1)? '0':'1')} />
				</div>
				<div style={{margin:"20px 0 0 0"}}></div>
				<div className="dtlsBox srchRsltsBox box-content" >
					<div className="row rsltsTitleRow">
						<div className="col-lg-9 col-md-10 representative-select">
							<div className="blue-title nopadding pull-right">עבודת נציגים</div>
							<div className="devider-vertical"></div>
							<div className="left-panet-title pull-right">
								<label htmlFor="select-portion"> הצג</label>
								<div style={{paddingLeft:'10px' , paddingRight:'10px' , width:'170px'}}>
									<Combo items={this.agentsOptions} value={this.state.selectedAgentsOption ? this.state.selectedAgentsOption.name : this.state.selectedAgentsOptionLabel}  itemIdProperty="id" itemDisplayProperty='name'  onChange={this.changeSelectedAgentsType.bind(this)} />
								</div>
								 
								<div style={{paddingLeft:'5px' ,  paddingRight:'10px' }}>
									<input type="checkbox" checked={this.state.checkedShowAllCampaigns == 1} onChange={this.checkAllCampaignsChanhe.bind(this)}/>
								</div>
								<label htmlFor="select-all-campaigns"> כל הקמפיינים</label>
								<button title="הצג" type="button" className="btn btn-primary btn-xs" disabled={!this.state.selectedAgentsOption || (this.state.currentSelectedOptionID == this.state.selectedAgentsOption.id && this.props.agentsWorkShowAllCampaigns==this.state.checkedShowAllCampaigns)} onClick={this.filterAgentsList.bind(this)}>הצג</button>
						</div>
                </div>

                <div className="col-lg-3 col-md-2 clearfix">
					<div className="row">
						<div className="col-md-2">
							<div className="link-box pull-left">
								<a title="הדפסה" onClick={this.printData.bind(this)} target="_blank" style={{cursor:'pointer'}}  ><img src={baseURL + "Images/print.png"} /></a>
							</div>
						</div>
						{/* <label className="col-md-2 control-label"> תאריך דוח </label> */}
						<div className="col-md-8">
								<ReactWidgets.DateTimePicker
									isRtl={true}
									time={false}
									value={parseDateToPicker(this.state.summaryDateValue)}
									onChange={parseDateFromPicker.bind(this, { callback: this.updateDateValue, format: "YYYY-MM-DD", functionParams: 'summaryDateValue' })}
									format="DD/MM/YYYY"
									max={parseDateToPicker(new Date())}
							/>

						</div>
						<div className="col-md-2">
							<div className="link-box pull-left">
									<a title="ייצוא לאקסל" onClick={this.excelSummaryData.bind(this)} target="_blank" style={{cursor:'pointer'}}  ><img src={baseURL + "Images/excel.png"} /></a>
							</div>
						</div>
					</div>

                </div>

            <div className="table-container" style={{paddingRight:'15px' , paddingLeft:'15px'}}>
                <table className="table table-striped line-around table-representatives">
                    <thead>
                    <tr className="first-line">
                        <th></th>
                        <th colSpan="5" className="text-center">זמן</th>
                        <th colSpan="2" className="text-center">שיחות לשעה</th>
                        <th colSpan="3" className="text-center">שאלונים לשעה</th>
                        <th colSpan="7"></th>
                    </tr>
                    <tr className="second-line">
                        <th>שם נציג</th>
                        <th>פעילות</th>
                        <th>המתנה</th>
                        <th>הפסקה</th>
                        <th>שיחה</th>
                        <th>טיפול</th>
                        <th>שעה אחרונה</th>
                        <th>היום</th>
                        <th>שעה אחרונה</th>
                        <th>היום</th>
                        <th>יחס</th>
                        <th>מצב</th>
                        <th> שלוחה</th>
                        <th> תושב</th>
                        <th> שם מלא</th>
                        <th>  מספר</th>
                        <th> זמן מצב</th>
                        <th>  </th>
                    </tr>
                    </thead>
                    <tbody>
					{
						(agentsDataHadLoaded) ?
							this.props.agentsWorkDataStats.agents_list.map(function(item,index){
								if(index < ((self.props.agentsWorkCurrentPage-1)*self.itemsPerPage) || index >= (self.props.agentsWorkCurrentPage*self.itemsPerPage)){return;}
								let statusName = "לא מחובר";
								let dialerNumber = "----";
								switch(item.status_id){
									case constants.TM.AGENT.CALLING_STATUS.CALL : 
										statusName = "בשיחה";
										dialerNumber = item.dialer_id;
										break;
									case constants.TM.AGENT.CALLING_STATUS.WAITING : 
										statusName = "ממתין";
										dialerNumber = item.dialer_id;
										break;
									case constants.TM.AGENT.CALLING_STATUS.BREAK : 
										statusName = "בהפסקה";
										dialerNumber = item.dialer_id;
										break;
								}
								rowsCount++;
								return (<tr key={item.user_id}>
											<td>{item.first_name + ' ' + item.last_name}</td>
											<td>{item.total_activity_time ? getFormattedTimeFromSeconds(item.total_activity_time , false) : "---"}</td>
											<td>{item.total_waiting_time ? getFormattedTimeFromSeconds(item.total_waiting_time , false) : "---"}</td>
											<td>{item.total_break_time ? getFormattedTimeFromSeconds(item.total_break_time , false) : "---"}</td>
											<td>{item.total_regular_calls_time ? getFormattedTimeFromSeconds(item.total_regular_calls_time , false) : "---"}</td>
											<td>{item.total_action_calls_time ? getFormattedTimeFromSeconds(item.total_action_calls_time , false) : "---"}</td>
											<td>{item.total_calls_last_hour || "---"}</td>
											<td>{item.total_calls_last_hour || "---"}</td>
											<td>{item.quests_answered_last_hour || "---"}</td>
											<td>{(item.quests_answered_today_per_hour ? Math.round(item.quests_answered_today_per_hour*100)/100 : "---") }</td>
											<td>{(!item.quests_answered_today_per_hour || !item.quests_answered_last_hour || parseInt(item.quests_answered_last_hour)== 0 || parseInt(item.quests_answered_today_per_hour) == 0  ) ? "---" : Math.round((parseInt(item.quests_answered_last_hour)/parseInt(item.quests_answered_today_per_hour))*1000)/1000}</td>
											<td>{statusName}</td>
											<td>{dialerNumber}</td>
											<td>{(!item.personal_identity || (item.status_id != constants.TM.AGENT.CALLING_STATUS.CALL && item.status_id != constants.TM.AGENT.CALLING_STATUS.WAITING && item.status_id != constants.TM.AGENT.CALLING_STATUS.BREAK) ) ? "---" : item.personal_identity}</td>
											<td>{(!item.voter_name || (item.status_id != constants.TM.AGENT.CALLING_STATUS.CALL && item.status_id != constants.TM.AGENT.CALLING_STATUS.WAITING && item.status_id != constants.TM.AGENT.CALLING_STATUS.BREAK) ) ? "---" : item.voter_name}</td>
											<td>{(!item.phone_number || (item.status_id != constants.TM.AGENT.CALLING_STATUS.CALL && item.status_id != constants.TM.AGENT.CALLING_STATUS.WAITING && item.status_id != constants.TM.AGENT.CALLING_STATUS.BREAK) ) ? "---" : item.phone_number}</td>
											<td>{item.state_duration_seconds ? getFormattedTimeFromSeconds(item.state_duration_seconds,false) : "---"}</td>
											<td><a title="צפייה"   onClick={self.redirectToAgentCalls.bind(self , item.key)} className="arrow-circle cursor-pointer"></a></td>
										</tr>);
								
						})	
						:
							<tr><td colSpan="18" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים ...</td></tr>
					}
					{
						((rowsCount == 0 && agentsDataHadLoaded ) && <tr><td colSpan="18" style={{textAlign:'center', color:'red'}}> לא נמצאו נציגים </td></tr>)
					}
                    </tbody>
                </table>
            </div>
            {(rowsCount > 0  && agentsDataHadLoaded) && 
						<Pagination resultsCount={this.props.agentsWorkDataStats.total_count}
							displayItemsPerPage={this.itemsPerPage}
							currentPage={this.props.agentsWorkCurrentPage}
							navigateToPage={this.navigateToPage.bind(this)} />
			}
        </div>
			</div>
			</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        campaignsList: state.tm.campaign.list,
		agentsWorkDataStats: state.tm.campaign.agentsWorkDataStats,
		loadingMoreAgentsWorks: state.tm.campaign.loadingMoreAgentsWorks,
		agentsWorkCurrentPage: state.tm.campaign.agentsWorkCurrentPage,
		agentsWorkShowAllCampaigns: state.tm.campaign.agentsWorkShowAllCampaigns,
    };
}

export default connect(mapStateToProps)(withRouter(AgentsWork));