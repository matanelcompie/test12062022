import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../actions/SystemActions';
import Combo from '../../global/Combo';
import { validatePhoneNumber, checkKosherPhone } from '../../../libs/globalFunctions';

class UserPhoneRow extends React.Component {

    constructor(props) {
        super(props);

		this.textIgniter();
        this.styleIgniter();
	}

	textIgniter(){
		this.labels={
			type:'סוג:',
			number:'מספר:'
		};
	}

	styleIgniter(){
		this.glyphiconStyle={paddingTop:'10px'};
	}
	
    deleteRow() {
		let rowIndex = this.props.rowIndex;
        this.props.dispatch({type: SystemActions.ActionTypes.USERS.TOGGLE_PHONE_DELETE_MODAL_DIALOG_DISPLAY , data:rowIndex});
		
    }

    editRow() {
        let userPhoneID = this.props.item.id;
        let phoneTypeName = this.props.item.name;
		let phoneNumber = this.props.item.phone_number;
        this.props.dispatch({type: SystemActions.ActionTypes.USERS.USER_PHONE_EDIT_MODE_UPDATED, userPhoneID, phoneTypeName , phoneNumber});
    }

    updatePhoneNumber(e) {
		if(/^[0-9\-]*$/.test(e.target.value)){
        this.props.dispatch({type: SystemActions.ActionTypes.USERS.EXISTING_USER_PHONE_NUMBER_CHANGED, rowIndex:this.props.rowIndex , data:e.target.value});
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.users.phones' });
		}
    }

	updatePhoneType(e) {
		return;
        // this.props.dispatch({type: SystemActions.ActionTypes.USERS.EXISTING_USER_PHONE_NUMBER_TYPE_CHANGED , rowIndex:this.props.rowIndex, data:e.target.value});
		// this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.users.phones' });
    }
 
	getPhoneTypeID(phoneTypeName){
		let returnedValue = -1;
		for(let i =0 , len = this.props.phoneTypes.length; i<len;i++){
			if(this.props.phoneTypes[i].name == phoneTypeName){
				returnedValue = this.props.phoneTypes[i].id;
				break;
			}
		}
		return returnedValue;
	}

    render() {
	   let userPhone=this.props.selectedUserData.userPhones[this.props.rowIndex];
	   let isValidPhoneNumber =(this.props.isDuplicate || userPhone.phone_number.trim() == '' 
			|| !validatePhoneNumber(userPhone.phone_number.split('-').join('')));

	   let isValidPhoneType = (userPhone.name == '' || this.getPhoneTypeID(userPhone.name) == -1 );
	     
	return (
			<div className='row'>
				<div className='col-sm-2'>{this.labels.type}</div>
				<div className={'col-sm-3 form-group'+ (isValidPhoneType?' has-error':'')}>
					<Combo items={this.props.phoneTypes} value={this.props.item.name} onChange={this.updatePhoneType.bind(this)} 
					disabled={true} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' />
				</div>
				<div className='col-sm-2'>{this.labels.number}</div>
				<div className={'col-sm-3 form-group' + (isValidPhoneNumber?' has-error':'')}>
					<input type="text" value={this.props.item.phone_number} className="form-control" 
						onChange={this.updatePhoneNumber.bind(this)}/>
				</div>
				<div className='col-sm-1'>
					<span className='glyphicon glyphicon-erase cursor-pointer' style={this.glyphiconStyle} onClick={this.deleteRow.bind(this)}></span>
				</div>
			</div>
		);
    }
}

function mapStateToProps(state) {
    return {
		selectedUserData: state.system.selectedUserData,
		phoneTypes:state.system.phoneTypes ,
    };
}
export default connect(mapStateToProps)(withRouter(UserPhoneRow));