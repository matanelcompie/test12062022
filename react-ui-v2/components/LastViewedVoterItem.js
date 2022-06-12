import React from 'react'
import { connect } from 'react-redux'
import * as SystemActions from '../actions/SystemActions'
import { Link, withRouter } from 'react-router'

class LastViewedVoterItem extends React.Component {

	setVoterName() {
		this.voterName = this.props.voter.first_name + " " + this.props.voter.last_name;
	}

	gotoVoter(e) {
		e.preventDefault();
		this.props.router.push("/elections/voters/" + this.props.voter.key);
		this.props.dispatch({type: SystemActions.ActionTypes.HEADER.TOGGLE_LAST_VIEWED_VOTERS_MENU});
	}

	render() {
		this.setVoterName();
		return (
			<li onClick={this.gotoVoter.bind(this)}><a href={this.props.router.location.basename +"elections/voters/" + this.props.voter.key}>{this.voterName}</a></li>
		)
	}

}

export default connect()(withRouter(LastViewedVoterItem))

