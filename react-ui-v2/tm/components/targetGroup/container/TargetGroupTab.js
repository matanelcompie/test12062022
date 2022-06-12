import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import VoterFilter from 'components/global/voterFilter/container/VoterFilter';


class TargetGroupTab extends React.Component {
    constructor(props, context) {
        super(props, context);

    }

    render() {
        return (
            <VoterFilter moduleType="target_group" voterFilter={this.props.targetGroup} />
        );
    }
}

TargetGroupTab.propTypes = {
    targetGroup: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
    return {
        targetGroup: state.tm.portion.targetGroup,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        //
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TargetGroupTab);
