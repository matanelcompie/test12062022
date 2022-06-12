import React from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router';
/**/
import ModalWindow from '../../global/ModalWindow';
import Documents from '../../global/Documents';

import * as CrmActions from '../../../actions/CrmActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import * as SystemActions from '../../../actions/SystemActions';
import Combo from '../../global/Combo';
import Messages from '../../global/Messages';
import {dateTimeReversePrint} from '../../../libs/globalFunctions';

class RequestDetailsTab extends React.Component {

    constructor(props) {
        super(props);

        this.styleIgniter();
        this.textIgniter();
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
        this.trPK = {display: "table", width: "100%", tableLayout: "fixed", cursor: 'pointer',header:'46px'};
        this.thPK = {padding: '3px 8px', textAlign: 'center',lineHeight:'46px'};
        this.thPKType = {padding: '3px 8px', textAlign: 'center',width:'100px',lineHeight:'46px'};
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

    textIgniter() {

        this.screenTitle = 'פניה';
        this.zzz = '';
    }

	componentDidUpdate(){
					 			// if(this.refs.scrollTableBody != undefined){
//console.log("client height : "+this.refs.scrollTableBodyAction.clientHeight);

//}
	}
	
    assemblyRequestDetailTabTHEAD() {

        
        if (true == this.props.activeRequestDetailTab.message) {
            /**
             *
             */
            return this.requestDetailTabTHEAD =
                <thead style={this.theadPK}>
                <tr style={this.trPK}>
                    <th style={this.thPKType}>סוג הודעה</th>
                    <th style={this.thPK}>תאריך</th>
                    <th style={this.thPK}>כיוון</th>
                    <th style={this.thPK}>פרטי תקשורת</th>
                    <th style={this.thPK}>נושא</th>
                    <th style={this.thPK}>תוכן</th>
                </tr>
                </thead>;
        }

        if (true == this.props.activeRequestDetailTab.document) {
            /**
             *
             */
            return this.requestDetailTabTHEAD =
                <thead style={this.theadPK}>
                <tr style={this.trPK}>
                    <th style={this.thPK}>מס' מסמך</th>
                    <th style={this.thPK}>סוג מסמך</th>
                    <th style={this.thPK}>מועד יצירה</th>
                    <th style={this.thPK}>שם מסמך</th>
                </tr>
                </thead>;
        }

    }

    /*
     * function that returns type name of topic by its id
     */
    getOperationDirectionName(direction_id) {
        switch (direction_id) {
            case 0 :
                return 'יוצאת';
                break;
            case 1 :
                return 'נכנסת';
                break;
            default:
                return '';
                break;
        }
    }

    /*
     * function that returns status name of topic by its id
     */
    getOperationStatusName(status_id) {
        switch (status_id) {
            case 1 :
                return 'פתוח';
                break;
            case 2 :
                return 'בוצע';
                break;
            case 3 :
                return 'בוטל';
                break;
            default:
                return '';
                break;
        }
    }

    /*
     * function that displays screen that enables to add new action to request
     */
    showAddNewActionScreen(e) {
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.actions'});
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SHOW_ADD_ACTION_TO_REQUEST_SCREEN});
        this.setDefaultActionsFieldsValues();
    }

    closeAddingActionDialog(e) {
		this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.actions'});
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_ADD_ACTION_TO_REQUEST_SCREEN});
    }

    addNewAction(e) {
		
        if (this.missingDetails || this.missingActionTopic || this.missingActionType || this.missingActionStatus) {
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בהוספת פעולה', content: 'יש למלא את כל שדות החובה'});
        }
        else if (this.wrongTargetDate) {
            this.props.dispatch({
                type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS,
                header: 'שגיאה בהוספת פעולה',
                content: 'יש להזין תאריך בפורמט תקין'
            });
        }
        else {
			let arrayTargetDateParts = [] , arrayDateOnlyParts = [] , formatteTargetDateForAPI = '';
		    if(this.props.newActionDetails.target_date.length == 19){
             arrayTargetDateParts = this.props.newActionDetails.target_date.split(' ');
             arrayDateOnlyParts = arrayTargetDateParts[0].split('/');
             formatteTargetDateForAPI = (arrayDateOnlyParts[2] + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]) + ' ' + arrayTargetDateParts[1];
			}
			else if(this.props.newActionDetails.target_date.length == 17){
				
             arrayTargetDateParts = this.props.newActionDetails.target_date.split(' ');
             arrayDateOnlyParts = arrayTargetDateParts[0].split('/');
             formatteTargetDateForAPI = (('20' + arrayDateOnlyParts[2]) + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]) + ' ' + arrayTargetDateParts[1];
			}
			else if(this.props.newActionDetails.target_date.length == 14){
             arrayTargetDateParts = this.props.newActionDetails.target_date.split(' ');
             arrayDateOnlyParts = arrayTargetDateParts[0].split('/');
             formatteTargetDateForAPI = (('20' + arrayDateOnlyParts[2]) + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]) + ' ' + arrayTargetDateParts[1]+':00';
			}
			else if(this.props.newActionDetails.target_date.length == 16){
             arrayTargetDateParts = this.props.newActionDetails.target_date.split(' ');
             arrayDateOnlyParts = arrayTargetDateParts[0].split('/');
             formatteTargetDateForAPI = (arrayDateOnlyParts[2] + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]) + ' ' + arrayTargetDateParts[1]+':00';
			}
			else if(this.props.newActionDetails.target_date.length == 10){
             arrayDateOnlyParts = this.props.newActionDetails.target_date.split('/');
             formatteTargetDateForAPI = (arrayDateOnlyParts[2] + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]);
			}
			else if(this.props.newActionDetails.target_date.length == 8){
             arrayDateOnlyParts = this.props.newActionDetails.target_date.split('/');
             formatteTargetDateForAPI = (('20'+arrayDateOnlyParts[2]) + '-' + arrayDateOnlyParts[1] + '-' + arrayDateOnlyParts[0]);
			}
			
            CrmActions.addNewAction(this.props.dispatch, this.props.router, this.props.router.params.reqKey, this.getActionTypeParam(this.props.newActionDetails.action_type, 'id'), this.getActionTopicID(this.props.newActionDetails.action_topic), this.getActionStatusID(this.props.newActionDetails.action_status), this.getActionDirectionID(this.props.newActionDetails.action_direction), formatteTargetDateForAPI, this.props.newActionDetails.details, this.props.newActionDetails.conversationWith);
            this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.actions'});       
	   }
    }

    setDefaultActionsFieldsValues() {

    }


    getActionDirectionID(actionDirectionName) {
        let returnedValue = -1;
        for (let i = 0, len = this.props.directions.length; i < len; i++) {
            if ((this.props.directions[i].name) == actionDirectionName) {
                returnedValue = this.props.directions[i].id;
                break;
            }
        }
        return returnedValue;
    }

    getActionStatusID(actionStatusName) {
        let returnedValue = -1;
        for (let i = 0, len = this.props.actionStatusesList.length; i < len; i++) {
            if ((this.props.actionStatusesList[i].name) == actionStatusName) {
                returnedValue = this.props.actionStatusesList[i].id;
                break;
            }
        }
        return returnedValue;
    }

    getActionTopicID(actionTopicName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.actionTopicsList.length; i < len; i++) {
            if ((this.props.actionTopicsList[i].name) == actionTopicName) {
                returnedValue = this.props.actionTopicsList[i].id;
                break;
            }
        }
        return returnedValue;
    }

    getActionTypeParam(actionTypeName, paramName) {
        let returnedValue = "";
        switch (paramName) {
            case 'key' :
                for (let i = 0, len = this.props.actionTypesList.length; i < len; i++) {
                    if ((this.props.actionTypesList[i].name) == actionTypeName) {
                        returnedValue = this.props.actionTypesList[i].key;
                        break;
                    }
                }
                break;

            case 'id' :
                for (let i = 0, len = this.props.actionTypesList.length; i < len; i++) {
                    if ((this.props.actionTypesList[i].name) == actionTypeName) {
                        returnedValue = this.props.actionTypesList[i].id;
                        break;
                    }
                }
                break;

            default :
                break;
        }
        return returnedValue;
    }

    newActionTypeChange(e) {
        //this.props.dataRequest.sub_topic_name = '';
        let newActionType = e.target.value;
        let topicKey = this.getActionTypeParam(newActionType, 'key');
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_ACTION_TYPE_CHANGE, actionType: newActionType});
        CrmActions.getRequestActionTopicsByType(this.props.dispatch, topicKey);
    }

    newActionDirectionChange(e) {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_ACTION_DIRECTION_CHANGE, actionDirection: e.target.value});
    }

    newActionStatusChange(e) {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_ACTION_STATUS_CHANGE, actionStatus: e.target.value});
    }

    newActionTopicChange(e) {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_ACTION_TOPIC_CHANGE, actionTopic: e.target.value});
    }

    newConversationWithChange(e) {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_OPERATION_CONVERSATION_WITH_CHANGED, newValue: e.target.value});
    }

    newDetailsChange(e) {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_OPERATION_DETAILS_CHANGED, newValue: e.target.value});
    }

    newTargetDateChange(e) {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_OPERATION_DATE_CHANGED, newValue: e.target.value});
    }

	
	setRowEditing(index){
	 this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_EDITING, theIndex:index ,  newValue: !this.props.callBizList[index].is_editing});
	 this.oldBizID = this.props.callBizList[index].callBizCenterKey;
	 this.oldBizDateTime=this.props.callBizList[index].callBizCenterDate;
	 this.oldBizDetails=this.props.callBizList[index].callBizCenterDetails;
	  this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.callbiz'});
	}
	
    setDocumentRowEditing(index){
	 this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.SET_DOCUMENT_EDITING, theIndex:index ,  newValue: !this.props.documentList[index].is_editing});
	 this.oldFileName = this.props.documentList[index].fileName;
	  
	}
	
	undoEditDocument(index , e){
		//this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.UNDO_EDIT_CALLBIZ, theIndex:index , oldBizID:this.oldBizID , oldBizDateTime:this.oldBizDateTime , oldBizDetails:this.oldBizDetails });
		this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.SET_DOCUMENT_EDITING, theIndex:index ,  newValue: !this.props.documentList[index].is_editing});
		
	}
	
	changeCallbizID(index,e){
		 
		this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_ID, theIndex:index ,  newValue: e.target.value});
	}
	
	changeCallbizDateTime(index,e){
		 
		this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_DATETIME, theIndex:index ,  newValue: e.target.value});
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
		if(this.missingEditCallbizDate || this.missingEditCallbizDetails){
			 this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בעדכון קריאה', content: 'יש למלא את כל שדות החובה'});
		}
		else{
			this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.callbiz'});
			CrmActions.editCallbizRow(this.props.dispatch , this.props.router , this.props.callBizList[this.props.callBizEditIndex].callBizIdentifierKey , this.props.router.params.reqKey , this.props.callBizList[this.props.callBizEditIndex].callBizCenterKey ,this.props.callBizList[this.props.callBizEditIndex].callBizCenterDate , this.props.callBizList[this.props.callBizEditIndex].callBizCenterDetails );
		}
	}
	
	/*delete  row - general function */
	deleteRow(e){
		if(this.props.modalHeaderText == 'מחיקת callbiz'){
	        this.deleteCallbizRow();
		}
		else if(this.props.modalHeaderText == 'מחיקת מסמך'){
	        this.deleteDocumentRow();
		}
	}
	
	/*delete callbiz row - set deleted = 1*/
	deleteCallbizRow(){
		this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.CLOSE_CONFIRM_DIALOG 
        });
		CrmActions.deleteCallbizRow(this.props.dispatch , this.props.router , this.props.callBizList[this.props.callBizDeleteIndex].callBizIdentifierKey , this.props.router.params.reqKey);
	}
	
	/*delete document row */
	deleteDocumentRow(){
		 this.props.dispatch({
             type: CrmActions.ActionTypes.REQUEST.CLOSE_CONFIRM_DIALOG 
         });

		  GlobalActions.deleteEntityDocument(this.props.dispatch , 1  , this.props.router.params.reqKey , this.props.documentList[this.props.documentDeleteIndex].key);
	}
	

	confirmDeleteDocument(index , e){
		  this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.OPEN_CONFIRM_DIALOG , rowIndex:index , header:'מחיקת מסמך' , actionType:'doc'
        });
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
	
	closeAddNewDocument(){
		this.props.dispatch({
            type: GlobalActions.ActionTypes.DOCUMENT.HIDE_ADD_DOCUMENT_TO_REQUEST_SCREEN 
        });
	}
	
	
	showAddNewDocumentScreen(){
		this.props.dispatch({
            type: GlobalActions.ActionTypes.DOCUMENT.SHOW_ADD_DOCUMENT_TO_REQUEST_SCREEN 
        });
	}
	
	newCallbizIDChange(e){
		this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_ID_CHANGE  , newValue:e.target.value
        });
	}
	
	newCallbizDatetimeChange(e){
		this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_DATETIME_CHANGE  , newValue:e.target.value
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
		if(this.missingCallbizDatetime || this.missingCallbizDetails){
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
	
	/*add new document record*/
	addNewDocument(){
		/*if(this.missingCallbizDatetime || this.missingCallbizDetails){
			 this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בהוספת קריאה', content: 'יש למלא את כל שדות החובה'});
		}
		else{
		      CrmActions.addCallbizRow(this.props.dispatch , this.props.router , this.props.router.params.reqKey , this.props.newCallbizDetails.ID , this.props.newCallbizDetails.datetime , this.props.newCallbizDetails.details );
		}
		*/
		console.log("ADD NEW DOCUMENT");
	}
	
	disableEditing(rowIndex) {
	   this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CHANGE_EDIT_ACTION_ROW_FIELD,
                             rowIndex , rowKey:'actionTypeName' , newValue:this.editOperationTypeName});
	   this.changeOperationEditRowTopicsList('');
	   this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CHANGE_EDIT_ACTION_ROW_FIELD,
                             rowIndex , rowKey:'actionTopicName' , newValue:this.editOperationTopicName});
       this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CHANGE_EDIT_ACTION_ROW_FIELD,
                             rowIndex , rowKey:'operationDetails' , newValue:this.editOperationDetails});
	   this.changeOperationEditRowTopicsList('');
	   this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CHANGE_EDIT_ACTION_ROW_FIELD,
                             rowIndex , rowKey:'operationWithWho' , newValue:this.editOperationWithWho});
	   this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_REQUEST_ACTION_EDITING,
                             actionIndex: rowIndex , isEditing:false});
		this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.actions'});
	  
    }

    enableEditing(rowIndex) {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_REQUEST_ACTION_EDITING,
                             actionIndex: rowIndex , isEditing:true });
		this.changeOperationEditRowTopicsList(this.props.operationList[rowIndex].actionTypeName);
		this.editOperationTypeName = this.props.operationList[rowIndex].actionTypeName;
		this.editOperationTopicName = this.props.operationList[rowIndex].actionTopicName;
		this.editOperationStatusName = this.props.operationList[rowIndex].actionStatusName;
		this.editOperationDirectionName = this.props.operationList[rowIndex].actionConversationDirectionName;
		this.editOperationDetails = this.props.operationList[rowIndex].operationDetails;
		this.editOperationWithWho = this.props.operationList[rowIndex].operationWithWho;
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.actions'});
		 
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
	
	editAction(rowIndex){
		if (this.getActionTypeParam(this.props.operationList[rowIndex].actionTypeName, 'id') <= 0 || this.getActionTopicID(this.props.operationList[rowIndex].actionTopicName) <= 0 || this.getActionStatusID(this.props.operationList[rowIndex].actionStatusName) <= 0 || this.props.operationList[rowIndex].operationDetails.length <=0) {
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בעריכת פעולה', content: 'יש למלא את כל שדות החובה בצורה תקינה'});
        }
		else{
			let changedDataCounter = 0;
			let objData = {};
			if(this.editOperationTypeName != this.props.operationList[rowIndex].actionTypeName){
				changedDataCounter ++;
				objData.action_type = this.getActionTypeParam(this.props.operationList[rowIndex].actionTypeName, 'id');
			}
			if(this.editOperationTopicName != this.props.operationList[rowIndex].actionTopicName){
				changedDataCounter ++;
				objData.action_topic_id = this.getActionTopicID(this.props.operationList[rowIndex].actionTopicName);
			}
			if(this.editOperationStatusName != this.props.operationList[rowIndex].actionStatusName){
				changedDataCounter ++;
				objData.action_status_id = this.getActionStatusID(this.props.operationList[rowIndex].actionStatusName);
			}
			if(this.editOperationDirectionName != this.props.operationList[rowIndex].actionConversationDirectionName){
				changedDataCounter ++;
				objData.conversation_direction = this.getActionDirectionID(this.props.operationList[rowIndex].actionConversationDirectionName);
			}
			if(this.editOperationDetails != this.props.operationList[rowIndex].operationDetails){
				changedDataCounter ++;
				objData.description = this.props.operationList[rowIndex].operationDetails;
			}
			if(this.editOperationWithWho != this.props.operationList[rowIndex].operationWithWho){
				changedDataCounter ++;
				objData.conversation_with_other = this.props.operationList[rowIndex].operationWithWho;
			}
			if(changedDataCounter == 0){
				this.disableEditing(rowIndex);
			}
			else{
				this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.actions'});
				CrmActions.editAction(this.props.dispatch , this.props.router.params.reqKey ,  this.props.operationList[rowIndex].key , objData , rowIndex);
			}
		}
	}
	
    assemblyRequestDetailTabTBODY() {

        let self = this;

        if (true == this.props.activeRequestDetailTab.operation) {

            /**
             *
             */
			let hasEdits = false; 
			   if(this.props.operationList != undefined){
			   for(let i = 0 , len = this.props.operationList.length ; i<len ; i++){
                   if(this.props.operationList[i].user_key == this.props.currentUser.key){
                       hasEdits = true;
                       break;
                   }
			   }
		    }

            this.operationTRlist = this.props.operationList.map(function (reqOperation, i) {
                let editItem =  '\u00A0';
				
				if(self.props.currentUser.key == reqOperation.user_key){
					if(reqOperation.is_editing){
						editItem = <div>
						                 <button className="btn btn-success btn-xs"
                                 onClick={self.editAction.bind(self , i)}>
                            <i className="fa fa-floppy-o"/>
                                        </button>
                                        {'\u00A0'}
                                        <button className="btn btn-danger btn-xs"
                                onClick={self.disableEditing.bind (self , i)}>
                            <i className="fa fa-times"/>
                                        </button>
						          </div>;
					}
					else{
                    if(self.props.editOperationIndex == -1){						
					editItem = <div>
					   <button type="button" className="btn btn-success btn-xs"
                             onClick={self.enableEditing.bind(self , i)} >
                        <i className="fa fa-pencil-square-o"/>
                       </button>
                       {'\u00A0'}
                       <button type="button" className="btn btn-danger btn-xs"
                             onClick={self.showDeleteModalDialog.bind(self , i)}>
                        <i className="fa fa-trash-o"/>
                       </button>
					</div>;
					}
					}
					;
					
				}
				let editTdItem =  null;
				if(!self.props.addingNewAction && self.props.operationList.length > 1 && hasEdits){
						editTdItem = <td style={self.trPKActions}>
					    {editItem}
					</td>;
					}
					if(reqOperation.is_editing){
						//console.log(reqOperation);
						return <tr id={i} key={i} style={self.trBodyStyle}>
                    <td style={self.trPKActions}><Combo items={self.props.actionTypesList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={reqOperation.actionTypeName} onChange={self.changeOperationRowItem.bind(self , i , 'actionTypeName' , true)} inputStyle={{borderColor:(self.getActionTypeParam(reqOperation.actionTypeName, 'id') <= 0? '#ff0000' : '#ccc')}}  /></td>
                    <td style={self.trPKActions}><Combo items={self.props.actionTopicsList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={reqOperation.actionTopicName} onChange={self.changeOperationRowItem.bind(self , i , 'actionTopicName' , false )}  inputStyle={{borderColor:((self.getActionTopicID(reqOperation.actionTopicName) <=0)? '#ff0000' : '#ccc')}} /></td>
                    <td style={self.trPKActions}><Combo items={self.props.actionStatusesList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={reqOperation.actionStatusName} onChange={self.changeOperationRowItem.bind(self , i , 'actionStatusName' , false)} inputStyle={{borderColor:((self.getActionStatusID(reqOperation.actionStatusName) <= 0)?'#ff0000':'#ccc')}} /></td>
                    <td style={self.trPKActions}><Combo items={self.props.directions} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={reqOperation.actionConversationDirectionName} onChange={self.changeOperationRowItem.bind(self , i , 'actionConversationDirectionName' , false)} /></td>
                    <td style={self.trPKActions}>{reqOperation.first_name + ' ' + reqOperation.last_name}</td>
                    <td style={self.trPKActions}>{dateTimeReversePrint(reqOperation.operationDate,true)}</td>
                    <td style={self.trPKActions}><textarea className="form-control form-control-sm" value={"" + reqOperation.operationDetails} onChange={self.changeOperationRowItem.bind(self , i , 'operationDetails' , false)} style={{borderColor:((reqOperation.operationDetails.length < 1) ? '#ff0000' : '#ccc')}} ></textarea></td>
                    <td style={self.trPKActions}><input type="text" className="form-control form-control-sm"  value={"" + reqOperation.operationWithWho} onChange={self.changeOperationRowItem.bind(self , i , 'operationWithWho' , false)} /></td>{editTdItem}</tr>;
					}
					else{
                return <tr id={i} key={i} style={self.trBodyStyle}>
                    <td style={self.trPKActions}>{reqOperation.actionTypeName}</td>
                    <td style={self.trPKActions}>{reqOperation.actionTopicName}</td>
                    <td style={self.trPKActions}>{self.getOperationStatusName(reqOperation.operationStatus)}</td>
                    <td style={self.trPKActions}>{self.getOperationDirectionName(reqOperation.operationCompass)}</td>
                    <td style={self.trPKActions}>{reqOperation.first_name + ' ' + reqOperation.last_name}</td>
                    <td style={self.trPKActions}>{dateTimeReversePrint(reqOperation.operationDate,true)}</td>
                    <td style={self.trPKActions}>{reqOperation.operationDetails}</td>
                    <td style={self.trPKActions}>{reqOperation.operationWithWho}</td>{editTdItem}</tr>;
					}
            });
			 let len = this.operationTRlist.length;
             if (len > 0) {
                len = 1 + len;
             }
			  this.operationTRlist[len] = <tr id={len} key={len} style={{display: ((this.props.addingNewAction == true && self.props.router.params.reqKey != undefined) ? 'block' : 'none' )}}>
                    <td style={self.trPKActions}>
                         <Combo items={this.props.actionTypesList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={this.props.newActionDetails.action_type} onChange={this.newActionTypeChange.bind(this)} inputStyle={this.validatorsStyle.actionTypeStyle}/>
                    </td>
                    <td style={self.trPKActions}>
					     <Combo items={this.props.actionTopicsList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={this.props.newActionDetails.action_topic} onChange={this.newActionTopicChange.bind(this)} inputStyle={this.validatorsStyle.actionTopicStyle}/>
                    </td>
                    <td style={self.trPKActions}>
					     <Combo items={this.props.actionStatusesList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={this.props.newActionDetails.action_status} onChange={this.newActionStatusChange.bind(this)} inputStyle={this.validatorsStyle.actionTopicStatus}/>
                    </td>
                    <td style={self.trPKActions}>
				         <Combo items={this.props.directions} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={this.props.newActionDetails.action_direction} onChange={this.newActionDirectionChange.bind(this)}/>
                    </td>
					<td style={self.trPKActions}>{self.props.currentUser.first_name + ' ' + self.props.currentUser.last_name}</td>
                    <td style={self.trPKActions}>
				         <input type="text" className="form-control form-control-sm" id="input002" aria-describedby="ariaDesc002" style={this.validatorsStyle.targetDateStyle} value={"" + this.props.newActionDetails.target_date} onChange={this.newTargetDateChange.bind(this)}/>
                    </td>
                    <td style={self.trPKActions}>
					<textarea className="form-control form-control-sm" value={"" + this.props.newActionDetails.details} onChange={this.newDetailsChange.bind(this)} style={this.validatorsStyle.detailsStyle}></textarea>
                    </td>
                    <td style={self.trPKActions}>
				         <input type="text" className="form-control form-control-sm" id="input003" aria-describedby="ariaDesc002" value={"" + this.props.newActionDetails.conversationWith} onChange={this.newConversationWithChange.bind(this)}/>
                 
					     <span className="glyphicon glyphicon-ok" style={{
                        paddingLeft: '13px',
                        color: 'green',
                        fontSize: '20px',
                        cursor: 'pointer'
                    }} onClick={this.addNewAction.bind(this)}/>
                        <span className="glyphicon glyphicon-remove" style={{
                            paddingLeft: '3px',
                            color: 'red',
                            fontSize: '20px',
                            cursor: 'pointer'
                        }} onClick={this.closeAddingActionDialog.bind(this)}/>

					</td></tr>; 
			
         
            return self.requestDetailTabTBODY = <tbody ref="scrollTableBodyAction" style={self.tbodyStyle}>{self.operationTRlist}</tbody>;
        }

        if (true == this.props.activeRequestDetailTab.history) {
			 
            /**
             *
             */
            this.historyTRlist = this.props.historyList.map(function (reqHistory, i) {
                return <tr id={i} key={i} style={self.trBodyStyle}>
                    <td style={self.tdPKHistory}>{dateTimeReversePrint(reqHistory.historyUpdateDate,true)}</td>
                    <td style={self.tdPKHistory}>{reqHistory.first_name + ' ' + reqHistory.last_name}</td>
                    <td style={self.tdPKHistory}>{reqHistory.display_field_name}</td>
                    <td style={reqHistory.display_field_name=='תיאור'?self.tdPKHistoryRight:self.tdPKHistory}>{reqHistory.new_value}</td>
                    <td style={reqHistory.display_field_name=='תיאור'?self.tdPKHistoryRight:self.tdPKHistory}>{reqHistory.old_value}</td>
                </tr>;
            });

            return this.requestDetailTabTBODY = <tbody ref="scrollTableBody" style={this.tbodyStyle}>{this.historyTRlist}</tbody>;
        }

        if (true == this.props.activeRequestDetailTab.callBiz) {
            /**
             *
             */
            this.callBizTRlist = this.props.callBizList.map(function (reqCallBiz, i) {
			 
			 
			//self.props.callBizList[i].callBizCenterDate = dateTimeReversePrint(reqCallBiz.callBizCenterDate , true);
				 
             if(!reqCallBiz.is_editing){
				let editMenuItem = '';
				if(self.props.editingCallbizRow == false && self.props.addingNewCallbiz == false){
					let editRow = '';
					let deleteRow = '';
					if(self.props.originalDataRequest.status_name != 'הסתיים טיפול' && self.props.originalDataRequest.status_name != 'פניית סרק'){
					if (self.props.currentUser.admin || self.props.currentUser.permissions['crm.requests.callbiz.edit']){
					    editRow = <span  className="glyphicon glyphicon-pencil pull-left" style={{paddingLeft: '3px'}} onClick={self.setRowEditing.bind(self , i)}/>;	
					}
					if (self.props.currentUser.admin || self.props.currentUser.permissions['crm.requests.callbiz.delete']){
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
                    <td style={self.tdStyle}><input type='text' value={reqCallBiz.callBizCenterKey} className="form-control form-control-sm" onChange={self.changeCallbizID.bind(self , i )} /></td>
                    <td style={self.tdStyle}><input type='text' value={reqCallBiz.callBizCenterDate} style={self.callbizValidatorsStyle.editDateStyle} className="form-control form-control-sm" onChange={self.changeCallbizDateTime.bind(self,i)} /></td>
                    <td style={self.tdStyle}><textarea    type='text' value={reqCallBiz.callBizCenterDetails} style={self.callbizValidatorsStyle.editDetailsStyle} className="form-control form-control-sm" onChange={self.changeCallbizDetails.bind(self,i)}></textarea> <span className="glyphicon glyphicon-remove pull-left" style={{paddingLeft: '3px' , color:'red' , fontSize:'20px'}} onClick={self.undoEditCallbiz.bind(self , i )}/> <span  className="glyphicon glyphicon-ok pull-left" style={{paddingLeft: '3px', color:'green' , fontSize:'20px'}} onClick={self.saveCallbiz.bind(self , i )} />
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
                    <td style={self.tdStyle}><input type='text' value={this.props.newCallbizDetails.ID} onChange={this.newCallbizIDChange.bind(this)} className="form-control form-control-sm"  /></td>
                    <td style={self.tdStyle}><input type='text' value={this.props.newCallbizDetails.datetime} onChange={this.newCallbizDatetimeChange.bind(this)} className="form-control form-control-sm" style={this.callbizValidatorsStyle.datetimeStyle} /></td>
                    <td style={self.tdStyle}><textarea type='text' value={this.props.newCallbizDetails.details} onChange={this.newCallbizDetailsChange.bind(this)} className="form-control form-control-sm" style={this.callbizValidatorsStyle.detailsStyle}  ></textarea> <span className="glyphicon glyphicon-remove pull-left" style={{paddingLeft: '3px' , color:'red' , fontSize:'20px' , cursor:'pointer'}} onClick={this.closeAddNewBizcall.bind(this)} /> <span  className="glyphicon glyphicon-ok pull-left" style={{paddingLeft: '3px', color:'green' , fontSize:'20px' , cursor:'pointer'}} onClick={this.addNewCallBiz.bind(this)}  />
                    </td>
                </tr>; 
			 }
             }

            return this.requestDetailTabTBODY = <tbody ref="scrollTableBody" style={this.tbodyStyle}>{this.callBizTRlist}</tbody>;
        }

        if (true == this.props.activeRequestDetailTab.message) {
               return this.requestDetailTabTBODY = <Messages list={this.props.messagesList} messageContentShow={(this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.messages'])?true:false} />;	 
        }

         

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
		
		
		if(this.props.editingCallbizRow == true){
			
			let theDate = this.props.callBizList[this.props.callBizEditIndex].callBizCenterDate.trim();
		    
		   if(!(theDate.length == 19 || theDate.length == 17 || theDate.length == 14 || theDate.length == 16 || theDate.length == 10 || theDate.length == 8)){
			   this.callbizValidatorsStyle.editDateStyle = {borderColor: '#ff0000'};
               this.missingEditCallbizDate = true;
		   }
		   else{
			   this.callbizValidatorsStyle.editDateStyle = {borderColor: '#cccccc'};
               this.missingEditCallbizDate = false;
		   }
		   
		   if(this.props.callBizList[this.props.callBizEditIndex].callBizCenterDetails.trim() == ''){
			   this.callbizValidatorsStyle.editDetailsStyle = {borderColor: '#ff0000'};
               this.missingEditCallbizDetails = true;
		   }
		   else{
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
	
    render() {

		if(this.props.activeRequestDetailTab.document){

			if(this.props.router.params.reqKey != undefined &&
               (this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.documents'] == true)){
                return <Documents display={true}
                                  entity_key={this.props.router.params.reqKey}
                                  entity_type={1}
                                  documents={this.props.documentList}
                                  requestStatusNotForEdit={this.props.statusNotForEdit}
                                  hasRequestAdminEdit={this.props.hasAdminEdit}
                />;
			}
			else{
				return <div>{'\u00A0'}</div>;
			}
		}
		else{
        this.validatorStyleIgnitor();
		this.callbizValidatorStyleIgnitor();
        this.assemblyRequestDetailTabTHEAD();
        this.assemblyRequestDetailTabTBODY();

        let addNewItem = '';

         
	 
	  let labelItem = '';
	  let buttonItem = '';
	  if (true == this.props.activeRequestDetailTab.operation) {
		 labelItem = 'פעולות';
		 if(this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.actions.add'])
		 {
			 
             buttonItem = <button type="submit" disabled={this.props.editOperationIndex > 0 || this.props.addingNewAction || this.props.originalDataRequest.status_name == 'הסתיים טיפול' || this.props.originalDataRequest.status_name == 'פניית סרק'} className="btn btn-primary btn-lg" style={this.addButtonStyle} onClick={this.showAddNewActionScreen.bind(this)}><div style={this.innerButtonText}> + פעולה חדשה</div></button>;	
			 		
		}			 
	  }
	  else if (true == this.props.activeRequestDetailTab.history) {
		 labelItem = 'היסטוריה'; 
		 buttonItem = '';
	  }
	  else if (true == this.props.activeRequestDetailTab.callBiz) {
		 labelItem = 'callbiz';
         if(this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.callbiz.add'])
		 {		 
		 buttonItem = <button type="submit" disabled={this.props.originalDataRequest.status_name == 'הסתיים טיפול' || this.props.originalDataRequest.status_name == 'פניית סרק'}  className="btn btn-primary btn-lg" style={this.addButtonStyle} onClick={this.showAddNewCallbizScreen.bind(this)}><div style={this.innerButtonText}> + callbiz חדש</div></button>;	
	     }
	  }
	  else  if (true == this.props.activeRequestDetailTab.message) {
		  labelItem = 'הודעות'; 
		  buttonItem = '';
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
        documentList: state.global.documents.documents,
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
		documentDeleteIndex:state.crm.searchRequestsScreen.documentDeleteIndex,
		documentEditIndex:state.crm.searchRequestsScreen.documentEditIndex,
		addingNewCallbiz:state.crm.searchRequestsScreen.addingNewCallbiz,
		messagesList: state.global.messages_screen.messagesList,
		globalHeaderText:state.global.globalHeaderText,
		globalContentText:state.global.globalContentText,
		showGlobalDialog : state.global.showGlobalDialog,
		editingDocumentRow: state.global.documents.editingDocumentRow,
		addingNewDocument:state.global.documents.addingNewDocument,
		currentUser:state.system.currentUser,
		scrollbarWidth : state.system.scrollbarWidth ,
		voterDetails: state.voters.voterDetails,
		originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,

    }
}

export default connect(mapStateToProps)(withRouter(RequestDetailsTab));
