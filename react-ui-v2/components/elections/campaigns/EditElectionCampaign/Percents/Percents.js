import React from 'react';
import { connect } from 'react-redux';

import PercentItem from './PercentItem';

import * as ElectionsActions from 'actions/ElectionsActions';


class Percents extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // Object with time
            // as a key and the
            // time index in the array
            timeHash: {}
        };
    }

    componentWillMount() {
        ElectionsActions.loadCampaignVotesPercents(this.props.dispatch, this.props.campaignKey);
    }

    renderPercents() {
        let percentItems = [];
 
        if ( this.props.campaignDetails.vote_start_time == null ) {
            return;
        }
		
		let electionDate = this.props.campaignDetails.election_date;

        let electionDateArr = electionDate.split('-');
        let voteStartTimeArr = this.props.campaignDetails.vote_start_time.split(':');
        let voteEndTimeArr = this.props.campaignDetails.vote_end_time.split(':');

        let dt = new Date(electionDateArr[0], electionDateArr[2], electionDateArr[2], voteStartTimeArr[0], voteStartTimeArr[1],
                          voteStartTimeArr[2]);
				 
        let startHour = dt.getHours() + 1;

        dt = new Date(electionDateArr[0], electionDateArr[2], electionDateArr[2], voteEndTimeArr[0], voteEndTimeArr[1],
                          voteEndTimeArr[2]);
        let endHour = dt.getHours();
		
        for (let hour in this.props.campaignVotesPercents){
            let nextHour = parseInt(hour) + 1;
            let item = this.props.campaignVotesPercents[hour]

            let time = (nextHour < 10 ? '0' + nextHour : nextHour) + ':00:00';

            percentItems.push(
                <PercentItem key={nextHour} time={time} campaignKey={this.props.campaignKey} item={item} />
            )
        }

        return <tbody>{percentItems}</tbody>;
    }

    render() {
        return (
            <div role="tabpanel" className={"percents tab-pane" + (this.props.display ? " active" : "")} id={"Tab-" + this.props.tabKey}>
                <div className="container-tab">
                    <div className="table-container">
                        <table className="table line-around table-striped table-status">
                            <thead>
                            <tr>
                                <th>עד שעה</th>
                                <th>אחוז הצבעה</th>
                                <th>אחוז הצבעה תומכים</th>
                                <th>אחוז הצבעה קליפות מדווחות</th>
                                <th>אחוז הצבעה תומכים קליפות מדווחות</th>
                                <th>חלק מהיום</th>
                                {/* <th>{'\u00A0'}</th> */}
                            </tr>
                            </thead>

                            {this.renderPercents()}
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        loadedPercentsFlag: state.elections.electionsCampaignsScreen.percents.loadedPercentsFlag,
        campaignVotesPercents: state.elections.electionsCampaignsScreen.percents.campaignVotesPercents
    };
}

export default connect(mapStateToProps) (Percents);