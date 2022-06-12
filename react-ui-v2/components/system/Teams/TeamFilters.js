import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';
import store from '../../../store';

import * as SystemActions from '../../../actions/SystemActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import Combo from '../../global/Combo';

import ModalWindow from '../../global/ModalWindow';

class TeamFilters extends React.Component {
	
 
	
	updateCollapseStatus(collapseNumber){
		if(collapseNumber == 1){
			this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.GEO_FILTER_COLLAPSE_CHANGE });
		}
		else if(collapseNumber == 2){
			this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SECTORIAL_FILTER_COLLAPSE_CHANGE });
		}
	}
	
	updateSectorialCollapseStatus(index , e){
	    this.props.dispatch({
            type: GlobalActions.ActionTypes.GEO_FILTERS.UPDATE_COLLAPSE_STATUS_OF_DEF_GROUP  , 
			rowIndex:index
        }); 
	}
	
	getEntityTypeName(entityType){
		
		switch(entityType){
			case 0:
			   return 'אזור';
			case 5:
			   return 'תת אזור';
			case 1:
			   return 'עיר';
			case 2:
			   return 'שכונה';
			case 3:
			   return 'אשכול';
			case 4:
			   return 'קלפי';
		}
	}
	
	showConfirmDelete(deleteIndex){
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SHOW_CONFIRM_DELETE_GEO_TEMPLATE , 
		data:deleteIndex
        });
	}
	
	newGeoTemplateSubAreaChange(e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.filters' });
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE  , data:e.target.value
        });
		let areaID = this.getAreaID(this.props.userScreen.geoFilterModalScreen.areaName);
		let subAreaKey = this.getSubAreaID(e.target.value);
		SystemActions.loadCitiesByAreaAndSubArea(this.props.dispatch , areaID , subAreaKey  );
	}
	
	getSubAreaID(subAreaName, field = 'key'){
		let returnedValue = -1;
		for(let i=0 , len = this.props.subAreas.length ; i<len ; i++){
             if(this.props.subAreas[i].name == subAreaName){		
		          returnedValue = this.props.subAreas[i][field];
				  
		          break;
			 }
		}
		return returnedValue;
	}
	
    showConfirmDeleteSectorial(deleteIndex){
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SHOW_CONFIRM_DELETE_SECTORIAL_TEMPLATE , 
		data:deleteIndex
        });
	}
	
	doGeoFilterAction(isValidFilter){
		if(!isValidFilter || this.props.userScreen.geoFilterModalScreen.labelName.length <= 3){
			return
		}else{
			if(this.props.teamsScreen.addingTeamGeoTemplate || this.props.teamsScreen.editingTeamGeoTemplate){
              let entityType = -1 ; 
			let entityID = this.getAreaGroupID(this.props.userScreen.geoFilterModalScreen.areaGroupName);

			let areaID = this.getAreaID(this.props.userScreen.geoFilterModalScreen.areaName);
			let subAreaID = this.getSubAreaID(this.props.userScreen.geoFilterModalScreen.subAreaName , 'id');
			let cityID = this.getCityID(this.props.userScreen.geoFilterModalScreen.cityName);
			console.log('entityID' ,entityID, this.props.userScreen.geoFilterModalScreen.areaGroupName)
			if(areaID != -1){
				entityType = 0;
				entityID = areaID;
				if(cityID != -1){
					entityType = 1;
					entityID = cityID;
					
					let neighborhoodID = this.getNeighborhoodID(this.props.userScreen.geoFilterModalScreen.neighborhoodName);
					if(neighborhoodID != -1){
						entityType = 2;
						entityID = neighborhoodID;
					}
					
					let clusterID = this.getClusterID(this.props.userScreen.geoFilterModalScreen.clusterName);
					if(clusterID != -1){
						entityType = 3;
						entityID = clusterID;
						
						let ballotID = this.getBallotID(this.props.userScreen.geoFilterModalScreen.ballotName);
						if(ballotID != -1){
						   entityType = 4;
						   entityID = ballotID;
						}
						
					}
					
				}else if(subAreaID != -1){
					entityType = 5;
					entityID = subAreaID;
				}	
			}
      
			  if(this.props.teamsScreen.addingTeamGeoTemplate ){
			
			         SystemActions.addNewGeoTemplate(this.props.dispatch , this.props.router.params.teamKey , this.props.userScreen.geoFilterModalScreen.labelName  , entityType , entityID);
			        //console.log("entity type : " + entityType );
			        //console.log("entity id : " + entityID );
		         }
		         else if(this.props.teamsScreen.editingTeamGeoTemplate){
					 
					   let geoKey = this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex].key;
					   SystemActions.editExistingGeoTemplate(this.props.dispatch , this.props.router.params.teamKey , geoKey , this.props.userScreen.geoFilterModalScreen.labelName  , entityType , entityID);
		               this.loadedGeoEntityData = undefined;
				 }
		     }
		}
	}
	
	hideGeoFilterModal(){
		this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY , target:'system.teams.filters' });
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.HIDE_ADD_NEW_GEO_TPL_MODAL 
        });
		this.loadedGeoEntityData = undefined;
	}
	
	showNewGeoTemplateModal(){
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SHOW_ADD_NEW_GEO_TPL_MODAL 
        });
	}
	
	newGeoTemplateAreaGroupChange(e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.filters' });
       	this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_GROUP_CHANGE  , data:e.target.value
        });
		let areaGroupID = this.getAreaGroupID(e.target.value);
		console.log(areaGroupID);
		 //!! Need to get only areas of areas group
	}
	newGeoTemplateAreaChange(e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.filters' });
       	this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE  , data:e.target.value
        });
		let areaID = this.getAreaID(e.target.value);
		 
		SystemActions.loadCitiesByArea(this.props.dispatch , areaID , -1);
		let areaKey = '-1';
		for(let i = 0 , len=this.props.areas.length ; i<len ; i++){
			if(this.props.areas[i].name == e.target.value){
				areaKey = this.props.areas[i].key;
				break;
			}
		}
		SystemActions.loadSubAreas(store , areaKey);
		 
	}
	
	getCityData(CityName){
		
		let returnedValue = {};
		for (let i = 0, len = this.props.userScreen.geoFilterModalScreen.cities.length; i < len; i++) {
            if (this.props.userScreen.geoFilterModalScreen.cities[i].name==CityName) {
                returnedValue = this.props.userScreen.geoFilterModalScreen.cities[i];
                break;
            }
        }
		return returnedValue;
	}
	
	newGeoTemplateCityChange(e){
		    this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.filters' });
		 	let cityData = this.getCityData(e.target.value);
			
			let areaKey = '';
			let cityID = cityData.id;
			for(let i =0 , len = this.props.areas.length ; i< len ; i++){
				if(this.props.areas[i].key == cityData.area_key){
					areaKey = this.props.areas[i].key;
					this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE  , data:this.props.areas[i].name , resetSubAreas:'0'
                });
		        break;
					
				}
				
			}
			 SystemActions.loadSubAreas(store , areaKey);
			 if(cityData.sub_area_name != ''){
				 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE  , data:cityData.sub_area_name
               });
			 }
			this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE  , data:e.target.value
            });
			SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch , cityID , -1);
	}
	
	newGeoTemplateNeighborhoodChange(e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.filters' });
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_NEIGHBORHOOD_CHANGE  , data:e.target.value
            });
		let neighborhoodID = this.getNeighborhoodID(e.target.value);
		SystemActions.loadClustersByNeighborhood(this.props.dispatch , neighborhoodID , -1);
	 
	}
	
	newGeoTemplateClusterChange(e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.filters' });
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CLUSTER_CHANGE  , data:e.target.value
            });
			let clusterID = this.getClusterID(e.target.value);
		    SystemActions.loadBallotsByCluster(this.props.dispatch , clusterID , -1);
	}
	
	newMainGeoFilterLabelNameChange(e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.filters' });
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_LABEL_CHANGE  , data:e.target.value
        });
	}
	
	newGeoTemplateBallotChange(e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.filters' });
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_BALLOT_CHANGE  , data:e.target.value
            });
		
	}
	
	getAreaID(areaName){
		let areaID = -1;
		for(let i =0 ; i <this.props.areas.length ; i++){
			
			if(this.props.areas[i].name == areaName){
				areaID = this.props.areas[i].id ;
				break;
			}
		}
		return areaID;
	}
	getAreaGroupID(areaGroupName){
		let areaGroupID = -1;
		for(let i =0 ; i <this.props.areasGroups.length ; i++){
			
			if(this.props.areasGroups[i].name == areaGroupName){
				areaGroupID = this.props.areasGroups[i].id ;
				break;
			}
		}
		return areaGroupID;
	}
	
	getCityID(cityName){
		let returnedValue = -1;
		for(let i =0 ; i <this.props.userScreen.geoFilterModalScreen.cities.length ; i++){
			if(this.props.userScreen.geoFilterModalScreen.cities[i].name == cityName){
				
				returnedValue = this.props.userScreen.geoFilterModalScreen.cities[i].id ;
				break;
			}
		}
		return returnedValue;
	}
	
	getNeighborhoodID(neighborhoodName){
		let returnedValue = -1;
		for(let i =0 ; i <this.props.userScreen.geoFilterModalScreen.neighborhoods.length ; i++){
			if(this.props.userScreen.geoFilterModalScreen.neighborhoods[i].name == neighborhoodName){
				
				returnedValue = this.props.userScreen.geoFilterModalScreen.neighborhoods[i].id ;
				break;
			}
		}
		return returnedValue;
	}
	
	getClusterID(clusterName){
		let returnedValue = -1;
		for(let i =0 ; i <this.props.userScreen.geoFilterModalScreen.clusters.length ; i++){
			if(this.props.userScreen.geoFilterModalScreen.clusters[i].name == clusterName){
				
				returnedValue = this.props.userScreen.geoFilterModalScreen.clusters[i].id ;
				break;
			}
		}
		return returnedValue;
	}
	
	getBallotID(ballotName){
		let returnedValue = -1;
		for(let i =0 ; i <this.props.userScreen.geoFilterModalScreen.ballots.length ; i++){
			if(this.props.userScreen.geoFilterModalScreen.ballots[i].name == ballotName){
				
				returnedValue = this.props.userScreen.geoFilterModalScreen.ballots[i].id ;
				break;
			}
		}
		return returnedValue;
	}
	
	editGeoTplRow(rowIndex){
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SHOW_EDIT_GEO_TPL_MODAL , data:rowIndex 
        });
	}
	
	editSectorialTplRow(rowIndex){
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SHOW_EDIT_SECTORIAL_TPL_MODAL , data:rowIndex 
        });
	}
	
	getArrayValue(theArray , theId){
		let returnedVal = '';
		for(let i = 0 ; i < theArray.length ; i++){
			if(theId == theArray[i].id){
				returnedVal = theArray[i].name;
				break;
			}
		}
		return returnedVal;
	}
	
	componentDidUpdate(){
		if(this.props.display){
			if(this.props.teamsScreen.editingTeamGeoTemplateIndex != -1 && this.props.teamsScreen.editingTeamGeoTemplate){
				if(this.loadedGeoEntityData == undefined){
					let theFilter = this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex]
					//console.log(this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex]);
				   let areaKey = '';
				   if(theFilter.area_name){
						for(let i = 0 , len = this.props.areas.length ; i<len ; i++){
							if(this.props.areas[i].name ==theFilter.area_name){
								areaKey = this.props.areas[i].key;
								break;
							}
						} 
				   	}

				   let areaID = -1 , areaName='' , cityName = '' , neighborhoodName = '' , clusterName = '' , ballotName = '';
				   this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_LABEL_CHANGE  , data:this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex].name});
				//  console.log(theFilter);  
				   switch(this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex].entity_type){
                      case -1:
					    let  areaGroupID =theFilter.area_group_id;
						let areaGroupName = this.getArrayValue(this.props.areasGroups , areaGroupID);
					     this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_GROUP_CHANGE  , data:areaGroupName});
						 break;
                      case 0:
					     areaID =theFilter.area_id;
						 areaName = this.getArrayValue(this.props.areas , areaID);
					     this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE  , data:areaName});
		                 SystemActions.loadSubAreas(store , areaKey);
  					     SystemActions.loadCitiesByArea(this.props.dispatch , areaID , -1);
						 break;
					case 5:
							areaID = theFilter.area_id;
							areaName = this.getArrayValue(this.props.areas , areaID);

							let subAreaKey = this.getSubAreaID(theFilter.sub_area_name , 'key')
							this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE, data: areaName });
							SystemActions.loadCitiesByAreaAndSubArea(this.props.dispatch, areaID, subAreaKey);

							this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE, data: theFilter.sub_area_name });
						break;
					  case 1:
					     areaID =theFilter.area_id;
						 areaName = this.getArrayValue(this.props.areas , areaID);
					     this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE  , data:areaName});
		                 SystemActions.loadCitiesByArea(this.props.dispatch , areaID , -1);
						 SystemActions.loadSubAreas(store , areaKey);
 						 cityName =theFilter.city_name;
						 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE  , data:this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex].sub_area_name});
						 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE  , data:cityName });
			             SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch ,theFilter.city_id);
					     break;
					  case 2:
					     SystemActions.loadSubAreas(store , areaKey);
					     areaID =theFilter.area_id;
						 areaName = this.getArrayValue(this.props.areas , areaID);
					     this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE  , data:areaName});
		                 SystemActions.loadCitiesByArea(this.props.dispatch , areaID , -1);
						 cityName =theFilter.city_name;
						 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE  , data:this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex].sub_area_name});
						 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE  , data:cityName });
			             SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch ,theFilter.city_id);
					     neighborhoodName =theFilter.neighborhood_name;
                         this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_NEIGHBORHOOD_CHANGE  , data:neighborhoodName });
  						  SystemActions.loadClustersByNeighborhood(this.props.dispatch ,theFilter.neighborhood_id);					
						 break;
					  case 3:
					     SystemActions.loadSubAreas(store , areaKey);
					     areaID =theFilter.area_id;
						 areaName = this.getArrayValue(this.props.areas , areaID);
					     this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE  , data:areaName});
		                 SystemActions.loadCitiesByArea(this.props.dispatch , areaID , -1);
						 cityName =theFilter.city_name;
						 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE  , data:this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex].sub_area_name});
						 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE  , data:cityName });
			             SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch ,theFilter.city_id);
					     if(this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex].neighborhood_id == -1){
						
						 }
						 else{
						 neighborhoodName =theFilter.neighborhood_name;
                         this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_NEIGHBORHOOD_CHANGE  , data:neighborhoodName });
  						  SystemActions.loadClustersByNeighborhood(this.props.dispatch ,theFilter.neighborhood_id);	
                        }
	                     clusterName =theFilter.cluster_name;						 
						 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CLUSTER_CHANGE  , data:clusterName });
                         SystemActions.loadBallotsByCluster(this.props.dispatch ,theFilter.cluster_id);												
						 break;
						 
				     case 4:
					     SystemActions.loadSubAreas(store , areaKey);
					     areaID =theFilter.area_id;
						 areaName = this.getArrayValue(this.props.areas , areaID);
					     this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE  , data:areaName});
		                 SystemActions.loadCitiesByArea(this.props.dispatch , areaID , -1);
						 cityName =theFilter.city_name;
						 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE  , data:this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex].sub_area_name});
						 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE  , data:cityName });
			             SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch ,theFilter.city_id);
					     if(this.props.teamsScreen.geoTemplates[this.props.teamsScreen.editingTeamGeoTemplateIndex].neighborhood_id == -1){
						
						 }
						 else{
						 neighborhoodName =theFilter.neighborhood_name;
                         this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_NEIGHBORHOOD_CHANGE  , data:neighborhoodName });
  						  SystemActions.loadClustersByNeighborhood(this.props.dispatch ,theFilter.neighborhood_id);	
                        }
	                     clusterName =theFilter.cluster_name;						 
						 this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CLUSTER_CHANGE  , data:clusterName });
                         SystemActions.loadBallotsByCluster(this.props.dispatch ,theFilter.cluster_id);												
						 ballotName =theFilter.ballot_name;
                         this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_BALLOT_CHANGE  , data:ballotName });						 
						 break;
				   }				   

				  this.loadedGeoEntityData='1';
				}
			}
		
            else if(this.props.teamsScreen.editingTeamSectorialTemplateIndex != -1 && this.props.teamsScreen.editingTeamSectorialTemplate){
              if(this.loadedSectorialEntityData == undefined){
			 
	          GlobalActions.loadGeoTplDefinitionGroupsValuesOnly(this.props.dispatch , this.props.router.params.teamKey , this.props.teamsScreen.sectorialTemplates[this.props.teamsScreen.editingTeamSectorialTemplateIndex].name , this.props.teamsScreen.sectorialTemplates[this.props.teamsScreen.editingTeamSectorialTemplateIndex].key);
			  this.loadedSectorialEntityData='1';
			  }

			}			
		}
		
	}
	
	showNewSectorialTemplateModal(){
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SHOW_ADD_NEW_SECTORIAL_TPL_MODAL 
        });
	}
	
	hideThisSectorialModal(){
		this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY , target:'system.teams.filters' });
		this.loadedSectorialEntityData=undefined;
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.HIDE_ADD_NEW_SECTORIAL_TPL_MODAL 
        });
		this.props.dispatch({
            type: GlobalActions.ActionTypes.GEO_FILTERS.CLOSE_ADD_EDIT_GEO_FILTER_MODAL 
        }); 
	}
	
	doSectorialAction(){
		if(this.props.sectorialFiltersScreen.filterNameHeader.length < 3){
		    //console.log('wrong');	
		}else{
		if(this.props.teamsScreen.addingTeamSectorialTemplate){
			//console.log("add");
			 let allDefItemsWithVals = '';
			for(let i = 0 , len = this.props.sectorialFiltersScreen.definitionGroups.length ; i< len ; i++){
		    for(let j = 0 , len1 = this.props.sectorialFiltersScreen.definitionGroups[i].definitions.length ; j< len1 ; j++){
				let values = [];
				let string_val = null;
				let number_val = null;
				let multi_vals='';
				let temp_def_value = '';
				let temp_def_id = -1;
				if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type <= 2){
					
					if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].multiselect == 0 || this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 0){
						if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value != ''){
					      temp_def_value = this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value;
					      if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type > 0){
						  temp_def_id = (this.getIdOfArrayAndName(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].values , temp_def_value ) );					 
						 }
						  else{
							  temp_def_id = this.getIdOfArrayAndName([{id : 0 , name:'לא'} , {id : 1 , name : 'כן'}] , temp_def_value ) ;
						  
						  }
					 
 						 if(temp_def_id != -1){
							//  console.log("name: " + this.props.geoFiltersDefinitionGroups[i].definitions[j].name + " - value : " +  temp_def_id);
							allDefItemsWithVals += this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].id
                            + '|' +  this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].name 
					        + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type 
					        + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].multiselect 
					        + '|' + temp_def_id
					        + ';';
						  }
						}
					}
					else{
						let values = [];
						if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values != undefined){
						  
    						  values = this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values;
						}
						if(values.length > 0){
							let valuesStr = '';
							
							for(let k = 0 ; k<values.length ; k++){
								if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type==1){
								    valuesStr += values[k].value  + ',';
								}
								else if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 2){
									valuesStr += values[k].name  + ',';
								}
							}
							valuesStr = valuesStr.slice(0,-1);
							allDefItemsWithVals += this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].id
                            + '|' +  this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].name 
					        + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type 
					        + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].multiselect 
					        + '|' + valuesStr
					        + ';';
							 // console.log("name: " + this.props.geoFiltersDefinitionGroups[i].definitions[j].name + " - value : " +  valuesStr);
						}
					}
				}
				else{ //text field
					if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value.trim() != ''){
						//console.log("name: " + this.props.geoFiltersDefinitionGroups[i].definitions[j].name + " - value : " +  this.props.geoFiltersDefinitionGroups[i].definitions[j].def_value);
					allDefItemsWithVals += this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].id
                    + '|' +  this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].name 
					+ '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type 
					+ '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].multiselect 
					+ '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value
					+ ';';
					}
				}
				
			}
	}
	        allDefItemsWithVals = allDefItemsWithVals.slice(0,-1);
	        SystemActions.addNewSectorialTemplateToTeam(this.props.dispatch , this.props.router.params.teamKey , allDefItemsWithVals ,  this.props.sectorialFiltersScreen.filterNameHeader);
		}
		else if(this.props.teamsScreen.editingTeamSectorialTemplate){
		 let editString = '';
		 let addString = '';
		 let deleteString = '';
		 let temp_id = -1;
			 for(let i =0 , len = this.props.sectorialFiltersScreen.definitionGroups.length ; i < len ; i++){
		   for(let j =0 , len1 = this.props.sectorialFiltersScreen.definitionGroups[i].definitions.length ; j < len1 ; j++){
			 
			 if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].multiselect == 0){
				
				if((this.props.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value != undefined && this.props.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value.length == 0) && this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value != '' ){ // add
					//console.log("add");
					if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 0){
						 temp_id = this.getIdOfArrayAndName([{id : 0 , name:'לא'} , {id : 1 , name : 'כן'}] , this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value ) ;
						 if(temp_id != -1){
							 addString += this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].id + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].name + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type + '|'  + temp_id + '|' + this.props.teamsScreen.editingTeamSectorialTemplateIndex   + ";" ;
						 }
					}
					else if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 1 || this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type ==2 ){
						temp_id = this.getIdOfArrayAndName(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].values , this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value ) ;
						if(temp_id != -1){
							 addString += this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].id + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].name + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type + '|'  + temp_id + '|' + this.props.editingTeamSectorialTemplateIndex   + ";" ;
						}
					}
					else if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type >= 3){
						addString += this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].id + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].name + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type + '|'  + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value  + '|' + this.props.editingTeamSectorialTemplateIndex  + ";" ;
					}
	 
				}
				else if((this.props.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value != undefined && this.props.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value != '') && this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value.trim() == '' ){ // add
					deleteString += this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].id + ",";
					
				}
				else if(this.props.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value != this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value ){ // add
				    //console.log("Edit");
					if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 0){
						 temp_id = this.getIdOfArrayAndName([{id : 0 , name:'לא'} , {id : 1 , name : 'כן'}] , this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value ) ;
						 if(temp_id != -1){
							 editString += this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].id + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].name + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type + '|'  + temp_id  + '|' + this.props.editingTeamSectorialTemplateIndex  + ";" ;
						 }
					}
					else if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 1 || this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type ==2 ){
						temp_id = this.getIdOfArrayAndName(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].values , this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value ) ;
						if(temp_id != -1){
							 editString += this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].id + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].name + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type + '|'  + temp_id + '|' + this.props.editingTeamSectorialTemplateIndex  + ";" ;
						}
					}
					else if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type >= 3){
						editString += this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].id + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].name + '|' + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type + '|'  + this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value + '|' + this.props.editingTeamSectorialTemplateIndex  + ";" ;
					}
				}
			 }
			 else{
		 
				// console.log(this.props.originalDefValues[i][j].def_values);
				 if(this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 1 || this.props.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 2){
				  }
			 }
				
		   }
       	
		}
 	         deleteString = deleteString.slice(0 , -1);
	         addString = addString.slice(0 , -1);
			 editString = editString.slice(0 , -1);
			  
			//if(!(deleteString == '' && editString == '' && addString == '')){
             
			
			 this.rendered=undefined;
			 SystemActions.addEditDeleteTplFilters(this.props.dispatch , this.props.router.params.teamKey , 
			  this.props.teamsScreen.sectorialTemplates[this.props.teamsScreen.editingTeamSectorialTemplateIndex].key , this.props.sectorialFiltersScreen.filterNameHeader  , addString , editString , deleteString );
		    this.loadedSectorialEntityData=undefined;
			//}
			
		}
		}
	}
	
	changeSectorialFilterNameHeader(e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.filters' });
		this.props.dispatch({
            type: GlobalActions.ActionTypes.GEO_FILTERS.FILTER_NAME_HEADER_CHANGE , 
            data:e.target.value			
        });  
	}
	
	getIdOfArrayAndName(theArray , theName){
	   let returnedValue = -1;
	   
	   if(theArray != undefined){
	   for(let i = 0 , len = theArray.length ; i<len ; i++){
		  
		   if(theArray[i].name == theName || theArray[i].value == theName){
			   returnedValue = theArray[i].id;
			  
			   break;
		   }
	   }
	   }
	   return returnedValue;
   }
	
	ChangeDefItem(defGroupIndex , defIndex , e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.filters' });
		 this.props.dispatch({
            type: GlobalActions.ActionTypes.GEO_FILTERS.FILTER_ITEM_CHANGE  , 
			defGroupIndex , defIndex , newVal:e.target.value , multiArray:e.target.selectedItems
        });
		if(this.props.sectorialFiltersScreen.definitionGroups[defGroupIndex].definitions[defIndex].multiselect == 0){
			 
			let itemID = this.getIdOfArrayAndName(this.props.sectorialFiltersScreen.definitionGroups[defGroupIndex].definitions[defIndex].values , e.target.value);
			GlobalActions.loadDependenciesLists(this.props.dispatch , this.props.sectorialFiltersScreen.definitionGroups[defGroupIndex].definitions[defIndex].id , itemID);	
		}
        else{
        }	
	}
	
    render() {
		if(this.props.display){
			
			let filterItems = '';
			let self = this;
			if(this.props.sectorialFiltersScreen.definitionGroups != undefined){
				 
				 filterItems = this.props.sectorialFiltersScreen.definitionGroups.map(function (request, i) {
					     let definitionItems1 = '';
						 let definitionItems2 = '';
						 let definitionValueContainer = '';
						 
						 definitionItems1 = request.definitions.map(function (defRequest, j) 
						 {
							  
							 
							 if(j%2 == 0){
					    	 
                         switch(defRequest.type){
                                case 0:
							        definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} value={"" + defRequest.def_value} items={[{id : 0 , name:'לא'} , {id : 1 , name : 'כן'}]}  itemIdProperty="id" itemDisplayProperty='name' />
							        break;
									 
								case 1:
							         if(defRequest.multiselect == 1)
									 {
							          definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} items={defRequest.values} multiSelect={true} value={""} defaultSelectedItems={defRequest.def_values} itemIdProperty="id" itemDisplayProperty='value' maxDisplayItems={5} />;
									 }
									 else
									   definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} items={defRequest.values} value={"" + defRequest.def_value} itemIdProperty="id" itemDisplayProperty="value" maxDisplayItems={5}  />;
									 
									break;
								 
								case 2:
								    if(defRequest.multiselect == 1)
							          definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} items={defRequest.values} multiSelect={true} value="" defaultSelectedItems={defRequest.def_values} itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} />;
							        else
									  definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} items={defRequest.values} value={"" + defRequest.def_value} itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} />;
									break;
									
								case 3:
							        definitionValueContainer = <input type='text' onChange={self.ChangeDefItem.bind(self , i , j)} value={defRequest.def_value} className="form-control" style={{width:'60px'}} />
							        break;
								case 4:
							        definitionValueContainer = <input type='text' onChange={self.ChangeDefItem.bind(self , i , j)} value={defRequest.def_value} className="form-control" style={{width:'60px'}} />
							        break;
								case 5:
							        definitionValueContainer = <input type='text' onChange={self.ChangeDefItem.bind(self , i , j)} value={defRequest.def_value} className="form-control" style={{width:'120px'}} />
							        break;
						     }
								 
							 return  <div className="row" id={j} key={j}>
										<div className="col-md-12">
										  <div className="row">
										   <div className="col-md-6">
										   {defRequest.name} : 
										   </div>
										   <div className="col-md-6">
										   {definitionValueContainer}
										   </div>
										  </div>
										</div>
									 </div>;
															
							 }
					     });
						 
						 definitionItems2 = request.definitions.map(function (defRequest, j) 
						 {
							 if(j%2 == 1){
					    	
							 switch(defRequest.type){
                                case 0:
							         definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} value={"" + defRequest.def_value} items={[{id : -1 , name:''} , {id : 0 , name:'לא'} , {id : 1 , name : 'כן'}]}  itemIdProperty="id" itemDisplayProperty='name' />
							        break;
								case 1:
							       if(defRequest.multiselect == 1)
							          definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} items={defRequest.values} multiSelect={true} value={"" + defRequest.def_value} defaultSelectedItems={defRequest.def_values} itemIdProperty="id" itemDisplayProperty='value' maxDisplayItems={5} />;
							        else
										 
									  definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} items={defRequest.values} value={""+defRequest.def_value} itemIdProperty="id" itemDisplayProperty='value' maxDisplayItems={5} />;
									break;
									 
								case 2:
								    if(defRequest.multiselect == 1){
							           definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} items={defRequest.values} multiSelect={true} value="" defaultSelectedItems={defRequest.def_values} itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} />;
							        
									}
									else
									   definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} items={defRequest.values} value={"" + defRequest.def_value} itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} />;
									break;
									 
								case 3:
							        definitionValueContainer = <input type='text' onChange={self.ChangeDefItem.bind(self , i , j)} value={defRequest.def_value} className="form-control" style={{width:'60px'}} />
							        break;
								case 4:
							        definitionValueContainer = <input type='text' onChange={self.ChangeDefItem.bind(self , i , j)} value={defRequest.def_value} className="form-control" style={{width:'60px'}} />
							        break;
								case 5:
							        definitionValueContainer = <input type='text' onChange={self.ChangeDefItem.bind(self , i , j)} value={defRequest.def_value} className="form-control" style={{width:'120px'}} />
							        break;
						     }
							  
							 return  <div className="row" id={j} key={j}>
										<div className="col-md-12">
										  <div className="row">
										   <div className="col-md-6">
										   {defRequest.name} : 
										   </div>
										   <div className="col-md-6">
										   {definitionValueContainer}
										   </div>
										  </div>
										</div>
									 </div>;
															
							 }
					     });
						
			              return  <div id={i} key={i} className="row">
                                           <div className="col-md-12">
											   <div className="ContainerCollapse">
                                                     <a  onClick={self.updateSectorialCollapseStatus.bind(self , i )}>
                                                       <div className="row panelCollapse" aria-expanded={false}>
                                                         <div className="collapseArrow closed"></div>
                                                         <div className="collapseArrow open"></div>
                                                         <div className="collapseTitle">{request.name}</div>
                                                       </div>
                                                     </a>
											        <Collapse  isOpened={request.is_opened ==1}>
													    <div className='row'>
														  <div className="col-md-6">
															{definitionItems1}
														  </div>
														  <div className="col-md-6">
															{definitionItems2}
														  </div>
														</div>
													 
													</Collapse>
													 
											   </div>
                                          </div>
										</div>;
			
			});
		 
			}
			
			this.rowsGeographical=this.props.teamsScreen.geoTemplates
                .map(function(item , i){
					let geoEditItem = ''
			        let geoDeleteItem = '';
					if(self.props.currentUser.admin || self.props.currentUser.permissions['system.teams.filters.geographic_filter_templates.edit']){
			           geoEditItem =<button type="button" className="btn btn-success btn-xs" onClick={self.editGeoTplRow.bind(self , i)} ><i className="fa fa-pencil-square-o"></i></button>;
			        }
			        if(self.props.currentUser.admin || self.props.currentUser.permissions['system.teams.filters.geographic_filter_templates.delete']){
			           geoDeleteItem =<button type="button" className="btn btn-danger btn-xs"  onClick={self.showConfirmDelete.bind(self , i)} ><i className="fa fa-trash-o"></i></button>;
			        }
					return <tr id={i} key={i}>
					   <td>{item.name}</td>
					   <td>{self.getEntityTypeName(item.entity_type)}</td>
					   <td>{item.full_path}</td>
					   <td>
					   {geoEditItem}&nbsp;
						   {geoDeleteItem}
					   </td>
					</tr>
					 });
			this.rowsSectorial=this.props.teamsScreen.sectorialTemplates
                .map(function(item , i){
					let sectorialEditItem = ''
			        let sectorialDeleteItem = '';
					if(self.props.currentUser.admin || self.props.currentUser.permissions['system.teams.filters.sectorial_filter_templates.edit']){
			           sectorialEditItem =<button type="button" className="btn btn-success btn-xs"  onClick={self.editSectorialTplRow.bind(self , i)}  ><i className="fa fa-pencil-square-o"></i></button>;
			        }
			        if(self.props.currentUser.admin || self.props.currentUser.permissions['system.teams.filters.sectorial_filter_templates.delete']){
			           sectorialDeleteItem =<button type="button" className="btn btn-danger btn-xs"  onClick={self.showConfirmDeleteSectorial.bind(self , i)} ><i className="fa fa-trash-o"></i></button>;
			        }
					return <tr id={i} key={i}>
					   <td>{i+1}</td>
					   <td>{item.name}</td>
					   <td>
					   {sectorialEditItem}&nbsp;
						   {sectorialDeleteItem}
					   </td>
					</tr>
					 });
					 
		  let firstCollapseItem = '' ; 
		  let secondCollapseItem = '' ;
   		  
		  
		  if(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.filters.geographic_filter_templates']){
             let addNewGeoItem='';
             if(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.filters.geographic_filter_templates.add']){
                addNewGeoItem = <button type="button" className="btn btn-primary btn-md" onClick={this.showNewGeoTemplateModal.bind(this)}   >
					                                       <span>+ הוספה</span>
					                                 </button>;
             } 
			 firstCollapseItem = <div className="ContainerCollapse">
                                                     <a  onClick={this.updateCollapseStatus.bind(this , 1 )}>
                                                       <div className="row panelCollapse" aria-expanded={false}>
                                                         <div className="collapseArrow closed"></div>
                                                         <div className="collapseArrow open"></div>
                                                         <div className="collapseTitle">תבניות מיקוד גיאוגרפי</div>
                                                       </div>
                                                     </a>
											        <Collapse  isOpened={this.props.teamsScreen.geoFilterOpened}>
													    <div className='row'>
														  <div className="col-md-12">
															<table className="table table-bordered table-striped table-hover lists-table">
				                                              <thead>
					                                             <tr>
						                                          <th>שם פילטר</th>
																  <th>סוג יישות</th>
																  <th>מסלול גיאוגרפי מלא</th>
																  <th></th>
					                                             </tr>
					                                          </thead>
					                                          <tbody>
					                                            {this.rowsGeographical}
					                                          </tbody>
				                                            </table>
														  </div>
														</div>
														{addNewGeoItem}
													</Collapse>
													 
				</div>;
		  }
		  if(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.filters.sectorial_filter_templates']){
			   let addNewSectorialItem='';
             if(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.filters.sectorial_filter_templates.add']){
                addNewSectorialItem = <button type="button" className="btn btn-primary btn-md" onClick={this.showNewSectorialTemplateModal.bind(this)}   >
					                                       <span>+ הוספה</span>
					                                 </button>;
             } 
			  
			  secondCollapseItem=<div className="ContainerCollapse">
                                                     <a  onClick={this.updateCollapseStatus.bind(this , 2 )}>
                                                       <div className="row panelCollapse" aria-expanded={false}>
                                                         <div className="collapseArrow closed"></div>
                                                         <div className="collapseArrow open"></div>
                                                         <div className="collapseTitle">תבניות מיקוד מגזרי</div>
                                                       </div>
                                                     </a>
											        <Collapse  isOpened={this.props.teamsScreen.sectorialFilterOpened}>
													    <div className='row'>
														  <div className="col-md-12">
															<table className="table table-bordered table-striped table-hover lists-table">
				                                              <thead>
					                                             <tr>
						                                          <th>#</th>
																  <th>שם המיקוד</th>
																  <th></th>
					                                             </tr>
					                                          </thead>
					                                          <tbody>
					                                            {this.rowsSectorial}
					                                          </tbody>
				                                            </table>
														  </div>
														</div>
														{addNewSectorialItem}
													</Collapse>
													 
				</div>;
		  }
		  let isAreaGroupValid = this.props.userScreen.geoFilterModalScreen.areaGroupName.length > 3 || this.getAreaGroupID(this.props.userScreen.geoFilterModalScreen.areaGroupName) != -1;
		  let isAreaValid = this.props.userScreen.geoFilterModalScreen.areaName.length > 3 || this.getAreaID(this.props.userScreen.geoFilterModalScreen.areaName) != -1;
		  let isValidFilter = isAreaValid || isAreaGroupValid;
		  let notValidFilterStyle = (isValidFilter) ? {}  : {borderColor: '#ff0000'};
	      return  <div>
		  {firstCollapseItem}
			  {secondCollapseItem}
				<ModalWindow show={this.props.teamsScreen.addingTeamGeoTemplate || this.props.teamsScreen.editingTeamGeoTemplate}   title={this.props.teamsScreen.geographicalModalHeader} 
				buttonOk={this.doGeoFilterAction.bind(this, isValidFilter)} buttonCancel={this.hideGeoFilterModal.bind(this)} buttonX={this.hideGeoFilterModal.bind(this)} style={{zIndex: '9001'   }}>
								 <div>
								       <div className="row">
                                           <div className="col-md-12">
										   שם פילטר
                                           : 										  
										 
										   <input type="text" className="form-control" style={{borderColor:(this.props.userScreen.geoFilterModalScreen.labelName.length <= 3 ?'#ff0000' : '#ccc')}} value={this.props.userScreen.geoFilterModalScreen.labelName}  onChange={this.newMainGeoFilterLabelNameChange.bind(this)} />
										   קבוצות אזורים : 
										   <Combo inputStyle={notValidFilterStyle}
											items={this.props.areasGroups} className="form-combo-table" value={this.props.userScreen.geoFilterModalScreen.areaGroupName} 
											zIndex={0} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateAreaGroupChange.bind(this)}  />
											
											 אזור : 
										   <Combo inputStyle={notValidFilterStyle}
											items={this.props.areas} className="form-combo-table" value={this.props.userScreen.geoFilterModalScreen.areaName} 
											zIndex={0} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateAreaChange.bind(this)}  />

										   תת אזור : 
										   <Combo items={this.props.subAreas} className="form-combo-table" value={this.props.userScreen.geoFilterModalScreen.subAreaName}
										    zIndex={0} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name'  onChange={this.newGeoTemplateSubAreaChange.bind(this)}  />
											
											עיר : 
										   <Combo items={this.props.userScreen.geoFilterModalScreen.cities} className="form-combo-table" value={this.props.userScreen.geoFilterModalScreen.cityName}
										    zIndex={0} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateCityChange.bind(this)} />
											
                                            שכונה : 
										   <Combo items={this.props.userScreen.geoFilterModalScreen.neighborhoods} className="form-combo-table" value={this.props.userScreen.geoFilterModalScreen.neighborhoodName}
										    zIndex={0} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateNeighborhoodChange.bind(this)} />
											
											 אשכול : 
										   <Combo items={this.props.userScreen.geoFilterModalScreen.clusters} className="form-combo-table" value={this.props.userScreen.geoFilterModalScreen.clusterName}
										    zIndex={0} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name'  onChange={this.newGeoTemplateClusterChange.bind(this)}  />
											
											 קלפי : 
										   <Combo items={this.props.userScreen.geoFilterModalScreen.ballots} className="form-combo-table" value={this.props.userScreen.geoFilterModalScreen.ballotName}
										    zIndex={0} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateBallotChange.bind(this)} />
											
											
                                          </div>
										</div>
								 </div>
								 <div style={{height:'100px'}}></div>
			    </ModalWindow>
				
				
				<ModalWindow show={this.props.teamsScreen.addingTeamSectorialTemplate || this.props.teamsScreen.editingTeamSectorialTemplate}   title={this.props.teamsScreen.sectorialModalHeader} buttonOk={this.doSectorialAction.bind(this)}
                                 buttonCancel={this.hideThisSectorialModal.bind(this)}  buttonX={this.hideThisSectorialModal.bind(this)} style={{zIndex: '9001'    }}>
								 <div>
								   <br/>
								     שם פילטר : <input type="text" className="form-control" value={this.props.sectorialFiltersScreen.filterNameHeader} onChange={this.changeSectorialFilterNameHeader.bind(this)}
 									  style={{borderColor:(this.props.sectorialFiltersScreen.filterNameHeader.length < 3 ? '#ff0000' : '#ccc')}}  />
								    <br/>
								 {filterItems} 
								 </div>
								 <div style={{height:'100px'}}></div>
			     </ModalWindow>
				
		  </div>;
	    }
		else{
	       return  <div></div>;
		}
    }
}
;

function mapStateToProps(state) {
    return {
        teamsScreen : state.system.teamsScreen,
		userScreen : state.system.userScreen,
        areas: state.system.lists.areas , 	
        areasGroups: state.system.lists.areasGroups , 	
		subAreas: state.system.lists.subAreas , 
        sectorialFiltersScreen: state.global.sectorialFiltersScreen , 
        currentUser: state.system.currentUser,		
    };
}

export default connect(mapStateToProps)(withRouter(TeamFilters));
