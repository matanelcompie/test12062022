import React from 'react';
import { connect } from 'react-redux';
import ModalWindow from 'components/global/ModalWindow';

import * as ElectionsActions from 'actions/ElectionsActions';

import Combo from 'components/global/Combo';
import DriverTransportationsRow from './DriverTransportationsRow';

class EditDriverModal extends React.Component {
    initState = {
        filtersObject: {
            cluster_key: null,
            city_key: null,
            first_name: null,
            last_name: null,
        },
        comboFilters: {
            selectedCity: { selectedValue: '', selectedItem: null },
            selectedCluster: { selectedValue: '', selectedItem: null }
        },
        selectedDriver :null
    }
    constructor(props) {
        super(props);
        this.modalTitle = 'חפש נהג';

        this.state = { ...this.initState };
    }
    componentWillReceiveProps(nextProps) {
        // console.log(this.props.citySelectedItem,nextProps.citySelectedItem);
        if (this.props.citySelectedItem != nextProps.citySelectedItem) {
         this.setState({ selectedValue: nextProps.citySelectedItem.name, selectedItem: nextProps.citySelectedItem });
        }
    }
    inputFiledChange(fieldName, e) {
        let newState = { ...this.state };
        newState.filtersObject = { ...newState.filtersObject };
        newState.filtersObject[fieldName] = e.target.value;
        this.setState(newState);
    }
    filterComboChange(fieldName, paramName, e) {
        let newState = { ...this.state };
        newState.filtersObject = { ...newState.filtersObject };
        newState.comboFilters = { ...newState.comboFilters };

        let selectedItem = e.target.selectedItem ? e.target.selectedItem : null;
        let selectedItemKey = null;
        let selectedValue = e.target.value;
        if (selectedItem) {
            selectedItemKey = selectedItem.key;
            selectedValue = selectedItem.name;
        }
        if (fieldName == 'selectedCity') {
            if (selectedItem) { ElectionsActions.loadCityClusters(this.props.dispatch, selectedItem.key, 'transportations'); }
            else { this.props.dispatch({ type: ElectionsActions.ActionTypes.TRANSPORTATIONS.LOAD_MODAL_CLUSTERS, clusters: [] }); }
        }

        newState.filtersObject[paramName] = selectedItemKey;
        newState.comboFilters[fieldName] = { selectedValue: selectedValue, selectedItem: selectedItem };
        this.setState(newState);
    }
    renderDiversRows() {
        let self = this;
        let tableRows = this.props.drivers.map(function (item, index) {
            return (
                <DriverTransportationsRow key={item.key} item={item}
                    selectedDriver={self.state.selectedDriver}
                    selectDriverRow={self.selectDriverRow.bind(self)}
                />
            )
        });
        return tableRows;
    }
    selectDriverRow(item) {
        if(!item.is_driver_lock){
            this.setState({ selectedDriver: item })
        }
    }
    initModalData(){
        this.setState({ ...this.initState });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.TRANSPORTATIONS.SEARCH_DRIVERS_RESULTS, drivers: [] })
    }
    onClickButtonOk(){
        this.props.onClickButtonOk(this.state.selectedDriver);
        this.initModalData();
    }
    onModalClose() {
        this.props.onModalClose();
        this.initModalData();
		this.props.dispatch({ type: ElectionsActions.ActionTypes.TRANSPORTATIONS.SET_DRIVERS_LOADING_SEARCH_RESULT, data:null});
    }

    onSearch() {
        this.setState({ selectedDriver: null })
        let requestData = { driver_filters: this.state.filtersObject,'voter_cluster_id':this.props.selectedRowDetails.cluster_id };
        ElectionsActions.searchForDrivers(this.props.dispatch, requestData)
    }
	componentWillUnmount(){
		this.props.dispatch({ type: ElectionsActions.ActionTypes.TRANSPORTATIONS.SET_DRIVERS_LOADING_SEARCH_RESULT, data:null});
	}
    render() {
        let comboFilters = this.state.comboFilters;
        let firstName = this.state.filtersObject.first_name || '';
        let lastName = this.state.filtersObject.last_name || '';

        let validForm = comboFilters.selectedCity.selectedValue || lastName != '' || firstName != '';

        let notValidStyle = !validForm ? { border: '1px solid red' } : {};

        return (
            <ModalWindow show={this.props.showModal}
                buttonOk={this.onClickButtonOk.bind(this)}
                buttonCancel={this.onModalClose.bind(this)}
                buttonX={this.onModalClose.bind(this)}
                disabledOkStatus={!this.state.selectedDriver ? true : false}
                style={{ zIndex: '9001' }}
                title={this.modalTitle}>

                <div className="modal-body">
                    <div className="row">
                        <div className="col-md-11 no-padding">
                            <div className="col-md-3">
                                <label>עיר</label>
                                <Combo items={this.props.cities} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' inputStyle={notValidStyle}
                                    value={comboFilters.selectedCity.selectedValue} onChange={this.filterComboChange.bind(this, 'selectedCity', 'city_key')} />
                            </div>
                            <div className="col-md-3">
                                <label>אשכול</label>
                                <Combo items={this.props.clusters} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' 
                                    value={comboFilters.selectedCluster.selectedValue} onChange={this.filterComboChange.bind(this, 'selectedCluster', 'cluster_key')} />
                            </div>
                            <div className="col-md-3">
                                <label>שם פרטי</label>
                                <input value={firstName} onChange={this.inputFiledChange.bind(this, 'first_name')} style={notValidStyle} className="form-control" type="text" />
                            </div>
                            <div className="col-md-3">
                                <label>שם משפחה</label>
                                <input value={lastName} onChange={this.inputFiledChange.bind(this, 'last_name')} style={notValidStyle} className="form-control" type="text" />
                            </div>
                        </div>
                        <div className="col-md-1" style={{ marginTop: '25px' }}>
                            <button type="text" className="btn btn-primary" onClick={this.onSearch.bind(this)} disabled={!validForm}>חפש</button>
                        </div>
                    </div>

                </div>
				{(this.props.drivers.length <=0 && this.props.loadingResults==false) && <div>לא נמצאו תוצאות</div>}
				{(this.props.drivers.length <=0 && this.props.loadingResults==true) && <div><i className="fa fa-spinner fa-spin"></i></div>}
                {this.props.drivers.length > 0 && <div className="modal-footer">
                    <table className="table table-striped tableNoMarginB table-hover tableTight table-scrollable text-center">
                        <thead>
                            <tr>
                                <th>מועדף</th>
                                <th>שם משפחה</th>
                                <th>שם פרטי</th>
                                <th>עיר</th>
                                <th>אשכול</th>
                                <th>סטטוס שיבוץ</th>
                                <th>סוג רכב</th>
                                <th>כמות הסעות</th>
                            </tr>
                        </thead>
                        <tbody style={{maxHeight:'300px' , overflow:'auto'}}>
                            {this.renderDiversRows()}
                        </tbody>
                    </table>
                </div>}

            </ModalWindow>
        )
    }
}

function mapStateToProps(state) {
    return {
		cities: state.system.currentUserGeographicalFilteredLists.cities,
		clusters: state.elections.transportationsScreen.driversModal.clusters, //Need to check geo filters?
		drivers: state.elections.transportationsScreen.driversModal.drivers, 
		loadingResults: state.elections.transportationsScreen.driversModal.loadingResults, 
    }
}

export default connect(mapStateToProps)(EditDriverModal);