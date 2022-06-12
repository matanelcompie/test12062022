import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as ElectionsActions from '../../../../actions/ElectionsActions';

import StrippedBarChart from './StrippedBarChart';
import {geographicEntityTypes} from 'libs/constants'
import {formatBallotMiId, numberWithCommas} from 'libs/globalFunctions'

class VotingPanelTab extends React.Component {
    constructor(props) {
        super(props);
    }
	
	getGraphNumber(stringNumber){
		return stringNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	}
	/*
		Function that dynamically renders the graph by entity type and entity id , and other params
	*/
	getGraphSection(title, voteStats, colorsArray, entityType = null, entityKey = null, innerItemId = null) {
		const nameOfCountObj = this.props.getDisplayCountObjName(entityType);
		const loaderSpinner = (voteStats && voteStats.empty) ? 0 : <i className="fa fa-spinner fa-spin"></i>;
		title = title ? title : '';
		let globalSupportersVotesPercentage = 0;
		let globalVotesPercentage = 0;
		let lowSupportersVotingPercent = false;

		if(voteStats && voteStats[nameOfCountObj]){
			let voteStatsObj = voteStats[nameOfCountObj];
			
			var current_total_voters_count = voteStatsObj['total_voters_count'];
			var current_total_votes_count = voteStatsObj['total_votes_count'];
			var current_total_supporters_count = voteStatsObj['total_supporters_count'];
			var current_total_supporters_votes_count = voteStatsObj['total_supporters_votes_count'];
			var ballots_count = voteStatsObj['ballots_count'];

			globalSupportersVotesPercentage = this.props.getFormattedPercentage(current_total_supporters_votes_count, current_total_supporters_count);
			globalVotesPercentage = this.props.getFormattedPercentage(current_total_votes_count , current_total_voters_count);
			if (entityType != null) {
				lowSupportersVotingPercent = (parseFloat(globalSupportersVotesPercentage) < parseFloat(globalVotesPercentage))
			}
		}
		// console.log(entityType , entityKey , innerItemId);
		const clickAbleEntity = (entityType != undefined && entityKey != undefined && entityType != geographicEntityTypes.ballotBox );
		 let titleStyle = {cursor:(clickAbleEntity ? 'pointer':'')};
		return (<table className="supporters-hours-table inner-table-supporters td" >
                                            <thead>
												<tr className="graph-table-erea">
													<td className="graph-col">
													{voteStats  ? <StrippedBarChart
															data={[
																	{ label: '1', value:globalVotesPercentage, 'bgRedColor' : false  },
																	{ label: '2', value:globalSupportersVotesPercentage, 'bgRedColor' : lowSupportersVotingPercent },
															]}
															colors = {colorsArray}
															style={{ clear: 'both' }}
														/>
														:
														loaderSpinner
													}
														</td>
												</tr>
												<tr>
													<td style={{minWidth:'114px'}}><div className="dot-border"></div></td>
												</tr>
												<tr className="titles-hours-table">
													<td title={title} style={ titleStyle} onClick={clickAbleEntity ? this.props.doSearchAction.bind(this , entityType , entityKey , innerItemId) : null}>
														{this.props.truncateText(title, 17)}
													</td>
												</tr>
                                            </thead>
                                            <tbody>
												<tr>
													<td>
														{voteStats && (current_total_voters_count != undefined) ? this.getGraphNumber(current_total_voters_count) : loaderSpinner}
													</td>
												</tr>
												<tr>
													<td>
														{voteStats && (current_total_votes_count != undefined) ? this.getGraphNumber(current_total_votes_count) : loaderSpinner}
													</td>
												</tr>
												<tr>
													<td>
														{voteStats && (current_total_supporters_count != undefined) ? this.getGraphNumber(current_total_supporters_count) : loaderSpinner}
													</td>
												</tr>
												<tr>
													<td>
														{voteStats && (current_total_supporters_votes_count != undefined) ? this.getGraphNumber(current_total_supporters_votes_count) : loaderSpinner}
													</td>
												</tr>
												<tr>
													<td>
														{voteStats ? (globalSupportersVotesPercentage + '%') : loaderSpinner}
													</td>
												</tr>
												<tr>
													<td>
														{voteStats ? (globalVotesPercentage+'%') : loaderSpinner}
													</td>
												</tr>
												<tr>
													<td>
														{voteStats ? (numberWithCommas(ballots_count)) : loaderSpinner}
													</td>
												</tr>
                                            </tbody>
                                        </table>);
	}
	
