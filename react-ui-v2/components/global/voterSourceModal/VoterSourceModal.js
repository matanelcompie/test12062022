import React from 'react';
import { connect } from 'react-redux';

import store from 'store';

import ModalWindow from 'components/global/ModalWindow';
import Combo from 'components/global/Combo';
import VoterSourceResult from './VoterSourceResult';
import VotersLoadingData from './VotersLoadingData';

import * as GlobalActions from 'actions/GlobalActions';
import * as SystemActions from 'actions/SystemActions';


class VoterSourceModal extends React.Component {
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
                    action: this.updateVoterDetails.bind(this),
                    disabled: true
                }
            ],

            searchFields: {
                first_name: '',
                last_name: '',
                city: {id: null, name: ''},
                street: {id: null, name: ''}
            },

            selectedVoter: {
                id: null,
                key: null,
                personal_identity: null,
                first_name: null,
                last_name: null
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.modalTitle = 'חפש תושב';

        this.emptyFieldObj = {id: null, name: ''};

        this.invalidColor = '#cc0000';

        this.texts = {
            buttonSearch: 'חפש'
        };

        this.maxDbRows = 100;
    }

    componentWillMount() {
        this.props.dispatch({type: GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.CLEAN_DATA});
        SystemActions.loadUserGeographicFilteredLists(store, this.props.screenPermission);
    }

    cancelSearch() {
        GlobalActions.cancelVoterSearch(this.props.dispatch);
    }

    selectVoterItem(voterObj) {
        let buttons = this.state.buttons;
        let selectedVoter = {};

        if (this.state.selectedVoter.key == voterObj.key) {
            buttons[1].disabled = true;
            selectedVoter = {id: null, key: null, personal_identity: null, first_name: null, last_name: null};

            this.setState({buttons, selectedVoter});
        } else {
            buttons[1].disabled = false;
            selectedVoter = {id: voterObj.id, key: voterObj.key, personal_identity: voterObj.personal_identity,
                             first_name: voterObj.first_name, last_name: voterObj.last_name};

            this.setState({buttons, selectedVoter});
        }
    }

    resetModalData() {
        let buttons = this.state.buttons;

        buttons[1].disabled = true;

        let searchFields = {
            first_name: '',
            last_name: '',
            city: {id: null, name: ''},
            street: {id: null, name: ''}
        };

        let selectedVoter = {
            id: null,
            key: null,
            personal_identity: null,
            first_name: null,
            last_name: null
        };

        this.setState({buttons, searchFields, selectedVoter});
        this.props.dispatch({type: GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.CLEAN_DATA});
    }

    updateVoterDetails() {
        let selectedVoter = {
            id: this.state.selectedVoter.id,
            key: this.state.selectedVoter.key,
            personal_identity: this.state.selectedVoter.personal_identity,
            first_name: this.state.selectedVoter.first_name,
            last_name: this.state.selectedVoter.last_name
        };

        this.resetModalData();

        this.props.updateVoterDetails(selectedVoter);
    }

    hideModal() {
        this.resetModalData();

        this.props.hideModal();
    }

    buildDbSearchFields() {
        let searchFields = {
            first_name: (this.state.searchFields.first_name.length > 0) ? this.state.searchFields.first_name : null,
            last_name: (this.state.searchFields.last_name.length > 0) ? this.state.searchFields.last_name : null,
            city_id: this.state.searchFields.city.id,
            street_id: this.state.searchFields.street.id
        };

        return searchFields;
    }

    searchVoters(event) {
        // Prevent page refresh
        event.preventDefault();

        let dbConstraints = {
            current_page: 1,
            max_rows: this.maxDbRows
        };
        let searchFields = this.buildDbSearchFields();
        GlobalActions.searchVoterSourceVoters(this.props.dispatch, searchFields, dbConstraints);
    }

    streetChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        if ( null == selectedItem ) {
            searchFields.street = {...this.emptyFieldObj, name: event.target.value};
        } else {
            searchFields.street = {
                id: selectedItem.id,
                name: selectedItem.name
            };
        }

        this.setState({searchFields});
    }

    cityChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        if ( null == selectedItem ) {
            searchFields.city = {...this.emptyFieldObj, name: event.target.value};

            this.props.dispatch({type: GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.RESET_STREETS});
        } else {
            searchFields.city = {
                id: selectedItem.id,
                name: selectedItem.name
            };

            GlobalActions.loadVoterSourceCityStreets(this.props.dispatch, selectedItem.key);
        }

        searchFields.street = {...this.emptyFieldObj};

        this.setState({searchFields});
    }

    inputFieldChange(fieldName, event) {
        let searchFields = this.state.searchFields;

        searchFields[fieldName] = event.target.value;

        this.setState({searchFields});
    }

    validateStreet() {
        if ( this.state.searchFields.street.name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.street.id != null);
        }
    }

    validateCity() {
        return (this.state.searchFields.city.id != null);
    }

    validateVariables() {
        this.validInput = true;

        if ( !this.validateCity() ) {
            this.validInput = false;
            this.cityInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateStreet() ) {
            this.validInput = false;
            this.streetInputStyle = {borderColor: this.invalidColor};
        }

        if ( this.state.searchFields.first_name.length == 0 ) {
            this.validInput = false;
            this.firstNameInputStyle = {borderColor: this.invalidColor};
        }

        if ( this.state.searchFields.last_name.length == 0 ) {
            this.validInput = false;
            this.lastNameInputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.cityInputStyle = {};
        this.streetInputStyle = {};
        this.firstNameInputStyle = {};
        this.lastNameInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className="voter-source-modal">
                <ModalWindow show={this.props.show} title={this.modalTitle} buttons={this.state.buttons} buttonX={this.hideModal.bind(this)}>
                    <div className="row containerStrip">
                        <div className="col-lg-5">
                            <div className="row form-group">
                                <label htmlFor="voter-source-modal-last-name" className="col-lg-3 control-label">משפחה</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" id="voter-source-modal-last-name"
                                           style={this.lastNameInputStyle} value={this.state.searchFields.last_name}
                                           onChange={this.inputFieldChange.bind(this, 'last_name')}/>
                                </div>
                            </div>
                            <div className="row form-group">
                                <label htmlFor="voter-source-modal-first-name" className="col-lg-3 control-label">שם פרטי</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" id="voter-source-modal-first-name"
                                           style={this.firstNameInputStyle} value={this.state.searchFields.first_name}
                                           onChange={this.inputFieldChange.bind(this, 'first_name')}/>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="row form-group">
                                <label htmlFor="voter-source-modal-city" className="col-lg-3 control-label">עיר</label>
                                <div className="col-sm-9">
                                    <Combo items={this.props.userFilteredCities}
                                           id="voter-source-modal-city"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.cityInputStyle}
                                           value={this.state.searchFields.city.name}
                                           onChange={this.cityChange.bind(this)}
                                    />
                                </div>
                            </div>
                            <div className="row form-group">
                                <label htmlFor="voter-source-modal-street" className="col-lg-3 control-label">רחוב</label>
                                <div className="col-sm-9">
                                    <Combo items={this.props.userFilteredCities}
                                           id="voter-source-modal-street"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.streetInputStyle}
                                           value={this.state.searchFields.street.name}
                                           onChange={this.streetChange.bind(this)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-2">
                            <button type="submit" className="btn new-btn-default saveChanges pull-right"
                                    onClick={this.searchVoters.bind(this)}
                                    disabled={!this.validInput}>
                                {this.texts.buttonSearch}
                            </button>
                        </div>
                    </div>

                    { (this.props.loadingData) &&
                        <VotersLoadingData cancelSearch={this.cancelSearch.bind(this)}/>
                    }

                    <VoterSourceResult show={this.props.show} buildDbSearchFields={this.buildDbSearchFields.bind(this)}
                                       selectVoterItem={this.selectVoterItem.bind(this)} selectedVoterKey={this.state.selectedVoter.key}/>
                </ModalWindow>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities,
        streets: state.global.voterSourceModal.streets,
        loadingData: state.global.voterSourceModal.loadingData
    }
}

export default connect(mapStateToProps) (VoterSourceModal);