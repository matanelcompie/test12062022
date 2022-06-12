import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../actions/SystemActions';
import * as ElectionsActions from '../../../actions/ElectionsActions';

import { arraySort } from 'libs/globalFunctions';
import Pagination from '../../../components/global/Pagination';
import DashboardFileRow from './DashboardFileRow';
import ModalWindow from '../../global/ModalWindow';


class Dashboard extends React.Component {

	constructor(props) {
		super(props);
		this.screenPermission = 'elections.household_support_status_change';
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin == false && nextProps.currentUser.permissions[this.screenPermission] != true && this.props.currentUser.permissions[this.screenPermission] != true && this.props.currentUser.first_name.length > 1) {
			this.props.router.replace('/unauthorized');
		}
	}

	/*general function that closes all types of dialogues */
	closeModalDialog() {
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.SET_MODAL_DIALOG_DATA, visible: false, headerText: '', modalText: ''
		});
	}

	componentWillMount() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CLEAN_STAGES_DATA });
		ElectionsActions.getUsersJobsList(this.props.dispatch);
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'עדכון סטטוס לבתי אב' });
	}

	/*
function that on single update-row click set it selected
*/
	setRowSelected(index, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.SUPPORT_STATUS_UPDATE_ROW_SELECTED, selectedRowIdx: index });
	}

	/*
	makes url transfer  
	*/
	transferToPageByKey(updateKey) {
		if (updateKey != 'new') {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'currentStageNumber', fieldValue: 2 });
		}

		this.props.router.push('elections/household_status_change/' + updateKey);

	}

	/*
	 handles paging - clickin on page number or arrow back/forward
	*/
	navigateToPage(index) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'currentPage', fieldValue: index })
	}


	render() {
		let self = this;
		let usersJobsList = this.props.searchScreen.usersJobsList.sort(arraySort('desc', 'updated_at'));
		return (
			<div>
				<div className="row pageHeading1">
					<div className="col-lg-6">
						<h1>עדכון סטטוס לבתי אב</h1>
					</div>
					<div className="col-lg-6 text-left">
						{(this.props.currentUser.admin == true || this.props.currentUser.permissions[this.screenPermission + '.add'] == true) ? <a onClick={this.transferToPageByKey.bind(this, 'new')} title="המשך"><button className="btn mainBtn large" style={{ padding: '3px 20px 6px 20px', fontSize: '25px' }}>+ עדכון חדש</button></a> : null}
					</div>
				</div>

				<div className="resultsArea dataUpdate">
					<div className="row nopaddingR nopaddingL">
						<div className="col-sm-12">
							<div className="dtlsBox srchRsltsBox">
								<div className="table-responsive">
									<table className="table table-striped tableNoMarginB table-hover tableTight csvTable table-scrollable" style={{ height: '100px' }}>
										<thead>
											<tr >
												<th style={{ textAlign: 'right' }}>מספר סידורי</th>
												<th style={{ textAlign: 'right' }}>שם העדכון</th>
												<th style={{ textAlign: 'right' }}>תאריך עדכון</th>
												<th style={{ textAlign: 'right' }}>שם מעדכן</th>
												<th style={{ textAlign: 'right' }}>מספר בתי אב שנבחרו</th>
												<th style={{ textAlign: 'right' }} >מספר תושבים שעודכנו</th>
												<th className="text-center">פירוט</th>

											</tr>
										</thead>
										<tbody>
											{usersJobsList.map(function (item, index) {
												if (index >= (self.props.searchScreen.currentPage - 1) * self.props.searchScreen.displayItemsPerPage && index < self.props.searchScreen.currentPage * self.props.searchScreen.displayItemsPerPage) {
													let className = "";
													if (item.isSelected) {
														className = "success request-select-row";
													}
													return <DashboardFileRow key={index} updateKey={item.update_key} rowIndex={index + 1} updateName={item.name} className={className} updateDateTime={item.updated_at} updaterName={item.first_name + ' ' + item.last_name} numberHouseholdsSelected={item.selected_households_count} numberHouseholdsProcessed={item.updated_voters_count} rowClickDelegate={self.setRowSelected.bind(self, index)} rowDetailsOnClick={self.transferToPageByKey.bind(self, item.update_key)} />
												}
											})
											}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<ModalWindow show={this.props.showModalDialog} buttonX={this.closeModalDialog.bind(this)} buttonOk={this.closeModalDialog.bind(this)} title={this.props.modalHeaderText} style={{ zIndex: '9001' }}>
							<div>{this.props.modalContentText}</div>
						</ModalWindow>
					</div>
					<div className="row">
						<nav aria-label="Page navigation paginationRow">
							<div className="text-center">
								{((this.props.searchScreen.usersJobsList.length / this.props.searchScreen.displayItemsPerPage) > 1) ?
									<div className="row">
										<nav aria-label="Page navigation paginationRow">
											<div className="text-center">
												<Pagination navigateToPage={this.navigateToPage.bind(this)} resultsCount={this.props.searchScreen.usersJobsList.length} currentPage={this.props.searchScreen.currentPage} displayItemsPerPage={this.props.searchScreen.displayItemsPerPage} />
											</div>
										</nav>
									</div> : null
								}
							</div>
						</nav>
					</div>
				</div>
			</div>
		);
	}
}


function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		showModalDialog: state.elections.showModalDialog,
		modalHeaderText: state.elections.modalHeaderText,
		modalContentText: state.elections.modalContentText,
		searchScreen: state.elections.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen,
	}
}

export default connect(mapStateToProps)(withRouter(Dashboard));