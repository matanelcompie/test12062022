import React from 'react';
import { connect } from 'react-redux';

import Combo from 'components/global/Combo';
import DisplayTabs from './DisplayTabs';

import * as ElectionsActions from '../../../actions/ElectionsActions';

import ModalAddAllocation from 'components/elections/activist/ModalAddAllocation/ModalAddAllocation';

import {isMobilePhone, arraySort } from 'libs/globalFunctions';

class DriversFilters extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cluster: {id: null, name: '', key: null},
            driverFilter: {id: null, name: '', key: null},
            addAllocationPhones: []
        };
        this.clusterShiftData = {election_role_system_name: 'driver'}
        this.emptyCluster = {id: null, name: 'הכל', key: null};
    }

    componentWillReceiveProps(nextProps) {
        if ( nextProps.currentTab == 'driverResult' && !nextProps.driversData.isLoaded && !nextProps.driversData.isLoading) {
            let requestData = {
                city_key: this.props.cityData.searchCityKey,
                cluster_key: null
            };
            let cluster = {...this.emptyCluster};
            this.setState({cluster});

            this.getTransportationsDriversData(requestData);
        }
        let nextActivistItem = nextProps.addAllocationActivistItem;
		if(this.props.addAllocationActivistItem.id != nextActivistItem.id){
			if(nextActivistItem.voter_phones){
				this.setVotersPhones(nextActivistItem.voter_phones);
			}
		}
    }

    clusterChange(event) {
        let selectedItem = event.target.selectedItem;
        let cluster = this.state.cluster;

        if ( null == selectedItem ) {
            cluster = {...this.emptyCluster, name: event.target.value};
        } else {
            cluster = {
                id: selectedItem.id,
                name: selectedItem.name,
                key: selectedItem.key
            };
        }

        this.setState({cluster});
    }

    addDriver() {}

    filterActionChange() {}

    getTransportationsDriversData(requestData) {
        ElectionsActions.getTransportationsDriversData(this.props.dispatch, requestData);
    }
    getDriversRequestData(){
        let requestData = {
            city_key: this.props.cityData.searchCityKey,
            cluster_key: this.state.cluster.key
        };
        return requestData;
    }
    onSearch(event) {
        let requestData = this.getDriversRequestData();
        this.getTransportationsDriversData(requestData);
    }

    onFilterAction(event) {}
	/** Add allocation methods */

	hideAddAllocationModal() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HIDE_ADD_ALLOCATION_MODAL });
		this.setState({ addAllocationPhones: [] })
	}
	showAddDriverModal() {
		this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.SHOW_ADD_ALLOCATION_MODAL});
	}
	searchForVoterActivist(voter_personal_identity) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.ADD_ALLOCATION_MODAL.SET_ACTIVIST_ITEM, activistItem: {} })
        let searchObj = {};
        let cityKey = this.props.cityData.searchCityKey;
        searchObj.personal_identity = voter_personal_identity;
        searchObj.election_role_system_name = this.clusterShiftData.election_role_system_name;
        ElectionsActions.searchForVoterActivist(this.props.dispatch, searchObj, cityKey, 'transportation');
	}
	addDriverToCluster(electionRoleKey, allocationObj, bindWithShift = false) {
        let requestData = this.getDriversRequestData();

        allocationObj.election_role_key = electionRoleKey;
        allocationObj.cluster_key = this.state.cluster.key
        
		let voterKey = this.props.addAllocationActivistItem.key;
        let cityKey = this.props.cityData.searchCityKey;
       
        if(!bindWithShift){
            ElectionsActions.addDriverToCluster(this.props.dispatch, cityKey,  voterKey, allocationObj, requestData);
        } else {
            ElectionsActions.getTransportationsDriversData(this.props.dispatch, requestData);
        }
        this.hideAddAllocationModal();
	}
	setVotersPhones(voter_phones){

		let addAllocationPhones = voter_phones.filter(function(currentPhone){
            let phoneToCheck = currentPhone.phone_number.split('-').join('');
			return isMobilePhone(phoneToCheck)
		})

        if ( addAllocationPhones.length > 1 ) {
            addAllocationPhones.sort(arraySort('desc','updated_at'));
        }

        this.setState({addAllocationPhones});
    }
	/** End Add allocation methods */
    render() {
        let cityData = this.props.cityData
        let allClusters = [this.emptyCluster];
        let clustersCombo = allClusters.concat(cityData.clusters);
        let filterActions = [];
        let selectedCity = { id: cityData.city_id, name: cityData.city_name };
        return (
            <div>
                <div className="row form-horizontal">
                    <DisplayTabs currentTab={this.props.currentTab} tabs={this.props.tabs}
                                 setCurrentTab={this.props.setCurrentTab.bind(this)}/>

                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="cluster" className="col-md-2 control-label">אשכול</label>
                            <div className="col-md-10">
                                <div className="col-md-9">
                                    <Combo items={clustersCombo} maxDisplayItems={5} itemIdProperty="id"
                                           itemDisplayProperty='name'
                                           value={this.state.cluster.name}
                                           onChange={this.clusterChange.bind(this)} />
                                </div>
                                <div className="col-md-3">
                                    <button type="button" className="btn btn-primary" onClick={this.onSearch.bind(this)}>סנן</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="cluster" className="col-md-2 control-label">פעולות</label>
                            <div className="col-md-10">
                                <div className="col-md-9">
                                    <Combo items={filterActions} maxDisplayItems={5} itemIdProperty="id"
                                           itemDisplayProperty='name'
                                           value={this.state.driverFilter.name}
                                           onChange={this.filterActionChange.bind(this)} />
                                </div>
                                <div className="col-md-3">
                                    <button type="button" className="btn btn-primary" disabled={true} onClick={this.onFilterAction.bind(this)}>בחר</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <button type="button" className="btn btn-primary" disabled={!this.state.cluster.key}
                            onClick={this.showAddDriverModal.bind(this)}>+ הוסף נהג</button>
                    </div>
                </div>
                {this.props.showAddAllocationModal && <ModalAddAllocation
                    allocationCitiesList={[selectedCity]}
					addAllocationFromCityViewMode={true}
					activistItem={this.props.addAllocationActivistItem} phones={this.state.addAllocationPhones}
					entityAllocationData={this.clusterShiftData}
					hideAddAllocationModal={this.hideAddAllocationModal.bind(this)}
					searchForVoterActivist={this.searchForVoterActivist.bind(this)}
					addAllocation={this.addDriverToCluster.bind(this)} />
				}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        cityData: state.elections.transportationsScreen.cityData,
        driversData: state.elections.transportationsScreen.driversData,
        addAllocationActivistItem: state.elections.managementCityViewScreen.addAllocationModal.activistItem,
        showAddAllocationModal:  state.elections.activistsScreen.showAddAllocationModal,
    }
}

export default connect(mapStateToProps)(DriversFilters);