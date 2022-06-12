import React from 'react';
import { connect } from 'react-redux';

import ReactWidgets from 'react-widgets';

// import * as ElectionsActions from 'actions/ElectionsActions';
// import * as SystemActions from 'actions/SystemActions';
import Combo from 'components/global/Combo';
import { parseDateToPicker, parseDateFromPicker } from 'libs/globalFunctions';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import DisplayTabs from './DisplayTabs';

class TransportationsFilters extends React.Component {
    initState = {
        chooseAllCheckboxs: true,
        filtersObject: {
            max_transport_time: null,
            //Checkboxes
            voted_voters: false,
            not_voted_voters: true,
            transport_with_driver: true,
            transport_not_with_driver: true,
            transport_with_cripple: true,
            transport_not_with_cripple: true,
            //ComboValues
            cluster_key: null,
            driver_key: null,
        },
        comboFilters: {
            selectedCluster: { selectedValue: '', selectedItem: null },
            selectedDriver: { selectedValue: '', selectedItem: null },
            selectedAction: { selectedValue: '', selectedItem: null },
        } , 
		filteredDrivers:[],
    };
	constructor(props) {
		super(props);
		this.initConstants();
        this.state = { ...this.initState };
        this.props.updateFiltersData(this.state.filtersObject);
        momentLocalizer(moment);
	}

	/*
	function that initializes constant variables 
	*/
	initConstants() {
		
		this.displayButtonStyle = { marginTop: '22px' };
		this.mainPanelStyle = { minHeight: '192px', paddingTop: '20px' };
		this.mainWrapperStyle = { paddingTop: '20px' };
        this.checkboxesStyle = { paddingRight: '20px', paddingLeft: '20px', paddingTop: '8px' };
        this.checkboxesDivStyle = { background: 'rgb(229, 238, 244)', padding: '15px', marginTop: '10px' };
        this.timeComboStyle = {display: 'inline-block', margin: '0px 20px', width: '140px' };

        this.checkboxesTexts={
            voted_voters: 'תושבים שהצביעו',
            not_voted_voters: 'תושבים שלא הצביעו',
            transport_with_driver: 'הסעות משובצות',
            transport_not_with_driver: 'הסעות לא משובצות',
            transport_with_cripple: 'הסעות נכים',
            transport_not_with_cripple: 'הסעות רגילות',
        }
        this.hasLockDriverText = 'חלק מההסעות משוייכות לנהג עם נעילה!';
        this.checkboxesValues = [
            'voted_voters', 'not_voted_voters', 'transport_with_driver',
            'transport_not_with_driver', 'transport_with_cripple', 'transport_not_with_cripple'
        ]
        this.defineActionsPermissions();
    }


    defineActionsPermissions(){
        this.actionList = []
        let hasEditPermission = true;
        let hasDeletePermission = true;
        if (!this.props.currentUser.admin) {
            hasEditPermission = this.props.currentUser.permissions['elections.transportations.edit'];
            hasDeletePermission = this.props.currentUser.permissions['elections.transportations.delete'];
        }
        if (hasDeletePermission) {
            this.actionList.push({ id: 1, actionName: 'delete_transport', name: 'מחק הסעה' })
        }
        if (hasEditPermission) {
            this.actionList.push({ id: 2, actionName: 'unbind_driver', name: 'בטל שיבוץ' })
            this.actionList.push({ id: 3, actionName: 'mark_as_executed', name: 'סמן הסעה כבוצעה' })
        }
    }
	componentWillReceiveProps(nextProps){
		if(this.props.cityData.drivers.length == 0 && nextProps.cityData.drivers.length > 0){
			this.setState({filteredDrivers:nextProps.cityData.drivers});
        }
        if (this.props.rowsSelectedKeyList.length != nextProps.rowsSelectedKeyList.length) {
            let fieldName = 'selectedAction';
            let selectedItem = this.state.comboFilters.selectedAction.selectedItem
            this.checkIfHasLockDriver(fieldName, selectedItem);
        }
	}
	/** 
     *   @method filterComboChange
     *   handle change in one of comboes
     *   @param fieldName - the combo name in state
	*/
    filterComboChange(fieldName, e) {
        let newState = { ...this.state };
        newState.filtersObject = { ...newState.filtersObject };
        newState.comboFilters = { ...newState.comboFilters };

        let selectedItem = e.target.selectedItem ? e.target.selectedItem : null;
        let selectedValue = selectedItem ? selectedItem.name : e.target.value;
        let filtersComboNames = { selectedCluster: 'cluster_key', selectedDriver: 'driver_key' };

        if (filtersComboNames.hasOwnProperty(fieldName)) {
            newState.filtersObject[filtersComboNames[fieldName]] = selectedItem ? selectedItem.key : null;
        }
        newState.comboFilters[fieldName] = { selectedValue: selectedValue, selectedItem: selectedItem };

        if (fieldName == 'selectedCluster') {
            if (e.target.selectedItem) {
                newState.filteredDrivers = this.props.cityData.drivers.filter(item => item.cluster_id == e.target.selectedItem.id);
            }
            else {
                newState.filteredDrivers = this.props.cityData.drivers;
            }
        }
        this.disabledAction = false;
        this.checkIfHasLockDriver(fieldName, selectedItem);
        this.updateStateAndFilters(newState)
    }
    checkIfHasLockDriver(fieldName, selectedItem){
        if (fieldName == 'selectedAction' && selectedItem && selectedItem.actionName == 'unbind_driver') {
            this.disabledAction = this.props.checkIfHasLockDriver()
         }
    }
    filterCheckboxChange(fieldName, e) {
        let newState = { ...this.state };
        newState.filtersObject = { ...newState.filtersObject };

        let value = e.target.checked;
        newState.filtersObject[fieldName] = value;
        this.updateStateAndFilters(newState)
    }

