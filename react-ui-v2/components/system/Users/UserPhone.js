import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import UserPhoneRow from './UserPhoneRow';
import * as SystemActions from '../../../actions/SystemActions';
import ModalWindow from '../../global/ModalWindow';

class UserPhone extends React.Component {

    constructor(props) {
        super(props);

        this.textIgniter();
    }

    componentWillMount() {
        SystemActions.loadPhoneTypes(this.props.dispatch);
    }
	
	// getPhoneTypeID(phoneTypeName){
	// 	let returnedValue = -1;
	// 	if(this.props.phoneTypes != undefined){
    //         for(let i =0 , len = this.props.phoneTypes.length; i<len;i++){
    //             if(this.props.phoneTypes[i].name == phoneTypeName){
    //                 returnedValue = this.props.phoneTypes[i].id;
    //                 break;
    //             }
    //         }
	// 	}
	// 	return returnedValue;
	// }

    textIgniter() {
        this.textValues={
            modalWindowTitle:'מחיקת טלפון',
            modalWindowBody:'האם אתה בטוח שאת/ה רוצה למחוק את הטלפון?'
        };

        this.lables={
            addPhone:'הוסף טלפון',
            noPhones:'למשתמש חייב להיות לפחות טלפון אחד',
        };
    }

    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_COUNTRIES});
    }
    
    deleteModalDialogConfirm(){
		this.props.dispatch({type: SystemActions.ActionTypes.USERS.DELETE_PHONE_FROM_TEMP_ARRAY , data:this.props.phoneIdInSelectMode});
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.USERS.TOGGLE_PHONE_DELETE_MODAL_DIALOG_DISPLAY , data:-1});
    }
    
    renderRows(){
		if(this.props.tableItems != undefined && (Array.isArray(this.props.selectedUserData.userPhones))){
        let minimizedPhones = this.props.selectedUserData.userPhones.slice(0,1);
        return (minimizedPhones.map(function(item , index){
                let isDuplicate=false;
                let currentPhoneNumber=item.phone_number.replace(/\D/g,'');
                minimizedPhones.map(function(item2 , index2){
                    if((currentPhoneNumber==item2.phone_number.replace(/\D/g,'')) && (index!=index2)){
                        isDuplicate=true;
                    }
                });
                return <UserPhoneRow key={item.id} item={item} rowIndex={index} isDuplicate={isDuplicate}></UserPhoneRow>;
            },this)
        );
		}
    }

    setAddingUserPhone(){
		this.props.dispatch({type: SystemActions.ActionTypes.USERS.SET_ADDING_NEW_PHONE});
		 
		 /*
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.users.phones' });
		*/
	}

    renderAddPhoneButton() {
        if (this.props.selectedUserData.userPhones != undefined && this.props.selectedUserData.userPhones.length > 0) return;
        else return (
           <a title={this.lables.addPhone} onClick={this.setAddingUserPhone.bind(this)} className={'cursor-pointer'+((this.props.addingNewUserPhone || this.props.isPhoneInEditMode)?' hidden':'')} >
                <span className="glyphicon glyphicon-earphone" aria-hidden="true" />{this.lables.addPhone}
            </a> 
        );
    }
    
    render() {
        return (
                <div className="row">
                    <div className="col-md-12">
                        <div className={"alert alert-danger" + ((this.props.selectedUserData.userPhones == undefined || this.props.selectedUserData.userPhones.length == 0)? '':' hidden')} 
                                role="alert"><strong>* </strong>{this.lables.noPhones}</div>
                        {this.renderRows()}
                        <ModalWindow show={this.props.showModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                        buttonCancel={this.closeModalDialog.bind(this)} buttonX={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle}>
                            <div>{this.textValues.modalWindowBody}</div>
                        </ModalWindow>
                        {this.renderAddPhoneButton()}
                    </div>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
		selectedUserData: state.system.selectedUserData,
        showModalDialog: state.system.userScreen.showPhoneDeleteModalDialog,
        phoneIdInSelectMode: state.system.userScreen.phoneIdInSelectMode,
        phoneTypes:state.system.phoneTypes ,
        addingNewUserPhone: state.system.userScreen.addingNewUserPhone,
        isPhoneInEditMode: state.system.userScreen.isPhoneInEditMode,
    };
}
export default connect(mapStateToProps)(withRouter(UserPhone));