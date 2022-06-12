import React from 'react';
import { connect } from 'react-redux';
import constants from '../../../../../libs/constants';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import store from '../../../../../store';

class AddEditVoterGroupModal extends React.Component {
	initState = {
		selectedVoterGroupPermissionType: { selectedValue: "ללא", selectedItem: { id: constants.groups_permission_types.none, name: "ללא" } },
		selectedTeam: { selectedValue: "", selectedItem: null },
		selectedUser: { selectedValue: "", selectedItem: null },
		selectedArea: { selectedValue: "", selectedItem: null },
		selectedCity: { selectedValue: "", selectedItem: null },
		selectedNeighborhood: { selectedValue: "", selectedItem: null },
		filteredCities: this.props.currentUserGeographicalFilteredLists.cities
		, selectedPermissions: [],
	}
	constructor(props) {
        super(props);
		this.initConstants();
		this.initPrimaryWindowParams();
    }
	/*
		This function inits constant variables
	*/
	initConstants(){
		this.state = {...this.initState};
		this.state.groupName='';
		this.groupPermissionsTypeItems = [
			{id:constants.groups_permission_types.none , name:"ללא"} , 
			{id:constants.groups_permission_types.geographic , name:"גיאוגרפית"} , 
			{id:constants.groups_permission_types.team , name:"צוות"} , 
			{id:constants.groups_permission_types.user , name:"משתמש"}
			];	
		this.labels = {
			addNewGroupLabel:"הוספת קבוצה חדשה",  editExistingGroupLabel:"עריכת קבוצה",
		}
	}
	
	/*
		This inits components params that are needed to be pre-loaded at most once time
	*/
	initPrimaryWindowParams(){
		if(this.props.modalExtraParams.actionType=="add"){
				this.windowTitle= this.labels.addNewGroupLabel  ;
				this.currentAction = this.addGroup.bind(this);
				this.oldName = '';
				this.oldGroupPermissionType = this.state.selectedVoterGroupPermissionType.selectedItem.id;
		}
		else{
			this.windowTitle= this.labels.editExistingGroupLabel  ;
			this.currentAction = this.saveGroup.bind(this);
			let editedItem =  this.props.modalExtraParams.itemRef;
			if(editedItem.voter_group_permissions){
				this.state.selectedPermissions = [...editedItem.voter_group_permissions] ; 
				this.state.oldSelectedPermissions = editedItem.voter_group_permissions; 
			}
			this.state.groupName = editedItem.name;
			for(let i = 0 ; i < this.groupPermissionsTypeItems.length ; i++){
				if(this.groupPermissionsTypeItems[i].id == editedItem.permission_type){
					this.state.selectedVoterGroupPermissionType = {selectedValue:this.groupPermissionsTypeItems[i].name , selectedItem:this.groupPermissionsTypeItems[i]};
				    break;
				}
			}
			this.oldName = editedItem.name;
			this.oldGroupPermissionType = editedItem.permission_type;	
		}
	}

