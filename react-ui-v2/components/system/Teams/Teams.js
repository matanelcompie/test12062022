import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import store from '../../../store';

import * as SystemActions from '../../../actions/SystemActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import Combo from '../../global/Combo';

import TeamMembers from './TeamMembers';
import TeamLeaders from './TeamLeaders';
import TeamDepartments from './TeamDepartments';
import TeamFilters from './TeamFilters';
import TeamsRequestsTopics from './TeamsRequestsTopics';

import ModalWindow from '../../global/ModalWindow';
import globalSaving from '../../hoc/globalSaving';
import TeamRequestDetails from './TeamRequestDetails';


class Teams extends React.Component {

    constructor(props) {
        super(props);
        this.isPermissionsLoaded = false;
        this.state = {
            isTeamCrmCenter: false
        }
    }

    componentDidMount() {
        this.props.dispatch({ type: SystemActions.ActionTypes.USERS.RESET_CURRENT_USER });
        window.scrollTo(0, 0);
        this.checkPermissions();
    }

    componentDidUpdate() {
        this.checkPermissions();
    }

    checkPermissions() {
        if (this.props.currentUser.first_name.length && !this.isPermissionsLoaded) {
            this.isPermissionsLoaded = true;
            if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.teams'])) {
                SystemActions.loadTeams(store);
                SystemActions.loadAreasGroups(this.props.dispatch);
                SystemActions.loadAreas(this.props.dispatch);
                SystemActions.loadCitiesByArea(this.props.dispatch, -1); //load all cities for initial comboes
                SystemActions.loadInitialCities(this.props.dispatch);
                SystemActions.loadMinimalUsersForTeam(this.props.dispatch);
                SystemActions.loadAllTopics(this.props.dispatch);
                GlobalActions.loadGeoFilterDefinitionGroups(this.props.dispatch);
                
                if (this.props.router.params.teamKey == undefined) {
                    this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.INIT_TEAM_SCREEN });
                } else {
                    let teamKey = this.props.router.params.teamKey;
                    SystemActions.loadTeamDataByKey(this.props.dispatch, teamKey);
                    SystemActions.loadTeamRequestsTopic(this.props.dispatch, teamKey);
                    SystemActions.loadRequestModuleUsers(this.props.dispatch, teamKey);
                }
            } else {
                this.props.router.replace('/unauthorized');
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.teamsScreen.editTeamName == '') && nextProps.teamsScreen.editTeamName != '') {
            this.setState({isTeamCrmCenter : nextProps.teamsScreen.crm_center == 1});
        }   
        if ((this.props.teamsScreen.editTeamName != '') && nextProps.teamsScreen.editTeamName) {

            let systemTitle = this.props.teamsScreen.editTeamName;
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle });
        } else {
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'צוותים' });
        }

        if (this.props.params.teamKey != nextProps.params.teamKey) {

            if (nextProps.params.teamKey == undefined) {
                this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.INIT_TEAM_SCREEN });
            }
            else {
                if ((this.isPermissionsLoaded) && ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.teams']))) {
                    this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.INIT_TEAM_SCREEN });
                    let teamKey = nextProps.params.teamKey;
                    SystemActions.loadTeamDataByKey(this.props.dispatch, teamKey);
                    SystemActions.loadTeamRequestsTopic(this.props.dispatch, teamKey);
                    SystemActions.loadRequestModuleUsers(this.props.dispatch, teamKey);
                }
            }
        }
    }

    initVariables() {
        this.tabTeamMembers = {
            name: 'team_members',
            className: '',
            title: 'חברי צוות',
            display: false
        };

        this.tabTeamLeaders = {
            name: 'team_leaders',
            className: '',
            title: 'ראש צוות',
            display: false
        };

        this.tabTeamDeps = {
            name: 'team_deps',
            className: '',
            title: 'מחלקות',
            display: false
        };

        this.tabTeamFilters = {
            name: 'team_filters',
            className: '',
            title: 'הרשאה גאוגרפית & מגזרית',
            display: false
        };
        this.tabTeamRequests = {
            name: 'team_requests',
            className: '',
            title: 'פניות ציבור',
            display: false
        };
    }

    /**
     *  This function determines which tab is active
     *  according to the field tab in object listsScreen
     *  and returns the active tab component.
     *
     * @returns {XML}
     */
    getTabComponent() {
        switch (this.props.tab) {
            case this.tabTeamLeaders.name:
                this.tabTeamLeaders.className = 'active';
                this.tabTeamLeaders.display = true;
                break;
            case this.tabTeamDeps.name:
                this.tabTeamDeps.className = 'active';
                this.tabTeamDeps.display = true;
                break;
            case this.tabTeamFilters.name:
                this.tabTeamFilters.className = 'active';
                this.tabTeamFilters.display = true;
                break;
            case this.tabTeamRequests.name:
                this.tabTeamRequests.className = 'active';
                this.tabTeamRequests.display = true;
                break;

            case this.tabTeamMembers.name:
            default:
                this.tabTeamMembers.className = 'active';
                this.tabTeamMembers.display = true;
                break;
        }
    }

    changeTeamCombo(e) {
        this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.INIT_TEAM_SCREEN });
        this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.CHANGE_CHOOSE_TEAM_NAME, data: e.target.value });

        for (let i = 0; i < this.props.teams.length; i++) {
            if (this.props.teams[i].name == e.target.value) {
                this.props.dispatch({
                    type: SystemActions.ActionTypes.TEAMS.CHANGE_CHOOSE_TEAM_USER_LEADER,
                    data: this.props.teams[i].leader_name,
                    teamMembers: this.props.teams[i].total_roles,
                    viewable: this.props.teams[i].viewable,
                    crm_center: this.props.teams[i].crm_center
                });

                this.props.router.push('system/teams/' + this.props.teams[i].key);
                break;
            }
        }
    }

    changeUserLeaderCombo(e) {
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.teams.general' });
        this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.CHANGE_CHOOSE_TEAM_USER_LEADER, value: e.target.value, selectedItem: e.target.selectedItem });
    }

    changeEditTeamNameValue(e) {
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.teams.general' });
        this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.CHANGE_CHOOSE_TEAM_TEXT_NAME, data: e.target.value });
    }
    onCheckboxChange(fieldName, e) {
        let fieldValue = e.target.checked;
        // if(fieldName == 'crm_center' && fieldValue == 0){ return;}
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.teams.general' });
        this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.CHANGE_TEAM_FIELD, fieldName, fieldValue });
    }

    addNewTeam() {
        SystemActions.addNewTeam(store, this.props.router, this.props.teamsScreen.editTeamName);
    }

    editExistingTeam() {
        let leader_id = -1;
        let team_name = this.props.teamsScreen.editTeamName;
        let viewable = this.props.teamsScreen.viewable;
        let crm_center = this.props.teamsScreen.crm_center;
        for (let i = 0; i < this.props.minimalUsers.length; i++) {
            if (this.props.minimalUsers[i].name == this.props.teamsScreen.editTeamLeaderFullName) {
                leader_id = this.props.minimalUsers[i].user_id;
                break;
            }
        }
        this.setState({isTeamCrmCenter : crm_center == 1});

        SystemActions.editTeamData(this.props.dispatch, this.props.router.params.teamKey, team_name, leader_id, viewable, crm_center);
    }

    clearExistingTeam() {
        this.props.router.push('/system/teams');
    }

    hideDeleteConfirmModal() {
        this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.HIDE_CONFIRM_DELETE_DELETES });
    }

    doRealDelete() {
        if (this.props.teamsScreen.isDeletingDepartment) {
            SystemActions.deleteExistingDepartment(this.props.dispatch, this.props.router.params.teamKey, this.props.teamsScreen.teamDepartments[this.props.teamsScreen.deleteDepartmentIndex].id);
        } else if (this.props.teamsScreen.isDeletingGeoTemplate) {
            SystemActions.deleteExistingGeoTemplate(this.props.dispatch, this.props.router.params.teamKey, this.props.teamsScreen.geoTemplates[this.props.teamsScreen.deleteGeoTemplateIndex].id);
        } else if (this.props.teamsScreen.isDeletingSectorialTemplate) {
            SystemActions.deleteExistingSectorialTemplate(this.props.dispatch, this.props.router.params.teamKey, this.props.teamsScreen.sectorialTemplates[this.props.teamsScreen.deleteSectorialTemplateIndex].key);
        }
    }

    checkValidation() {
        var _this = this;
        var teamLeader = this.props.minimalUsers.filter(function (user) {
            if (user.user_id == _this.props.teamsScreen.teamLeaderId) return true;
        });
        if (teamLeader.length > 0) this.inputValidated = true;
        else this.inputValidated = false;
    }

    setTeamLeaderStyle() {
        if (!this.inputValidated) this.teamLeaderStyle = {
            borderColor: 'red'
        };
        else this.teamLeaderStyle = {};
    }

    render() {
        this.initVariables();
        var tabComponent = '';
        this.getTabComponent();
        this.checkValidation();
        this.setTeamLeaderStyle();
        let addTeamItem = '';
        if (this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.add']) {
            addTeamItem = <button type="button" className="btn btn-primary btn-sm" disabled={(this.props.teamsScreen.editTeamName != undefined && this.props.teamsScreen.editTeamName.length >= 3 ? "" : "disabled")}
                onClick={this.addNewTeam.bind(this)} >
                <i className="fa fa-plus"></i>&nbsp;&nbsp;
    <span>הוספת צוות</span>
            </button>;
        }

        let ChooseTeamItem = '';
        let TabsItem = '';
        if (this.props.router.params.teamKey == undefined) {
            ChooseTeamItem = <div className="row">
                <div className="col-md-2">בחר צוות : </div>
                <div className="col-md-3"><Combo items={this.props.teams} value={this.props.teamsScreen.editTeamName} onChange={this.changeTeamCombo.bind(this)} className="form-combo-table" itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} /></div>
                <div className="col-md-2">
                    {addTeamItem}
                </div>
            </div>
        } else {
            ChooseTeamItem = <div className="row">
                <div className="col-md-1 ">שם צוות : </div>
                <div className="col-md-3">
                    <input type="text" className="form-control" style={{ width: '200px' }} value={this.props.teamsScreen.editTeamName} onChange={this.changeEditTeamNameValue.bind(this)} />
                </div>
                <div className="col-md-1">ראש צוות : </div>
                <div className="col-md-3">
                    <Combo items={this.props.minimalUsers} inputStyle={this.teamLeaderStyle} value={this.props.teamsScreen.editTeamLeaderFullName} onChange={this.changeUserLeaderCombo.bind(this)} className="form-combo-table" itemIdProperty="user_id" itemDisplayProperty='name' maxDisplayItems={5} />
                </div>
                <div className="col-md-2">
                    <div className="checkbox-inline">
                        <label><input type="checkbox" checked={this.props.teamsScreen.viewable} onChange={this.onCheckboxChange.bind(this, 'viewable')} />צוות מוקד</label>
                    </div>
                    <div className="checkbox-inline">
                        <label><input type="checkbox" checked={this.props.teamsScreen.crm_center} onChange={this.onCheckboxChange.bind(this, 'crm_center')} disabled={this.state.isTeamCrmCenter}  />צוות פניות</label>
                    </div>
                </div>
                <div className="col-md-2">
                    {(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.edit']) &&
                        <button type="button" className="btn btn-primary btn-sm" onClick={this.editExistingTeam.bind(this)}
                            disabled={(this.isButtonDisabled()) ? "disabled" : ""}>
                            <span>עדכון נתונים</span>
                        </button>
                    }
                    &nbsp;
	        	    <button type="button" className="btn btn-primary btn-sm" disabled={(this.props.teamsScreen.editTeamName != undefined && this.props.teamsScreen.editTeamName.length >= 3 ? "" : "disabled")}
                        onClick={this.clearExistingTeam.bind(this)} >
                        <span>נקה</span>
                    </button>
                </div>
            </div>;

            TabsItem = <section className="section-block" style={{ minHeight: "500px" }}><ul className="tabs">
                {(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.teammates']) &&
                    <li className={this.tabTeamMembers.className}
                        onClick={this.tabClick.bind(this, this.tabTeamMembers.name)}>
                        {this.tabTeamMembers.title}
                    </li>
                }
                {(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.leaders']) &&
                    <li className={this.tabTeamLeaders.className}
                        onClick={this.tabClick.bind(this, this.tabTeamLeaders.name)}>
                        {this.tabTeamLeaders.title}
                    </li>
                }
                {(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.departments']) &&
                    <li className={this.tabTeamDeps.className}
                        onClick={this.tabClick.bind(this, this.tabTeamDeps.name)}>
                        {this.tabTeamDeps.title}
                    </li>
                }
                {(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.filters']) &&
                    <li className={this.tabTeamFilters.className}
                        onClick={this.tabClick.bind(this, this.tabTeamFilters.name)}>
                        {this.tabTeamFilters.title}
                    </li>
                }
                {(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.filters']) &&
                    <li className={this.tabTeamRequests.className}
                        onClick={this.tabClick.bind(this, this.tabTeamRequests.name)}>
                        {this.tabTeamRequests.title}
                    </li>
                }
            </ul>
                {(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.teammates']) &&
                    <TeamMembers display={this.tabTeamMembers.display} />
                }
                {(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.leaders']) &&
                    <TeamLeaders display={this.tabTeamLeaders.display} />
                }
                {(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.departments']) &&
                    <TeamDepartments display={this.tabTeamDeps.display} />
                }
                {(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.filters']) &&
                    <TeamFilters display={this.tabTeamFilters.display} />
                }
                {((this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.requests']) && this.tabTeamRequests.display) ?
                   <div>
                   <TeamRequestDetails teamKey={this.props.router.params.teamKey} teamDetails={this.props.teamsScreen}></TeamRequestDetails>
                   <TeamsRequestsTopics display={this.tabTeamRequests.display} teamKey={this.props.router.params.teamKey} />
                   </div>:''
                }
            </section>;
        }
        return (
            <div>
				<h1>צוותים</h1>
                <section className="main-section-block">
                    <div style={{ paddingTop: '20px', paddingRight: '20px' }}>
                        {ChooseTeamItem}
                    </div>
                </section>

                {TabsItem}
                <ModalWindow show={this.props.teamsScreen.isDeletingDepartment || this.props.teamsScreen.isDeletingGeoTemplate || this.props.teamsScreen.isDeletingSectorialTemplate} title={'וידוא מחיקה'} buttonOk={this.doRealDelete.bind(this)}
                    buttonCancel={this.hideDeleteConfirmModal.bind(this)} buttonX={this.hideDeleteConfirmModal.bind(this)} style={{ zIndex: '9001' }}>
                    <div>
                        האם את/ה בטוח/ה?
                                    </div>
                </ModalWindow>
            </div>
        );
    }

    tabClick(tabName) {
        this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.TEAM_TAB_CHANGE, tabName: tabName });
    }
    isButtonDisabled() {
        return (this.props.dirtyComponents.indexOf('system.teams.general') == -1 || this.props.savingChanges) || (this.props.teamsScreen.editTeamName != undefined && this.props.teamsScreen.editTeamName.length < 3) || (this.props.teamsScreen.teamLeaderId == null);
    }
}

function mapStateToProps(state) {
    return {
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        tab: state.system.teamsScreen.tab,
        teams: state.system.teams,
        teamsScreen: state.system.teamsScreen,
        minimalUsers: state.system.teamsScreen.minimalTeamMembers,
        currentUser: state.system.currentUser,
        requestModuleTeamUsers: state.system.requestModuleUsers,
        topic: state.crm.requestSearch.topics,

    };
}

export default globalSaving(connect(mapStateToProps)(withRouter(Teams)));
