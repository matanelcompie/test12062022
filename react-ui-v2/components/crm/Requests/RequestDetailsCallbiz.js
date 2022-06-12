import React from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router';
/**/
import ModalWindow from '../../global/ModalWindow';

import * as CrmActions from '../../../actions/CrmActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import * as SystemActions from '../../../actions/SystemActions';
import Combo from '../../global/Combo';
import Messages from '../../global/Messages';
import constants from '../../../libs/constants';
import {dateTimeReversePrint, parseDateToPicker, parseDateFromPicker} from '../../../libs/globalFunctions';

import ReactWidgets from 'react-widgets';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import moment from 'moment';

class RequestDetailsCallbiz extends React.Component {

    constructor(props) {
        super(props);

        this.styleIgniter();
  
		this.modalConfirmText = "האם אתה בטוח ?";
    }

    componentWillMount() {
        CrmActions.getAllRequestsActionsTypes(this.props.dispatch, this.props.router, 1);
        CrmActions.getAllRequestsActionsStatuses(this.props.dispatch, this.props.router);
    }

    componentWillReceiveProps(nextProps) {
            if (('' != this.props.originalDataRequest.reqKey) && nextProps.originalDataRequest.reqKey) {
            let systemTitle = "פניה מס' " + this.props.originalDataRequest.reqKey +' '+this.props.originalDataRequest.topic_name;
            this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'יצירת פניה'});
        }
    }

    /**
     * Let's set here the large and frequently used styles.
     * Kind of CSS.
     */
    styleIgniter() {

        this.tdStyleRight = {padding: '2px 5px', height: '22px', fontSize: '12px', textAlign: 'right'};
        this.tdStyle = {padding: '12px 5px', height: '29px', fontSize: '16px', textAlign: 'center' };
        this.longTdStyle = {padding: '2px 5px', height: '22px', fontSize: '12px', textAlign: 'center', width: '100%'};

        this.tabsStyle = {marginRight: '0', marginBottom: '0',};
        this.tabContentVisible = {display: 'block',};
        this.tabContentHidden = {display: 'none',};
        this.searchSpacerStyle = {marginBottom: '4px',};
        this.countBarStyle = {padding: '2px 5px', fontSize: '14px',};
        this.countBarPointerStyle = {padding: '2px 5px', fontSize: '14px', cursor: 'pointer',};
        /**/
        this.trBodyStyle = {display: "table", width: "100%", tableLayout: "fixed", cursor: 'pointer',};
        this.tableTrStyle = {display: 'table', width: '100%', tableLayout: 'fixed',};
        this.theadPK = {padding: '0 8px', display: 'table-header-group',};
        this.trPK = {display: "table", width: "100%", tableLayout: "fixed", cursor: 'pointer',};
        this.thPK = {padding: '3px 8px', textAlign: 'center',};
        this.thPKActions = { textAlign: 'center',width:'12.5%'};
		this.trPKActions = {paddingBottom:'3px', textAlign: 'center',width:'12.5%' , wordWrap: 'break-word'};
        this.tdPK = {padding: '1px 8px',};
		this.thPKHistory ={ textAlign: 'center',width:'20%' };
        this.tdPKHistory = { textAlign: 'center',width:'20%', wordWrap:'break-word'};
		this.tdPKHistoryRight = { textAlign: 'right',width:'20%', wordWrap:'break-word'};
        this.tbodyStyle = {
            height:'322px'
        };
 
        this.innerButtonText = {position:'relative' , top:'-3px'};

		this.addButtonStyle={backgroundColor:'#2AB4C0' , borderColor:'#2AB4C0' , width:'180px' , height:'40px' , fontSize:'18px' };
		
        this.inputStyle = {
            margin: 0,
            padding: '0 5px 0 0',
            fontWeight: 'normal',
            color: '#1880c7',
            /*backgroundColor: '#ffe37d',*/
            lineHeight: '16px',
            border: 'none',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopLeftRadius: 0,
            height: '22px'
        };

    }

 

	componentDidUpdate(){
					 			// if(this.refs.scrollTableBody != undefined){
//console.log("client height : "+this.refs.scrollTableBodyAction.clientHeight);

//}
	}
	
    assemblyRequestDetailTabTHEAD() {
            
             if(this.refs.scrollTableBodyCallbiz != undefined && this.refs.scrollTableBodyCallbiz.scrollHeight > this.refs.scrollTableBodyCallbiz.clientHeight){
				   return this.requestDetailTabTHEAD =
                <thead style={this.theadPK}>
                <tr style={this.trPK}>
                    <th style={this.thPK}>מזהה CallBIZ</th>
                    <th style={this.thPK}>תאריך ושעה</th>
                    <th style={this.thPK}>פירוט</th>
					<th style={{width:this.props.scrollbarWidth+'px' , borderRight:'0px'}}></th>
                </tr>
                </thead>;
			 }
			 else{
            return this.requestDetailTabTHEAD =
                <thead style={this.theadPK}>
                <tr style={this.trPK}>
                    <th style={this.thPK}>מזהה CallBIZ</th>
                    <th style={this.thPK}>תאריך ושעה</th>
                    <th style={this.thPK}>פירוט</th>
                </tr>
                </thead>;
			 }
    }

 
	setRowEditing(index){
	 this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_EDITING, theIndex:index ,  newValue: !this.props.callBizList[index].is_editing});
	 this.oldBizID = this.props.callBizList[index].callBizCenterKey;
	 this.oldBizDateTime=this.props.callBizList[index].callBizCenterDate;
	 this.oldBizDetails=this.props.callBizList[index].callBizCenterDetails;
	  this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.callbiz'});
	}
	
	
	changeCallbizID(index,e){
		if(e.target.value.length  <= 30){		 
			this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_ID, theIndex:index ,  newValue: e.target.value});
		}
	}
	
	changeCallbizDateTime(value, format, filterName, e){
		 let valueParts = value.split(' ');
		 let valueDateOnlyParts = valueParts[0].split('-');
		this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_DATETIME, theIndex:this.props.callBizEditIndex ,  newValue:(valueDateOnlyParts[2] + '/' + valueDateOnlyParts[1] + '/' + valueDateOnlyParts[0] + ' ' + valueParts[1] + ':00')});
	}
	
	changeCallbizDetails(index,e){
		if(e.target.value.length  <= 3000){
		   this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_DETAILS, theIndex:index ,  newValue: e.target.value});
		}
	}
	
	undoEditCallbiz(index , e){
		this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.callbiz'});
		this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.UNDO_EDIT_CALLBIZ, theIndex:index , oldBizID:this.oldBizID , oldBizDateTime:this.oldBizDateTime , oldBizDetails:this.oldBizDetails });
		this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_EDITING, theIndex:index ,  newValue: !this.props.callBizList[index].is_editing});
		
	}
	
	/*save callbiz record to database*/
	saveCallbiz(index , e){
		if(this.missingEditCallbizDate || this.missingEditCallbizDetails || this.missingEditCallbizId){
			 this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בעדכון קריאה', content: 'יש למלא את כל שדות החובה'});
		}
		else{
			this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.callbiz'});
			CrmActions.editCallbizRow(this.props.dispatch , this.props.router , this.props.callBizList[this.props.callBizEditIndex].callBizIdentifierKey , this.props.router.params.reqKey , this.props.callBizList[this.props.callBizEditIndex].callBizCenterKey ,this.props.callBizList[this.props.callBizEditIndex].callBizCenterDate , this.props.callBizList[this.props.callBizEditIndex].callBizCenterDetails );
		}
	}
	
	/*delete  row - general function */
	deleteRow(e){
	        this.deleteCallbizRow();
		
	}
	
	/*delete callbiz row - set deleted = 1*/
	deleteCallbizRow(){
		this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.CLOSE_CONFIRM_DIALOG 
        });
		CrmActions.deleteCallbizRow(this.props.dispatch , this.props.router , this.props.callBizList[this.props.callBizDeleteIndex].callBizIdentifierKey , this.props.router.params.reqKey);
	}

	confirmDeleteCallbiz(index , e){
		  this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.OPEN_CONFIRM_DIALOG , rowIndex:index , header:'מחיקת callbiz' , actionType:'callbiz' 
        });
	}
	
	showAddNewCallbizScreen(){
		this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.SHOW_ADD_CALLBIZ_TO_REQUEST_SCREEN 
        });
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.callbiz'});
	}

	closeAddNewBizcall(){
		this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.HIDE_ADD_CALLBIZ_TO_REQUEST_SCREEN 
        });
		this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.callbiz'});
	}
	

	
	newCallbizIDChange(e){
		this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_ID_CHANGE  , newValue:e.target.value
        });
	}
	
	newCallbizDatetimeChange(value, format, filterName){
		let valueParts = value.split(' ');
		let valueDateParts = valueParts[0].split('-');
		this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_DATETIME_CHANGE  , newValue:(valueDateParts[2] + '/' + valueDateParts[1] + '/' +valueDateParts[0] + ' ' + valueParts[1] + ':00')
        });
	}
	
	newCallbizDetailsChange(e){
		if(e.target.value.length <= 3000){
		this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_DETAILS_CHANGE  , newValue:e.target.value
        
		});
		}
	}
	
    /*add new callbiz record*/
	addNewCallBiz(){
		if(this.missingCallbizDatetime || this.missingCallbizDetails || this.missingCallbizId){
			 this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בהוספת קריאה', content: 'יש למלא את כל שדות החובה'});
		}
		else{
			  let arrayTargetDateParts = [] , arrayDateOnlyParts = [] , formatteTargetDateForAPI = '';
		    if(this.props.newCallbizDetails.datetime.length == 19){
             arrayTargetDateParts = this.props.newCallbizDetails.datetime.split(' ');
             arrayDateOnlyParts = arrayTargetDateParts[0].split('/');
             formatteTargetDateForAPI = (arrayDateOnlyParts[2] + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]) + ' ' + arrayTargetDateParts[1];
			}
			else if(this.props.newCallbizDetails.datetime.length == 17){
				
             arrayTargetDateParts = this.props.newCallbizDetails.datetime.split(' ');
             arrayDateOnlyParts = arrayTargetDateParts[0].split('/');
             formatteTargetDateForAPI = (('20' + arrayDateOnlyParts[2]) + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]) + ' ' + arrayTargetDateParts[1];
			}
			else if(this.props.newCallbizDetails.datetime.length == 14){
             arrayTargetDateParts = this.props.newCallbizDetails.datetime.split(' ');
             arrayDateOnlyParts = arrayTargetDateParts[0].split('/');
             formatteTargetDateForAPI = (('20' + arrayDateOnlyParts[2]) + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]) + ' ' + arrayTargetDateParts[1]+':00';
			}
			else if(this.props.newCallbizDetails.datetime.length == 16){
             arrayTargetDateParts = this.props.newCallbizDetails.datetime.split(' ');
             arrayDateOnlyParts = arrayTargetDateParts[0].split('/');
             formatteTargetDateForAPI = (arrayDateOnlyParts[2] + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]) + ' ' + arrayTargetDateParts[1]+':00';
			}
			else if(this.props.newCallbizDetails.datetime.length == 10){
             arrayDateOnlyParts = this.props.newCallbizDetails.datetime.split('/');
             formatteTargetDateForAPI = (arrayDateOnlyParts[2] + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]);
			}
			else if(this.props.newCallbizDetails.datetime.length == 8){
             arrayDateOnlyParts = this.props.newCallbizDetails.datetime.split('/');
             formatteTargetDateForAPI = (('20'+arrayDateOnlyParts[2]) + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]);
			}
			this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.callbiz'});
		      CrmActions.addCallbizRow(this.props.dispatch , this.props.router , this.props.router.params.reqKey , this.props.newCallbizDetails.ID , formatteTargetDateForAPI , this.props.newCallbizDetails.details );
		}
	}
	
 
	showDeleteModalDialog(rowIndex) {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_DISPLAY_CONFIRM_ACTION_DELETE,
                             deleteIndex: rowIndex , isShow:true});
    }
	
	hideDeleteModalDialog() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_DISPLAY_CONFIRM_ACTION_DELETE,
                             deleteIndex: -1 , isShow:false});
    }
	
	changeOperationRowItem(rowIndex , rowKey , reloadTopics , e){
		 this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CHANGE_EDIT_ACTION_ROW_FIELD,
                             rowIndex , rowKey , newValue:e.target.value});
		 if(reloadTopics){
			 this.changeOperationEditRowTopicsList(e.target.value);
			 this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CHANGE_EDIT_ACTION_ROW_FIELD,
                             rowIndex , rowKey:'actionTopicName' , newValue:''});
		 }
	}
	
	changeOperationEditRowTopicsList(typeValueName){
		let newActionType = typeValueName;
        let topicKey = this.getActionTypeParam(newActionType, 'key');
		CrmActions.getRequestActionTopicsByType(this.props.dispatch, topicKey);
	}
	 
    assemblyRequestDetailTabTBODY() {

        let self = this;
        let isEditPermission = false;

        if ( this.props.statusNotForEdit ) {
            if ( this.props.hasAdminEdit ) {
                isEditPermission = true;
            } else {
                isEditPermission = false;
            }
        } else if ( this.props.hasRequestEditingPermissions ) {
            isEditPermission = true;
        } else {
            isEditPermission = false;
        }
  
            this.callBizTRlist = this.props.callBizList.map(function (reqCallBiz, i) {
			  
			 
			//self.props.callBizList[i].callBizCenterDate = dateTimeReversePrint(reqCallBiz.callBizCenterDate , true);
				 
             if(!reqCallBiz.is_editing){
				let editMenuItem = '';
				if(self.props.editingCallbizRow == false && self.props.addingNewCallbiz == false){
					let editRow = '';
					let deleteRow = '';
					if(isEditPermission){
					if (self.props.currentUser.admin || self.props.currentUser.permissions['crm.requests.callbiz.edit'] == true){
					    editRow = <span  className="glyphicon glyphicon-pencil pull-left" style={{paddingLeft: '3px'}} onClick={self.setRowEditing.bind(self , i)} />;	
					}
					if (self.props.currentUser.admin || self.props.currentUser.permissions['crm.requests.callbiz.delete'] == true){
					    deleteRow = <span className="glyphicon glyphicon-remove pull-left" style={{paddingLeft: '3px'}} onClick={self.confirmDeleteCallbiz.bind(self , i)} />;	
					}
					}
					editMenuItem = <span>
					{deleteRow}
						{editRow}
					 </span>; 
				}
                return <tr id={i} key={i} style={self.trBodyStyle}>
                    <td style={self.tdStyle}>{reqCallBiz.callBizCenterKey}</td>
                    <td style={self.tdStyle}>{reqCallBiz.callBizCenterDate }</td>
                    <td style={{textAlign:'right'}}>{reqCallBiz.callBizCenterDetails} {editMenuItem}
                    </td>
                </tr>
				
				;
			 }
			 else{
				return <tr id={i} key={i} style={self.trBodyStyle}>
                    <td style={self.tdStyle}><input type='text' value={reqCallBiz.callBizCenterKey}
                                                    style={self.callbizValidatorsStyle.editIdStyle}
                                                    className="form-control form-control-sm"
                                                    onChange={self.changeCallbizID.bind(self , i )} /></td>
                    <td style={self.tdStyle}>
					      <ReactWidgets.DateTimePicker 
                                                        isRtl={true}
                                                        time={true}
                                                        value={parseDateToPicker(reqCallBiz.callBizCenterDate)}
                                                        onChange={parseDateFromPicker.bind(self, {callback: self.changeCallbizDateTime, format: "YYYY-MM-DD HH:mm", functionParams: i})}
                                                        format="DD/MM/YYYY HH:mm"
                                                        
                                                    />
				
					</td>
                    <td style={self.tdStyle}>
                        <textarea    type='text' value={reqCallBiz.callBizCenterDetails}
                                                          style={self.callbizValidatorsStyle.editDetailsStyle}
                                                          className="form-control form-control-sm"
                                                          onChange={self.changeCallbizDetails.bind(self,i)}>

                        </textarea>
                        <span className="glyphicon glyphicon-remove pull-left"
                              style={{paddingLeft: '3px' , color:'red' , fontSize:'20px'}}
                              onClick={self.undoEditCallbiz.bind(self , i )}/>
                        <span  className="glyphicon glyphicon-ok pull-left" style={{paddingLeft: '3px', color:'green' , fontSize:'20px'}}
                               onClick={self.saveCallbiz.bind(self , i )} />
                    </td>
                </tr>; 
			 }
            });
			
			
           if(self.props.addingNewCallbiz == true && self.props.router.params.reqKey != undefined){
             if (self.props.editingCallbizRow == false) {
             let len = self.props.callBizList.length;
             if (len > 0) {
                len = 1 + len;
             }
			  self.callBizTRlist[len] = <tr id={len} key={len} style={self.trBodyStyle}>
                    <td style={self.tdStyle}><input type='text' value={this.props.newCallbizDetails.ID}
                                                    onChange={this.newCallbizIDChange.bind(this)}
                                                    maxLength={30}
                                                    className="form-control form-control-sm"
                                                    style={this.callbizValidatorsStyle.idStyle}/></td>
                    <td style={self.tdStyle}>
					      <ReactWidgets.DateTimePicker 
                                                        isRtl={true}
                                                        time={true}
                                                        value={parseDateToPicker(this.props.newCallbizDetails.datetime)}
                                                        onChange={parseDateFromPicker.bind(self, {callback: self.newCallbizDatetimeChange, format: "YYYY-MM-DD HH:mm", functionParams: ''})}
                                                        format="DD/MM/YYYY HH:mm"
                                                        
                                                    />
					     
				    </td>
                    <td style={self.tdStyle}><textarea type='text' value={this.props.newCallbizDetails.details}
                                                       onChange={this.newCallbizDetailsChange.bind(this)}
                                                       className="form-control form-control-sm"
                                                       style={this.callbizValidatorsStyle.detailsStyle}/>
                        <span className="glyphicon glyphicon-remove pull-left"
                              style={{paddingLeft: '3px' , color:'red' , fontSize:'20px' , cursor:'pointer'}}
                              onClick={this.closeAddNewBizcall.bind(this)} />
                        <span  className="glyphicon glyphicon-ok pull-left"
                               style={{paddingLeft: '3px', color:'green' , fontSize:'20px' , cursor:'pointer'}}
                               onClick={this.addNewCallBiz.bind(this)}  />
                    </td>
                </tr>; 
			 }
             }

            return this.requestDetailTabTBODY = <tbody ref="scrollTableBodyCallbiz" style={this.tbodyStyle}>{this.callBizTRlist}</tbody>;
         
    }

	callbizValidatorStyleIgnitor(){
		this.callbizValidatorsStyle = {};
		
		let datetime = this.props.newCallbizDetails.datetime.trim();
        if (!(datetime.length == 19 || datetime.length == 17 || datetime.length == 14 || datetime.length == 16 || datetime.length == 10 ||  datetime.length == 8)) {
            this.callbizValidatorsStyle.datetimeStyle = {borderColor: '#ff0000'};
            this.missingCallbizDatetime = true;
        }
		else {

            this.callbizValidatorsStyle.datetimeStyle = {borderColor: '#cccccc'};
            this.missingCallbizDatetime = false;
        }
		
		let details = this.props.newCallbizDetails.details;
        if (details.trim() == '') {
            this.callbizValidatorsStyle.detailsStyle = {borderColor: '#ff0000'};
            this.missingCallbizDetails = true;
        }
		else {

            this.callbizValidatorsStyle.detailsStyle = {borderColor: '#cccccc'};
            this.missingCallbizDetails = false;
        }

		let callBizId = this.props.newCallbizDetails.ID.trim();
        if ( callBizId == '' || callBizId.length > 30) {
            this.callbizValidatorsStyle.idStyle = {borderColor: '#ff0000'};
            this.missingCallbizId = true;
        } else {
            this.callbizValidatorsStyle.idStyle = {borderColor: '#cccccc'};
            this.missingCallbizId = false;
        }
		
		if(this.props.editingCallbizRow == true){

            callBizId = this.props.callBizList[this.props.callBizEditIndex].callBizCenterKey;
            if ( callBizId == '' || callBizId.length > 30) {
                this.callbizValidatorsStyle.editIdStyle = {borderColor: '#ff0000'};
                this.missingEditCallbizId = true;
            } else {
                this.callbizValidatorsStyle.editIdStyle = {borderColor: '#cccccc'};
                this.missingEditCallbizId = false;
            }

            let theDate = this.props.callBizList[this.props.callBizEditIndex].callBizCenterDate.trim();
		    
		    if(!(theDate.length == 19 || theDate.length == 17 || theDate.length == 14 || theDate.length == 16 ||
                theDate.length == 10 || theDate.length == 8)){
			    this.callbizValidatorsStyle.editDateStyle = {borderColor: '#ff0000'};
                this.missingEditCallbizDate = true;
		    } else{
			   this.callbizValidatorsStyle.editDateStyle = {borderColor: '#cccccc'};
               this.missingEditCallbizDate = false;
		   }
		   
		   if(this.props.callBizList[this.props.callBizEditIndex].callBizCenterDetails.trim() == ''){
			   this.callbizValidatorsStyle.editDetailsStyle = {borderColor: '#ff0000'};
               this.missingEditCallbizDetails = true;
		   } else{
			   this.callbizValidatorsStyle.editDetailsStyle = {borderColor: '#cccccc'};
               this.missingEditCallbizDetails = false;
		   }


		}
		
	}
	
	 
	
	closeGlobalDialog(e){
		this.props.dispatch({type: GlobalActions.ActionTypes.MESSAGES.CLOSE_GLOBAL_DIALOG});
	}
	
    validatorStyleIgnitor() {
        this.validatorsStyle = {};


        let details = this.props.newActionDetails.details;
        if (details.trim() == '') {
            this.validatorsStyle.detailsStyle = {borderColor: '#ff0000' , height:'40px'};
            this.missingDetails = true;
        }
        else {

            this.validatorsStyle.detailsStyle = {borderColor: '#cccccc' , height:'40px'};
            this.missingDetails = false;
        }

        let target_date = this.props.newActionDetails.target_date;
        if (target_date == undefined || target_date == '' || !(target_date.length ==  8 || target_date.length ==  10 || target_date.length ==  19 || target_date.length ==  16 || target_date.length ==  14 || target_date.length ==  17)) {
            this.validatorsStyle.targetDateStyle = {borderColor: '#ff0000'};
            this.wrongTargetDate = true;
        }
        else {
            this.validatorsStyle.targetDateStyle = {borderColor: '#cccccc'};
            this.wrongTargetDate = false;
        }


        let actionType = this.props.newActionDetails.action_type;
        if (actionType.trim() == '') {
            this.validatorsStyle.actionTypeStyle = {borderColor: '#ff0000'};
            this.missingActionType = true;
        }
        else {

            this.validatorsStyle.actionTypeStyle = {borderColor: '#cccccc'};
            this.missingActionType = false;
        }

        let actionTopic = this.props.newActionDetails.action_topic;
        if (actionTopic.trim() == '') {
            this.validatorsStyle.actionTopicStyle = {borderColor: '#ff0000'};
            this.missingActionTopic = true;
        }
        else {

            this.validatorsStyle.actionTopicStyle = {borderColor: '#cccccc'};
            this.missingActionTopic = false;
        }

        let actionStatus = this.props.newActionDetails.action_status;
        if (actionStatus.trim() == '') {
            this.validatorsStyle.actionTopicStatus = {borderColor: '#ff0000'};
            this.missingActionStatus = true;
        }
        else {

            this.validatorsStyle.actionTopicStatus = {borderColor: '#cccccc'};
            this.missingActionStatus = false;
        }

    }

	/*general function that closes all types of confirm dialog */
    closeConfirmDialog() {
        this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.CLOSE_CONFIRM_DIALOG
        });
    }
	
	deleteAction(){
		if(this.props.deleteOperationIndex > 0){
		   CrmActions.deleteAction(this.props.dispatch , this.props.router.params.reqKey ,this.props.operationList[this.props.deleteOperationIndex].key )
		}
	}

	editPermissionsInit(){

        var request_status_type_closed = constants.request_status_type_closed;        
        var request_status_type_canceled = constants.request_status_type_canceled;
        this.statusNotForEdit = true;
        this.userHasEditRequestPermissions = false;
        this.hasRequestEditingPermissions = false;
        this.hasAdminEdit = false;
        
        if (this.props.dataRequest.status_type_id == request_status_type_closed || this.props.dataRequest.status_type_id == request_status_type_canceled){
            this.statusNotForEdit = true;
        } else{
            this.statusNotForEdit = false; 
        }
        if (this.props.router.params.reqKey != 'new'){            
            if (this.props.dataRequest.reqKey != '' && this.props.dataRequest.reqKey != undefined){
                if (this.props.currentUser.admin == true || this.props.dataRequest.team_leader_id == this.props.currentUser.id || this.props.dataRequest.user_handler_id == this.props.currentUser.id ){                                        
                    this.userHasEditRequestPermissions = true;
                }else { 
                    this.userHasEditRequestPermissions = false;
                }
            } else{ 
                this.userHasEditRequestPermissions = true;
            }           
        } else{
            this.userHasEditRequestPermissions = true;
        }

        if ( this.statusNotForEdit == false && this.userHasEditRequestPermissions == true){
            this.hasRequestEditingPermissions = true;
        } else{
            this.hasRequestEditingPermissions = false;
        }
        if (!this.hasRequestEditingPermissions){
            this.noPermissionMessage = 'אין למשתמש הרשאה לעריכת הפניה';
        } else {
            this.noPermissionMessage = '';
        }

        if (this.props.currentUser.permissions['crm.requests.admin_edit'] || this.props.currentUser.admin == true){
            this.hasAdminEdit = true;
        } else{
            this.hasAdminEdit = false;
        }
    }
	
    render() {

	  this.editPermissionsInit();
      this.validatorStyleIgnitor();
	  this.callbizValidatorStyleIgnitor();
      this.assemblyRequestDetailTabTHEAD();
      this.assemblyRequestDetailTabTBODY();

      let addNewItem = '';

         
	 
	  let labelItem = '';
	  let buttonItem = '';
	  if (true == this.props.activeRequestDetailTab.callBiz) {
		 labelItem = 'callbiz';

          if ( this.props.statusNotForEdit ) {
              if ( this.props.hasAdminEdit ) {
                  buttonItem = <button type="submit" disabled={this.props.hasRequestEditingPermissions == false}
                                       className="btn btn-primary btn-lg" style={this.addButtonStyle}
                                       onClick={this.showAddNewCallbizScreen.bind(this)}>
                      <div style={this.innerButtonText}> + callbiz חדש</div>
                  </button>;
              }
          } else if(this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.callbiz.add'])
		  {
		      buttonItem = <button type="submit" disabled={this.props.hasRequestEditingPermissions == false}
                                   className="btn btn-primary btn-lg" style={this.addButtonStyle}
                                   onClick={this.showAddNewCallbizScreen.bind(this)}>
                               <div style={this.innerButtonText}> + callbiz חדש</div>
                           </button>;
	      }
	  }
	   
        return (
            <div className="col-md-12">
			              <ModalWindow show={this.props.showConfirmDialog} buttonOk={this.deleteRow.bind(this)} buttonX={this.closeConfirmDialog.bind(this)} buttonCancel={this.closeConfirmDialog.bind(this)} title={this.props.modalHeaderText} style={{zIndex: '9001'}}>
                               <div>{this.props.modalContentText}</div>
                          </ModalWindow>
						  <ModalWindow show={this.props.showGlobalDialog} buttonOk={this.closeGlobalDialog.bind(this)} buttonX={this.closeGlobalDialog.bind(this)}   title={this.props.globalHeaderText} style={{zIndex: '9001'}}>
                               <div  dangerouslySetInnerHTML={{__html: this.props.globalContentText}}></div>
                          </ModalWindow>
			    <div className="row">
                     <div className="col-md-6 no-padding" style={{paddingRight:'20px' , paddingBottom:'20px' , paddingTop:'30px' , fontSize:'22px' , fontWeight:'600' , color:'#3280BB'}}>
						 {labelItem}
					 </div>
					 <div className="col-md-6 no-padding text-left" style={{paddingTop:'30px' , paddingLeft:'16px'}}>
					 {buttonItem}
					 </div>
               </div>				
						  
                <table  className="table table-bordered table-striped table-hover lists-table" width={"100%"} cellSpacing={'0'}>
                    {this.requestDetailTabTHEAD}
                    {this.requestDetailTabTBODY}
                </table>
                 <ModalWindow show={this.props.showDeleteActionModalDialog}
                              buttonOk={this.deleteAction.bind(this)} 
                             buttonCancel={this.hideDeleteModalDialog.bind(this)}
                             title={'מחיקת פעולה'} style={{zIndex: '9001'}}>
                    <div>{this.modalConfirmText}</div>
                </ModalWindow>
            </div>


        )
		}
     
}

