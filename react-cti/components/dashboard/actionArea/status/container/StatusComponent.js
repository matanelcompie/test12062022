import {connect} from 'react-redux';

import Status from '../display/Status';

function mapStateToProps(state, ownProps) {
    return {
        permissions: state.campaign.permissions
    };
}

function mapDispatchToProps(dispatch) {
    return {

    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Status);