	/*
		Go to previous/next page
	*/
	skipPages(pagesToSkip){
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'currentPage' , fieldValue : (this.props.currentPage + pagesToSkip)});
	}
	getPageMAx(foundGeoEntityStats) {
		let maxPage = 1;
		let itemsPerPage = this.props.numberOfContryStatesAreasNumber - (this.props.displayAllCountry ? 0 : 1);
		if (this.props.displayAllCountry) {
			maxPage =  Math.ceil(Object.keys(this.props.generalAreasHashTable.areas).length / itemsPerPage);
		} else if(foundGeoEntityStats && foundGeoEntityStats.childrens){
			maxPage =  Math.ceil(foundGeoEntityStats.childrens.length / itemsPerPage);
		}
		return maxPage;
	}

	checkCurrentIndex(displayIndex) {
		let itemsPerPage = this.props.numberOfContryStatesAreasNumber - (this.props.displayAllCountry ? 0 : 1);

		return displayIndex >= (this.props.currentPage - 1) * (itemsPerPage) && displayIndex < (this.props.currentPage) * (itemsPerPage)
	}
	renderTableGeoEntityStats(foundGeoEntityStats) {
		// console.log(foundGeoEntityStats);
		let self = this;
		const colorsArray = [this.totalVotersColor, this.totalSupportersColor];

		let tableRows = [];
		let displayIndex = 0;
		if (this.props.displayAllCountry) {
			for (let id in this.props.generalAreasHashTable.areas) {
				let item = this.props.generalAreasHashTable.areas[id];
				if (item.childrens && item.childrens.length > 0) {  //If their is any voters in this area
					if (this.checkCurrentIndex(displayIndex)) {
						tableRows.push(<div className="table-graph-erea" key={"firstGraph_area" + id} >
							{self.getGraphSection(item.name, item.voteStats, colorsArray, geographicEntityTypes.area, item.key, id)}
						</div>)
					}
					displayIndex++;
				}
			}
		} else if (foundGeoEntityStats && foundGeoEntityStats.childrensData) {
			foundGeoEntityStats.childrensData.forEach(function (item) {
				if (self.checkCurrentIndex(displayIndex)) {
					let colTitle = item.name;
					if(item.entity_type == 4){
						let name = item.name.toString();
						colTitle = "קלפי " + formatBallotMiId(name);
					}
					tableRows.push(<div className="table-graph-erea" key={"firstGraph_city" + displayIndex} >
						{self.getGraphSection(colTitle, item.voteStats, colorsArray, item.entity_type, item.key, item.id)}
					</div>)
				}
				displayIndex++;
			});
		}
		return tableRows;
	}
	getParentEntityType(searchEntityType){
		let parentEntityType;
		if (searchEntityType == geographicEntityTypes.city || searchEntityType == geographicEntityTypes.subArea) {
			parentEntityType = (searchEntityType == geographicEntityTypes.city) ? geographicEntityTypes.subArea : geographicEntityTypes.area;
		} else { parentEntityType = searchEntityType - 1 }
		return parentEntityType;
	}
	renderParentGraph(displayAllCountry, foundGeoEntityStats, colTitle) {
		if (!displayAllCountry && foundGeoEntityStats) {
			let parentEntityType = this.getParentEntityType(foundGeoEntityStats.entity_type);
			return (
				<div className="table-graph-erea">
					{this.getGraphSection(colTitle, foundGeoEntityStats.voteStats, [this.totalVotersColor, this.totalSupportersColor], parentEntityType, foundGeoEntityStats.parent_key, foundGeoEntityStats.parent_id)}
				</div>
			)
		}
	}

	/**
	 * Set render variables
	 * 
	 * @return void
	 */
	setRenderVariables() {
		this.totalVotesPercentage = this.props.global_votes_count/this.props.all_voters_count*100;
		if (isNaN(this.totalVotesPercentage)) this.totalVotesPercentage = 0;		
	}
	
    render() {
    	this.setRenderVariables();
		const displayAllCountry = this.props.displayAllCountry;
		if (displayAllCountry) {
			this.totalVotersColor = "#0277BD"; 
			this.totalSupportersColor = "#558B2F"; 
		}else {
			 this.totalVotersColor = "#039BE5";
			 this.totalSupportersColor = "#7CB342";  
		}
		
		let self = this;
		
		let foundGeoEntityStats = null;
		let colTitle = '';
		if(!displayAllCountry && this.props.searchEntityKey != null){
			foundGeoEntityStats = this.props.getParentArrayByEntityType(true);
			colTitle = foundGeoEntityStats.name;

		}

		let maxPage = this.getPageMAx(foundGeoEntityStats);
		const globalVoteStats ={
			ballots_count_data: this.props.ballots_count_data,
			ballots_reporting_count_data: this.props.ballots_reporting_count_data,
		}
		const allCountryCountsStyle = {color:'#32396B',float:'left',marginLeft:'-15px'};
		return (
					<div role="tabpanel" className="tab-pane vote-erea active" id="vote-panel">
                            <div className="legend-erea">
								<div className="legend-election-day pull-left margin-right20">
									<label> אחוז הצבעה כללי</label>
                                    <span className={"legend-square"} style={{backgroundColor:this.totalVotersColor}}></span>
                                </div>
								<div className="legend-election-day pull-left ">
									<label> אחוז הצבעה תומכים</label>
                                    <span className={"legend-square"} style={{backgroundColor:this.totalSupportersColor}}></span>
                                </div>
							</div>
							
                            <div className="dtlsBox-vote-dashboard">
                                <div className="sum-table-erea">
                                <div className="table-graph-erea">
                                    <table className="supporters-hours-table inner-table-supporters sum-national-title">
                                        <thead>
											<tr className="graph-table-erea"><td className="graph-col"></td></tr>
											<tr><td><div className="dot-border-empty"></div></td></tr>
											<tr className="titles-hours-table"><td> </td></tr>
                                        </thead>
                                        <tbody>
                                            {/* <tr><td> ב.ז.ב <span style={allCountryCountsStyle}>({numberWithCommas(this.props.all_voters_count)})</span></td></tr>
                                            <tr><td> הצביעו כללי <span style={allCountryCountsStyle}>({numberWithCommas(this.props.global_votes_count)})</span></td></tr>
                                            <tr><td>תומכים <span style={allCountryCountsStyle}>({numberWithCommas(this.props.all_supporters_count)})</span></td></tr> */}
                                            <tr><td> ב.ז.ב </td></tr>
                                            <tr><td> הצביעו כללי </td></tr>
                                            <tr><td>תומכים </td></tr>
                                            <tr><td>  תומכים שהצביעו</td></tr>
                                            <tr><td>אחוז הצבעה תומכים</td></tr>
                                            {/* <tr><td>אחוז הצבעה כללי <span style={allCountryCountsStyle}>({Math.round(this.totalVotesPercentage * 10 ) / 10}%)</span></td></tr> */}
                                            <tr><td>אחוז הצבעה כללי</td></tr>
                                            <tr><td>מספר קלפיות </td></tr>
                                        </tbody>
                                    </table>
								</div>
									<div className="table-graph-erea">
									{this.getGraphSection("ארצי", globalVoteStats, [this.totalVotersColor, this.totalSupportersColor])}
								</div>
								{this.renderParentGraph(displayAllCountry,foundGeoEntityStats, colTitle)}
                            </div>
					<div className="sum-table-ereas"  >
						<div className="scroll-table-arrow" style={{ opacity: (self.props.currentPage <= 1 ? 0.5 : ''), cursor: (self.props.currentPage <= 1 ? 'not-allowed' : 'pointer') }} onClick={self.props.currentPage <= 1 ? null : this.skipPages.bind(this, -1)}><img src={window.Laravel.baseURL + "Images/scroll-table-r.png"} alt="גרף" /></div>
						<div className="scroll-table-arrow left-arrow-table" style={{
							marginRight: (displayAllCountry ? '1035px' : '925px'),
							opacity: (self.props.currentPage >= (maxPage) ? 0.5 : ''),
							cursor: (self.props.currentPage >= (maxPage) ? 'not-allowed' : 'pointer')
						}}
							onClick={(self.props.currentPage >= (maxPage) ? null : self.skipPages.bind(self, 1))}>
							<img src={window.Laravel.baseURL + "Images/scroll-table-l.png"} alt="גרף" /></div>

						{this.renderTableGeoEntityStats(foundGeoEntityStats)}
	
                                </div>
                                <div className="left-erea-table" >
                                    <table className="supporters-hours-table inner-table-supporters sum-national-title">
                                        <thead>
											<tr className="graph-table-erea"><td className="graph-col"></td></tr>
											<tr><td><div className="dot-border-empty"></div></td></tr>
											<tr className="titles-hours-table"><td></td></tr>
                                        </thead>
                                        <tbody>
											<tr><td> </td></tr>
											<tr><td> </td></tr>
											<tr><td> </td></tr>
											<tr><td> </td></tr>
											<tr><td> </td></tr>
											<tr><td> </td></tr>
                                        </tbody>
                                    </table>
                                    </div>
                            </div>
                        </div>
			
					);
    }
}

