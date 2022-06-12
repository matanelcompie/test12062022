import React from 'react';
import { connect } from 'react-redux';

import Combo from 'components/global/Combo';
import DisplayTabs from './DisplayTabs';

import * as ElectionsActions from 'actions/ElectionsActions';


class ClustersFilters extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cluster: {id: null, name: '', key: null}
        };

        this.emptyCluster = {id: null, name: 'הכל', key: null};
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

    componentWillReceiveProps(nextProps) {
        if ( nextProps.currentTab == 'clusterResult' && !nextProps.clustersData.isLoaded && !nextProps.clustersData.isLoading) {
            let requestData = {
                city_key: this.props.cityData.searchCityKey,
                cluster_key: null
            };
            let cluster = {...this.emptyCluster};
            this.setState({cluster});

            this.getTransportationsClustersData(requestData);
        }
    }

    getTransportationsClustersData(requestData) {
        ElectionsActions.getTransportationsClustersData(this.props.dispatch, requestData);
    }

    onSearch(event) {
        let requestData = {
            city_key: this.props.cityData.searchCityKey,
            cluster_key: this.state.cluster.key
        };

        this.getTransportationsClustersData(requestData);
    }

    render() {
        let allClusters = [this.emptyCluster];
        let clustersCombo = allClusters.concat(this.props.cityData.clusters);

        return (
            <div>
                <div className="row form-horizontal">
                    <DisplayTabs currentTab={this.props.currentTab} tabs={this.props.tabs}
                                 setCurrentTab={this.props.setCurrentTab.bind(this)}/>

                    <div className="col-md-3 pull-left">
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
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        cityData: state.elections.transportationsScreen.cityData,
        clustersData: state.elections.transportationsScreen.clustersData
    }
}

export default connect(mapStateToProps)(ClustersFilters);