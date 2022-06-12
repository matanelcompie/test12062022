import {connect} from 'react-redux';

import ActionArea from '../display/ActionArea';

function mapStateToProps(state, ownProps) {
    return {
    	activeActionArea: state.ui.activeActionArea || "Household",
        nextCall: ownProps.nextCall
    };
}

function mapDispatchToProps(dispatch) {
    return {

    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionArea);