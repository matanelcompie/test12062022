import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import WizardItem from './WizardItem';
import DataSource from './FirstTab/DataSource';
import MassUpdate from './FirstTab/MassUpdate/MassUpdate';
import SelectVoter from './SecondTab/SelectVoter';
import AlertContainer from './SecondTab/AlertContainer';
import AlertMassUpdate from './SecondTab/AlertMassUpdate';
import SelectedVoters from './SecondTab/SelectedVoters';
import BottomButtons from './BottomButtons.js';
import AlertSelectedVotersModal from './SecondTab/AlertSelectedVotersModal';
import VoterSourceModal from 'components/global/voterSourceModal/VoterSourceModal';
import ModalWindow from 'components/global/ModalWindow';

import store from 'store';

import * as SystemActions from 'actions/SystemActions';
import * as ElectionsActions from 'actions/ElectionsActions';


class VotersManual extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();

        this.state = {
            currentTab: 1,

            dataSource: {
                source_id: null,
                voter: {
                    id: null,
                    key: null,
                    personal_identity: null,
                    first_name: null,
                    last_name: null
                },

                cleanData: false
            },

            massUpdate: {
                statusData: {
                    support_status_chosen_id: null,
                    status_update_type: this.supportStatusUpdateType.always,
                    update_status_to_voter_with_status : null,
                    updateHouseHoldStatus: false,

                    validInput: true
                },

                instituteData: {
                    institute_id: null,
                    institute_role_id: null,

                    validInput: true
                },

                voterGroupData: {
                    voter_group_id: null
                },

                moreInfoData: {
                    ethnic_group_id: null,
                    gender: null,
                    ultraOrthodox: null,
                    religious_group_id: null,


                    validInput: true
                },

                massUpdateType: this.massUpdateType.immediate
            },

            selectedVoters: [],
            errorSelectingVoterMsg: '',

            tabs: [
                {num: 1, name: 'הגדרת נתונים', disabled: false},
                {num: 2, name: 'חיפוש תושבים', disabled: true}
            ],

            cleanFirstStepData: {
                dataSource: false,

                massUpdate: {
                    instituteData: false,
                    moreInfoData: false,
                    statusData: false,
                    voterGroupData: false
                }
            },

            alertSelectedVoterModal: {
                show: false
            },

            voterSourceModal: {
                show: false
            }
        };
    }

    initConstants() {
        this.massUpdateType = constants.massUpdateType;
        this.supportStatusUpdateType = constants.supportStatusUpdateType;

        this.radioLabels = {
            manual: 'בצע עדכון פרטני עבור כל תושב חדש ברשימה',
            immediate: 'עדכון מיידי'
        };

        this.alertMessages = {
            doesNotExist: 'לא נמצא תושב העונה לזהות שהיקשת, נסה שנית.',
            alreadySelected: 'תושב זה כבר נבחר'
        };

        this.noTransport = -1;
        this.screenPermission = 'elections.votes.manual';
    }

    componentWillMount() {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: "טופס קליטה"});
        SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);

        ElectionsActions.loadEthnicGroups(this.props.dispatch);		
        ElectionsActions.loadReligiousGroups(this.props.dispatch);
        ElectionsActions.getCsvSourcesForVotersManual(this.props.dispatch);
        ElectionsActions.loadSupportStatusesForVotersManual(this.props.dispatch);
        ElectionsActions.loadInstitutesForVotersManual(this.props.dispatch);
        ElectionsActions.loadInstituteRolesForVotersManual(this.props.dispatch);
    }

    showMassUpdateAlert() {
        if ( this.state.currentTab != 2 ) {
            return false;
        } else {
            return (this.state.massUpdate.statusData.support_status_chosen_id != null ||
                    this.state.massUpdate.instituteData.institute_id != null);
        }
    }

    getInstituteRoleName(instituteRoleId) {
        if ( null == instituteRoleId ) {
            return '';
        }

        let instituteRoleIndex = this.props.instituteRoles.findIndex(instituteRoleItem => instituteRoleItem.id == instituteRoleId);

        if ( -1 == instituteRoleIndex ) {
            return '';
        } else {
            return this.props.instituteRoles[instituteRoleIndex].name;
        }
    }

    getInstituteName(instituteId) {
        if ( null == instituteId ) {
            return '';
        }

        let instituteIndex = this.props.institutes.findIndex(instituteItem => instituteItem.id == instituteId);

        if ( -1 == instituteIndex ) {
            return '';
        } else {
            return this.props.institutes[instituteIndex].name;
        }
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.loadedSelectedVoter && nextProps.loadedSelectedVoter ) {
            if ( Object.keys(nextProps.selectedVoter).length > 0 ) {
                let selectedVoters = [...this.state.selectedVoters];

				/*
                for ( let selectedIndex = 0; selectedIndex < selectedVoters.length; selectedIndex++ ) {
                    selectedVoters[selectedIndex] = {...selectedVoters[selectedIndex]};

                    selectedVoters[selectedIndex].collapsed = false;
                }
				*/
				let massUpdate = this.state.massUpdate;
                let newSelectedVoter = {...nextProps.selectedVoter};
                newSelectedVoter.phones = [...newSelectedVoter.phones];
                newSelectedVoter.newFieldsValues = {...newSelectedVoter.newFieldsValues};

                newSelectedVoter.newFieldsValues.institute = {
                    id: newSelectedVoter.newFieldsValues.institute.id,
                    name: newSelectedVoter.newFieldsValues.institute.name
                };
                newSelectedVoter.newFieldsValues.institute_role = {
                    id: newSelectedVoter.newFieldsValues.institute_role.id,
                    name: newSelectedVoter.newFieldsValues.institute_role.name
                };
				massUpdate.instituteData.institute_id = newSelectedVoter.newFieldsValues.institute.id;
				massUpdate.instituteData.institute_role_id = newSelectedVoter.newFieldsValues.institute_role.id;
				
				this.setState({massUpdate});
                newSelectedVoter.newFieldsValues.updateHouseholdAddress = false;

                selectedVoters.unshift(newSelectedVoter);
                this.setState({selectedVoters});
            } else {
                this.setState({errorSelectingVoterMsg: this.alertMessages.doesNotExist});
            }
        }

        if ( !this.props.loadedDataSourceVoter && nextProps.loadedDataSourceVoter ) {
            if (Object.keys(nextProps.dataSourceVoter).length == 0) {
                this.setState({errorSelectingVoterMsg: this.alertMessages.doesNotExist});
            } else {
                this.setState({errorSelectingVoterMsg: ''});
            }
        }

        if (nextProps.secondTabVoter && !this.props.loadedSecondTabVoter && nextProps.loadedSecondTabVoter ) {
            if (Object.keys(nextProps.secondTabVoter).length == 0) {
                this.setState({errorSelectingVoterMsg: this.alertMessages.doesNotExist});
            } else {
                this.setState({errorSelectingVoterMsg: ''});
            }
        }
    }

    saveSelectedVoters(event) {
        // Prevent page refresh
        event.preventDefault();

        let updateData = {
            source_id: this.state.dataSource.source_id,
            source_voter_id: this.state.dataSource.voter.id,

            support_status_chosen_id: this.state.massUpdate.statusData.support_status_chosen_id,
            status_update_type: this.state.massUpdate.statusData.status_update_type,
            update_status_to_voter_with_status : (this.state.massUpdate.statusData.update_status_to_voter_with_status == 1) ? 1 : 0,
            update_household_status: this.state.massUpdate.statusData.updateHouseHoldStatus ? 1 : 0,

            institute_id: this.state.massUpdate.instituteData.institute_id,
            institute_role_id: this.state.massUpdate.instituteData.institute_role_id,

            voter_group_id: this.state.massUpdate.voterGroupData.voter_group_id,

            ethnic_group_id: this.state.massUpdate.moreInfoData.ethnic_group_id,
            religious_group_id: this.state.massUpdate.moreInfoData.religious_group_id,
            gender: this.state.massUpdate.moreInfoData.gender,
            ultra_orthodox: this.state.massUpdate.moreInfoData.ultraOrthodox,

            selected_voters: [...this.state.selectedVoters]
        };

        for ( let selectedIndex = 0; selectedIndex < updateData.selected_voters.length; selectedIndex++ ) {
            updateData.selected_voters[selectedIndex] = {...updateData.selected_voters[selectedIndex]};
            updateData.selected_voters[selectedIndex].newFieldsValues = {...updateData.selected_voters[selectedIndex].newFieldsValues};

            updateData.selected_voters[selectedIndex].newFieldsValues.cripple = {...updateData.selected_voters[selectedIndex].newFieldsValues.cripple};
            if (updateData.selected_voters[selectedIndex].newFieldsValues.cripple.id == this.noTransport) {
                updateData.selected_voters[selectedIndex].newFieldsValues.cripple.id = null;
            }

            if ( updateData.selected_voters[selectedIndex].newFieldsValues.from_time != null ) {
                updateData.selected_voters[selectedIndex].newFieldsValues.from_time += ':00';
            }

            if ( updateData.selected_voters[selectedIndex].newFieldsValues.to_time != null ) {
                updateData.selected_voters[selectedIndex].newFieldsValues.to_time += ':00';
            }

            updateData.selected_voters[selectedIndex].newFieldsValues.phone1 = {...updateData.selected_voters[selectedIndex].newFieldsValues.phone1};
            if ( updateData.selected_voters[selectedIndex].newFieldsValues.phone1.phone_number.length == 0 ) {
                updateData.selected_voters[selectedIndex].newFieldsValues.phone1.phone_number = null;
            }

            updateData.selected_voters[selectedIndex].newFieldsValues.phone2 = {...updateData.selected_voters[selectedIndex].newFieldsValues.phone2};
            if ( updateData.selected_voters[selectedIndex].newFieldsValues.phone2.phone_number.length == 0 ) {
                updateData.selected_voters[selectedIndex].newFieldsValues.phone2.phone_number = null;
            }

            if ( updateData.selected_voters[selectedIndex].newFieldsValues.updateHouseholdAddress ) {
                updateData.selected_voters[selectedIndex].newFieldsValues.updateHouseholdAddress = 1;
            } else {
                updateData.selected_voters[selectedIndex].newFieldsValues.updateHouseholdAddress = 0;
            }
        }
        ElectionsActions.saveVotersManualSelectedVoters(this.props.dispatch, updateData);
    }

    deleteSelectedVoter(voterIndex) {
        let selectedVoters = [...this.state.selectedVoters];

        selectedVoters.splice(voterIndex, 1);
        this.setState({selectedVoters});
    }

    updateSelectedVoterError(exists) {
        if ( exists ) {
            this.setState({errorSelectingVoterMsg: this.alertMessages.alreadySelected});
        } else {
            this.setState({errorSelectingVoterMsg: ''});
        }
    }

    isVoterAlreadySelected(fieldName, fieldValue) {
        
        let selectedIndex = this.state.selectedVoters.findIndex(item => item[fieldName] == fieldValue);

        return (selectedIndex != -1);
    }

    updateDataSourceVoter(voterDetails) {
        let dataSource = this.state.dataSource;

        dataSource.voter = {
            id: voterDetails.id,
            key: voterDetails.key,
            personal_identity: voterDetails.personal_identity,
            first_name: voterDetails.first_name,
            last_name: voterDetails.last_name
        };
        this.setState({dataSource});

        this.hideVoterSourceModal();
    }

    /**
     * This functions updates the voter
     * details recieved from the voter
     * source modal
     *
     * @param voterDetails
     */
    updateVoterDetails(voterDetails) {
        switch ( this.state.currentTab) {
            case 1:
                this.updateDataSourceVoter(voterDetails);
                break;

            case 2:
                this.hideVoterSourceModal();
                ElectionsActions.getSelectedVoter(this.props.dispatch, voterDetails.key);
                break;
        }
    }

    hideVoterSourceModal() {
        let voterSourceModal = this.state.voterSourceModal;

        voterSourceModal.show = false;
        this.setState({voterSourceModal});
    }

    showVoterSourceModal() {
        let voterSourceModal = this.state.voterSourceModal;

        voterSourceModal.show = true;
        this.setState({voterSourceModal});
    }
	
	cleanVotersList(){
		this.setState({selectedVoters: []});
	}

    cleanSecondTabData() {
        this.hideAlertSelectedModal();

        let tabs = this.state.tabs;
        tabs[1].disabled = true;
        this.setState({selectedVoters: [], currentTab: 1, errorSelectingVoterMsg:'', tabs});

        this.props.dispatch({type: ElectionsActions.ActionTypes.VOTERS_MANUAL.SECOND_TAB.RESET_VOTER});

        if ( this.props.savedSelectedVotersFlag ) {
            this.cleanFirstData();
            this.props.dispatch({type: ElectionsActions.ActionTypes.VOTERS_MANUAL.CHANGE_SAVED_SELECTED_VOTER_FLAG,
                                 savedSelectedVotersFlag: false});
        }
    }

    hideAlertSelectedModal() {
        let alertSelectedVoterModal = this.state.alertSelectedVoterModal;

        alertSelectedVoterModal.show = false;
        this.setState({alertSelectedVoterModal});
    }

    showAlertSelectedModal() {
        let alertSelectedVoterModal = this.state.alertSelectedVoterModal;

        alertSelectedVoterModal.show = true;
        this.setState({alertSelectedVoterModal});
    }

    continuteToNextStep() {
        let tabs = this.state.tabs;
        tabs[1].disabled = false;

        this.setState({tabs, currentTab: 2});
    }

    resetMassUpdateClean(blockName) {
        let cleanFirstStepData = this.state.cleanFirstStepData;

        let massmassUpdate = cleanFirstStepData.massUpdate;
        massmassUpdate[blockName] = false;

        this.setState({cleanFirstStepData});
    }

    resetDataSourceClean() {
        let cleanFirstStepData = this.state.cleanFirstStepData;

        cleanFirstStepData.dataSource = false;
        this.setState({cleanFirstStepData});
    }

    cleanFirstData() {
        let dataSource = {
            source_id: null,
            voter: {
                id: null,
                key: null,
                personal_identity: null,
                first_name: null,
                last_name: null
            }
        };

        let  massUpdate = {
            statusData: {
                support_status_chosen_id: null,
                status_update_type: this.supportStatusUpdateType.always,
                status_to_voter_with_status_id : null,
                updateHouseHoldStatus: false,

                validInput: true
            },

            instituteData: {
                institute_id: null,
                institute_role_id: null,

                validInput: true
            },

            voterGroupData: {
                voter_group_id: null
            },

            moreInfoData: {
                ethnic_group_id: null,
                gender: null,
                ultraOrthodox: null,
                religious_group_id: null,
                validInput: true
            },

            massUpdateType: this.massUpdateType.immediate
        };

        let tabs = this.state.tabs;
        tabs[1].disabled = true;

        let cleanFirstStepData = this.state.cleanFirstStepData;
        cleanFirstStepData.dataSource = true;

        let massUpdate2 = cleanFirstStepData.massUpdate;
        massUpdate2.instituteData = true;
        massUpdate2.moreInfoData = true;
        massUpdate2.statusData = true;
        massUpdate2.voterGroupData = true;
        cleanFirstStepData.massUpdate = massUpdate2;

        this.setState({currentTab: 1, dataSource, massUpdate, tabs, cleanFirstStepData});

        this.props.dispatch({type: ElectionsActions.ActionTypes.VOTERS_MANUAL.DATA_SOURCE.RESET_VOTER});
    }

    massUpdateTypeChange(massUpdateType) {
        let massUpdate = this.state.massUpdate;

        massUpdate.massUpdateType = massUpdateType;
        this.setState({massUpdate});
    }

    updateMassUpdateData(blockName, dataObj) {
        let massUpdate = this.state.massUpdate;

        massUpdate[blockName] = {...dataObj};
        this.setState({massUpdate});
    }

    updateDataSource(dataSourceObj) {
        let dataSource = this.state.dataSource;

        dataSource.source_id = dataSourceObj.source_id;
        dataSource.voter = {
            id: dataSourceObj.voter.id,
            key: dataSourceObj.voter.key,
            persoanl_identity:dataSourceObj.voter.persoanl_identity,
            first_name: dataSourceObj.voter.first_name,
            last_name: dataSourceObj.voter.last_name,
        };
        dataSource.completed = true;

        this.setState({dataSource});
    }

    isMassUpdateEmptyFields() {
        if ( this.state.massUpdate.instituteData.institute_id != null && this.state.massUpdate.instituteData.institute_role_id != null ) {
            return false;
        }

        if ( this.state.massUpdate.moreInfoData.ethnic_group_id != null
            ||this.state.massUpdate.moreInfoData.religious_group_id != null
            ||this.state.massUpdate.moreInfoData.gender != null
            || this.state.massUpdate.moreInfoData.ultraOrthodox != null ) {
            return false;
        }

        if ( this.state.massUpdate.statusData.status_to_voter_with_status_id != null ||
             this.state.massUpdate.statusData.support_status_chosen_id != null ) {
            return false;
        }

        if ( this.state.massUpdate.voterGroupData.voter_group_id != null ) {
            return false;
        }

        return true;
    }

    validateMassUpdate() {
        let massUpdateBlocks = [
            'instituteData',
            'moreInfoData',
            'statusData'
        ];

        for ( let blockIndex = 0; blockIndex < massUpdateBlocks.length; blockIndex++ ) {
            let blockName = massUpdateBlocks[blockIndex];

            if ( !this.state.massUpdate[blockName].validInput ) {
                return false;
            }
        }

        return true;
    }

    goToTab(newTab) {
        this.setState({currentTab: newTab});
    }

    renderWizards() {
        let that = this;

        let tabs = this.state.tabs.map( function (item, index) {
            let tab = index + 1;

            return <WizardItem key={index} item={item} isActive={tab == that.state.currentTab}
                               disabled={item.disabled} goToTab={that.goToTab.bind(that)}/>
        });

        return <ul className="nav nav-tabs steps-2 steps">{tabs}</ul>;
    }

    updateSelectedVoterNewFieldsValues(voterIndex, dataFields) {
        let selectedVoters = [...this.state.selectedVoters];

        for ( let fieldName in dataFields ) {
            selectedVoters[voterIndex].newFieldsValues[fieldName] = dataFields[fieldName];
        }

        this.setState({selectedVoters});
    }

    updateSelectedVoterDetails(voterIndex, dataFields) {
        let selectedVoters = [...this.state.selectedVoters];

        for ( let fieldName in dataFields ) {
            selectedVoters[voterIndex][fieldName] = dataFields[fieldName];
        }

        this.setState({selectedVoters});
    }

    isValidSecondTab() {
        for ( let selectedIndex = 0; selectedIndex < this.state.selectedVoters.length; selectedIndex++ ) {
            if ( !this.state.selectedVoters[selectedIndex].valid ) {
                return false;
            }

            if ( !this.state.selectedVoters[selectedIndex].newFieldsValues.valid ) {
                return false;
            }
        }

        return true;
    }
	
	hideSuccessModal(){
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTERS_MANUAL.CHANGE_FILED_VALUE_BY_NAME , fieldName:'showSuccessMessageWindow' , fieldValue:false});
	}
 

    render() {
        return (
            <div className="stripMain voters-manual">
			   {this.props.showSuccessMessageWindow &&
					<ModalWindow show={this.props.showSuccessMessageWindow} title={"הודעה"} buttonOk={this.hideSuccessModal.bind(this)} buttonX={this.hideSuccessModal.bind(this)}>
					<div>השמירה בוצעה בהצלחה</div>
					</ModalWindow>
			   }
                <div className="container">
                    <div className="row pageHeading1">
                        <div className="col-lg-8">
                            <h1>טופס קליטה</h1>
                        </div>
                    </div>

                    <div className="row nomargin Wizard dataUpdateWizard">{this.renderWizards()}</div>

                    <DataSource display={this.state.currentTab == 1} updateDataSource={this.state.dataSource.source_id != null? this.continuteToNextStep.bind(this): this.updateDataSource.bind(this)}
                                cleanData={this.state.cleanFirstStepData.dataSource}
                                showVoterModal={this.state.voterSourceModal.show}
                                voterDetails={this.state.dataSource.voter}
                                showVoterSourceModal={this.showVoterSourceModal.bind(this)}
                                resetDataSourceClean={this.resetDataSourceClean.bind(this)}/>

                    <MassUpdate display={this.state.currentTab == 1 && this.state.dataSource.source_id != null &&
                                         this.state.dataSource.voter.id != null}
                                updateMassUpdateData={this.updateMassUpdateData.bind(this)}
                                massUpdateTypeChange={this.massUpdateTypeChange.bind(this)}
                                validateMassUpdate={this.validateMassUpdate.bind(this)}
                                isMassUpdateEmptyFields={this.isMassUpdateEmptyFields.bind(this)}
                                cleanStepData={this.cleanFirstData.bind(this)}
                                continuteToNextStep={this.continuteToNextStep.bind(this)}
                                cleanData={this.state.cleanFirstStepData.massUpdate}
                                resetMassUpdateClean={this.resetMassUpdateClean.bind(this)}/>

                    <SelectVoter display={this.state.currentTab == 2}
                                 showVoterModal={this.state.voterSourceModal.show}
                                 voterDetails={this.state.selectedVoter}
                                 showVoterSourceModal={this.showVoterSourceModal.bind(this)}
                                 isVoterAlreadySelected={this.isVoterAlreadySelected.bind(this)}
                                 updateSelectedVoterError={this.updateSelectedVoterError.bind(this)}/>

                    { ( this.showMassUpdateAlert() ) &&
                        <AlertMassUpdate massUpdate={this.state.massUpdate}/>
                    }

                    { ( this.state.errorSelectingVoterMsg.length > 0) &&
                        <AlertContainer alertMessage={this.state.errorSelectingVoterMsg}/>
                    }

                    { (this.state.currentTab == 2 && this.state.selectedVoters.length > 0) &&
                        <SelectedVoters massUpdate={this.state.massUpdate}
                                        selectedVoters={this.state.selectedVoters}
                                        deleteSelectedVoter={this.deleteSelectedVoter.bind(this)}
                                        updateSelectedVoterDetails={this.updateSelectedVoterDetails.bind(this)}
                                        updateSelectedVoterNewFieldsValues={this.updateSelectedVoterNewFieldsValues.bind(this)}
										onCleanClick={this.cleanVotersList.bind(this)}
										/>
                    }

                    { (this.state.currentTab == 2 && this.state.selectedVoters.length > 0) &&
                        <BottomButtons isDisabled={!this.isValidSecondTab()}
                                       continueClick={this.saveSelectedVoters.bind(this)}
                                       backClick={this.props.savedSelectedVotersFlag ? this.cleanSecondTabData.bind(this) :
                                                  this.showAlertSelectedModal.bind(this)}
                                       continueText="שמור"/>
                    }

                    <AlertSelectedVotersModal show={this.state.alertSelectedVoterModal.show}
                                              hideAlertSelectedModal={this.hideAlertSelectedModal.bind(this)}
                                              cleanSecondTabData={this.cleanSecondTabData.bind(this)}/>

                    <VoterSourceModal show={this.state.voterSourceModal.show} hideModal={this.hideVoterSourceModal.bind(this)}
                        screenPermission={this.screenPermission}
                        updateVoterDetails={this.updateVoterDetails.bind(this)} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        institutes: state.elections.votersManualScreen.combos.institutes,
        instituteRoles: state.elections.votersManualScreen.combos.instituteRoles,

        loadedDataSourceVoter: state.elections.votersManualScreen.data_source.loadedVoter,
        dataSourceVoter: state.elections.votersManualScreen.data_source.voter,

        loadedSecondTabVoter: state.elections.votersManualScreen.secondTab.loadedVoter,
        secondTabVoter: state.elections.votersManualScreen.secondTab.voter,

        loadedSelectedVoter: state.elections.votersManualScreen.secondTab.loadedSelectedVoter,
        selectedVoter: state.elections.votersManualScreen.secondTab.selectedVoter,

        savedSelectedVotersFlag: state.elections.votersManualScreen.savedSelectedVotersFlag,
        showSuccessMessageWindow: state.elections.votersManualScreen.showSuccessMessageWindow,
		breadcrumbs: state.system.breadcrumbs,
    }
}

export default connect(mapStateToProps) (VotersManual);