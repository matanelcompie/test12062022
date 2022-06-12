import React from 'react';

import constants from 'libs/constants';

import ModalWindow from 'components/global/ModalWindow';
import SupportStatusList from './SupportStatusList';


class AddSupportStatusUpdateModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            updateType: null,
            selectedSupportStatus: [],
            supportStatusType: null,
            buttons: [
                {
                    class: 'btn new-btn-default btn-secondary pull-right',
                    text: 'בטל וחזור לרשימת העדכונים',
                    action: this.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text: 'בצע',
                    action: this.addSupportStatusUpdate.bind(this),
                    disabled: true
                }
            ]
        };
        this.updateAddDisabled = this.updateAddDisabled.bind(this);
        this.updateSelectedSupportStatus = this.updateSelectedSupportStatus.bind(this);
        this.initConstants();
    }

    /**
     * Update disabled attribute on 'add' button
     *
     * @param boolean disabled
     * @return void
     */
    updateAddDisabled(disabled) {
        let buttons = this.state.buttons;
        buttons[1].disabled = disabled;
        this.setState({
            buttons: buttons
        });
    }

    /**
     * Update selected support status list
     * 
     * @param array selectedSupportStatus
     * @return void
     */
    updateSelectedSupportStatus(selectedSupportStatus, supportStatusType) {
        this.setState({
            selectedSupportStatus: selectedSupportStatus,
            supportStatusType: supportStatusType
        });
    }

    initConstants() {
        this.updateTypes = constants.electionCampaigns.supportStatusUpdate.types;
    }

    resetState() {
        let updateType = this.state.updateType;
        let buttons = this.state.buttons;

        updateType = null;
        buttons[1].disabled = true;
        this.setState({updateType, buttons});
    }

    addSupportStatusUpdate() {
        let updateType = this.state.updateType;
        this.props.addSupportStatusUpdate(updateType, this.state.selectedSupportStatus, this.state.supportStatusType);
        this.resetState();
    }

    hideModal() {
        this.resetState();

        this.props.hideAddStatusUpdateModal();
    }

    updateTypeChange(newUpdateType) {
        let disabled = true;
        let buttons = this.state.buttons;
        buttons[1].disabled = disabled;
        this.setState({updateType: newUpdateType, buttons});
    }

    getContent() {
        switch ( this.state.updateType ) {
            case this.updateTypes.election:
            case this.updateTypes.final:
                return <SupportStatusList supportStatus={this.props.supportStatus}
                                currentCampaignKey={this.props.currentCampaignKey}
                                currentCampaignName={this.props.currentCampaignName}
                                previousCampaignKey={this.props.previousCampaignKey}
                                previousCampaignName={this.props.previousCampaignName}
                                updateAddDisabled={this.updateAddDisabled}
                                updateSelectedSupportStatus={this.updateSelectedSupportStatus}
                                updateType={this.state.updateType}/>
                break;

            default:
                return '\u00A0';
                break;
        }
    }

    render() {
        return (
            <ModalWindow show={this.props.show} buttonX={this.hideModal.bind(this)}
                         title="עדכון סטטוס" style={{zIndex: '9001'}} buttons={this.state.buttons}>
                <div className="row">
                    <label className="control-label">סטטוס לעדכון</label>
                    <span style={{marginRight: '5px'}}>
                        <input type="radio" checked={this.state.updateType == this.updateTypes.election}
                               onChange={this.updateTypeChange.bind(this, this.updateTypes.election)}/>{'\u00A0'}סניף
                    </span>
                    <span style={{marginRight: '5px'}}>
                        <input type="radio" checked={this.state.updateType == this.updateTypes.final}
                               onChange={this.updateTypeChange.bind(this, this.updateTypes.final)}/>{'\u00A0'}סופי
                    </span>
                </div>
                {this.getContent()}
                
            </ModalWindow>
        );
    }
}

export default AddSupportStatusUpdateModal;