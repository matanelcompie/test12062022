import React from 'react';
import { connect } from 'react-redux';
import * as campaignActions from 'tm/actions/campaignActions';
import ModalWindow from 'components/global/ModalWindow';
import Combo from 'components/global/Combo';
import ChangeCampaignView from '../ChangeCampaignView';
import CallsStatsGraphs from './CallsStatsGraphs';
import SubTableRowItem from './SubTableRowItem';
import MainTableRowItem from './MainTableRowItem';
import PercentsPie from './PercentsPie';
import constants from 'tm/constants/constants';
import {getFormattedTimeFromSeconds  , withCommas , getTmCallEndStatusName} from 'libs/globalFunctions';

class PerformanceTables extends React.Component {
    constructor(props) {
        super(props);
		this.initConstants();
    }

	initConstants(){
		this.modalTitle = "קושי שפה";
		this.state={
			selectedPortion : {id:0 , name:'כל המנות'},
			selectedBottomRowIndex :-1,
			callsStatsDataObject:null,
			showModalWindow:false ,
			languagesList:{},
			showPieChart:true,
			closeButton:[{
                    class: 'btn btn-primary',
                    text: 'סגור',
                    action: this.hideChooseCampaignModal.bind(this),
                    disabled: false
                }]
		}
	
		this.displayTypes = {allTime:0,allDay:1,lastHour:2};
		this.initTableStats();
		this.mainTableIndexesNames= {BEFORE_HANDLING : 0,SENT_TO_DIALER : 1,FINISHED_VOTERS : 2,COME_BACK_LATER : 3,OUT_OF_QUEUE : 4};
		this.finishedVotersHeader=(<thead>
										<tr style={{backgroundColor:'#ffffff' , color:'#49B3E6' , fontSize:'18px'}}>
											<th style={{border:'1px #E0E0E0 solid'}}>סיכומי שיחות</th>
											<th colSpan="2" style={{textAlign:'center' , border:'1px #E0E0E0 solid'}}>סה"כ</th>
											<th style={{border:'1px #E0E0E0 solid'}}>היום</th>
											<th style={{border:'1px #E0E0E0 solid'}}>שעה</th>
										</tr>
										<tr style={{fontSize:'16px' , lineHeight:'18px'}}>
											<th style={{border:'1px #E0E0E0 solid'}}></th>
											<th style={{border:'1px #E0E0E0 solid'}}>מס'<br/>תושבים</th>
											<th style={{border:'1px #E0E0E0 solid'}}>זמן <br/>טיפול</th>
											<th style={{border:'1px #E0E0E0 solid'}}></th>
											<th style={{border:'1px #E0E0E0 solid'}}></th>
										</tr>
									</thead>);
		this.generalSubVotersHeader = (<thead>
											<tr style={{backgroundColor:'#ffffff' , color:'#49B3E6' , fontSize:'18px'}}>
													<th style={{border:'1px #E0E0E0 solid'}}>סיכומי שיחות</th>
													<th  style={{textAlign:'center' , border:'1px #E0E0E0 solid'}}>סה"כ</th>
													<th style={{border:'1px #E0E0E0 solid'}}>היום</th>
													<th style={{border:'1px #E0E0E0 solid'}}>שעה</th>
											</tr>
										</thead>);
	}
	
	initTableStats(){
		this.outOfQueueItems = {}; this.comeBackItems = {}; this.processedFinishedItems = {};
		this.totalOutOfQueueStats = {countAll : null, countDay : null , countHour:null};
		this.totalComeBackStats = {countAll : null, countDay : null , countHour:null};
		this.totalFinishedStats = {countAll : null, countDay : null , countHour:null};
		this.answeredQuestionairsStats = {countAll : 0, countDay : 0 , countHour:0 , handleTime:0};
	}

	componentWillReceiveProps(nextProps){
		//if(!this.props.callsPerformanceStats.portions && nextProps.callsPerformanceStats.portions){
			this.fetchDataFromAllPortions(nextProps.callsPerformanceStats.portions);
			this.initDynamicVariables(nextProps.callsPerformanceStats.portions);
		//}
	}
	
