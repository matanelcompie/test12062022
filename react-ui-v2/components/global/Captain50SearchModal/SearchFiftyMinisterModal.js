import React from 'react';
import { connect } from 'react-redux';

import ModalWindow from 'components/global/ModalWindow';
import Combo from 'components/global/Combo';

import Captain50LoadingData from './Captain50LoadingData';
import CaptainFiftySearchResult from './CaptainFiftySearchResult';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';

import store from 'store';


class SearchFiftyMinisterModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchFields: {
                city: {id: null, name: ''},

                cluster: {id: null, name: ''},

                first_name: '',
                last_name: '',
                personal_identity: ''
            },

            captainDetails : {
                id: null,
                key: null,
                name: ''
            },

            buttons: [
                {
                    class: 'btn new-btn-default btn-secondary',
                    text: 'סגור',
                    action: this.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary btn-large',
                    text: 'שמור',
                    action: this.saveMinisterOf50.bind(this),
                    disabled: true
                }
            ]
        };

        this.initConstants();
    }
	
	componentWillMount(){
 
		if(this.props.cities.length == 0){
			SystemActions.loadUserGeographicFilteredLists(store, this.props.screenPermission);
        }
	}

    initConstants() {
        this.modalTitle = "איתור שר מאה";

        this.invalidColor = '#cc0000';

        this.emptyFieldObj = {id: null, name: '', key: null};
    }

    saveMinisterOf50() {
        this.resetModalArrays();
        this.resetModalState();

        this.props.saveMinisterOf50(this.state.captainDetails.name, this.state.captainDetails.key);
    }

    resetModalArrays() {
        this.props.dispatch({type: ElectionsActions.ActionTypes.CAPTAIN50_SEARCH.RESET_CAPTAIN50_SEARCH_VARIABLES});
    }

    resetModalState() {
        let searchFields = {
            city: this.emptyFieldObj,

            cluster: this.emptyFieldObj,

            first_name: '',
            last_name: '',
            personal_identity: ''
        };
        this.setState({searchFields});

        let captainDetails = {
            id: null,
            key: null,
            name: ''
        };
        this.setState({captainDetails});

        let buttons = this.state.buttons;
        buttons[1].disabled = true;
        this.setState({buttons});
    }

    captain50Click(captainId, captainName, captainKey) {
        let captainDetails = this.state.captainDetails;
        let buttons = this.state.buttons;

        if ( captainId == this.state.captainDetails.id ) {
            captainDetails.id = null;
            captainDetails.key = null;
            captainDetails.name = '';

            buttons[1].disabled = true;
        } else {
            captainDetails.id = captainId;
            captainDetails.key = captainKey;
            captainDetails.name = captainName;

            buttons[1].disabled = false;
        }

        this.setState({captainDetails});
        this.setState({buttons});
    }

    searchCaptain50(event) {
        // Prevent page refresh
        event.preventDefault();

        if ( !this.validInput ) {
            return;
        }

        let searchObj = {
            city_id: this.state.searchFields.city.id,
            cluster_id: this.state.searchFields.cluster.id,

            first_name: (this.state.searchFields.first_name.length > 0) ? this.state.searchFields.first_name : null,
            last_name: (this.state.searchFields.last_name.length > 0) ? this.state.searchFields.last_name : null,
            personal_identity: (this.state.searchFields.personal_identity.length > 0) ? this.state.searchFields.personal_identity : null
        };

        ElectionsActions.captain50Search(this.props.dispatch, searchObj);
    }

    hideModal() {
        this.resetModalArrays();
        this.resetModalState();

        this.props.hideSearchFiftyMinisterModal();
    }

    inputFieldChange(fieldName, event) {
        let searchFields = this.state.searchFields;

        searchFields[fieldName] = event.target.value;

        this.setState({searchFields});
    }

    getClusterIndex(clusterName) {
        return this.props.clusters.findIndex(clusterItem => clusterItem.name == clusterName);
    }

    clusterChange(event) {
        let searchFields = this.state.searchFields;
        let selectedItem = event.target.selectedItem;

        if ( null == selectedItem ) {
            searchFields.cluster = {...this.emptyFieldObj, name: event.target.value};
        } else {
            searchFields.cluster = {
                id: selectedItem.id,
                name: selectedItem.name,
                key: selectedItem.key
            }
        }

        this.setState({searchFields});
    }

    cityChange(event) {
        let searchFields = this.state.searchFields;
        let selectedItem = event.target.selectedItem;

        if ( null == selectedItem ) {
            searchFields.city = {...this.emptyFieldObj, name: event.target.value};
        } else {
            searchFields.city = {
                id: selectedItem.id,
                name: selectedItem.name,
                key: selectedItem.key
            };
        }

        searchFields.cluster = this.emptyFieldObj;
        this.setState({searchFields});

        if ( null == searchFields.city.id ) {
            this.props.dispatch({type: ElectionsActions.ActionTypes.CAPTAIN50_SEARCH.RESET_MINISTER50_SEARCH_CLUSTERS});
        } else {
            ElectionsActions.loadCaptain50ModalCityClusters(this.props.dispatch, searchFields.city.key);
        }
    }

    validatePersonalIdentity(personalIdentity) {
        var regPersonalIdentity = /^[0-9]{2,10}$/;

        if ( personalIdentity.length == 0 ) {
            return true;
        } else {
            return regPersonalIdentity.test(personalIdentity);
        }
    }

    validateCluster(clusterName, clusterId) {
        if (clusterName.length == 0) {
            return true;
        } else {
            return (clusterId != null);
        }
    }

    validateCity(cityName, cityId) {
        if (cityName.length == 0) {
            return true;
        } else {
            return (cityId != null);
        }
    }

    validateVariables() {
        this.validInput = true;

        if ( !this.validateCity(this.state.searchFields.city.name, this.state.searchFields.city.id) ) {
            this.validInput = false;
            this.inputCityStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateCluster(this.state.searchFields.cluster.name, this.state.searchFields.cluster.id) ) {
            this.validInput = false;
            this.inputClusterStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validatePersonalIdentity(this.state.searchFields.personal_identity) ) {
            this.validInput = false;
            this.inputPersonalIdentityStyle = {borderColor: this.invalidColor};
        }

        if ( this.validInput ) {
            if ( this.state.searchFields.personal_identity.length == 0 && this.state.searchFields.city.id == null &&
                 this.state.searchFields.last_name.length == 0 ) {
                this.validInput = false;
            }
        }
    }

    initVariables() {
        this.inputCityStyle = {};
        this.inputClusterStyle = {};
        this.inputPersonalIdentityStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div id="SearchFiftyMinisterModal">
            <ModalWindow show={this.props.show} title={this.modalTitle} buttons={this.state.buttons} buttonX={this.hideModal.bind(this)}
                         style={{zIndex: '9001'}}>
                <div className="containerStrip">
                    <form>
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="inputModalCity-captain50-search" className="control-label">עיר</label>
                                    <Combo items={this.props.cities}
										   placeholder={this.props.cities.length == 0 ? "טוען נתונים..." : null}
                                           id="inputModalCity-captain50-search"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.inputCityStyle}
                                           value={this.state.searchFields.city.name}
                                           onChange={this.cityChange.bind(this)}/>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="t-2-captain50-search" className="control-label">אשכול</label>
                                    <Combo items={this.props.clusters}
                                           id="t-2-captain50-search"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.inputClusterStyle}
                                           value={this.state.searchFields.cluster.name}
                                           onChange={this.clusterChange.bind(this)}/>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="t-3-captain50-search" className="control-label">ת.ז.</label>
                                    <input type="text" className="form-control" id="t-3-captain50-search"
                                           style={this.inputPersonalIdentityStyle}
                                           value={this.state.searchFields.personal_identity}
                                           onChange={this.inputFieldChange.bind(this, 'personal_identity')}/>
                                </div>
                            </div>
                        </div>
                        <div className="row flexed-end">
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="inputModalName-captain50-search" className="control-label">שם פרטי</label>
                                    <input type="text" className="form-control" id="inputModalName-captain50-search"
                                           value={this.state.searchFields.first_name}
                                           onChange={this.inputFieldChange.bind(this, 'first_name')}/>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="t-4-captain50-search" className="control-label">שם משפחה</label>
                                    <input type="text" className="form-control" id="t-4-captain50-search"
                                           value={this.state.searchFields.last_name}
                                           onChange={this.inputFieldChange.bind(this, 'last_name')}/>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group text-left">
                                    <button title="חפש" type="submit" className="btn btn-default srchBtn"
                                            onClick={this.searchCaptain50.bind(this)} disabled={!this.validInput}>חפש</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                { this.props.loadingCaptain50s &&
                    <Captain50LoadingData/>
                }

                { this.props.loadedCaptain50s &&
                    <CaptainFiftySearchResult selectedCaptainId={this.state.captainDetails.id}
                                              captain50Click={this.captain50Click.bind(this)}/>
                }
            </ModalWindow>
            </div>

        );
    }
}

function mapStateToProps(state) {
    return {
        cities: state.system.currentUserGeographicalFilteredLists.cities,
        clusters: state.elections.captain50Search.clusters,

        loadingCaptain50s: state.elections.captain50Search.flags.loadingCaptain50s,
        loadedCaptain50s: state.elections.captain50Search.flags.loadedCaptain50s
    };
}

export default connect(mapStateToProps) (SearchFiftyMinisterModal);