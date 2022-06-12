import React from 'react';
import { connect } from 'react-redux';
import * as campaignActions from 'tm/actions/campaignActions';
import Combo from 'components/global/Combo';
import SpeedgraphItem from './SpeedgraphItem';
import CallsLineGraph from './CallsLineGraph';
import {getCurrentArcArray , withCommas } from 'libs/globalFunctions';

class CallsStatsGraphs extends React.Component {
    constructor(props) {
        super(props);
		this.initConstants();
    }

	initConstants(){
		this.state={
			selectedQuestionaireStatus : {id:0 , name:'כל השיחות'},
			selectedQuestionaireStatusIndex : 0,
		}
		this.questionaireItems = [{id:0 , name:'כל השיחות'} , {id:1 , name:'שאלונים שנענו בלבד'}];
		this.blueArcColor = "#2D75D7";
		this.azureArcColor = "#45C5DB";
        this.yellowArcColor = "#DEAB23";
        this.pinkArcColor = "#CC3366";
        this.greyArcBG = "#eceeef";
		this.styles={
			blueFont : {fontSize:'19px' , fontWeight:'600' , color:"#2D75D7"},
			blueFontBig : {fontSize:'25px'  , color:"#2D75D7"},
			azureFont : {fontSize:'19px' , fontWeight:'600' , color:"#45C5DB"},
			azureFontBig : {fontSize:'25px'  , color:"#45C5DB"},
			yellowFont:{fontSize:'19px' , fontWeight:'600' , color:"#F9BF42"},
			yellowFontBig:{fontSize:'25px'  , color:"#F9BF42"},
			pinkFont:{fontSize:'19px' , fontWeight:'600' , color:"#CC3366"},
			pinkFontBig:{fontSize:'25px' ,  color:"#CC3366"},
		}
	}
	/*
		Handles changing in top left combo box - with answerd questions or all calls:
	*/
	changeFilterByQuestionaire(e){
		if(!e.target.selectedItem){return;}
		this.setState({selectedQuestionaireStatus:e.target.selectedItem});
	}
	/*
		On right top button click - change questionaire settings selection index:
	*/
	changeQuestionaireSelectedIndex(){
		this.setState({selectedQuestionaireStatusIndex:this.state.selectedQuestionaireStatus.id});
	}
	/*
		This function will prevent writing text in combo box - only select existing item:
	*/
	onKeyDown(event) {
		event.preventDefault();
	}
  
