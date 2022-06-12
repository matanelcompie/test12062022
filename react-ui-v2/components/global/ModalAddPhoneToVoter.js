import React from 'react';
import { connect } from 'react-redux';
import ModalWindow from './ModalWindow';
import Combo from './Combo';
import { validatePhoneNumber } from '../../libs/globalFunctions';
import * as VoterActions from 'actions/VoterActions';

/**
 * Modal for adding phone to voter.
 *
 * buttonCancel - handles X and cancel click
 * buttonOK - handles adding phone click
 *
 */
class ModalAddPhoneToVoter extends React.Component {

	constructor(props) {
		super(props);
		 
		this.state = {
			buttons:[],
			phone_type : {selectedValue:'' , selectedItem:null},
			phone_number : '',	
		};
		this.initConstants();
	}
	
	initConstants(){
		let buttonsForAdd = [
            {
                class: 'btn btn-secondary pull-right',
                text: 'בטל',
                action: this.props.buttonCancel.bind(this),
                disabled: false
            },
            {
                class: 'btn btn-primary',
                text: 'שמור',
                action: this.addVoterPhone.bind(this),
                disabled: true
            }
        ];
		this.state.buttons= buttonsForAdd ;
	}
	
	validatePhoneNumber (phoneNumber) {
        if ( 0 == phoneNumber.length ) {
            return false;
        }

        let phoneToCheck = phoneNumber.split('-').join('');

        if ( !validatePhoneNumber(phoneToCheck) ) {
            return false;
        }  
		return true;
    }
	
	addVoterPhone(){
		let voterKey = this.props.voterKey;
        let voterData = this.buildVoterDataToServer();
        let voterPhonesData = [{
                        id: null,
                        key: null,
                        phone_number: this.state.phone_number,
                        call_via_tm: 1,
                        sms: 1,
                        phone_type_id: this.state.phone_type.selectedItem.id,
                        main_phone: 1
                    }];

        VoterActions.saveVoterContact(this.props.dispatch, voterKey, voterData, voterPhonesData, false, []);
		this.props.buttonOK();
	}
	
	buildVoterDataToServer() {
        let email = this.props.voterDetails.email;
        let contactViaEmail = "";
        let voterData = [];

        if ( this.props.voterDetails.email == "" ) {
            email = null;
        }

        if ( email == null ) {
            contactViaEmail = 0;
        } else {
            contactViaEmail = this.props.voterDetails.contact_via_email;
        }

        voterData = {email: email, contact_via_email: contactViaEmail,
                     main_voter_phone_id: this.props.voterDetails.main_voter_phone_id};

        return voterData;
    }
	
	phoneTypeChange(e){
		let phone_type = this.state.phone_type;
		phone_type.selectedValue = e.target.value;
		phone_type.selectedItem = e.target.selectedItem;
		let isValidatedPhoneNumber = this.validatePhoneNumber(this.state.phone_number);
		let buttons = this.state.buttons ;
		let notValidCombo = !e.target.selectedItem;
		let notValidInputs = notValidCombo || !isValidatedPhoneNumber;
		if(buttons[1].disabled != notValidInputs){
			buttons[1].disabled = notValidInputs;
			this.setState({phone_type,buttons});
		}
		else{
			this.setState({phone_type});
		}		
	}

	phoneNumberChange(e){
		let phone_number = e.target.value;
		let isValidatedPhoneNumber = this.validatePhoneNumber(phone_number);
		
		let buttons = this.state.buttons ; 
		let notValidCombo = !this.state.phone_type.selectedItem;
		let notValidInputs = notValidCombo || !isValidatedPhoneNumber;
		if(buttons[1].disabled != notValidInputs){
			buttons[1].disabled = notValidInputs;
			this.setState({phone_number,buttons});
		}
		else{
			this.setState({phone_number});
		}	
	}
	
	render() {
		return (
			<ModalWindow 
			title="הוספת מספר טלפון"
			show={true}
			buttonX={this.props.buttonCancel}
			buttons={this.state.buttons}
			>
				<div>
					  <div className="row">
                        <div className="col-lg-12 text-right">
						<h2>
						מספר טלפון לתושב מבקש הסעה
						</h2>
						<br/>
							תושב מבקש הסעה נדרש לספק מספר טלפון ליצירת קשר
							<br/>
							לתושב זה לא נמצא מספר טלפון.
							<br/><br/>
							נא הקלד מספר טלפון ליצירת קשר עם התושב
							<br/><br/>
							המספר יישמר בכרטיס התושב
							<br/> 
							<div className="row">
								<div className="col-md-4">
									<Combo items={this.props.phoneTypes.filter(item => (item.name=='נייד' || item.name=='נייח'))}
											itemIdProperty="id" itemDisplayProperty='name'
											maxDisplayItems={10}
											value={this.state.phone_type.selectedValue}
											onChange={this.phoneTypeChange.bind(this)}
											inputStyle={{borderColor:(!this.state.phone_type.selectedItem?'#ff0000':'#ccc')}}
											/>
								</div>
								<div className="col-md-7">
									<input type="text" className="form-control" 
										value={this.state.phone_number}
										onChange={this.phoneNumberChange.bind(this)}
										style={{borderColor:(this.validatePhoneNumber(this.state.phone_number) ? '#ccc' : '#ff0000')}}
									/>
								</div>
							</div>
							<br/>
						</div>
					  </div>
			 
				</div>
			</ModalWindow>
		)
	}
}
function mapStateToProps(state) {
    return {
        phoneTypes: state.system.phoneTypes,
		voterDetails: state.voters.voterDetails,
	}
}
export default connect(mapStateToProps)(ModalAddPhoneToVoter);