import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import * as VoterActions from 'actions/VoterActions';
import {validatePhoneNumber} from 'libs/globalFunctions'

import Combo from 'components/global/Combo';
import ModalWindow from 'components/global/ModalWindow';
import MunicipalMayorCandidateRow from './MunicipalMayorCandidateRow';
import MunicipalCouncilCandidateRow from './MunicipalCouncilCandidateRow';


class SecondSubTab extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
        this.state = {
            isReturned: false,
            shouldRedirectToSearchVoter: false,
            phoneIsValid:false
        };
    }

    componentDidUpdate() {
        if (!this.state.isReturned) {
            if (this.props.selectedVoterForRedirect.id != undefined) {
                this.setState({ isReturned: true });

                let data = {
                    city: this.props.selectedVoterForRedirect.cityName,
                    first_name: this.props.selectedVoterForRedirect.firstName,
                    id: this.props.selectedVoterForRedirect.id,
                    key: this.props.selectedVoterForRedirect.voters_key,
                    last_name: this.props.selectedVoterForRedirect.lastName,
                    phones: this.props.selectedVoterForRedirect.phones
                };

                if (this.props.isAddingMayorCandidate) {
                    this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'elections.cities.parameters_candidates.candidates.mayor.add' });
                    this.props.dispatch({
                        type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_MAYOR_CANDIDATE_SCREEN_ITEM_CHANGE,
                        fieldName: 'personalIdentity', fieldValue: this.props.selectedVoterForRedirect.personalIdentity
                    });
                } else if (this.props.isAddingCouncilCandidate) {
                    this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'elections.cities.parameters_candidates.candidates.council.add' });
                    this.props.dispatch({
                        type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_COUNCIL_CANDIDATE_SCREEN_ITEM_CHANGE,
                        fieldName: 'personalIdentity', fieldValue: this.props.selectedVoterForRedirect.personalIdentity
                    });
                }

                this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_FOUND_VOTER_DATA, data });
                this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT });
            }
        }

        if (this.state.shouldRedirectToSearchVoter) {
            this.redirectToSearchVoterScreen();
            this.setState({ shouldRedirectToSearchVoter: false, isReturned: false });
        }
    }

    redirectToSearchVoterScreen() {
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT });
        var returnUrl = 'elections/cities/' + this.props.router.params.cityKey;

        var data = {
            returnUrl: returnUrl,
            returnButtonText: "חזרה לניהול העיר"
        };

        // This dispatch changes the parameters in data object
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_REDIRECT_TO_SEARCH, data });
        this.props.router.push('elections/voters/search');
    }

	/*
	function that initializes constant variables 
	*/
    initConstants() {
        this.mayorCandidatesListHeader = <tr>
            <th className="status-data" width='5%'></th>
            <th width='15%'>תעודת זהות</th>
            <th width='15%'>שם</th>
            <th width='12%'>נייד</th>
            <th width='15%'>מטעם מפלגת</th>
            <th width='10%'>נציג ש"ס</th>
            <th width='13%'>עיר</th>
            <th width='10%'>מועדף</th>
            <th className="status-data"></th>
            <th className="status-data"></th>
        </tr>;

        this.councilCandidatesListHeader = <tr>
            <th></th>
            <th>תעודת זהות</th>
            <th>שם</th>
            <th>נייד</th>
            <th>מטעם מפלגת</th>
            <th>נציג ש"ס</th>
            <th>עיר</th>
            <th></th>
            <th></th>
        </tr>;
    }

    /*
        clean data of new mayor candidate data row + foundVoter data
    */
    cleanNewMayorCandidateRowData() {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_FOUND_VOTER_DATA, data: [] });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_MAYOR_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'personalIdentity', fieldValue: '' });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_MAYOR_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'shas', fieldValue: 0 });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_MAYOR_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'favorite', fieldValue: 0 });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_MAYOR_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'selectedParty', fieldValue: { selectedValue: '', selectedItem: null } });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_MAYOR_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'selectedPhone', fieldValue: { selectedValue: '', selectedItem: null } });
    }

	/*
        clean data of new council candidate data row + foundVoter data
    */
    cleanNewCouncilCandidateRowData() {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_FOUND_VOTER_DATA, data: [] });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_COUNCIL_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'personalIdentity', fieldValue: '' });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_COUNCIL_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'shas', fieldValue: 0 });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_COUNCIL_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'favorite', fieldValue: 0 });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_COUNCIL_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'selectedParty', fieldValue: { selectedValue: '', selectedItem: null } });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_COUNCIL_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'selectedPhone', fieldValue: { selectedValue: '', selectedItem: null } });
    }

    /*
       function that shows/hide new row of mayor-candidate

       @param show
    */
    setAddingMayorCandidateRow(show) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_ADDING_NEW_MAYOR_CANDIDATE_ROW, show });

        if (!show) {
            this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'elections.cities.parameters_candidates.candidates.mayor.add' });
            this.cleanNewMayorCandidateRowData();
        }
        else {
            this.setState({phoneIsValid:true})
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'elections.cities.parameters_candidates.candidates.mayor.add' });
        }
    }

    /*
       function that shows/hide new row of council-candidate

       @param show
    */
    setAddingCouncilCandidateRow(show) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_ADDING_NEW_COUNCIL_CANDIDATE_ROW, show });
        if (!show) {
            this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'elections.cities.parameters_candidates.candidates.council.add' });
            this.cleanNewCouncilCandidateRowData();
        }
        else {
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'elections.cities.parameters_candidates.candidates.council.add' });
        }
    }

    /*Handle key press "enter" at personal identity field - in new mayor candidate or new council candidate  */
    handleKeyPress(event) {
        if (event.charCode == 13) { /*if user pressed enter*/
            this.doSearchVoterAction();
        }
    }

    /*
       new mayor candidate row -  handle identity field change  
    */
    newMayorCandidateRowIdentityChange(e) {
        if (!new RegExp('^[0-9]*$').test(e.target.value)) { return; } // allow only numbers in the field

        if (this.props.foundVoter.first_name) {
            this.cleanNewMayorCandidateRowData();
        }
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_MAYOR_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'personalIdentity', fieldValue: e.target.value });
    }

	/*
       new council candidate row -  handle identity field change  
    */
    newCouncilCandidateRowIdentityChange(e) {
        if (!new RegExp('^[0-9]*$').test(e.target.value)) { return; } // allow only numbers in the field

        if (this.props.foundVoter.first_name) {
            this.cleanNewCouncilCandidateRowData();
        }
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_COUNCIL_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName: 'personalIdentity', fieldValue: e.target.value });

    }


    /*
       new mayor candidate row -  handle combo field change by fieldName

       @param fieldName  
    */
    newMayorCandidateRowComboItemChange(fieldName, e) {
        let selectedItem = e.target.selectedItem;
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_MAYOR_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName, fieldValue: { selectedValue: e.target.value, selectedItem } });

        if (fieldName == 'selectedParty') {
            this.newMayorCandidateRowBooleanItemChange('shas', selectedItem.shas);
        }
        if(fieldName=='selectedPhone'){
            this.checkPhoneNumber(e.target.value,selectedItem)
        }
    }

	/*
       new council candidate row -  handle combo field change by fieldName
       @param fieldName  
    */
    newCouncilCandidateRowComboItemChange(fieldName, e) {
        let selectedItem = e.target.selectedItem;
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_COUNCIL_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName, fieldValue: { selectedValue: e.target.value, selectedItem } });

        if (fieldName == 'selectedParty') {
            this.newCouncilCandidateRowBooleanItemChange('shas', selectedItem.shas);
        }
        if(fieldName == 'selectedPhone'){
            this.checkPhoneNumber(e.target.value,selectedItem)
        }
    }
    checkPhoneNumber(phoneNumber,selectedItem){
    let phoneIsValid=true;
    if(selectedItem){
        phoneIsValid = validatePhoneNumber(selectedItem.phone_number);
    }else if(phoneNumber){
        phoneIsValid = validatePhoneNumber(phoneNumber);
    }
    // console.log(phoneNumber,phoneIsValid);
    this.setState({phoneIsValid});

    }
    /*
       new mayor candidate row -  handle boolean  field change by fieldName

       @param fieledName
       @param fieledValue - 1 or 0    
    */
    newMayorCandidateRowBooleanItemChange(fieldName, fieldValue, e) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_MAYOR_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName, fieldValue });
    }

	/*
       new council candidate row -  handle boolean  field change by fieldName

       @param fieledName
       @param fieledValue - 1 or 0    
    */
    newCouncilCandidateRowBooleanItemChange(fieldName, fieldValue, e) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_COUNCIL_CANDIDATE_SCREEN_ITEM_CHANGE, fieldName, fieldValue });
    }

    /*
       Function that searches voter by identity number
    */
    doSearchVoterAction() {
        if (this.props.isAddingMayorCandidate) { // search for adding new mayor candidate
            if (this.props.newMayorCandidateScreen.personalIdentity.length) {
                ElectionsActions.searchVoterByIdentity(this.props.dispatch, this.props.newMayorCandidateScreen.personalIdentity);
            }
        }
        else if (this.props.newCouncilCandidateScreen) { // search for adding new council candidate
            if (this.props.newCouncilCandidateScreen.personalIdentity.length) {
                ElectionsActions.searchVoterByIdentity(this.props.dispatch, this.props.newCouncilCandidateScreen.personalIdentity);
            }
        }
    }

    searchVoter() {
        if (this.props.isAddingMayorCandidate) {
            this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'elections.cities.parameters_candidates.candidates.mayor.add' });
        } else if (this.props.isAddingCouncilCandidate) {
            this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'elections.cities.parameters_candidates.candidates.council.add' });
        }

        this.setState({ shouldRedirectToSearchVoter: true });
    }

    /*
         set confirm delete mayor candidate row :
    */
    confirmDeleteMayorRow(rowFieldName, rowIndex) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_CANDIDATE_ROW_CONFIRM_DELETE, rowFieldName, rowIndex });
    }

	/*
	       set candidate row as editing
	
	       @param candidateTypeArray
		   @param rowIndex
		   @param isEditing
	*/
    setCandidateRowEditing(candidateTypeArray, rowIndex, isEditing) {
        if (isEditing) {
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'elections.cities.parameters_candidates.candidates.mayor.edit' });
            //save old values to restore in case of 'cancel' button :
            let self = this;
            this.setState({ oldPhone: self.props.cityMunicipalElectionsCampaignsData[candidateTypeArray][rowIndex].voter_phone_number });
            this.setState({ oldParty: self.props.cityMunicipalElectionsCampaignsData[candidateTypeArray][rowIndex].party_letters });
            this.setState({ oldShas: self.props.cityMunicipalElectionsCampaignsData[candidateTypeArray][rowIndex].shas });
            this.setState({ oldFavorite: self.props.cityMunicipalElectionsCampaignsData[candidateTypeArray][rowIndex].favorite });
        }
        else {
            this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'elections.cities.parameters_candidates.candidates.mayor.edit' });
            //cancel editing - restore original values : 
            this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.EDITING_CANDIDATE_ROW_ITEM_CHANGE, candidateTypeArray, rowIndex, fieldName: 'voter_phone_number', fieldValue: this.state.oldPhone });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.EDITING_CANDIDATE_ROW_ITEM_CHANGE, candidateTypeArray, rowIndex, fieldName: 'party_letters', fieldValue: this.state.oldParty });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.EDITING_CANDIDATE_ROW_ITEM_CHANGE, candidateTypeArray, rowIndex, fieldName: 'shas', fieldValue: this.state.oldShas });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.EDITING_CANDIDATE_ROW_ITEM_CHANGE, candidateTypeArray, rowIndex, fieldName: 'favorite', fieldValue: this.state.oldFavorite });
        }
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_CANDIDATE_ROW_EDITING, candidateTypeArray, rowIndex, isEditing });
    }

    /*
      do real add new  candidate row by type via api

      @param candidateType
    */
    addNewCandidateRow(candidateType) {
        let requestData = {};
        requestData.candidate_type = candidateType;
        requestData.voter_key = this.props.foundVoter.key;
        if (candidateType == 'mayor') {
            requestData.party_key = this.props.newMayorCandidateScreen.selectedParty.selectedItem.key;
            requestData.shas = this.props.newMayorCandidateScreen.shas;
            requestData.favorite = this.props.newMayorCandidateScreen.favorite;
            if (this.props.newMayorCandidateScreen.selectedPhone.selectedItem) {
                requestData.phone_key = this.props.newMayorCandidateScreen.selectedPhone.selectedItem.key;
            }else{
                requestData.new_phone_number = this.props.newMayorCandidateScreen.selectedPhone.selectedValue;
            }
        }
        else if (candidateType == 'council') {
            requestData.party_key = this.props.newCouncilCandidateScreen.selectedParty.selectedItem.key;
            requestData.shas = this.props.newCouncilCandidateScreen.shas;
            if (this.props.newCouncilCandidateScreen.selectedPhone.selectedItem) {
                requestData.phone_key = this.props.newCouncilCandidateScreen.selectedPhone.selectedItem.key;
            }else{
                requestData.new_phone_number = this.props.newCouncilCandidateScreen.selectedPhone.selectedValue;
            }
        }

        ElectionsActions.addCandidateByType(this.props.dispatch, this.props.router.params.cityKey, this.props.selectedCampaign.selectedItem.key, requestData);
    }

    /*
      do real delete  candidate row by type  via api

      @param candidateType
    */
    doRealDeleteOfCandidate(candidateType) {
        let requestData = {};
        requestData.candidate_type = candidateType;
        if (candidateType == 'mayor') {
            ElectionsActions.deleteCandidateByType(this.props.dispatch, this.props.router.params.cityKey, this.props.selectedCampaign.selectedItem.key, this.props.cityMunicipalElectionsCampaignsData.mayor_candidates[this.props.deleteMayorCandidateIndex].key, requestData);
        }
        else if (candidateType == 'council') {
            ElectionsActions.deleteCandidateByType(this.props.dispatch, this.props.router.params.cityKey, this.props.selectedCampaign.selectedItem.key, this.props.cityMunicipalElectionsCampaignsData.council_candidates[this.props.deleteCouncilCandidateIndex].key, requestData);
        }
    }

    /*
	   this function checks if selected combo value is valid by field name to verifyFieldName
	   
	   @param comboList
	   @param comboValueName
	   @param verifyFieldName
	*/
    isValidComboValue(comboList, comboValueName, verifyFieldName, allowEmptyValue = false) {
        let result = false;
        if (allowEmptyValue && (comboValueName == null || comboValueName == undefined || comboValueName.split(' ').join('') == '')) {

            return true;

        }
        for (let i = 0; i < comboList.length; i++) {
            if (comboList[i][verifyFieldName] == comboValueName) {
                result = true;
                break;
            }
        }
        return result;
    }

	/*
		  do real edit to candidate row  : 
		
		   @param candidateTypeArray
		   @param rowIndex
		   @param isValidated
    */
    doRealEditRow(candidateTypeArray, rowIndex, isValidated) {
        if (isValidated) {

            let theEditedObject = this.props.cityMunicipalElectionsCampaignsData[candidateTypeArray][rowIndex];

            let requestData = {};
            requestData.candidate_type = (candidateTypeArray == 'mayor_candidates' ? 'mayor' : 'council');
            requestData.shas = theEditedObject.shas;
            if (requestData.candidate_type == 'mayor') {
                requestData.favorite = theEditedObject.favorite;
            }
            if (theEditedObject.party_letters != '') {
                for (let i = 0; i < this.currentParties.length; i++) {
                    if (this.currentParties[i].letters == theEditedObject.party_letters) {
                        requestData.party_key = this.currentParties[i].key;
                        break;
                    }
                }
            }
            if (theEditedObject.voter_phone_number && theEditedObject.voter_phone_number.split(' ').join('') != '') {
                for (let i = 0; i < theEditedObject.phones.length; i++) {
                    if (theEditedObject.phones[i].phone_number == theEditedObject.voter_phone_number) {
                        requestData.phone_key = theEditedObject.phones[i].key;
                        break;
                    }
                }
            }
            ElectionsActions.editCandidateByType(this.props.dispatch, this.props.router.params.cityKey, this.props.selectedCampaign.selectedItem.key, theEditedObject.key, requestData, candidateTypeArray, rowIndex);
        }
        else {
            //not validate - will do nothing.
        }
    }

    /*
		   handle change mayor/council candidate row editing-item value  : 
		
		   @param candidateTypeArray
		   @param rowIndex
		   @param fieldName
    */
    editCandidateRowItemChange(candidateTypeArray, rowIndex, fieldName, e) {
        if (fieldName == 'shas') {
            this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.EDITING_CANDIDATE_ROW_ITEM_CHANGE, candidateTypeArray, rowIndex, fieldName, fieldValue: e.target.checked ? 1 : 0 });
        }
        else {
            this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.EDITING_CANDIDATE_ROW_ITEM_CHANGE, candidateTypeArray, rowIndex, fieldName, fieldValue: e.target.value });
        }
    }

	/*
	Handle mayor candidate row item change
	
           @param candidateTypeArray
		   @param rowIndex
    */
    editMayorCandidateFavoriteItemChange(rowIndex) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.EDITING_CANDIDATE_ROW_ITEM_CHANGE, candidateTypeArray: 'mayor_candidates', rowIndex, fieldName: 'favorite', fieldValue: (this.props.cityMunicipalElectionsCampaignsData.mayor_candidates[rowIndex].favorite == 1 ? 0 : 1) });
    }

    /*
	Sets second table (council candidates) to be sorteable
	
	@param isSorting - true/false
	*/
    setSortingCouncilCandidates(isSorting) {
 
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_COUNCIL_CANDIDATE_TABLE_SORTING, isSorting });
        if (!isSorting) {
            this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'MayorCandidateSort' });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.DND_CANDIDATE_ROW_REVERT_TO_ORIGINAL });
        }
        else {
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'MayorCandidateSort' });
        }
    }

	/*
	Does real update to council candidates orders - it sends ordered list to api : 
	*/
    updateAllCandidatesOrders() {
        let keysOrderedArray = [];
        for (let i = 0; i < this.props.dndItems.length; i++) {
            keysOrderedArray.push(this.props.dndItems[i].key);
        }
        ElectionsActions.editCandidatesOrders(this.props.dispatch, this.props.router.params.cityKey, this.props.selectedCampaign.selectedItem.key, JSON.stringify(keysOrderedArray));
        this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'MayorCandidateSort' });
    }

    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

	componentWillMount(){
		  this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.LOAD_COUNCIL_CANDIDATES_DND_SORT_ITEMS, data: this.props.cityMunicipalElectionsCampaignsData.council_candidates }); 
	}

    componentWillReceiveProps(nextProps) {
 
        if ((this.props.cityMunicipalElectionsCampaignsData.council_candidates.length == 0) && (nextProps.cityMunicipalElectionsCampaignsData.council_candidates.length > 0)) {
            
		   this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.LOAD_COUNCIL_CANDIDATES_DND_SORT_ITEMS, data: nextProps.cityMunicipalElectionsCampaignsData.council_candidates });
        }
    }

    //move items in hover - only if needed
    move(fromItem, toItem, before) {
        if (fromItem.key != toItem.key) {
            var i = 0;
            for (i = 0; i < this.props.dndItems.length; i++) {
                if (this.props.dndItems[i].key == fromItem.key) break;
            }
            if (before) {
                if ((this.props.dndItems.length == i + 1) || ((this.props.dndItems.length > i + 1) && (this.props.dndItems[i + 1].key != toItem.key))) {
                    this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.DND_SORT_CANDIDATE_ROW, fromItem: fromItem, toItem: toItem, before: before });
                }
            } else {
                if ((i == 0) || ((i > 0) && (this.props.dndItems[i - 1].key != toItem.key))) {
                    this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.DND_SORT_CANDIDATE_ROW, fromItem: fromItem, toItem: toItem, before: before });
                }
            }
        }
    }

    //set drop callback - maybe send data to server
    drop() {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.DND_SORT_CANDIDATE_ROW_DROP });
    }

    //return items to original state if not dropped on another item
    revertToOriginal() {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.DND_CANDIDATE_ROW_REVERT_TO_ORIGINAL });
    }
	
	
    /*
       Sub function of initDynamicVariables - inits municipal candidates items
    */
    initDynamicMunicipalCandidateItems() {
        let self = this;
        this.addNewMayorCandidateItem = null;
        if (!this.props.isAddingMayorCandidate && !this.props.isCouncilCandidateRowInDnDSort && !this.props.isAddingCouncilCandidate && this.editingCount == 0) {
            if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates.candidates.mayor.add'] == true) {
                this.addNewMayorCandidateItem = <div className="add-item-line">
                    <a title="הוסף מועמד" style={{ cursor: 'pointer', fontWeight: '600' }} onClick={this.setAddingMayorCandidateRow.bind(this, true)}><span>+</span>הוסף מועמד</a>
                </div>;
            }
        }
        this.mayorCandidatesRowsItem = null;
        this.mayorCandidatesAddNewRowItem = null;

        this.confirmDeleteCandidateItem = null;
        if (this.props.deleteMayorCandidateIndex >= 0) {
            this.confirmDeleteCandidateItem = <ModalWindow show={true} buttonOk={this.doRealDeleteOfCandidate.bind(this, 'mayor')} buttonCancel={this.confirmDeleteMayorRow.bind(this, 'deleteMayorCandidateIndex', -1)} buttonX={this.confirmDeleteMayorRow.bind(this, 'deleteMayorCandidateIndex', -1)} title={"אישור מחיקה"} style={{ zIndex: '9001' }}>
                <div>{"למחוק מועמד?"}</div>
            </ModalWindow>;

        }
        if (this.props.cityMunicipalElectionsCampaignsData && this.props.cityMunicipalElectionsCampaignsData.mayor_candidates) {
		
            this.mayorCandidatesCount = this.props.cityMunicipalElectionsCampaignsData.mayor_candidates.length;
			
            this.mayorCandidatesRowsItem = this.props.cityMunicipalElectionsCampaignsData.mayor_candidates.map(function (item, index) {
                    return <MunicipalMayorCandidateRow index={index} item={item} key={index}
                        isValidComboValue={self.isValidComboValue.bind(self)}
                        currentParties={self.currentParties}
                        isAuthorizedEdit={(self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.parameters_candidates.candidates.mayor.edit'] == true)}
                        isAuthorizedDelete={(self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.parameters_candidates.candidates.mayor.delete'] == true)}
                        editingCount={self.editingCount} isAddingMayorCandidate={self.props.isAddingMayorCandidate}
                        isAddingCouncilCandidate={self.props.isAddingCouncilCandidate}
                        isOrderingCouncilCandidate={self.props.isCouncilCandidateRowInDnDSort}
                        setCandidateRowEditing={self.setCandidateRowEditing.bind(self)}
                        confirmDeleteMayorRow={self.confirmDeleteMayorRow.bind(self, 'deleteMayorCandidateIndex', index)}
                        editCandidateRowItemChange={self.editCandidateRowItemChange.bind(self)}
                        doRealEditRow={self.doRealEditRow.bind(self)}
                        editMayorCandidateFavoriteItemChange={self.editMayorCandidateFavoriteItemChange.bind(self)} 
                    />;
                });
        }

        if (this.props.isAddingMayorCandidate) {
			let isWrongPersonalIdentity =   !(this.props.foundVoter.first_name);
        
            this.isValidatedMayorCandidateRow = this.props.newMayorCandidateScreen.selectedParty.selectedItem && this.props.foundVoter.first_name && this.state.phoneIsValid;
            this.mayorCandidatesAddNewRowItem = <tr className="edit-save-row">
                <td><span className="num-utem">{this.mayorCandidatesCount + 1}</span>.</td>
                <td>
                    <div className="row">
                        <div className='col-md-7 text-left no-padding'><input type="text" maxLength={9} value={this.props.newMayorCandidateScreen.personalIdentity} onChange={this.newMayorCandidateRowIdentityChange.bind(this)} className="form-control" onKeyPress={this.handleKeyPress.bind(this)} style={{ borderColor: (this.props.foundVoter.first_name ? '#ccc' : '#ff0000') }} /></div><div className='col-sm-1 text-right' style={{ paddingTop: '4px', cursor: 'pointer' }}><img src={window.Laravel.baseAppURL + 'Images/ico-search-blue.svg'} onClick={this.searchVoter.bind(this)} /></div>
                    </div>
                </td>
                <td>
                    {this.fullName}
                </td>
                <td>
                    <Combo disabled={isWrongPersonalIdentity} items={this.currentPhones} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='phone_number' value={this.props.newMayorCandidateScreen.selectedPhone.selectedValue} onChange={this.newMayorCandidateRowComboItemChange.bind(this, 'selectedPhone')} inputStyle={{ borderColor: (this.state.phoneIsValid ? '#ccc' : '#ff0000') }} />
                </td>
                <td>
                    <Combo disabled={isWrongPersonalIdentity} items={this.currentParties} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='letters' value={this.props.newMayorCandidateScreen.selectedParty.selectedValue} onChange={this.newMayorCandidateRowComboItemChange.bind(this, 'selectedParty')} inputStyle={{ borderColor: (this.props.newMayorCandidateScreen.selectedParty.selectedItem ? '#ccc' : '#ff0000') }} />
                </td>
                <td>
                    <input type="checkbox" disabled={isWrongPersonalIdentity} checked={this.props.newMayorCandidateScreen.shas == 1} onChange={this.newMayorCandidateRowBooleanItemChange.bind(this, 'shas', (this.props.newMayorCandidateScreen.shas == 1 ? 0 : 1))} />
                </td>
                <td>
                    {this.props.foundVoter.city ? this.props.foundVoter.city : ''}
                </td>
                <td><a title="שמור למועדפים" style={{ cursor: 'pointer' }}  className="favorites icon-ster-dis" onClick={isWrongPersonalIdentity?null : this.newMayorCandidateRowBooleanItemChange.bind(this, 'favorite', (this.props.newMayorCandidateScreen.favorite == 1 ? 0 : 1))}><img src={window.Laravel.baseURL + "Images/" + (this.props.newMayorCandidateScreen.favorite == 1 ? "star" : "star-dis") + ".png"} /></a></td>
                <td className="status-data">
                    <button type="button" className="btn btn-success  btn-xs" disabled={!this.isValidatedMayorCandidateRow} onClick={this.addNewCandidateRow.bind(this, 'mayor')} >
                        <i className="fa fa-pencil-square-o"></i>
                    </button>
                </td>
                <td className="status-data">
                    <button type="button" className="btn btn-danger  btn-xs" onClick={this.setAddingMayorCandidateRow.bind(this, false)} >
                        <i className="fa fa-times"></i>
                    </button>
                </td>
            </tr>;
        }


        this.mayorCandidateCollapseItem = null;

        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates.candidates.mayor'] == true) {
            this.mayorCandidateCollapseItem = <div className="collapse-all-content dividing-line" style={{ borderBottom: '1px solid #E5E5E5', paddingBottom: '25px', marginBottom: '15px' }}><div>
                <a title="מועמדים לראשות העיר" data-toggle="collapse" href="#Tab2-collapse-tabs-1" aria-expanded="true">
                    <div className="panelCollapse">
                        <div className="collapseArrow closed" style={{ marginRight: '0' }}></div>
                        <div className="collapseArrow open" style={{ marginRight: '0' }}></div>
                        <div className="collapseTitle"  >
                            <span>מועמדים לראשות העיר</span>
                        </div>
                    </div>
                </a>
                <br />
                <div id="Tab2-collapse-tabs-1" className="collapse in" aria-expanded="true" >
                    <table className="table table-striped tableNoMarginB tableTight table-scroll">
                        <thead>
                            {this.mayorCandidatesListHeader}
                        </thead>
                        <tbody>
                            {this.mayorCandidatesRowsItem}
                            {this.mayorCandidatesAddNewRowItem}
                        </tbody>
                    </table>

                    {this.addNewMayorCandidateItem}
                </div>
            </div></div>;
        }
    }

    /*
       Sub function of initDynamicVariables - inits council candidates items
    */
    initDynamicCouncilCandidateItems() {
        let self = this;
        this.changeOrderItem = null;
        if (!this.props.isAddingMayorCandidate && !this.props.isAddingCouncilCandidate && this.editingCount == 0) {
            if (!this.props.isCouncilCandidateRowInDnDSort) {
                this.changeOrderItem = <button title="שינוי סדר" type="submit" className="btn btn-default saveChanges open-draggable-btn"
                    style={{ backgroundColor: '#498BB6' }} onClick={this.setSortingCouncilCandidates.bind(this, true)}
                    disabled={(this.props.cityMunicipalElectionsCampaignsData.council_candidates.length < 2) ? true : false}>שינוי סדר</button>
            }
            else {
                this.changeOrderItem = <div>
                    <button title="בטל" type="submit" className="btn btn-default saveChanges btn-secondary closed-draggable-btn" style={{ backgroundColor: 'transparent', borderColor: '#498BB6', color: '#498BB6' }} onClick={this.setSortingCouncilCandidates.bind(this, false)}>בטל</button>
                    <button title="שמור" type="submit" className="item-space btn btn-default saveChanges closed-draggable-btn" style={{ backgroundColor: '#498BB6' }} onClick={this.updateAllCandidatesOrders.bind(this)}>שמור</button>
                </div>;
            }
        }
        this.addNewCouncilCandidateItem = null;
        if (!this.props.isAddingMayorCandidate && !this.props.isCouncilCandidateRowInDnDSort && !this.props.isAddingCouncilCandidate && this.editingCount == 0) {
            if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates.candidates.council.add'] == true) {
                this.addNewCouncilCandidateItem = <div className="add-item-line">
                    <a title="הוסף מועמד" style={{ fontWeight: '600', cursor: 'pointer' }} onClick={this.setAddingCouncilCandidateRow.bind(this, true)}><span>+</span>הוסף מועמד</a>
                </div>;
            }
        }

        this.councilCandidatesRowsItem = null;
        this.councilCandidatesAddNewRowItem = null;

        if (this.props.deleteCouncilCandidateIndex >= 0) {
            this.confirmDeleteCandidateItem = <ModalWindow show={true} buttonOk={this.doRealDeleteOfCandidate.bind(this, 'council')} buttonCancel={this.confirmDeleteMayorRow.bind(this, 'deleteCouncilCandidateIndex', -1)} buttonX={this.confirmDeleteMayorRow.bind(this, 'deleteCouncilCandidateIndex', -1)} title={"אישור מחיקה"} style={{ zIndex: '9001' }}>
                <div>{"למחוק מועמד?"}</div>
            </ModalWindow>;

        }
        if (this.props.isCouncilCandidateRowInDnDSort) {
			 
            if (this.props.dndItems) {
				 
                this.councilCandidatesCount = this.props.dndItems.length;
                this.councilCandidatesRowsItem = this.props.dndItems.map(function (item, index) {
                    return <MunicipalCouncilCandidateRow key={index} item={item} index={index}
                        isValidComboValue={self.isValidComboValue.bind(self)}
                        editingCount={self.editingCount} setCandidateRowEditing={self.setCandidateRowEditing.bind(self)}
                        confirmDeleteMayorRow={self.confirmDeleteMayorRow.bind(self, 'deleteCouncilCandidateIndex', index)}
                        editCandidateRowItemChange={self.editCandidateRowItemChange.bind(self)}
                        doRealEditRow={self.doRealEditRow.bind(self)}
                        move={self.move.bind(self)}
                        isAuthorizedEdit={(self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.parameters_candidates.candidates.council.edit'] == true)}
                        isAuthorizedDelete={(self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.parameters_candidates.candidates.council.delete'] == true)}
                        revertToOriginal={self.revertToOriginal.bind(self)} drop={self.drop.bind(self)}
                    />;
                });
            }
        }
        else {
            if (this.props.cityMunicipalElectionsCampaignsData) {
                this.councilCandidatesCount = this.props.cityMunicipalElectionsCampaignsData.council_candidates.length;
                this.councilCandidatesRowsItem = this.props.cityMunicipalElectionsCampaignsData.council_candidates.map(function (item, index) {
                    return <MunicipalCouncilCandidateRow key={index} item={item} index={index}
                        isValidComboValue={self.isValidComboValue.bind(self)}
                        editingCount={self.editingCount} setCandidateRowEditing={self.setCandidateRowEditing.bind(self)}
                        confirmDeleteMayorRow={self.confirmDeleteMayorRow.bind(self, 'deleteCouncilCandidateIndex', index)}
                        editCandidateRowItemChange={self.editCandidateRowItemChange.bind(self)}
                        doRealEditRow={self.doRealEditRow.bind(self)}
                        move={self.move.bind(self)}
                        isAuthorizedEdit={(self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.parameters_candidates.candidates.council.edit'] == true)}
                        isAuthorizedDelete={(self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.parameters_candidates.candidates.council.delete'] == true)}
                        revertToOriginal={self.revertToOriginal.bind(self)} drop={self.drop.bind(self)}
                    />;
                });
            }
        }

        if (this.props.isAddingCouncilCandidate) {
			let isWrongPersonalIdentity =   !(this.props.foundVoter.first_name);
            this.isValidatedCouncilCandidateRow = this.props.newCouncilCandidateScreen.selectedParty.selectedItem && this.props.foundVoter.first_name && this.state.phoneIsValid;
            this.councilCandidatesAddNewRowItem = <tr className="edit-save-row">
                <td><span className="num-utem">{this.councilCandidatesCount + 1}</span>.</td>
                <td>
                    <div className="row">
                        <div className='col-md-7 text-left no-padding'><input type="text" maxLength={9} value={this.props.newCouncilCandidateScreen.personalIdentity} onChange={this.newCouncilCandidateRowIdentityChange.bind(this)} className="form-control" onKeyPress={this.handleKeyPress.bind(this)} style={{ borderColor: (this.props.foundVoter.first_name ? '#ccc' : '#ff0000') }} /></div><div className='col-sm-1 text-right' style={{ paddingTop: '4px', cursor: 'pointer' }}><img src={window.Laravel.baseAppURL + 'Images/ico-search-blue.svg'} onClick={this.searchVoter.bind(this)} /></div>
                    </div>
                </td>
                <td>
                    {this.fullName}
                </td>
                <td>
                    <Combo disabled={isWrongPersonalIdentity} items={this.currentPhones} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='phone_number' value={this.props.newCouncilCandidateScreen.selectedPhone.selectedValue} onChange={this.newCouncilCandidateRowComboItemChange.bind(this, 'selectedPhone')}  inputStyle={{ borderColor: (this.state.phoneIsValid ? '#ccc' : '#ff0000') }} />
                </td>
                <td>
                    <Combo disabled={isWrongPersonalIdentity} items={this.currentParties} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='letters' value={this.props.newCouncilCandidateScreen.selectedParty.selectedValue} onChange={this.newCouncilCandidateRowComboItemChange.bind(this, 'selectedParty')} inputStyle={{ borderColor: (this.props.newCouncilCandidateScreen.selectedParty.selectedItem ? '#ccc' : '#ff0000') }} />
                </td>
                <td>
                    <input disabled={isWrongPersonalIdentity} type="checkbox" checked={this.props.newCouncilCandidateScreen.shas == 1} onChange={this.newCouncilCandidateRowBooleanItemChange.bind(this, 'shas', (this.props.newCouncilCandidateScreen.shas == 1 ? 0 : 1))} />
                </td>
                <td>
                    {this.props.foundVoter.city ? this.props.foundVoter.city : ''}
                </td>

                <td className="status-data">
                    <button type="button" className="btn btn-success  btn-xs" disabled={!this.isValidatedCouncilCandidateRow} onClick={this.addNewCandidateRow.bind(this, 'council')} >
                        <i className="fa fa-pencil-square-o"></i>
                    </button>
                </td>
                <td className="status-data">
                    <button type="button" className="btn btn-danger  btn-xs" onClick={this.setAddingCouncilCandidateRow.bind(this, false)} >
                        <i className="fa fa-times"></i>
                    </button>
                </td>
            </tr>;
        }

        this.councilCandidateCollapseItem = null;

        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates.candidates.council'] == true) {

            this.councilCandidateCollapseItem = <div>
                <a title="מועמדים למועצת העיר" data-toggle="collapse" href="#Tab2-collapse-tabs2" aria-expanded="true">
                    <div className="panelCollapse">
                        <div className="collapseArrow closed" style={{ marginRight: '0' }}></div>
                        <div className="collapseArrow open" style={{ marginRight: '0' }}></div>
                        <div className="collapseTitle">
                            <span>מועמדים למועצת העיר</span>
                        </div>
                    </div>
                </a>

                <div id="Tab2-collapse-tabs2" className="collapse in" aria-expanded="true">
                    <div className="clearfix row-of-buttons">
                        {this.changeOrderItem}

                    </div>
                    <div className="panelContent">
                        <table className="table table-striped tableNoMarginB tableTight table-scroll">
                            <thead>
                                {this.councilCandidatesListHeader}
                            </thead>
                            <tbody ref={this.getRef.bind(this)}>
                                {this.councilCandidatesRowsItem}
                                {this.councilCandidatesAddNewRowItem}
                            </tbody>
                        </table>
                        {this.addNewCouncilCandidateItem}
                    </div>
                </div>
            </div>;
        }
    }

	/*
	Function that sets dynamic items in render() function : 
	*/
    initDynamicVariables() {
        this.editingCount = 0;
        this.currentParties = [];
        this.currentPhones = [];
        this.fullName = '';
        if (this.props.foundVoter.first_name && this.props.foundVoter.last_name) {
            this.fullName = this.props.foundVoter.first_name + ' ' + this.props.foundVoter.last_name;
        }
        if (this.props.cityMunicipalElectionsCampaignsData) {
            this.currentParties = this.props.cityMunicipalElectionsCampaignsData.municipal_election_parties;
        }
        if (this.props.foundVoter.phones) {
            this.currentPhones = this.props.foundVoter.phones;
        }

        if (this.props.cityMunicipalElectionsCampaignsData) {
            for (let i = 0; i < this.props.cityMunicipalElectionsCampaignsData.mayor_candidates.length; i++) {
                if (this.props.cityMunicipalElectionsCampaignsData.mayor_candidates[i].editing) {
                    this.editingCount++;
                    break;
                }

            }
            if (this.editingCount == 0) {
                for (let i = 0; i < this.props.cityMunicipalElectionsCampaignsData.council_candidates.length; i++) {
                    if (this.props.cityMunicipalElectionsCampaignsData.council_candidates[i].editing) {
                        this.editingCount++;
                        break;
                    }

                }
            }
        }
        this.initDynamicMunicipalCandidateItems();
        this.initDynamicCouncilCandidateItems();
    }


    render() {
 
        this.initDynamicVariables();
        return (
            <div className="containerStrip">
                {this.confirmDeleteCandidateItem}
                {this.mayorCandidateCollapseItem}
                {this.councilCandidateCollapseItem}
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        cityMunicipalElectionsCampaignsData: state.elections.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData,
        selectedCampaign: state.elections.citiesScreen.cityPanelScreen.selectedCampaign,
        isAddingMayorCandidate: state.elections.citiesScreen.cityPanelScreen.isAddingMayorCandidate,
        isAddingCouncilCandidate: state.elections.citiesScreen.cityPanelScreen.isAddingCouncilCandidate,
        newMayorCandidateScreen: state.elections.citiesScreen.cityPanelScreen.newMayorCandidateScreen,
        newCouncilCandidateScreen: state.elections.citiesScreen.cityPanelScreen.newCouncilCandidateScreen,
        foundVoter: state.elections.citiesScreen.cityPanelScreen.foundVoter,
        deleteMayorCandidateIndex: state.elections.citiesScreen.cityPanelScreen.deleteMayorCandidateIndex,
        deleteCouncilCandidateIndex: state.elections.citiesScreen.cityPanelScreen.deleteCouncilCandidateIndex,
        isCouncilCandidateRowInDnDSort: state.elections.citiesScreen.cityPanelScreen.isCouncilCandidateRowInDnDSort,
        dndItems: state.elections.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items,
        selectedVoterForRedirect: state.voters.searchVoterScreen.selectedVoterForRedirect,
    }
}

export default connect(mapStateToProps)(withRouter(SecondSubTab));