    chooseAllCheckboxs(){
        let newState = { ...this.state };
        newState.filtersObject = { ...newState.filtersObject };

        let bool = this.state.chooseAllCheckboxs;
        this.checkboxesValues.forEach(function(prop){
            newState.filtersObject[prop] = bool;
        })
        newState.chooseAllCheckboxs = !this.state.chooseAllCheckboxs;
        this.updateStateAndFilters(newState)
    }
    dateTimeChange(value){
        let newState = { ...this.state };
        newState.filtersObject = { ...newState.filtersObject };
        newState.filtersObject.max_transport_time = value;
        this.updateStateAndFilters(newState)
    }
    updateStateAndFilters(newState) {
        this.setState(newState);
        this.props.updateFiltersData(newState.filtersObject);
    }
    onSearch() {
        this.props.getTransportationsData()
    }

    renderCheckboxFilters() {
        let self = this;
        let filtersObject = this.state.filtersObject;

        let checkboxesValues = this.checkboxesValues;
        let checkboxes = [];
        checkboxesValues.forEach(function (prop) {
            let checkboxItem = <label className="checkbox-inline"
                key={prop} style={self.checkboxesStyle}>
                <input type="checkbox" checked={filtersObject[prop]}
                    onChange={self.filterCheckboxChange.bind(self, prop)}
                />
                {self.checkboxesTexts[prop]}</label>
            checkboxes.push(checkboxItem)
        })
        return checkboxes;
    }

    render() {
        let comboFilters =this.state.comboFilters;
        return (
            <div>
                <div className="row form-horizontal">
                    <DisplayTabs currentTab={this.props.currentTab} tabs={this.props.tabs}
                                 setCurrentTab={this.props.setCurrentTab.bind(this)}/>

                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="cluster" className="col-md-3 control-label">אשכול</label>
                            <div className="col-md-9">
                                <Combo items={this.props.cityData.clusters} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name'
                                    value={comboFilters.selectedCluster.selectedValue} onChange={this.filterComboChange.bind(this, 'selectedCluster')} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <div className="form-group">
                            <label htmlFor="cluster" className="col-md-4 control-label">שם נהג</label>
                            <div className="col-md-8">
                                <Combo items={this.state.filteredDrivers} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name'
                                    value={comboFilters.selectedDriver.selectedValue} onChange={this.filterComboChange.bind(this, 'selectedDriver')} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <div className="col-md-1"><div style={{   fontSize:'35px' ,marginTop:'-11px' , fontWeight:'bold'}}>|</div></div>
                            <label htmlFor="actions" className="col-md-2 control-label">פעולות</label>
                            <div className="col-md-6">
                                <Combo items={this.actionList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name'
                                    value={comboFilters.selectedAction.selectedValue} onChange={this.filterComboChange.bind(this, 'selectedAction')} />
                            </div>
                            <div className="col-md-3">
                                <button type="button" className="btn btn-primary btn-block" onClick={this.props.executeAction.bind(this, comboFilters.selectedAction.selectedItem)}
                                   disabled={!comboFilters.selectedAction.selectedItem || this.props.rowsSelectedKeyList.length == 0 || this.disabledAction}>בצע</button>
                            </div>
                        </div>
                        <div className="col-md-12 text-danger no-padding" style={this.disabledAction ?
                            { display: 'block', 'textAlign': 'center' } : { display: 'none' }}>
                            <span>{this.hasLockDriverText} </span>
                        </div>
                    </div>
                </div>
                <div className="row" style={this.checkboxesDivStyle}>
                    {this.renderCheckboxFilters()}
                    <a type="button" onClick={this.chooseAllCheckboxs.bind(this)} style={{ cursor: 'pointer', position: 'relative', top: '5px' }}>{this.state.chooseAllCheckboxs ? 'בחר הכל' : 'הסר הכל'}</a>
                    <div className="pull-left">
                        <label>בחר שעה</label>
                        <ReactWidgets.DateTimePicker
                            isRtl={true}
                            value={parseDateToPicker(this.state.filtersObject.max_transport_time)}
                            onChange={parseDateFromPicker.bind(this, { callback: this.dateTimeChange, format: "HH:mm", functionParams: { } })}
                            format="HH:mm"
							timeFormat="HH:mm"
                            calendar={false}
                            style={this.timeComboStyle}
                    />
                        <button type="button" className="btn btn-primary" onClick={this.onSearch.bind(this)}>סנן</button>
                    </div>
                </div>
            </div>
        )
	}
}


function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		cityData: state.elections.transportationsScreen.cityData,
	}
}

export default connect(mapStateToProps)(TransportationsFilters);
