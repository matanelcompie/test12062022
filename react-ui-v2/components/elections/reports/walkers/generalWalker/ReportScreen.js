import React from 'react';

import TopFirstSearch from './TopFirstSearch';
import ReportSearchResults from './ReportSearchResults';
import * as SystemActions from 'actions/SystemActions';
import { connect } from 'react-redux';

class ReportScreen extends React.Component {
	constructor(props) {
		super(props);
	}
	
	componentWillMount(){
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'הליכון' });
	}

	render() {
		return (
			<div className="container">
				<div className="row">
					<div className="col-md-6 text-right">
						<h1>הליכון</h1>
					</div>
				</div>

				<TopFirstSearch/>
				<ReportSearchResults />
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		
	}
}

export default connect(mapStateToProps )(ReportScreen);