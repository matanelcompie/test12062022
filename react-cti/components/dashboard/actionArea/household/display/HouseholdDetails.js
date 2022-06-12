import React from 'react';
import { connect } from 'react-redux';

import HouseholdDetailsHeader from './HouseholdDetailsHeader';
import HouseholdDetailsRow from './HouseholdDetailsRow';

import ModalWindow from '../../../../common/ModalWindow';

import * as uiActions from '../../../../../actions/uiActions';
import * as callActions from '../../../../../actions/callActions';


class HouseholdDetails extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.deletePhoneModalTexts = {
            title: 'מחיקת טלפון',
            message: 'האם אתה בטוח ?'
        };
    }

    deleteHouseholdPhone() {
        callActions.deleteVoterHouseholdPhone(this.props.dispatch, this.props.deleteHouseholdIndex, this.props.deletePhoneIndex);
        uiActions.hideDeleteHouseholdPhoneModal(this.props.dispatch);
    }

    hideDeletePhoneModal() {
        uiActions.hideDeleteHouseholdPhoneModal(this.props.dispatch);
    }

    render() {
        return (
            <div className="household-details">
                <HouseholdDetailsHeader 
                    permissions={this.props.permissions}
                />
                {this.props.household.map((item, index) =>
                    <HouseholdDetailsRow
                        key={item.key}
                        household={item}
                        supportStatusConstOptions={this.props.supportStatusConstOptions}
                        onHouseholdVoterDetailsChange={this.props.onHouseholdVoterDetailsChange}
                        callNote={this.props.callNote[item.key]?this.props.callNote[item.key]:{}}
                        onUpdatePhoneClick={this.props.onUpdatePhoneClick}
                        phoneKey={this.props.phoneKey}
                        onUpdatePhoneNumber={this.props.onUpdatePhoneNumber}
                        onAddPhoneNumber={this.props.onAddPhoneNumber}
                        householdIndex={index}
                        permissions={this.props.permissions}
                    />
                )}

                <ModalWindow
                    show={this.props.showDeleteHouseholdPhoneModal}
                    title={this.deletePhoneModalTexts.title}
                    buttonOk={this.deleteHouseholdPhone.bind(this)}
                    buttonCancel={this.hideDeletePhoneModal.bind(this)}
                    buttonX={this.hideDeletePhoneModal.bind(this)}>
                        {this.deletePhoneModalTexts.message}
                </ModalWindow>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        showDeleteHouseholdPhoneModal: state.ui.showDeleteHouseholdPhoneModal,
        deleteHouseholdIndex: state.ui.deleteHouseholdIndex,
        deletePhoneIndex: state.ui.deletePhoneIndex
    }
}

export default connect(mapStateToProps) (HouseholdDetails);