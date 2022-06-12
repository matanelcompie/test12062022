import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Combo from 'components/global/Combo';
import * as employeeActions from 'tm/actions/employeeActions';

class EmployeesHeader extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.textIgniter();
        this.styleIgniter();

        this.originalCampainData = {
            team: { id: '', name: '' },
            department: { id: '', name: '' },
        }

        this.state = {
            campainInfoChanged: false,
            isTeamsLoaded: false,
            isOriginalTeamValueSet: false,
            isDepartmentValueLoaded: false,
            lists: {
                teams: [],
                departments: [],
            },
            values: {
                team: this.originalCampainData.team,
                teamLeader: '',
                department: this.originalCampainData.department,
            },
            comboValues: {
                team: '',
                teamLeader: '',
                department: '',
            }
        };
    }

    componentWillMount() {
        employeeActions.loadTeams(this.props.dispatch);
    }

    componentDidUpdate(nextProps) {
        //if teams loaded and there is no list in the state, load to state
        if (!this.state.isTeamsLoaded && this.props.teams.length > 0) {
            this.loadTeams(this.props.teams);//generate slim teams data list for combo
        }

        //if teams list loaded && there is value for teamId from the campaign, set the value ...
        if (this.state.isTeamsLoaded && !this.state.isOriginalTeamValueSet && this.props.teamId) {
            let team = this.props.teams.filter(item => item.id == this.props.teamId)[0] || { id: '', name: '' };
            this.originalCampainData.team = team;
            this.changeTeam(team);
            this.setState({ isOriginalTeamValueSet: true,comboValues: { team: team.name, department: '' } });
        }
        //set department value from the campaign if there is value ...
        if (!this.state.isDepartmentValueLoaded && this.props.teamDepartmentId && (this.state.lists.departments.length > 0)) {
            let teamDepartment = this.state.lists.departments.filter(department => department.id == this.props.teamDepartmentId)[0] || { id: '', name: '' };
            this.originalCampainData.department = teamDepartment;
            let values = { ...this.state.values, department: teamDepartment };
            let comboValues = {... this.state.comboValues, department: teamDepartment.name }
            this.setState({ values,comboValues, isDepartmentValueLoaded: true });
        }
    }

    /**
     * generate slim teams data list for combo
     */
    loadTeams(teamsList) {
        let teams = teamsList.map(team => {
            return { id: team.id, name: team.name };
        });

        let lists = { ...this.state.lists, teams };
        this.setState({ lists, isTeamsLoaded: true });
    }

    textIgniter() {
        this.title = "יצירת עובדים לקמפיין";
        this.labels = {
            team: 'צוות',
            teamLeader: 'ראש צוות',
            department: 'מחלקה',
        };
    }

    styleIgniter() {
        this.teamLeaderStyle = { backgroundColor: '#fbfbfb', color: '#2594f4', padding: 5 };
        this.btnStyle = { marginRight: 15, marginTop: 25, backgroundColor: '#fff' };
    }

    onChangeValue(field, e) {
        let value = e.target.value;
        let selectedItem = e.target.selectedItem || null;
        if (selectedItem) {
            value = e.target.selectedItem.name;
        }

        switch (field) {
            case 'team': {

                this.setState((prevState) => {
                    return {
                        values: { ...prevState.values, department: { id: '', name: '' } },
                        comboValues: { ...prevState.comboValues, team: value, department: '' }
                    };
                });
                this.changeTeam(selectedItem);
                break;
            }
            case 'department': {
                let department = selectedItem || { id: '', name: '' };
                let values = { ...this.state.values, department};
                this.setState((prevState) => {
                    return { values, comboValues: { ...prevState.comboValues, department: value} }
                });
                break;
            }
            default:
                break;
        }
        this.setState({ campainInfoChanged: true });
    }

    changeTeam(selectedTeam) {
        let departments = [];
        let team = { id: '', name: '' };
        let teamLeader = '';

        if (selectedTeam) {
            this.props.teams.map(item => {
                if (selectedTeam.id == item.id) {
                    departments = [...item.departments];
                    teamLeader = item.leader_name;
                    team = { id: item.id, name: item.name };
                    return;
                }
            });
        }

        let lists = { ...this.state.lists, departments };
        let values = { ...this.state.values, team, teamLeader };
        this.setState({ lists, values });
    
    }

    resetCampainInfo() {
        let values = {
            ...this.state.values,
            department: this.originalCampainData.department,
        };
        this.changeTeam(this.originalCampainData.team);
        this.setState({ values, campainInfoChanged: false,comboValues: { team: this.originalCampainData.team.name, department: '',role:'' } });
    }

    saveCampainInfo() {
        let campaignData = {
            team_id: this.state.values.team.id,
            department_id: this.state.values.department.id,
        };

        if (campaignData.team_id) {
            employeeActions.updateCampaignData(this.props.dispatch, this.props.campaignKey, campaignData);

            //set current as original
            this.originalCampainData = { ...this.state.values };
            this.setState({ campainInfoChanged: false });

        }
    }

    render() {
        return (
            <div>
                <div className="tab-title">
                    <div className="tab-title__title">{this.title}</div>
                </div>
                <div className='row'>
                    <div className="col-md-2">
                        <label htmlFor="team">{this.labels.team}:</label>
                        <Combo
                            className={(this.state.values.team.name == '') ? 'has-error' : ''}
                            items={this.props.teams || []}
                            itemIdProperty='id'
                            itemDisplayProperty='name'
                            value={this.state.comboValues.team}
                            onChange={this.onChangeValue.bind(this, "team")}
                            id='team'
                            
                        />
                    </div>
                    <div className="form-group col-md-2">
                        <label htmlFor="teamLeader">{this.labels.teamLeader}:</label>
                        <div style={this.teamLeaderStyle}>
                            {this.state.values.teamLeader && <i className="fa fa-user" aria-hidden="true"></i>}&nbsp;&nbsp;{this.state.values.teamLeader}
                        </div>
                    </div>
                    <div className="form-group col-md-2">
                        <label htmlFor="department">{this.labels.department}:</label>
                        <Combo
                            className=""
                            items={this.state.lists.departments}
                            itemIdProperty='id'
                            itemDisplayProperty='name'
                            value={this.state.comboValues.department}
                            onChange={this.onChangeValue.bind(this, "department")}
                            id='department'
                        />
                    </div>
                    {this.state.campainInfoChanged &&
                        <div className="col-md-2">
                            <button className="btn btn-success"
                                onClick={this.saveCampainInfo.bind(this)}
                                style={{ ...this.btnStyle, color: '#4cae4c' }}>
                                <i className="fa fa-floppy-o" aria-hidden="true"></i>
                            </button>
                            <button className="btn btn-danger"
                                onClick={this.resetCampainInfo.bind(this)}
                                style={{ ...this.btnStyle, color: '#d43f3a' }}>
                                <i className="fa fa-repeat" aria-hidden="true"></i>
                            </button>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        teams: state.tm.employee.teams,
    }
}

export default connect(mapStateToProps)(withRouter(EmployeesHeader));
