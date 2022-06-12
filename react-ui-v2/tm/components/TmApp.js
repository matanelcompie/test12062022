import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as systemActions from 'tm/actions/systemActions';
import * as campaignActions from 'tm/actions/campaignActions';
import * as VoterFilterActions from 'actions/VoterFilterActions';

import ConfirmAlert from 'tm/components/common/ConfirmAlert';


class TmApp extends React.Component {
    constructor(props, context) {
        super(props, context);

    }

    componentWillMount() {
        this.props.systemActions.getOptionLabels();
        this.props.systemActions.getAllLists();
        this.props.VoterFilterActions.loadElectionCampaigns();
        this.props.VoterFilterActions.loadCurrentElectionCampaign();
    }

    render() {
        return (
            <div>
                {this.props.children}
                <ConfirmAlert />
            </div>
        );
    }
}

TmApp.propTypes = {
    children : PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        //
    };
}

function mapDispatchToProps(dispatch) {
    return {
        systemActions: bindActionCreators(systemActions, dispatch),
        VoterFilterActions: bindActionCreators(VoterFilterActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TmApp);
