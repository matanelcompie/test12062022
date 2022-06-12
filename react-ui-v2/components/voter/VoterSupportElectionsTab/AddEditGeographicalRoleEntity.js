import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import Combo from '../../global/Combo';
import ModalWindow from '../../global/ModalWindow';

import * as VoterActions from '../../../actions/VoterActions';


class AddEditGeographicalRoleEntity extends React.Component {
 
 
    componentDidUpdate(){
		 
 //console.log(this.loadingCities + ' '+this.props.addNewGeoRecordData.roleArea + ' ' + this.props.cities.length);
		if(this.props.editingExistingGeoRole){
		if(this.props.addNewGeoRecordData.roleArea != '' && this.loadingCities != true ){
			
			if(this.props.cities.length == 0){
			 this.loadingCities=true;
		     this.doLoadCities(this.props.addNewGeoRecordData.roleArea);
			}
			else{
				this.loadingCities=false;
			}
		 
		
			
		}
		if(this.props.addNewGeoRecordData.roleCity != '' && this.props.cities.length > 0 && this.loadingNeighbours != true ){
				
				if(this.props.neighborhoods.length == 0){
				 
			      this.loadingNeighbours=true;
		          this.doLoadNeighborhoodsAndClusters(this.props.addNewGeoRecordData.roleCity);
			    }
			    else{
				   this.loadingNeighbours=false;
			    }
		}
		 
		 
		if(this.props.addNewGeoRecordData.roleCluster != '' && this.props.clusters.length > 0  && this.loadingClusters != true ){
				
				if(this.props.ballots.length == 0){
			      this.loadingClusters=true;
		          this.doLoadBallots(this.props.addNewGeoRecordData.roleCluster);
			    }
			    else{
				   this.loadingClusters=false;
			    }
		}
		}
		}
	
