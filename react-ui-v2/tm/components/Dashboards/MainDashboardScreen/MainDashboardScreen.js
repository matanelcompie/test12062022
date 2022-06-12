import React from 'react';
import { connect } from 'react-redux';

import Combo from 'components/global/Combo';
import {withRouter } from 'react-router';
import ChangeCampaignView from '../ChangeCampaignView';
import CallingAnsweringGraph from './CallingAnsweringGraph';
import ProcessedVotersGraph from './ProcessedVotersGraph';
import {withCommas , getFormattedPercentage} from 'libs/globalFunctions';

class MainDashboardScreen extends React.Component {
    constructor(props) {
        super(props);
		this.state={
			selectedFilteredHour:{id:1}
		}
		this.possibleHours = [
			{id:1},
			{id:2},
			{id:3},
			{id:4},
			{id:5},
			{id:6},
			{id:7},
			{id:8},
			{id:9},
			{id:10},
		];
    }

	
	/*
		Function that transfers to subscreen by its name
	*/
	goToSubscreen(subScreenName){
		this.props.router.push('telemarketing/dashboards/' + this.props.router.params.key + '/' + subScreenName);
	}
	/*
		Display formatting number or 0 or loading if number is undefined
	*/
	getFormattedNumber(number){
		if(number == '0'){return 0}
		else{
			if(number){return withCommas(number)}
			else{
				return <i className="fa fa-spinner fa-spin"></i>;
			}
		}
	}
	
	/*
		Handles change in combo
	*/
	changeSelectedHour(e){
		this.setState({selectedFilteredHour:{id:e.target.selectedItem.id}});
	}
	
	initDynamicVariables(){
		
		this.timeLeftInHours = "--";
		this.timeLeftInMinutes = "--";
	    let totalVotersLeft = parseInt(this.props.basicCampaignStats.total_voters_count) - parseInt(this.props.basicCampaignStats.processed_voters_count);
		if(totalVotersLeft < 0){totalVotersLeft = 0}
		
		 
		if(this.props.basicCampaignStats.active_time_seconds || this.props.basicCampaignStats.active_time_seconds == '0'){
			this.totalCampaignHours = Math.floor(parseInt(this.props.basicCampaignStats.active_time_seconds)/3600);
			this.totalCampaignMinutes =   Math.floor((parseInt(this.props.basicCampaignStats.active_time_seconds) - (this.totalCampaignHours*3600))/60);
			if(this.totalCampaignMinutes < 10){
				this.totalCampaignMinutes = "0"+this.totalCampaignMinutes;
			}
		}
		
		this.actionTimeAverageTimeMinutes = "--" ;
		this.actionTimeAverageTimeSeconds = "--" ;
		if(this.props.basicCampaignStats.average_action_calls_time || this.props.basicCampaignStats.average_action_calls_time == '0'){
			this.actionTimeAverageTimeMinutes = Math.floor(parseInt(this.props.basicCampaignStats.average_action_calls_time)/60);
			this.actionTimeAverageTimeSeconds =   Math.floor((parseInt(this.props.basicCampaignStats.average_action_calls_time) - (this.actionTimeAverageTimeMinutes*60)));
			if(this.actionTimeAverageTimeMinutes < 10){
				this.actionTimeAverageTimeMinutes = "0"+this.actionTimeAverageTimeMinutes;
			}
			if(this.actionTimeAverageTimeSeconds < 10){
				this.actionTimeAverageTimeSeconds = "0"+this.actionTimeAverageTimeSeconds;
			}
		 
			if(this.props.basicCampaignStats.online_agents_count && parseInt(this.props.basicCampaignStats.online_agents_count) > 0){
				let totalTimeLeftForVoters = (totalVotersLeft*parseInt(this.props.basicCampaignStats.average_action_calls_time))/parseInt(this.props.basicCampaignStats.online_agents_count);
				this.timeLeftInHours = Math.floor(totalTimeLeftForVoters/(3600));
				this.timeLeftInMinutes = Math.floor((totalTimeLeftForVoters - this.timeLeftInHours*(3600))/60);
			}
			if(this.timeLeftInHours < 10){
				this.timeLeftInHours = "0"+this.timeLeftInHours;
			}
			if(this.timeLeftInMinutes < 10){
				this.timeLeftInMinutes = "0"+this.timeLeftInMinutes;
			}
		}
		
		this.regularTimeAverageTimeMinutes = "--" ;
		this.regularTimeAverageTimeSeconds = "--" ;
		if(this.props.basicCampaignStats.average_regular_calls_time || this.props.basicCampaignStats.average_regular_calls_time == '0'){
			this.regularTimeAverageTimeMinutes = Math.floor(parseInt(this.props.basicCampaignStats.average_regular_calls_time)/60);
			this.regularTimeAverageTimeSeconds =   Math.floor((parseInt(this.props.basicCampaignStats.average_regular_calls_time) - (this.regularTimeAverageTimeMinutes*60)));
			if(this.regularTimeAverageTimeMinutes < 10){
				this.regularTimeAverageTimeMinutes = "0"+this.regularTimeAverageTimeMinutes;
			}
			if(this.regularTimeAverageTimeSeconds < 10){
				this.regularTimeAverageTimeSeconds = "0"+this.regularTimeAverageTimeSeconds;
			}
		}
		
		this.maxNumberOfVoters = 0;
		this.numberOfLegendLines = 8;
		if(this.props.basicCampaignStats.portions_list && this.props.basicCampaignStats.portions_list.length){
			for(let i = 0 ; i < this.props.basicCampaignStats.portions_list.length ; i++){
				if(this.props.basicCampaignStats.portions_list[i].unique_voters_count > this.maxNumberOfVoters){
					this.maxNumberOfVoters = this.props.basicCampaignStats.portions_list[i].unique_voters_count;
				}
			}
		}
	}
	
