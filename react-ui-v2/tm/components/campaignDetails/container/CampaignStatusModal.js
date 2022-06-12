import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as campaignActions from 'tm/actions/campaignActions';
import * as systemActions from 'tm/actions/systemActions';

import ModalWindow from 'tm/components/common/ModalWindow';
import CampaignStatusForm from '../display/CampaignStatusForm';

import Constants from 'tm/constants/constants.js';


class CampaignStatusModal extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            selectedStatus: null,
        };

        this.onCloseModalClick = this.onCloseModalClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.doValidation = this.doValidation.bind(this);

        this.buildValidCampignArr();
        this.buildStatusesNeedValidationArr();
    }

    buildValidCampignArr() {
        this.validCampignArr = [
            { label: 'שאלון', isValid: this.props.isValidQuestionnaire },
            { label: 'מנות', isValid: (this.props.portionList.length > 0) ? true : false },
            { label: 'הגדרות מתקדמות', isValid: (this.props.sip_server_id == null  ) ? false : true },
        ];
    }

    onCloseModalClick() {
        this.props.campaignActions.onOpenCampaignStatusModalClick();
    }

    buildStatusesNeedValidationArr() {
        let statusConst = Constants.TM.CAMPAIGN.STATUS;
        let statusesNeedValidationIds = [statusConst.READY, statusConst.ACTIVE];
        this.statusesNeedValidation = statusesNeedValidationIds;
    }

    doValidation() {
        let isValid = true;
        let selectedStatusId = (this.state.selectedStatus) ? this.state.selectedStatus.id : null;
        if (this.statusesNeedValidation.includes(selectedStatusId)) {
            isValid = this.validCampignArr.filter(item => { return !item.isValid }).length == 0;
        }
        return isValid;
    }

    onSaveClick() {
        if (this.state.selectedStatus) {
            if (this.doValidation()) {
                let campaign = { key: this.props.campaignKey };
                let parameters = {
                    status: this.state.selectedStatus.id
                };
                this.props.campaignActions.updateCampaign(campaign, parameters);
                this.onCloseModalClick();
            }
            else {
                this.props.systemActions.showAlertMessage("אינך יכול לבצע פעולה זו. אנא השלם את הגדרות הקמפיין.");
            }
        }
    }

    onStatusChange(event) {
        this.setState({ selectedStatus: event.target.selectedItem });
    }

    getCampaignStatusArr() {
        let statusConstArr;
        let statusConst = Constants.TM.CAMPAIGN.STATUS;
        switch (this.props.campaignStatus) {
            case statusConst.SETUP:
                statusConstArr = [statusConst.READY, statusConst.CLOSED, statusConst.CANCELED];
                break;
            case statusConst.READY:
                statusConstArr = [statusConst.ACTIVE, statusConst.SETUP, statusConst.CLOSED, statusConst.CANCELED];
                break;
            case statusConst.ACTIVE:
                statusConstArr = [statusConst.SUSPENDED];
                break;
            case statusConst.SUSPENDED:
                statusConstArr = [statusConst.ACTIVE, statusConst.SETUP, statusConst.CLOSED, statusConst.CANCELED];
                break;
            case statusConst.CLOSED:
                statusConstArr = [statusConst.SETUP, statusConst.READY, statusConst.CANCELED];
                break;
            case statusConst.CANCELED:
                statusConstArr = [statusConst.SETUP, statusConst.READY, statusConst.CLOSED];
                break;
            default:
                statusConstArr = [];
        }
        let campaignStatusArr = this.props.campaignStatusOptions.filter(option => {
            if (statusConstArr.includes(option.id)) return option;
        });
        return campaignStatusArr;
    }

    render() {
        let textValues = {
            title: 'שנה סטטוס קמפיין',
        }
        let campaignStatusArr = this.getCampaignStatusArr();

        return (
            <ModalWindow
                show={true}
                title={textValues.title}
                buttonOk={this.onSaveClick}
                buttonCancel={this.onCloseModalClick}
                buttonX={this.onCloseModalClick}
                children={
                    <CampaignStatusForm
                        selectedStatus={this.state.selectedStatus}
                        campaignStatusArr={campaignStatusArr}
                        onStatusChange={this.onStatusChange}
                        validCampignArr={this.validCampignArr}
                    />
                }
            />
        )
    }
}

CampaignStatusModal.propTypes = {
    campaignStatus: PropTypes.number,
    campaignStatusOptions: PropTypes.array,
    campaignStatusConstOptions: PropTypes.array,
};

function mapStateToProps(state, ownProps) {
	let campaign = state.tm.campaign.campaignScreen.currentCampaign;
    return {
        campaignKey: state.tm.campaign.currentCampaignKey,
        campaignStatus: state.tm.campaign.campaignScreen.currentCampaign.status,
        campaignStatusOptions: state.tm.system.lists.campaignStatus,
        campaignStatusConstOptions: state.tm.system.lists.campaignStatusConst,
        isValidQuestionnaire: state.tm.questionnaire.isValidQuestionnaire,
        isValidPortions: state.tm.portion.isValidPortions,
        portionList: state.tm.portion.list,
		sip_server_id:campaign.sip_server_id,
		phone_number:campaign.phone_number,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        campaignActions: bindActionCreators(campaignActions, dispatch),
        systemActions: bindActionCreators(systemActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CampaignStatusModal);
