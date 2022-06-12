import React from 'react';
import { connect } from 'react-redux';

import store from 'store';

import ModalWindow from 'components/global/ModalWindow';
import Combo from 'components/global/Combo';
import InstitutesLoadingData from './InstitutesLoadingData';
import InstitutesResult from './InstitutesResult';

import * as SystemActions from 'actions/SystemActions';
import * as GlobalActions from 'actions/GlobalActions';


class instituteModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            buttons: [
                {
                    class: 'btn new-btn-default btn-secondary',
                    text: 'סגור',
                    action: this.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text: 'המשך',
                    action: this.updateInstituteDetails.bind(this),
                    disabled: true
                }
            ],

            searchFields: {
                group: {id: null, name: '', key: null},
                type: {id: null, name: '', key: null},
                network: {id: null, name: '', key: null},
                name: '',
                city: {id: null, name: '', key: null}
            },

            combos: {
                instituteTypes: []
            },

            selectedInstitute: {
                id: null,
                key: null,
                name: null,
                institute_type_id: null
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.modalTitle = 'חפש מוסד';

        this.emptyFieldObj = {id: null, name: '', key: null};

        this.invalidColor = '#cc0000';

        this.texts = {
            buttonSearch: 'חפש'
        };

        this.maxDbRows = 100;
    }

    componentWillMount() {
        this.props.dispatch({type: GlobalActions.ActionTypes.INSTITUTE_MODAL.CLEAN_DATA, deleteCombos: true});

        SystemActions.loadUserGeographicFilteredLists(store, null);

        GlobalActions.loadInstituteGroupsForInstituteModal(this.props.dispatch);
        GlobalActions.loadInstituteTypesForInstituteModal(this.props.dispatch);
        GlobalActions.loadInstituteNetworksForInstituteModal(this.props.dispatch);
    }

    cancelSearch() {
        GlobalActions.cancelInstitutesSearch(this.props.dispatch);
    }

    selectInstituteItem(instituteObj) {
        let buttons = this.state.buttons;
        let selectedInstitute = {};

        if (this.state.selectedInstitute.key == instituteObj.key) {
            buttons[1].disabled = true;
            selectedInstitute = {id: null, key: null, name: null, institute_type_id: null};

            this.setState({buttons, selectedInstitute});
        } else {
            buttons[1].disabled = false;
            selectedInstitute = {id: instituteObj.id, key: instituteObj.key, name: instituteObj.name, institute_type_id: instituteObj.type_id};

            this.setState({buttons, selectedInstitute});
        }
    }

    resetModalData() {
        let buttons = this.state.buttons;

        buttons[1].disabled = true;

        let searchFields = {
            group: {id: null, name: '', key: null},
            type: {id: null, name: '', key: null},
            network: {id: null, name: '', key: null},
            name: '',
            city: {id: null, name: '', key: null}
        };

        let selectedInstitute = {
            id: null,
            key: null,
            name: null,
            institute_type_id: null
        };

        let combos = this.state.combos;

        combos.instituteTypes = [];
        this.setState({combos});

        this.setState({buttons, searchFields, selectedInstitute, combos});
        this.props.dispatch({type: GlobalActions.ActionTypes.INSTITUTE_MODAL.CLEAN_DATA, deleteCombos: false});
    }

    hideModal() {
        this.resetModalData();

        this.props.hideModal();
    }

    updateInstituteDetails() {
        let selectedInstitute = {
            id: this.state.selectedInstitute.id,
            key: this.state.selectedInstitute.key,
            name: this.state.selectedInstitute.name,
            institute_type_id: this.state.selectedInstitute.institute_type_id
        };

        this.resetModalData();

        this.props.updateInstituteDetails(selectedInstitute);
    }

    buildDbSearchFields() {
        let searchFields = {
            group_key: this.state.searchFields.group.key,
            type_key: this.state.searchFields.type.key,
            network_key: this.state.searchFields.network.key,
            city_key: this.state.searchFields.city.key,
            institute_name_text: (this.state.searchFields.name.length == 0) ? null : this.state.searchFields.name
        };

        return searchFields;
    }

    searchInstitutes(event) {
        // Prevent page refresh
        event.preventDefault();

        let dbConstraints = {
            current_page: 1,
            max_rows: this.maxDbRows
        };
        let searchFields = this.buildDbSearchFields();
        GlobalActions.searchInstitutesForInstituteModal(this.props.dispatch, searchFields, dbConstraints);
    }

    nameChange(event) {
        let searchFields = this.state.searchFields;

        searchFields.name = event.target.value;
        this.setState({searchFields});
    }

    loadGroupTypes(groupId) {
        let combos = this.state.combos;
        combos.instituteTypes = this.props.instituteTypes.filter(typeItem => typeItem.institute_group_id == groupId);
        this.setState({combos});
    }

    groupChange(groupId) {
        let searchFields = this.state.searchFields;
        let combos = this.state.combos;

        searchFields.type = {...this.emptyFieldObj};

        if ( null == groupId ) {
            combos.instituteTypes = [];
            this.setState({combos});
        } else {
            this.loadGroupTypes(groupId);
        }
    }

    ComboValueChange(fieldName, event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        if ( null == selectedItem ) {
            searchFields[fieldName] = {...this.emptyFieldObj, name: event.target.value};
        } else {
            searchFields[fieldName] = {
                id: selectedItem.id,
                name: selectedItem.name,
                key: selectedItem.key
            };

            if ( 'group' == fieldName ) {
                this.groupChange(selectedItem.id);
            }
        }
        this.setState({searchFields});
    }

    validateCity() {
        if ( this.state.searchFields.city.name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.city.id != null);
        }
    }

    validateInstituteNetwork() {
        if ( this.state.searchFields.network.name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.network.id != null);
        }
    }

    validateInstituteType() {
        if ( this.state.searchFields.type.name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.type.id != null);
        }
    }

    validateInstituteGroup() {
        if ( this.state.searchFields.group.name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.group.id != null);
        }
    }

    validateVariables() {
        this.validInput = true;

        if ( !this.validateInstituteGroup() ) {
            this.validInput = false;
            this.groupInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateInstituteType() ) {
            this.validInput = false;
            this.typeInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateInstituteNetwork() ) {
            this.validInput = false;
            this.networkInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateCity() ) {
            this.validInput = false;
            this.cityInputStyle = {borderColor: this.invalidColor};
        }

        if ( this.validInput && this.state.searchFields.city.id == null && this.state.searchFields.group.id == null &&
             this.state.searchFields.name.length == 0 && this.state.searchFields.network.id == null &&
             this.state.searchFields.type.id == null ) {
            this.validInput = false;
        }
    }

    initVariables() {
        this.groupInputStyle = {};
        this.typeInputStyle = {};
        this.networkInputStyle = {};
        this.cityInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className="institute-modal">
                <ModalWindow show={this.props.show} title={this.modalTitle} buttons={this.state.buttons} buttonX={this.hideModal.bind(this)}>
                    <div className="row containerStrip">
                        <div className="col-lg-6">
                            <div className="row form-group">
                                <label htmlFor="institute-modal-group" className="col-sm-3 control-label">קבוצה</label>
                                <div className="col-sm-9">
                                    <Combo items={this.props.instituteGroups}
                                           id="institute-modal-group"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.groupInputStyle}
                                           value={this.state.searchFields.group.name}
                                           onChange={this.ComboValueChange.bind(this, 'group')}
                                    />
                                </div>
                            </div>

                            <div className="row form-group">
                                <label htmlFor="institute-modal-network" className="col-sm-3 control-label">רשת</label>
                                <div className="col-sm-9">
                                    <Combo items={this.props.instituteNetworks}
                                           id="institute-modal-network"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.networkInputStyle}
                                           value={this.state.searchFields.network.name}
                                           onChange={this.ComboValueChange.bind(this, 'network')}
                                    />
                                </div>
                            </div>

                            <div className="row form-group">
                                <label htmlFor="institute-modal-name" className="col-lg-3 control-label">שם</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" id="institute-modal-name" value={this.state.searchFields.name}
                                           onChange={this.nameChange.bind(this)}/>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="row form-group">
                                <label htmlFor="institute-modal-type" className="col-sm-3 control-label">סוג</label>
                                <div className="col-sm-9">
                                    <Combo items={this.state.combos.instituteTypes}
                                           id="institute-modal-type"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.typeInputStyle}
                                           value={this.state.searchFields.type.name}
                                           onChange={this.ComboValueChange.bind(this, 'type')}
                                    />
                                </div>
                            </div>

                            <div className="row form-group">
                                <label htmlFor="institute-modal-city" className="col-sm-3 control-label">עיר</label>
                                <div className="col-sm-9">
                                    <Combo items={this.props.userFilteredCities}
                                           id="institute-modal-city"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.cityInputStyle}
                                           value={this.state.searchFields.city.name}
                                           onChange={this.ComboValueChange.bind(this, 'city')}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <button type="submit" className="btn new-btn-default saveChanges pull-left"
                                        onClick={this.searchInstitutes.bind(this)}
                                        disabled={!this.validInput}>
                                    {this.texts.buttonSearch}
                                </button>
                            </div>
                        </div>
                    </div>

                    { (this.props.loadingInstitutes) &&
                        <InstitutesLoadingData cancelSearch={this.cancelSearch.bind(this)}/>
                    }

                    <InstitutesResult show={this.props.show} selectInstituteItem={this.selectInstituteItem.bind(this)}
                                      selectedInstituteKey={this.state.selectedInstitute.key}/>
                </ModalWindow>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities,
        instituteGroups: state.global.institueModal.combos.instituteGroups,
        instituteTypes: state.global.institueModal.combos.instituteTypes,
        instituteNetworks: state.global.institueModal.combos.instituteNetworks,
        loadingInstitutes: state.global.institueModal.loadingInstitutes
    }
}

export default connect(mapStateToProps) (instituteModal);