	doLoadNeighborhoodsAndClusters(cityName){
		 
		this.cityID = this.getActivistCityID(cityName);
		this.neighborhoodID = this.getActivistNeighborhoodID(this.props.addNewGeoRecordData.roleNeighborhood);
		 
		
		VoterActions.loadNeighborhoodsByCity(this.props.dispatch , this.cityID);
		 
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_CITY_NEW_ROW, data:cityName});
		//reset downgoing combos :
		if(cityName == '' ){
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_NEIGHBORHOOD_NEW_ROW, data:''});
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_CLUSTER_NEW_ROW, data:''});
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_BALLOT_NEW_ROW, data:''});
		this.neighborhoodID = -1;
		this.clusterID = -1;
		this.ballotID = -1;
		}
		if(this.neighborhoodID != -1){
		    VoterActions.loadClustersByNeighborhood(this.props.dispatch , this.neighborhoodID , -1);
		}
		else{
            VoterActions.loadClustersByNeighborhood(this.props.dispatch , -1 , this.cityID);
		}	
	
		VoterActions.loadBallotsByCluster(this.props.dispatch , -1);
		
		
		
	}
	
	doLoadBallots(clusterName){
	 
		this.clusterID = this.getActivistClusterID(clusterName);
		VoterActions.loadBallotsByCluster(this.props.dispatch , this.clusterID);
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_CLUSTER_NEW_ROW, data:clusterName});
		 
		//reset downgoing combos :
		if(clusterName == '' ){
		this.ballotID = -1 ;
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_BALLOT_NEW_ROW, data:''});
		}
	}
	
	doLoadCities(areaName){
		this.areaID = this.getActivistAreaID(areaName);
		VoterActions.loadCitiesByArea(this.props.dispatch , this.areaID);
	 
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_AREA_NEW_ROW, data:areaName});
		//reset downgoing combos :
		if(areaName == '' ){
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_CITY_NEW_ROW, data:''});
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_NEIGHBORHOOD_NEW_ROW, data:''});
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_CLUSTER_NEW_ROW, data:''});
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_BALLOT_NEW_ROW, data:''});
		

        VoterActions.loadNeighborhoodsByCity(this.props.dispatch , -1);
        VoterActions.loadClustersByNeighborhood(this.props.dispatch , this.neighborhoodID , -1);		
		VoterActions.loadBallotsByCluster(this.props.dispatch , -1);
		
		this.cityID = -1;
		this.neighborhoodID = -1;
		this.clusterID = -1;
		this.ballotID = -1;
		}
		
		 
		
	}

	getActivistAreaID(AreaName){
		let returnedValue = -1;
		for(let i = 0 , len = this.props.areas.length ; i < len ; i++){
			if(this.props.areas[i].name == AreaName ){
				returnedValue = this.props.areas[i].id;
			}
		}
		return returnedValue;
	}
	
	getActivistCityID(CityName){
		let returnedValue = -1;
		for(let i = 0 , len = this.props.cities.length ; i < len ; i++){
			 
			if(this.props.cities[i].name == CityName ){
				
				returnedValue = this.props.cities[i].id;
			}
		}
		return returnedValue;
	}
	
	getActivistNeighborhoodID(NeighborhoodName){
		let returnedValue = -1;
		for(let i = 0 , len = this.props.neighborhoods.length ; i < len ; i++){
			if(this.props.neighborhoods[i].name == NeighborhoodName ){
				returnedValue = this.props.neighborhoods[i].id;
			}
		}
		return returnedValue;
	}
	
	getActivistClusterID(ClusterName){
		let returnedValue = -1;
		for(let i = 0 , len = this.props.clusters.length ; i < len ; i++){
			if(this.props.clusters[i].name == ClusterName ){
				returnedValue = this.props.clusters[i].id;
			}
		}
		return returnedValue;
	}
	
	getActivistBallotID(name){
		let returnedValue = -1;
		for(let i = 0 , len = this.props.ballots.length ; i < len ; i++){
			if(this.props.ballots[i].name == name ){
				returnedValue = this.props.ballots[i].id;
			}
		}
		return returnedValue;
	}
	
	getActivistRoleShiftID(name){
		let returnedValue = -1;
		for(let i = 0 , len = this.props.election_role_shifts.length ; i < len ; i++){
			if(this.props.election_role_shifts[i].name == name ){
				returnedValue = this.props.election_role_shifts[i].id;
			}
		}
		return returnedValue;
	}
 
    hideThisModal(){
		this.loadingCities = false;
		this.loadingNeighbours=false;
		this.loadingClusters=false;
		this.areaID = -1;
		this.cityID = -1;
		this.neighborhoodID = -1;
		this.clusterID = -1;
		this.ballotID = -1;
		this.doLoadCities('');
		this.doLoadNeighborhoodsAndClusters('');
		this.doLoadBallots('');
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.ACTIVIST_ADD_HIDE_MODAL_DIALOG});
	}
	
	doAction(actionName){
		let newRoleShiftID = this.getActivistRoleShiftID(this.props.addNewGeoRecordData.roleShift.trim());
		if(newRoleShiftID == -1 && (this.areaID == undefined || this.areaID == -1)){
				this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.ACTIVIST_SHOW_ERROR_DLG , headerText:'שגיאת ולידציה' , contentText:'יש למלות לפחות אזור או שיבוץ'});
			}
	    else
			{
		if(actionName == 'add_geo_record'){
			let tempAreaID = this.getActivistAreaID(this.props.addNewGeoRecordData.roleArea);
				let entityType = 0 ; 
				let entityID = tempAreaID;
				if(this.areaID == undefined || this.areaID == -1){
					entityType = -1;
					entityID = -1
				}
				else{
				 
					 let tempCityID = this.getActivistCityID(this.props.addNewGeoRecordData.roleCity);
					 let tempNeighborhoodName = this.getActivistNeighborhoodID(this.props.addNewGeoRecordData.roleNeighborhood);
				     let tempClusterID = this.getActivistClusterID(this.props.addNewGeoRecordData.roleCluster);
					 let tempBallotID = this.getActivistBallotID(this.props.addNewGeoRecordData.roleBallot);
					 if(this.props.addNewGeoRecordData.roleArea != ''  && this.props.addNewGeoRecordData.roleArea != undefined ) {entityID = tempAreaID;}
				     if(this.props.addNewGeoRecordData.roleCity != ''  && this.props.addNewGeoRecordData.roleCity != undefined ) {entityType++;entityID = tempCityID}
				     if(this.props.addNewGeoRecordData.roleNeighborhood != ''  && this.props.addNewGeoRecordData.roleNeighborhood != undefined ) {entityType++;entityID = tempNeighborhoodName;}
				     if(this.props.addNewGeoRecordData.roleCluster != ''  && this.props.addNewGeoRecordData.roleCluster != undefined ) {
					entityType++;
					 
					if(this.props.addNewGeoRecordData.roleNeighborhood == '' || this.props.addNewGeoRecordData.roleNeighborhood == undefined){entityType++;}
					entityID = tempClusterID;
					}
					 
				if(this.props.addNewGeoRecordData.roleBallot != ''  && this.props.addNewGeoRecordData.roleBallot != undefined ) {entityType++;entityID = tempBallotID;}
				}
				//console.log("cluster id" + this.clusterID);
				//  console.log("entity type  :" + entityType);
				 // console.log("record id : " + this.props.addNewGeoRecordData.recordID);
				
				//VoterActions.addNewRoleGeoEntity(this.props.dispatch , this.props.router.params.voterKey , this.props.addNewGeoRecordData.recordID ,
				//newRoleShiftID , entityType , entityID);

			let geoData = {
				area_name: this.props.addNewGeoRecordData.roleArea,
				city_name: this.props.addNewGeoRecordData.roleCity,
				neighborhood_name: this.props.addNewGeoRecordData.roleNeighborhood,
				cluster_name: this.props.addNewGeoRecordData.roleCluster,
				ballot_name: this.props.addNewGeoRecordData.roleBallot
			};

			this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.GEO_ENTITY_ADD_ROW_CHANGE,
				roleIndex: this.props.addNewGeoRecordData.roleIndex,
				geoData: geoData,
				roleShiftName: this.props.addNewGeoRecordData.roleShift,
				roleShiftId: newRoleShiftID,
				entityType: entityType,
				entityID: entityID

			});

			this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.ACTIVIST_ADD_HIDE_MODAL_DIALOG});
				 
		}
	    else if(actionName == 'edit_geo_record') {
			let entityType = 0 ;

			 let tempAreaID = this.getActivistAreaID(this.props.addNewGeoRecordData.roleArea);
				let entityID = tempAreaID;
				if(this.props.addNewGeoRecordData.roleArea == undefined || this.props.addNewGeoRecordData.roleArea == ''){
					entityType = -1;
					entityID = -1
				}
				else {
					 
					 let tempCityID = this.getActivistCityID(this.props.addNewGeoRecordData.roleCity);
					 let tempNeighborhoodName = this.getActivistNeighborhoodID(this.props.addNewGeoRecordData.roleNeighborhood);
				     let tempClusterID = this.getActivistClusterID(this.props.addNewGeoRecordData.roleCluster);
					 let tempBallotID = this.getActivistBallotID(this.props.addNewGeoRecordData.roleBallot);
					 if(this.props.addNewGeoRecordData.roleArea != ''  && this.props.addNewGeoRecordData.roleArea != undefined ) {
						 entityID = tempAreaID;
					 }
				     if(this.props.addNewGeoRecordData.roleCity != ''  && this.props.addNewGeoRecordData.roleCity != undefined ) {
						 entityType++;entityID = tempCityID
					 }
				     if(this.props.addNewGeoRecordData.roleNeighborhood != ''  && this.props.addNewGeoRecordData.roleNeighborhood != undefined ) {
						 entityType++;entityID = tempNeighborhoodName;
					 }
				     if(this.props.addNewGeoRecordData.roleCluster != ''  && this.props.addNewGeoRecordData.roleCluster != undefined ) {
						entityType++;
					 
						if(this.props.addNewGeoRecordData.roleNeighborhood == '' || this.props.addNewGeoRecordData.roleNeighborhood == undefined) {
							entityType++;
						}
						entityID = tempClusterID;
					 }
					 
					if(this.props.addNewGeoRecordData.roleBallot != ''  && this.props.addNewGeoRecordData.roleBallot != undefined ) {
						entityType++;
						entityID = tempBallotID;
					}
				}
			  
				let geoData = {
					area_name: this.props.addNewGeoRecordData.roleArea,
					city_name: this.props.addNewGeoRecordData.roleCity,
					neighborhood_name: this.props.addNewGeoRecordData.roleNeighborhood,
					cluster_name: this.props.addNewGeoRecordData.roleCluster,
					ballot_name: this.props.addNewGeoRecordData.roleBallot
				};

				this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.GEO_ENTITY_EDIT_ROW_CHANGE,
                                     roleIndex: this.props.addNewGeoRecordData.roleIndex,
					                 geoIndex: this.props.addNewGeoRecordData.geoIndex,
					                 geoData: geoData,
					                 roleShiftName: this.props.addNewGeoRecordData.roleShift,
					                 roleShiftId: newRoleShiftID,
									 entityType: entityType,
					                 entityID: entityID

				});

				this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.ACTIVIST_ADD_HIDE_MODAL_DIALOG});
				//VoterActions.editExistingGeoEntity(this.props.dispatch , this.props.router.params.voterKey,
			    // this.props.addNewGeoRecordData.roleKey , newRoleShiftID , entityType , entityID);
	    }
	}
	
	}
	
 
	
	newRoleShiftChange(e){
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_ROLE_SHIFT_NEW_ROW, data:e.target.value});
	}
	
	newAreaChange(e){ 
		this.doLoadCities(e.target.value);
	}
	
	newCityChange(e){
		this.doLoadNeighborhoodsAndClusters(e.target.value);
	}
	
	newNeighborhoodChange(e){
		this.neighborhoodID = this.getActivistNeighborhoodID(e.target.value);
	 
		VoterActions.loadClustersByNeighborhood(this.props.dispatch , this.neighborhoodID , this.cityID);
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_NEIGHBORHOOD_NEW_ROW, data:e.target.value});

		//reset downgoing combos :
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_CLUSTER_NEW_ROW, data:''});
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_BALLOT_NEW_ROW, data:''});
		
		this.clusterID = -1;
		this.ballotID = -1;
		VoterActions.loadBallotsByCluster(this.props.dispatch , -1);
		
	}
	
	newClusterChange(e){
		this.doLoadBallots(e.target.value);
	}
	
    newBallotChange(e){
		 this.ballotID = this.getActivistBallotID(e.target.value);
		  this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_BALLOT_NEW_ROW, data:e.target.value});
	}
	
 
    render() {
      
	   
		let areaID = this.getActivistAreaID(this.props.addNewGeoRecordData.roleArea);
		 
      
 
		let RoleShiftItem =<Combo items={this.props.election_role_shifts} maxDisplayItems={5} itemIdProperty="id" value={this.props.addNewGeoRecordData.roleShift} onChange={this.newRoleShiftChange.bind(this)} itemDisplayProperty='name'   /> ;
		 
	    return <ModalWindow show={this.props.addingNewGeoRole || this.props.editingExistingGeoRole }
							title={this.props.addingNewGeoRole ? 'הוספת איזור פעילות ושיבוץ' : 'עריכת אזור פעילות ושיבוץ'}
							buttonOk={this.doAction.bind(this , (this.props.addingNewGeoRole ? 'add_geo_record' : 'edit_geo_record'))}
                            buttonCancel={this.hideThisModal.bind(this)} style={{zIndex: '9001' }}>
                   <div>
                   
				    <div className="row" style={{height:'30px'}}>
					       <div className="col-md-4 no-padding">
						     <b> תקופה  :</b>
						   </div>
                            <div className="col-md-8 no-padding">
                                  <div>
                                      <div className="input-group input-group-sm">
									  {this.props.addNewGeoRecordData.campName}
                                      </div>
                                  </div>
                            </div>
                     </div>
					   <div className="row" style={{height:'30px'}}>
					       <div className="col-md-4 no-padding">
						     <b> תפקיד  :</b>
						   </div>
                            <div className="col-md-8 no-padding">
                                  <div>
                                      <div className="input-group input-group-sm">
									    {this.props.addNewGeoRecordData.roleName}
                                      </div>
                                  </div>
                            </div>
                     </div>
                     <div className="row">
					       <div className="col-md-4 no-padding">
						      שיבוץ  :
						   </div>
                            <div className="col-md-8 no-padding">
                                  <div>
                                      <div className="input-group input-group-sm">
									  {RoleShiftItem}
                                      </div>
                                  </div>
                            </div>
                      </div>
                      <div className="row">
					       <div className="col-md-4 no-padding">
						      אזור  :
						   </div>
                            <div className="col-md-8 no-padding">
                                  <div>
                                      <div className="input-group input-group-sm">
                                         <Combo items={this.props.areas} maxDisplayItems={7} itemIdProperty="id" value={this.props.addNewGeoRecordData.roleArea} onChange={this.newAreaChange.bind(this)} itemDisplayProperty='name'   />
                                      </div>
                                  </div>
                            </div>
                      </div>
                     <div className="row" style={{display:(this.areaID == -1 || this.areaID == undefined ? 'none' : 'block')}}>
					       <div className="col-md-4 no-padding">
						      עיר  :
						   </div>
                            <div className="col-md-8 no-padding">
                                  <div>
                                      <div className="input-group input-group-sm">
                                         <Combo items={this.props.cities} maxDisplayItems={7} itemIdProperty="id" value={this.props.addNewGeoRecordData.roleCity} onChange={this.newCityChange.bind(this)} itemDisplayProperty='name'   />
                                      </div>
                                  </div>
                            </div>
                      </div>
                      <div className="row" style={{display:(this.cityID == -1 || this.cityID == undefined ? 'none' : 'block')}}>
					       <div className="col-md-4 no-padding">
						      שכונה  :
						   </div>
                            <div className="col-md-8 no-padding">
                                  <div>
                                      <div className="input-group input-group-sm">
                                         <Combo items={this.props.neighborhoods} maxDisplayItems={7} itemIdProperty="id" value={this.props.addNewGeoRecordData.roleNeighborhood} onChange={this.newNeighborhoodChange.bind(this)} itemDisplayProperty='name'   />
                                      </div>
                                  </div>
                            </div>
                      </div>
                      <div className="row" style={{display:(this.cityID == -1 || this.cityID == undefined ? 'none' : 'block')}}>
					       <div className="col-md-4 no-padding">
						      אשכול  :
						   </div>
                            <div className="col-md-8 no-padding">
                                  <div>
                                      <div className="input-group input-group-sm">
                                         <Combo items={this.props.clusters} maxDisplayItems={7} itemIdProperty="id" value={this.props.addNewGeoRecordData.roleCluster} onChange={this.newClusterChange.bind(this)} itemDisplayProperty='name'   />
                                      </div>
                                  </div>
                            </div>
                      </div>
                      <div className="row" style={{display:(this.clusterID == -1 || this.clusterID == undefined  ? 'none' : 'block')}}>
					       <div className="col-md-4 no-padding">
						      קלפי  :
						   </div>
                            <div className="col-md-8 no-padding">
                                  <div>
                                      <div className="input-group input-group-sm">
                                         <Combo items={this.props.ballots} maxDisplayItems={7} itemIdProperty="id" value={this.props.addNewGeoRecordData.roleBallot} onChange={this.newBallotChange.bind(this)} itemDisplayProperty='name'   />
                                      </div>
                                  </div>
                            </div>
                      </div>					  
             </div>					  
                </ModalWindow>;
           
        
    }
}
function mapStateToProps(state) {
    return {
         addingNewGeoRole : state.voters.activistScreen.addingNewGeoRole,
		 editingExistingGeoRole:state.voters.activistScreen.editingExistingGeoRole,
		 addEditActivistRoleHeader:state.voters.activistScreen.addEditActivistRoleHeader, 
		 election_role_shifts : state.voters.activistScreen.election_role_shifts,
		 addNewGeoRecordData : state.voters.activistScreen.addNewGeoRecordData,
		 areas :state.voters.activistScreen.areas,
		 cities :state.voters.activistScreen.cities,
         neighborhoods :state.voters.activistScreen.neighborhoods,
         clusters :state.voters.activistScreen.clusters,
         ballots :state.voters.activistScreen.ballots
    }
}

export default connect(mapStateToProps)(withRouter(AddEditGeographicalRoleEntity));