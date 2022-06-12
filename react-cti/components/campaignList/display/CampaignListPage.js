import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import CampaignListHeader from './CampaignListHeader';
import CampaignListItem from './CampaignListItem';
import DuplicateUserModal from './DuplicateUserModal';

import * as callActions from '../../../actions/callActions';
import * as campaignActions from '../../../actions/campaignActions';
import * as systemActions from '../../../actions/systemActions';

import constants from 'libs/constants';


class CampaignListPage extends React.Component {
    componentWillMount() {
        if ( this.props.inCallScreen ) {
            callActions.leaveCallScreen(this.props.dispatch);
            campaignActions.resetActiveCampaign(this.props.dispatch);
        }
    }

    /**
     * check if duplicate modal should be shown
     *
     * @return boolean
     **/
    showDuplicateUserModal() {
        if (this.props.socketConnectionStatus == constants.webSocketConnectionStatus.duplicateUser) return true;
        else return false;
    }

    render() {
        let webDialer = this.props.webDialer;
        return (
            <div className="campaign-list-page">
                <CampaignListHeader userName={this.props.userName} />
                <div className="campaign-list-page__list">
                    {this.props.campaigns.map(item =>
                        <CampaignListItem campaign={item} key={item.key} webDialer={webDialer}/>)
                    }
                </div>
                {<DuplicateUserModal 
                    show={this.showDuplicateUserModal()}
                    disabledOkStatus={true}/>}
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        inCallScreen: state.call.inCallScreen,
        webDialer: state.system.webDialer,
        socketConnectionStatus: state.system.webSocket.connectionStatus,
    }
}

export default connect(mapStateToProps) (withRouter(CampaignListPage));
