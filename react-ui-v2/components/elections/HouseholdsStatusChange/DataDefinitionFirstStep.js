import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from 'actions/SystemActions';
import * as ElectionsActions from 'actions/ElectionsActions';
import Combo from '../../global/Combo';


class DataDefinitionFirstStep extends React.Component {

	constructor(props) {
		super(props);
	}


	componentWillMount() {

		this.setState({ filteredCities: [] });
		this.setState({ filteredAreasList: [] });
		this.setState({ filteredSubAreasList: [] });
		this.setState({ clusters: [] });
		this.setState({ ballotBoxes: [] });
	}




	componentWillReceiveProps(nextProps) {
		if (nextProps.currentUser && nextProps.currentUserGeographicalFilteredLists.cities.length > 0 && nextProps.currentUserGeographicalFilteredLists.areas.length > 0) {
			if (!this.state.loadedAreasAndCities) {
				this.setState({ loadedAreasAndCities: true });
				this.setState({ filteredCities: nextProps.currentUserGeographicalFilteredLists.cities });
				this.setState({ filteredAreasList: nextProps.currentUserGeographicalFilteredLists.areas });
			}
		}
		if (nextProps.currentUser && nextProps.currentUserGeographicalFilteredLists.sub_areas.length > 0) {
			if (!this.state.loadedSubAreas) {
				this.setState({ loadedSubAreas: true });
				this.setState({ filteredSubAreasList: nextProps.currentUserGeographicalFilteredLists.sub_areas });
			}
		}

		if (nextProps.searchScreen && nextProps.searchScreen.clusters.length > 0) {
			this.setState({ clusters: nextProps.searchScreen.clusters });
		}
		else {
			if (this.state.searchScreen && this.state.searchScreen.clusters.length > 0) {
				this.setState({ clusters: [] });
			}
		}

		if (nextProps.searchScreen && nextProps.searchScreen.ballotBoxes.length > 0) {
			this.setState({ ballotBoxes: nextProps.searchScreen.ballotBoxes });
		}
		else {
			if (this.state.searchScreen && this.state.searchScreen.ballotBoxes.length > 0) {
				this.setState({ ballotBoxes: [] });
			}
		}
	}


