import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../actions/SystemActions';
import * as VoterActions from '../../../actions/VoterActions';

class SearchUser extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
        this.styleIgniter();
        this.state = {loadingUser: false}
        this.spinner = <i className="fa fa-spinner fa-pulse fa-fw"></i>;
    }

    componentWillMount() {
        // this.isLoadedStreets = true;
        this.props.dispatch({ type: SystemActions.ActionTypes.USERS.CLEAR_USERS_FORM });
    }

    componentDidUpdate() {
        // if (!this.isLoadedStreets && this.props.searchVoterResult.length > 0) {
        //     this.isLoadedStreets = true;
        //     SystemActions.loadStreets(this.props.dispatch, this.props.searchVoterResult[0].cityKey);

        // }

        // if (!this.isLoadedPhones && this.props.searchVoterResult.length > 0) {

        //     if (this.props.searchVoterResult[0] != undefined && this.props.searchVoterResult[0].phones != undefined) {
        //         if (this.props.searchVoterResult[0].phones.length > 0 || (this.props.searchVoterResult[0].email != null && this.props.searchVoterResult[0].email != undefined && this.props.searchVoterResult[0].email.trim() != '')) {

        //             this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_HIDE_COPY_VOTER_DETAILS_DLG, data: true });
        //             this.isLoadedPhones = true;
        //         }
        //     }
        // }

        if (!this.isReturned) {
            if (this.props.selectedVoterForRedirect.id != undefined) {
                this.isReturned = true;
                SystemActions.loadUser('identity', this.props.dispatch, this.props.router, this.props.selectedVoterForRedirect.personalIdentity);
                SystemActions.loadStreets(this.props.dispatch, this.props.selectedVoterForRedirect.cityKey);
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT});

            }
        }
    }

    textIgniter() {
        this.lables = {
            tz: 'ת"ז',
            viewUser: 'הצג משתמש',
            searchVoter: 'איתור תושב',
            returnButtonText: 'חזור למסך משתמש',
        }
    }

    styleIgniter() {
        this.mainContainerStyle = { paddingTop: '15px', paddingRight: '20px' };
    }

    /*handle key press "enter" at personal identity field */
    handleKeyPress(event) {
        if (event.charCode == 13) { /*if user pressed enter*/
            this.doSearchAction();
        }
    }

    /*Identity number change */
    TZChange(e) {
        let personal_identity = e.target.value;

        if (/^\d*$/.test(personal_identity)) {
            this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_T_Z_CHANGE, personal_identity });
        }
    }

    doSearchAction() {
        if (this.props.selectedUserData.personal_identity.length > 0) {
            this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.RESET_SEARCH_RESULT });
            this.props.dispatch({ type: SystemActions.ActionTypes.USERS.CLEAN_ADDING_USER });
            this.setState({loadingUser: true})
            SystemActions.loadUser('identity', this.props.dispatch, this.props.router, this.props.selectedUserData.personal_identity).then(() => {
                this.setState({loadingUser:false})
            });
            this.isLoadedPhones = false;
        }
    }

    /*user presses 'find voter' button at start*/
    searchVoterForRequest(e) {
        this.isReturned = false;
        this.isLoadedPhones = false;
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT });
        var returnUrl = 'system/users/new';

        var data = {
            returnUrl: returnUrl,
            returnButtonText: this.lables.returnButtonText
        };

        // This dispatch changes the parameters in data object
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_REDIRECT_TO_SEARCH, data: data });
        this.props.router.push('elections/voters/search');
    }

    render() {
        return (
            <section className="main-section-block" style={this.mainContainerStyle}>
                <div className="row">
                    <div className="col-md-1">
                        {this.lables.tz}:
					</div>
                    <div className="col-md-2">
                        <input type="text" className="form-control" value={this.props.selectedUserData.personal_identity}
                            maxLength={9} onKeyPress={this.handleKeyPress.bind(this)} onChange={this.TZChange.bind(this)} />
                    </div>
                    <div className="col-md-3">
                        <button type='submit' className="btn btn-primary btn-sm" onClick={this.doSearchAction.bind(this)} >{this.lables.viewUser}</button>&nbsp;
                         <button type='submit' className="btn btn-primary btn-sm" onClick={this.searchVoterForRequest.bind(this)} >{this.lables.searchVoter}</button>
                         {this.state.loadingUser ? this.spinner : null}
                    </div>
                </div>
            </section>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedUserData: state.system.selectedUserData,
        selectedVoterForRedirect: state.voters.searchVoterScreen.selectedVoterForRedirect,
    }
}

export default connect(mapStateToProps)(withRouter(SearchUser));