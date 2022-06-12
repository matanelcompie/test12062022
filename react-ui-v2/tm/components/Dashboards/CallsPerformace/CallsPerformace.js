import React from 'react';
import { connect } from 'react-redux';
import ChangeCampaignView from '../ChangeCampaignView';
import CallsStatsGraphs from './CallsStatsGraphs';
import PerformanceTables from './PerformanceTables';

class CallsPerformace extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
		let self = this;
        return (
			<div className="stripMain campain-management">
				<div className="container status-2-erea">
					<div className="tm-first-box-on-page">
						<ChangeCampaignView />
						<CallsStatsGraphs />
						<PerformanceTables/>
					</div>
				</div>
			</div>
        );
    }
}
function mapStateToProps(state) {
    return {
        campaignsList: state.tm.campaign.list,
		callsPerformanceStats: state.tm.campaign.callsPerformanceStats,
    };
}
export default connect(mapStateToProps)(CallsPerformace);