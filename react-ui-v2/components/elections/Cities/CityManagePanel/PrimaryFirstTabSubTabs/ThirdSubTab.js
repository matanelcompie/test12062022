import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import MunicipalElectionPartyRow from './MunicipalElectionPartyRow';
import ModalWindow from '../../../../global/ModalWindow';


class ThirdSubTab extends React.Component {

	constructor(props) {
		super(props);
		this.initConstants();
	}
	componentWillMount(){
		this.state={isEditMode:false};
	}
    /*
	handles clicking 'add new party' button 
	*/
	showHideAddNewCityCampaignPartyRow(show) {
		if (show) {
			this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'elections.cities.parameters_candidates.council_parties.add' });
		}
		else {
			this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'elections.cities.parameters_candidates.council_parties.add' });
		}
		this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_ADDING_MUNICIPAL_CAMPAIGN, show });
	}


	/*
	function that initializes constant variables 
	*/
	initConstants() {
		this.mouseClickCursorStyle = { cursor: 'pointer' };
	}


	/*
   function that sets dynamic items in render() function : 
   */
	initDynamicVariables() {
		this.confirmDeleteMunicipalElectionPartyItem = '';
		if (this.props.showConfirmDeleteMunicipalElectionPartyDialog) {
			this.confirmDeleteMunicipalElectionPartyItem = <ModalWindow show={this.props.showConfirmDeleteMunicipalElectionPartyDialog} buttonOk={this.deleteExistingMunicipalElectionParty.bind(this)} buttonX={this.hideConfirmDeleteMunicipalElectionParty.bind(this)} buttonCancel={this.hideConfirmDeleteMunicipalElectionParty.bind(this)} title={this.props.confirmDeleteMunicipalElectionPartyHeader} style={{ zIndex: '9001' }}>
				<div>{this.props.confirmDeleteMunicipalElectionPartyContent}</div>
			</ModalWindow>;
		}

		let totalEditingCount = 0;
		this.cityMunicipalCampaignsPartiesRows = null;
		if (this.props.cityMunicipalElectionsCampaignsData != null) {
			for (let j = 0; j < this.props.cityMunicipalElectionsCampaignsData.municipal_election_parties.length; j++) {
				if (this.props.cityMunicipalElectionsCampaignsData.municipal_election_parties[j].editing) {
					totalEditingCount++;
					break;
				}
			}
		}
		if (this.props.cityMunicipalElectionsCampaignsData && this.props.cityMunicipalElectionsCampaignsData.municipal_election_parties) {
			let self = this;
			this.cityMunicipalCampaignsPartiesRows = this.props.cityMunicipalElectionsCampaignsData.municipal_election_parties.map(function (item, index) {
				let notDeletableItemID = -1;
				if (self.props.cityMunicipalElectionsCampaignsData && self.props.cityMunicipalElectionsCampaignsData.municipal_election_city && self.props.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData) {
					notDeletableItemID = self.props.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData.id;
				}

				return <MunicipalElectionPartyRow index={index} key={index} item={item}
					mouseClickCursorStyle={self.mouseClickCursorStyle}
					totalEditingCount={totalEditingCount}
					addingNewMunicipalElectionsCampaign={self.props.addingNewMunicipalElectionsCampaign}
					municipalElectionPartyRowItemChange={self.municipalElectionPartyRowItemChange.bind(self)}
					saveMunicipalElectionPartyRow={self.saveMunicipalElectionPartyRow.bind(self)}
					setMunicipalElectionPartyRowEditing={self.setMunicipalElectionPartyRowEditing.bind(self)}
					showConfirmDeleteMunicipalElectionParty={self.showConfirmDeleteMunicipalElectionParty.bind(self)}
					notDeletableItemID={notDeletableItemID}
					isAuthorizedEdit={(self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.parameters_candidates.council_parties.edit'] == true)}
					isAuthorizedDelete={(self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.parameters_candidates.council_parties.delete'] == true)}
				/>;
			});
		}

		this.addingNewMunicipalElectionsCampaignItem = null;
		this.addMunicipalCampaignPartyButtonItem = null;
		if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates.council_parties.add'] == true) {
			this.addMunicipalCampaignPartyButtonItem = <button title="הוסף מפלגה" disabled={this.state.isEditMode} style={{ fontWeight: '600',border:'none',background:'none',color:'#498bb6' }}
			 onClick={this.showHideAddNewCityCampaignPartyRow.bind(this, true)}><span>+</span>הוסף מפלגה</button>;
		}
		if (this.props.addingNewMunicipalElectionsCampaign) {


			if (this.props.addingNewMunicipalElectionsCampaignScreen.letters.split(' ').join('') == '') {
				this.requiredLettersStyle = { borderColor: '#ff0000' };
			}
			else {
				this.requiredLettersStyle = { borderColor: '#ccc' };
			}

			if (this.props.addingNewMunicipalElectionsCampaignScreen.name.split(' ').join('') == '') {
				this.requiredNameStyle = { borderColor: '#ff0000' };
			}
			else {
				this.requiredNameStyle = { borderColor: '#ccc' };
			}

			this.addMunicipalCampaignPartyButtonItem = null;
			this.addingNewMunicipalElectionsCampaignItem = <tr>
				<td></td>
				<td>
					<input type="text" className="form-control" maxLength={10} value={this.props.addingNewMunicipalElectionsCampaignScreen.letters} style={this.requiredLettersStyle} onChange={this.addingNewMunicipalElectionsItemChange.bind(this, 'letters')} />
				</td>
				<td><input type="text" className="form-control" value={this.props.addingNewMunicipalElectionsCampaignScreen.name} onChange={this.addingNewMunicipalElectionsItemChange.bind(this, 'name')} style={this.requiredNameStyle} /></td>
				<td style={{ textAlign: 'center' }}><input type="checkbox" checked={this.props.addingNewMunicipalElectionsCampaignScreen.isShas} onChange={this.addingNewMunicipalElectionsItemChange.bind(this, 'isShas')} /></td>
				<td></td>
				<td className="status-data">
					<button type="button" className="btn btn-success  btn-xs" title="הוספה" onClick={this.addNewMunicipalElectionCampaignPartyForCity.bind(this)}>
						 <i className="fa fa-pencil-square-o"></i>
					</button>&nbsp;
					<button type="button" className="btn btn-danger btn-xs" title="ביטול" onClick={this.showHideAddNewCityCampaignPartyRow.bind(this, false)}>
						<i className="fa fa-times"></i>
					</button>
				</td>
			</tr>;
		}

	}

	/*
	 set municipal  election party row editing to true/false
	 
	 @param setEditing - true/false
	 @param rowIndex
	 */
	setMunicipalElectionPartyRowEditing(isEditing, rowIndex) {
		this.setState({ isEditMode: isEditing });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_MUNICIAL_ELECTION_PARTY_ROW_EDITING, isEditing, rowIndex });
		if (isEditing) { // save original state values
			let self = this;
			this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'elections.cities.parameters_candidates.council_parties.edit' });
			this.setState({ tempLetters: self.props.cityMunicipalElectionsCampaignsData.municipal_election_parties[rowIndex].letters });
			this.setState({ tempName: self.props.cityMunicipalElectionsCampaignsData.municipal_election_parties[rowIndex].name });
			this.setState({ tempShas: self.props.cityMunicipalElectionsCampaignsData.municipal_election_parties[rowIndex].shas });
		}
		else { //in case of 'cancel' button - restore original state values	
			this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'elections.cities.parameters_candidates.council_parties.edit' });
			this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ELECTION_PARTY_ROW_EDITING_ROW_ITEM_CHANGE, rowIndex, fieldName: 'letters', fieldValue: this.state.tempLetters });
			this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ELECTION_PARTY_ROW_EDITING_ROW_ITEM_CHANGE, rowIndex, fieldName: 'name', fieldValue: this.state.tempName });
			this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ELECTION_PARTY_ROW_EDITING_ROW_ITEM_CHANGE, rowIndex, fieldName: 'shas', fieldValue: this.state.tempShas });
		}
	}


	/*
	 showing confirmation dialog in case of trying to delete municipal election party :
	 
	 @param itemIndexInArray
	 */
	showConfirmDeleteMunicipalElectionParty(itemIndexInArray) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SHOW_HIDE_CONFIRM_DELETE_MUNICIPAL_ELECTION_PARTY_DIALOG, show: true, header: 'ווידוי מחיקה', title: 'למחוק את המפלגה?', deleteIndex: itemIndexInArray });
	}

	/*
	handles adding new municipal election campaign party for city
	 */
	addNewMunicipalElectionCampaignPartyForCity() {
		if (this.props.addingNewMunicipalElectionsCampaignScreen.letters.split(' ').join('') == '' || this.props.addingNewMunicipalElectionsCampaignScreen.name.split(' ').join('') == '') {
			//won't add because missing required fields
		}
		else {
			// add new municipal election campaign party :
			let dataParams = {};
			dataParams.name = this.props.addingNewMunicipalElectionsCampaignScreen.name;
			dataParams.letters = this.props.addingNewMunicipalElectionsCampaignScreen.letters;
			dataParams.is_shas = this.props.addingNewMunicipalElectionsCampaignScreen.isShas ? '1' : '0';
			ElectionsActions.addNewElectionCampaignPartyForCity(this.props.dispatch, this.props.router.params.cityKey, this.props.selectedCampaign.selectedItem.key, dataParams);
		}
	}

	addingNewMunicipalElectionsItemChange(fieldName, e) {
		if (fieldName == 'isShas') { //checkbox
			this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.NEW_MUNICIPAL_CAMPAIGN_PARTY_ITEM_CHANGE, fieldValue: e.target.checked, fieldName });
		}
		else {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.NEW_MUNICIPAL_CAMPAIGN_PARTY_ITEM_CHANGE, fieldValue: e.target.value, fieldName });
		}
	}

	/*
	do real save on specific municipal-election-party row - only if data is validated:
	
	@param rowIndex
	*/
	saveMunicipalElectionPartyRow(rowIndex) {
		let theRow = this.props.cityMunicipalElectionsCampaignsData.municipal_election_parties[rowIndex];
		if (theRow.letters.split(' ').join('') == '' || theRow.name.split(' ').join('') == '') {
			// didn't pass the validation - don't save

		}
		else {
			// do real api-call save row : 
			let dataRequest = {};
			let dataRequestSize = 0;
			if (this.tempLetters != theRow.letters) {
				dataRequestSize++;
				dataRequest.letters = theRow.letters;
			}
			if (this.tempName != theRow.name) {
				dataRequestSize++;
				dataRequest.name = theRow.name;
			}
			if (this.tempShas != theRow.shas) {
				dataRequestSize++;
				dataRequest.shas = theRow.shas ? 1 : 0;
			}

			if (dataRequestSize > 0) {
				this.tempLetters = '';
				this.tempName = '';
				this.tempShas = '';
				ElectionsActions.saveExistingElectionCampaignPartyForCity(this.props.dispatch, this.props.router.params.cityKey, this.props.selectedCampaign.selectedItem.key, theRow.key, dataRequest, rowIndex);
			}
			else {
				this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_MUNICIAL_ELECTION_PARTY_ROW_EDITING, isEditing: false, rowIndex });
			}
		}

	}

	/*
		handling real delete of municipal election party from api calling :
		*/
	deleteExistingMunicipalElectionParty() {
		let selectedRowObject = this.props.cityMunicipalElectionsCampaignsData.municipal_election_parties[this.props.confirmDeleteMunicipalElectionPartyDeleteIndex];
		ElectionsActions.deleteExistingElectionCampaignPartyForCity(this.props.dispatch, this.props.router.params.cityKey, this.props.selectedCampaign.selectedItem.key, selectedRowObject.key);
	}

	/*
	 hide confirmation dialog of municipal election party :
	 
	 */
	hideConfirmDeleteMunicipalElectionParty() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SHOW_HIDE_CONFIRM_DELETE_MUNICIPAL_ELECTION_PARTY_DIALOG, show: false, header: '', title: '', deleteIndex: -1 });
	}

    /*
      handles edit mode item change
   */
	municipalElectionPartyRowItemChange(rowIndex, fieldName, e) {
		if (fieldName == 'shas') {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ELECTION_PARTY_ROW_EDITING_ROW_ITEM_CHANGE, rowIndex, fieldName, fieldValue: e.target.checked });
		}
		else {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ELECTION_PARTY_ROW_EDITING_ROW_ITEM_CHANGE, rowIndex, fieldName, fieldValue: e.target.value });
		}
	}



	render() {

		this.initDynamicVariables();
		return (
			<div className="containerStrip">
				<div className="row panelContent">
					<div className="col-lg-8">
						<table className="table table-striped tableNoMarginB tableTight table-scroll">
							<thead>
								<tr>
									<th></th>
									<th>אותיות</th>
									<th>שם</th>
									<th style={{ textAlign: 'center' }}>תפקוד ש"ס</th>
									<th></th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{this.cityMunicipalCampaignsPartiesRows}
								{this.addingNewMunicipalElectionsCampaignItem}
							</tbody>
						</table>
						<div className="add-item-line">
							{this.addMunicipalCampaignPartyButtonItem}
						</div>
						{this.confirmDeleteMunicipalElectionPartyItem}
					</div>
				</div>
			</div>
		);
	}
}


function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		cityMunicipalElectionsCampaignsData: state.elections.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData,
		municipal_election_parties: state.elections.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties,
		addingNewMunicipalElectionsCampaignScreen: state.elections.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen,
		addingNewMunicipalElectionsCampaign: state.elections.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaign,
		showConfirmDeleteMunicipalElectionPartyDialog: state.elections.citiesScreen.cityPanelScreen.showConfirmDeleteMunicipalElectionPartyDialog,
		confirmDeleteMunicipalElectionPartyHeader: state.elections.citiesScreen.confirmDeleteMunicipalElectionPartyHeader,
		confirmDeleteMunicipalElectionPartyContent: state.elections.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyContent,
		confirmDeleteMunicipalElectionPartyDeleteIndex: state.elections.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyDeleteIndex,
		selectedCampaign: state.elections.citiesScreen.cityPanelScreen.selectedCampaign,
		campaignsList: state.elections.citiesScreen.cityPanelScreen.campaignsList,
	}
}

export default connect(mapStateToProps)(withRouter(ThirdSubTab));