    /*
           Handles change in one of comboes 
    */
	searchFieldComboValueChange(fieldName, e) {
		if (fieldName == 'selectedDefinitionHouseholdsNumHouseholds') {
			if (e.target.value == '0' || !new RegExp('^[0-9]*$').test(e.target.value)) { return; }
		}

		if (['selectedArea', 'selectedSubArea', 'selectedCity', 'selectedNeighborhood', 'selectedCluster', 'selectedBallotBox', 'selectedDefinitionHouseholdsWhereCondition', 'selectedDefinitionEntityType', 'selectedFinalSupportStatus'].indexOf(fieldName) >= 0) {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName, fieldValue: { selectedValue: e.target.value, selectedItem: e.target.selectedItem } });
		}
		else {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName, fieldValue: e.target.value });
		}

		let self = this;
		switch (fieldName) {
			case 'selectedArea':
				let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function (city) { return !e.target.selectedItem || city.area_id == e.target.selectedItem.id });
				this.setState({ filteredSubAreasList: this.props.currentUserGeographicalFilteredLists.sub_areas.filter(function (subArea) { return !e.target.selectedItem || subArea.area_id == e.target.selectedItem.id }) });
				this.setState({ filteredCities: newFilteredCities });
				this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedSubArea', fieldValue: { selectedValue: '', selectedItem: null } });
				this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedCity', fieldValue: { selectedValue: '', selectedItem: null } });

				break;

			case 'selectedSubArea':
				if (this.props.searchScreen.selectedArea.selectedItem) {
					this.setState({ filteredCities: this.props.currentUserGeographicalFilteredLists.cities.filter(function (city) { return !e.target.selectedItem || (city.area_id == self.props.searchScreen.selectedArea.selectedItem.id && city.sub_area_id == e.target.selectedItem.id) }) });
					this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedCity', fieldValue: { selectedValue: '', selectedItem: null } });
				}
				else {

					this.setState({ filteredCities: this.props.currentUserGeographicalFilteredLists.cities.filter(function (city) { return !e.target.selectedItem || (city.sub_area_id == e.target.selectedItem.id) }) });
					this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedCity', fieldValue: { selectedValue: '', selectedItem: null } });
					if (e.target.selectedItem) {
						for (let i = 0; i < this.props.currentUserGeographicalFilteredLists.areas.length; i++) {
							if (this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id) {
								this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedArea', fieldValue: this.props.currentUserGeographicalFilteredLists.areas[i].name, fieldItem: this.props.currentUserGeographicalFilteredLists.areas[i] });
								break;
							}
						}
					}
				}
				break;
			case 'selectedCity':

				this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedNeighborhood', fieldValue: { selectedValue: '', selectedItem: null } });
				this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedCluster', fieldValue: { selectedValue: '', selectedItem: null } });
				if (e.target.selectedItem) {
					if (!this.props.searchScreen.selectedArea.selectedItem) {
						for (let i = 0; i < this.props.currentUserGeographicalFilteredLists.areas.length; i++) {
							if (this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id) {
								this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedArea', fieldValue: this.props.currentUserGeographicalFilteredLists.areas[i].name, fieldItem: this.props.currentUserGeographicalFilteredLists.areas[i] });
								break;
							}
						}
					}
					if (!this.props.searchScreen.selectedSubArea.selectedItem) {
						for (let i = 0; i < this.props.currentUserGeographicalFilteredLists.sub_areas.length; i++) {
							if (this.props.currentUserGeographicalFilteredLists.sub_areas[i].id == e.target.selectedItem.sub_area_id) {
								this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedSubArea', fieldValue: this.props.currentUserGeographicalFilteredLists.sub_areas[i].name, fieldItem: this.props.currentUserGeographicalFilteredLists.sub_areas[i] });
								break;
							}
						}
					}

					ElectionsActions.householdStatusClustersNeighborhoodsBallotsByCity(this.props.dispatch, e.target.selectedItem.key);

				}
				else {
					this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'clusters', fieldValue: [] });
					this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'neighborhoods', fieldValue: [] });
					this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'ballotBoxes', fieldValue: [] });
				}
				break;

			case 'selectedNeighborhood':
				this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedCluster', fieldValue: { selectedValue: '', selectedItem: null } });
				if (e.target.selectedItem) {
					let filteredCluster = this.props.searchScreen.clusters.filter(function (cluster) {
						return cluster.neighborhood_id == e.target.selectedItem.id;
					});
					this.setState({ filteredClusters: filteredCluster });

					let filteredBallotBoxes = this.props.searchScreen.ballotBoxes.filter(function (ballotBox) {
						return ballotBox.neighborhood_id == e.target.selectedItem.id;
					});
					this.setState({ filteredBallotBoxes: filteredBallotBoxes });

				}
				else {
					this.setState({ filteredClusters: null });
					this.setState({ filteredBallotBoxes: null });
				}
				break;
			case 'selectedCluster':
				this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'selectedBallotBox', fieldValue: { selectedValue: '', selectedItem: null } });
				if (e.target.selectedItem) {

					let filteredBallotBoxes = this.props.searchScreen.ballotBoxes.filter(function (ballotBox) {
						return ballotBox.cluster_id == e.target.selectedItem.id;
					});
					this.setState({ filteredBallotBoxes: filteredBallotBoxes });

				}
				else {
					this.setState({ filteredClusters: null });
					this.setState({ filteredBallotBoxes: null });
				}
				break;

			default:
				break;
		}
	}


	/*
	   In case of existing update key - it will go to newxt stage 
	*/
	showSecondStageDataOnly() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'currentStageNumber', fieldValue: 2 });
	}

	/*
	In case of creating new update - transfer to second stage if all required field are filled
	*/
	goToNextStage() {
		let data = {}; //data object for search
		if (this.props.searchScreen.selectedArea.selectedItem) {
			data.area_key = this.props.searchScreen.selectedArea.selectedItem.key;
		}
		if (this.props.searchScreen.selectedCity.selectedItem) {
			data.city_key = this.props.searchScreen.selectedCity.selectedItem.key;
		}
		if (this.props.searchScreen.selectedNeighborhood.selectedItem) {
			data.neighborhood_key = this.props.searchScreen.selectedNeighborhood.selectedItem.key;
		}
		if (this.props.searchScreen.selectedCluster.selectedItem) {
			data.cluster_key = this.props.searchScreen.selectedCluster.selectedItem.key;
		}
		if (this.props.searchScreen.selectedBallotBox.selectedItem) {
			data.ballotbox_id = this.props.searchScreen.selectedBallotBox.selectedItem.id;
		}
		data.definition_above = this.props.searchScreen.selectedDefinitionHouseholdsWhereCondition.selectedItem.id;
		data.definition_above_number = this.props.searchScreen.selectedDefinitionHouseholdsNumHouseholds;
		if (this.props.searchScreen.selectedDefinitionEntityType.selectedItem) {
			data.selected_support_status_entity_type = this.props.searchScreen.selectedDefinitionEntityType.selectedItem.id;

		}

		for (let i = 0; i < this.props.searchScreen.definedVoterSupportStatuses.length; i++) {
			if (this.props.searchScreen.definedVoterSupportStatuses[i]) {
				if (!data.defined_support_statuses) {
					data.defined_support_statuses = [];
				}
				if (i == this.props.searchScreen.definedVoterSupportStatuses.length - 1) {
					data.defined_support_statuses.push(-1);

				} else {
					data.defined_support_statuses.push(this.props.searchScreen.supportStatuses[i].id);
				}
			}
		}
		if (data.defined_support_statuses) {
			data.defined_support_statuses = JSON.stringify(data.defined_support_statuses);

		}


		ElectionsActions.searchForRowsCountsStats(this.props.dispatch, data);
		this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'total_voters_count_in_geo_entity', fieldValue: -1 });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'total_households_count_in_geo_entity', fieldValue: -1 });

		this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE, fieldName: 'currentStageNumber', fieldValue: 2 });
	}

	validateFields() {
		this.validatedRow = true;
		this.validatedRow = this.validatedRow && this.props.searchScreen.updateName.split(' ').join('');
		this.validatedArea = true;
		this.validatedSubArea = true;
		this.validatedCity = true;
		this.validatedNeighborhood = true;
		this.validatedCluster = true;
		this.validatedBallotBox = true;
		this.validatedConditionsDefitionsStatuses = false;
		this.validatedExecutionDefitionsStatuses = false;
		this.validatedSelectedDefinitionHouseholdsWhereCondition = true;
		this.validatedSelectedDefinitionEntityType = true;
		this.validatedSelectedDefinitionHouseholdsNumHouseholds = true;

		if (!this.props.searchScreen.selectedArea.selectedItem && this.props.searchScreen.selectedArea.selectedValue && this.props.searchScreen.selectedArea.selectedValue.split(' ').join('') != '') {
			this.validatedArea = false;
			this.validatedRow = false;
		}
		if (!this.props.searchScreen.selectedSubArea.selectedItem && this.props.searchScreen.selectedSubArea.selectedValue && this.props.searchScreen.selectedSubArea.selectedValue.split(' ').join('') != '') {
			this.validatedSubArea = false;
			this.validatedRow = false;
		}
		if (!this.props.searchScreen.selectedCity.selectedItem && this.props.searchScreen.selectedCity.selectedValue && this.props.searchScreen.selectedCity.selectedValue.split(' ').join('') != '') {
			this.validatedCity = false;
			this.validatedRow = false;
		}
		if (!this.props.searchScreen.selectedNeighborhood.selectedItem && this.props.searchScreen.selectedNeighborhood.selectedValue && this.props.searchScreen.selectedNeighborhood.selectedValue.split(' ').join('') != '') {
			this.validatedNeighborhood = false;
			this.validatedRow = false;
		}
		if (!this.props.searchScreen.selectedCluster.selectedItem && this.props.searchScreen.selectedCluster.selectedValue && this.props.searchScreen.selectedCluster.selectedValue.split(' ').join('') != '') {
			this.validatedCluster = false;
			this.validatedRow = false;
		}
		if (!this.props.searchScreen.selectedBallotBox.selectedItem && this.props.searchScreen.selectedBallotBox.selectedValue && this.props.searchScreen.selectedBallotBox.selectedValue.split(' ').join('') != '') {
			this.validatedBallotBox = false;
			this.validatedRow = false;
		}
		if (!this.props.searchScreen.selectedDefinitionHouseholdsWhereCondition.selectedItem) {
			this.validatedSelectedDefinitionHouseholdsWhereCondition = false;
			this.validatedRow = false;
		}
		if ( !this.props.searchScreen.selectedDefinitionHouseholdsNumHouseholds ) {
            this.validatedSelectedDefinitionHouseholdsNumHouseholds = false;
            this.validatedRow = false;
		}
		if (!this.props.searchScreen.selectedDefinitionEntityType.selectedItem) {
			this.validatedSelectedDefinitionEntityType = false;
			this.validatedRow = false;
		}
		if (!this.props.searchScreen.selectedFinalSupportStatus.selectedItem) {
			this.validatedRow = false;
		}
		for (let i = 0; i < this.props.searchScreen.definedVoterSupportStatuses.length; i++) {
			if (this.props.searchScreen.definedVoterSupportStatuses[i]) {
				this.validatedConditionsDefitionsStatuses = true;
				break;
			}
		}
		for (let i = 0; i < this.props.searchScreen.actualVoterSupportStatuses.length; i++) {
			if (this.props.searchScreen.actualVoterSupportStatuses[i]) {
				this.validatedExecutionDefitionsStatuses = true;
				break;
			}
		}
		this.validatedRow = this.validatedRow && this.validatedConditionsDefitionsStatuses && this.validatedExecutionDefitionsStatuses;

	}

	setDefindSupportStatusValueChange(comboArrayName, arrayIndex, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.SUPPORT_STATUS_CHECKBOX_CHANGE, comboArrayName, arrayIndex, arrayValue: e.target.checked });
	}

	setAllComboesTrueFalse(comboArrayName, allValue) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.SUPPORT_STATUS_CHECKBOXES_CHANGE_ALL, comboArrayName, allValue });
	}

	render() {
		let self = this;
		this.validateFields();

		return <div>

			<div className="first-box-on-page" style={{ marginTop: '15px' }}>

				<div className="row nomargin Wizard dataUpdateWizard">
					<ul className="nav nav-tabs steps-2 steps ">
						<li className="active" style={{ width: '50%', fontWeight: '400' }}><a title="תנאי הגדרה" ><span className="WizNumber1">1.</span><span className="WizText" style={{ fontSize: '22px', marginTop: '-3px' }}>תנאי הגדרה</span></a></li>
						{this.props.router.params.updateKey == 'new' ? <li style={{ width: '50%', fontSize: '30px', fontWeight: '400' }}><a style={{ cursor: 'not-allowed' }} title="סיכום ועידכון"><span className="WizNumber">2.</span><span className="WizText WizTextMobile" style={{ fontSize: '22px', marginTop: '-3px' }}>סיכום ועידכון</span></a></li> : <li style={{ width: '50%', fontSize: '30px', fontWeight: '400' }}><a style={{ cursor: 'pointer' }} onClick={this.showSecondStageDataOnly.bind(this)} title="סיכום ועידכון"><span className="WizNumber">2.</span><span className="WizText WizTextMobile" style={{ fontSize: '22px', marginTop: '-3px' }}>סיכום ועידכון</span></a></li>}
					</ul>
				</div>
				<div className="row contentContainer">
					<div className="section-status">

						<div className="row">

							<div className="col-sm-2 panelTitle rsltsTitleRow">שם העדכון</div>
							<div className="col-sm-4">
								<input type="text" disabled={this.props.router.params.updateKey != 'new'} className="form-control" placeholder="* שדה חובה" value={this.props.searchScreen.updateName} onChange={this.searchFieldComboValueChange.bind(this, 'updateName')} style={{ borderColor: (this.props.router.params.updateKey != 'new' || this.props.searchScreen.updateName.split(' ').join('') ? '#ccc' : '#ff0000') }} />
							</div>

						</div>
					</div>
					<hr />
					<div className="section-status">
						<div className="panelTitle rsltsTitleRow">סינון בתי אב</div>
						<div className="row">
							<div className="col-md-3">
								<div className="form-group">
									<label className="control-label">אזור</label>
									<Combo items={this.state.filteredAreasList} disabled={this.props.router.params.updateKey != 'new'} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedArea.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedArea')} inputStyle={{ borderColor: ((this.props.router.params.updateKey != 'new' || this.validatedArea) ? '#ccc' : '#ff0000') }} />
								</div>
							</div>
							<div className="col-md-3">
								<div className="form-group">
									<label className="control-label">תת אזור</label>
									<Combo items={this.state.filteredSubAreasList} disabled={this.props.router.params.updateKey != 'new'} placeholder={this.props.router.params.updateKey != 'new' ? '' : "בחר תת אזור"} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedSubArea.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedSubArea')} inputStyle={{ borderColor: (this.props.router.params.updateKey != 'new' || this.validatedSubArea ? '#ccc' : '#ff0000') }} />
								</div>
							</div>
							<div className="col-md-3">
								<div className="form-group">
									<label className="control-label">עיר</label>
									<Combo items={this.state.filteredCities} disabled={this.props.router.params.updateKey != 'new'}  maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedCity.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedCity')}  />
								</div>
							</div>
							<div className="col-md-3">
								<div className="form-group">
									<label className="control-label">איזורים מיוחדים</label>
									<Combo items={this.props.searchScreen.neighborhoods} placeholder={this.props.router.params.updateKey != 'new' ? '' : "בחר אזור מיוחד"} disabled={this.props.router.params.updateKey != 'new'} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedNeighborhood.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedNeighborhood')} inputStyle={{ borderColor: (this.validatedNeighborhood ? '#ccc' : '#ff0000') }} />
								</div>
							</div>
							<div className="col-md-3">
								<div className="form-group">
									<label className="control-label">אשכול</label>
									<Combo items={this.state.filteredClusters || this.state.clusters} placeholder={this.props.router.params.updateKey != 'new' ? '' : "בחר אשכול"} disabled={this.props.router.params.updateKey != 'new'} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedCluster.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedCluster')} inputStyle={{ borderColor: (this.validatedCluster ? '#ccc' : '#ff0000') }} />
								</div>
							</div>
							<div className="col-md-3">
								<div className="form-group">
									<label className="control-label">קלפי</label>
									<Combo items={this.state.filteredBallotBoxes || this.state.ballotBoxes} placeholder={this.props.router.params.updateKey != 'new' ? '' : "בחר קלפי"} disabled={this.props.router.params.updateKey != 'new'} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='mi_id' value={this.props.searchScreen.selectedBallotBox.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedBallotBox')} inputStyle={{ borderColor: (this.validatedBallotBox ? '#ccc' : '#ff0000') }} />
								</div>
							</div>
							<div>
							</div>
							<div></div>
						</div>
						 
					</div>
					<hr />
					<div className="section-status">
						<div className="panelTitle rsltsTitleRow margin-top20">תנאים להגדרה</div>
						<div className="row">
							<label className="col-sm-2 control-label">כל בתי האב שבהם</label>
							<div className="col-sm-2">
								<Combo items={[{ id: 0, name: 'עד (קטן שווה)', key: 'less_than' }, { id: 1, name: 'מעל  (גדול שווה)', key: 'at_least' }]}
									   disabled={this.props.router.params.updateKey != 'new'}
									   itemIdProperty="id" itemDisplayProperty='name'
									   showFilteredList={false}
									   value={this.props.searchScreen.selectedDefinitionHouseholdsWhereCondition.selectedValue}
									   onChange={this.searchFieldComboValueChange.bind(this, 'selectedDefinitionHouseholdsWhereCondition')}
									   inputStyle={{ borderColor: (this.props.router.params.updateKey != 'new' || this.validatedSelectedDefinitionHouseholdsWhereCondition ? '#ccc' : '#ff0000') }} />
							</div>
							<div className="col-sm-1">
								<input type="number" disabled={this.props.router.params.updateKey != 'new'}
									   className="form-control pull-right input-households" placeholder="בחר"
									   style={{ borderColor: (this.validatedSelectedDefinitionHouseholdsNumHouseholds? '#ccc' : '#ff0000') }}
									   value={this.props.searchScreen.selectedDefinitionHouseholdsNumHouseholds}
									   onChange={this.searchFieldComboValueChange.bind(this, 'selectedDefinitionHouseholdsNumHouseholds')} />
							</div>
							<div className="1" style={{ marginTop: '3px' }}>
								<span className="electors">תושבים</span>
							</div>
						</div>
						<div className="row" style={{ marginTop: '20px' }}>
							<label className="col-sm-2 control-label">סטטוס תושבים</label>
							<div className="checkbox pull-right nomargin" ><span style={{ color: '#ff0000', fontWeight: 'bold', fontSize: '22px' }}>{(this.props.router.params.updateKey != 'new' || this.validatedConditionsDefitionsStatuses ? '' : '*')}</span>
								<label className="margin-right20"><input type="checkbox" checked={self.props.searchScreen.definedVoterSupportStatuses[self.props.searchScreen.definedVoterSupportStatuses.length - 1]} onChange={self.setDefindSupportStatusValueChange.bind(self, 'definedVoterSupportStatuses', (self.props.searchScreen.definedVoterSupportStatuses.length - 1))} disabled={this.props.router.params.updateKey != 'new'} />ללא סטטוס &nbsp;</label>
								{
									this.props.searchScreen.supportStatuses.map(function (item, index) {
										return <label className="margin-right20" key={"first" + index}><input type="checkbox" checked={self.props.searchScreen.definedVoterSupportStatuses[index]} onChange={self.setDefindSupportStatusValueChange.bind(self, 'definedVoterSupportStatuses', index)} disabled={self.props.router.params.updateKey != 'new'} />{item.name} &nbsp;</label>
									})

								}
								&nbsp;&nbsp;&nbsp;&nbsp; {this.props.router.params.updateKey != 'new' ? null : <span><span className="margin-right20"><a style={{ cursor: 'pointer' }} title="בחר הכל" onClick={this.setAllComboesTrueFalse.bind(this, 'definedVoterSupportStatuses', true)}><u>בחר הכל</u></a></span>&nbsp;&nbsp;&nbsp;&nbsp;
                                <span className="margin-right20"><a style={{ cursor: 'pointer' }} title="נקה" onClick={this.setAllComboesTrueFalse.bind(this, 'definedVoterSupportStatuses', false)}><u>נקה</u></a></span></span>}

							</div>
							<div className="col-md-2 col-sm-4" >
								<span className="status-select">
									<label className="col-sm-6" style={{ padding: '5px 2px' }}>מסוג סטטוס</label>
									<div className="col-sm-6" style={{ padding: 0 }}>
										<Combo items={[{ id: 0, name: 'סניף', key: 'branch' }, { id: 1, name: 'TM', key: 'tm' }, { id: 2, name: 'סופי', key: 'final' }]} disabled={this.props.router.params.updateKey != 'new'} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedDefinitionEntityType.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedDefinitionEntityType')} inputStyle={{ borderColor: (this.props.router.params.updateKey != 'new' || this.validatedSelectedDefinitionEntityType ? '#ccc' : '#ff0000') }} />
									</div>
								</span>
							</div>
						</div>
						<div></div>
						<div></div>
					</div>
					<hr />
					<div className="section-status">
						<div className="panelTitle rsltsTitleRow margin-top20">תנאים לביצוע</div>
						<div className="row margin-top20">
							<div className="form-group" >
								<label className="col-sm-2 control-label terms-select-text">התנאי יבוצע על כל התושבים בבית האב בסטטוס</label>
								<div className="checkbox pull-right nomargin" ><span style={{ color: '#ff0000', fontSize: '22px', fontWeight: 'bold' }}>{(this.props.router.params.updateKey != 'new' || this.validatedExecutionDefitionsStatuses ? '' : '*')}</span>
									<label className="margin-right20"><input type="checkbox" checked={self.props.searchScreen.actualVoterSupportStatuses[self.props.searchScreen.actualVoterSupportStatuses.length - 1]} onChange={self.setDefindSupportStatusValueChange.bind(self, 'actualVoterSupportStatuses', (self.props.searchScreen.actualVoterSupportStatuses.length - 1))} disabled={this.props.router.params.updateKey != 'new'} />ללא סטטוס &nbsp;</label>
									{
										this.props.searchScreen.supportStatuses.map(function (item, index) {
											return <label className="margin-right20" key={"second" + index}><input type="checkbox" checked={self.props.searchScreen.actualVoterSupportStatuses[index]} onChange={self.setDefindSupportStatusValueChange.bind(self, 'actualVoterSupportStatuses', index)} disabled={self.props.router.params.updateKey != 'new'} />{item.name} &nbsp;</label>
										})

									}

									&nbsp;&nbsp;&nbsp;&nbsp; {this.props.router.params.updateKey != 'new' ? null : <span><span className="margin-right20"><a style={{ cursor: 'pointer' }} title="בחר הכל" onClick={this.setAllComboesTrueFalse.bind(this, 'actualVoterSupportStatuses', true)}><u>בחר הכל</u></a></span>&nbsp;&nbsp;&nbsp;&nbsp;
							   <span className="margin-right20"><a style={{ cursor: 'pointer' }} title="נקה" onClick={this.setAllComboesTrueFalse.bind(this, 'actualVoterSupportStatuses', false)}><u>נקה</u></a></span></span>}
								</div>
							</div>
						</div>
					</div>
					<hr />
					<div className="section-status">
						<div className="panelTitle rsltsTitleRow margin-top20">ביצוע בפועל</div>
						<div className="row">
							<div className="form-group">
								<label className="col-sm-3 control-label">התושבים יועברו לסטטוס מסוג</label>
								<div className="col-sm-2">
									<Combo items={this.props.searchScreen.supportStatuses} disabled={this.props.router.params.updateKey != 'new'} placeholder="שדה חובה" maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedFinalSupportStatus.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedFinalSupportStatus')} inputStyle={{ borderColor: (this.props.router.params.updateKey != 'new' || this.props.searchScreen.selectedFinalSupportStatus.selectedItem ? '#ccc' : '#ff0000') }} />
								</div>
							</div>
						</div>
					</div>
					<div className="margin-top20" style={{ textAlign: 'left' }}>

						<a style={{ cursor: 'pointer' }} title={this.props.router.params.updateKey == 'new' ? 'בטל' : "חזרה לרשימת עבודות"} onClick={this.props.goToDashboard.bind(this)}>
							<button type="submit" className="btn btn-primary" style={{ backgroundColor: '#498BB6', fontSize: '18px', padding: '6px 40px 6px 40px' }}>{this.props.router.params.updateKey == 'new' ? 'בטל' : "חזרה לרשימת עבודות"}</button>
						</a>
						&nbsp;&nbsp;
					  {this.props.router.params.updateKey == 'new' ?
							<a style={{ cursor: 'pointer' }} title="המשך" onClick={this.goToNextStage.bind(this)}>
								<button type="submit" className="btn btn-primary" disabled={!this.validatedRow} style={{ backgroundColor: '#498BB6', fontSize: '18px', padding: '6px 40px 6px 40px' }}>המשך</button>
							</a> : null}




					</div>
				</div>
			</div>
		</div>
	}
}


function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		searchScreen: state.elections.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen,
	}
}

export default connect(mapStateToProps)(withRouter(DataDefinitionFirstStep));