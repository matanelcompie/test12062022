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
import constants from '../../../libs/constants';
import {dateTimeReversePrint , parseDateToPicker, parseDateFromPicker} from '../../../libs/globalFunctions';
import ReactWidgets from 'react-widgets';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import moment from 'moment';
import ModelUpdateCloseDateRequest from './ModelUpdateCloseDateRequest'
class RequestDetailsActions extends React.Component {
  
    constructor(props) {
        super(props);
        this.styleIgniter();
		this.modalConfirmText = "האם אתה בטוח ?";
		momentLocalizer(moment);
        this.state= {
            'openModalUpdateEndDate':null
        }
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
 
    assemblyRequestDetailTabTHEAD() {

        
			   let hasEdits = false; 
			   if(this.props.operationList != undefined){
			   for(let i = 0 , len = this.props.operationList.length ; i<len ; i++){
                   if(this.props.operationList[i].user_key == this.props.currentUser.key){
                       hasEdits = true;
                       break;
                   }
			   }
			   }
			   let editItemCol = null;
			   if(this.props.operationList != undefined && !this.props.addingNewAction && this.props.operationList.length > 1 && hasEdits){
				   editItemCol=<th style={this.thPKActions}></th>;
			   }
			   
			    if(this.refs.scrollTableBodyAction != undefined && this.refs.scrollTableBodyAction.scrollHeight > this.refs.scrollTableBodyAction.clientHeight){
					return this.requestDetailTabTHEAD =
                            <thead>
                                <tr>
                                    <th style={this.thPKActions}>סוג</th>
                                    <th style={this.thPKActions}>נושא</th>
                                    <th style={{width:'10%'}}>מצב</th>
                                    <th style={{width:'7%'}}>כיוון</th>
                                    <th style={{width:'10%'}}>משתמש</th>
                                    <th style={{width:'23%'}}>מועד</th>
                                    <th style={this.thPKActions}>פירוט</th>
                                    <th style={this.thPKActions}>פירוט נוסף</th>
                                    <th style={this.thPKActions}>עם מי</th>{editItemCol}
                                    <th style={{width:this.props.scrollbarWidth+'px' , borderRight:'0px'}}></th>
                                </tr>
                            </thead>;
                        }
				else{
			   
                    return this.requestDetailTabTHEAD =
                            <thead>
                                <tr>
                                    <th style={this.thPKActions}>סוג</th>
                                    <th style={this.thPKActions}>נושא</th>
                                    <th style={{width:'10%'}}>מצב</th>
                                    <th style={{width:'7%'}}>כיוון</th>
                                    <th style={{width:'10%'}}>משתמש</th>
                                    <th style={{width:'23%'}}>מועד</th>
                                    <th style={this.thPKActions}>פירוט</th>
                                    <th style={this.thPKActions}>פירוט נוסף</th>
                                    <th style={this.thPKActions}>עם מי</th>{editItemCol}
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
                return 'נכנסת';
                break;
            case 1 :
                return 'יוצאת';
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
	
	setDefaultActionsFieldsValues() {

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
			

            const newActionFields={
                'conversation_with_other':this.props.newActionDetails.conversationWith,
                'action_type': this.getActionTypeParam(this.props.newActionDetails.action_type, 'id'),
                'action_topic_id':   this.getActionTopicID(this.props.newActionDetails.action_topic),
                'conversation_direction': this.getActionDirectionID(this.props.newActionDetails.action_direction),
                'action_date': formatteTargetDateForAPI,
                'description': this.props.newActionDetails.details,
                'action_status_id': this.getActionStatusID(this.props.newActionDetails.action_status)
            }
           
            CrmActions.addNewAction(this.props.dispatch, this.props.router.params.reqKey,newActionFields).then((res)=>{
                if(res){
                    this.openAndCloseModelUpdateEndDateRequest(true);
                }
                this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.actions'});  
            }) 
         
               
	   }
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

    newTargetDateChange(value, format, filter) {
		let formattedValue = value.split(' ');
		let formattedValueDateOnly = formattedValue[0].split('-');
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_OPERATION_DATE_CHANGED, newValue: (formattedValueDateOnly[2] + '/' + formattedValueDateOnly[1] + '/' + formattedValueDateOnly[0] + ' ' + formattedValue[1]+':00')});
    }

	setRowEditing(index){
	 this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_EDITING, theIndex:index ,  newValue: !this.props.callBizList[index].is_editing});
	 this.oldBizID = this.props.callBizList[index].callBizCenterKey;
	 this.oldBizDateTime=this.props.callBizList[index].callBizCenterDate;
	 this.oldBizDetails=this.props.callBizList[index].callBizCenterDetails;
	  this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.callbiz'});
	}
	
	deleteRow(e){
	        this.deleteCallbizRow();	 
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


   /*     this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_REQUEST_ACTION_EDITING,
                             actionIndex: rowIndex , isEditing:true });
		this.changeOperationEditRowTopicsList(this.props.operationList[rowIndex].actionTypeName);
		this.editOperationTypeName = this.props.operationList[rowIndex].actionTypeName;
		this.editOperationTopicName = this.props.operationList[rowIndex].actionTopicName;
		this.editOperationStatusName = this.props.operationList[rowIndex].actionStatusName;
		this.editOperationDirectionName = this.props.operationList[rowIndex].actionConversationDirectionName;
		this.editOperationDetails = this.props.operationList[rowIndex].operationDetails;
		this.editOperationWithWho = this.props.operationList[rowIndex].operationWithWho;
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.actions'});*/
		 
    }

    getRequestActionItemTopics(actionTypeId) {
        let actionTopicsList = this.props.actionTopicsList;
        let itemTopicsList = [];

        itemTopicsList = actionTopicsList.filter(topicItem => topicItem.action_type_id == actionTypeId);

        return itemTopicsList;
    }

    showEditActionModalDialog(reqOperation) {

        var actionModalHeader = "עריכת פעולה עבור פניה ";
        var actionData = {};
        var topic_list = this.getRequestActionItemTopics(reqOperation.action_type);

        actionModalHeader += this.props.router.params.reqKey;

        actionData = {
            key: reqOperation.key,
            action_type: reqOperation.actionTypeName,
            action_topic: reqOperation.actionTopicName,
            action_status: reqOperation.actionStatusName,
            action_direction: reqOperation.actionConversationDirectionName,
            action_date: reqOperation.action_date,
            description: reqOperation.operationDetails,
            conversation_with_other: reqOperation.operationWithWho,
            action_type_id: reqOperation.action_type,
            action_topic_id: reqOperation.action_topic_id,
            action_status_id: reqOperation.operationStatus,
            conversation_direction: reqOperation.conversation_direction
        };


        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.SHOW_MODAL_DIALOG, actionModalHeader: actionModalHeader,
                             actionData: actionData, entityActionTopicsList: topic_list});
    }

    showNewActionModalDialog(){

    var actionModalHeader = "יצירת פעולה עבור פניה ";
    var actionData = {};
    var actionDate = "";

    actionModalHeader += this.props.router.params.reqKey;

    actionDate = parseDateToPicker(new Date()); // Current data and time
    actionDate = moment(actionDate).format('YYYY-MM-DD HH:mm:ss');

    actionData = {
        key: null,
        action_type: '',
        action_topic: '',
        action_status: '',
        action_direction: '',
        action_date: actionDate,
        description: '',
        conversation_with_other: '',
        action_type_id: 0,
        action_topic_id: 0,
        action_status_id: 0,
        conversation_direction: null
    };

    this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.SHOW_MODAL_DIALOG, actionModalHeader: actionModalHeader,
                     actionData: actionData, entityActionTopicsList: []});
         
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
                // console.log('reqOperation', reqOperation)
                let editItem =  '\u00A0';

				if(self.props.currentUser.key == reqOperation.user_key && isEditPermission && reqOperation.canEditAction){
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
					else {
                        let allowEditAction = false;
                        let allowDeleteAction = false;


                        if ( !self.props.statusNotForEdit &&
                             (self.props.currentUser.admin || self.props.currentUser.permissions['crm.requests.actions.edit']) ) {
                            allowEditAction = true;
                        }

                        if ( !self.props.statusNotForEdit &&
                             (self.props.currentUser.admin || self.props.currentUser.permissions['crm.requests.actions.delete']) ) {
                            allowDeleteAction = true;
                        }
                        if(self.props.editOperationIndex == -1 && isEditPermission){
					         if ( allowEditAction && allowDeleteAction ) {
                                 editItem = <div>
                                     <button type="button" className="btn btn-success btn-xs"
                                             onClick={self.showEditActionModalDialog.bind(self , reqOperation)}>
                                         <i className="fa fa-pencil-square-o"/>
                                     </button>
                                     {'\u00A0'}
                                     <button type="button" className="btn btn-danger btn-xs"
                                             onClick={self.showDeleteModalDialog.bind(self , i)}>
                                         <i className="fa fa-trash-o"/>
                                     </button>
                                 </div>;
                             } else if ( allowEditAction ) {
                                 editItem = <div>
                                     <button type="button" className="btn btn-success btn-xs"
                                             onClick={self.showEditActionModalDialog.bind(self , reqOperation)}>
                                         <i className="fa fa-pencil-square-o"/>
                                     </button>
                                     </div>;
                             } else if ( allowDeleteAction) {
                                 editItem = <div>
                                 <button type="button" className="btn btn-danger btn-xs"
                                         onClick={self.showDeleteModalDialog.bind(self , i)}>
                                     <i className="fa fa-trash-o"/>
                                 </button>
                                 </div>;
                             }
					    }
					}
					
				}
                let editTdItem =  null;
                
				if(!self.props.addingNewAction && self.props.operationList.length > 1 && hasEdits){
						editTdItem = <td style={self.trPKActions}>
					    {editItem}
					</td>;
					}
					if(reqOperation.is_editing){
						return <tr id={i} key={i} style={self.trBodyStyle}>
                    <td style={self.trPKActions}><Combo items={self.props.actionTypesList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={reqOperation.actionTypeName} onChange={self.changeOperationRowItem.bind(self , i , 'actionTypeName' , true)} inputStyle={{borderColor:(self.getActionTypeParam(reqOperation.actionTypeName, 'id') <= 0? '#ff0000' : '#ccc')}}  /></td>
                    <td style={self.trPKActions}><Combo items={self.props.actionTopicsList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={reqOperation.actionTopicName} onChange={self.changeOperationRowItem.bind(self , i , 'actionTopicName' , false )}  inputStyle={{borderColor:((self.getActionTopicID(reqOperation.actionTopicName) <=0)? '#ff0000' : '#ccc')}} /></td>
                    <td style={{width:'10%'}}><Combo items={self.props.actionStatusesList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={reqOperation.actionStatusName} onChange={self.changeOperationRowItem.bind(self , i , 'actionStatusName' , false)} inputStyle={{borderColor:((self.getActionStatusID(reqOperation.actionStatusName) <= 0)?'#ff0000':'#ccc')}} /></td>
                    <td style={{width:'7%'}}><Combo items={self.props.directions} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={reqOperation.actionConversationDirectionName} onChange={self.changeOperationRowItem.bind(self , i , 'actionConversationDirectionName' , false)} /></td>
                    <td style={{width:'10%'}}>{reqOperation.first_name + ' ' + reqOperation.last_name}</td>
                    <td style={{width:'23%'}}>{dateTimeReversePrint(reqOperation.operationDate,true)}</td>
                    <td style={self.trPKActions}><textarea className="form-control form-control-sm" value={"" + reqOperation.operationDetails == undefined ? '' : reqOperation.operationDetails} onChange={self.changeOperationRowItem.bind(self , i , 'operationDetails' , false)} style={{borderColor:((reqOperation.operationDetails.length < 1) ? '#ff0000' : '#ccc')}} ></textarea></td>
                    <td style={self.trPKActions}><input type="text" className="form-control form-control-sm"  value={"" + reqOperation.operationWithWho == undefined ? '' : reqOperation.operationWithWho} onChange={self.changeOperationRowItem.bind(self , i , 'operationWithWho' , false)} /></td>{editTdItem}</tr>;
					}
					else{
                return <tr id={i} key={i} style={self.trBodyStyle}>
                    <td style={self.trPKActions}>{reqOperation.actionTypeName}</td>
                    <td style={self.trPKActions}>{reqOperation.actionTopicName}</td>
                    <td style={{width:'10%'}}>{self.getOperationStatusName(reqOperation.operationStatus)}</td>
                    <td style={{width:'7%'}}>{self.getOperationDirectionName(reqOperation.operationCompass)}</td>
                    <td style={{width:'10%'}}>{reqOperation.first_name + ' ' + reqOperation.last_name}</td>
                    <td style={{width:'23%'}}>{dateTimeReversePrint(reqOperation.operationDate,true, true)}</td>
                    <td style={self.trPKActions}>{reqOperation.operationDetails}</td>
                    <td style={self.trPKActions}>{reqOperation.more_details? reqOperation.more_details.old_description : null}</td>
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
                    <td style={{width:'10%'}}>
					     <Combo items={this.props.actionStatusesList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={this.props.newActionDetails.action_status} onChange={this.newActionStatusChange.bind(this)} inputStyle={this.validatorsStyle.actionTopicStatus}/>
                    </td>
                    <td style={{width:'7%'}}>
				         <Combo items={this.props.directions} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={this.props.newActionDetails.action_direction} onChange={this.newActionDirectionChange.bind(this)}/>
                    </td>
					<td style={{width:'10%'}}>{self.props.currentUser.first_name + ' ' + self.props.currentUser.last_name}</td>
                    <td style={{width:'23%'}}>
				          
						 <ReactWidgets.DateTimePicker 
                                                        isRtl={true}
                                                        time={true}
                                                        value={parseDateToPicker(this.props.newActionDetails.target_date)}
                                                        onChange={parseDateFromPicker.bind(self, {callback: self.newTargetDateChange, format: "YYYY-MM-DD HH:mm", functionParams: ''})}
                                                        format="DD/MM/YYYY HH:mm"
                                                        
                                                    />
                    </td>
                    <td style={self.trPKActions}>
					<textarea className="form-control form-control-sm" value={"" + this.props.newActionDetails.details} onChange={this.newDetailsChange.bind(this)} style={this.validatorsStyle.detailsStyle}></textarea>
                    </td>
                    <td style={self.trPKActions}>
				         <input type="text" className="form-control form-control-sm" id="input001" aria-describedby="ariaDesc001" value={"" + this.props.newActionDetails.conversationWith == undefined ? '' : this.props.newActionDetails.conversationWith} onChange={this.newConversationWithChange.bind(this)}/>
                 
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
		   CrmActions.deleteAction(this.props.dispatch , this.props.router.params.reqKey ,this.props.operationList[this.props.deleteOperationIndex].key )
	}

    // editPermissionsInit(){

    //     var request_status_type_closed = constants.request_status_type_closed;        
    //     var request_status_type_canceled = constants.request_status_type_canceled;
    //     this.statusNotForEdit = true;
    //     this.userHasEditRequestPermissions = false;
    //     this.props.hasRequestEditingPermissions = false;
    //     this.hasAdminEdit = false;
        
    //     if (this.props.dataRequest.status_type_id == request_status_type_closed || this.props.dataRequest.status_type_id == request_status_type_canceled){
    //         this.statusNotForEdit = true;
    //     } else{
    //         this.statusNotForEdit = false; 
    //     }
    //     if (this.props.router.params.reqKey != 'new'){            
    //         if (this.props.dataRequest.reqKey != '' && this.props.dataRequest.reqKey != undefined){
    //             if (this.props.currentUser.admin == true || this.props.dataRequest.team_leader_id == this.props.currentUser.id || this.props.dataRequest.user_handler_id == this.props.currentUser.id ){                                        
    //                 this.userHasEditRequestPermissions = true;
    //             }else { 
    //                 this.userHasEditRequestPermissions = false;
    //             }
    //         } else{ 
    //             this.userHasEditRequestPermissions = true;
    //         }           
    //     } else{
    //         this.userHasEditRequestPermissions = true;
    //     }

    //     if ( this.statusNotForEdit == false && this.userHasEditRequestPermissions == true){
    //         this.props.hasRequestEditingPermissions = true;
    //     } else{
    //         this.props.hasRequestEditingPermissions = false;
    //     }
    //     if (!this.props.hasRequestEditingPermissions){
    //         this.noPermissionMessage = 'אין למשתמש הרשאה לעריכת הפניה';
    //     } else {
    //         this.noPermissionMessage = '';
    //     }

    //     if (this.props.currentUser.permissions['crm.requests.admin_edit'] || this.props.currentUser.admin == true){
    //         this.hasAdminEdit = true;
    //     } else{
    //         this.hasAdminEdit = false;
    //     }
    // }
    openAndCloseModelUpdateEndDateRequest=(flag=true)=>{
       this.setState({openModalUpdateEndDate:flag})
    }
	
    render() {

	//  this.editPermissionsInit();
      this.validatorStyleIgnitor();
      this.assemblyRequestDetailTabTHEAD();
      this.assemblyRequestDetailTabTBODY();
  
      let addNewItem = '';

         
	 
	  let labelItem = '';
	  let buttonItem = '';

	  if (true == this.props.activeRequestDetailTab.operation) {
		 labelItem = 'פעולות';

          if ( !this.props.statusNotForEdit && ( this.props.currentUser.admin ||
                  this.props.currentUser.permissions['crm.requests.actions.add'] ) ) {
              buttonItem = <button type="submit" disabled={this.props.editOperationIndex > 0 ||
              this.props.addingNewAction}
                                   className="btn btn-primary btn-lg" style={this.addButtonStyle}
                                   onClick={this.showNewActionModalDialog.bind(this)}>
                  <div style={this.innerButtonText}> + פעולה חדשה</div></button>;
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
                              buttonX={this.hideDeleteModalDialog.bind(this)}
                              title={'מחיקת פעולה'} style={{zIndex: '9001'}}>
                    <div>{this.modalConfirmText}</div>
                </ModalWindow>
               
                <ModelUpdateCloseDateRequest dataRequest={this.props.dataRequest} open={this.state.openModalUpdateEndDate} openAndCloseModelUpdateEndDateRequest={this.openAndCloseModelUpdateEndDateRequest.bind(this)}></ModelUpdateCloseDateRequest>
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
        dataRequest: state.crm.searchRequestsScreen.dataRequest,

    }
}

export default connect(mapStateToProps)(withRouter(RequestDetailsActions));
