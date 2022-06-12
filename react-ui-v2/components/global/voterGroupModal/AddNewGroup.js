import React from 'react';
import { connect } from 'react-redux';
import constants from '../../../libs/constants';
import Combo from '../../global/Combo';
import * as SystemActions from 'actions/SystemActions';
import store from '../../../store';

class AddNewGroup extends React.Component {
    constructor(props) {
        super(props);
        this.initConstants();
    }
	
	componentWillMount()
	{
		SystemActions.loadTeams(store);
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
	}

    initConstants() {
        this.buttonText = 'הוסף קבוצה חדשה לרשימה';
		this.state = {
			newGroupName: '',
			selectedVoterGroupPermissionType : {selectedValue:"ללא" , selectedItem:{id:constants.groups_permission_types.none , name:"ללא"}} , 
			selectedTeam : {selectedValue:"" , selectedItem:null} ,
			selectedUser : {selectedValue:"" , selectedItem:null} ,
			selectedArea : {selectedValue:"" , selectedItem:null} ,
			selectedCity : {selectedValue:"" , selectedItem:null} ,
			selectedNeighborhood : {selectedValue:"" , selectedItem:null} ,
			filteredCities : [], selectedPermissions:[],
		};
		this.groupPermissionsTypeItems = [
			{id:constants.groups_permission_types.none , name:"ללא"} , 
			{id:constants.groups_permission_types.geographic , name:"גיאוגרפית"} , 
			{id:constants.groups_permission_types.team , name:"צוות"} , 
			{id:constants.groups_permission_types.user , name:"משתמש"}
		];	
    }

    addNewGroup() {
		if(!this.isValidated){
			return;
		}
        let newGroupName = this.state.newGroupName;

     

		
		let voterGroupsPermissions = [];
		for(let i = 0 ; i < this.state.selectedPermissions.length ; i++){
			voterGroupsPermissions.push({team_key:this.state.selectedPermissions[i].team_key , user_key:this.state.selectedPermissions[i].user_key , entity_type:this.state.selectedPermissions[i].entity_type , entity_id:this.state.selectedPermissions[i].entity_id});
		}
		let data={
			name: newGroupName ,
			permission_type: this.state.selectedVoterGroupPermissionType.selectedItem.id,
			voter_groups_permissions:JSON.stringify(voterGroupsPermissions)
		};
		 
		
        this.props.addNewGroup(data);
		this.setState({selectedPermissions:[]});
		this.setState({newGroupName: '' , selectedVoterGroupPermissionType : {selectedValue:"ללא",
			           selectedItem:{id:constants.groups_permission_types.none , name:"ללא"}}});
	    this.props.newGroupNameChange('');
		
    }

    newGroupNameChange(event) {
        this.setState({newGroupName: event.target.value});
		this.props.newGroupNameChange(event.target.value);
    }
	
	/*
		In case of user chose voter geographical group permission type , and changed one of geo-comboes
	*/
	geoEntityChange(comboName , e){
		this.setState({[comboName]:{selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
		switch (comboName){
                  case 'selectedArea' :
				     let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || city.area_id == e.target.selectedItem.id});
					 if(e.target.selectedItem){
						 this.setState({filteredCities : newFilteredCities});
					 }
					 else{
						 this.setState({filteredCities : []});
					 }
					 break;
				  case 'selectedCity' :
					  if(e.target.selectedItem){
						  SystemActions.loadNeighborhoods(store , e.target.selectedItem.key);
					  }
					  else{
						  this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_NEIGHBORHOODS, neighborhoods: []});
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
					returnedItem = (<div className="row">
										<div className="col-md-12">
											<div className="row">
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
											</div>
										</div>
							</div>);
					break;
				case constants.groups_permission_types.team:
						returnedItem = (<div className="row">
								<div className="col-md-7">
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
						returnedItem = (<div className="row">
								<div className="col-md-4">
									<div className="form-group">
										<label htmlFor="ty-1" className="control-label">צוות</label>
										<Combo  items={this.props.teams} placeholder="בחר צוות"  value={this.state.selectedTeam.selectedValue} 
               								   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' onChange={this.teamEntityChange.bind(this , 'selectedTeam')}   /> 
									</div>
								</div>
								<div className="col-md-4">
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
		Function that handles changing of group permission type combo
	*/
	changeVoterGroupPermissionType(e){
		this.setState({selectedVoterGroupPermissionType:{selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
		this.setState({
						selectedTeam : {selectedValue:"" , selectedItem:null} ,
						selectedUser : {selectedValue:"" , selectedItem:null} ,
						selectedArea : {selectedValue:"" , selectedItem:null} ,
						selectedCity : {selectedValue:"" , selectedItem:null} ,
						selectedNeighborhood : {selectedValue:"" , selectedItem:null} ,
						filteredCities : [],
						selectedPermissions: [],
					 });
	}
	
	/*
		Function that each render() call inits the corresponding variables
	*/
	initDynamicVariables(){
		this.errorMessage = '';
		this.isDataChanged = false;
		this.isValidated = ((this.state.newGroupName.trim().length >= 2) && this.state.selectedVoterGroupPermissionType.selectedItem); 

		this.isDisabledAddPermission = this.isDisabledPermissionFields();
		this.voterGroupPermissions = this.getVoterGroupPermissionsBottomPart();

		this.newGroupNameInputStyle = (this.state.newGroupName.length >= 2 || this.state.newGroupName.length == 0) ? {} : {borderColor: '#cc0000'};
	}

    render() {
		let self = this;
		this.initDynamicVariables();

        return (
		<div>
            <div className="row">
                <div className="col-md-4 text-right">שם קבוצה : </div>
                <div className="col-md-7">
                    <input type="text" className="form-control" style={this.newGroupNameInputStyle}
						   value={this.state.newGroupName} onChange={this.newGroupNameChange.bind(this)} />
                </div>
               
            </div>
			<div className="row">
				<div className="col-md-4 text-right">בחר סוג הרשאה : </div>
				<div className="col-md-7">
					<Combo items={this.groupPermissionsTypeItems} 
						value={this.state.selectedVoterGroupPermissionType.selectedValue} 
						onChange={this.changeVoterGroupPermissionType.bind(this)} 
						maxDisplayItems={5} 
						itemIdProperty="id" 
						itemDisplayProperty='name' 
						inputStyle={{borderColor:(!this.state.selectedVoterGroupPermissionType.selectedItem ? "#ff0000" : "#ccc")}}
					/>
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

			<div className="row">
				 <div className="col-md-12" style={{textAlign:'center'}}>
                    <button className="btn btn-primary" disabled={this.state.newGroupName.length < 2 || !this.state.selectedVoterGroupPermissionType.selectedItem}
                            onClick={this.addNewGroup.bind(this)}>
							{this.buttonText}
                    </button>
                </div>
			</div>
		</div>
        );
    }
}
function mapStateToProps(state) {
    return {
        currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		currentUser: state.system.currentUser,
		neighborhoods:state.system.lists.neighborhoods,
		teams:state.system.teams,
		users:state.system.teamsScreen.minimalUsers,
    };
}
export default connect(mapStateToProps)(AddNewGroup);