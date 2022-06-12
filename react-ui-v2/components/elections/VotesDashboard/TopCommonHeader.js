import React from 'react';
import { withRouter } from 'react-router';

class TopCommonHeader extends React.Component {
	
	/*
		Handles clicking "go back" button
	*/
	goBack(){
		this.props.router.push("elections/votes/dashboard");
	}
	
	render() {
		let baseURL = window.Laravel.baseURL;
		return (<div className="row">
						<div className="col-md-6 text-right">
							<h1>{this.props.screenName}</h1>
						</div>
						<a className="cursor-pointer" onClick={this.goBack.bind(this)}> <div className="pull-left back-to-main paddingL20">
                        חזור לדף ראשי&nbsp;<img src={baseURL +"Images/arrow-back.png"} alt="חזור לדף ראשי" /></div></a>
				</div>
		);
	}
}
 
export default  withRouter(TopCommonHeader) ;