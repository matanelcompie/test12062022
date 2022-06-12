import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
/**/
import SearchVoterFilterPanel from './SearchVoterFilterPanel';
import SearchVoterShowResult from './SearchVoterShowResult';
/**/
import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';
import globalSaving from '../../hoc/globalSaving';

class SearchVoter extends React.Component {

    constructor(props) {
        super(props);

        this.textIgniter();
        this.isPermissionsLoaded = false;
    }

    componentWillMount() {
        this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: this.screenTitle});

        if (undefined == this.props.searchVoterLevel) {
        } else {
            if (true == this.props.searchVoterLevel.base) {
                //VoterActions.setVoterSearchLevelBase(this.props.dispatch);
                return;
            }

            if (true == this.props.searchVoterLevel.advanced) {
                //VoterActions.setVoterSearchLevelAdvanced(this.props.dispatch);
                return;
            }

            if (true == this.props.searchVoterLevel.ballot) {
                //VoterActions.setVoterSearchLevelBallot(this.props.dispatch);
                return;
            }
        }
    }

    componentDidMount() {
        window.scrollTo(0,0);
        this.checkPermissions();
    }

    componentDidUpdate() {
        this.checkPermissions();
    }

    checkPermissions() {
        if (this.props.currentUser.first_name.length && !this.isPermissionsLoaded) {
            this.isPermissionsLoaded = true;
            if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.voter.search'])) {
				/**
                 * 
                 */
            } else {
                this.props.router.replace('/unauthorized');
            }
        }
    }

    textIgniter() {
        this.screenTitle = 'איתור תושב';
    }

    render() {
        return (
            <div>
                <div className="row pageHeading1">
                    <h1>{this.screenTitle}</h1>
                </div>
                <SearchVoterFilterPanel />
                <SearchVoterShowResult />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        searchVoterLevel: state.voters.searchVoterScreen.searchVoterLevel,
        currentUser: state.system.currentUser,
    }
}

export default globalSaving(connect(mapStateToProps)(withRouter(SearchVoter)));
