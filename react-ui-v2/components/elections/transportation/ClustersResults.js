import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import ClusterItem from './ClusterItem';
import Pagination from 'components/global/Pagination';

import * as ElectionsActions from 'actions/ElectionsActions';

class ClustersResults extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1
        };

        this.clusterPerPage = 20;
        this.sortDirection = constants.sortDirections;
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.clustersData.isLoading && nextProps.clustersData.isLoading ) {
            this.setState({ currentPage: 1 });
        }
    }

    renderClusters() {
        let firstRow = (this.state.currentPage - 1) * this.clusterPerPage;
        let lastRow = (this.state.currentPage * this.clusterPerPage) - 1;
        let clusters = [];

        if ( lastRow > (this.props.clustersData.clusters.length - 1) ) {
            lastRow = this.props.clustersData.clusters.length - 1;
        }

        for ( let clusterIndex = firstRow; clusterIndex <= lastRow; clusterIndex++ ) {
            let item = this.props.clustersData.clusters[clusterIndex];
            clusters.push(<ClusterItem key={item.key} index={clusterIndex} item={item}/>);
        }

        return clusters;
    }

    navigateToPage(nextPage) {
        this.setState({currentPage: nextPage});
    }

    sortClustersData(sortByField, sortDirection, event) {
        if ( this.props.cityData.searchCityKey == null ) {
            return;
        }

        let requestData = {
            city_key: this.props.cityData.searchCityKey,
            cluster_key: this.props.clustersData.searchClusterKey,
            sort_by_field: sortByField,
            sort_direction: sortDirection
        };

        ElectionsActions.getTransportationsClustersData(this.props.dispatch, requestData);
    }

    render() {
        return (
            <div className="transportation-clusters" style={{marginTop: '16px'}}>
                <table className="table table-hover table-striped" style={{border: '1px solid #ddd'}}>
                    <thead>
                    <tr style={{backgroundColor: '#f9f9f9'}}>
                        <th colSpan="6">{'\u00A0'}</th>
                        <th colSpan="2" className="regular-transport">הסעות רגילות</th>
                        <th colSpan="2" className="handicapped-transport">הסעות נכה</th>
                        <th colSpan="2" className="drivers">נהגים</th>
                    </tr>
                    <tr>
                        <th>מ"ס</th>
                        <th>עיר</th>
                        <th>אשכול</th>
                        <th>כתובת</th>
                        <th>אחוז תומכי ש"ס בבחירות הקודמות</th>
                        <th>מס' תומכים</th>
                        <th className="regular-transport">
                            <span>סך הכל</span>
                            <a className="arrow-up" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_total_regular', this.sortDirection.up)}/>
                            <a className="arrow-down" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_total_regular', this.sortDirection.down)}/>
                        </th>
                        <th className="regular-transport">
                            <span>ממתינות לשיבוץ</span>
                            <a className="arrow-up" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_regular_wating', this.sortDirection.up)}/>
                            <a className="arrow-down" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_regular_wating', this.sortDirection.down)}/>
                        </th>
                        <th className="handicapped-transport">
                            <span>סך הכל</span>
                            <a className="arrow-up" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_total_crippled', this.sortDirection.up)}/>
                            <a className="arrow-down" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_total_crippled', this.sortDirection.down)}/>
                        </th>
                        <th className="handicapped-transport">
                            <span>ממתינות לשיבוץ</span>
                            <a className="arrow-up" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_crippled_wating', this.sortDirection.up)}/>
                            <a className="arrow-down" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_crippled_wating', this.sortDirection.down)}/>
                        </th>
                        <th className="drivers">
                            <span>סך הכל</span>
                            <a className="arrow-up" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_total_drivers', this.sortDirection.up)}/>
                            <a className="arrow-down" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_total_drivers', this.sortDirection.down)}/>
                        </th>
                        <th className="drivers">
                            <span>ממתינות לשיבוץ</span>
                            <a className="arrow-up" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_waiting_drivers', this.sortDirection.up)}/>
                            <a className="arrow-down" style={{cursor: 'pointer'}}
                               onClick={this.sortClustersData.bind(this, 'count_waiting_drivers', this.sortDirection.down)}/>
                        </th>
                    </tr>
                    </thead>

                    <tbody>{this.renderClusters()}</tbody>
                </table>

                {( this.props.clustersData.clusters.length > this.clusterPerPage ) &&
                <div className="row">
                    <nav aria-label="Page navigation paginationRow">
                        <div className="text-center">
                            <Pagination navigateToPage={this.navigateToPage.bind(this)}
                                        resultsCount={this.props.clustersData.clusters.length}
                                        currentPage={this.state.currentPage}
                                        displayItemsPerPage={this.clusterPerPage}/>
                        </div>
                    </nav>
                </div>
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        transportationsScreen: state.elections.transportationsScreen,
        clustersData: state.elections.transportationsScreen.clustersData,
        cityData: state.elections.transportationsScreen.cityData
    }
}

export default connect(mapStateToProps)(ClustersResults);