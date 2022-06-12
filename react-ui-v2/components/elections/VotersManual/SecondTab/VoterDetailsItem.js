import React from 'react';
import { connect } from 'react-redux';

import {isLandPhone, isMobilePhone,formatPhone} from 'libs/globalFunctions';

import Combo from 'components/global/Combo';


class VoterDetailsItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            phone1: null,
            phone2: null
        };

        this.initConstants();
    }

    initConstants() {
        this.invalidColor = '#cc0000';
    }

    renderPhone2(mobilePhones, landPhones, phone1) {
        if ( this.props.item.phones.length < 2 ) {
            return;
        }

        for ( let phoneIndex = 0; phoneIndex < mobilePhones.length; phoneIndex++ ) {
            if ( mobilePhones[phoneIndex].phone_number != phone1 ) {
                this.setState({phone2: mobilePhones[phoneIndex].phone_number});
                return;
            }
        }

        for ( let phoneIndex = 0; phoneIndex < landPhones.length; phoneIndex++ ) {
            if ( landPhones[phoneIndex].phone_number != phone1 ) {
                this.setState({phone2: landPhones[phoneIndex].phone_number});
                return;
            }
        }
    }

    renderPhone1(mobilePhones, landPhones) {
        var phone1;
        switch (this.props.item.phones.length) {
            case 0:
                phone1 = null;
				break;
            case 1:
                this.setState({phone1: this.props.item.phones[0].phone_number});
                phone1 = this.props.item.phones[0].phone_number;
                break;

            default:
                let mainPhoneIndex = this.props.item.phones.findIndex(phoneItem => phoneItem.id == this.props.item.main_voter_phone_id);

                if ( mainPhoneIndex > -1 ) {
                    this.setState({phone1: this.props.item.phones[mainPhoneIndex].phone_number});
                    phone1 = this.props.item.phones[mainPhoneIndex].phone_number;
                } else {
                    if ( mobilePhones.length > 0 ) {
                        this.setState({phone1: mobilePhones[0].phone_number});
                        phone1 = mobilePhones[0].phone_number;
                    } else {
                        this.setState({phone1: landPhones[0].phone_number});
                        phone1 = landPhones[0].phone_number;
                    }
                }
                break;
        }

        return phone1;
    }

    buildPhoneArrays() {
        let landPhones = [];
        let mobilePhones = [];

        for ( let phoneIndex = 0; phoneIndex < this.props.item.phones.length; phoneIndex++ ) {
            if ( isLandPhone(this.props.item.phones[phoneIndex].phone_number) ) {
                landPhones.push(
                    {
                        id: this.props.item.phones[phoneIndex].id,
                        key: this.props.item.phones[phoneIndex].key,
                        phone_number: this.props.item.phones[phoneIndex].phone_number,
                        voterPhoneIndex: phoneIndex
                    }
                );
            } else if ( isMobilePhone(this.props.item.phones[phoneIndex].phone_number) ) {
                mobilePhones.push(
                    {
                        id: this.props.item.phones[phoneIndex].id,
                        key: this.props.item.phones[phoneIndex].key,
                        phone_number: this.props.item.phones[phoneIndex].phone_number,
                        voterPhoneIndex: phoneIndex
                    }
                );
            }
        }

        return {landPhones, mobilePhones};
    }

    componentWillMount() {
        let phoneObj = this.buildPhoneArrays();
        let mobilePhones = phoneObj.mobilePhones;
        let landPhones = phoneObj.landPhones;

        let phone1 = this.renderPhone1(mobilePhones, landPhones);
        this.renderPhone2(mobilePhones, landPhones, phone1);
    }

    updateCollapseStatus() {
        let dataFields = {
            collapsed: !this.props.item.collapsed
        };

        this.props.updateSelectedVoterDetails(this.props.voterIndex, dataFields);
    }

    supportStatusChange(event) {
        let selectedItem = event.target.selectedItem;
        let dataFields = {
            support_status_id: null,
            support_status_name: ''
        };

        if ( null == selectedItem ) {
            dataFields.support_status_id = null;
            dataFields.support_status_name = event.target.value;
        } else {
            dataFields.support_status_id = selectedItem.id;
            dataFields.support_status_name = selectedItem.name;
        }

        dataFields.valid = this.validateSupportStatus(dataFields.support_status_id, dataFields.support_status_name);
        this.props.updateSelectedVoterDetails(this.props.voterIndex, dataFields);
    }

    renderSupportStatus() {
        let support_status_name = (this.props.item.support_status_id != null) ? this.props.item.support_status_name : 'ללא סטטוס';

        if ( this.props.massUpdate.statusData.support_status_chosen_id != null ||
             this.props.massUpdate.statusData.status_to_voter_with_status_id != null) {
            return support_status_name;
        } else {
            return <Combo items={this.props.supportStatuses}
                          itemIdProperty="id"
                          itemDisplayProperty="name"
                          maxDisplayItems={10}
                          inputStyle={this.supportStatusInputStyle}
                          value={this.props.item.support_status_name}
                          className="form-combo-table"
                          onChange={this.supportStatusChange.bind(this)}/>;
        }
    }

    getAddress() {
        let address = '';

        if ( this.props.item.street_name != null ) {
            address += this.props.item.street_name + ' ';
        } else if (  this.props.item.street != null ) {
            address += this.props.item.street + ' ';
        }

        if ( this.props.item.house != null  ) {
            address += this.props.item.house + ', ';
        }

        address += this.props.item.city_name;

        return address;
    }

    getElectionRole() {
        if ( this.props.item.election_roles_by_voter.length > 0 ) {
            return this.props.item.election_roles_by_voter[0].election_role_name;
        } else {
            return 'ללא';
        }
    }

    validateSupportStatus(supportStatusId, supportStatusName) {
        if ( supportStatusName.length == 0 ) {
            return true;
        } else {
            return (supportStatusId != null);
        }
    }

    validateVariables() {
        if ( !this.validateSupportStatus(this.props.item.support_status_id, this.props.item.support_status_name) ) {
            this.supportStatusInputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.supportStatusInputStyle = {};
    }

    renderDeleteImg() {
        if (!this.props.savedSelectedVotersFlag) {
            return <img src={window.Laravel.baseURL + "Images/delete-row-icon.png"} title="מחק מהרשימה" style={{cursor: 'pointer'}}
                        onClick={this.props.deleteSelectedVoter.bind(this, this.props.voterIndex)}/>;
        } else {
            return '\u00A0';
        }
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <tr style={{backgroundColor:(this.props.voterIndex %2 == 0 ? '#D7D7D7':'#ffffff') , borderTop:'1px solid #ddd' , borderBottom:(this.props.voterIndex == 0 ? '1px solid #ddd' : '')}}>
                <td>
                    <a data-toggle="collapse" onClick={this.updateCollapseStatus.bind(this)} aria-expanded={!this.props.item.collapsed}
                       aria-controls="collapseExample">
                        <div className="collapseToggle closed"/>
                        <div className="collapseToggle open"/>
                    </a>
                </td>
                <td>{this.props.item.first_name + ' ' + this.props.item.last_name}</td>
                <td>{this.props.item.personal_identity}</td>
                <td>{this.state.phone1 != null ? formatPhone(this.state.phone1) : '\u00A0'}</td>
                <td>{this.state.phone2 != null ? formatPhone(this.state.phone2) : '\u00A0'}</td>
                <td>{this.getAddress()}</td>
                <td>{this.props.item.email != null ? this.props.item.email : ''}</td>
                <td>{this.getElectionRole()}</td>
                <td>{this.renderSupportStatus()}</td>
                <td>{this.renderDeleteImg()}</td>
            </tr>
        );
    }
}

function mapStateToProps(state) {
    return {
        supportStatuses: state.elections.votersManualScreen.combos.supportStatuses,
        savedSelectedVotersFlag: state.elections.votersManualScreen.savedSelectedVotersFlag
    }
}

export default connect(mapStateToProps) (VoterDetailsItem);