    render() {
		let spinnerComponent = <i className="fa fa-spinner fa-spin"></i>;
		  //console.log(this.props.callsPerformanceStats.todays_comparison_stats);
        return (
							<div className="row contentContainer contentContainer2">
								<div className="col-md-6 blue-title nopadding">שיחות לשעה</div>
									<div className="col-md-6  nopadding">
										<div className="left-panet-title">
											<label htmlFor="questions">הצג</label>
											<div style={{paddingLeft:'10px' , paddingRight:'10px'}}>
												<Combo items={this.questionaireItems} value={this.state.selectedQuestionaireStatus.name} 
														onChange={this.changeFilterByQuestionaire.bind(this)} itemIdProperty="id" 
														itemDisplayProperty='name'  onKeyDown={this.onKeyDown.bind(this)}
														 inputStyle={{height:'29px'}}
														/>
											</div>
											<div>
												<button title="הצג" type="button" className="btn btn-primary btn-xs" onClick={this.changeQuestionaireSelectedIndex.bind(this)}>הצג</button>
											</div>
										</div>
									</div>
									<div className="row">
										<div className="col-md-7">
											<div className="col-md-3">
											{(this.props.callsPerformanceStats.general_calls_stats ? 
														(this.props.callsPerformanceStats.general_calls_stats ? 
															<SpeedgraphItem arcColor={this.blueArcColor} regularFontStyle={this.styles.blueFont} 
																bigFontStyle={this.styles.blueFontBig} headerText={"15 דק'"} 
																numericValue={parseInt(this.props.callsPerformanceStats.general_calls_stats[this.state.selectedQuestionaireStatusIndex].per_15_minutes)}
																relativeTo={parseInt(this.props.callsPerformanceStats.general_calls_stats[this.state.selectedQuestionaireStatusIndex].per_campaign)} 
																avgRelativeTo={parseInt(this.props.callsPerformanceStats.average_calls_stats[this.state.selectedQuestionaireStatusIndex].per_15_minutes)}
																getCurrentArcArray={getCurrentArcArray.bind(this)} /> 
															: 
															<div style={{fontSize:'30px',color:this.blueArcColor , textAlign:'center'}}>-</div>)
															:
															<div style={{fontSize:'30px',color:this.blueArcColor , textAlign:'center'}}>{spinnerComponent}</div>
															)
											}
											</div>
											<div className="col-md-3">
											{this.props.callsPerformanceStats.general_calls_stats ? <SpeedgraphItem arcColor={this.azureArcColor} regularFontStyle={this.styles.azureFont} 
																bigFontStyle={this.styles.azureFontBig} headerText={"1 שעה"} 
																numericValue={parseInt(this.props.callsPerformanceStats.general_calls_stats[this.state.selectedQuestionaireStatusIndex].per_hour)}  
																relativeTo={parseInt(this.props.callsPerformanceStats.general_calls_stats[this.state.selectedQuestionaireStatusIndex].per_campaign)} 
																avgRelativeTo={parseInt(this.props.callsPerformanceStats.average_calls_stats[this.state.selectedQuestionaireStatusIndex].per_hour)}
																getCurrentArcArray={getCurrentArcArray.bind(this)} />: <div style={{fontSize:'30px',color:this.azureArcColor , textAlign:'center'}}>{spinnerComponent}</div>
											}
											</div>
											<div className="col-md-3">
											{this.props.callsPerformanceStats.general_calls_stats ? <SpeedgraphItem arcColor={this.yellowArcColor} regularFontStyle={this.styles.yellowFont} 
																bigFontStyle={this.styles.yellowFontBig} headerText={"היום"} 
																numericValue={parseInt(this.props.callsPerformanceStats.general_calls_stats[this.state.selectedQuestionaireStatusIndex].per_today)}  
																relativeTo={parseInt(this.props.callsPerformanceStats.general_calls_stats[this.state.selectedQuestionaireStatusIndex].per_campaign)}
																avgRelativeTo={parseInt(this.props.callsPerformanceStats.average_calls_stats[this.state.selectedQuestionaireStatusIndex].per_today)}
																getCurrentArcArray={getCurrentArcArray.bind(this)} />: <div style={{fontSize:'30px',color:this.yellowArcColor , textAlign:'center'}}>{spinnerComponent}</div>
											}
											</div>
											<div className="col-md-3"> 
											{this.props.callsPerformanceStats.general_calls_stats ? <SpeedgraphItem arcColor={this.pinkArcColor} regularFontStyle={this.styles.pinkFont} 
																bigFontStyle={this.styles.pinkFontBig} headerText={"מתחילת הקמפיין"} 
																numericValue={parseInt(this.props.callsPerformanceStats.general_calls_stats[this.state.selectedQuestionaireStatusIndex].per_campaign)} 
																getCurrentArcArray={getCurrentArcArray.bind(this)}
																relativeTo={2*parseInt(this.props.callsPerformanceStats.general_calls_stats[this.state.selectedQuestionaireStatusIndex].per_campaign)} 
																/>: <div style={{fontSize:'30px',color:this.pinkArcColor , textAlign:'center'}}>{spinnerComponent}</div>
											}
											</div>
										</div>
										<div className="col-md-5 text-left">
											<div style={{float:'left'}}>
												<div style={{width:'546px' , height:'121px' }}>
													{
													    (this.props.callsPerformanceStats.general_calls_stats ? 
															(
																(this.props.callsPerformanceStats.general_calls_stats && this.props.callsPerformanceStats.todays_comparison_stats && this.props.callsPerformanceStats.todays_comparison_stats[this.state.selectedQuestionaireStatusIndex] && this.props.callsPerformanceStats.todays_comparison_stats[this.state.selectedQuestionaireStatusIndex].todays_15mins_stats.length > 0  && this.state.selectedQuestionaireStatusIndex != -1) ? 
																		<CallsLineGraph inputData={this.props.callsPerformanceStats.todays_comparison_stats[this.state.selectedQuestionaireStatusIndex]} todays_start_time={this.props.callsPerformanceStats.todays_start_time} />
																 : 
																 <div style={{textAlign:'center' , paddingTop:'10px' , fontSize:'18px'}}>אין נתונים</div>
															) 
														:
															(<div style={{textAlign:'center' , paddingTop:'10px' , fontSize:'18px'}}>{spinnerComponent}</div>)
														)
													}
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
        campaignsList: state.tm.campaign.list,
		callsPerformanceStats: state.tm.campaign.callsPerformanceStats,
    };
}
export default connect(mapStateToProps)(CallsStatsGraphs);