	/*
		This function will prevent writing text in combo box - only select existing item
	*/
	onKeyDown(event) {
		event.preventDefault();
	}
	
	/*
		Return number of calls of selected hour
	*/
	getSelectedHourCallStats(statsArray){
		if(!statsArray || !statsArray.length){
			return "-";
		}
		for(let i = 0 ; i < statsArray.length ; i++){
			if(statsArray[i].timeDF == this.state.selectedFilteredHour.id){
				return statsArray[i].callsCount;
				break;
			}
		}
		return "-";
	}
	 
	
    render() {
		let self = this;
		let baseURL = window.Laravel.baseURL;
		this.initDynamicVariables();
 
        return (
			<div className="stripMain campain-management">
				<div className="tm-first-box-on-page">
					<ChangeCampaignView name={this.props.basicCampaignStats.campaign_name}  />
					<div className="row contentContainer campain-sum-numbers">
						<div className="col-xs-5ths nopadding">
							<h3>{this.getFormattedNumber(this.props.basicCampaignStats.total_voters_count)}</h3>
							<p>תושבים בקמפיין </p>
						</div>
						<div className="col-xs-5ths">
							<h3>{this.getFormattedNumber(this.props.basicCampaignStats.processed_voters_count)}</h3>
							<p>תושבים שטופלו</p>
						</div>
						<div className="col-xs-5ths">
							<h3>{this.getFormattedNumber(this.props.basicCampaignStats.total_calls_count)}</h3>
							<p>נסיונות חיוג</p>
						</div>
						<div className="col-xs-5ths">
							<h3>{getFormattedPercentage(this.props.basicCampaignStats.answered_calls_count,this.props.basicCampaignStats.total_calls_count)}%</h3>
							<p>אחוז מענה לשיחה</p>
						</div>
						<div className="col-xs-5ths">
							<h3>{getFormattedPercentage(this.props.basicCampaignStats.answered_calls_answered_questionary_count,this.props.basicCampaignStats.answered_calls_count)}%</h3>
							<p>אחוז מענה לשאלון</p>
						</div>
					</div>
					<div className="row nomargin">
						<div className="contentContainer col-md-9 boxes-campain">
							<div className="col-md-5 nopadding">
								<div className="blue-title">שיחות לשעה</div>
									<div>
										<span className="number45 pull-right blue">{this.getFormattedNumber(this.props.basicCampaignStats.calls_quarter_hour) || "-"}</span>
										<span className="text-per-hour pull-right">15 דק' אחרונות</span>
									</div>
									<div className="clearboth">
										<span className="number45 pull-right turkiz">{this.getSelectedHourCallStats(this.props.basicCampaignStats.calls_hours_distributions)}</span>
										<span className="text-per-hour pull-right"> 
											<span className="pull-right nopadding select-hours">
												<Combo itemIdProperty="id" itemDisplayProperty='id'  items={this.possibleHours} onKeyDown={this.onKeyDown.bind(this)} onChange={this.changeSelectedHour.bind(this)} value={this.state.selectedFilteredHour.id} inputStyle={{width:'70px'}}/>
											</span>
											מענה לשיחות
										</span>
									</div>
									<div className="clearboth">
										<span className="number45 pull-right bordo">{this.props.basicCampaignStats.whole_campaign_calls_per_hour || "-"}</span>
										<span className="text-per-hour pull-right">כללי לקמפיין</span>
									</div>
								</div>
								<div className="col-md-7 answers-erea">
									<div className="blue-title">מענה לשיחות</div>
									<div style={{width:'383px',height:'164px'}}> 
										<div className="row">
											<div className="col-md-4">
											{
												(this.props.basicCampaignStats.answered_calls_answered_questionary_count || this.props.basicCampaignStats.answered_calls_answered_questionary_count == '0' )?
													<CallingAnsweringGraph totalCallsResponded={this.props.basicCampaignStats.answered_calls_count} totalQuestsAnswers={this.props.basicCampaignStats.answered_calls_answered_questionary_count} />: <i className="fa fa-spinner fa-spin" style={{fontSize:'35px'}}></i>
											}
											</div>
											<div className="col-md-8" style={{fontSize:'18px' , marginTop:'100px'}}>
												<div className="row">
													<div className="col-md-5"  style={{marginRight:'35px' }}>
														<div style={{width:'30px' , height:'8px' , background:'#4FA3F6' , padding:'0px', borderRadius:'20px'}}></div>
													</div>
													<div className="col-md-5"   >
														<div style={{width:'30px' , height:'8px' , background:'#45C5DB' , padding:'0px', borderRadius:'20px'}}></div>
													</div>
												</div>
												<div className="row">
														<div className="col-md-5" style={{marginRight:'35px'}}>
															{withCommas(this.props.basicCampaignStats.answered_calls_count) || "-"}
															<br/>
															נענו
														</div>
														<div className="col-md-5" >
															{withCommas(this.props.basicCampaignStats.answered_calls_answered_questionary_count) || "-"}
															<br/>
															ענו לשאלון
														</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="contentContainer col-md-3 boxes-campain">
								<div className="blue-title">סיום משוער עד</div>
								<div className="estimate-erea">
									<div className="timer-numbers pull-right">
										<div className="time-unit pull-right">
											<div>{this.timeLeftInMinutes}</div>
											<div className="time-unit-name">דקות</div>
										</div>
										<div className="time-unit-devider pull-right">:</div>
										<div className="time-unit pull-right">
											<div>{withCommas(this.timeLeftInHours)}</div>
											<div className="time-unit-name">שעות</div>
										</div>
									</div>
								</div>
							</div>

							<div className="contentContainer col-md-3 boxes-campain margin-top10">
								<div className="blue-title">משך קמפיין בפועל</div>
								<div className="estimate-erea">
									<div className="timer-numbers pull-right">
										<div className="time-unit pull-right">
											<div>{this.totalCampaignMinutes}</div>
											<div className="time-unit-name">דקות</div>
										</div>
										<div className="time-unit-devider pull-right">:</div>
										<div className="time-unit pull-right">
											<div>{this.totalCampaignHours}</div>
											<div className="time-unit-name">שעות</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="row campain-first-ontainer margin-top5">
							<div className="col-md-3 nopadding border-gray-left text-center">
								<span className="title18 turkiz">זמן טיפול ממוצע</span>
								<span className="padding-30-R">{this.actionTimeAverageTimeMinutes}:{this.actionTimeAverageTimeSeconds}</span>
							</div>
							<div className="col-md-3 nopadding border-gray-left text-center">
								<span className="title18 purple">זמן שיחה ממוצע</span>
								<span className="padding-30-R">{this.regularTimeAverageTimeMinutes}:{this.regularTimeAverageTimeSeconds}</span>
							</div>
							<div className="col-md-3 nopadding text-center">
								<span className="title18 light-blue">ממוצע שיחות לנציג / שעה</span>
								<span className="padding-30-R">{this.props.basicCampaignStats.average_agent_calls || "-"}</span>
							</div>
							<div className="col-md-3 nopadding text-left"  >
								<button type="submit" className="btn btn-primary btn-sm btn-95" onClick={this.goToSubscreen.bind(this , 'calls_performance')}>עבור לבקרת ביצועי חיוג</button>
							</div>
						</div>
						<div className="row nomargin">
							<div className="contentContainer col-md-9 boxes-campain campain-bottom-box">
								<div className="col-md-4 nopadding">
									<div className="blue-title">תושבים בקמפיין</div>
									<div style={{ width:'248px' , height:'294px'}} >
										<div className="row">
											<div className="col-md-8">
												{
												(this.props.basicCampaignStats.total_voters_count || this.props.basicCampaignStats.total_voters_count == '0' )?
													<ProcessedVotersGraph totalVotersCount={this.props.basicCampaignStats.total_voters_count} intervalsCount={8} processedVotersCount={this.props.basicCampaignStats.processed_voters_count} />: <i className="fa fa-spinner fa-spin" style={{fontSize:'35px'}}></i>
												}
											</div>
											<div className="col-md-4">
												<div style={{marginRight:'-10px' , lineHeight:'25px'}}>
													<span style={{fontWeight:'600' , fontSize:'18px'}}>
													סה"כ:
													</span>
													<br/>
													<span style={{fontSize:'30px'}}>{this.getFormattedNumber(this.props.basicCampaignStats.total_voters_count)}</span>
													</div>
													<br/><br/><br/><br/><br/>
													
													<div style={{lineHeight:'15px' , marginRight:'-10px' , marginTop:'6px'}}>
														<div style={{paddingTop:'6px'  , marginRight:'-7px'}}>
															<div style={{width:'27px' , height:'8px' , background:'#EAECEF' , padding:'0px', borderRadius:'20px'}}></div>
														</div>
														<div style={{fontSize:'18px' ,paddingTop:'3px' }}>
															{(this.props.basicCampaignStats.processed_voters_count || this.props.basicCampaignStats.processed_voters_count == '0')?this.getFormattedNumber(parseInt(this.props.basicCampaignStats.total_voters_count) - parseInt(this.props.basicCampaignStats.processed_voters_count)) : "-"}
														</div>
														<span style={{fontSize:'18px' }}>
														נותרו
														</span>
														
														<br/><br/>
														<div style={{paddingTop:'10px'  , marginRight:'-7px'}}>
															<div style={{width:'27px' , height:'8px' , background:'#CC3366' , padding:'0px', borderRadius:'20px'}}></div>
														</div>
														<div style={{fontSize:'18px' ,paddingTop:'3px' }}>
															{this.getFormattedNumber(this.props.basicCampaignStats.processed_voters_count)}
														</div>
														<span style={{fontSize:'18px'  }}>
														טופלו
														</span>
													</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-8 portions-erea">
									<div className="blue-title">טיפול במנות</div>
									<div className="nopadding pull-left">
										 
									</div>
									<div>
										<div style={{width:'549px' , height:'296px' , backgroundImage:'url("'+baseURL + "Images/portions-graph1.png"+'")' , overflow:'auto'}}>
											<div style={{marginTop:'10px' , marginRight:'10px' , fontSize:'16px' , color:'#000000'}}>
												{this.props.basicCampaignStats.portions_list && this.props.basicCampaignStats.portions_list.map(function(item , index){
 
													return(
													<div key={index} style={{lineHeight:'15px'}}>
													{item.name}
													<br/>
													<div style={{marginTop:'6px' , zIndex:700 , position:'relative'}}>
														<div className="progress" style={{height:'10px', zIndex:710 , width:((parseInt(item.unique_voters_count) == 0 ? 100 : ((parseInt(item.unique_voters_count)*100)/self.maxNumberOfVoters)) + '%')}}>
															<div className="progress-bar" role="progressbar" style={{width: (((parseInt(item.processed_count)*100)/parseInt(item.unique_voters_count))+"%") , backgroundColor:'#CC3366'}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
														</div>
													</div>
												 
												</div>)
												})
												}
											</div>
										</div>
										<div >
										{self.maxNumberOfVoters > 0 ? <table style={{width:'549px'}}><tbody><tr>
												<td style={{width:"11%"}}>0</td>
												{(Array.from(Array(this.numberOfLegendLines).keys())).map(function(item,index){
													return (<td key={"row" + index} style={{width:"11%" , textAlign:'right'}}>
														<div style={{borderRight:'1px solid #EAECEF' , zIndex:0 , position:'absolute' , top:'53px' , height:'270px'}}></div>
														{
															Math.round((self.maxNumberOfVoters/self.numberOfLegendLines)*(index+1))
														}
													</td>)
												})}
												</tr>
												</tbody>
										</table> : <div style={{position:'relative' , top:'-200px' , textAlign:'center'}}>אין נתונים</div>}
										</div>
									</div>
								</div>
						</div>
						<div className="contentContainer col-md-3 boxes-campain">
							<div className="blue-title">נציגים בקמפיין </div>
								<div className="row">
									<div className="col-md-3 numbers40">{this.props.basicCampaignStats.total_agents_count || "-"}</div>
									<div className="col-md-9 representors-left">משובצים</div>
								</div>
								<div className="row">
									<div className="col-md-3 numbers40">{this.props.basicCampaignStats.online_agents_count || "-"}</div>
									<div className="col-md-9 representors-left">מחוברים</div>
								</div>
								<div className="row">
									<div className="col-md-3 numbers40">{this.props.basicCampaignStats.active_calls_count || "-"}</div>
									<div className="col-md-9 representors-left">בשיחה פעילה</div>
								</div>
								<div className="row">
									<div className="col-md-3 numbers40">{this.props.basicCampaignStats.waiting_agents_count || "-"}</div>
									<div className="col-md-9 representors-left">ממתינים</div>
								</div>
								<div className="row">
									<div className="col-md-3 numbers40">{this.props.basicCampaignStats.on_break_agents_count || "-"}</div>
									<div className="col-md-9 representors-left representors-left-last">בהפסקה</div>
								</div>
								<div className="row">
									<button type="submit" className="btn btn-primary btn-sm btn-100" onClick={this.goToSubscreen.bind(this , 'agents_performance')}>עבור למסך נציגים</button>
								</div>
							</div>
						</div>
					</div>
				</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        basicCampaignStats: state.tm.campaign.basicCampaignStats,
		campaignsList: state.tm.campaign.list,
    };
}

export default connect(mapStateToProps)(withRouter(MainDashboardScreen));