import React from 'react';
import { connect } from 'react-redux';
import store from 'store';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import Combo from 'components/global/Combo';

class TransportationsSearch extends React.Component {
	initState = {
		loadedAreasAndCities: false,
		searchDetails: {
			areasListItem: { selectedValue: '', selectedItem: null },
			subAreasListItem: { selectedValue: '', selectedItem: null },
			citiesListItem: { selectedValue: '', selectedItem: null },
			// citiesListItem: { selectedValue: 'ברכה', selectedItem: {id: 1181, name: "ברכה", key: "1oej7f5sw3", area_id: 16, sub_area_id: null} },
		},
		filteredCities: [],
		filteredAreasList: [],
		filteredSubAreasList: []
	}
	constructor(props) {
		super(props);
		this.initConstants();
		this.state = { ...this.initState };
	}

	/*
	function that initializes constant variables 
	*/
	initConstants() {
		this.displayButtonStyle = { marginTop: '22px' };
		this.mainPanelStyle = { minHeight: '192px', paddingTop: '20px' };
		this.mainWrapperStyle = { marginTop: '-15px' };
	}

	componentWillMount() {
		SystemActions.loadUserGeographicFilteredLists(store, this.props.screenPermission, { areas: true, sub_areas: true, cities: true });
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.currentUser && nextProps.cities.length > 0 && nextProps.areas.length > 0 && !this.state.loadedAreasAndCitie) {
			this.setState({
				loadedAreasAndCities: true,
				filteredCities: nextProps.cities,
				filteredAreasList: nextProps.areas
			});

		}
		// if(this.props.totalVotersCount != nextProps.props.totalVotersCount){} Need to find if voters changed???
	}

	/*
	   function that handles change in one of comboes
	   
	   @param fieldName - the combo name in state
	*/
	searchFieldComboValueChange(fieldName, e) {
		let self = this;

		let newState = { ...this.state };
		newState.searchDetails = { ...newState.searchDetails }
		let selectedItem = e.target.selectedItem ? e.target.selectedItem : null;
		newState.searchDetails[fieldName] = { selectedValue: e.target.value, selectedItem: selectedItem };

		let areasListItem = newState.searchDetails.areasListItem.selectedItem;
		let subAreasListItem = newState.searchDetails.subAreasListItem.selectedItem;
		let filteredCities = [];
		let filteredSubAreasList = [];
		switch (fieldName) {
			case 'areasListItem':

				filteredCities = self.props.cities.filter(function (city) {
					if (areasListItem && subAreasListItem) {
						return city.area_id == areasListItem.id && city.sub_area_id == subAreasListItem.id
					} else if (selectedItem) {
						return city.area_id == selectedItem.id
					} else if (!selectedItem) {
						return true;
					}
					return false;
				})
				if (areasListItem) {
					filteredSubAreasList = self.props.subAreas.filter(function (subArea) {
						if (subArea.area_id == areasListItem.id) {
							return true;
						}
						return false;
					})
				}
				newState.filteredCities = filteredCities;
				newState.filteredSubAreasList = filteredSubAreasList;
				newState.searchDetails.subAreasListItem = { ...this.initState.searchDetails.subAreasListItem }
				newState.searchDetails.citiesListItem = { ...this.initState.searchDetails.citiesListItem }

				break;
			case 'subAreasListItem':
				filteredCities = self.props.cities.filter(function (city) {
					if (areasListItem && e.target.selectedItem) {
						return city.area_id == areasListItem.id && city.sub_area_id == e.target.selectedItem.id
					}
					else if (areasListItem) {
						return city.area_id == areasListItem.id
					} else {
						return false
					}
				})
				newState.filteredCities = filteredCities;
				break;
			case 'citiesListItem':
				if (selectedItem) {
					this.state.filteredAreasList.forEach(function (areaItem) {
						if (areaItem.id == selectedItem.area_id) {
							newState.searchDetails['areasListItem'] = { selectedValue: areaItem.name, selectedItem: areaItem };
						}
					});
					// If city was changed - load city roles budget
					let currentCityItem =this.state.searchDetails.citiesListItem.selectedItem;
					if (!currentCityItem || currentCityItem.id  != selectedItem.id ) {
						ElectionsActions.loadCityRolesData(this.props.dispatch, selectedItem.key);
					}
				}
				break;
			default:
				break;
		}
		this.setState(newState);
	}
	onSearch(){
		let citySelectItem = this.state.searchDetails.citiesListItem.selectedItem;
		let citySearchKey = citySelectItem.key;
		if (this.currentCitySearchKey != citySearchKey) {
			let requestCityData = { city_key: citySearchKey };
			ElectionsActions.getTransportationsCityData(this.props.dispatch, requestCityData);
		}
		this.props.getTransportationsData(citySelectItem);
		this.currentCitySearchKey = citySearchKey;
	}
	render() {

		return (
			<div style={this.mainWrapperStyle}>
				<div>
					<div className="row">
						<div className="col-md-6 text-right">
							<h1>שיבוץ הסעות</h1>
						</div>
					</div>
					<div className="row">
						<div className="col-lg-3">
							<div className="row">
								<div className="dtlsBox srchRsltsBox clearfix" style={this.mainPanelStyle}>
									<div className="col-lg-12">
										<div className="panelTitle rsltsTitleRow">חיפוש מטה</div>
									</div>
									<div className="form-horizontal">
										<div className="form-group nomargin">
											<label htmlFor="city" className="col-lg-4 control-label">מטה</label>
											<div className="col-lg-8">
												<Combo items={this.state.filteredCities} autoFocus={true} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' onChange={this.searchFieldComboValueChange.bind(this, 'rightCitiesListItem')} disabled={true} />
											</div>
											<div className="col-lg-12">
												<div className="box-button-single">
													<button title="הצג" className="btn btn-primary srchBtn pull-left" style={this.displayButtonStyle} disabled={true} onClick={this.onSearch.bind(this)}>הצג</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-9">
							<div className="row">
								<div className="dtlsBox srchRsltsBox clearfix" style={this.mainPanelStyle}>
									<div className="col-lg-12">
										<div className="panelTitle rsltsTitleRow">חיפוש לפי אזור</div>
									</div>
									<div className="col-lg-4">
										<div className="form-horizontal">
											<div className="form-group">
												<label htmlFor="area" className="col-lg-4 control-label">אזור</label>
												<div className="col-lg-8">
													<Combo items={this.props.areas} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.state.searchDetails.areasListItem.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'areasListItem')} />
												</div>
											</div>
										</div>
									</div>
									<div className="col-lg-4">
										<div className="form-horizontal">
											<div className="form-group">
												<label htmlFor="sub-area" className="col-lg-4 control-label">תת אזור</label>
												<div className="col-lg-8">
													<Combo items={this.state.filteredSubAreasList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.state.searchDetails.subAreasListItem.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'subAreasListItem')} />
												</div>
											</div>
										</div>
									</div>
									<div className="col-lg-4">
										<div className="form-horizontal">
											<div className="form-group">
												<label htmlFor="city-2" className="col-lg-4 control-label">עיר</label>
												<div className="col-lg-8">
													<Combo items={this.state.filteredCities} maxDisplayItems={5} itemIdProperty="id"
													itemDisplayProperty='name' value={this.state.searchDetails.citiesListItem.selectedValue}
													onChange={this.searchFieldComboValueChange.bind(this, 'citiesListItem')}
														inputStyle={!this.state.searchDetails.citiesListItem.selectedItem ? { borderColor: 'red' } : {}}   
													/>
												</div>
												<div className="col-lg-12">
													<div className="box-button-single">
														<button title="הצג" className="btn btn-primary srchBtn pull-left" style={this.displayButtonStyle} disabled={!this.state.searchDetails.citiesListItem.selectedItem} onClick={this.onSearch.bind(this)}>הצג</button>
													</div>
												</div>
											</div>
										</div>
									</div>

								</div>

							</div>

						</div>
					</div>
				</div>
			</div>
		);
	}
}


function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		areas: state.system.currentUserGeographicalFilteredLists.areas,
		subAreas: state.system.currentUserGeographicalFilteredLists.sub_areas,
		searchCityScreen: state.elections.citiesScreen.searchCityScreen,
		totalVotersCount: state.elections.transportationsScreen.totalVotersCount,
		cities: state.system.currentUserGeographicalFilteredLists.cities,
	}
}

export default connect(mapStateToProps)(TransportationsSearch);