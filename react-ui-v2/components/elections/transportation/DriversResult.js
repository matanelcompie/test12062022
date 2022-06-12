import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import Pagination from 'components/global/Pagination';
import DriverItem from './DriverItem';

import * as ElectionsActions from 'actions/ElectionsActions';

class DriversResult extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,

            selectedDrivers: {}
        };

        this.driversPerPage = 20;
        this.sortDirection = constants.sortDirections;
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.driversData.isLoading && nextProps.driversData.isLoading ) {
            this.setState({ currentPage: 1 });
        }
    }

    checkAll() {

    }

    toggleDriver(driverKey) {
        let selectedDrivers = this.state.selectedDrivers;

        if ( selectedDrivers[driverKey] != undefined ) {
            delete selectedDrivers[driverKey];
        } else {
            selectedDrivers[driverKey] = 1;
        }

        this.setState({selectedDrivers});
    }

    sortDriversData(sortByField, sortDirection, event) {
        if ( this.props.cityData.searchCityKey == null ) {
            return;
        }

        let requestData = {
            city_key: this.props.cityData.searchCityKey,
            cluster_key: this.props.driversData.searchClusterKey,
            sort_by_field: sortByField,
            sort_direction: sortDirection
        };

        ElectionsActions.getTransportationsDriversData(this.props.dispatch, requestData);
    }

    renderDrivers() {
        let firstRow = (this.state.currentPage - 1) * this.driversPerPage;
        let lastRow = (this.state.currentPage * this.driversPerPage) - 1;
        let clusters = [];
        let that = this;

        if ( lastRow > (this.props.driversData.drivers.length - 1) ) {
            lastRow = this.props.driversData.drivers.length - 1;
        }

        for ( let driverIndex = firstRow; driverIndex <= lastRow; driverIndex++ ) {
            let item = this.props.driversData.drivers[driverIndex];

            clusters.push(<DriverItem key={item.key} item={item} isDriverSelected={that.state.selectedDrivers[item.key] != undefined}
                                      toggleDriver={that.toggleDriver.bind(that)}/>);
        }

        return clusters;
    }

    render() {
        return (
            <div className="transportation-drivers" style={{marginTop: '16px'}}>
                <table className="table table-hover table-striped" style={{border: '1px solid #ddd'}}>
                    <thead>
                        <tr>
                            <th><input type="checkbox" onChange={this.checkAll.bind(this)}
                                       checked={Object.keys(this.state.selectedDrivers).length > 0}
                                       disabled={Object.keys(this.state.selectedDrivers).length == 0}/>
                            </th>
                            <th>ת.ז</th>
                            <th>שם נהג</th>
                            <th>סטטוס שיבוץ</th>
                            <th>סוג רכב</th>
                            <th>
                                <span>מס' מקומות</span>
                                <a className="arrow-up" style={{cursor: 'pointer'}}
                                   onClick={this.sortDriversData.bind(this, 'passenger_count', this.sortDirection.up)}/>
                                <a className="arrow-down" style={{cursor: 'pointer'}}
                                   onClick={this.sortDriversData.bind(this, 'passenger_count', this.sortDirection.down)}/>
                            </th>
                            <th>
                                <span>כמות הסעות</span>
                                <a className="arrow-up" style={{cursor: 'pointer'}}
                                   onClick={this.sortDriversData.bind(this, 'voters_transportations_count', this.sortDirection.up)}/>
                                <a className="arrow-down" style={{cursor: 'pointer'}}
                                   onClick={this.sortDriversData.bind(this, 'voters_transportations_count', this.sortDirection.down)}/>
                            </th>
                            <th>
                                <span>מתוכם הסעות נכה</span>
                                <a className="arrow-up" style={{cursor: 'pointer'}}
                                   onClick={this.sortDriversData.bind(this, 'crippled_transportations_count', this.sortDirection.up)}/>
                                <a className="arrow-down" style={{cursor: 'pointer'}}
                                   onClick={this.sortDriversData.bind(this, 'crippled_transportations_count', this.sortDirection.down)}/>
                            </th>
                        </tr>
                    </thead>

                    <tbody>{this.renderDrivers()}</tbody>
                </table>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        transportationsScreen: state.elections.transportationsScreen,
        driversData: state.elections.transportationsScreen.driversData,
        cityData: state.elections.transportationsScreen.cityData
    }
}

export default connect(mapStateToProps)(DriversResult);