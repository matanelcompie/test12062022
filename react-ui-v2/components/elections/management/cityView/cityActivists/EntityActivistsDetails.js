import React from 'react';
import {connect} from 'react-redux';
import constants from '../../../../../libs/constants';
import {getGeographicEntityTypeName} from '../../../../../libs/globalFunctions'
import { getActivistsElectionsRoles } from '../../../../../libs/services/CityActivistsService';

class EntityActivistsDetails extends React.Component {

    constructor(props) {
        super(props);
    }
    onSelectParentGeoEntity(entityDataSummary){
        
        this.props.onSelectParentGeoEntity(entityDataSummary);
    }
	renderActivistsDetails(entityDataSummary){
        let counterSystemName =constants.electionRoleSytemNames.counter;

        const activistsItems = getActivistsElectionsRoles();

        return activistsItems.map((item) => {
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
        })
    }
    renderNavigateButton(entityDataSummary){
       if(entityDataSummary.entity_type == -1) { return null;}
        let type ='MAIN', navigateToText = 'למעלה ל' + getGeographicEntityTypeName(entityDataSummary.parent_entity_type);

        return (
            <div className="navigate-to" onClick={this.onSelectParentGeoEntity.bind(this, entityDataSummary)} 
                style={{cursor: 'pointer', textAlign: 'center'}}>
                <div className="navigate-icon-wrp"><i className={`fa fa-chevron-up`}></i></div>
                <div className="navigate-description">{navigateToText}</div>
            </div>
        )
    }
    renderEntityName(entityDataSummary){
        let entityName = entityDataSummary ? entityDataSummary.entity_name: '';
        return (
        <div className="city-name-content">
            <img src={window.Laravel.baseURL +"Images/icon-city.svg"} alt=""/>
            <div className="city-name-wrapper">
                    <div className="city-name ellip ellipsis-2lines">{entityName}</div>
                    {this.renderNavigateButton(entityDataSummary)}
                    {/* <span title={entityName} className="city-name ellip ellipsis-2lines">{entityName}</span> */}
            </div>
        </div>
        )
    }
    renderClustersSummary(){
        
        return (
            <div className="info-items flexed-center pie-info">
                <img src="he-il/Images/pie-dummy.png" alt="" height="65" width="65"/>
                <dl className="dl-pie">
                    <dt className="data-number medium">190/1200</dt>
                    <dd className="related-data-header medium">קלפיות חמות</dd>
                </dl>
            </div>
        )
    }
    render() {
        let entityDataSummary = this.props.entityDataSummary;

        return (
            <div className="dtlsBox electorDtlsStrip clearfix">
                <div className="flexed flexed-space-between electorDtlsData">

                    {this.renderEntityName(entityDataSummary)}
                    {/* {this.renderClustersSummary()} */}
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

export default connect(mapStateToProps)(EntityActivistsDetails);