import React from 'react';
import { withRouter } from 'react-router';

class CaptainFiftyRelatedVoterRowItem extends React.Component {

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
	initDynamicVariables(currentVoter) {

		this.commentImageItem = null;
		if (currentVoter.comment && currentVoter.comment.split(' ').join('') != '') {
			this.commentImageItem = <span><img src={window.Laravel.baseURL + "Images/yes-comment.png"} style={{ cursor: 'pointer' }}
				onClick={this.props.showComment.bind(this, currentVoter.comment)} /></span>;
		}
		else {
			this.commentImageItem = <span><img src={window.Laravel.baseURL + "Images/no-comment.png"} /></span>;
		}

	}

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

    getBallotMiId(ballotMiId) {
        var miIdStr = ballotMiId.toString();
        var lastDigit = miIdStr.charAt(miIdStr.length - 1);

        return (miIdStr.substring(0, miIdStr.length - 1) + '.' + lastDigit);
    }

	render() {
		let currentVoter = this.props.currentVoter;
		this.initDynamicVariables(currentVoter);
		return (
			<tr  style={{textAlign: 'right' }}>
				{/* <td className="num" >
					<div className="flexed">&nbsp;&nbsp;&nbsp;<span>{this.props.index  + 1}</span></div>
				</td> */}
				<td className="num" >
					<div className="flexed">&nbsp;&nbsp;&nbsp;<span>{this.props.voterIndexInHousehold}</span></div>
				</td>
				<td >{((currentVoter.street) ? '' + currentVoter.street : '') + ' ' +
					((currentVoter.house && parseInt(currentVoter.house) > 0) ? currentVoter.house : '') +
					((currentVoter.flat && parseInt(currentVoter.flat) > 0) ? '/' + currentVoter.flat : '')}</td>

				<td >{currentVoter.last_name}</td>
				<td >{currentVoter.first_name}</td>
				<td >{currentVoter.voter_key}</td>
				{/* <td >{this.getAgeByBirthDate(currentVoter.birth_date)}</td> */}
				<td >{currentVoter.voter_phones.length >= 1 ? currentVoter.voter_phones[0].phone_number : ''}</td>
				<td >{currentVoter.voter_phones.length >= 2 ? currentVoter.voter_phones[1].phone_number : ''}</td>
				<td >
					{currentVoter.support_status_name}
				</td>
				<td>
					{currentVoter.not_at_home == '1' ? 'כן' : 'לא'}
				</td>
				<td >{currentVoter.voter_transportations_id ? (currentVoter.crippled == '1' ? 'נכה' : 'כן') : 'לא'}</td>
				<td >{this.commentImageItem}</td>
				<td >{currentVoter.cluster_city_name + ', ' + (currentVoter.cluster_name ? currentVoter.cluster_name : '') +
					(currentVoter.cluster_name && currentVoter.cluster_street ? ' , ' : '') +
					(currentVoter.cluster_street ? currentVoter.cluster_street : '')}</td>
				<td >{this.getBallotMiId(currentVoter.mi_id)}</td>
				<td >{currentVoter.voter_serial_number}</td>
				<td>{currentVoter.prev_vote_time}</td>
			</tr>
		);
	}

}


export default withRouter(CaptainFiftyRelatedVoterRowItem);