	componentDidUpdate(prevProps, prevState){
		if(prevState.showPieChart !=  this.state.showPieChart){
			this.setState({showPieChart:true});
		}
		else if(prevState.selectedPortion.id !=  this.state.selectedPortion.id){
			this.setState({showPieChart:true});
		}
	}
	/*
		Handles hiding modal window of choosing other campaign :
	*/
	hideChooseCampaignModal(){
		this.setState({showModalWindow:false});
	}
	/*
		Handles changing  the selected portion in the middle of the screen:
	*/
	changePortion(e){
		if(!e.target.selectedItem){return;}
		this.setState({selectedPortion:e.target.selectedItem });
	}
	/*
		This function will prevent writing text in combo box - only select existing item:
	*/
	onKeyDown(event) {
		event.preventDefault();
	}
	/*
		Handles clicking on bottom row:
	*/
	callRowClick(rowIndex){
		this.setState({showPieChart:false});
		this.setState({selectedBottomRowIndex:rowIndex});
	}
	/*
		This function gets portions list and creates data stats from it , and saves it to state :
	*/
	fetchDataFromAllPortions(portionsList){
		this.totalLanguagesList={};
		this.todayLanguagesList={};
		this.lastHourLanguagesList={};
		let dataObject = {};
		dataObject.totalVotersCount = 0;
		dataObject.totalSentToDialer = 0;
		let processedVotersCount = 0;
		let outOfQueueVotersCount = 0;
		let callBackLaterVotersCount = 0;
		

		 if(portionsList){
			for(let i = 0 ; i < portionsList.length ; i++){
				if(portionsList[i].unique_voters_count){
					if(this.state.selectedPortion.id == 0){
						dataObject.totalVotersCount += parseInt(portionsList[i].unique_voters_count);
					}
					else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							 dataObject.totalVotersCount += parseInt(portionsList[i].unique_voters_count);
						}
					}
					
				}
				if(portionsList[i].sent_to_dialer_count){
					if(this.state.selectedPortion.id == 0){
						dataObject.totalSentToDialer += parseInt(portionsList[i].sent_to_dialer_count);
					}
					else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							 dataObject.totalSentToDialer += parseInt(portionsList[i].sent_to_dialer_count);
						}
					}
				}
			 
				
				if(this.state.selectedPortion.id == 0){
				//console.log(totalLanguagesList);
					for(let f = 0 ; f<portionsList[i].languagesTotal.length ; f++){
						let langItem = portionsList[i].languagesTotal[f];
						if(!this.totalLanguagesList[langItem.language_id]){
							this.totalLanguagesList[langItem.language_id] = {count_total:langItem.count_total , name:langItem.name};
						}
						else{
							this.totalLanguagesList[langItem.language_id].count_total += langItem.count_total;
						}
					}
					//console.log(totalLanguagesList);
				
					for(let f = 0 ; f<portionsList[i].languagesToday.length ; f++){
						let langItem = portionsList[i].languagesToday[f];
						if(!this.todayLanguagesList[langItem.language_id]){
							this.todayLanguagesList[langItem.language_id] = {count_total:langItem.count_total , name:langItem.name};
						}
						else{
							this.todayLanguagesList[langItem.language_id].count_total += langItem.count_total;
						}
					}
				
					for(let f = 0 ; f<portionsList[i].languagesLastHour.length ; f++){
						let langItem = portionsList[i].languagesLastHour[f];
						if(!this.lastHourLanguagesList[langItem.language_id]){
							this.lastHourLanguagesList[langItem.language_id] = {count_total:langItem.count_total ,name:langItem.name};
						}
						else{
							this.lastHourLanguagesList[langItem.language_id].count_total += langItem.count_total;
						}
					}
					processedVotersCount += parseInt(portionsList[i].FinishedCallsTotal.sum('count_total'));
					outOfQueueVotersCount += parseInt(portionsList[i].outOfQueueCallsTotal.sum('count_total'));
					callBackLaterVotersCount += parseInt(portionsList[i].callLaterCallsTotal.sum('count_total'));
				}
				else{
					if(this.state.selectedPortion.id == portionsList[i].id){
						    //console.log(totalLanguagesList);
						for(let f = 0 ; f<portionsList[i].languagesTotal.length ; f++){
							let langItem = portionsList[i].languagesTotal[f];
							if(!this.totalLanguagesList[langItem.language_id]){
								this.totalLanguagesList[langItem.language_id] = {count_total:langItem.count_total , name:langItem.name};
							}
							else{
								this.totalLanguagesList[langItem.language_id].count_total += langItem.count_total;
							}
						}
						//console.log(totalLanguagesList);
				
						for(let f = 0 ; f<portionsList[i].languagesToday.length ; f++){
							let langItem = portionsList[i].languagesToday[f];
							if(!this.todayLanguagesList[langItem.language_id]){
								this.todayLanguagesList[langItem.language_id] = {count_total:langItem.count_total , name:langItem.name};
							}
							else{
								this.todayLanguagesList[langItem.language_id].count_total += langItem.count_total;
							}
						}
				
						for(let f = 0 ; f<portionsList[i].languagesLastHour.length ; f++){
							let langItem = portionsList[i].languagesLastHour[f];
							if(!this.lastHourLanguagesList[langItem.language_id]){
								this.lastHourLanguagesList[langItem.language_id] = {count_total:langItem.count_total ,name:langItem.name};
							}
							else{
								this.lastHourLanguagesList[langItem.language_id].count_total += langItem.count_total;
							}
						}
						processedVotersCount += parseInt(portionsList[i].FinishedCallsTotal.sum('count_total'));
						outOfQueueVotersCount += parseInt(portionsList[i].outOfQueueCallsTotal.sum('count_total'));
						callBackLaterVotersCount += parseInt(portionsList[i].callLaterCallsTotal.sum('count_total'));
					}
				}
				
				
				 
			}
	 
		 }
		 
		
		dataObject.unprocessedVotersCount= dataObject.totalVotersCount - processedVotersCount-dataObject.totalSentToDialer-outOfQueueVotersCount-callBackLaterVotersCount;
		this.setState({callsStatsDataObject:dataObject});
	}
	
	/*
		Handles clicking on bottom right button after choosing portion
	*/
	showPortionsCallsStats(){
		
		this.setState({showPieChart:false});
		if(this.state.selectedPortion.id == 0 ){
			this.fetchDataFromAllPortions(this.props.callsPerformanceStats.portions);
		}else{
			let processedVotersCount = 0;
			let outOfQueueVotersCount = 0;
			let callBackLaterVotersCount = 0;
			let dataObject = {};
			dataObject.totalVotersCount = 0;
			dataObject.totalSentToDialer= 0;
			if(this.state.selectedPortion.unique_voters_count){
				dataObject.totalVotersCount = parseInt(this.state.selectedPortion.unique_voters_count);
			}

			if(this.state.selectedPortion.sent_to_dialer_count){
				dataObject.totalSentToDialer = parseInt(this.state.selectedPortion.sent_to_dialer_count);
			}
			
			processedVotersCount += this.state.selectedPortion.FinishedCallsTotal.sum('count_total');
			outOfQueueVotersCount += this.state.selectedPortion.outOfQueueCallsTotal.sum('count_total');
			callBackLaterVotersCount += this.state.selectedPortion.callLaterCallsTotal.sum('count_total');
			
			dataObject.unprocessedVotersCount= dataObject.totalVotersCount - processedVotersCount - outOfQueueVotersCount-callBackLaterVotersCount-dataObject.totalSentToDialer;
			this.setState({callsStatsDataObject:dataObject});
		}
		this.initDynamicVariables(this.props.callsPerformanceStats.portions);
	}
	
	initDynamicVariables(portionsList){
		
		
		let today= new Date();
		this.initTableStats();
		if(portionsList){
 
			for(let i = 0 ; i < portionsList.length ; i++){
				if(this.state.selectedPortion.id > 0  && this.state.selectedPortion.id !=  this.props.callsPerformanceStats.portions[i].id){continue;}
				//handle 'out of queue' array : 
				let tempOutOfQueueArray = portionsList[i].outOfQueueCallsTotal;
				for(let j = 0;j<tempOutOfQueueArray.length ; j++){
					if(!this.outOfQueueItems[tempOutOfQueueArray[j].call_end_status]){
						this.outOfQueueItems[tempOutOfQueueArray[j].call_end_status] = {call_end_status:tempOutOfQueueArray[j].call_end_status , name : getTmCallEndStatusName(tempOutOfQueueArray[j].call_end_status) , countAll : 0 , countDay : 0 , countHour:0};
					}
					this.outOfQueueItems[tempOutOfQueueArray[j].call_end_status].countAll += parseInt(tempOutOfQueueArray[j].count_total);
					 let totalSum = parseInt(tempOutOfQueueArray[j].count_total);
					 if(this.state.selectedPortion.id == 0){
						  if(this.totalOutOfQueueStats.countAll == null){
							 this.totalOutOfQueueStats.countAll = 0;
						  }
						  this.totalOutOfQueueStats.countAll += totalSum;
					 }
					 else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							 if(this.totalOutOfQueueStats.countAll == null){
								this.totalOutOfQueueStats.countAll = 0;
							 }
							 this.totalOutOfQueueStats.countAll += totalSum;
						}
					 }
			 
					
					 // console.log(tempOutOfQueueArray[j].count_total + "-" + this.totalOutOfQueueStats.countAll + "-" + totalSum);
					//console.log(tempOutOfQueueArray[j].count_total);
					//console.log(this.totalOutOfQueueStats);
					//console.log("-----");
				}
				  
				 
				tempOutOfQueueArray = portionsList[i].outOfQueueCallsToday;
				for(let j = 0;j<tempOutOfQueueArray.length ; j++){
					if(!this.outOfQueueItems[tempOutOfQueueArray[j].call_end_status]){
						this.outOfQueueItems[tempOutOfQueueArray[j].call_end_status] = {name : getTmCallEndStatusName(tempOutOfQueueArray[j].call_end_status) , countAll : 0 , countDay : 0 , countHour:0};
					}
					this.outOfQueueItems[tempOutOfQueueArray[j].call_end_status].countDay += parseInt(tempOutOfQueueArray[j].count_total);
					
					if(this.state.selectedPortion.id == 0){
						if(this.totalOutOfQueueStats.countDay == null){
							 this.totalOutOfQueueStats.countDay = 0;
						}
						this.totalOutOfQueueStats.countDay += parseInt(tempOutOfQueueArray[j].count_total);
					}
					else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							 if(this.totalOutOfQueueStats.countDay == null){
							     this.totalOutOfQueueStats.countDay = 0;
							 }
							 this.totalOutOfQueueStats.countDay += parseInt(tempOutOfQueueArray[j].count_total);
						}
					}
					
				}
				
				tempOutOfQueueArray = portionsList[i].outOfQueueCallsLastHour;
				for(let j = 0;j<tempOutOfQueueArray.length ; j++){
					if(!this.outOfQueueItems[tempOutOfQueueArray[j].call_end_status]){
						this.outOfQueueItems[tempOutOfQueueArray[j].call_end_status] = {name : getTmCallEndStatusName(tempOutOfQueueArray[j].call_end_status) , countAll : 0 , countDay : 0 , countHour:0};
					}
					this.outOfQueueItems[tempOutOfQueueArray[j].call_end_status].countHour += parseInt(tempOutOfQueueArray[j].count_total);
						
					if(this.state.selectedPortion.id == 0){
						if(this.totalOutOfQueueStats.countHour == null){
							  this.totalOutOfQueueStats.countHour = 0;
						}
						this.totalOutOfQueueStats.countHour += parseInt(tempOutOfQueueArray[j].count_total);
					}
					else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							 if(this.totalOutOfQueueStats.countHour == null){
							     this.totalOutOfQueueStats.countHour = 0;
							 }
							 this.totalOutOfQueueStats.countHour += parseInt(tempOutOfQueueArray[j].count_total);
						}
					}
					
				}
				
				//handle 'come back' array : 
				let tempComeBackArray = portionsList[i].callLaterCallsTotal;
				for(let j = 0;j<tempComeBackArray.length ; j++){
					if(!this.comeBackItems[tempComeBackArray[j].call_end_status]){
						this.comeBackItems[tempComeBackArray[j].call_end_status] = {id:tempComeBackArray[j].call_end_status , name : getTmCallEndStatusName(tempComeBackArray[j].call_end_status) , countAll : 0 , countDay : 0 , countHour:0};
					}
					this.comeBackItems[tempComeBackArray[j].call_end_status].countAll += parseInt(tempComeBackArray[j].count_total);
					if(this.state.selectedPortion.id == 0){
						if(this.totalComeBackStats.countAll == null){
							this.totalComeBackStats.countAll = 0;
						}
						this.totalComeBackStats.countAll += parseInt(tempComeBackArray[j].count_total);
					}
					else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							if(this.totalComeBackStats.countAll == null){
								this.totalComeBackStats.countAll = 0;
							}
							this.totalComeBackStats.countAll += parseInt(tempComeBackArray[j].count_total);
						}
					}
				}
				
				tempComeBackArray  = portionsList[i].callLaterCallsToday;
				for(let j = 0;j<tempComeBackArray.length ; j++){
					if(!this.comeBackItems[tempComeBackArray[j].call_end_status]){
						this.comeBackItems[tempComeBackArray[j].call_end_status] = {id:tempComeBackArray[j].call_end_status , name : getTmCallEndStatusName(tempComeBackArray[j].call_end_status) , countAll : 0 , countDay : 0 , countHour:0};
					}
					this.comeBackItems[tempComeBackArray[j].call_end_status].countDay += parseInt(tempComeBackArray[j].count_total);
					if(this.state.selectedPortion.id == 0){
						if(this.totalComeBackStats.countDay == null){
							this.totalComeBackStats.countDay = 0;
						}
						this.totalComeBackStats.countDay += parseInt(tempComeBackArray[j].count_total);
					}
					else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							if(this.totalComeBackStats.countDay == null){
								this.totalComeBackStats.countDay = 0;
							}
							this.totalComeBackStats.countDay += parseInt(tempComeBackArray[j].count_total);
						}
					}
					
					
				}
				tempComeBackArray  = portionsList[i].callLaterCallsLastHour;
				for(let j = 0;j<tempComeBackArray.length ; j++){
					if(!this.comeBackItems[tempComeBackArray[j].call_end_status]){
						this.comeBackItems[tempComeBackArray[j].call_end_status] = {id:tempComeBackArray[j].call_end_status , name : getTmCallEndStatusName(tempComeBackArray[j].call_end_status) , countAll : 0 , countDay : 0 , countHour:0};
					}
					this.comeBackItems[tempComeBackArray[j].call_end_status].countHour += parseInt(tempComeBackArray[j].count_total);
					if(this.state.selectedPortion.id == 0){
						if(this.totalComeBackStats.countHour == null){
							this.totalComeBackStats.countHour = 0;
						}
						this.totalComeBackStats.countHour += parseInt(tempComeBackArray[j].count_total);
					}
					else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							if(this.totalComeBackStats.countHour == null){
								this.totalComeBackStats.countHour = 0;
							}
							this.totalComeBackStats.countHour += parseInt(tempComeBackArray[j].count_total);
						}
					}
					
				}
 
				//handle 'processed finished items' array : 
				let tempFinishedItemsArray = portionsList[i].FinishedCallsTotal;
				for(let j = 0;j<tempFinishedItemsArray.length ; j++){
					if(!this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status]){
						 this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status] = { name : getTmCallEndStatusName(tempFinishedItemsArray[j].call_end_status) , handle_time_seconds : 0, countAll : 0 , countDay : 0 , countHour:0};
					}
					if(parseInt(tempFinishedItemsArray[j].handle_time_seconds) > 0){
						this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status].handle_time_seconds += parseInt(tempFinishedItemsArray[j].handle_time_seconds);
					}
					this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status].countAll +=  parseInt(tempFinishedItemsArray[j].count_total);
					
					if(this.state.selectedPortion.id == 0){
						if(this.totalFinishedStats.countAll == null){
							this.totalFinishedStats.countAll = 0;
						}
						this.totalFinishedStats.countAll  += parseInt(tempFinishedItemsArray[j].count_total);
					}
					else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							if(this.totalFinishedStats.countAll == null){
								this.totalFinishedStats.countAll = 0;
							}
							this.totalFinishedStats.countAll  += parseInt(tempFinishedItemsArray[j].count_total);
						}
					}
					
				}
				
				tempFinishedItemsArray = portionsList[i].FinishedCallsToday;
				for(let j = 0;j<tempFinishedItemsArray.length ; j++){
					if(!this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status]){
						 this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status] = { name : getTmCallEndStatusName(tempFinishedItemsArray[j].call_end_status) , handle_time_seconds : 0, countAll : 0 , countDay : 0 , countHour:0};
					}
					if(parseInt(tempFinishedItemsArray[j].handle_time_seconds) > 0){
						this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status].handle_time_seconds += parseInt(tempFinishedItemsArray[j].handle_time_seconds);
					}
					this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status].countDay +=  parseInt(tempFinishedItemsArray[j].count_total);
					
					if(this.state.selectedPortion.id == 0){
						if(this.totalFinishedStats.countDay == null){
							this.totalFinishedStats.countDay = 0;
						}
						this.totalFinishedStats.countDay  += parseInt(tempFinishedItemsArray[j].count_total);
					}
					else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							if(this.totalFinishedStats.countDay == null){
								this.totalFinishedStats.countDay = 0;
							}
							this.totalFinishedStats.countDay  += parseInt(tempFinishedItemsArray[j].count_total);
						}
					}
					
					
				}
				
				tempFinishedItemsArray = portionsList[i].FinishedCallsLastHour;
				for(let j = 0;j<tempFinishedItemsArray.length ; j++){
					if(!this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status]){
						 this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status] = { name : getTmCallEndStatusName(tempFinishedItemsArray[j].call_end_status) , handle_time_seconds : 0, countAll : 0 , countDay : 0 , countHour:0};
					}
					if(parseInt(tempFinishedItemsArray[j].handle_time_seconds) > 0){
						this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status].handle_time_seconds += parseInt(tempFinishedItemsArray[j].handle_time_seconds);
					}
					this.processedFinishedItems[tempFinishedItemsArray[j].call_end_status].countHour +=  parseInt(tempFinishedItemsArray[j].count_total);
					
					if(this.state.selectedPortion.id == 0){
						if(this.totalFinishedStats.countHour == null){
							this.totalFinishedStats.countHour = 0;
						}
						this.totalFinishedStats.countHour  += parseInt(tempFinishedItemsArray[j].count_total);
					}
					else{
						if(this.state.selectedPortion.id == portionsList[i].id){
							if(this.totalFinishedStats.countHour == null){
								this.totalFinishedStats.countHour = 0;
							}
							this.totalFinishedStats.countHour  += parseInt(tempFinishedItemsArray[j].count_total);
						}
					}
					
					
				}
		 
				this.answeredQuestionairsStats.countAll += parseInt(portionsList[i].answered_quests_calls_count_total_count);
				this.answeredQuestionairsStats.countDay += parseInt(portionsList[i].answeredQuestsCallsCountToday);
				this.answeredQuestionairsStats.countHour += parseInt(portionsList[i].answeredQuestsCallsCountHour);
			 
				if(portionsList[i].answeredQuestsCallsCountHandleTime){
					 
					this.answeredQuestionairsStats.handleTime += parseInt(portionsList[i].answeredQuestsCallsCountHandleTime);
				 }
			}
		}
		 
	}
	/*
		Show languages difficulty modal window : 
	*/
	showLanguagesPopup(typeIndex , languagesList)
	{
		this.setState({showModalWindow:true , languagesList});
		 
	}
	
	getPercentText(){
		let selectedBottomRowIndex = this.state.selectedBottomRowIndex ;
		let totalVotersCount = this.state.callsStatsDataObject.totalVotersCount ;
		if(!totalVotersCount){
			return 0;
		}
		let divider = 0;
		switch(selectedBottomRowIndex){
			case 0:
				divider = parseInt(this.state.callsStatsDataObject.unprocessedVotersCount );
				break;
			case 1:
				divider = parseInt(this.state.callsStatsDataObject.totalSentToDialer );
				break;
			case 2:
				if(this.totalFinishedStats.countAll == null){
					this.totalFinishedStats.countAll = 0;
				}
				divider = parseInt(this.totalFinishedStats.countAll );
				break;
			case 3:
				if(this.totalComeBackStats.countAll == null){
					this.totalComeBackStats.countAll = 0;
				}
				divider = parseInt(this.totalComeBackStats.countAll );
				break;
			case 4:
				if(this.totalOutOfQueueStats.countAll == null){
					this.totalOutOfQueueStats.countAll = 0;
				}
				divider = parseInt(this.totalOutOfQueueStats.countAll );
				break;
			default:
				return 0;
				break;
		}
		if(divider == 0){
			return 0;
		}
		let percent =  (divider*100)/totalVotersCount;
		percent = Math.round(percent * 100)/100;
		return percent;
	}
	
	getNumericTableResult(objName){
		if(this.state.callsStatsDataObject ){
			if(this.state.callsStatsDataObject[objName]){
				return this.state.callsStatsDataObject[objName];
			}
			else{
				if(this.state.callsStatsDataObject[objName] == 0){
					return "0";
				}
				else{
					return null;
				}
			}
		}
		else{
			return null;
		}
	}
	
    render() {
		let self = this;
	 
		let baseURL = window.Laravel.baseURL;
		//console.log(this.comeBackItems);
		let loaderItem = <i className="fa fa-spinner fa-spin"></i>;
        return (<div>
					<div className="row campain-first-ontainer padding-top10">
						<div className="blue-title nopadding pull-right">מדדי חיוג</div>
						<div className="devider-vertical"></div>
						<div className="left-panet-title pull-right">
							<label htmlFor="select-portion">בחר מנה</label>
							<div style={{paddingLeft:'10px' , paddingRight:'10px'}}>
								<Combo items={this.props.callsPerformanceStats.portions?([{id:0 , name:'כל המנות'},...this.props.callsPerformanceStats.portions]) : []} value={this.state.selectedPortion.name} 
										onChange={this.changePortion.bind(this)} itemIdProperty="id" 
										itemDisplayProperty='name'  onKeyDown={this.onKeyDown.bind(this)}
										 inputStyle={{height:'29px'}}/>
							</div>
							<div className="pull-right"><button title="הצג" type="button" className="btn btn-primary btn-xs" disabled={!this.state.callsStatsDataObject} onClick={this.showPortionsCallsStats.bind(this)}>הצג</button></div>
						</div>
					</div>
					<div className="row nomargin">
						<div className="contentContainer col-md-8 boxes-campain campain-bottom-box">
							<div className="col-md-4 text-center margin-top60 nopadding">
								<div  style={{float:'left' , paddingLeft:'55px'}}>
									<div style={{width:'169px' , height:'169px' , backgroundImage:'url("'+baseURL + "Images/circle-graph1.png"+'")'}}>
										{( this.props.callsPerformanceStats.campaign_name && this.props.callsPerformanceStats.portions && this.state.callsStatsDataObject && this.totalFinishedStats && this.totalComeBackStats && this.totalOutOfQueueStats && this.state.showPieChart) ? 
											<PercentsPie
											selectedRowIndex={this.state.selectedBottomRowIndex}
											data={[
												{ label: '0', value: this.state.callsStatsDataObject.unprocessedVotersCount },
												{ label: '1', value: this.state.callsStatsDataObject.totalSentToDialer },
												{ label: '2', value: this.totalFinishedStats.countAll },
												{ label: '3', value: this.totalComeBackStats.countAll },
												{ label: '4', value: this.totalOutOfQueueStats.countAll },
												{ label: '5', value:0  },
												]}
											percentText={this.getPercentText()}
											width='169'
											height='169'
											donut={true}
										/>:
										<div style={{textAlign:'center',fontSize:'30px'}}>{loaderItem}</div>
										}
									</div>
								</div>
							</div>
							<div className="col-md-8 nopadding">
								<table className="table-status-campain">
									<thead>
										<tr>
											<th className="gray-title20">תושבים בקמפיין</th>
											<th>{this.state.callsStatsDataObject ? withCommas(this.state.callsStatsDataObject.totalVotersCount):"-"}</th>
											<th>היום</th>
											<th>1 ש' אחרונה</th>
										</tr>
									</thead>
									<tbody>
										<MainTableRowItem id={this.mainTableIndexesNames.BEFORE_HANDLING} headerText="לפני טיפול" imageClassName="line-blue"  totalCount={this.getNumericTableResult('unprocessedVotersCount')}  callRowClick={this.callRowClick.bind(this)}   className={(this.state.selectedBottomRowIndex == this.mainTableIndexesNames.BEFORE_HANDLING ?"selected-line-campain ":"")}  />
										<MainTableRowItem id={this.mainTableIndexesNames.SENT_TO_DIALER} headerText="נשלחו לחייגן"  imageClassName="line-purple"   totalCount={this.getNumericTableResult('totalSentToDialer')}  callRowClick={this.callRowClick.bind(this)}   className={(this.state.selectedBottomRowIndex == this.mainTableIndexesNames.SENT_TO_DIALER ?"selected-line-campain ":"")}  />
										<MainTableRowItem id={this.mainTableIndexesNames.FINISHED_VOTERS} headerText="תושבים שטופלו"  imageClassName="line-yellow" totalCount={this.totalFinishedStats.countAll} dailyCount={this.totalFinishedStats.countDay} hourlyCount={this.totalFinishedStats.countHour}   callRowClick={this.callRowClick.bind(this)}  className={(this.state.selectedBottomRowIndex == this.mainTableIndexesNames.FINISHED_VOTERS ?"selected-line-campain ":"")} />
										<MainTableRowItem id={this.mainTableIndexesNames.COME_BACK_LATER} headerText="תושבים לחיוג חוזר"  imageClassName="line-turkiz" totalCount={this.totalComeBackStats.countAll}  dailyCount={this.totalComeBackStats.countDay} hourlyCount={this.totalComeBackStats.countHour}   callRowClick={this.callRowClick.bind(this)}  className={(this.state.selectedBottomRowIndex == this.mainTableIndexesNames.COME_BACK_LATER ?"selected-line-campain ":"")} />					
										<MainTableRowItem id={this.mainTableIndexesNames.OUT_OF_QUEUE} headerText="תושבים שיצאו מהתור"  imageClassName="line-red" totalCount={this.totalOutOfQueueStats.countAll} dailyCount={this.totalOutOfQueueStats.countDay}  hourlyCount={this.totalOutOfQueueStats.countHour}   callRowClick={this.callRowClick.bind(this)}  className={(this.state.selectedBottomRowIndex == this.mainTableIndexesNames.OUT_OF_QUEUE ?"selected-line-campain ":"")}  />	
									</tbody>
								</table>
							</div>
						</div>
						{this.state.selectedBottomRowIndex >= this.mainTableIndexesNames.FINISHED_VOTERS &&
						<div className="contentContainer col-md-4 boxes-campain">
							{(this.state.selectedBottomRowIndex == this.mainTableIndexesNames.FINISHED_VOTERS  &&	
							<table className="table-status-campain" style={{border:'1px #E0E0E0 solid'}}>
								{this.finishedVotersHeader}
								<tbody>
									<SubTableRowItem id="answered" headerText="מענה לשאלון" itemsArray={[withCommas(this.answeredQuestionairsStats.countAll),getFormattedTimeFromSeconds(this.answeredQuestionairsStats.handleTime , true,true),withCommas(this.answeredQuestionairsStats.countDay),withCommas(this.answeredQuestionairsStats.countHour)]} />
									{$.map(this.processedFinishedItems, function(value, index) {return [value];}).map(
										function(item , index){
											return (<SubTableRowItem id={"finishedProcessed"+index} key={"finishedProcessed"+index} headerText={item.name} itemsArray={[withCommas(item.countAll) , getFormattedTimeFromSeconds(item.handle_time_seconds,true , true) ,item.countDay,item.countHour]}  />);
										}
									)}
								</tbody>
							</table>
							)}
							{(this.state.selectedBottomRowIndex == this.mainTableIndexesNames.COME_BACK_LATER  &&	
							<table className="table-status-campain" style={{border:'1px #E0E0E0 solid'}}>
								{this.generalSubVotersHeader}
								<tbody>
									{$.map(this.comeBackItems, function(value, index) {return [value];}).map(
										function(item , index){
											return (<SubTableRowItem id={"comeBackRow"+index} key={"comeBackRow"+index} headerText={item.name} itemsArray={[withCommas(item.countAll),withCommas(item.countDay),withCommas(item.countHour)]}  />);
										}
									)}
								</tbody>
							</table>
							)}
							{(this.state.selectedBottomRowIndex == this.mainTableIndexesNames.OUT_OF_QUEUE  &&	
							<table className="table-status-campain" style={{border:'1px #E0E0E0 solid'}}>
								{this.generalSubVotersHeader}
								<tbody>
									{$.map(this.outOfQueueItems, function(value, index) {return [value];}).map(
										function(item , index){
											let showDetailsFunction = null;
											
											 
											showDetailsFunction = self.showLanguagesPopup.bind(self);
			
											return (<SubTableRowItem id={"outOfQueueRow"+index} key={"outOfQueueRow"+index} headerText={item.name} itemsArray={[withCommas(item.countAll),withCommas(item.countDay),withCommas(item.countHour)]} showDetailsFunction={showDetailsFunction} totalLanguagesList={self.totalLanguagesList} todayLanguagesList={self.todayLanguagesList} lastHourLanguagesList={self.lastHourLanguagesList} isLanguageRow={item.call_end_status == constants.TM.AGENT.CALL_END_STATUS.LANGUAGE} />);
										}
									 )}
								</tbody>
							</table>
							)}
						</div>
						}
					</div>
					{this.state.showModalWindow && 
					<ModalWindow show={this.state.showModalWindow} title={this.modalTitle} buttonX={this.hideChooseCampaignModal.bind(this)} buttons={this.state.closeButton} >
						<div>
							<table className="table-status-campain">
								<thead>
									<tr  style={{backgroundColor:'#ffffff' , color:'#49B3E6' , fontSize:'14px'}}> 
										<th>שפה</th>
										<th>סה"כ</th>
									</tr>
								</thead>
								<tbody>
									{Object.keys(this.state.languagesList).map(function(key,index){
											let item = self.state.languagesList[key];
											return (<tr key={"languages" + index} style={{fontSize:'14px'}}>
															<td>{item.name}</td>
															<td>{item.count_total}</td>
														</tr>);
									})}
								</tbody>
							</table>
						 </div>
					</ModalWindow>
					}
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
export default connect(mapStateToProps)(PerformanceTables);