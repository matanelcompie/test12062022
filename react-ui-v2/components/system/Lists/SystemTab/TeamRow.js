import React from 'react';
import { connect } from 'react-redux';
import { withRouter, router } from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

class TeamRow extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    editRow() {
        this.props.router.push('/system/teams/' + this.props.item.key);
    }

    deleteRow() {
        this.props.updateScrollPosition();
        const teamkey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TEAM_DELETE_MODE_UPDATED, teamkey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_TEAM_MODAL_DIALOG_DISPLAY});
    }
    render() {
        return(
                <tr className="lists-row">
                    <td>{this.props.item.name}</td>
                    <td>
                        <span>
                            {this.props.item.leader_first_name}
                        </span>
                        <span className="pull-left edit-buttons">
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.teams.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.saveTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.teams.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.cancelTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }
}

function mapStateToProps(state) {
    return {
        teamKeyInSelectMode: state.system.listsScreen.systemTab.teamKeyInSelectMode,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(TeamRow));