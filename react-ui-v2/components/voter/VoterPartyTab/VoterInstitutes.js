import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';
import _ from 'lodash';

import VoterInstitutesItem from './VoterInstitutesItem';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';

import Combo from '../../global/Combo';
import ModalWindow from '../../global/ModalWindow';


class VoterInstitutes extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        this.newInstituteButtonText = "מוסד חדש";
        this.saveButtonText = "שמירה";
        this.modalConfirmText = "האם אתה בטוח ?";
        this.setDirtyTarget = "elections.voter.political_party.shas_institutes";
        this.mainBtnStyle = {marginBottom:10};

        this.setDirtyTarget = "elections.voter.political_party.shas_institutes";
    }

    saveVoterInstitutes(e) {
        // Prevent page refresh
        e.preventDefault();

        let voterInstitutes = this.props.voterInstitutes;
        let instituteIndex = -1;
        let InstitutesData = [];
        let voterKey = this.props.router.params.voterKey;

        for ( instituteIndex = 0; instituteIndex < voterInstitutes.length; instituteIndex++ ) {
            InstitutesData.push(
                {
                    id: voterInstitutes[instituteIndex].id,
                    institute_id: voterInstitutes[instituteIndex].institute_id,
                    institute_role_id: voterInstitutes[instituteIndex].institute_role_id
                }
            );
        }

        VoterActions.saveVoterInstitutes(this.props.dispatch, voterKey, InstitutesData);
    }

    deleteInstituteFromState() {
        let voterKey = this.props.router.params.voterKey;
		let rowID = this.props.voterInstitutes[this.props.deleteInstituteIndex].id;
		console.log(rowID);
		VoterActions.deleteVoterInstitute(this.props.dispatch , voterKey , rowID);
    }

    hideDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.HIDE_DELETE_MODAL_DIALOG});
    }

    addNewInstituteToState() {
		let voterKey = this.props.router.params.voterKey;
        //this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
		let data = {};
		data.institute_id = this.props.newInstituteData.institute_id ;
		data.institute_role_id = this.props.newInstituteData.institute_role_id ;
	 
		VoterActions.addNewVoterInstitute(this.props.dispatch , voterKey , data , this.setDirtyTarget);
    }

    loadRolesByInstitute(typeId, instituteId) {
        var roleList = this.props.instituteRoles;
        var newRoleList = [];

        var instituteIndex = -1;
        var voterInstitutes = this.props.voterInstitutes;
        var voterInstitutesHash = {};

        for ( instituteIndex = 0; instituteIndex < voterInstitutes.length; instituteIndex++ ) {
            let hashKey = voterInstitutes[instituteIndex].institute_id + '_';
            hashKey += voterInstitutes[instituteIndex].institute_role_id;

            voterInstitutesHash[hashKey] = 1;
        }

        for ( let roleIndex = 0; roleIndex < roleList.length; roleIndex++ ) {
            let hashKey = instituteId + '_' + roleList[roleIndex].id;

            if ( roleList[roleIndex].institute_type_id == typeId && !(hashKey in voterInstitutesHash) ) {
                newRoleList.push(roleList[roleIndex]);
            }
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'roles_list', fieldValue: newRoleList});
    }

    loadRoles(typeId) {
        var roleList = this.props.instituteRoles;
        var newRoleList = [];

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_role_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_role_name', fieldValue: ''});

        newRoleList = roleList.filter(roleItem => roleItem.institute_type_id == typeId);
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'roles_list', fieldValue: newRoleList});
    }

    emptyRoles() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_role_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_role_name', fieldValue: ''});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'roles_list', fieldValue: []});
    }

    loadAllTypes() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_name', fieldValue: ''});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'types_list', fieldValue: this.props.instituteTypes});
    }

    loadGroupTypes(groupId) {
        let typesList = this.props.instituteTypes;
        let newTypesList = [];

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_name', fieldValue: ''});

        newTypesList = typesList.filter(typeItem => typeItem.institute_group_id == groupId);

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'types_list',fieldValue: newTypesList});

        return newTypesList;
    }

    loadAllInstitutes() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_name', fieldValue: ''});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institutes_list',fieldValue: this.props.institutes});
    }

    loadInstitutesByRole(roleId) {
        var instituteIndex = -1;
        var voterInstitutes = this.props.voterInstitutes;
        var voterInstitutesHash = {};
        var institutes = this.props.institutes;
        var newInstitutesList = [];

        for ( instituteIndex = 0; instituteIndex < voterInstitutes.length; instituteIndex++ ) {
            let hashKey = voterInstitutes[instituteIndex].institute_id + '_';
            hashKey += voterInstitutes[instituteIndex].institute_role_id;

            voterInstitutesHash[hashKey] = 1;
        }

        for ( instituteIndex = 0; instituteIndex < institutes.length; instituteIndex++ ) {
            let insertByType = false;
            let insertByNetwork = false;
            let insertByCity = false;
            let insertByRole = false;

            let instituteTypeId = institutes[instituteIndex].institute_type_id;
            let instituteNetworkId = institutes[instituteIndex].institute_network_id;
            let cityId = institutes[instituteIndex].city_id;
            let hashKey = institutes[instituteIndex].id + '_' + roleId;

            if (  instituteTypeId == this.props.newInstituteData.institute_type_id ) {
                insertByType = true;
            } else {
                insertByType = false;
            }

            if ( 0 == this.props.newInstituteData.institute_network_id ) {
                insertByNetwork = true;
            } else {
                if ( instituteNetworkId == this.props.newInstituteData.institute_network_id ) {
                    insertByNetwork = true;
                } else {
                    insertByNetwork = false;
                }
            }

            if ( 0 == this.props.newInstituteData.city_id ) {
                insertByCity = true;
            } else {
                if ( cityId == this.props.newInstituteData.city_id ) {
                    insertByCity = true;
                } else {
                    insertByCity = false;
                }
            }

            if ( hashKey in voterInstitutesHash ) {
                insertByRole = false;
            } else {
                insertByRole = true;
            }

            if ( insertByType && insertByNetwork && insertByCity && insertByRole ) {
                newInstitutesList.push(institutes[instituteIndex]);
            }
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institutes_list',fieldValue: newInstitutesList});
    }

    loadInstitutes(typeId, typesList, networkId, cityId, roleId) {
        var institutesList = this.props.institutes;

        var newInstitutesList = [];
        var typesListHash = [];

        var typeIndex = -1;
        var instituteIndex = -1;

        var typeFromList = false;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_name', fieldValue: ''});

        if ( 0 == typeId ) {
            typeFromList = true;
        } else {
            typeFromList = false;
        }

        for ( typeIndex = 0; typeIndex < typesList.length; typeIndex++ ) {
            let typeId = typesList[typeIndex].id;
            typesListHash[typeId] = 1;
        }

        for ( instituteIndex = 0; instituteIndex < institutesList.length; instituteIndex++ ) {
            let insertByType = false;
            let insertByNetwork = false;
            let insertByCity = false;

            let instituteTypeId = institutesList[instituteIndex].institute_type_id;

            if ( typeFromList ) {
                if ( typesListHash[instituteTypeId] != undefined ) {
                    insertByType = true;
                } else {
                   insertByType = false;
                }
            } else {
                if ( instituteTypeId == typeId ) {
                    insertByType = true;
                } else {
                    insertByType = false;
                }
            }

            if ( 0 == networkId ) {
                insertByNetwork = true;
            } else {
                if ( institutesList[instituteIndex].institute_network_id == networkId ) {
                    insertByNetwork = true;
                } else {
                    insertByNetwork = false;
                }
            }

            if ( 0 == cityId ) {
                insertByCity = true;
            } else {
                if ( institutesList[instituteIndex].city_id == cityId ) {
                    insertByCity = true;
                } else {
                    insertByCity = false;
                }
            }

            if ( insertByType && insertByNetwork && insertByCity ) {
                newInstitutesList.push(institutesList[instituteIndex]);
            }
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institutes_list',fieldValue: newInstitutesList});
    }

    getRoleIndex(fieldName, fieldValue) {
        var rolesList = this.props.newInstituteData.roles_list;
        var roleIndex = -1;

        roleIndex = rolesList.findIndex(roleItem => roleItem[fieldName] == fieldValue);

        return roleIndex;
    }

    roleChange(e) {
        var roleList = this.props.newInstituteData.roles_list;
        var roleIndex = -1;
        var roleId = 0;
        var roleName = e.target.value;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_role_name', fieldValue: roleName});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == roleName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_role_id', fieldValue: 0});

            this.loadInstitutes(this.props.newInstituteData.institute_type_id, this.props.newInstituteData.types_list,
                                this.props.newInstituteData.institute_network_id,
                                this.props.newInstituteData.city_id);

            return;
        }

        roleIndex = this.getRoleIndex('name', roleName);
        if ( -1 == roleIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_role_id', fieldValue: 0});

            this.loadInstitutes(this.props.newInstituteData.institute_type_id, this.props.newInstituteData.types_list,
                                this.props.newInstituteData.institute_network_id,
                                this.props.newInstituteData.city_id);
        } else {
            roleId = roleList[roleIndex].id;

            this.loadInstitutesByRole(roleId);

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_role_id', fieldValue: roleId});
        }
    }

    updateGroupByInstituteType(typeGroupId) {
        var groupId = 0;
        var groupName = '';
        var groupIndex = -1;
        var groupList = this.props.instituteGroups;

        groupIndex = this.getGroupIndex('id', typeGroupId);
        groupId = groupList[groupIndex].id;
        groupName = groupList[groupIndex].name;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_group_name', fieldValue: groupName});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_group_id', fieldValue: groupId});

        this.loadGroupTypes(groupId);
    }

    getInstituteIndex(fieldName, fieldValue) {
        var institutesList = this.props.newInstituteData.institutes_list;
        var instituteIndex = -1;

        instituteIndex = institutesList.findIndex(instituteItem => instituteItem[fieldName] == fieldValue);

        return instituteIndex;
    }

    instituteChange(e) {
 
        var instituteName = e.target.value;
        var instituteIndex = -1;
        var instituteId = 0;
        var institutesList = this.props.newInstituteData.institutes_list;

        var typeIndex = -1;
        var typesList = this.props.newInstituteData.types_list;
        var typeId = 0;
        var typeName = '';
        var typeGroupId = 0;

        var cityIndex = -1;
        var citiesList = this.props.cities;

        var networkIndex = -1;
        var networksList = this.props.instituteNetworks;

        var voterInstitutes = this.props.voterInstitutes;

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
 
        if ( 0 == instituteName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_name', fieldValue: ''});

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_id', fieldValue: 0});

           if ( this.props.newInstituteData.institute_type_id > 0 ) {
               this.loadRoles(this.props.newInstituteData.institute_type_id);
           }

            return;
        }
 
        instituteIndex = this.getInstituteIndex('name', instituteName);
        if ( -1 == instituteIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_id', fieldValue: 0});

            //this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                              //   fieldName: 'institute_name', fieldValue: ''});

            if ( this.props.newInstituteData.institute_type_id > 0 ) {
                this.loadRoles(this.props.newInstituteData.institute_type_id);
            }
			instituteId = 0;
           // return;
        } else {
            instituteId = institutesList[instituteIndex].id;
        }
 

        // Update type
		
        typeIndex = (instituteIndex >=0 ?  this.getTypeIndex('id', institutesList[instituteIndex].institute_type_id) : -1);
        if(typeIndex >= 0){
			typeId = typesList[typeIndex].id;
			typeName = typesList[typeIndex].name;
			typeGroupId = typesList[typeIndex].institute_group_id;

			if ( 0 == this.props.newInstituteData.institute_group_id ) {
				this.updateGroupByInstituteType(typeGroupId)
			}

			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_name', fieldValue: typeName});

			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_id', fieldValue: typeId});

			// update city
			cityIndex = (instituteIndex >=0 ? this.getCityIndex('id', institutesList[instituteIndex].city_id) : -1);
			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'city_name', fieldValue: citiesList[cityIndex].name});

			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'city_id', fieldValue: citiesList[cityIndex].id});

			// update network
			if(networksList[networkIndex]){
				networkIndex = (instituteIndex >=0 ? this.getNetworkIndex('id', institutesList[instituteIndex].institute_network_id) : -1);
				this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_network_name', fieldValue: networksList[networkIndex].name});

				this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_network_id', fieldValue: networksList[networkIndex].id});

       
				this.loadInstitutes(typeId, [], networksList[networkIndex].id, citiesList[cityIndex].id);
			}
			this.loadRolesByInstitute(typeId, instituteId);
		}
        // Update institute name and id
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_name', fieldValue: instituteName});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_id', fieldValue: instituteId});
		
    }

    getCityIndex(fieldName, fieldValue) {
        var citiesList = this.props.cities;
        var cityIndex = -1;

        cityIndex = citiesList.findIndex(cityItem => cityItem[fieldName] == fieldValue);

        return cityIndex;
    }

    cityChange(e) {
        var cityName = e.target.value;
        var cityIndex = -1;
        var cityId = 0;
        var citiesList = this.props.cities;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'city_name', fieldValue: cityName});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == cityName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'city_id', fieldValue: 0});

            this.loadInstitutes(this.props.newInstituteData.institute_type_id, this.props.newInstituteData.types_list,
                                this.props.newInstituteData.institute_network_id, 0);

            return;
        }

        cityIndex = this.getCityIndex('name', cityName);
        if ( -1 == cityIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'city_id', fieldValue: 0});

            this.loadInstitutes(this.props.newInstituteData.institute_type_id, this.props.newInstituteData.types_list,
                                this.props.newInstituteData.institute_network_id, 0);
        } else {
            cityId = citiesList[cityIndex].id;
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'city_id', fieldValue: cityId});

            this.loadInstitutes(this.props.newInstituteData.institute_type_id, this.props.newInstituteData.types_list,
                                this.props.newInstituteData.institute_network_id, cityId);
        }
    }

    getNetworkIndex(fieldName, fieldValue) {
        var networkList = this.props.instituteNetworks;
        var networkIndex = -1;

        networkIndex = networkList.findIndex(networkItem => networkItem[fieldName] == fieldValue);

        return networkIndex;
    }

    networkChange(e) {
        var networkName = e.target.value;
        var networkIndex = -1;
        var networkId = 0;
        var networkList = this.props.instituteNetworks;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_network_name', fieldValue: networkName});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == networkName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_network_id', fieldValue: 0});

            this.loadInstitutes(this.props.newInstituteData.institute_type_id, this.props.newInstituteData.types_list,
                                0, this.props.newInstituteData.city_id);

            return;
        }

        networkIndex = this.getNetworkIndex('name', networkName);
        if ( -1 == networkIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_network_id', fieldValue: 0});

            this.loadInstitutes(this.props.newInstituteData.institute_type_id, this.props.newInstituteData.types_list,
                                0, this.props.newInstituteData.city_id);
        } else {
            networkId = networkList[networkIndex].id;

            this.loadInstitutes(this.props.newInstituteData.institute_type_id, this.props.newInstituteData.types_list,
                                networkId, this.props.newInstituteData.city_id);

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_network_id', fieldValue: networkId});
        }
    }

    getTypeIndex(fieldName, fieldValue) {
        var typeList = this.props.newInstituteData.types_list;
        var typeIndex = -1;

        typeIndex = typeList.findIndex(typeItem => typeItem[fieldName] == fieldValue);

        return typeIndex;
    }

    typeChange(e) {
        var typeIndex = -1;
        var typeId = 0;
        var typesList = this.props.newInstituteData.types_list;
        var newTypesList = this.props.newInstituteData.types_list;
        var itemDisplayFieldValue = e.target.value;
        var arrOfDispalyElements = [];
        var typeName = '';
        var groupId = this.props.newInstituteData.institute_group_id;

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 'fullName' == this.typesItemDisplayProperty ) {
            arrOfDispalyElements = itemDisplayFieldValue.split('|');
            typeName = arrOfDispalyElements[1];
        } else {
            typeName = e.target.value;
        }

        if ( 0 == typeName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_name', fieldValue: ''});

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_id', fieldValue: 0});


            if ( 0 == this.props.newInstituteData.institute_group_id ) {
                this.loadAllInstitutes();
            } else {
                this.loadInstitutes(0, this.props.newInstituteData.types_list, this.props.newInstituteData.city_id,
                                    this.props.newInstituteData.institute_network_id);
            }

            this.emptyRoles();

            return;
        }

        typeIndex = this.getTypeIndex('name', typeName);
        if ( -1 == typeIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_name', fieldValue: ''});

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_id', fieldValue: 0});

            if ( 0 == this.props.newInstituteData.institute_group_id ) {
                this.loadAllInstitutes();
            } else {
                this.loadInstitutes(0, this.props.newInstituteData.types_list, this.props.newInstituteData.city_id,
                                    this.props.newInstituteData.institute_network_id);
            }

            this.emptyRoles();
        } else {
            typeId = typesList[typeIndex].id;
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_id', fieldValue: typeId});

            if ( 0 == groupId ) {
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                     fieldName: 'institute_group_name',
                                     fieldValue: typesList[typeIndex].institute_group_name});

                this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                     fieldName: 'institute_group_id', fieldValue: typesList[typeIndex].institute_group_id});

                newTypesList = this.loadGroupTypes(typesList[typeIndex].institute_group_id);
            }

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_name', fieldValue: typeName});

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_id', fieldValue: typeId});

            this.loadInstitutes(typeId, newTypesList, this.props.newInstituteData.institute_network_id,
                                this.props.newInstituteData.city_id);

            this.loadRoles(typeId);
        }
    }

    getGroupIndex(fieldName, fieldValue) {
        var groupList = this.props.instituteGroups;
        var groupIndex = -1;

        groupIndex = groupList.findIndex(groupItem => groupItem[fieldName] == fieldValue);

        return groupIndex;
    }

    groupChange(e) {
        var groupIndex = -1;
        var groupId = 0;
        var groupName = e.target.value;
        var groupList = this.props.instituteGroups;
        var newTypesList = [];

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_group_name', fieldValue: groupName});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == groupName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_group_id', fieldValue: 0});

            this.loadAllTypes();

            this.loadAllInstitutes();

            this.emptyRoles();

            return;
        }

        groupIndex = this.getGroupIndex('name', groupName);
        if ( -1 == groupIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_group_id', fieldValue: 0});

            this.loadAllTypes();

            this.loadAllInstitutes();
        } else {
            groupId = groupList[groupIndex].id;

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_group_id', fieldValue: groupId});

            newTypesList = this.loadGroupTypes(groupId);

            this.loadInstitutes(0, newTypesList, this.props.newInstituteData.institute_network_id,
                                this.props.newInstituteData.city_id);
        }

        this.emptyRoles();
    }

    disableAddingInstitute() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.DISABLE_ADDING_NEW_INSTITUTE});
		this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget});
    }

    enableAddingInstitute() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.ENABLE_ADDING_NEW_INSTITUTE});
    }

    renderSaveButton() {
        var displayButton = false;

        if ( this.props.currentUser.admin ||
             this.props.currentUser.permissions['elections.voter.political_party.shas_institutes.edit'] == true ) {
            displayButton = true;
        }

        if ( displayButton ) {
            return (
                <div className="col-xs-12">
                    <div className="form-group">
                        <div className="">
							{false && <button className="btn btn-primary saveChanges"
                                    onClick={this.saveVoterInstitutes.bind(this)}
                                    disabled={this.props.showNewInstituteRow || this.props.editInstituteIndex != -1 ||
                                              !this.instituteHasChanged || this.props.savingChanges}>
                                {this.saveButtonText}
							</button>}
                        </div>
                    </div>
                </div>
            );
        }
    }

    renderAddButton() {
        var displayButton = false;

        if (this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.voter.political_party.shas_institutes.add'] == true) {
            displayButton = true;
        }

        if (displayButton) {
            return (
                <div className="row">
                    <div className="col-md-12 col-xs-12">
                        <button className="btn btn-primary mainBtn pull-left" style={this.mainBtnStyle} 
                                onClick={this.enableAddingInstitute.bind(this)}
                                disabled={this.props.showNewInstituteRow || this.props.editInstituteIndex != -1}>
                            <span className="glyphicon glyphicon-plus" aria-hidden="true"/>
                            {this.newInstituteButtonText}
                        </button>
                    </div>
                </div>
            );
        }
    }

    renderNewInstituteRow() {

        if ( this.props.showNewInstituteRow ) {
            if ( 0 == this.props.newInstituteData.institute_group_id ) {
                this.typesItemDisplayProperty = 'fullName';
            } else {
                this.typesItemDisplayProperty = 'name';
            }

            return (
                <tr>
                    <td>
                        <Combo items={this.props.instituteGroups} itemIdProperty="id" itemDisplayProperty='name'
                               maxDisplayItems={10}
                               inputStyle={this.groupStyle} value={this.props.newInstituteData.institute_group_name}
                               className="form-combo-table"
                               onChange={this.groupChange.bind(this)}/>
                    </td>
                    <td>
                        <Combo items={this.props.newInstituteData.types_list} itemIdProperty="id"
                               itemDisplayProperty={this.typesItemDisplayProperty}
                               maxDisplayItems={10} inputStyle={this.typeStyle}
                               value={this.props.newInstituteData.institute_type_name}
                               className="form-combo-table"
                               onChange={this.typeChange.bind(this)}/>
                    </td>
                    <td>
                        <Combo items={this.props.instituteNetworks} itemIdProperty="id"
                               itemDisplayProperty='name'
                               maxDisplayItems={10} inputStyle={this.networkStyle}
                               value={this.props.newInstituteData.institute_network_name}
                               className="form-combo-table"
                               onChange={this.networkChange.bind(this)}/>
                    </td>
                    <td>
                        <Combo id="inputCity-ver" items={this.props.cities}
                               itemIdProperty="id" itemDisplayProperty='name'
                               maxDisplayItems={10} inputStyle={this.cityStyle}
                               value={this.props.newInstituteData.city_name}
                               onChange={this.cityChange.bind(this)}/>
                    </td>
                    <td>
                        <Combo items={this.props.newInstituteData.institutes_list} itemIdProperty="id"
                               itemDisplayProperty='name'
                               maxDisplayItems={10} inputStyle={this.instituteStyle}
                               value={this.props.newInstituteData.institute_name}
                               className="form-combo-table"
                               onChange={this.instituteChange.bind(this)}/>
                    </td>
                    <td>
                        <Combo items={this.props.newInstituteData.roles_list} itemIdProperty="id"
                               itemDisplayProperty='name'
                               maxDisplayItems={10} inputStyle={this.roleStyle}
                               value={this.props.newInstituteData.institute_role_name}
                               className="form-combo-table"
                               onChange={this.roleChange.bind(this)}/>
                    </td>
                    <td>
                        <span className="pull-left edit-buttons">
                            <button className="btn btn-success btn-xs"
                                    onClick={this.addNewInstituteToState.bind(this)}
                                    disabled={!this.validInputs}>
                                <i className="fa fa-floppy-o"/>
                            </button>
                            {'\u00A0'}
                            <button className="btn btn-danger btn-xs"
                                    onClick={this.disableAddingInstitute.bind(this)}>
                                <i className="fa fa-times"/>
                            </button>
                        </span>
                    </td>
                </tr>
            );
        }
    }

    renderInstitutesData() {
        var editInstituteIndex = this.props.editInstituteIndex;
        var showNewInstituteRow = this.props.showNewInstituteRow;
        var editingMode = false;
        var enableEditing = false;
        var that = this;

        this.institutesRows = this.props.voterInstitutes.map(function (instituteItem, index) {
            // Checking if the institute item is to
            // be edited by comparing the current
            // institute item's index to editing institute index
            // which specifies the institute item's
            // index to be edited
            if ( index == editInstituteIndex ) {
                editingMode = true;
            } else {
                editingMode = false;

                if ( editInstituteIndex != -1 ) {
                    // If another institute item is
                    // being edited, then disable the
                    // editing of the current institute item
                    enableEditing = false;
                } else {
                    // No institute item is to be edited,
                    // then enable editing the current
                    // institute item
                    enableEditing = true;
                }
            }

            if ( showNewInstituteRow ) {
                enableEditing = false;
            }

            return <VoterInstitutesItem key={index} instituteItemIndex={index} item={instituteItem}
                                        editing_mode={editingMode} enable_editing={enableEditing}/>;
        });

        return (
            <div className="row">
                <div className="col-md-12 col-xs-12">
                    <table className="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>קבוצה</th>
                            <th>סוג</th>
                            <th>רשת</th>
                            <th>עיר</th>
                            <th>שם</th>
                            <th>תפקיד</th>
                            <th>{'\u00A0'}</th>
                        </tr>
                        </thead>

                        <tbody>
                            {this.institutesRows}
                            {this.renderNewInstituteRow()}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    validateRole() {
        var institute_role_name = this.props.newInstituteData.institute_role_name;
        var institute_role_id = this.props.newInstituteData.institute_role_id;

        if ( 0 ==  institute_role_name.length || 0 == institute_role_id) {
            return false;
        } else {
            return true;
        }
    }

    validateInstitute() {
        var institute_name = this.props.newInstituteData.institute_name;
        var institute_id = this.props.newInstituteData.institute_id;

        if ( 0 ==  institute_name.length || 0 == institute_id) {
            return false;
        } else {
            return true;
        }
    }

    validateCity() {
        var cityName = this.props.newInstituteData.city_name;
        var cityId = this.props.newInstituteData.city_id;

        if ( 0 ==  cityName.length || 0 == cityId) {
            return false;
        } else {
            return true;
        }
    }

    validateNetwork() {
        var institute_network_name = this.props.newInstituteData.institute_network_name;
        var institute_network_id = this.props.newInstituteData.institute_network_id;

        if (0 ==  institute_network_name.length) {
            return true;
        }

        if ( 0 == institute_network_id) {
            return false;
        } else {
            return true;
        }
    }

    validateType() {
        var institute_type_name = this.props.newInstituteData.institute_type_name;
        var institute_type_id = this.props.newInstituteData.institute_type_id;

        if ( 0 ==  institute_type_name.length || 0 == institute_type_id) {
            return false;
        } else {
            return true;
        }
    }

    validateGroup() {
        var institute_group_name = this.props.newInstituteData.institute_group_name;
        var institute_group_id = this.props.newInstituteData.institute_group_id;

        if ( 0 ==  institute_group_name.length || 0 == institute_group_id) {
            return false;
        } else {
            return true;
        }
    }

    validateVariables() {
        this.validInputs = true;

        if ( !this.validateGroup() ) {
            this.groupStyle = {
                borderColor: this.borderColor.inValid
            };
            this.validInputs = false;
        } else {
            this.groupStyle = {};
        }

        if ( !this.validateType() ) {
            this.typeStyle = {
                borderColor: this.borderColor.inValid
            };
            this.validInputs = false;
        } else {
            this.typeStyle = {};
        }

        if ( !this.validateNetwork() ) {
            this.networkStyle = {
                borderColor: this.borderColor.inValid
            };
            this.validInputs = false;
        } else {
            this.networkStyle = {};
        }

        if ( !this.validateCity() ) {
            this.cityStyle = {
                borderColor: this.borderColor.inValid
            };
            this.validInputs = false;
        } else {
            this.cityStyle = {};
        }

        if ( !this.validateInstitute() ) {
            this.instituteStyle = {
                borderColor: this.borderColor.inValid
            };
            this.validInputs = false;
        } else {
            this.instituteStyle = {};
        }

        if ( !this.validateRole() ) {
            this.roleStyle = {
                borderColor: this.borderColor.inValid
            };
            this.validInputs = false;
        } else {
            this.roleStyle = {};
        }
    }

    initVariables() {
        this.groupStyle = {};
        this.typeStyle = {};
        this.networkStyle = {};
        this.cityStyle = {};
        this.instituteStyle = {};
        this.roleStyle = {};
    }

    checkAnyChanges() {
        // Checking if any input has changed
        if (this.props.dirtyComponents.indexOf(this.setDirtyTarget) == -1) {
            this.instituteHasChanged = false;
        } else {
            this.instituteHasChanged = true;
        }
    }

    render() {

        this.initVariables();

        this.validateVariables();

        this.checkAnyChanges();

        return (
            <Collapse isOpened={this.props.containerCollapseStatus.partyInstitutes}>
                <div className="row CollapseContent">
                    {this.renderAddButton()}

                    {this.renderInstitutesData()}

                    {this.renderSaveButton()}

                    <ModalWindow show={this.props.showDeleteInstituteModalDialog}
                                 buttonOk={this.deleteInstituteFromState.bind(this)}
                                 buttonCancel={this.hideDeleteModalDialog.bind(this)}
                                 title={this.props.deleteInstituteModalHeader} style={{zIndex: '9001'}}>
                        <div>{this.modalConfirmText}</div>
                    </ModalWindow>
                </div>
            </Collapse>
        );
    }
}


function mapStateToProps(state) {
    return {
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        instituteGroups: state.voters.voterScreen.instituteGroups,
        instituteTypes: state.voters.voterScreen.instituteTypes,
        instituteRoles: state.voters.voterScreen.instituteRoles,
        instituteNetworks: state.voters.voterScreen.instituteNetworks,
        institutes: state.voters.voterScreen.institutes,
        cities: state.system.cities,
        voterInstitutes: state.voters.voterScreen.voterInstitutes,
        newInstituteData: state.voters.voterScreen.newInstituteData,
        showNewInstituteRow: state.voters.voterScreen.showNewInstituteRow,
        editInstituteIndex: state.voters.voterScreen.editInstituteIndex,
        showDeleteInstituteModalDialog: state.voters.voterScreen.showDeleteInstituteModalDialog,
        deleteInstituteIndex: state.voters.voterScreen.deleteInstituteIndex,
        deleteInstituteModalHeader: state.voters.voterScreen.deleteInstituteModalHeader,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterInstitutes));