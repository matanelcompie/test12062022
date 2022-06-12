import React from 'react';
import {connect} from 'react-redux';
import { GeographicAllocationDto } from '../../../../../DTO/GeographicAllocationDto';
import GeographicEntityType from '../../../../../Enums/GeographicEntityType';
import constants from '../../../../../libs/constants';


class ClusterActivistsDetails extends React.Component {

    constructor(props) {
        super(props);
    }
	renderActivistsDetails(clusterData){
        const activistsItems = [
            {label: 'ממריצים', system_name: constants.electionRoleSytemNames.motivator},
            {label: 'נהגים', system_name: constants.electionRoleSytemNames.driver},
            {label: 'שרי 100', system_name: constants.electionRoleSytemNames.ministerOfFifty},
            {label: 'ראשי אשכולות', system_name: constants.electionRoleSytemNames.clusterLeader},
        ];
        let cols =  activistsItems.map((item) => {
            let total = (clusterData && clusterData[item.system_name]) || 0;
            let allocated = (clusterData && clusterData['allocated_' + item.system_name]) || 0;
            return (
                <td width="8%" key={item.system_name} >
              
                    <button title='מספר הקצאות' disabled={total==0} className='small-btn-primary' onClick={this.props.displayUpdateClusterActivistsModal.bind(this, clusterData.entity_id, item.system_name, true )} >{total}</button>
                    <span>&nbsp;/&nbsp;</span>
                    <button title={"נותרו "+(total-allocated)+" הקצאות לשבץ"} onClick={this.props.showAddAssignmentModal.bind(this,new GeographicAllocationDto(GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_CLUSTER,clusterData.entity_id),item.system_name)} disabled={total-allocated==0} className='small-btn-defualt' >{total-allocated}&nbsp;+</button>
                </td>
            )
        });
        return (cols)
    }

    render() {
        let clusterData = this.props.clusterData;
        let entity_name = clusterData ? clusterData.entity_name: '';
        let entitiesCounters = clusterData.entities_counters ? clusterData.entities_counters : {};
        return (
            <tr className="collapse-action-row">
                <td width="2%">
                    <a style={{ cursor: 'pointer' }} onClick={this.props.showRowDetails.bind(this, clusterData.entity_key)} >
                        <img src={window.Laravel.baseAppURL + (clusterData.detailed ? "Images/collapse-circle-open.svg" : "Images/collapse-circle-close.svg")} />
                    </a>
                </td>
                {/* <td><span className="num-utem">{(i + 1)}</span>.</td> */}
                <td width="15%">
                    <a href={window.Laravel.baseURL + "elections/activists/cluster_summary/" + clusterData.entity_key} target="_blank">{entity_name}</a>
                </td>
                <td width="5%">{entitiesCounters.ballot_boxes_cnt}</td> 
                <td width="5%">{entitiesCounters.activists_allocations_count}</td> 
                <td width="5%">{entitiesCounters.voter_count}</td>
                {this.renderActivistsDetails(clusterData)}
            </tr>
        );
    }
}

function mapStateToProps(state) {
    return {
            searchScreen:state.elections.managementCityViewScreen.searchScreen,
            electionsActivistsSummary:state.elections.managementCityViewScreen.electionsActivistsSummary,
    }
}

export default connect(mapStateToProps)(ClusterActivistsDetails);