import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Combo from '../../../../global/Combo';
import { isValidComboValue } from '../../../../../libs/globalFunctions';


class BallotBoxRelatedVoterRowItem extends React.Component {

	constructor(props) {
		super(props);
		this.initConstants();
	}

	/*
	Init constant variables
	*/
	initConstants() {
		this.blueBorderStyle = { borderTop: '1px solid #498BB6', borderBottom: '1px solid #498BB6' };
	}

	/*
	init dynamic variable for render() function
	*/
	/*
	function that returns age by birthDate
	
	@param birthDate - in format yyyy-mm-dd
	*/
	getAgeByBirthDate(birthDate) {
		if (!birthDate) { return ""; }
		else {
			var date = new Date();
			var currentYear = date.getFullYear();
			var birthYear = "";
			var arrOfDatElements = [];

			arrOfDatElements = birthDate.split('-');
			birthYear = arrOfDatElements[0];

			if (null == birthDate) {
				return '\u00A0';
			} else {
				return currentYear - birthYear;
			}
		}
	}


	formatBallotValue(ballotBoxId) {

		if (!ballotBoxId) { return ''; }
		else {
			let ballotBoxStr = ballotBoxId + '';
			if (ballotBoxStr.length == 1) { return ballotBoxStr; }
			else {
				return ballotBoxStr.slice(0, ballotBoxStr.length - 1) + '-' + ballotBoxStr.slice(ballotBoxStr.length - 1);

			}
		}
	}

	render() {

		let item = this.props.item;
		return (
			<tr style={{ textAlign: 'right' }}>
				{/* <td className="num" >
					<div className="flexed">&nbsp;&nbsp;&nbsp;<span>{this.props.index  + 1}</span></div>
				</td> */}
				<td className="num" >
					<div className="flexed">&nbsp;&nbsp;&nbsp;<span>{this.props.voterIndexInHousehold}</span></div>
				</td>
				<td >{item.voter_serial_number}</td>

				<td >{item.voter_key}</td>
				<td >{item.last_name}</td>
				<td >{item.first_name}</td>
				<td >{item.city_name + (item.street? (', ' + item.street) : (item.direct_voter_street_name ? (', ' + item.direct_voter_street_name) : '')) + ' ' + ((item.house && parseInt(item.house) > 0) ? item.house : '') + ((item.flat && parseInt(item.flat) > 0) ? '/' + item.flat : '')}</td>

				{/* <td >{this.getAgeByBirthDate(item.birth_date)}</td> */}
				<td >{item.voter_phones.length >= 1 ? item.voter_phones[0].phone_number : ''}</td>
				<td >{item.voter_phones.length >= 2 ? item.voter_phones[1].phone_number : ''}</td>

				<td >{item.voter_transportations_id ? (item.crippled == '1' ? 'נכה' : 'כן') : 'לא'}</td>
				<td >{item.support_status_name}</td>
				<td >{item.captain_first_name} {item.captain_last_name}</td>
				<td>{item.prev_vote_time}</td>
			</tr>
		);
	}

}


function mapStateToProps(state) {
	return {

	}
}

export default connect(mapStateToProps)(withRouter(BallotBoxRelatedVoterRowItem));