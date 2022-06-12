import React from 'react';
import { connect } from 'react-redux';

import Combo from '../../../../global/Combo';
import ModalWindow from '../../../../global/ModalWindow';

import ModalSearchClusterLeaderResult from './ModalSearchClusterLeaderResult';
import ModalSearchClusterLeaderLoading from './ModalSearchClusterLeaderLoading';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';


class ModalSearchClusterLeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            city_id: null,
            city_name: '',

            cluster_id: null,
            cluster_name: '',

            cluster_leader: {
                first_name: '',
                last_name: '',
                personal_identity: ''
            },

            buttons: [
                {
                    class: 'btn btn-default btn-secondary',
                    text: 'סגור',
                    action: this.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary btnLg',
                    text: 'המשך',
                    action: this.editLeader.bind(this),
                    disabled: true
                }
            ],

            selectedLeader: {
                key: null,
                first_name: '',
                last_name: '',
                personal_identity: ''
            }
        };

        this.initConstants({});
    }

    initConstants() {
        this.modalTitle= 'איתור ראש אשכול';

        this.recordsPerPage = 30;

        this.invalidColor = '#cc0000';
    }

    editLeader() {
        let selectedLeader = {
            key: this.state.selectedLeader.key,
            first_name: this.state.selectedLeader.first_name,
            last_name: this.state.selectedLeader.last_name,
            personal_identity: this.state.selectedLeader.personal_identity
        };

        this.resetModalData();

        this.props.editLeader(selectedLeader);
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.CLUSTER_LEADER_SELECTED});
    }

    selectLeader(leaderItem) {
        let selectedLeader = this.state.selectedLeader;
        let buttons = this.state.buttons;

        if ( leaderItem.leader_key == selectedLeader.key ) {
            selectedLeader.key = null;
            selectedLeader.first_name = '';
            selectedLeader.last_name = '';
            selectedLeader.personal_identity = '';

            buttons[1].disabled = true;
        } else {
            selectedLeader.key = leaderItem.leader_key;
            selectedLeader.first_name = leaderItem.leader_first_name;
            selectedLeader.last_name = leaderItem.leader_last_name;
            selectedLeader.personal_identity = leaderItem.leader_personal_identity;

            buttons[1].disabled = false;
        }

        this.setState({selectedLeader, buttons});
    }

    searchClusterLeaders(event) {
        // Prevent page refresh
        event.preventDefault();

        if ( !this.validInput ) {
            return;
        }

        let searchFields = {
            city_id: this.state.city_id,

            cluster_id: this.state.cluster_id,

            first_name: (this.state.cluster_leader.first_name.length > 0) ? this.state.cluster_leader.first_name: null,
            last_name: (this.state.cluster_leader.last_name.length > 0) ? this.state.cluster_leader.last_name: null,
            personal_identity: (this.state.cluster_leader.personal_identity.length > 0) ? this.state.cluster_leader.personal_identity: null
        };

        ElectionsActions.searchLeadersForClusterActivityModal(this.props.dispatch, searchFields);
    }

    resetModalData() {
        let buttons = this.state.buttons;
        buttons[1].disabled = true;

        this.setState({
            city_id: null,
            city_name: '',

            cluster_id: null,
            cluster_name: '',

            cluster_leader: {
                key: null,
                first_name: '',
                last_name: '',
                personal_identity: ''
            },

            buttons,

            selectedLeader: {
                key: null,
                first_name: '',
                last_name: '',
                personal_identity: ''
            }
        });

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.MODAL_SEARCH_RESET_ALL_DATA});
    }

    hideModal() {
        this.resetModalData();

        this.props.hideSearchModal();
    }

    clusterChange(event) {
        let selectedItem = event.target.selectedItem;

        let cluster_id = null;
        let cluster_name = event.target.value;

        let clusterLeader = this.state.cluster_leader;

        if ( selectedItem != null ) {
            cluster_id = selectedItem.id;

            if ( selectedItem.leader_key != null ) {
                clusterLeader.key = selectedItem.leader_key;
                clusterLeader.first_name = selectedItem.leader_first_name;
                clusterLeader.last_name = selectedItem.leader_last_name;
                clusterLeader.personal_identity = selectedItem.leader_personal_identity;
            } else {
                clusterLeader.key = null;
                clusterLeader.first_name = '';
                clusterLeader.last_name = '';
                clusterLeader.personal_identity = '';
            }
        }

        this.setState({cluster_id, cluster_name, cluster_leader: clusterLeader});
    }

    cityChange(event) {
        let selectedItem = event.target.selectedItem;

        let city_id = null;
        let city_name = event.target.value;

        let cluster_id = null;
        let cluster_name = '';

        if ( null == selectedItem ) {
            this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_MODAL_SEARCH_LEADER_CLUSTERS});
        } else {
            city_id = selectedItem.id;

            ElectionsActions.loadSearchClusterLeaderClusters(this.props.dispatch, selectedItem.key);
        }

        this.setState({city_id, city_name, cluster_id, cluster_name});
    }

    leaderFieldInputChange(fieldName, event) {
        let cluster_leader = this.state.cluster_leader;
        cluster_leader[fieldName] = event.target.value;
        this.setState({cluster_leader});
    }

    validatePersonalIdentity() {
        var regPersonalIdentity = /^[0-9]{2,10}$/;

        if ( this.state.cluster_leader.personal_identity.length == 0 ) {
            return true;
        } else {
            return regPersonalIdentity.test(this.state.cluster_leader.personal_identity);
        }
    }

    validateCluster() {
        if ( this.state.cluster_name.length == 0 ) {
            return true;
        } else {
            return (this.state.cluster_id != null);
        }
    }

    validateCity() {
        if ( this.state.city_name.length == 0 ) {
            return true;
        } else {
            return (this.state.city_id != null);
        }
    }

    validateVariables() {
        this.validInput = true;

        if ( this.state.cluster_leader.personal_identity.length == 0 && this.state.city_id == null ) {
            this.validInput = false;

            this.cityInputStyle = {borderColor: this.invalidColor};
            this.personalIdentityInputStyle = {borderColor: this.invalidColor};

            return;
        }

        if ( !this.validateCity() ) {
            this.validInput = false;
            this.cityInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateCluster() ) {
            this.validInput = false;
            this.clusterInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validatePersonalIdentity() ) {
            this.validInput = false;
            this.personalIdentityInputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.cityInputStyle = {};
        this.clusterInputStyle = {};
        this.personalIdentityInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <ModalWindow title={this.modalTitle} show={this.props.show} style={{zIndex: '9001'}} buttons={this.state.buttons}
                         buttonX={this.hideModal.bind(this)}>
                <div className="containerStrip">
                    <form>
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="modal-search-cluster-leader-city" className="control-label">עיר</label>
                                    <Combo id="modal-search-cluster-leader-city"
                                           items={this.props.userFilteredCities}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.cityInputStyle}
                                           value={this.state.city_name}
                                           className="form-combo-table"
                                           onChange={this.cityChange.bind(this)}/>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="modal-search-cluster-leader-cluster" className="control-label">אשכול</label>
                                    <Combo id="modal-search-cluster-leader-cluster"
                                           items={this.props.clusters}
                                           itemIdProperty="id"
                                           itemDisplayProperty="cluster_name"
                                           maxDisplayItems={10}
                                           inputStyle={this.clusterInputStyle}
                                           value={this.state.cluster_name}
                                           className="form-combo-table"
                                           onChange={this.clusterChange.bind(this)}/>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="modal-search-cluster-leader-personal-identity" className="control-label">ת.ז.</label>
                                    <input type="text" className="form-control" style={this.personalIdentityInputStyle}
                                           id="modal-search-cluster-leader-personal-identity"
                                           value={this.state.cluster_leader.personal_identity}
                                           onChange={this.leaderFieldInputChange.bind(this, 'personal_identity')}/>
                                </div>
                            </div>
                        </div>
                        <div className="row flexed-end">
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="modal-search-cluster-leader-first-name" className="control-label">שם פרטי</label>
                                    <input type="text" className="form-control" id="modal-search-cluster-leader-first-name"
                                           value={this.state.cluster_leader.first_name}
                                           onChange={this.leaderFieldInputChange.bind(this, 'first_name')}/>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="modal-search-cluster-leader-last-name" className="control-label">שם משפחה</label>
                                    <input type="text" className="form-control" id="modal-search-cluster-leader-last-name"
                                           value={this.state.cluster_leader.last_name}
                                           onChange={this.leaderFieldInputChange.bind(this, 'last_name')}/>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group text-left">
                                    <button title="חפש" type="submit" className="btn btn-default srchBtn"
                                            onClick={this.searchClusterLeaders.bind(this)} disabled={!this.validInput}>חפש</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                { (this.props.loadingLeaders) &&
                    <ModalSearchClusterLeaderLoading/>
                }

                <ModalSearchClusterLeaderResult totalSummaryResults={this.props.totalSummaryResults}
                                                clusterLeaders={this.props.summaryResult} selectedLeaderKey={this.state.selectedLeader.key}
                                                selectLeader={this.selectLeader.bind(this)}/>
            </ModalWindow>
        );
    }
}

function mapStateToProps(state) {
    return {
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities,
        clusters: state.elections.clustersScreen.modalSearchLeader.clusters,

        loadingLeaders: state.elections.clustersScreen.modalSearchLeader.loadingLeaders,

        totalSummaryResults: state.elections.clustersScreen.modalSearchLeader.result.totalSummaryResults,
        summaryResult: state.elections.clustersScreen.modalSearchLeader.result.summaryResult
    }
}

export default connect(mapStateToProps) (ModalSearchClusterLeader);