function mapStateToProps(state) {
    return {
		generalAreasHashTable:state.elections.electionsDashboard.generalAreasHashTable,
		searchEntityType:state.elections.electionsDashboard.searchEntityType,
		searchEntityKey:state.elections.electionsDashboard.searchEntityKey,
		ballots_count_data:state.elections.electionsDashboard.ballots_count_data,
		ballots_reporting_count_data:state.elections.electionsDashboard.ballots_reporting_count_data,
		currentPage:state.elections.electionsDashboard.currentPage,
		searchScreen:state.elections.electionsDashboard.searchScreen,
		displayAllCountry:state.elections.electionsDashboard.displayAllCountry,
		numberOfContryStatesAreasNumber:state.elections.electionsDashboard.numberOfContryStatesAreasNumber,
		geoEntitySupportersVotersPercents:state.elections.electionsDashboard.geoEntitySupportersVotersPercents,
		geoEntityAllVotersPercents:state.elections.electionsDashboard.geoEntityAllVotersPercents,

		// all_voters_count:state.elections.electionsDashboard.all_voters_count,
		// all_supporters_count:state.elections.electionsDashboard.all_supporters_count,
		// global_votes_count:state.elections.electionsDashboard.global_votes_count,

    }
}

export default connect(mapStateToProps) (withRouter(VotingPanelTab));