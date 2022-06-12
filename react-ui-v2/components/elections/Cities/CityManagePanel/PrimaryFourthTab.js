import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';

import * as ElectionsActions from '../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../actions/SystemActions';
import ModalWindow from '../../../global/ModalWindow';
import Combo from '../../../global/Combo';
import {thousandsSeparatesForNumber} from 'libs/globalFunctions';

class PrimaryFourthTab extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
    }
	
	/*
	function that initializes constant variables 
	*/
    initConstants() {
          this.styles = {};
          this.styles.topHeaderSquareStyle = {backgroundColor:'#E5EEF4' , height:'40px' , paddingTop:'8px' , paddingRight:'8px' };
		  this.styles.topHeaderFontStyle={color:'#336699' , fontSize:'16px' , fontWeight:'bold'};
	      this.styles.topHeaderSquareContentBlueStyle={backgroundColor:'#F0F5F9' , height:'40px', paddingTop:'8px' , paddingRight:'8px' };
          this.styles.transparentBorderStyle={borderTopColor:'transparent'}; 
          this.styles.topHeaderNegativeSquareStyle = {backgroundColor:'#FAE5E5' , height:'40px' , paddingTop:'8px' , paddingRight:'8px'};
          this.styles.topHeaderNegativeFontStyle={color:'#CF0D7D' , fontSize:'16px' , fontWeight:'bold'};

         this.outerOnGoingBudgetHeader = <tr>
                                            <th></th>
                                            <th></th>
                                            <th>תקציב שוטף</th>
                                            <th>סכום שהוקצב</th>
                                            <th>סכום שנוצל</th>
                                            <th>יתרה לניצול</th>
                                        </tr>;
         this.innerOnGoingBudgetHeader=<tr>
                                            <th></th>
                                            <th>תאריך</th>
                                            <th>מס' הזמנה</th>
                                            <th>שם ספק</th>
                                            <th>סכום</th>
                                            <th>פרטים</th>
                                       </tr>;
   }

    /*
       Set specific row to opened closed
       @param isOpened
    */
    setCurrentRowOpened( rowIndex , isOpened){
          this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.SET_BUDGET_ROW_OPENED , rowIndex , isOpened });
    }
    
    /*
       Set all budgets of same type(0 or 1) to opened or closed(true/false)
       @param budgetType
       @param isOpened
    */
    setIsAllExpendedByType(budgetType , isOpened){
            this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.SET_BUDGET_ROWS_OF_SAME_TYPE_OPENED, budgetType , isOpened });

    }
	 
    /*
        set activist budget detailed row for editing-true/false
        @param budgetOuterRowIndex
        @param budgetInnerRowIndex
        @param isEditing
    */
    setActivistBudgetSubRowEditing(budgetOuterRowIndex , budgetInnerRowIndex , isEditing){
           if(isEditing){
                 this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'elections.cities.budget.expected_activists.edit'});
                 let self = this;
                 this.setState({oldBudgetActivistCount:self.props.cityBudgets[budgetOuterRowIndex]['budget_expected_expenses'][budgetInnerRowIndex]['activist_count']});
                 this.setState({oldBudgetActivistSalary:self.props.cityBudgets[budgetOuterRowIndex]['budget_expected_expenses'][budgetInnerRowIndex]['activist_salary']});
           }
           else{
                 this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'elections.cities.budget.expected_activists.edit'});
                 this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.ACTIVIST_BUDGET_ROW_ITEM_VALUE_CHANGE, budgetOuterRowIndex , budgetInnerRowIndex , fieldName:'activist_count' , fieldValue:this.state.oldBudgetActivistCount });
                 this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.ACTIVIST_BUDGET_ROW_ITEM_VALUE_CHANGE, budgetOuterRowIndex , budgetInnerRowIndex , fieldName:'activist_salary' , fieldValue:this.state.oldBudgetActivistSalary});

           }
           this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.SET_ACTIVIST_BUDGET_INNER_ROW_EDITING, budgetOuterRowIndex , budgetInnerRowIndex , isEditing });
    }

    /*
        Change activist budget detailed row item value - activist count or salary
        @param fieldName
        @param budgetOuterRowIndex
        @param budgetInnerRowIndex
    */
    activistBudgetFieldChange(fieldName , budgetOuterRowIndex , budgetInnerRowIndex , e){
          if(!new RegExp('^[0-9]*$').test(e.target.value)){return;} // allow only numbers in the field
          this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.ACTIVIST_BUDGET_ROW_ITEM_VALUE_CHANGE, budgetOuterRowIndex , budgetInnerRowIndex , fieldName , fieldValue:e.target.value });
    }

    /*
        Do real save to database of activist salary and count via api
        @param budgetOuterRowIndex
        @param budgetInnerRowIndex
    */
    saveActivistBudgetData(budgetOuterRowIndex , budgetInnerRowIndex){
           let dataRow =  this.props.cityBudgets[budgetOuterRowIndex]['budget_expected_expenses'][budgetInnerRowIndex];
           let dataRowKey ;
		   let dataRequest = {};
		   if(this.props.cityBudgets[budgetOuterRowIndex].id == -1){
			   dataRowKey = -1;
			   dataRequest.system_name = this.props.cityBudgets[budgetOuterRowIndex].system_name;
			   dataRequest.name = this.props.cityBudgets[budgetOuterRowIndex].name;
		   }
		   else{
			   dataRowKey = dataRow['key'];
		   }

           
           dataRequest.activist_count = dataRow['activist_count'];
           dataRequest.activist_salary = dataRow['activist_salary'];
		   
           if(this.oldBudgetActivistCount == dataRow['activist_count'] && this.oldBudgetActivistSalary == dataRow['activist_salary'])
           {
              //data is identical - don't send data to api and set editing row to false
              this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.SET_ACTIVIST_BUDGET_INNER_ROW_EDITING, budgetOuterRowIndex , budgetInnerRowIndex , isEditing:false });
           }
           else{
               ElectionsActions.saveActivistBudgetRowData(this.props.dispatch , this.props.router.params.cityKey , this.props.selectedCampaign.selectedItem.key , dataRowKey , dataRequest , budgetOuterRowIndex , budgetInnerRowIndex); 
               this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'elections.cities.budget.expected_activists.edit'});
           }
    }

    /*
        Function that shows/hides modal window that displays activists budget expected expenses histoy
        hide = budgetOuterRowIndex and budgetInnerRowIndex are both equal to -1 , otherwise show.

        @param budgetOuterRowIndex
        @param budgetInnerRowIndex  
    */
    setShowModalOfActionsHistory(budgetOuterRowIndex , budgetInnerRowIndex ){
          this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.SHOW_ACTIONS_HISTORY_MODAL_WINDOW, budgetOuterRowIndex , budgetInnerRowIndex });
    }
    /**
     * method numberDisplayFormat
     */
    numberDisplayFormat(number) {
        let numberStyle = {};
        if (number < 0) {
            numberStyle = { color: 'red' };
        }
        let fixedNumber = thousandsSeparatesForNumber(number);
        return <b style={numberStyle}>{fixedNumber}</b>;
    }

	/*
	function that sets dynamic items in render() function : 
	*/
    initDynamicVariables() {
	    this.headerItem = '';
        this.headerBottomItem = '';
        this.firstBudgetItem = '';
        this.secondBudgetItem = '';

        this.modalItem = null;
        if(this.props.actionHistoryOuterIndex !=-1 && this.props.actionHistoryInnerIndex != -1){
              let historyRowsItem = null;
              if(this.props.cityBudgets[this.props.actionHistoryOuterIndex]['budget_expected_expenses'][this.props.actionHistoryInnerIndex]['action_history'].length == 0){
                   historyRowsItem= "לא קיימת היסטוריית עדכונים";

              }
              else{
                   
                   let historyTableRows = this.props.cityBudgets[this.props.actionHistoryOuterIndex]['budget_expected_expenses'][this.props.actionHistoryInnerIndex]['action_history'].map(function(item , index){
                              return  <tr key={index}>
                                    <td>{item.created_at.split(' ')[0].split('-').reverse().join('/')}</td>
                                    <td>{item.created_at.split(' ')[1]}</td>
                                    <td>{item.display_field_name}</td>
                                    <td>{item.old_value}</td>
                                    <td>{item.new_value}</td>
                                    <td>{item.first_name + ' '+item.last_name}</td>
                                </tr>
                   });
                   historyRowsItem = <table className="table table table-striped  table-scrollable" >
                            <thead>
                                <tr>
                                    <th>תאריך</th>
                                    <th>שעה</th>
                                    <th>שם שדה</th>
                                    <th>ערך ישן</th>
                                    <th>ערך חדש</th>
                                    <th>משתמש מבצע</th>
                                </tr>
                            </thead>
                            <tbody style={{height:'200px'}}>
                                {historyTableRows}
                            </tbody>
                        </table>;
 
              }
              this.modalItem = <ModalWindow show={true} buttonOk={this.setShowModalOfActionsHistory.bind(this,-1,-1)}     buttonX={this.setShowModalOfActionsHistory.bind(this,-1,-1)} title={"היסטוריית עדכונים"}>
                                                                <div>{historyRowsItem}</div>
                                                            </ModalWindow>
        }
        if(this.props.selectedCampaign.selectedItem){
             let currentActivityBudgetValue = 0;
             let activistsHiringBudgetValue = 0;
             let totalOnGoingBudgetRealExpenses = 0;
             let totalActivingBudgetRealExpenses = 0;
             let outerOnGoingBudgetRows = [];
             let outerActivistBudgetRows = [];               
             let onGoingBudgetCounter = 0;
             let activistBudgetCounter = 0;

             if(this.props.cityBudgets.length > 0){
                let activistBudgetRowsEditCount = 0; 
					for(let i = 0; i < this.props.cityBudgets.length ; i++){   
						if(this.props.cityBudgets[i].budget_type == 1){
							for(let j =0;j<this.props.cityBudgets[i].budget_expected_expenses.length;j++){
								if(this.props.cityBudgets[i].budget_expected_expenses[j].editing == true){
									activistBudgetRowsEditCount ++;
                                    break;
                                }
							}
						}
					}
                    for(let i = 0; i < this.props.cityBudgets.length ; i++){
						if(this.props.cityBudgets[i].budget_type == 0){
							let innerOnGoingBudgetRows = [];
                            let innerOnGoingBudgetCounter = 0;
                            let innerExpensesValue = 0;
                              
                            for(let j =0;j<this.props.cityBudgets[i].ongoing_activity_expenses.length;j++){
								let ongoing_activity_expensesActivist=this.props.cityBudgets[i].ongoing_activity_expenses[j];
                                innerOnGoingBudgetCounter ++;
                                totalOnGoingBudgetRealExpenses += ongoing_activity_expensesActivist.amount;
                                innerExpensesValue += ongoing_activity_expensesActivist.amount;
                                if(this.props.cityBudgets[i].opened == true){
									innerOnGoingBudgetRows.push(
                                        <tr key={"onGoingBudget" + i + "innerRow" + j}>
                                            <td>{innerOnGoingBudgetCounter}</td>
                                            <td>{ongoing_activity_expensesActivist.date.split('-').reverse().join('/')}</td>
                                            <td>{this.numberDisplayFormat(ongoing_activity_expensesActivist.order_number)}</td>
                                            <td>{ongoing_activity_expensesActivist.provider_name}</td>
                                            <td>{this.numberDisplayFormat(ongoing_activity_expensesActivist.amount)}</td>
                                            <td>{ongoing_activity_expensesActivist.description}</td>
                                        </tr>);
                                }
                             }
                             onGoingBudgetCounter++;
                             currentActivityBudgetValue += this.props.cityBudgets[i].amount;
                             outerOnGoingBudgetRows.push(<tr key={"onGoingBudget"+i}>
															<td style={{paddingRight:'17px'}}>
																<a style={{cursor:'pointer'}} onClick={this.setCurrentRowOpened.bind(this , i, (this.props.cityBudgets[i].opened==true?false:true) )}>
																	<img src={window.Laravel.baseAppURL + 'Images/collapse-circle-'+(this.props.cityBudgets[i].opened==true?'open':'close')+'.svg'}  />
																</a>
															</td>
															<td><span className="num-item">{onGoingBudgetCounter}</span>.</td>
															<td>{this.props.cityBudgets[i].name}</td>
															<td>{this.numberDisplayFormat(this.props.cityBudgets[i].amount)}</td>
															<td>{this.numberDisplayFormat(innerExpensesValue)}</td>
															<td style={{direction:'ltr' , textAlign:'right'}}>{this.numberDisplayFormat(this.props.cityBudgets[i].amount - innerExpensesValue )}</td>
														</tr>);
                             if(this.props.cityBudgets[i].opened == true){
								outerOnGoingBudgetRows.push(<tr  key={"onGoingBudgetDetails"+i}>
																<td colSpan="6">
																	<table className="table table-striped tableNoMarginB tableTight table-scroll">
																		<thead>
																			{this.innerOnGoingBudgetHeader}
																		</thead>
																		<tbody>
																			{innerOnGoingBudgetRows}
																		</tbody>
																	</table>
																</td>
															</tr>);
                             }
                         }
                         else if(this.props.cityBudgets[i].budget_type == 1){
							 activistsHiringBudgetValue += this.props.cityBudgets[i].amount;
                             activistBudgetCounter++;
                             let rowRealExpensed  = 0;
                             let activistsCount = 0;
                             for( let k = 0 ; k<this.props.electionsRoleData.length ; k++){  
								 if(this.props.electionsRoleData[k].role_name.trim() == this.props.cityBudgets[i].election_roles_name.trim()){   
                                     totalActivingBudgetRealExpenses += parseInt(this.props.electionsRoleData[k].total_sum);
                                     rowRealExpensed += parseInt(this.props.electionsRoleData[k].total_sum);
                                     activistsCount=this.props.electionsRoleData[k].voters_count;
                                     break;
                                 }
                             }
                             outerActivistBudgetRows.push(
                                 <tr key={"activistBudgetRow" + i}>
                                     <td style={{ paddingRight: '17px' }}>
                                         <a style={{ cursor: 'pointer' }} onClick={this.setCurrentRowOpened.bind(this, i, (this.props.cityBudgets[i].opened == true ? false : true))}>
                                             <img src={window.Laravel.baseAppURL + 'Images/collapse-circle-' + (this.props.cityBudgets[i].opened == true ? 'open' : 'close') + '.svg'} />
                                         </a>
                                     </td>
                                     <td><span className="num-item">{activistBudgetCounter}</span>.</td>
                                     <td>{this.props.cityBudgets[i].name}</td>
                                     <td>{this.numberDisplayFormat(this.props.cityBudgets[i].amount)}</td>
                                     <td>{this.numberDisplayFormat(rowRealExpensed)}</td>
                                     <td className="negative-balance">{this.numberDisplayFormat(this.props.cityBudgets[i].amount - rowRealExpensed)}</td>
                                 </tr>);
                             let innerActivistBudgetRows = [];
                             for (let j = 0; j < this.props.cityBudgets[i].budget_expected_expenses.length; j++) {
								
                                 let budget_expected_expensesActivist = this.props.cityBudgets[i].budget_expected_expenses[j];
                                 if(this.props.cityBudgets[i].opened == true){
                                     if(budget_expected_expensesActivist.editing == true){
										innerActivistBudgetRows.push(
																		<tr key={"ActivistBudget" + i + "innerRow" + j + 'editing'}>
																			<td>1</td>
																			<td>{this.props.cityBudgets[i].election_roles_name}</td>
																			<td width="5%">
																				<input type="text" className="form-control" value={budget_expected_expensesActivist.activist_count} onChange={this.activistBudgetFieldChange.bind(this, 'activist_count', i, j)} style={{ borderColor: (budget_expected_expensesActivist.activist_count == '' ? '#ff0000' : '#ccc') }} />
																			</td>
																			<td width='20%'>
																				<div className="row">
																					<div className="col-sm-6">
																						<input type="text" className="form-control" value={budget_expected_expensesActivist.activist_salary} onChange={this.activistBudgetFieldChange.bind(this, 'activist_salary', i, j)} style={{ borderColor: (budget_expected_expensesActivist.activist_salary == '' ? '#ff0000' : '#ccc') }} />
																					</div>
																					<div className="col-md-3 text-left">
																						<button title="שמור" type="submit" className="btn btn-primary" disabled={budget_expected_expensesActivist.activist_count == '' || budget_expected_expensesActivist.activist_salary == ''} onClick={this.saveActivistBudgetData.bind(this, i, j)}>שמור</button>
																					</div>
																					<div className="col-md-3 text-left">
																						<button title="בטל" type="submit" className="btn btn-primary" style={{ borderColor: '#498BB6', backgroundColor: '#ffffff', color: '#498BB6' }} onClick={this.setActivistBudgetSubRowEditing.bind(this, i, j, false)}>בטל</button>
																					</div>
																				</div>
																			</td>
																			<td style={{ paddingRight: '20px' }}>{this.props.cityBudgets[i].id != -1 && <a title="היסטורית עידכונים" style={{ cursor: 'pointer' }} onClick={this.setShowModalOfActionsHistory.bind(this, i, j)}>היסטורית עידכונים</a>}</td>
																			<td>{this.numberDisplayFormat(budget_expected_expensesActivist.recomended_salary) }</td>
																			<td>{this.numberDisplayFormat(budget_expected_expensesActivist.activist_count * budget_expected_expensesActivist.activist_salary)}</td>
																			<td>{this.numberDisplayFormat(budget_expected_expensesActivist.activist_count * budget_expected_expensesActivist.activist_salary * 1.25)}</td>
																			<td>{this.numberDisplayFormat(activistsCount)}</td>
																			<td>{this.numberDisplayFormat(rowRealExpensed)}</td>
																		</tr>);
                                     }
									 else{
										 let setEditingItem = null;
                                         if(this.props.currentUser.admin == true ||   this.props.currentUser.permissions['elections.cities.budget.expected_activists.edit'] == true){
											 if(activistBudgetRowsEditCount==0){
                                                setEditingItem=<a title="ערוך" style={{cursor:'pointer'}} onClick={this.setActivistBudgetSubRowEditing.bind(this , i , j , true )}>
                                                                  <span className="glyphicon glyphicon-pencil"></span>ערוך
                                                               </a>;
										}
                                     }
                                     innerActivistBudgetRows.push(
                                         <tr key={"ActivistBudget" + i + "innerRow" + j}>
                                             <td>1</td>
                                             <td>{this.props.cityBudgets[i].election_roles_name}</td>
                                             <td className="td-input"><span>{this.numberDisplayFormat(budget_expected_expensesActivist.activist_count)}</span></td>
                                             <td width='13%'>
                                                 <span className="item-space" style={{ marginLeft: '25px' }}>{this.numberDisplayFormat(budget_expected_expensesActivist.activist_salary)}</span>
                                                 {setEditingItem}
                                             </td>
                                             <td>{this.props.cityBudgets[i].id != -1 && <a style={{ cursor: 'pointer' }} onClick={this.setShowModalOfActionsHistory.bind(this, i, j)}>היסטורית עידכונים</a>}</td>
                                             <td>{this.numberDisplayFormat(budget_expected_expensesActivist.recomended_salary)}</td>
                                             <td>{this.numberDisplayFormat(budget_expected_expensesActivist.activist_count * budget_expected_expensesActivist.activist_salary)}</td>
                                             <td>{this.numberDisplayFormat(budget_expected_expensesActivist.activist_count * budget_expected_expensesActivist.activist_salary * 1.25)}</td>
                                             <td>{this.numberDisplayFormat(activistsCount)}</td>
                                             <td>{this.numberDisplayFormat(rowRealExpensed)}</td>
                                         </tr>);
                                 } 
                             }
                         }
                         if(this.props.cityBudgets[i].opened == true){
                             outerActivistBudgetRows.push(<tr key={"ActivistBudgetInnerRows"+i}>
                                 <td colSpan="6">
                                     <table className="table table-striped tableNoMarginB tableTight table-scroll">
                                         <thead>
                                             <tr>
                                                 <th></th>
                                                 <th>תפקיד</th>
                                                 <th className="td-input">כמות</th>
                                                 <th className="td-input-complex">שכר נטו</th>
                                                 <td></td>
												 <th>שכר מומלץ</th>
                                                 <th>סכום נטו</th>
                                                 <th>סכום ברוטו</th>
                                                 <th>כמות שובצו</th>
                                                 <th>סכום שובצו</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             {innerActivistBudgetRows}
                                         </tbody>
                                     </table>
                                 </td>
                             </tr>)
                         }
                     }
                   }
               }
               this.headerItem = <div className="row">
                   <div className="col-md-6">
                       <div className="containerStrip tabContnt" style={{...this.styles.transparentBorderStyle , paddingTop:'8px' , paddingBottom:'8px' , paddingRight:'8px' , paddingLeft:'8px'} }>
                           <div className="row">
                               <div className="col-sm-6" style={{paddingLeft:'8px'}} >
                                   <div style={this.styles.topHeaderSquareStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>סכום שהוקצב לפעילות שוטפת</span>
                                   </div>
                               </div>
                               <div className="col-sm-6" style={{paddingRight:'0px'}}>
                                   <div style={this.styles.topHeaderSquareContentBlueStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>{this.numberDisplayFormat(currentActivityBudgetValue)}</span>
                                   </div>
                               </div>
                           </div>
                           <div className="row" style={{paddingTop:'7px'}}>
                               <div className="col-sm-6" style={{paddingLeft:'8px'}}  >
                                   <div style={this.styles.topHeaderSquareStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>סכום שהוקצב לגיוס פעילים</span>
                                   </div>
                               </div>
                               <div className="col-sm-6"  style={{paddingRight:'0px'}}>
                                   <div style={this.styles.topHeaderSquareContentBlueStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>{this.numberDisplayFormat(activistsHiringBudgetValue)}</span>
                                   </div>
                               </div>
                           </div>
                           <div className="row" style={{paddingTop:'7px'}}>
                               <div className="col-sm-6" style={{paddingLeft:'8px'}}>
                                   <div style={this.styles.topHeaderSquareStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>ס"ה תקציב לעיר</span>
                                   </div>
                               </div>
                               <div className="col-sm-6" style={{paddingRight:'0px'}}>
                                   <div style={this.styles.topHeaderSquareContentBlueStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>{this.numberDisplayFormat(currentActivityBudgetValue + activistsHiringBudgetValue)}</span>
                                   </div>
                               </div>
                           </div>
					   </div>
                   </div>
                   <div className="col-md-6">
                       <div className="containerStrip tabContnt" style={{...this.styles.transparentBorderStyle , paddingTop:'8px' , paddingBottom:'8px' , paddingRight:'8px' , paddingLeft:'8px'} }>
                           <div className="row">
                               <div className="col-sm-6" style={{paddingLeft:'8px'}} >
                                   <div style={this.styles.topHeaderSquareStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>סכום שנוצל לפעילות שוטפת</span>
                                   </div>
                               </div>
                               <div className="col-sm-6" style={{paddingRight:'0px'}}>
                                   <div style={this.styles.topHeaderSquareContentBlueStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>{this.numberDisplayFormat(totalOnGoingBudgetRealExpenses)}</span>
                                   </div>
                               </div>
                           </div>
                           <div className="row" style={{paddingTop:'7px'}}>
                               <div className="col-sm-6" style={{paddingLeft:'8px'}}  >
                                   <div style={this.styles.topHeaderSquareStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>סכום שנוצל לגיוס פעילים</span>
                                   </div>
                               </div>
                               <div className="col-sm-6"  style={{paddingRight:'0px'}}>
                                   <div style={this.styles.topHeaderSquareContentBlueStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>{this.numberDisplayFormat(totalActivingBudgetRealExpenses)}</span>
                                   </div>
                               </div>
                           </div>
                           <div className="row" style={{paddingTop:'7px'}}>
                               <div className="col-sm-6" style={{paddingLeft:'8px'}}  >
                                   <div style={this.styles.topHeaderSquareStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>תקציב נוצל</span>
                                   </div>
                               </div>
                               <div className="col-sm-6" style={{paddingRight:'0px'}}>
                                   <div style={this.styles.topHeaderSquareContentBlueStyle}>
                                       <span style={this.styles.topHeaderFontStyle}>{this.numberDisplayFormat(totalOnGoingBudgetRealExpenses+totalActivingBudgetRealExpenses)}</span>
                                   </div>
                               </div>
                           </div>
					   </div>
                   </div>
               </div>;

			   this.headerBottomItem=<div className="row">
										 <div className="col-sm-12" style={{paddingTop:'9px'}}>
											 <div className="containerStrip tabContnt" style={{...this.styles.transparentBorderStyle , paddingTop:'8px' , paddingBottom:'8px' , paddingRight:'8px' , paddingLeft:'8px'  }}>
												 <div className="row">
													 <div className="col-sm-3" style={{paddingLeft:'8px'}} >
														 <div style={this.styles.topHeaderSquareStyle}>
															 <span style={this.styles.topHeaderFontStyle}>יתרה</span>
														 </div>
													 </div>
													 <div className="col-sm-9" style={{paddingRight:'0px' , textAlign:'center' , direction:'ltr'}}>
														 <div style={this.styles.topHeaderNegativeSquareStyle}>
														     <span style={this.styles.topHeaderNegativeFontStyle}>{this.numberDisplayFormat(currentActivityBudgetValue + activistsHiringBudgetValue - (totalOnGoingBudgetRealExpenses + totalActivingBudgetRealExpenses))}</span>
														 </div>
                                                     </div>
												 </div>
									         </div>
										 </div>
									 </div>;

			   this.firstBudgetItem = <div className="row">
										<div className="col-sm-12" style={{paddingTop:'20px'}}>
											<div className="containerStrip tabContnt" style={this.styles.transparentBorderStyle}>
												<div className="collapse-group">
													<div className="rsltsTitleRow flex-end" style={{textAlign:'left'}}>
														<img src={window.Laravel.baseAppURL + 'Images/icon-open-all.jpg'} style={{cursor:'pointer'}} onClick={this.setIsAllExpendedByType.bind(this , 0 , true)}  /> &nbsp;<a title="פתח הכל" className="open-all" style={{cursor:'pointer'}} onClick={this.setIsAllExpendedByType.bind(this , 0 , true)}>פתח הכל </a> 
														&nbsp;<img src={window.Laravel.baseAppURL + 'Images/icon-close-all.jpg'} style={{cursor:'pointer'}}  onClick={this.setIsAllExpendedByType.bind(this , 0 , false)} />&nbsp; <a title="סגור הכל" className="close-all" style={{cursor:'pointer'}} onClick={this.setIsAllExpendedByType.bind(this , 0 , false)}>סגור הכל</a> 
													</div>
													<div className="tableList">
														<table className="table table-striped tableNoMarginB  table-scroll">
															<thead>
																{this.outerOnGoingBudgetHeader}
															</thead>
															<tbody>
																{outerOnGoingBudgetRows}  
															</tbody>
															<tfoot>
																<tr className="total-teble" style={{backgroundColor:'#E5EEF4' , fontSize:'18px' , fontWeight:'bold' , color:'#336699' , borderTop:'2px solid #3399CC'}}>
																	<td colSpan="3">סיכום ביניים</td>
																	<td>{this.numberDisplayFormat(currentActivityBudgetValue)}</td>
																	<td>{this.numberDisplayFormat(totalOnGoingBudgetRealExpenses)}</td>
																	<td style={{textAlign:'right' , direction:'ltr'}}>{this.numberDisplayFormat(currentActivityBudgetValue - totalOnGoingBudgetRealExpenses)}</td>
																</tr>
															</tfoot>
														</table>
													</div>
												</div>
											</div>
										</div>
									</div>;
									
               //this.addMissingElectionsRolesRows(outerActivistBudgetRows);
			   
			   if( this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.budget.expected_activists'] == true ){
				   this.secondBudgetItem = <div className="row">
												<div className="col-sm-12" style={{paddingTop:'20px'}}>
													<div className="containerStrip tabContnt" style={this.styles.transparentBorderStyle}>
														<div className="collapse-group">
															<div className="rsltsTitleRow flex-end" style={{textAlign:'left'}}>
																<img src={window.Laravel.baseAppURL + 'Images/icon-open-all.jpg'} onClick={this.setIsAllExpendedByType.bind(this , 1 , true)}  style={{cursor:'pointer'}}   /> &nbsp;<a title="פתח הכל" className="open-all" style={{cursor:'pointer'}} onClick={this.setIsAllExpendedByType.bind(this , 1 , true)}  >פתח הכל </a> 
																&nbsp;<img src={window.Laravel.baseAppURL + 'Images/icon-close-all.jpg'} style={{cursor:'pointer'}} onClick={this.setIsAllExpendedByType.bind(this , 1 , false)}   />&nbsp; <a title="סגור הכל" className="close-all" style={{cursor:'pointer'}} onClick={this.setIsAllExpendedByType.bind(this , 1 , false)} >סגור הכל</a> 
															</div>
															<div className="tableList">
																<table className="table table-striped tableNoMarginB tableTight table-scroll">
																	<thead>
																		<tr>
																			<th></th>
																			<th></th>
																			<th>תקציב פעילים</th>
																			<th>סכום שהוקצב</th>
																			<th>סכום שנוצל</th>
																			<th>יתרה לניצול</th>
																		</tr>
																	</thead>
																	<tbody>
																		{outerActivistBudgetRows}
																	</tbody>
																	<tfoot>
																		<tr className="total-teble" style={{backgroundColor:'#E5EEF4' , fontSize:'18px' , fontWeight:'bold' , color:'#336699' , borderTop:'2px solid #3399CC'}}>
																			<td colSpan="3">סיכום ביניים</td>
																			<td>{this.numberDisplayFormat(activistsHiringBudgetValue)}</td>
																			<td>{this.numberDisplayFormat(totalActivingBudgetRealExpenses)}</td>
																			<td className="negative-balance">{this.numberDisplayFormat(activistsHiringBudgetValue+totalActivingBudgetRealExpenses)}</td>
																		</tr>
																	</tfoot>
																</table>
															</div>
														</div>
													</div>
												</div>
											</div>;
         }
       }
		
    }

    /*
      Handles changes in election campaign combo box : 
    */
    changeSelectedCampaign(e){
         this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.CHANGE_SELECTED_CAMPAIGN , item:{ selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
         if(e.target.selectedItem){
               ElectionsActions.loadCityBudgetByCampaign(this.props.dispatch , this.props.router.params.cityKey , e.target.selectedItem.key);
               ElectionsActions.loadCityRolesDataCounting(this.props.dispatch , this.props.router.params.cityKey , e.target.selectedItem.key);
         }	
    }
	
    addMissingElectionsRolesRows(outerActivistBudgetRows) {
 
        let systemNameList = [];
        let missingElectionRoles = [];
        this.props.cityBudgets.forEach(function (item) {
            systemNameList.push(item.system_name);
        });
        this.props.electionRolesAll.forEach(function (item) {
            if (systemNameList.indexOf(item.system_name) == -1) {
                missingElectionRoles.push(item);
            }
        });
        let firstIndex = outerActivistBudgetRows.length +1 ;
        missingElectionRoles.forEach(function (item, i) {
            let row = <tr key={"electionRolesRow" + i}>
                <td style={{ paddingRight: '17px' }}>
                  <a style={{ cursor: 'not-allowed','opacity':0.4 }}><img src={window.Laravel.baseAppURL + 'Images/collapse-circle-close.svg'} /></a>  
                </td>
                <td><span className="num-item">{firstIndex + i}</span>.</td>
                <td>{item.name}</td>
                <td>0</td>
                <td>0</td>
                <td className="negative-balance">0</td>
            </tr>
            outerActivistBudgetRows.push(row);
        })
    }
    render() {
        this.initDynamicVariables();
        return (
		
          <div role="tabpanel"> 

              <div className="row">
				  <div className="col-sm-12">
					  <div className="containerStrip tabContnt" style={this.styles.transparentBorderStyle}>
					      <div className="form-horizontal">
                              <div className="row">
                                  <label htmlFor="system-select" className="col-lg-2 control-label">בחר מערכת בחירות</label>
                                  <div className="col-lg-2">
                                      <Combo items={this.props.campaignsList}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'   value={this.props.selectedCampaign.selectedValue}  onChange={this.changeSelectedCampaign.bind(this)} />                                 
                                  </div>
                              </div>
                          </div>
                      </div>
				      <br/>
                  </div>
              </div>

              {this.headerItem}
              {this.headerBottomItem}
              {this.firstBudgetItem}
              {this.secondBudgetItem}
              <br/><br/>  
          {this.modalItem }
          </div>
 	   
     
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
	    selectedCampaign : state.elections.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.selectedCampaign,
	    campaignsList : state.elections.citiesScreen.cityPanelScreen.campaignsList,
        cityBudgets : state.elections.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets,
        actionHistoryOuterIndex :  state.elections.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.actionHistoryOuterIndex ,
        actionHistoryInnerIndex :  state.elections.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.actionHistoryInnerIndex ,
        electionsRoleData : state.elections.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.electionsRoleData,
        electionRolesAll:state.elections.activistsScreen.electionRoles,
    }
}

export default connect(mapStateToProps)(withRouter(PrimaryFourthTab));