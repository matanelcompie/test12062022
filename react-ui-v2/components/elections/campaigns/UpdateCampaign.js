import React from 'react';
import { withRouter } from 'react-router';

import AddElectionCampaign from './AddElectionCampaign';
import EditElectionCampaign from './EditElectionCampaign/EditElectionCampaign';


class UpdateCampaign extends React.Component {
    render() {
        if ( this.props.router.params.campaignKey == 'new' ) {
            return <AddElectionCampaign/>
        } else {
            return <EditElectionCampaign/>
        }
    }
}

export default withRouter(UpdateCampaign);