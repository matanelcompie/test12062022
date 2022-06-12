import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import EntityActivistsDetails from './EntityActivistsDetails';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import constants from '../../../../../libs/constants';
import ScreenTabs from './ScreenTabs';

class ClustersActivistsView extends React.Component {

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

    componentWillReceiveProps(nextProps) {
    }

	componentWillUnmount(){
		  this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CLEAN_ALL_DATA});
	}
	updateCurrentTab(name){
		this.setState({currentTab: name});
	}

	renderCityQuarters(){
		return this.props.currentEntitySummaryData.sub_entities_activists_summary.map((entityDataSummary, i) => {
			console.log('entityDataSummary---', entityDataSummary)
			return (
                <EntityActivistsDetails key={i} entityType={this.props.subEntityType} entityDataSummary={entityDataSummary}/>
            )
		})
	}
    render() {
		// this.initDynamicVariables();
		// console.log('this.state.containerCollapseStatus.clustersAndBallots', this.state.containerCollapseStatus.clustersAndBallots)
		let tabs = [
			{name: 'ניהול רובעים עירוניים', path: 'cityQuarters'},
			{name: 'תפקידים עירוניים', path: 'municipalCoordinators'},
			{name: 'אשכולות וקלפיות', path: 'clusterAndBallots'},
		];

        return (
            <div className="containerTabs">
    

			   {<EntityActivistsDetails entityType={this.props.currentEntityType} entityDataSummary={this.props.currentEntitySummaryData.parent_entities_activists_summary}/>}

			  	<ScreenTabs tabs={tabs}  updateCurrentTab={this.updateCurrentTab.bind(this)}></ScreenTabs>

				<div id="cityActivists" className="tab-content tabContnt">
					{this.state.currentTab == 'cityQuarters' && this.renderCityQuarters()}

				</div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
         currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
         showSearchResults:state.elections.managementCityViewScreen.showSearchResults,
		 electionRolesShifts: state.elections.activistsScreen.electionRolesShifts,
    }
}

export default connect(mapStateToProps)(withRouter(ClustersActivistsView));