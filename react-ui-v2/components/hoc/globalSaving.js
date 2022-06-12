import React from 'react'
import * as SystemActions from '../../actions/SystemActions'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

/*
/	Class for adding route changes listener.
/	this enables us to show modal if the user changed something and did not saved it yet
*/
const globalSaving =  function(WrappedComponent) {
	class hoc extends React.Component {
		constructor(props) {
			super(props);
			this.beforeUnload = this.beforeUnloadCallback.bind(this);
			this.props.router.setRouteLeaveHook(this.props.route, this.shouldRouteChange.bind(this));
		}

		//Add event for refreshing or leaving the site (outside of react)
		componentWillMount() {
			window.addEventListener("beforeunload", this.beforeUnload, false);

		}

		//Remove the added event
		componentWillUnmount() {
			window.removeEventListener("beforeunload", this.beforeUnload, false);
		}

		//The same as react router setRouteLeaveHook callback, but for url change or refresh
		beforeUnloadCallback(e) {
			if ((this.props.dirty)&&(!this.props.ignoreDirty)) e.returnValue = "ישנם שינויים שלא נשמרו. האם את/ה בטוח/ה?";
		}

		shouldRouteChange(nextTransition) {
			if ((this.props.dirty)&&(!this.props.ignoreDirty)) {
				this.props.dispatch({type: SystemActions.ActionTypes.SAVE_CHANGES_MODAL_SHOW, gotoUrl: nextTransition.pathname});
				return false;
			}
		}

		componentWillReceiveProps(nextProps) {
			if ((!this.props.ignoreDirty)&&(nextProps.ignoreDirty)) {
	            this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'all'});
	        }
	        if ((this.props.ignoreDirty)&&(!nextProps.ignoreDirty)) {
	        	this.props.router.push(this.props.gotoUrl);
	        }
		}

		render() {
			return <WrappedComponent {...this.props}/>
		}
	}

	function mapStateToProps(state) {
		return {
			dirty: state.system.dirty,
			ignoreDirty: state.system.ignoreDirty,
			saveChangesModalShow: state.system.saveChangesModalShow,
			gotoUrl: state.system.gotoUrl
		}
	}
	return connect(mapStateToProps)(withRouter(hoc));
}

export default globalSaving
