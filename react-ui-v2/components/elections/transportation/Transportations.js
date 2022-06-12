import React from 'react';
import { connect } from 'react-redux';
// import { withRouter } from 'react-router';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
// import * as SystemActions from 'actions/SystemActions';

import TransportationsSearch from './TransportationsSearch';
import TransportationsFilters from './TransportationsFilters';
import TransportationsResults from './TransportationsResults';
import TransportationsCityData from './TransportationsCityData';
import ClustersFilters from './ClustersFilters';
import ClustersResults from './ClustersResults';
import DriversFilters from './DriversFilters';
import DriversResult from './DriversResult';

class Transportations extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rowsSelectedKeyList: [],
            rowsSelectedIndexList: [],
            filtersObject: null,
            citySelectedItem: null,

            tabs: {
                clusterResult: {title: 'תצוגת אשכולות', display: true},
                transportationResult: {title: 'תצוגת הסעות', display: false},
                driverResult: {title: 'תצוגת נהגים', display: false}
            },

            currentTab: 'clusterResult'
        };
		this.screenPermission ='elections.transportations';

        this.displayResult = false;
    }
	
	componentWillMount(){
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: "שיבוץ הסעות"});
        ElectionsActions.loadElectionRoles(this.props.dispatch);
        ElectionsActions.loadElectionRolesBudget(this.props.dispatch);
	}
    componentWillReceiveProps(nextProps){
        if (this.props.currentUser.first_name && (this.props.currentUser.admin == false && nextProps.currentUser.permissions[this.screenPermission] != true)) {
			this.props.router.replace('/unauthorized');
		}
    }
    setCurrentTab(newTab) {
        let currentTab = this.state.currentTab;
        let tabs = this.state.tabs;

        tabs[currentTab].display = false;
        tabs[newTab].display = true;

        this.setState({currentTab: newTab, tabs});
    }

    updateFiltersData(filtersObject) {
        this.setState({ filtersObject: filtersObject });
    }
    getTransportationsData(citySelectedItem = null) {
	    this.setCurrentTab('transportationResult');

        let self = this;
        this.initSelectedRows();
        if (citySelectedItem) { this.setState({ citySelectedItem: citySelectedItem }); }
        setTimeout(function () { //Wait for state to update
            let requestData = self.getRequestData();
            ElectionsActions.getTransportationsData(self.props.dispatch, requestData, true);
        });
    }
    getMoreTransportationsData() {
        let skipRows = this.totalVotersCount;
        if(skipRows < this.props.transportationsCountByFilters){
            let requestData = this.getRequestData(skipRows);
            ElectionsActions.getTransportationsData(this.props.dispatch, requestData, false);
        }
    }
    getRequestData(skipRows = null){
        if (!this.state.citySelectedItem) { return; }
        this.displayResult = true;
        let requestData = { filters_object: this.state.filtersObject, city_key: this.state.citySelectedItem.key }
        if (skipRows) { requestData.skip_rows = skipRows }
        return requestData; 
    }
    //Rows functions:
    updateRowsSelectedList(rowsSelectedHash) {
        let rowsSelectedKeyList = [];
        let rowsSelectedIndexList  = [];
        for (let rowIndex in rowsSelectedHash) {
            if (rowsSelectedHash[rowIndex]) {
                let clusterKey = this.props.votersTransportations[rowIndex].transportations_key;
                rowsSelectedKeyList.push(clusterKey)
                rowsSelectedIndexList.push(rowIndex)
            }
        }
        this.setState({ rowsSelectedKeyList: rowsSelectedKeyList, rowsSelectedIndexList : rowsSelectedIndexList });
    }
    /**
     * @method executeAction
     * execute action on selected rows 
     * this.state.rowsSelectedList -> rows selected key list
     * @returns void
     */
    executeAction(action) {
        let requestData = { action: action.actionName, transportations_keys: this.state.rowsSelectedKeyList };
        let cityKey = this.state.citySelectedItem ? this.state.citySelectedItem.key : null;
        ElectionsActions.updateTransportations(this.props.dispatch, requestData, cityKey, this.state.rowsSelectedIndexList)
        this.initSelectedRows();
    }
    checkIfHasLockDriver(){
        let votersTransportations = this.props.votersTransportations;
        let hasLockDriver = false;
        this.state.rowsSelectedIndexList.forEach(function (rowIndex) {
            let item = votersTransportations[rowIndex];
            if (item.is_driver_lock) {
                hasLockDriver = true;
            }
        });
        return hasLockDriver;
    }
    initSelectedRows(){
        this.setState({rowsSelectedKeyList: [], rowsSelectedIndexList: []});
    }
    render() {
        this.totalVotersCount = this.props.votersTransportations.length;
        let displayResult = this.displayResult;
        // let displayResult = this.totalVotersCount > 0 ? true : false;
        let cityKey = this.state.citySelectedItem ? this.state.citySelectedItem.key : null;

        return (
            <div>
                <TransportationsSearch screenPermission={this.screenPermission} getTransportationsData={this.getTransportationsData.bind(this)}/>
                {displayResult && <TransportationsCityData cityData={this.props.cityData} totalVotersCount={this.props.totalVotersCount}/>}

                { displayResult &&
                <div className={"row dtlsBox srchRsltsBox" + (this.state.tabs.clusterResult.display ? "" : " hidden")}>
                    <ClustersFilters
                        currentTab={this.state.currentTab}
                        tabs={this.state.tabs}
                        setCurrentTab={this.setCurrentTab.bind(this)}
                    />
                    <ClustersResults currentTab={this.state.currentTab}/>
                </div>}

                { displayResult &&
                <div className={"row dtlsBox srchRsltsBox" + (this.state.tabs.driverResult.display ? "" : " hidden")}>
                    <DriversFilters
                        currentTab={this.state.currentTab}
                        tabs={this.state.tabs}
                        setCurrentTab={this.setCurrentTab.bind(this)}
                    />
                    <DriversResult currentTab={this.state.currentTab}/>
                </div>}

                { displayResult &&
                <div className={"row dtlsBox srchRsltsBox" + (this.state.tabs.transportationResult.display ? "" : " hidden")}>
                    <TransportationsFilters
                        currentTab={this.state.currentTab}
                        tabs={this.state.tabs}
                        setCurrentTab={this.setCurrentTab.bind(this)}
                        updateFiltersData={this.updateFiltersData.bind(this)}
                        getTransportationsData={this.getTransportationsData.bind(this)}
                        checkIfHasLockDriver ={this.checkIfHasLockDriver.bind(this)}
                        executeAction={this.executeAction.bind(this)}
                        rowsSelectedKeyList={this.state.rowsSelectedKeyList}/>
                     <TransportationsResults
                        currentTab={this.state.currentTab}
                        getMoreTransportationsData={this.getMoreTransportationsData.bind(this)}
                        updateRowsSelectedList={this.updateRowsSelectedList.bind(this)}
                        citySelectedItem={this.state.citySelectedItem}
                        getRequestData={this.getRequestData.bind(this)}
                        initSelectedRows={this.initSelectedRows.bind(this)}
                        cityKey={cityKey}
                        rowsSelectedIndexList={this.state.rowsSelectedIndexList}
                        />
                </div>}
            </div>
        )
    }
}
function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        cityData: state.elections.transportationsScreen.cityData,
        votersTransportations: state.elections.transportationsScreen.votersTransportations,
        totalVotersCount: state.elections.transportationsScreen.totalVotersCount,
        transportationsCountByFilters: state.elections.transportationsScreen.transportationsCountByFilters,
    }
}

export default connect(mapStateToProps)(Transportations);