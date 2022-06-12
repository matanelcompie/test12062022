import {connect} from 'react-redux';
import R from 'ramda';

import CampaignListPage from '../display/CampaignListPage';


function mapStateToProps(state, ownProps) {
    let userName = R.isEmpty(state.system.currentUser) ? "" : state.system.currentUser.first_name + ' ' + state.system.currentUser.last_name;
    return {
        userName,
        campaigns: state.campaign.list,
    };
}

function mapDispatchToProps(dispatch) {
    return {

    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CampaignListPage);
