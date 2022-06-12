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

class RequestDetailsHistory extends React.Component {

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
        this.trPK = {display: "table", width: "100%", tableLayout: "fixed", cursor: 'pointer',};
        this.thPK = {padding: '3px 8px', textAlign: 'center',};
        this.thPKActions = { textAlign: 'center',width:'12.5%'};
		this.trPKActions = {paddingBottom:'3px', textAlign: 'center',width:'12.5%' , wordWrap: 'break-word'};
        this.tdPK = {};
		this.thPKHistory ={ textAlign: 'center',width:'20%', wordWrap:'break-word' };
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

	         if(this.refs.scrollTableBodyHistory != undefined && this.refs.scrollTableBodyHistory.scrollHeight > this.refs.scrollTableBodyHistory.clientHeight){
				return this.requestDetailTabTHEAD =
                <thead style={this.theadPK}>
                <tr style={this.trPK}>
                    <th style={this.thPKHistory}>מועד עדכון</th>
                    <th style={this.thPKHistory}>משתמש</th>
                    <th style={this.thPKHistory}>שם שדה</th>
                    <th style={this.thPKHistory}>ערך חדש</th>
                    <th style={{width:'20%' , borderLeft:'0px' , textAlign:'center'} }>ערך קודם</th>
                    <th style={{width:this.props.scrollbarWidth+'px' , borderRight:'0px'}}></th>
                </tr>
                </thead>;
			 }
			 else{
	
            return this.requestDetailTabTHEAD =
                <thead style={this.theadPK}>
                <tr style={this.trPK}>
                    <th style={this.thPKHistory}>מועד עדכון</th>
                    <th style={this.thPKHistory}>משתמש</th>
                    <th style={this.thPKHistory}>שם שדה</th>
                    <th style={this.thPKHistory}>ערך חדש</th>
                    <th style={{width:'20%' , borderLeft:'0px' , textAlign:'center'} }>ערך קודם</th>
                    
                </tr>
                </thead>;
				
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
 
	showDeleteModalDialog(rowIndex) {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_DISPLAY_CONFIRM_ACTION_DELETE,
                             deleteIndex: rowIndex , isShow:true});
    }
	
	hideDeleteModalDialog() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_DISPLAY_CONFIRM_ACTION_DELETE,
                             deleteIndex: -1 , isShow:false});
    }
	
 
    assemblyRequestDetailTabTBODY() {

        let self = this;
 
            this.historyTRlist = this.props.historyList.map(function (reqHistory, i) {
                return <tr id={i} key={i} style={self.trBodyStyle}>
                    <td style={self.tdPKHistory}>{dateTimeReversePrint(reqHistory.historyUpdateDate,true)}</td>
                    <td style={self.tdPKHistory}>{reqHistory.first_name + ' ' + reqHistory.last_name}</td>
                    <td style={self.tdPKHistory}>{reqHistory.display_field_name}</td>
                    <td style={reqHistory.display_field_name=='תיאור'?self.tdPKHistoryRight:self.tdPKHistory}>{reqHistory.new_value ? reqHistory.new_value : reqHistory.new_numeric_value}</td>
                    <td style={reqHistory.display_field_name=='תיאור'?self.tdPKHistoryRight:self.tdPKHistory}>{reqHistory.old_value ? reqHistory.old_value : reqHistory.old_numeric_value}</td>
                </tr>;
            });

            return this.requestDetailTabTBODY = <tbody ref="scrollTableBodyHistory" style={this.tbodyStyle}>{this.historyTRlist}</tbody>;
        
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

		
        this.validatorStyleIgnitor();
		this.callbizValidatorStyleIgnitor();
        this.assemblyRequestDetailTabTHEAD();
        this.assemblyRequestDetailTabTBODY();

        let addNewItem = '';

         
	 
	  let labelItem = '';
	  let buttonItem = '';
	 
	  if (true == this.props.activeRequestDetailTab.history) {
		 labelItem = 'היסטוריה'; 
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

export default connect(mapStateToProps)(withRouter(RequestDetailsHistory));