function mapStateToProps(state) {

    return {
        activeRequestDetailTab: state.crm.searchRequestsScreen.activeRequestDetailTab,
        operationList: state.crm.searchRequestsScreen.operationList,
		editOperationIndex : state.crm.searchRequestsScreen.editOperationIndex,
		showDeleteActionModalDialog: state.crm.searchRequestsScreen.showDeleteActionModalDialog, 
		deleteOperationIndex: state.crm.searchRequestsScreen.deleteOperationIndex,
        historyList: state.crm.searchRequestsScreen.historyList,
        callBizList: state.crm.searchRequestsScreen.callBizList,
		oldCallBiz:state.crm.searchRequestsScreen.oldCallBiz ,
        messageList: state.crm.searchRequestsScreen.messageList,
        addingNewAction: state.crm.searchRequestsScreen.addingNewAction,
        requestTypes: state.crm.searchRequestsScreen.requestTypes,
        directions: state.crm.searchRequestsScreen.directions,
        newActionDetails: state.crm.searchRequestsScreen.newActionDetails,
		newCallbizDetails:state.crm.searchRequestsScreen.newCallbizDetails,
        actionTypesList: state.crm.searchRequestsScreen.actionTypesList,
        actionTopicsList: state.crm.searchRequestsScreen.actionTopicsList,
        actionStatusesList: state.crm.searchRequestsScreen.actionStatusesList , 
		editingCallbizRow:state.crm.searchRequestsScreen.editingCallbizRow,
		showConfirmDialog: state.crm.searchRequestsScreen.showConfirmDialog,
		modalHeaderText:state.crm.searchRequestsScreen.modalHeaderText,
        modalContentText: state.crm.searchRequestsScreen.modalContentText,
		callBizDeleteIndex:state.crm.searchRequestsScreen.callBizDeleteIndex,
		callBizEditIndex:state.crm.searchRequestsScreen.callBizEditIndex,
        addingNewCallbiz:state.crm.searchRequestsScreen.addingNewCallbiz,
		messagesList: state.global.messages_screen.messagesList,
		globalHeaderText:state.global.globalHeaderText,
		globalContentText:state.global.globalContentText,
		showGlobalDialog : state.global.showGlobalDialog,
		currentUser:state.system.currentUser,
		scrollbarWidth : state.system.scrollbarWidth ,
		voterDetails: state.voters.voterDetails,
		originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
		dataRequest: state.crm.searchRequestsScreen.dataRequest,

    }
}

export default connect(mapStateToProps)(withRouter(RequestDetailsCallbiz));
