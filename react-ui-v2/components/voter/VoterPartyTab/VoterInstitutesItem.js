import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';

import Combo from '../../global/Combo';


class VoterInstitutesItem extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        this.tooltip = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };

        this.setDirtyTarget = "elections.voter.political_party.shas_institutes";
    }

    saveInstituteInState() {
		let editingItem = this.props.voterInstitutes[this.props.instituteItemIndex];
		let voterKey = this.props.router.params.voterKey;
		let data = {};
		data.institute_id = editingItem.institute_id;
		data.institute_role_id = editingItem.institute_role_id;
		
		VoterActions.updateExistingVoterInstitute(this.props.dispatch , voterKey , editingItem.id , data , this.setDirtyTarget);
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

            if ( instituteIndex != this.props.instituteItemIndex ) {
                voterInstitutesHash[hashKey] = 1;
            }
        }

        for ( let roleIndex = 0; roleIndex < roleList.length; roleIndex++ ) {
            let hashKey = instituteId + '_' + roleList[roleIndex].id;

            if ( roleList[roleIndex].institute_type_id == typeId && !(hashKey in voterInstitutesHash) ) {
                newRoleList.push(roleList[roleIndex]);
            }
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'roles_list', fieldValue: newRoleList});
    }

    loadRoles(typeId) {
        var roleList = this.props.instituteRoles;
        var newRoleList = [];

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_role_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_role_name', fieldValue: ''});

        newRoleList = roleList.filter(roleItem => roleItem.institute_type_id == typeId);
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'roles_list', fieldValue: newRoleList});
    }

    emptyRoles() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_role_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_role_name', fieldValue: ''});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'roles_list', fieldValue: []});
    }

    loadAllTypes() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_name', fieldValue: ''});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'types_list', fieldValue: this.props.instituteTypes});
    }

    loadGroupTypes(groupId) {
        let typesList = this.props.instituteTypes;
        let newTypesList = [];

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_name', fieldValue: ''});

        newTypesList = typesList.filter(typeItem => typeItem.institute_group_id == groupId);

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'types_list',fieldValue: newTypesList});

        return newTypesList;
    }

    loadAllInstitutes() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_name', fieldValue: ''});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
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

            if ( instituteIndex != this.props.instituteItemIndex ) {
                voterInstitutesHash[hashKey] = 1;
            }
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

            if (  instituteTypeId == this.props.item.institute_type_id ) {
                insertByType = true;
            } else {
                insertByType = false;
            }

            if ( 0 == this.props.item.institute_network_id ) {
                insertByNetwork = true;
            } else {
                if ( instituteNetworkId == this.props.item.institute_network_id ) {
                    insertByNetwork = true;
                } else {
                    insertByNetwork = false;
                }
            }

            if ( 0 == this.props.item.city_id ) {
                insertByCity = true;
            } else {
                if ( cityId == this.props.item.city_id ) {
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

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institutes_list',fieldValue: newInstitutesList});
    }

    loadInstitutes(typeId, typesList, networkId, cityId) {
        var institutesList = this.props.institutes;

        var newInstitutesList = [];
        var typesListHash = [];

        var typeIndex = -1;
        var instituteIndex = -1;

        var typeFromList = false;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_id', fieldValue: 0});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
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

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institutes_list',fieldValue: newInstitutesList});
    }

    getRoleIndex(fieldName, fieldValue) {
        var rolesList = this.props.item.roles_list;
        var roleIndex = -1;

        roleIndex = rolesList.findIndex(roleItem => roleItem[fieldName] == fieldValue);

        return roleIndex;
    }

    roleChange(e) {
        var roleList = this.props.item.roles_list;
        var roleIndex = -1;
        var roleId = 0;
        var roleName = e.target.value;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_role_name', fieldValue: roleName});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == roleName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_role_id', fieldValue: 0});

            this.loadInstitutes(this.props.item.institute_type_id, this.props.item.types_list,
                                this.props.item.institute_network_id,
                                this.props.item.city_id);

            return;
        }

        roleIndex = this.getRoleIndex('name', roleName);
        if ( -1 == roleIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_role_id', fieldValue: 0});

            this.loadInstitutes(this.props.item.institute_type_id, this.props.item.types_list,
                                this.props.item.institute_network_id,
                                this.props.item.city_id);
        } else {
            roleId = roleList[roleIndex].id;

            this.loadInstitutesByRole(roleId);

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
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

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_group_name', fieldValue: groupName});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_group_id', fieldValue: groupId});

        this.loadGroupTypes(groupId);
    }

    getInstituteIndex(fieldName, fieldValue) {
        var institutesList = this.props.item.institutes_list;
        var instituteIndex = -1;

        instituteIndex = institutesList.findIndex(instituteItem => instituteItem[fieldName] == fieldValue);

        return instituteIndex;
    }

    instituteChange(e) {
        var instituteName = e.target.value;
        var instituteIndex = -1;
        var instituteId = 0;
        var institutesList = this.props.item.institutes_list;

        var typeIndex = -1;
        var typesList = this.props.item.types_list;
        var typeId = 0;
        var typeName = '';
        var typeGroupId = 0;

        var cityIndex = -1;
        var citiesList = this.props.cities;

        var networkIndex = -1;
        var networksList = this.props.instituteNetworks;

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == instituteName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_name', fieldValue: ''});

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_id', fieldValue: 0});

            if ( this.props.item.institute_type_id > 0 ) {
                this.loadRoles(this.props.item.institute_type_id);
            }

            return;
        }

        instituteIndex = this.getInstituteIndex('name', instituteName);
        if ( -1 == instituteIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_id', fieldValue: 0});

            //this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                              //   fieldName: 'institute_name', fieldValue: ''});

            if ( this.props.item.institute_type_id > 0 ) {
                this.loadRoles(this.props.item.institute_type_id);
            }
			instituteId = 0;
            //return;
        } else {
            instituteId = institutesList[instituteIndex].id;
        }

        // Update type
        typeIndex = (instituteIndex >=0 ? this.getTypeIndex('id', institutesList[instituteIndex].institute_type_id) : -1);
         if(typeIndex >= 0){
			typeId = typesList[typeIndex].id;
			typeName = typesList[typeIndex].name;
			typeGroupId = typesList[typeIndex].institute_group_id;

			if ( 0 == this.props.item.institute_group_id ) {
				this.updateGroupByInstituteType(typeGroupId)
			}

			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_type_name', fieldValue: typeName});

			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                            fieldName: 'institute_type_id', fieldValue: typeId});

			// update city
			cityIndex = this.getCityIndex('id', institutesList[instituteIndex].city_id);
			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'city_name', fieldValue: citiesList[cityIndex].name});

			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'city_id', fieldValue: citiesList[cityIndex].id});

			// update network
			networkIndex = this.getNetworkIndex('id', institutesList[instituteIndex].institute_network_id);
			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_network_name', fieldValue: networksList[networkIndex].name});

			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_network_id', fieldValue: networksList[networkIndex].id});

			this.loadRolesByInstitute(typeId, instituteId);
			this.loadInstitutes(typeId, [], networksList[networkIndex].id, citiesList[cityIndex].id);
		}
        // Update institute name and id
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_name', fieldValue: instituteName});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
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

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'city_name', fieldValue: cityName});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == cityName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'city_id', fieldValue: 0});

            this.loadInstitutes(this.props.item.institute_type_id, this.props.item.types_list,
                                this.props.item.institute_network_id, 0);

            return;
        }

        cityIndex = this.getCityIndex('name', cityName);
        if ( -1 == cityIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'city_id', fieldValue: 0});

            this.loadInstitutes(this.props.item.institute_type_id, this.props.item.types_list,
                                this.props.item.institute_network_id, 0);
        } else {
            cityId = citiesList[cityIndex].id;
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'city_id', fieldValue: cityId});

            this.loadInstitutes(this.props.item.institute_type_id, this.props.item.types_list,
                                this.props.item.institute_network_id, cityId);
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

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_network_name', fieldValue: networkName});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == networkName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_network_id', fieldValue: 0});

            this.loadInstitutes(this.props.item.institute_type_id, this.props.item.types_list,
                                0, this.props.item.city_id);

            return;
        }

        networkIndex = this.getNetworkIndex('name', networkName);
        if ( -1 == networkIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_network_id', fieldValue: 0});

            this.loadInstitutes(this.props.item.institute_type_id, this.props.item.types_list,
                                0, this.props.item.city_id);
        } else {
            networkId = networkList[networkIndex].id;

            this.loadInstitutes(this.props.item.institute_type_id, this.props.item.types_list,
                                networkId, this.props.item.city_id);

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_network_id', fieldValue: networkId});
        }
    }

    getTypeIndex(fieldName, fieldValue) {
        var typeList = this.props.item.types_list;
        var typeIndex = -1;

        typeIndex = typeList.findIndex(typeItem => typeItem[fieldName] == fieldValue);

        return typeIndex;
    }

    typeChange(e) {
        var typeIndex = -1;
        var typeId = 0;
        var typesList = this.props.item.types_list;
        var newTypesList = this.props.item.types_list;
        var itemDisplayFieldValue = e.target.value;
        var arrOfDispalyElements = [];
        var typeName = '';
        var groupId = this.props.item.institute_group_id;

        if ( 'fullName' == this.typesItemDisplayProperty ) {
            arrOfDispalyElements = itemDisplayFieldValue.split('|');
            typeName = arrOfDispalyElements[1];
        } else {
            typeName = e.target.value;
        }

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == typeName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_name', fieldValue: ''});

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_id', fieldValue: 0});

            this.loadAllInstitutes();

            this.emptyRoles();

            return;
        }

        typeIndex = this.getTypeIndex('name', typeName);
        if ( -1 == typeIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_name', fieldValue: ''});

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_id', fieldValue: 0});

            this.loadAllInstitutes();

            this.emptyRoles();
        } else {
            typeId = typesList[typeIndex].id;
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                fieldName: 'institute_type_id', fieldValue: typeId});

            if ( 0 == groupId ) {
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                     fieldName: 'institute_group_name',
                                     fieldValue: typesList[typeIndex].institute_group_name});

                this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                     fieldName: 'institute_group_id',
                                     fieldValue: typesList[typeIndex].institute_group_id});

                newTypesList = this.loadGroupTypes(typesList[typeIndex].institute_group_id);
            }

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_name', fieldValue: typeName});

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_type_id', fieldValue: typeId});

            this.loadInstitutes(typeId, newTypesList, this.props.item.institute_network_id,
                                this.props.item.city_id);

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

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institute_group_name', fieldValue: groupName});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == groupName.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_group_id', fieldValue: 0});

            this.loadAllTypes();

            this.loadAllInstitutes();

            this.emptyRoles();

            return;
        }

        groupIndex = this.getGroupIndex('name', groupName);
        if ( -1 == groupIndex ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                fieldName: 'institute_group_id', fieldValue: 0});

            this.loadAllTypes();

            this.loadAllInstitutes();
        } else {
            groupId = groupList[groupIndex].id;

            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                                 fieldName: 'institute_group_id', fieldValue: groupId});

            newTypesList = this.loadGroupTypes(groupId);

            this.loadInstitutes(0, newTypesList, this.props.item.institute_network_id, this.props.item.city_id);
        }

        this.emptyRoles();
    }

    showDeleteModalDialog() {
        var instituteModalHeader = '';

        instituteModalHeader = "מחיקת תפקיד ";
        instituteModalHeader += this.props.item.institute_role_name + " ";
        instituteModalHeader += "במוסד ";
        instituteModalHeader += this.props.item.institute_name;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.SHOW_DELETE_MODAL_DIALOG,
                             instituteIndex: this.props.instituteItemIndex, instituteModalHeader: instituteModalHeader});
    }

    disableEditing() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.BACKUP_FROM_STATE});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.DISABLE_EDITING_INSTITUTE});
    }

    initItemRolesList(typeId) {
        var roleIndex = -1;
        var rolesList = this.props.instituteRoles;
        var itemRolesList = [];

        for ( roleIndex = 0; roleIndex < rolesList.length; roleIndex++ ) {
            if ( rolesList[roleIndex].institute_type_id == typeId ) {
                itemRolesList.push(rolesList[roleIndex]);
            }
        }

        return itemRolesList;
    }

    initItemTypesList(groupId) {
        var typesList = this.props.instituteTypes;
        var itemTypesList = [];

        itemTypesList = typesList.filter(typeItem => typeItem.institute_group_id == groupId);

        return itemTypesList;
    }

    initItemInstitutesList(typeId, networkId, cityId) {
        var institutesList = this.props.institutes;
        var itemInstitutesList = [];
        var instituteIndex = -1;

        for ( instituteIndex = 0; instituteIndex < institutesList.length; instituteIndex++ ) {
            let insertByNetwork = false;

            if ( typeId = institutesList[instituteIndex].institute_type_id &&
                    cityId == institutesList[instituteIndex].city_id ) {
                if ( 0 == networkId ) {
                    insertByNetwork = true;
                } else {
                    if (networkId == institutesList[instituteIndex].institute_network_id) {
                        itemInstitutesList.push(institutesList[instituteIndex]);
                    }
                }
            }
        }

        return itemInstitutesList;
    }

    enableEditing() {
        var typesList = this.initItemTypesList(this.props.item.institute_group_id);
        var rolesList = this.initItemRolesList(this.props.item.institute_type_id);
        var institutesList = this.initItemInstitutesList(this.props.item.institute_type_id,
                                                         this.props.item.institute_network_id,
                                                         this.props.item.city_id);


        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.ENABLE_EDITING_INSTITUTE,
                             instituteIndex: this.props.instituteItemIndex});


        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'types_list', fieldValue: typesList});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'roles_list', fieldValue: rolesList});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE,
                             fieldName: 'institutes_list', fieldValue: institutesList});

    }

    validateRole() {
        var institute_role_name = this.props.item.institute_role_name;
        var institute_role_id = this.props.item.institute_role_id;

        if ( 0 ==  institute_role_name.length || 0 == institute_role_id) {
            return false;
        } else {
            return true;
        }
    }

    validateInstitute() {
        var institute_name = this.props.item.institute_name;
        var institute_id = this.props.item.institute_id;

        if ( 0 ==  institute_name.length || 0 == institute_id) {
            return false;
        } else {
            return true;
        }
    }

    validateCity() {
        var cityName = this.props.item.city_name;
        var cityId = this.props.item.city_id;

        if ( 0 ==  cityName.length || 0 == cityId) {
            return false;
        } else {
            return true;
        }
    }

    validateNetwork() {
        var institute_network_name = this.props.item.institute_network_name;
        var institute_network_id = this.props.item.institute_network_id;

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
        var institute_type_name = this.props.item.institute_type_name;
        var institute_type_id = this.props.item.institute_type_id;

        if ( 0 ==  institute_type_name.length || 0 == institute_type_id) {
            return false;
        } else {
            return true;
        }
    }

    validateGroup() {
        var institute_group_name = this.props.item.institute_group_name;
        var institute_group_id = this.props.item.institute_group_id;

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

        this.allowEditInstitute = false;
        this.allowDeleteInstitute = false;
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.allowEditInstitute = true;
            this.allowDeleteInstitute = true;
        }

        if (this.props.currentUser.permissions['elections.voter.political_party.shas_institutes.edit'] == true) {
            this.allowEditInstitute = true;
        }

        if (this.props.currentUser.permissions['elections.voter.political_party.shas_institutes.delete'] == true) {
            this.allowDeleteInstitute = true;
        }
    }

    renderEditingModeButtons() {
        return(
            <td width="7%">
                <span className="pull-left edit-buttons">
                    <button className="btn btn-success btn-xs"
                            onClick={this.saveInstituteInState.bind(this)}
                             title={this.tooltip.saveTitle}
                            disabled={!this.validInputs || this.props.savingVoterData}>
                        <i className="fa fa-floppy-o"/>
                    </button>
                    {'\u00A0'}
                    <button className="btn btn-danger btn-xs"
                            title={this.tooltip.cancelTitle}
                            onClick={this.disableEditing.bind (this)}>
                        <i className="fa fa-times"/>
                    </button>
                </span>
            </td>
        );
    }

    renderEditingInstitute() {
        if ( 0 == this.props.item.institute_group_id ) {
            this.typesItemDisplayProperty = 'fullName';
        } else {
            this.typesItemDisplayProperty = 'name';
        }

        return (
            <tr>
                <td>
                    <Combo items={this.props.instituteGroups} itemIdProperty="id" itemDisplayProperty='name'
                           maxDisplayItems={10}
                           inputStyle={this.groupStyle} value={this.props.item.institute_group_name}
                           className="form-combo-table"
                           onChange={this.groupChange.bind(this)}/>
                </td>
                <td>
                    <Combo items={this.props.item.types_list} itemIdProperty="id"
                           itemDisplayProperty={this.typesItemDisplayProperty}
                           maxDisplayItems={10} inputStyle={this.typeStyle}
                           value={this.props.item.institute_type_name}
                           className="form-combo-table"
                           onChange={this.typeChange.bind(this)}/>
                </td>
                <td>
                    <Combo items={this.props.instituteNetworks} itemIdProperty="id"
                           itemDisplayProperty='name'
                           maxDisplayItems={10} inputStyle={this.networkStyle}
                           value={this.props.item.institute_network_name}
                           className="form-combo-table"
                           onChange={this.networkChange.bind(this)}/>
                </td>
                <td>
                    <Combo id="inputCity-ver" items={this.props.cities}
                           itemIdProperty="id" itemDisplayProperty='name'
                           maxDisplayItems={10} inputStyle={this.cityStyle}
                           value={this.props.item.city_name}
                           onChange={this.cityChange.bind(this)}/>
                </td>
                <td>
                    <Combo items={this.props.item.institutes_list} itemIdProperty="id"
                           itemDisplayProperty='name'
                           maxDisplayItems={10} inputStyle={this.instituteStyle}
                           value={this.props.item.institute_name}
                           className="form-combo-table"
                           onChange={this.instituteChange.bind(this)}/>
                </td>
                <td>
                    <Combo items={this.props.item.roles_list} itemIdProperty="id"
                           itemDisplayProperty='name'
                           maxDisplayItems={10} inputStyle={this.roleStyle}
                           value={this.props.item.institute_role_name}
                           className="form-combo-table"
                           onChange={this.roleChange.bind(this)}/>
                </td>
                {this.renderEditingModeButtons()}
            </tr>
        );
    }

    renderNonEditingModeButtons() {
        // If another row is being edited don't
        // display buttons
        if ( !this.props.enable_editing ) {
            return <td>{'\u00A0'}</td>;
        }

        if ( this.allowEditInstitute && this.allowDeleteInstitute ) {
            return (
                <td>
                    <span className="pull-left edit-buttons">
                        <button type="button" className="btn btn-success btn-xs" title={this.tooltip.editTitle}
                                onClick={this.enableEditing.bind(this)}>
                            <i className="fa fa-pencil-square-o"/>
                        </button>
                        {'\u00A0'}
                        <button type="button" className="btn btn-danger btn-xs" title={this.tooltip.deleteTitle}
                                onClick={this.showDeleteModalDialog.bind(this)}>
                            <i className="fa fa-trash-o"/>
                        </button>
                    </span>
                </td>
            );
        } else if ( this.allowEditInstitute ) {
            return (
                <td>
                    <span className="pull-left edit-buttons">
                        <button type="button" className="btn btn-success btn-xs" title={this.tooltip.editTitle}
                                onClick={this.enableEditing.bind(this)}>
                            <i className="fa fa-pencil-square-o"/>
                        </button>
                    </span>
                </td>
            );
        } else if ( this.allowDeleteInstitute ) {
            return (
                <td>
                    <span className="pull-left edit-buttons">
                        <button type="button" className="btn btn-danger btn-xs" title={this.tooltip.deleteTitle}
                                onClick={this.showDeleteModalDialog.bind(this)}>
                            <i className="fa fa-trash-o"/>
                        </button>
                    </span>
                </td>
            );
        } else {
            return <td>{'\u00A0'}</td>;
        }
    }

    renderNonEditingInstitute() {
        return (
            <tr>
                <td>{this.props.item.institute_group_name}</td>
                <td>{this.props.item.institute_type_name}</td>
                <td>{this.props.item.institute_network_name}</td>
                <td>{this.props.item.city_name}</td>
                <td>{this.props.item.institute_name}</td>
                <td>{this.props.item.institute_role_name}</td>
                {this.renderNonEditingModeButtons()}
            </tr>
        );
    }

    render() {
        this.initVariables();

        this.checkPermissions();

        this.validateVariables();

        let editing_mode = this.props.editing_mode;

        if ( !this.allowEditInstitute && !this.allowDeleteInstitute ) {
            return this.renderNonEditingInstitute();
        } else {
            if ( editing_mode ) {
                return this.renderEditingInstitute();
            } else {
                return this.renderNonEditingInstitute();
            }
        }
    }
}


function mapStateToProps(state) {
    return {
        instituteGroups: state.voters.voterScreen.instituteGroups,
        instituteTypes: state.voters.voterScreen.instituteTypes,
        instituteRoles: state.voters.voterScreen.instituteRoles,
        instituteNetworks: state.voters.voterScreen.instituteNetworks,
        institutes: state.voters.voterScreen.institutes,
        cities: state.system.cities,
        voterInstitutes: state.voters.voterScreen.voterInstitutes,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterInstitutesItem));