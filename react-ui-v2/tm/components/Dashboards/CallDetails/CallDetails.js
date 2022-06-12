import React from 'react';
import { connect } from 'react-redux';
import * as campaignActions from 'tm/actions/campaignActions';
import ModalWindow from 'tm/components/common/ModalWindow';
import Combo from 'components/global/Combo';
import Gauge from 'components/global/D3/Gague/Gauge';
import ChangeCampaignView from '../ChangeCampaignView';
import constants from 'tm/constants/constants';
import {withRouter } from 'react-router';
import {arraySort,getCurrentArcArray,getFormattedTimeFromSeconds , getTmCallEndStatusName ,validatePhoneNumber} from 'libs/globalFunctions';


class CallDetails extends React.Component {
    constructor(props) {
        super(props);
		this.state={
			selectedAgentsOption:{id:1 , name:'כל הנציגים'} ,
			 
		};
		this.initConstants();
    }
	
	componentWillMount(){
		campaignActions.getDashboardCallDetails(this.props.dispatch , this.props.router.params.key , this.props.router.params.agentKey,  this.props.router.params.callKey , campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , 'callDetailsStats' );	
	}
	
	componentWillUnmount(){
		//UPDATE_GLOBAL_FIELD_VALUE
		//callDetailsStats
		this.props.dispatch({type: campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , fieldName:'callDetailsStats' , fieldValue:{}});
	 
	}
	
	
	/*
		Init constant variables : 
	*/
    initConstants() {
		this.agentsOptions = [
			{id:1 , name:'כל הנציגים'},
			{id:2 , name:'נציגים פעילים בלבד'},
		]
	}
	
	/*
		This function will prevent writing text in combo box - only select existing item
	*/
	onKeyDown(event) {
		event.preventDefault();
	}
	
	/*
		Handles changes in combo of agents types filtering
	*/
	changeSelectedAgentsType(e){
		this.setState({selectedAgentsOption:e.target.selectedItem});
	}
	
	/*
		Handles clicking on 'go back' button : 
	*/
	comeBackToAgentsCalls(){
		this.props.router.push('telemarketing/dashboards/' + this.props.router.params.key + '/agent_calls/'+this.props.router.params.agentKey);
	}

	renderAudioRecording() {
	 
		if (this.props.callDetailsStats.calls_data.audio_file_name) {
			return (
				<audio controls style={{height: "32px"}}>
  						<source src={ window.Laravel.baseURL + this.props.callDetailsStats.calls_data.audio_file_name} type="audio/wav"/>
					</audio>
			);
		} else {
			return ;
		}
	}
	
    render() {
		let self=this;
		let baseURL = window.Laravel.baseURL;
        return (
				<div>
					<div className="row pageHeading1" >
						<div className="pull-right col-md-6 text-right " style={{paddingRight:'0'}}><h1>פירוט שיחה</h1></div>
						<div className="link-box col-md-6 pull-left text-left " >
							<button type="submit" className="btn btn-primary btn-sm" onClick={this.comeBackToAgentsCalls.bind(this)}>חזור לרשימת שיחות</button>
						</div>
					</div>
					{this.props.callDetailsStats.calls_data ? 
					<div>
						<div style={{marginTop:'20px'}}></div>
						<div className="dtlsBox call-details-box margin-top20">
							<div className="row">
								<div className="col-md-12 blue-title">פרטי השיחה והתושב</div>
							</div>
							<div className="row">
								<div className="col-md-3 nopadding">
									<div className="col-md-6 font-600">ת.ז. תושב</div>
									<div className="col-md-6">{this.props.callDetailsStats.calls_data.personal_identity}</div>
									<div className="col-md-6 font-600">שם התושב</div>
									<div className="col-md-6">{this.props.callDetailsStats.calls_data.first_name + ' ' + this.props.callDetailsStats.calls_data.last_name }</div>
									<div className="col-md-6 font-600">מס' טלפון</div>
									<div className="col-md-6">{validatePhoneNumber(this.props.callDetailsStats.calls_data.phone_number)?this.props.callDetailsStats.calls_data.phone_number:"-"} </div>
									<div className="col-md-6 font-600">שלוחה</div>
									<div className="col-md-6">{this.props.callDetailsStats.calls_data.dialer_user_id || "-"}</div>
									<div className="col-md-6 font-600">שם הנציג</div>
									<div className="col-md-6">{this.props.callDetailsStats.calls_data.agent_first_name + ' ' + this.props.callDetailsStats.calls_data.agent_last_name}</div>
								</div>
								<div className="col-md-3 nopadding">
									<div className="col-md-6 font-600">מועד שיחה</div>
									<div className="col-md-6">{this.props.callDetailsStats.calls_data.created_at.split(' ')[1].substr(0,5) + ' ' + this.props.callDetailsStats.calls_data.created_at.split(' ')[0].split("-").reverse().join("/")} </div>
									<div className="col-md-6 font-600">סיבת סיום השיחה:</div>
									<div className="col-md-6">{getTmCallEndStatusName(this.props.callDetailsStats.calls_data.call_end_status)}</div>
										{this.props.callDetailsStats.calls_data.call_me_later=='1' &&
											<div>
												<div className="col-md-6 font-600">חזור אלי ביום/שעה:</div>
												<div className="col-md-6">
													{(this.props.callDetailsStats.calls_data.call_me_later_time?
														( this.props.callDetailsStats.calls_data.call_me_later_time.split(' ')[0].split("-").reverse().join("/") + " / " + this.props.callDetailsStats.calls_data.call_me_later_time.split(' ')[1].substr(0,5))
														:
														"כן"
													)}
												</div>
												{this.props.callDetailsStats.calls_data.language_name &&<div>
													<div className="col-md-6 font-600">חזור אלי בשפה:</div>
													<div className="col-md-6">{this.props.callDetailsStats.calls_data.language_name }</div>
												</div>}
											</div>
										}
								</div>
								<div className="col-md-3 pull-left">
									<div className="call-status"><span className="font-600">סטטוס תמיכה:</span><span className="margin-right10"> {this.props.callDetailsStats.calls_data.support_status_name || "ללא"}</span></div>
									<div className="audio-erea">
										<span className="font-600">משך שיחה:</span>
										<span className="margin-right15">{getFormattedTimeFromSeconds(Math.abs(this.props.callDetailsStats.calls_data.call_duration_seconds ), false)} </span>
										{this.renderAudioRecording()}
									</div>
								</div>
							</div>
						</div>
						<div style={{marginTop:'20px'}}></div>
						<div className="dtlsBox call-details-box margin-top20">
							<div className="row">
								<div className="col-md-12 blue-title">פרטי השיחה והתושב</div>
							</div>
							<div className="row">
								<div className="col-md-12">
									<div className="call-details-box-in">
										<div className="col-md-6 details-box-title">שם שדה / שאלה</div>
										<div className="col-md-6 details-box-title">תשובה</div>
										{
											this.props.callDetailsStats.calls_data.questions.map(function(item,index){
												return (<div className="details-call-line" key={index}>
															<div className="col-md-6 details-box-text font-600">{index+1}. {item.text_general}</div>
															<div className="col-md-6 details-box-text">{item.answer_text || "-"}</div>
														</div>)
											})
										}
										{
											(this.props.callDetailsStats.calls_data.questions.length == 0 && 
														<div className="details-call-line">
															<div className="col-md-12 details-box-text font-600 text-center">אין שאלות</div>
														</div>)
										}
									</div>
									<div className="details-call-remark">הערה : {this.props.callDetailsStats.calls_data.note || "-"} </div>
								</div>
							</div>
						</div>
						<div style={{marginTop:'20px'}}></div>
						<div className="dtlsBox call-details-box margin-top20 margin-bottom30">
							<div className="row">
								<div className="col-md-12 blue-title">עדכון פרטים</div>
							</div>
							<div className="row">
								<div className="col-md-12">
									<div className="call-details-box-in">
										<div className="col-md-5 details-box-title">שם שדה </div>
										<div className="col-md-5 details-box-title">ערך ישן</div>
										<div className="col-md-2 details-box-title">ערך חדש</div>
										{
											this.props.callDetailsStats.call_history_details.map(function(item , index){
												return (<div className="details-call-line2" key={"history"+index}>
															<div className="col-md-5 details-box-text font-600">{item.name}</div>
															<div className="col-md-5 details-box-text">{item.oldValue}</div>
															<div className="col-md-2 details-box-text">{item.newValue}</div>
														</div>)
											})
										}
										{(this.props.callDetailsStats && this.props.callDetailsStats.call_history_details && this.props.callDetailsStats.call_history_details.length == 0) && 
														(
														<div className="details-call-line2" style={{textAlign:'center'}}>
															<div className="col-md-12 details-box-text">אין נתונים</div>
														</div>
														)
										}
										
							</div>
						</div>
					</div>
                </div>
				<div style={{marginTop:'30px'}}></div>
			</div>
			: 
			<div style={{textAlign:'center' , fontSize:'27px'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים ...</div>}		
		</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        campaignsList: state.tm.campaign.list,
		callDetailsStats: state.tm.campaign.callDetailsStats,
    };
}

export default connect(mapStateToProps)(withRouter(CallDetails));