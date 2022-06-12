import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import AllocatedHouseholdItem from './AllocatedHouseholdItem';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';


class AllocatedHouseholds extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedHouseholds: {},
            globalHouseholdSelectStatus: 0,
            buttonAction: null
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;

        this.buttonsTexts = {
            select: 'בחר'
        };

        this.buttonActions = {
            selectAction: 0,
            delete: 1
        };
    }

    componentWillMount() {
        this.setState({buttonAction: this.buttonActions.selectAction});
    }

    componentDidMount() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.ministerOfFifty);

        let householdsLength = activistItem.election_roles_by_voter[roleIndex].captain50_households.length;
        this.props.updateHouseHoldsCount(householdsLength);
    }

    resetState() {
        this.setState({selectedHouseholds: {}, globalHouseholdSelectStatus: 0, buttonAction: this.buttonActions.selectAction});
    }

    deleteSelectedHouseholds() {
        if (Object.keys(this.state.selectedHouseholds).length == 0) {
            return;
        }

        let households = [];
        for (let householdKey in this.state.selectedHouseholds) {
            let householdKeyElements = householdKey.split('_');

            households.push(householdKeyElements[1]);
        }

        this.resetState();

        ElectionsActions.deleteHouseholdsOfCaptain50(this.props.dispatch, this.props.activistKey, households);
    }

    executeAction() {
        if ( this.state.buttonAction == this.buttonActions.delete ) {
            this.deleteSelectedHouseholds();
        }
    }

    buttonActionChange(event) {
        this.setState({buttonAction: event.target.value});
    }

    deleteHousehold(householdId) {
        let householdKey = 'household_' + householdId;
        let selectedHouseholds = this.state.selectedHouseholds;
        let households = [];

        if (1 == selectedHouseholds[householdKey]) {
            delete selectedHouseholds[householdKey];
        }

        this.resetState();

        households.push(householdId);
        ElectionsActions.deleteHouseholdsOfCaptain50(this.props.dispatch, this.props.activistKey, households);
    }

    changeSelectedHousehold(householdId) {
        let householdKey = 'household_' + householdId;
        let selectedHouseholds = this.state.selectedHouseholds;

        if (1 == selectedHouseholds[householdKey]) {
            delete selectedHouseholds[householdKey];
        } else {
            selectedHouseholds[householdKey] = 1;
        }

        this.setState({ selectedHouseholds });
    }

    toggleSelectAllHouseholds() {
        let globalHouseholdSelectStatus = (this.state.globalHouseholdSelectStatus == 0) ? 1 : 0;//toogle
        let selectedHouseholds = {};
        let activistItem = this.props.activistDetails;

        if (globalHouseholdSelectStatus == 1) {
            let roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.ministerOfFifty);
            if(activistItem.election_roles_by_voter[roleIndex].captain50_households){
				activistItem.election_roles_by_voter[roleIndex].captain50_households.map(item => {
					let householdKey = 'household_' + item.household_id;
					selectedHouseholds[householdKey] = 1;
				});
			}
        }

        this.setState({ globalHouseholdSelectStatus, selectedHouseholds });
    }

    renderHouseholds() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;
        let that = this;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.ministerOfFifty);
        let activistUserLockId = activistItem.election_roles_by_voter[roleIndex].user_lock_id;

        let households = (activistItem.election_roles_by_voter[roleIndex].captain50_households ? activistItem.election_roles_by_voter[roleIndex].captain50_households.map(function (item, index) {
            let householdKey = 'household_' + item.household_id;
            return <AllocatedHouseholdItem key={householdKey} householdIndex={index} item={item}
                                           householdSelected={that.state.selectedHouseholds[householdKey] == 1}
                                           changeSelectedHousehold={that.changeSelectedHousehold.bind(that)}
                                           isActivistLocked={activistUserLockId != null}
                                           deleteHousehold={that.deleteHousehold.bind(that)} currentUser={that.props.currentUser}
                                           editingCaptainHouseholdsFlag={that.props.editingCaptainHouseholdsFlag}/>
        }) : null);

        return <tbody>{households}</tbody>;
    }

    getBlockClass() {
        let blockClass = (this.props.display) ? "tab-pane active" : "tab-pane";

        return blockClass;
    }

    shouldComponentBeRendered() {
        if (!this.props.currentUser.admin && this.props.currentUser.permissions['elections.activists.captain_of_fifty'] != true) {
            return false;
        } else if (this.props.currentTabRoleSystemName == this.electionRoleSytemNames.ministerOfFifty) {
            return true;
        } else {
            return false;
        }
    }

    renderActionBlock() {
        if (this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.captain_of_fifty.edit'] == true) {
            return (
                <div className="col-lg-4 col-lg-offset-8 actions-bulk">
                    <div className="form-group">
                        <label htmlFor="inputActions-allocated-households" className="col-lg-2 control-label">פעולות</label>
                        <div className="col-lg-8">
                            <select className="form-control" id="inputActions-allocated-households" value={this.state.buttonAction}
                                    onChange={this.buttonActionChange.bind(this)}>
                                <option value={this.buttonActions.selectAction}>בחר פעולה</option>
                                <option value={this.buttonActions.delete}>בטל הקצאה</option>
                            </select>
                        </div>
                        <div className="col-lg-2 nopaddingL">
                            <button title="בחר" type="submit" className="btn new-btn-default submitBtn"
                                disabled={this.props.loadingHouseholdsFlag ||
                                          Object.keys(this.state.selectedHouseholds).length == 0 ||
                                          this.state.buttonAction == this.buttonActions.selectAction ||
                                          this.props.editingCaptainHouseholdsFlag}
                                onClick={this.executeAction.bind(this)}>
                                {this.buttonsTexts.select}
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return '\u00A0';
        }
    }

    render() {
        if (this.shouldComponentBeRendered()) {
            return (
                <div role="tabpanel" className={this.getBlockClass()} id="Tab3">
                    <div className="containerStrip">
                        <div className="row panelTitle"></div>
                        <div className="row rsltsTitleRow">{this.renderActionBlock()}</div>
                        <div className="tableList">
                            <table className="table table-frame table-striped tableNoMarginB householdLIst">
                                <thead>
                                    <tr>
                                        <th><input type="checkbox" checked={this.state.globalHouseholdSelectStatus} onChange={this.toggleSelectAllHouseholds.bind(this)} /></th>
                                        <th>מס"ד</th>
                                        <th>שם משפחה</th>
                                        <th>מספר תושבים</th>
                                        <th>כתובת בפועל</th>
                                        <th>קלפי</th>
                                        <th>{'\u00A0'}</th>
                                    </tr>
                                </thead>

                                {this.renderHouseholds()}
                            </table>
                        </div>
                    </div>
                </div>
            );
        } else {
            return <div>{'\u00A0'}</div>;
        }
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        activistKey: state.elections.activistsScreen.activistDetails.key,
        activistDetails: state.elections.activistsScreen.activistDetails,
        householdsSearchResult: state.elections.activistsScreen.householdsSearchResult,
        totalHouseholdsSearchResult: state.elections.activistsScreen.totalHouseholdsSearchResult,
        householdSearchFields: state.elections.activistsScreen.householdSearchFields,
        editCaptainHouseholdsFlag: state.elections.activistsScreen.editCaptainHouseholdsFlag,
        editingCaptainHouseholdsFlag: state.elections.activistsScreen.editingCaptainHouseholdsFlag,
        loadingHouseholdsFlag: state.elections.activistsScreen.loadingHouseholdsFlag
    };
}

export default connect(mapStateToProps)(AllocatedHouseholds);