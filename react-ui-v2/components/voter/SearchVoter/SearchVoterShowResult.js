import React from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router';
/**/
import SearchVoterResult from './SearchVoterResult';
import SearchVoterDetails from './SearchVoterDetails';
/**/
import * as VoterActions from '../../../actions/VoterActions';
/**/

class SearchVoterShowResult extends React.Component {

    constructor(props) {
        super(props);
        this.styleIgniter();
        this.textIgniter();
    }

    componentWillMount() {
        //VoterActions.loadTestVoters(this.props.dispatch, this.props.votersPage);
        //VoterActions.paintVoterResult(this.props.dispatch, this.props.searchVoterResult);
    }

    componentWillReceiveProps(nextProps) {
    }

    styleIgniter() {
    }

    textIgniter() {
        this.weHaveRows = '';
        this.createRequestForTempVoter = 'צור פנייה לתושב לא מזוהה';
    }

    setResultCountText() {

        let result = '';

        if (1 * this.props.searchVoterCount < 1) {
            result = <h3 className="noBgTitle">לא נמצאו רשומות</h3>;
        } else {
            result = <h3 className="noBgTitle">נמצאו&nbsp;<span className="rsltsCounter">{this.props.searchVoterCount}</span>&nbsp;רשומות</h3>;
        }

        this.weHaveRows = result;
    }

    renderLinkToUnknownVoter() {
        if ( this.props.currentUser.admin ||
            this.props.currentUser.permissions['crm.requests.unknown_voter.add'] == true ) {
            return <Link to='crm/requests/new/unknown'>{this.createRequestForTempVoter}</Link>;
        } else {
            return '\u00A0';
        }
    }

    render() {

        this.setResultCountText();

        return (
            <div className="resultsArea">
                <div className="row rsltsTitleRow">
                    <div className="col-sm-8 rsltsTitle">
                        {this.weHaveRows}
                    </div>
                    <div className="col-sm-4">
                        <div className="textLInk Larger pull-left">{this.renderLinkToUnknownVoter()}</div>
                    </div>
                </div>
                <div className="row nopaddingR nopaddingL">
                    <div className="col-sm-7">
                        <SearchVoterResult/>
                    </div>
                    <div className="col-sm-5">
                        <SearchVoterDetails/>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        searchVoterScreen: state.voters.searchVoterScreen,
        searchVoterLevel: state.voters.searchVoterScreen.searchVoterLevel,
        searchForParams: state.voters.searchVoterScreen.searchForParams,
        searchVoterResult: state.voters.searchVoterScreen.searchVoterResult,
        searchVoterDetails: state.voters.searchVoterScreen.searchVoterDetails,
        searchVoterLoading: state.voters.searchVoterScreen.searchVoterLoading,
        searchVoterCurrentPage: state.voters.searchVoterScreen.searchVoterCurrentPage,
        searchVoterHasMore: state.voters.searchVoterScreen.searchVoterHasMore,
        searchVoterCount: state.voters.searchVoterScreen.searchVoterCount,
        currentUser: state.system.currentUser,
    }
}
export default connect(mapStateToProps)(withRouter(SearchVoterShowResult));