	/*
		In case of user chose voter geographical group permission type , and changed one of geo-comboes
	*/
	geoEntityChange(comboName , e){
		this.setState({ [comboName]: { selectedValue: e.target.value, selectedItem: e.target.selectedItem } });
		let cityList = this.props.currentUserGeographicalFilteredLists.cities;
		switch (comboName){
			case 'selectedArea':
				let newFilteredCities = cityList.filter(function (city) { return !e.target.selectedItem || city.area_id == e.target.selectedItem.id });
				let initialSelectedCity = { ...this.initState.selectedCity };
				if (e.target.selectedItem) {
					this.setState({ filteredCities: newFilteredCities, selectedCity: initialSelectedCity });
				} else {
					this.setState({ filteredCities: cityList, selectedCity: initialSelectedCity });
				}
				break;
			case 'selectedCity':
				if (e.target.selectedItem) {
					SystemActions.loadNeighborhoods(store, e.target.selectedItem.key);
				}else {
					this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_NEIGHBORHOODS, neighborhoods: [] });
				}
				break;
		}
	}
	
	/*
		Handles removing permission from local list by its index
	*/
	removeFromTempList(rowIndex){
		let localPermissions = this.state.selectedPermissions;
		localPermissions.splice(rowIndex , 1);
		this.setState({selectedPermissions:localPermissions});
	}
	
	/*
		Handles adding permission to local list
	*/
	doAddAction(){
		let localPermissions = this.state.selectedPermissions;
		let isAlreadyExistsInArray = false;
		let fullAreaPath = "";
		switch(this.state.selectedVoterGroupPermissionType.selectedItem.id){
			case constants.groups_permission_types.geographic:
				let entityType = 0;
				let entityID = null;
				if(this.state.selectedArea.selectedItem){
					entityID = this.state.selectedArea.selectedItem.id;
					fullAreaPath += this.state.selectedArea.selectedItem.name + ">";
				}
				if(this.state.selectedCity.selectedItem){
					entityType = 1;
					entityID = this.state.selectedCity.selectedItem.id;
					fullAreaPath += this.state.selectedCity.selectedItem.name + ">";
				}
				if(this.state.selectedNeighborhood.selectedItem){
					entityType = 2;
					entityID = this.state.selectedNeighborhood.selectedItem.id;
					fullAreaPath += this.state.selectedNeighborhood.selectedItem.name + ">";
				}
				fullAreaPath = fullAreaPath.slice(0,-1) ; // remove last character of ">"
				for(let i = 0 ; i < localPermissions.length ; i++){ //search if item with the same entity type and entity id already exists in array
					if(localPermissions[i].entity_type == entityType && localPermissions[i].entity_id == entityID){
						isAlreadyExistsInArray = true;
						break;
					}
				}
				if(!isAlreadyExistsInArray){ // if item not exists in array : 
					localPermissions.push({entity_type:entityType , entity_id:entityID , title:fullAreaPath});
					this.setState({selectedPermissions:localPermissions});
				}
				break;
			case constants.groups_permission_types.team:
				let teamKey = this.state.selectedTeam.selectedItem.key;
				fullAreaPath += this.state.selectedTeam.selectedItem.name;
				for(let i = 0 ; i < localPermissions.length ; i++){ //search if item with the same teamKey exists
					if(localPermissions[i].team_key == teamKey  ){
						isAlreadyExistsInArray = true;
						break;
					}
				}
				if(!isAlreadyExistsInArray){ // if item not exists in array : 
					localPermissions.push({team_key:teamKey , title:fullAreaPath});
					this.setState({selectedPermissions:localPermissions});
				}
				break;
			case constants.groups_permission_types.user:
				let userKey = this.state.selectedUser.selectedItem.key;
				fullAreaPath += this.state.selectedUser.selectedItem.name;
				for(let i = 0 ; i < localPermissions.length ; i++){ //search if item with the same teamKey exists
					if(localPermissions[i].user_key == userKey  ){
						isAlreadyExistsInArray = true;
						break;
					}
				}
				if(!isAlreadyExistsInArray){ // if item not exists in array : 
					localPermissions.push({user_key:userKey , team_key:this.state.selectedTeam.selectedItem.key, title:fullAreaPath});
					this.setState({selectedPermissions:localPermissions});
				}
				break;
		}
	}
	
	/*
		Function that returns if fields area disabled for adding permission entity
	*/
	isDisabledPermissionFields(){
		let isDisabled = false;
		if(!this.state.selectedVoterGroupPermissionType.selectedItem){return false;}
		switch(this.state.selectedVoterGroupPermissionType.selectedItem.id){
			case constants.groups_permission_types.geographic:
				isDisabled = (!this.state.selectedArea.selectedItem && !this.state.selectedCity.selectedItem  && !this.state.selectedNeighborhood.selectedItem );
				break;
			case constants.groups_permission_types.team:
				isDisabled = !this.state.selectedTeam.selectedItem ;
				break;
			case constants.groups_permission_types.user:
				isDisabled = !this.state.selectedUser.selectedItem;
				break;
		}
		return isDisabled;
	}
	
	/*
		In case of user chose voter team's or user's group permission type , and changed one of geo-comboes
	*/
	teamEntityChange(comboName , e){
		this.setState({[comboName]:{selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
		if(this.state.selectedVoterGroupPermissionType.selectedItem && this.state.selectedVoterGroupPermissionType.selectedItem.id == constants.groups_permission_types.user)
		//only if selected team user permission type
		{
			switch (comboName){
                  case 'selectedTeam' :
					 if(e.target.selectedItem){
						 SystemActions.loadMinimalUsersForTeam(this.props.dispatch , e.target.selectedItem.key);
					 }
					 else{
						 this.setState({selectedUser:{selectedValue:'' , selectedItem:null}});
						 this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.LOADED_MINIMAL_DATA, data: [], setStaticData:false });
					 }
					 break;   
			}
		}
	}
	
	/*
		This function dynamically draws bottom part by selected permissions type
	*/
	getVoterGroupPermissionsBottomPart(){
		let returnedItem = null;
		if(this.state.selectedVoterGroupPermissionType.selectedItem){
			switch(this.state.selectedVoterGroupPermissionType.selectedItem.id){
				case constants.groups_permission_types.geographic:
					returnedItem = (<div className="row panelContent srchPanelLabel">
								<div className="col-md-3">
									<div className="form-group">
										<label htmlFor="ty-1" className="control-label">אזור</label>
										<Combo  items={this.props.currentUserGeographicalFilteredLists.areas} placeholder="בחר אזור"  value={this.state.selectedArea.selectedValue}
               								   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' onChange={this.geoEntityChange.bind(this , 'selectedArea')}   /> 
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-group">
										<label htmlFor="ty-3" className="control-label">עיר</label>
										<Combo items={this.state.filteredCities} placeholder="בחר עיר"  maxDisplayItems={5}   value={this.state.selectedCity.selectedValue}
										       itemIdProperty="id" itemDisplayProperty='name'   onChange={this.geoEntityChange.bind(this , 'selectedCity')} />
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-group">
										<label htmlFor="ty-4" className="control-label">איזור מיוחד</label>
										<Combo items={this.props.neighborhoods} placeholder="בחר אזור מיוחד"  maxDisplayItems={5}  value={this.state.selectedNeighborhood.selectedValue}
												itemIdProperty="id" itemDisplayProperty='name'   onChange={this.geoEntityChange.bind(this , 'selectedNeighborhood')} />
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-group margin-top-25">
										<div className="box-button-single">
											<button  className="btn btn-primary"  onClick={this.doAddAction.bind(this)} disabled={this.isDisabledAddPermission}>הוסף</button>
										</div>
									</div>
								</div>				
							</div>);
					break;
				case constants.groups_permission_types.team:
						returnedItem = (<div className="row panelContent srchPanelLabel">
								<div className="col-md-3">
									<div className="form-group">
										<label htmlFor="ty-1" className="control-label">צוות</label>
										<Combo  items={this.props.teams} placeholder="בחר צוות"  value={this.state.selectedTeam.selectedValue} 
               								   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' onChange={this.teamEntityChange.bind(this , 'selectedTeam')}   /> 
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-group margin-top-25">
										<div className="box-button-single">
											<button  className="btn btn-primary"  onClick={this.doAddAction.bind(this)} disabled={this.isDisabledAddPermission}>הוסף</button>
										</div>
									</div>
								</div>				
							</div>);
						break;
				case constants.groups_permission_types.user:
						returnedItem = (<div className="row panelContent srchPanelLabel">
								<div className="col-md-3">
									<div className="form-group">
										<label htmlFor="ty-1" className="control-label">צוות</label>
										<Combo  items={this.props.teams} placeholder="בחר צוות"  value={this.state.selectedTeam.selectedValue} 
               								   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' onChange={this.teamEntityChange.bind(this , 'selectedTeam')}   /> 
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-group">
										<label htmlFor="ty-1" className="control-label">משתמש</label>
										<Combo  items={this.props.users} placeholder="בחר משתמש"  value={this.state.selectedUser.selectedValue} 
               								   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' onChange={this.teamEntityChange.bind(this , 'selectedUser')}   /> 
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-group margin-top-25">
										<div className="box-button-single">
											<button  className="btn btn-primary" onClick={this.doAddAction.bind(this)} disabled={this.isDisabledAddPermission}>הוסף</button>
										</div>
									</div>
								</div>				
							</div>);
						break;
				case constants.groups_permission_types.none : default: 
					 break;
			}
		}
		return (returnedItem);
	}
	
	/*
		Function that each render() call inits the corresponding variables
	*/
	initDynamicVariables(){
		this.errorMessage = '';
		this.isDataChanged = false;
		this.isValidated = ((this.state.groupName.trim().length >= 2) && this.state.selectedVoterGroupPermissionType.selectedItem); 
		
		if(!this.isValidated){
			this.errorMessage = "יש למלות את כל שדות החובה";
		}
		else{
			this.isDataChanged = (this.oldName.trim() != this.state.groupName.trim() || this.oldGroupPermissionType != this.state.selectedVoterGroupPermissionType.selectedItem.id);
			if(this.state.oldSelectedPermissions && this.state.oldSelectedPermissions.length != this.state.selectedPermissions.length){
				this.isDataChanged = true;
			}
			else{
				if(this.state.oldSelectedPermissions ){
					for(let i = 0 ; i < this.state.oldSelectedPermissions.length ; i++){
						switch(this.oldGroupPermissionType){
							case constants.groups_permission_types.geographic:
								if(this.state.oldSelectedPermissions[i].entity_type != this.state.selectedPermissions[i].entity_type || this.state.oldSelectedPermissions[i].entity_id != this.state.selectedPermissions[i].entity_id){
									this.isDataChanged = true;
									break;
								}
								break;
							case constants.groups_permission_types.team:
								if(this.state.oldSelectedPermissions[i].team_key != this.state.selectedPermissions[i].team_key  ){
									this.isDataChanged = true;
									break;
								}
								break;
							case constants.groups_permission_types.user:
								if(this.state.oldSelectedPermissions[i].user_key != this.state.selectedPermissions[i].user_key  ){
									this.isDataChanged = true;
									break;
								}
								break;
						}
					}
				}
			}
			if(!this.isDataChanged){
				this.errorMessage = "יש לשנות לפחות נתון אחד לצורך שמירה";
			}
		}
		this.isDisabledAddPermission = this.isDisabledPermissionFields();
		this.voterGroupPermissions = this.getVoterGroupPermissionsBottomPart();
	}
	
	/*
		Handles clicking 'cancel' button and close the window
	*/
	hideWindow(){
		this.props.dispatch({type:SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED,fieldName:'showAddEditModalWindow' , fieldValue:false});
	}
 
	/*
		Function that handles real editing of existing item via API
	*/
	saveGroup() {
		if(!this.isValidated || !this.isDataChanged){
			return;
		}
		let voterGroupsPermissions = [];
		for(let i = 0 ; i < this.state.selectedPermissions.length ; i++){
			voterGroupsPermissions.push({team_key:this.state.selectedPermissions[i].team_key , user_key:this.state.selectedPermissions[i].user_key , entity_type:this.state.selectedPermissions[i].entity_type , entity_id:this.state.selectedPermissions[i].entity_id});
		}
		let data={
			name: this.state.groupName ,
			permission_type: this.state.selectedVoterGroupPermissionType.selectedItem.id,
			voter_groups_permissions:JSON.stringify(voterGroupsPermissions)
		};
		SystemActions.updateVoterGroup(this.props.dispatch , this.props.modalExtraParams.itemRef.key , data);
		this.setState({selectedPermissions:[]});
	}
	
	/*
		Function that handles real adding of new item via API
	*/
	addGroup() {
		if(!this.isValidated){
			return;
		}
		let voterGroupsPermissions = [];
		for(let i = 0 ; i < this.state.selectedPermissions.length ; i++){
			voterGroupsPermissions.push({team_key:this.state.selectedPermissions[i].team_key , user_key:this.state.selectedPermissions[i].user_key , entity_type:this.state.selectedPermissions[i].entity_type , entity_id:this.state.selectedPermissions[i].entity_id});
		}
		let data={
			parent_id: this.props.modalExtraParams.parentID,
			name: this.state.groupName ,
			permission_type: this.state.selectedVoterGroupPermissionType.selectedItem.id,
			voter_groups_permissions:JSON.stringify(voterGroupsPermissions)
		};
		SystemActions.addVoterGroup(this.props.dispatch,  data);
		this.setState({selectedPermissions:[]});
	}
	
		
	/*
		Function that handles changing of group permission type combo
	*/
	changeVoterGroupPermissionType(e) {
		let selectedValue = e.target.value;
		let selectedItem = e.target.selectedItem;
		this.resetAllPermissionsData();
		this.setState({ selectedVoterGroupPermissionType: { selectedValue: selectedValue, selectedItem: selectedItem } });
	}
	resetAllPermissionsData(){
		this.setState({...this.initState});
	}
	
	/*
		Function that cleans all local permissions array
	*/
	cleanAllPermissions(){
		this.resetAllPermissionsData();
	}
		
	/*
		Function that handles changing of group name textfield
	*/
	changeVoterGroupName(e){
		this.setState({groupName:e.target.value});
	}
			
    render() {
		let self = this;
		this.initDynamicVariables();
           return (<ModalWindow show={this.props.showAddEditModalWindow} buttonOk={this.currentAction} title={this.windowTitle} buttonX={this.hideWindow.bind(this)} buttonCancel={this.hideWindow.bind(this)}  >
						<div style={{minWidth:'600px'}}>
							<div className="row containerStrip">
								<div className="col-lg-4">שם קבוצה : </div>
								<div className="col-lg-8">
									<input type="text" value={this.state.groupName} 
											onChange={this.changeVoterGroupName.bind(this)} 
											className="form-control" id="inputModalCity" 
											placeholder="שם קבוצה" 
											style={{borderColor:(this.state.groupName.trim().length < 2 ? "#ff0000":"#ccc")}}
											/>
								</div>
							</div>
							<div className="row containerStrip">
								<div className="col-md-3">בחר סוג הרשאה</div>
								<div className="col-md-7">
									<Combo items={this.groupPermissionsTypeItems} 
											value={this.state.selectedVoterGroupPermissionType.selectedValue} 
											onChange={this.changeVoterGroupPermissionType.bind(this)} 
											maxDisplayItems={5} 
											itemIdProperty="id" 
											itemDisplayProperty='name' 
											inputStyle={{borderColor:(!this.state.selectedVoterGroupPermissionType.selectedItem ? "#ff0000" : "#ccc")}}
											showFilteredList={false}
											/>
								</div>
								<div className="col-md-2">
									<button className="btn btn-warning" onClick={this.cleanAllPermissions.bind(this)}>נקה הכל</button>
								</div>
							</div>
							{this.voterGroupPermissions}
							{this.state.selectedPermissions.length > 0 && 
							<div className="row" style={{paddingTop:'10px',paddingBottom:'10px'}}>
								{
									this.state.selectedPermissions.map(
										function(item,index){
											return (<div key={index} className="col-md-12 margin-right20">
														<a className="cursor-pointer" onClick={self.removeFromTempList.bind(self , index)} title="מחק"> <img src={window.Laravel.baseURL + "Images/delete-row-icon.png"} /></a>
														{item.title}
													</div>)
									})
								}
							</div>
							}
							<div>
								<span style={{color:'#ff0000'}}>{this.errorMessage}</span>
							</div>
							</div>
					</ModalWindow>
                    );
        }
    }
	
    function mapStateToProps(state) {
        return {
            showAddEditModalWindow: state.system.listsScreen.voterTab.showAddEditModalWindow,
            dirty: state.system.listsScreen.dirty,
            GlobalDirty: state.system.dirty,
			currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
			currentUser: state.system.currentUser,
			neighborhoods:state.system.lists.neighborhoods,
			teams:state.system.lists.teams,
			users:state.system.teamsScreen.minimalUsers,
        };
    }
    export default connect(mapStateToProps)(AddEditVoterGroupModal);