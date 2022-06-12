import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';


import EntityActivistsDetails from './EntityActivistsDetails';
import SearchResults from '../SearchResults'

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import constants from '../../../../../libs/constants';
import MunicipalCoordinators from './MunicipalCoordinators';
import SubEntities from './SubEntities';
import ScreenTabs from '../ScreenTabs';

class CityView extends React.Component {

    constructor(props) {
        super(props);
		this.state = {
			cleanedNewRouteScreen:false,
			isOnlyMuniRole: false,
			currentTab: 'cityQuarters'
		};
        this.initConstants();

    }

    initConstants() {
		this.screenPermission = 'elections.activists.city_summary';
    }

    
	componentWillUnmount(){
		  this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CLEAN_ALL_DATA});
	}
	updateCurrentTab(name){
		this.setState({currentTab: name});
	}

    render() {
		// this.initDynamicVariables();
		// console.log('this.state.containerCollapseStatus.clustersAndBallots', this.state.containerCollapseStatus.clustersAndBallots)
		console.log('this.props.searchScreen.selectedCity.selectedItem', this.props.searchScreen.selectedCity.selectedItem)
		let selectedCity = this.props.searchScreen.selectedCity.selectedItem

        return (
            <div id="cityView" className="election-activist-edit">
  
				{this.props.showSearchResults && <EntityActivistsDetails entityType={constants.geographicEntityTypes.city} entityData={selectedCity}/>}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
         currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
         showSearchResults:state.elections.managementCityViewScreen.showSearchResults,
		 currentPage :state.elections.managementCityViewScreen.currentPage,
		 displayItemsPerPage :state.elections.managementCityViewScreen.displayItemsPerPage,
		 clusters:state.elections.managementCityViewScreen.clusters,
		 searchScreen:state.elections.managementCityViewScreen.searchScreen,
		 electionRolesShifts: state.elections.activistsScreen.electionRolesShifts,
    }
}

export default connect(mapStateToProps)(withRouter(CityView));