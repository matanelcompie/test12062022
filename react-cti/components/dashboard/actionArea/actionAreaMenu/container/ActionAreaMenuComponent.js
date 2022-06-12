import {connect} from 'react-redux';

import * as uiActions from 'actions/uiActions';
import ActionAreaMenu from '../display/ActionAreaMenu';

function mapStateToProps(state, ownProps) {
    return {
    	actionAreaMenuItems: state.ui.actionAreaMenuItems || [],
        activeActionArea: state.ui.activeActionArea,
        permissions: state.campaign.permissions
    };
}

function mapDispatchToProps(dispatch) {
    return {
    	 onAreaAcionMenuClick: (actionMenuName) => dispatch(uiActions.onMenuClick(actionMenuName)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionAreaMenu);
