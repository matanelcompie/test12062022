import React from 'react';
import {connect} from 'react-redux';
import constants from '../../../../../libs/constants';
import { getGeographicEntityTypeName } from '../../../../../libs/globalFunctions';
import { getActivistsElectionsRoles } from '../../../../../libs/services/CityActivistsService';

class SubEntityActivistsDetails extends React.Component {

    constructor(props) {
        super(props);
    }
  
	renderActivistsDetails(entityDataSummary){
        let counterSystemName =constants.electionRoleSytemNames.counter;

        const activistsItems = getActivistsElectionsRoles();

        let progressBars =  activistsItems.map((item) => {
  
            let total = (entityDataSummary && entityDataSummary[item.system_name])  || 0;
            let allocated = (entityDataSummary && entityDataSummary['allocated_' + item.system_name]) || 0;

            let percents = (allocated /total)  * 100;
            return (
                <div className="info-items" key={item.system_name}>
                    <dl>
                        <dt className="data-number small">{total} / {allocated}</dt>
                        <dd className="related-data-header small">{item.label}</dd>
                    </dl>
                    <div className="progress">
                        <div className="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style={{width: (percents +'%')}}></div>
                    </div>
                </div>
            )
        });
        return (
            <div className="secondary-numbers flexed-center flexed-space-between">{progressBars}</div>
        )
    }
    renderNavigateButton(entityDataSummary){
        if(!entityDataSummary.entity_id) {return null;}
        let navigateToText = 'כניסה לפירוט ' + getGeographicEntityTypeName(entityDataSummary.entity_type);

        return (
            <div className="navigate-to" onClick={this.props.onSelectGeoEntity.bind(this, entityDataSummary)}>
                <t className="navigate-description">{navigateToText}</t>
                <t className="navigate-icon-wrp"><i className={`fa fa-chevron-left`}></i></t>
            </div>
        )
    }

    renderClustersSummary( entityDataSummary){
        let entitiesCounters = entityDataSummary.entities_counters ?  entityDataSummary.entities_counters: {};
        return (
            <div className="main-numbers flexed-space-between">
                <div className="info-items flexed-center">
                    <dl style={{textAlign: "center"}}>
                        <dt className="data-number big">{entitiesCounters.cluster_cnt}</dt>
                        <dd className="related-data-header big">אשכולות</dd>
                    </dl>
                </div>
                <div className="info-items flexed-center" >
                    <dl style={{textAlign: "center"}}>
                        <dt className="data-number big">{entitiesCounters.allocated_ballot_cnt}/{entitiesCounters.activists_allocations_count}</dt>
                        <dd className="related-data-header big">קלפיות מאויישות</dd>
                    </dl>
                </div>
            </div>
        )
    }
    
    render() {
        let entityDataSummary = this.props.entityDataSummary;
        let entity_name = entityDataSummary? entityDataSummary.entity_name: '';
        // Check if parent entity is city.
        return (
            <div className="neighborhood-item">
                <div className="title-and-actions-wrapper flexed flexed-space-between">
                    <div className='title-number'>

                        <h2>
                            <a title={entity_name}>
                                {entity_name}
                            </a>
                            {this.renderNavigateButton(entityDataSummary)}
                        </h2>
                    </div>
  
                </div>
                <div className="main-info-wrapper flexed flexed-center">
                    {this.renderClustersSummary(entityDataSummary)}
                    {this.renderActivistsDetails(entityDataSummary)}
                </div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
            searchScreen:state.elections.managementCityViewScreen.searchScreen,
            electionsActivistsSummary:state.elections.managementCityViewScreen.electionsActivistsSummary,
    }
}

export default connect(mapStateToProps)(SubEntityActivistsDetails);