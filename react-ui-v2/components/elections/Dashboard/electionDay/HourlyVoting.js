import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import CircledGraph from './CircledGraph';
import LineChart from './LineChart';
import { numberWithCommas, isEmptyOrNotObject } from 'libs/globalFunctions';


class HourlyVoting extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			refreshLineChart : false
		}
	}
	componentWillReceiveProps(nextProps){
		if (this.props.searchEntityType != nextProps.searchEntityType) {
			let self = this;
			this.setState({ refreshLineChart: true })
			setTimeout(function(){
				self.setState({ refreshLineChart: false })
			})
		}
	}
	/*
		Get geo-filter title name by entity type
	*/
	getAreaTitleName() {
		switch (this.props.searchEntityType) {
			case 0:
				return "עיר";
			case 1:
				return "תת אזור";
			case 2:
				return "אשכול";
			case 3:
			case 4:
				return "קלפי";
			default:
				return "איזור";
		}
	}

	/*
		Returns sub entities array by entity type
	*/
	getGlobalSummaryDataArray() {
		let returnedArray = [];
		for (let id in this.props.generalAreasHashTable.areas) {
			returnedArray.push(this.props.generalAreasHashTable.areas[id]);
		}
		return returnedArray;
	}


	/*
		Function that get number that indicates percents , and returns the corresponding color - for small progress bars 
	*/
	getColorNameByPercent(number) {
		if (number >= 65) { return "green"; }
		else if (number >= 30) { return "yellow"; }
		else { return "red"; }
	}

	/** 
		API DATA MEANING : 
			h1- current hour
			h2- previous hour
			h3 - pre-previos hour
	*/
	renderEntityPreviousHours(item) {
	
		let divs = [];
		for (let i = 1; i < 4; i++) {
			divs.push(
				<td width="12%" key={i}>{(item.voteHourlyStats && item.voteHourlyStats['total_supporters_votes_count_h' + i] != undefined) ?
					numberWithCommas(item.voteHourlyStats['total_supporters_votes_count_h' + i].toString()) : 0}</td>
			)
		}
		return divs

	}
	getPrevHourVotes(currentHour, currentMinutes, voteHourlyStatsPrevList, itemField = 'percentage'){
		if(currentMinutes > 30){ currentHour ++;}
		let percentage = 0;
		currentHour = currentHour.toString();
		if(currentHour.length == 1){ currentHour = '0' + currentHour; }

		let currentTime =  currentHour + ':00:00'
		voteHourlyStatsPrevList.forEach((item) =>{
			if(currentTime == item.time){
				percentage = item[itemField];
			}
		})
		return percentage;
	}
	renderSubEntityHoursTable(summaryDataArray, nameOfCountObj) {
		const tableRows= [];
		let d =new Date()
		let currentHour =   d.getHours();
		let currentMinutes = d.getMinutes();

		let totalValues  = {
			'totalSupportersVotescount' : 0,
			'totalSupportersCount' : 0,
			'totalVotersCount' : 0,
			'totalVotesCount' : 0,
			'prevElectionsSupporterVotesNumber' : 0,
			'prevElectionsAllVotesNumber' : 0,
			'prevElectionsSupporterVotesTotal' : 0,
			'prevElectionsAllVotesTotal' : 0,
		};
		let totalPercentagesObj ={
			'currentSupportersVotesPercentage': 0,
			'currentVotesPercentage': 0,
			'prevElectionsSupporterVotesPercentage': 0,
			'prevElectionsAllVotesPercentage': 0,
		}
		summaryDataArray.forEach( (item, index) => {
			if (!item.voteStats || item.voteStats.empty) { return; }
			let currentVoteStats = null;


			let itemValues = {... totalValues};
			let percentagesObj = {... totalPercentagesObj};

			// let notVotedSupportersCount = 0;

			currentVoteStats = item.voteStats[nameOfCountObj];

			if (currentVoteStats.total_supporters_votes_count && currentVoteStats.total_supporters_count) {
				itemValues['totalSupportersVotescount'] = parseInt(currentVoteStats.total_supporters_votes_count);
				itemValues['totalSupportersCount'] = parseInt(currentVoteStats.total_supporters_count);
				percentagesObj['currentSupportersVotesPercentage'] = this.props.getFormattedPercentage(itemValues['totalSupportersVotescount'], itemValues['totalSupportersCount']);
				// notVotedSupportersCount = totalSupportersCount - totalSupportersVotescount;
			}
			if (currentVoteStats.total_votes_count && currentVoteStats.total_voters_count) {
				itemValues['totalVotersCount'] = parseInt(currentVoteStats.total_voters_count);
				itemValues['totalVotesCount'] = parseInt(currentVoteStats.total_votes_count);
				percentagesObj['currentVotesPercentage'] = this.props.getFormattedPercentage(itemValues['totalVotesCount'], itemValues['totalVotersCount']);
				// notVotedSupportersCount = total_voters_count - total_votes_count;
			}
			if(item.voteHourlyStatsPrev && item.voteHourlyStatsPrev.geo_supporters_votes && item.voteHourlyStatsPrev.geo_supporters_votes[nameOfCountObj]){
				let geoSupportersVotesCountObj = item.voteHourlyStatsPrev.geo_supporters_votes[nameOfCountObj]
				percentagesObj['prevElectionsSupporterVotesPercentage'] = this.getPrevHourVotes(currentHour, currentMinutes, geoSupportersVotesCountObj);
				itemValues['prevElectionsSupporterVotesNumber'] = this.getPrevHourVotes(currentHour, currentMinutes, geoSupportersVotesCountObj ,'count');
				itemValues['prevElectionsSupporterVotesTotal'] = geoSupportersVotesCountObj[0] ? geoSupportersVotesCountObj[0]['total'] : 0;
			}

			if(item.voteHourlyStatsPrev && item.voteHourlyStatsPrev.geo_all_voters_votes && item.voteHourlyStatsPrev.geo_all_voters_votes[nameOfCountObj]){
				let geoAllVotersVotesCountObj = item.voteHourlyStatsPrev.geo_all_voters_votes[nameOfCountObj]
				percentagesObj['prevElectionsAllVotesPercentage'] = this.getPrevHourVotes(currentHour, currentMinutes, geoAllVotersVotesCountObj);
				itemValues['prevElectionsAllVotesNumber'] = this.getPrevHourVotes(currentHour, currentMinutes, geoAllVotersVotesCountObj ,'count');
				itemValues['prevElectionsAllVotesTotal'] = geoAllVotersVotesCountObj[0] ? geoAllVotersVotesCountObj[0]['total'] : 0;

			}

			// Update totals values:
			for (let fieldName in itemValues){
				totalValues[fieldName] += itemValues[fieldName]; 
			}


			tableRows.push(this.getHourlyVotesRow(index, item, itemValues, percentagesObj));
		})
		let totalItem = {
			name : 'סה"כ',
			entity_type : -1,
		}
		// console.log(totalValues);
		if(totalValues['totalSupportersCount'] > 0){
			totalPercentagesObj['currentSupportersVotesPercentage'] = this.props.getFormattedPercentage(totalValues['totalSupportersVotescount'], totalValues['totalSupportersCount']);
		}
		if(totalValues['totalVotersCount'] > 0){
			totalPercentagesObj['currentVotesPercentage'] = this.props.getFormattedPercentage(totalValues['totalVotesCount'], totalValues['totalVotersCount']);
		}

		if(totalValues['prevElectionsSupporterVotesTotal'] > 0){
			totalPercentagesObj['prevElectionsSupporterVotesPercentage'] = this.props.getFormattedPercentage(totalValues['prevElectionsSupporterVotesNumber'], totalValues['prevElectionsSupporterVotesTotal']);
		}
		if(totalValues['prevElectionsAllVotesTotal'] > 0){
			totalPercentagesObj['prevElectionsAllVotesPercentage'] = this.props.getFormattedPercentage(totalValues['prevElectionsAllVotesNumber'], totalValues['prevElectionsAllVotesTotal']);
		}


		let totalRow = this.getHourlyVotesRow('total', totalItem, totalValues, totalPercentagesObj)
		tableRows.push(totalRow);

		return tableRows;
	}
	getHourlyVotesRow(index, item, itemValues, percentsObj){
		// let exportLink = 'api/elections/dashboard/elections_day/print?entity_type=' + item.entity_type + '&entity_key=' + item.key;

		let colTitle = item.name;
		let onClickFunction = this.props.doSearchAction.bind(this, item.entity_type, item.key, item.id);
		let onClickStyle = { cursor: 'pointer' };
		if (item.entity_type == 4 ) {
			let name = item.name.toString();
			colTitle = name.substring(0, name.length - 1) + '.0';
			onClickFunction = null;
			onClickStyle= {};
		}
		if(item.entity_type == -1){
			onClickFunction = null;
			onClickStyle= {};
		}
		let currentSupportersVotesPercentage = percentsObj['currentSupportersVotesPercentage'];
		let currentVotesPercentage = percentsObj['currentVotesPercentage'];
		let prevElectionsSupporterVotesPercentage = percentsObj['prevElectionsSupporterVotesPercentage'];
		let prevElectionsAllVotesPercentage = percentsObj['prevElectionsAllVotesPercentage'];
		let rowStyle = index != 'total' ?  {} : {borderTop : '2px #ccc solid '}
		return (
			<tr key={"summaryRow" + index} style={rowStyle}>
							<td width="110px" style={onClickStyle} onClick={onClickFunction}>{this.props.truncateText(colTitle, 19)}</td>
							<td width="100px">{numberWithCommas(itemValues['totalSupportersCount'])}</td>
							<td width="100px"><div className="light-green-bg">{numberWithCommas(itemValues['totalSupportersVotescount'])} </div></td>
							<td width="120px">
									{currentSupportersVotesPercentage}% 
								<span className={"" + this.getColorNameByPercent(currentSupportersVotesPercentage) + "-precentage"}>
									<span className="progress" >
											<span className={"progress-bar progress-bar-striped active " + this.getColorNameByPercent(currentSupportersVotesPercentage) + "-progress"}
											role="progressbar" aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{ width: (currentSupportersVotesPercentage + "%") }}> </span>
										</span>
								</span>
							</td>
										

							<td width="100px">{numberWithCommas(itemValues['totalVotersCount'])}</td>
							<td width="100px">{numberWithCommas(itemValues['totalVotesCount'])}</td>
							<td width="80px"> <span> {currentVotesPercentage}% </span></td>

							<td width="100px">{numberWithCommas(itemValues['prevElectionsSupporterVotesNumber'])}</td>
							<td width="80px"> <span> {prevElectionsSupporterVotesPercentage}% </span></td>

							<td width="100px">{numberWithCommas(itemValues['prevElectionsAllVotesNumber'])} </td>
							<td width="80px"><span>{prevElectionsAllVotesPercentage}%</span></td>
							{/* <td width="13%">
								<div className="light-red-bg" >
									{notVotedSupportersCount > 0 ?
										<Link title="יצוא ל-excel" to={exportLink} target="_blank">{numberWithCommas(notVotedSupportersCount)}</Link>
										:
										<span>{notVotedSupportersCount}</span>
									}</div>
							</td> */}
							{/* {this.renderEntityPreviousHours(item)} */}
				</tr>
		)
	}
	render() {
		const nameOfCountObj = this.props.getDisplayCountObjName(null);
		const displayReportingMode = (nameOfCountObj == 'ballots_reporting_count_data') ? true : false;

		let currentDate = new Date();
		let currentHour = currentDate.getHours();
		this.formattedCurrentHour = ((currentHour < 10 ? ("0" + currentHour) : currentHour) + ":00");
		this.formattedExtendedCurrentHour = this.formattedCurrentHour + ":00";
		this.formattedNextHour = ((currentHour < 9 ? "0" + (currentHour + 1) : (currentHour + 1)) + ":00");
		this.formattedPreviousHour = ((currentHour < 11 ? "0" + (currentHour - 1) : (currentHour - 1)) + ":00");
		this.formattedPrePreviousHour = ((currentHour < 12 ? "0" + (currentHour - 2) : (currentHour - 2)) + ":00");

		let parentObject = this.props.getParentArrayByEntityType(true);
		const loaderSpinner = (parentObject.voteStats && parentObject.voteStats.empty) ? '---' : <i className="fa fa-spinner fa-spin"></i>;
		// console.log('parentObject',parentObject);
		let summaryDataArray;
		if (this.props.searchEntityType != -1) {
			summaryDataArray = parentObject.childrensData;
		} else {
			summaryDataArray = this.getGlobalSummaryDataArray()
		}

		// Sorting by supporters ->doing problems!
		/*
		if (summaryDataArray && displayThisTab) {
			summaryDataArray = summaryDataArray.sort(
				function (a, b) {
					if (!b.voteStats || !a.voteStats) { return 0 }
					if (a.voteStats[nameOfCountObj].total_supporters_votes_count > b.voteStats[nameOfCountObj].total_supporters_votes_count)
						return -1;
					if (a.voteStats[nameOfCountObj].total_supporters_votes_count < b.voteStats[nameOfCountObj].total_supporters_votes_count)
						return 1;
					return 0;
				}
			);
		}
		*/
		let votesData; 

		let geoEntitySupportersVotersPercent = [];
		let geoEntityVotersPercents = [];
		let geoEntityVotersPercentPrev =null;

		if (this.props.searchEntityType == -1 && this.props.geoEntityAllVotersPercents) {
			geoEntityVotersPercents = this.props.geoEntityAllVotersPercents ? this.props.geoEntityAllVotersPercents[nameOfCountObj] : [];
			geoEntityVotersPercentPrev = this.props.geoEntityAllVotersPercentsPrev ? this.props.geoEntityAllVotersPercentsPrev[nameOfCountObj]: [];
			geoEntitySupportersVotersPercent = this.props.geoEntitySupportersVotersPercents ? this.props.geoEntitySupportersVotersPercents[nameOfCountObj] : [];
			// geoEntitySupportersVotersPercentsPrev

		} else if (parentObject && parentObject.voteHourlyStats && parentObject.voteHourlyStats.geo_all_voters_votes[nameOfCountObj]) {
		// console.log(parentObject, parentObject.voteHourlyStatsPrev)

			geoEntityVotersPercents = parentObject.voteHourlyStats ? parentObject.voteHourlyStats.geo_all_voters_votes[nameOfCountObj] :[];
			geoEntityVotersPercentPrev = parentObject.voteHourlyStatsPrev ? parentObject.voteHourlyStatsPrev.geo_all_voters_votes[nameOfCountObj] : [];
			geoEntitySupportersVotersPercent = parentObject.voteHourlyStats ? parentObject.voteHourlyStats.geo_supporters_votes[nameOfCountObj] : [];

		}
		let displayVotesLineChart = geoEntityVotersPercentPrev != null && geoEntitySupportersVotersPercent != null && geoEntityVotersPercents != null;
		// console.log(displayVotesLineChart , geoEntitySupportersVotersPercent , geoEntityVotersPercents);

		if (displayVotesLineChart) {
			votesData = [
				geoEntityVotersPercents,
				geoEntityVotersPercentPrev,
				geoEntitySupportersVotersPercent
			]

		}
		let totalVotedSupporters = 0;
		let totalSupportersCount = 0;
		if (this.props.searchEntityType == -1) {
			totalSupportersCount = this.props[nameOfCountObj].total_supporters_count;
			totalVotedSupporters = this.props[nameOfCountObj].total_supporters_votes_count;
		}
		else {
			if (parentObject && parentObject.voteStats) {
				if (parentObject.voteStats[nameOfCountObj]) {
					totalSupportersCount = parentObject.voteStats[nameOfCountObj].total_supporters_count;
					totalVotedSupporters = parentObject.voteStats[nameOfCountObj].total_supporters_votes_count;
				} else if (parentObject.voteStats.empty) {
					totalSupportersCount = 0;
					totalVotedSupporters = 0;
				}
			}
		}
		
		return (
			<div role="tabpanel" className="tab-pane by-hours-top-erea" id="by-hours">
				<div className="legend-erea">
					<div className="legend-election-day pull-left">
						אחוז הצבעה בקרב תומכי ש”ס
                                <span className={"legend-square precentage-shas" + (this.props.displayAllCountry ? '' : "-erea")}></span>
					</div>
					<div className="legend-election-day pull-left">
						אחוז הצבעה ארצי חזוי
                                <span className="legend-square precentage-predicted"></span>
					</div>
					<div className="legend-election-day pull-left">
						אחוז הצבעה כללי
                                <span className="legend-square precentage-actual"></span>
					</div>
				</div>
				<div className="dtlsBox-vote-dashboard">
					<div className="col-md-3 nopadding">
						<div className="col-md-6 total-circle-graph">
							<CircledGraph color={this.props.displayAllCountry ? "#006633" : "#323a6c"} data={totalSupportersCount} percent={this.props.getFormattedPercentage(totalVotedSupporters, totalSupportersCount) / 100} />
						</div>
						<div className="col-md-6 nopadding">
							<div>
								<div className="icon-up-supporters"><img src={window.Laravel.baseURL + "Images/up-icon.png"} alt="תומכים" /></div>
								<div className="pull-right">
									<div className="text-supporters">עד כה הצביעו</div>
									<div className="sum-supporters-green" style={{ color: (this.props.displayAllCountry ? '' : '#498BB6') }}>
									{(totalVotedSupporters != null && totalVotedSupporters != undefined) ? totalVotedSupporters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : loaderSpinner}</div>
									<div className="text-supporters">תומכים</div>
								</div>
							</div>
							<div className="remaining-supporters">
								<div className="icon-up-supporters"><img src={window.Laravel.baseURL + "Images/up-icon.png"} alt="תומכים" /></div>
								<div className="pull-right">
									<div className="text-supporters">נותרו</div>
									<div className="sum-supporters-grey">{numberWithCommas(parseInt(totalSupportersCount - totalVotedSupporters))}</div>
									<div className="text-supporters">תומכים להצבעה</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-md-9 margin-top20">
						{(displayVotesLineChart && this.props.currentTabNumber == 2 && !this.state.refreshLineChart) ?
							<div>
								{!displayReportingMode && <div>
									<LineChart data={votesData} VoteElectionsHours={this.props.VoteElectionsHours} style={{ clear: 'both' }} colors={["#3A76A9", "#9CB9BF", "#99CC99"]} />
								</div>}
								{displayReportingMode && <div>
									<LineChart data={votesData} VoteElectionsHours={this.props.VoteElectionsHours} style={{ clear: 'both' }} colors={["#3A76A9", "#9CB9BF", "#99CC99"]} />
								</div>}
							</div>
							: <div style={{ textAlign: 'center', fontSize: '23px' }}>אין נתונים עבור גרף</div>}
					</div>
				</div>
				<div className="dtlsBox-vote-dashboard election-day-hours-bottom">
					<table id="supporters-hours-table" className="supporters-hours-table">
						<thead>
							<tr className="supporters-hours-table-title">
								<td colSpan="1"></td>
								<td colSpan="3" style={{ textAlign: 'center' }}>תומכים (מערכת נוכחית )</td>
								<td colSpan="3"style={{ textAlign: 'center' }}>כלל ארצי (מערכת נוכחית)</td>
								<td colSpan="2" style={{ textAlign: 'center' }}>תומכים (מערכת קודמת )</td>
								<td colSpan="2"style={{ textAlign: 'center' }}>כלל ארצי (מערכת קודמת)</td>
							</tr>
							<tr className="titles-hours-table">
								<td width="110px">{this.getAreaTitleName()}</td>
								<td width="100px"> סה"כ</td>
								
								<td width="100px" >הצביעו עד כה</td>
								<td width="120px" >התקדמות</td>

								<td width="100px">סה"כ בוחרים</td>

								<td width="100px">הצביעו עד כה</td>
								<td width="80px">באחוזים</td>

								<td width="100px">הצביעו עד השעה המקבילה</td>
								<td width="80px">באחוזים</td>

								<td width="100px">הצביעו עד השעה המקבילה</td>
								<td width="80px">באחוזים</td>

							</tr>
						</thead>
						<tbody>
							<tr>
								<td colSpan="12" className="insise-erea-hours">
									<div className="inside-table-hours">
										<table className="supporters-hours-table inside-supporters-hours-table">
											<tbody>
												{isEmptyOrNotObject(summaryDataArray) ? 
													<tr><td colSpan="4" style={{textAlign:'center'}}>אין נתונים</td></tr>
													: this.renderSubEntityHoursTable(summaryDataArray, nameOfCountObj)}
											</tbody>
										</table>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}
function mapStateToProps(state) {
	return {
		generalAreasHashTable: state.elections.electionsDashboard.generalAreasHashTable,
		currentTabNumber: state.elections.electionsDashboard.currentTabNumber,
		searchEntityType: state.elections.electionsDashboard.searchEntityType,
		searchEntityKey: state.elections.electionsDashboard.searchEntityKey,
		ballots_count_data: state.elections.electionsDashboard.ballots_count_data,
		ballots_reporting_count_data: state.elections.electionsDashboard.ballots_reporting_count_data,
		displayAllCountry: state.elections.electionsDashboard.displayAllCountry,
		// generalPredictedVotesPercents: state.elections.electionsDashboard.generalPredictedVotesPercents,
		geoEntitySupportersVotersPercents: state.elections.electionsDashboard.geoEntitySupportersVotersPercents,
		geoEntityAllVotersPercents: state.elections.electionsDashboard.geoEntityAllVotersPercents,
		geoEntitySupportersVotersPercentsPrev:state.elections.electionsDashboard.geoEntitySupportersVotersPercentsPrev,
		geoEntityAllVotersPercentsPrev:state.elections.electionsDashboard.geoEntityAllVotersPercentsPrev,
		VoteElectionsHours: state.elections.electionsDashboard.VoteElectionsHours,
	}
}
export default connect(mapStateToProps)(withRouter(HourlyVoting));