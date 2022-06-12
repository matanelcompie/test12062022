import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../actions/ElectionsActions';
import * as SystemActions from '../../../actions/SystemActions';
import ModalWindow from '../../global/ModalWindow';
import Combo from '../../global/Combo';
import store from '../../../store';
import constants from '../../../libs/constants';

class CitySearch extends React.Component {

	constructor(props) {
		super(props);
		this.initConstants();
		this.state = { filteredRightCities: [], filteredLeftCities: [], filteredAreasList: [], filteredSubAreasList: [] };
	}



	/*
	function that initializes constant variables 
	*/
	initConstants() {
		this.displayButtonStyle = { marginTop: '22px' };
		this.mainPanelStyle = { minHeight: '192px', paddingTop: '20px' };
		this.mainWrapperStyle = { paddingTop: '20px' };

	}

	componentWillMount() {
		SystemActions.loadUserGeographicFilteredLists(store, 'elections.cities', { areas: true, cities: true });
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'ניהול ערים' });
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.currentUser && nextProps.currentUserGeographicalFilteredLists.cities.length > 0
			&& nextProps.currentUserGeographicalFilteredLists.areas.length > 0) {
			if (!this.state.loadedAreasAndCities) {
				this.setState({ loadedAreasAndCities: true });
				this.setState({ filteredRightCities: nextProps.currentUserGeographicalFilteredLists.cities });
				this.setState({ filteredLeftCities: nextProps.currentUserGeographicalFilteredLists.cities });
				this.setState({ filteredAreasList: nextProps.currentUserGeographicalFilteredLists.areas });
				if (this.props.router.params.cityKey && !this.loadedByKey) {
					this.loadedByKey = true;
					for (let i = 0; i < nextProps.currentUserGeographicalFilteredLists.cities.length; i++) {
						if (nextProps.currentUserGeographicalFilteredLists.cities[i].key == this.props.router.params.cityKey) {
							let selectedCity = nextProps.currentUserGeographicalFilteredLists.cities[i];
							this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE, fieldName: 'selectedCity', fieldValue: selectedCity.name, fieldItem: selectedCity });
							foundCity++;
							ElectionsActions.loadClustersAndNeighborhoodsByCity(this.props.dispatch, selectedCity.key);
							ElectionsActions.loadEntityActivistsSummary(this.props.dispatch , constants.geographicEntityTypes.city, selectedCity.id);
							ElectionsActions.loadCityMunicipalCoordinators(this.props.dispatch , selectedCity.key);
							this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_SHOW_SEARCH_RESULTS, show: true });
							break;
						}
					}

				}
			}
		}
		if (nextProps.currentUser  && !_.isEqual(nextProps.subAreas, this.props.subAreas)) {
			this.setState({ filteredSubAreasList: nextProps.subAreas });
		}
	}



    /*
	   general function that closes all types of dialogues 
	 */
	closeModalDialog() {
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.SET_MODAL_DIALOG_DATA, visible: false, headerText: '', modalText: ''
		});
	}

	/*
	   function that handles change in one of comboes
	   
	   @param fieldName - the combo name in state
	*/
	searchFieldComboValueChange(fieldName, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.COMBO_LIST_ITEM_CHANGED, fieldName, selectedValue: e.target.value, selectedItem: e.target.selectedItem });
		let self = this;
		let selectedItem = null;
		if (e.target.selectedItem) {
			selectedItem = e.target.selectedItem;
		}
		switch (fieldName) {
			case 'areasListItem':
				if (selectedItem) {
					SystemActions.loadSubAreas(store, selectedItem.key);
				}
				this.setState({
					filteredLeftCities: self.props.cities.filter(function (city) {
						if (self.props.searchCityScreen.areasListItem.selectedItem &&
							self.props.searchCityScreen.subAreasListItem.selectedItem) {
							return city.area_id == self.props.searchCityScreen.areasListItem.selectedItem.id
								&& city.sub_area_id == self.props.searchCityScreen.subAreasListItem.selectedItem.id
						} else if (selectedItem) {
							return city.area_id == selectedItem.id
						} else if (!selectedItem) {
							return true;
						}
						return false;
					})
				});
				this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.COMBO_LIST_ITEM_CHANGED, fieldName: 'subAreasListItem', selectedValue: '', selectedItem: null });
				this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.COMBO_LIST_ITEM_CHANGED, fieldName: 'leftCitiesListItem', selectedValue: '', selectedItem: null });
				break;
			case 'subAreasListItem':
				this.setState({
					filteredLeftCities: self.props.cities.filter(function (city) {
						if (self.props.searchCityScreen.areasListItem.selectedItem && e.target.selectedItem) {
							return city.area_id == self.props.searchCityScreen.areasListItem.selectedItem.id
								&& city.sub_area_id == e.target.selectedItem.id
						}
						else if (self.props.searchCityScreen.areasListItem.selectedItem) {
							return city.area_id == self.props.searchCityScreen.areasListItem.selectedItem.id
						} else {
							return false
						}
					})
				});

				if (!this.props.searchCityScreen.areasListItem.selectedItem && selectedIteml) {
					for (let i = 0; i < this.state.filteredAreasList.length; i++) {
						if (this.state.filteredAreasList[i].id == e.target.selectedItem.area_id) {
							this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.COMBO_LIST_ITEM_CHANGED, fieldName: 'areasListItem', selectedValue: this.state.filteredAreasList[i].name, selectedItem: this.state.filteredAreasList[i] });
							break;
						}
					}
				}
				this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.COMBO_LIST_ITEM_CHANGED, fieldName: 'leftCitiesListItem', selectedValue: '', selectedItem: null });
				break;
			case 'leftCitiesListItem':
				//Not working well - update the aera of the city...
				if (!this.props.searchCityScreen.areasListItem.selectedItem && selectedItem) {
					for (let i = 0; i < this.state.filteredAreasList.length; i++) {
						if (this.state.filteredAreasList[i].id == e.target.selectedItem.area_id) {
							this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.COMBO_LIST_ITEM_CHANGED, fieldName: 'areasListItem', selectedValue: this.state.filteredAreasList[i].name, selectedItem: this.state.filteredAreasList[i] });
							break;
						}
					}
				}
				break;
			default:
				break;
		}
	}

	/*
	   function that handles 'show' button click
	   
	   @param comboName - the combo from which to take the key value of city : 
	*/
	chooseCityClick(comboName) {
		this.props.router.push('elections/cities/' + this.props.searchCityScreen[comboName].selectedItem.key);
	}

	render() {

		return (
			<div className={this.mainWrapperStyle}>
				<div>
					<div className="row">
						<div className="col-md-6 text-right">
							<h1>ניהול ערים</h1>
						</div>
					</div>
					<div className="row">
						<div className="col-lg-3">
							<div className="row">
								<div className="dtlsBox srchRsltsBox clearfix" style={this.mainPanelStyle}>
									<div className="col-lg-12">
										<div className="panelTitle rsltsTitleRow">חפש עיר</div>
									</div>
									<div className="form-horizontal">
										<div className="form-group nomargin">
											<label htmlFor="city" className="col-lg-4 control-label">עיר</label>
											<div className="col-lg-8">
												<Combo items={this.state.filteredRightCities} autoFocus={true} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchCityScreen.rightCitiesListItem.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'rightCitiesListItem')} />
											</div>
											<div className="col-lg-12">
												<div className="box-button-single">
													<button title="הצג" className="btn btn-primary srchBtn pull-left" style={this.displayButtonStyle} disabled={!this.props.searchCityScreen.rightCitiesListItem.selectedItem} onClick={this.chooseCityClick.bind(this, 'rightCitiesListItem')}>הצג</button>
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
													<Combo items={this.state.filteredAreasList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchCityScreen.areasListItem.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'areasListItem')} />
												</div>
											</div>
										</div>
									</div>
									<div className="col-lg-4">
										<div className="form-horizontal">
											<div className="form-group">
												<label htmlFor="sub-area" className="col-lg-4 control-label">תת אזור</label>
												<div className="col-lg-8">
													<Combo items={this.state.filteredSubAreasList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchCityScreen.subAreasListItem.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'subAreasListItem')} />
												</div>
											</div>
										</div>
									</div>
									<div className="col-lg-4">
										<div className="form-horizontal">
											<div className="form-group">
												<label htmlFor="city-2" className="col-lg-4 control-label">עיר</label>
												<div className="col-lg-8">
													<Combo items={this.state.filteredLeftCities} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchCityScreen.leftCitiesListItem.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'leftCitiesListItem')} />
												</div>
												<div className="col-lg-12">
													<div className="box-button-single">
														<button title="הצג" className="btn btn-primary srchBtn pull-left" style={this.displayButtonStyle} disabled={!this.props.searchCityScreen.leftCitiesListItem.selectedItem} onClick={this.chooseCityClick.bind(this, 'leftCitiesListItem')}>הצג</button>
													</div>
												</div>
											</div>
										</div>
									</div>

								</div>

							</div>

						</div>
					</div>

					<ModalWindow show={this.props.showModalDialog} buttonX={this.closeModalDialog.bind(this)} buttonOk={this.closeModalDialog.bind(this)} title={this.props.modalHeaderText} style={{ zIndex: '9001' }}>
						<div>{this.props.modalContentText}</div>
					</ModalWindow>
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
		areas: state.system.lists.areas,
		subAreas: state.system.lists.subAreas,
		cities: state.system.cities,
		searchCityScreen: state.elections.citiesScreen.searchCityScreen,
		currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
	}
}

export default connect(mapStateToProps)(withRouter(CitySearch));