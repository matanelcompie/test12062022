import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';


import EntityActivistsDetails from './EntityActivistsDetails';
import SubEntityActivistsDetails from './SubEntityActivistsDetails';


class AreaActivistsSummary extends React.Component {

    constructor(props) {
        super(props);
		this.state = {
			cleanedNewRouteScreen:false,
			isOnlyMuniRole: false,
			// currentTab: 'cityQuarters' 
		};
        this.initConstants();
    }

    initConstants() {
		this.screenPermission = 'elections.activists.city_summary';
    }

    componentWillReceiveProps(nextProps) {

    }

    
	renderSubEntities(){
		if(!this.props.currentEntitySummaryData.sub_entities_activists_summary) { return <div></div>}
		return this.props.currentEntitySummaryData.sub_entities_activists_summary.map((entityDataSummary, i) => {
			return (
                <SubEntityActivistsDetails 
					onSelectGeoEntity={this.props.onSelectGeoEntity.bind(this)} 
					key={i} entityType={this.props.subEntityType} entityDataSummary={entityDataSummary}
				/>
            )
		})
		
	}

    render() {
		// this.initDynamicVariables();
		let entityDataSummary =this.props.currentEntitySummaryData.parent_entities_activists_summary;
        return (
            <div id="cityActivists" className="election-activist-edit">
				{ <EntityActivistsDetails 
					onSelectParentGeoEntity={this.props.onSelectParentGeoEntity.bind(this)} 
					entityType={this.props.currentEntityType} entityDataSummary={entityDataSummary}
				/> }
				<div className="dtlsBox electorDtlsStrip clearfix">

					{this.renderSubEntities()}

				</div>
			  	{/* <ScreenTabs tabs={tabs}  updateCurrentTab={this.updateCurrentTab.bind(this)}></ScreenTabs> */}

               
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
         showSearchResults:state.elections.managementCityViewScreen.showSearchResults,
    }
}

export default connect(mapStateToProps)(withRouter(AreaActivistsSummary));