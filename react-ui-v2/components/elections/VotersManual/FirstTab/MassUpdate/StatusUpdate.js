import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import Combo from 'components/global/Combo';

import * as ElectionsActions from 'actions/ElectionsActions';


class StatusUpdate extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();

        this.state = {
            collapsed: false,

            statusData: {
                support_status_chosen: {id: null, name: ''},
                status_update_type: this.supportStatusUpdateType.always,
                status_to_voter_with_status: {id: 1, name: 'עדכן את סטטוס הסניף לסטטוס הנבחר'},
                updateHouseHoldStatus: false
            }
        };
    }

    initConstants() {
        this.emptyFieldObj = {id: null, name: ''};
        this.supportStatusUpdateType = constants.supportStatusUpdateType;

        this.statusUpdatesLabels = {
            maximum: 'סטטוס סניף מקסימלי',
            minimum: 'סטטוס סניף מינימלי',
            always: 'עדכן תמיד'
        };

        this.updateStatusToVoterWithStatusArr = [
            {id: 0, name: 'אל תבצע עדכון'},
            {id: 1, name: 'עדכן את סטטוס הסניף לסטטוס הנבחר'}
        ];

        this.updateHouseholdLabel = 'עדכן את סטטוס הסניף לכל בית אב';

        this.invalidColor = '#cc0000';
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.cleanData && nextProps.cleanData ) {
            let statusData = {
                support_status_chosen: {id: null, name: ''},
                status_update_type: this.supportStatusUpdateType.always,
                status_to_voter_with_status: {id: null, name: ''},
                updateHouseHoldStatus: false
            };
            this.setState({statusData});

            this.props.resetMassUpdateClean('statusData');
        }
    }

    updateCollapseStatus() {
        let collapsed = !this.state.collapsed;

        this.setState({collapsed});
    }

    updateComponentParent( statusDataObj ) {
        let dataObj = {
            support_status_chosen_id: statusDataObj.support_status_chosen.id,
            status_update_type: statusDataObj.status_update_type,
            update_status_to_voter_with_status : statusDataObj.status_to_voter_with_status.id,
            updateHouseHoldStatus: statusDataObj.updateHouseHoldStatus,

            validInput: (this.validateSupportStatus('support_status_chosen', statusDataObj.support_status_chosen) &&
                         this.validateNoSupportStatus(statusDataObj.status_to_voter_with_status, 'support_status_chosen', statusDataObj.support_status_chosen))
        };
        console.log(dataObj.validInput);
        this.props.updateMassUpdateData('statusData', dataObj);
    }

    updateHouseHoldStatus() {
        let statusData = this.state.statusData;

        statusData.updateHouseHoldStatus = !this.state.statusData.updateHouseHoldStatus;
        this.setState({statusData});

        this.updateComponentParent( statusData );
    }

    comboValueChange(fieldName, event) {
        let selectedItem = event.target.selectedItem;
        let statusData = this.state.statusData;

        if ( null == selectedItem ) {
            statusData[fieldName] = {...this.emptyFieldObj, name: event.target.value};
        } else {
            statusData[fieldName] = {
                id: selectedItem.id,
                name: selectedItem.name
            };
        }
        this.setState({statusData});

        this.updateComponentParent( statusData );
    }

    statusUpdateTypeChange(newStatusUpdateType) {
        let statusData = this.state.statusData;

        statusData.status_update_type = newStatusUpdateType;
        this.setState({statusData});

        this.updateComponentParent( statusData );
    }

    validateNoSupportStatus(fieldObj, supportFieldName, supportFieldObj) {
        let fieldId = (null == fieldObj) ? this.state.statusData.status_to_voter_with_status.id : fieldObj.id;
        let statusName = (null == supportFieldObj) ? this.state.statusData[supportFieldName].name : supportFieldObj.name;

        return (!this.validateSupportStatus(supportFieldName, supportFieldObj) || statusName.length == 0 || fieldId != null);
    }

    validateSupportStatus(fieldName, fieldObj = null) {
        let fieldId = (null == fieldObj) ? this.state.statusData[fieldName].id : fieldObj.id;
        let name = (null == fieldObj) ? this.state.statusData[fieldName].name : fieldObj.name;

        if ( name.length == 0 ) {
            return true;
        } else {
            return (fieldId != null);
        }
    }

    validateVariables() {
        if ( !this.validateSupportStatus('support_status_chosen') ) {
            this.supportStatusChosenInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateNoSupportStatus(null, 'support_status_chosen', null) ) {
            this.noSupportStatusInputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.supportStatusChosenInputStyle = {};
        this.noSupportStatusInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className="ContainerCollapse status-update">
                <a data-toggle="collapse" onClick={this.updateCollapseStatus.bind(this)} aria-expanded={this.state.collapsed}
                   aria-controls="collapseExample">
                    <div className="row panelCollapse">
                        <div className="collapseArrow closed"/>
                        <div className="collapseArrow open"/>
                        <div className="collapseTitle">עדכון סטטוס</div>
                    </div>
                </a>

                <div className={"support-status-mass-update" + (this.state.collapsed ? "" : " hidden")}>
                    <div className="row CollapseContent nomargin">
                        <div className="col-lg-6">
                            <div className="row form-group">
                                <label htmlFor="voter-manuals-status-chosen" className="col-sm-4 control-label">סטטוס נבחר</label>
                                <div className="col-sm-7">
                                    <Combo id="voter-manuals-status-chosen"
                                           items={this.props.supportStatuses}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.supportStatusChosenInputStyle}
                                           value={this.state.statusData.support_status_chosen.name}
                                           className="form-combo-table"
                                           onChange={this.comboValueChange.bind(this, 'support_status_chosen')}/>
                                </div>
                            </div>

                            <div className="row form-group">
                                <div className="col-lg-12 margin-bottom20">בחר את השיטה לעידכון הסטטוס:</div>
                                <div className="radio">
                                    <label>
                                        <input type="radio" name="optionsRadios"
                                               checked={this.state.statusData.status_update_type == this.supportStatusUpdateType.maximum}
                                               onChange={this.statusUpdateTypeChange.bind(this, this.supportStatusUpdateType.maximum)}
                                               disabled={(!this.state.statusData.support_status_chosen.id)}/>
                                            {this.statusUpdatesLabels.maximum}
                                        <div className="subRadioInput">(אם הסטטוס הנבחר גבוה מהסטטוס הקיים, הסטטוס יעודכן לסטטוס הנבחר)</div>
                                    </label>
                                </div>
                                <div className="radio">
                                    <label>
                                        <input type="radio" name="optionsRadios"
                                               checked={this.state.statusData.status_update_type == this.supportStatusUpdateType.minimum}
                                               onChange={this.statusUpdateTypeChange.bind(this, this.supportStatusUpdateType.minimum)}
                                               disabled={(!this.state.statusData.support_status_chosen.id)}/>
                                            {this.statusUpdatesLabels.minimum}
                                        <div className="subRadioInput">(אם הסטטוס הנבחר נמוך מהסטטוס הקיים, הסטטוס יעודכן לסטטוס הנבחר)</div>
                                    </label>
                                </div>
                                <div className="radio">
                                    <label>
                                        <input type="radio" name="optionsRadios"
                                               checked={this.state.statusData.status_update_type == this.supportStatusUpdateType.always}
                                               onChange={this.statusUpdateTypeChange.bind(this, this.supportStatusUpdateType.always)}
                                               disabled={(!this.state.statusData.support_status_chosen.id)}/>
                                        {this.statusUpdatesLabels.always}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="row form-group">
                                <label htmlFor="voter-manuals-status-none" className="col-sm-5 control-label">כאשר קיים סטטוס סניף לתושב</label>
                                <div className="col-sm-7">
                                    <Combo id="voter-manuals-status-none"
                                           items={this.updateStatusToVoterWithStatusArr}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.noSupportStatusInputStyle}
                                           value={this.state.statusData.status_to_voter_with_status.name}
                                           className="form-combo-table"
                                           onChange={this.comboValueChange.bind(this, 'status_to_voter_with_status')}
                                           disabled={(!this.state.statusData.support_status_chosen.id)}/>
                                </div>
                            </div>
                            <div className="row form-group">
                                <div className="checkbox">
                                    <label>
                                        <input type="checkbox" checked={this.state.statusData.updateHouseHoldStatus}
                                               onChange={this.updateHouseHoldStatus.bind(this)}
                                               disabled={(!this.state.statusData.support_status_chosen.id)}/>
                                        {this.updateHouseholdLabel}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        supportStatuses: state.elections.votersManualScreen.combos.supportStatuses
    }
}

export default connect(mapStateToProps) (StatusUpdate);