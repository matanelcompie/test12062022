import React from 'react'
import * as GlobalActions from '../../actions/GlobalActions';
import {connect} from 'react-redux';
import Collapse from 'react-collapse';
import {Link, withRouter} from 'react-router';
import {dateTimeReversePrint} from '../../libs/globalFunctions';
import ModalWindow from './ModalWindow';
import Combo from './Combo';
class SectorialFiltersModal extends React.Component {
 
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
 
   changeFilterNameHeader(e){
	  this.props.dispatch({
            type: GlobalActions.ActionTypes.GEO_FILTERS.FILTER_NAME_HEADER_CHANGE , 
            data:e.target.value			
        });  
   }
 
   hideThisModal(){
	   this.rendered=undefined;
	   this.props.dispatch({
            type: GlobalActions.ActionTypes.GEO_FILTERS.CLOSE_ADD_EDIT_GEO_FILTER_MODAL 
        }); 
   }
   
   doAction(){
	   if(this.props.filterNameHeader.trim() != ''){
	let allDefItemsWithVals = '';
	
	let editString = '';
		let deleteString = '';
		let addString = '' ;
		let addEditStringMultiItems = '';
		let deleteStringMultiItems = '';
		let temp_id = -1;
	   if(this.props.isAdding){

	for(let i = 0 , len = this.props.geoFiltersDefinitionGroups.length ; i< len ; i++){
		    for(let j = 0 , len1 = this.props.geoFiltersDefinitionGroups[i].definitions.length ; j< len1 ; j++){
				//console.log("type :" + this.props.geoFiltersDefinitionGroups[i].definitions[j].type);
				let values = [];
				let string_val = null;
				let number_val = null;
				let multi_vals='';
				let temp_def_value = '';
				let temp_def_id = -1;
				if(this.props.geoFiltersDefinitionGroups[i].definitions[j].type <= 2){
					
					if(this.props.geoFiltersDefinitionGroups[i].definitions[j].multiselect == 0 || this.props.geoFiltersDefinitionGroups[i].definitions[j].type == 0){
						if(this.props.geoFiltersDefinitionGroups[i].definitions[j].def_value != ''){
					      temp_def_value = this.props.geoFiltersDefinitionGroups[i].definitions[j].def_value;
					      if(this.props.geoFiltersDefinitionGroups[i].definitions[j].type > 0){
						  temp_def_id = (this.getIdOfArrayAndName(this.props.geoFiltersDefinitionGroups[i].definitions[j].values , temp_def_value ) );					 
						 }
						  else{
							  temp_def_id = this.getIdOfArrayAndName([{id : 0 , name:'לא'} , {id : 1 , name : 'כן'}] , temp_def_value ) ;
						  
						  }
					 
 						 if(temp_def_id != -1){
							//  console.log("name: " + this.props.geoFiltersDefinitionGroups[i].definitions[j].name + " - value : " +  temp_def_id);
							allDefItemsWithVals += this.props.geoFiltersDefinitionGroups[i].definitions[j].id
                            + '|' +  this.props.geoFiltersDefinitionGroups[i].definitions[j].name 
					        + '|' + this.props.geoFiltersDefinitionGroups[i].definitions[j].type 
					        + '|' + this.props.geoFiltersDefinitionGroups[i].definitions[j].multiselect 
					        + '|' + temp_def_id
					        + ';';
						  }
						}
					}
					else{
						let values = [];
						if(this.props.geoFiltersDefinitionGroups[i].definitions[j].def_values != undefined){
						  
    						  values = this.props.geoFiltersDefinitionGroups[i].definitions[j].def_values;
						}
						if(values.length > 0){
							let valuesStr = '';
							
							for(let k = 0 ; k<values.length ; k++){
								if(this.props.geoFiltersDefinitionGroups[i].definitions[j].type==1){
								    valuesStr += values[k].value  + ',';
								}
								else if(this.props.geoFiltersDefinitionGroups[i].definitions[j].type == 2){
									valuesStr += values[k].name  + ',';
								}
							}
							valuesStr = valuesStr.slice(0,-1);
							allDefItemsWithVals += this.props.geoFiltersDefinitionGroups[i].definitions[j].id
                            + '|' +  this.props.geoFiltersDefinitionGroups[i].definitions[j].name 
					        + '|' + this.props.geoFiltersDefinitionGroups[i].definitions[j].type 
					        + '|' + this.props.geoFiltersDefinitionGroups[i].definitions[j].multiselect 
					        + '|' + valuesStr
					        + ';';
							 // console.log("name: " + this.props.geoFiltersDefinitionGroups[i].definitions[j].name + " - value : " +  valuesStr);
						}
					}
				}
				else{ //text field
					if(this.props.geoFiltersDefinitionGroups[i].definitions[j].def_value.trim() != ''){
						//console.log("name: " + this.props.geoFiltersDefinitionGroups[i].definitions[j].name + " - value : " +  this.props.geoFiltersDefinitionGroups[i].definitions[j].def_value);
					allDefItemsWithVals += this.props.geoFiltersDefinitionGroups[i].definitions[j].id
                    + '|' +  this.props.geoFiltersDefinitionGroups[i].definitions[j].name 
					+ '|' + this.props.geoFiltersDefinitionGroups[i].definitions[j].type 
					+ '|' + this.props.geoFiltersDefinitionGroups[i].definitions[j].multiselect 
					+ '|' + this.props.geoFiltersDefinitionGroups[i].definitions[j].def_value
					+ ';';
					}
				}
				
			}
	}
	allDefItemsWithVals = allDefItemsWithVals.slice(0,-1);
	   }	   
	   else if(this.props.isEditing){
         for(let i =0 , len = this.props.definitionGroups.length ; i < len ; i++){
		   for(let j =0 , len1 = this.props.definitionGroups[i].definitions.length ; j < len1 ; j++){
			 
			 if(this.props.definitionGroups[i].definitions[j].multiselect == 0){
				 
				if((this.props.originalDefValues[i][j].def_value != undefined && this.props.originalDefValues[i][j].def_value.length == 0) && this.props.definitionGroups[i].definitions[j].def_value != '' ){ // add
					//console.log("add");
					if(this.props.definitionGroups[i].definitions[j].type == 0){
						 temp_id = this.getIdOfArrayAndName([{id : 0 , name:'לא'} , {id : 1 , name : 'כן'}] , this.props.definitionGroups[i].definitions[j].def_value ) ;
						 if(temp_id != -1){
							 addString += this.props.definitionGroups[i].definitions[j].id + '|' + this.props.definitionGroups[i].definitions[j].name + '|' + this.props.definitionGroups[i].definitions[j].type + '|'  + temp_id + '|' + this.props.editSetorialFilterID   + ";" ;
						 }
					}
					else if(this.props.definitionGroups[i].definitions[j].type == 1 || this.props.definitionGroups[i].definitions[j].type ==2 ){
						temp_id = this.getIdOfArrayAndName(this.props.definitionGroups[i].definitions[j].values , this.props.definitionGroups[i].definitions[j].def_value ) ;
						if(temp_id != -1){
							 addString += this.props.definitionGroups[i].definitions[j].id + '|' + this.props.definitionGroups[i].definitions[j].name + '|' + this.props.definitionGroups[i].definitions[j].type + '|'  + temp_id + '|' + this.props.editSetorialFilterID   + ";" ;
						}
					}
					else if(this.props.definitionGroups[i].definitions[j].type >= 3){
						addString += this.props.definitionGroups[i].definitions[j].id + '|' + this.props.definitionGroups[i].definitions[j].name + '|' + this.props.definitionGroups[i].definitions[j].type + '|'  + this.props.definitionGroups[i].definitions[j].def_value  + '|' + this.props.editSetorialFilterID  + ";" ;
					}
	 
				}
				else if((this.props.originalDefValues[i][j].def_value != undefined && this.props.originalDefValues[i][j].def_value != '') && this.props.definitionGroups[i].definitions[j].def_value.trim() == '' ){ // add
					deleteString += this.props.definitionGroups[i].definitions[j].id + ",";
					
				}
				else if(this.props.originalDefValues[i][j].def_value != this.props.definitionGroups[i].definitions[j].def_value ){ // add
				    //console.log("Edit");
					if(this.props.definitionGroups[i].definitions[j].type == 0){
						 temp_id = this.getIdOfArrayAndName([{id : 0 , name:'לא'} , {id : 1 , name : 'כן'}] , this.props.definitionGroups[i].definitions[j].def_value ) ;
						 if(temp_id != -1){
							 editString += this.props.definitionGroups[i].definitions[j].id + '|' + this.props.definitionGroups[i].definitions[j].name + '|' + this.props.definitionGroups[i].definitions[j].type + '|'  + temp_id  + '|' + this.props.editSetorialFilterID  + ";" ;
						 }
					}
					else if(this.props.definitionGroups[i].definitions[j].type == 1 || this.props.definitionGroups[i].definitions[j].type ==2 ){
						temp_id = this.getIdOfArrayAndName(this.props.definitionGroups[i].definitions[j].values , this.props.definitionGroups[i].definitions[j].def_value ) ;
						if(temp_id != -1){
							 editString += this.props.definitionGroups[i].definitions[j].id + '|' + this.props.definitionGroups[i].definitions[j].name + '|' + this.props.definitionGroups[i].definitions[j].type + '|'  + temp_id + '|' + this.props.editSetorialFilterID  + ";" ;
						}
					}
					else if(this.props.definitionGroups[i].definitions[j].type >= 3){
						editString += this.props.definitionGroups[i].definitions[j].id + '|' + this.props.definitionGroups[i].definitions[j].name + '|' + this.props.definitionGroups[i].definitions[j].type + '|'  + this.props.definitionGroups[i].definitions[j].def_value + '|' + this.props.editSetorialFilterID  + ";" ;
					}
				}
			 }
			 else{
		 
				// console.log(this.props.originalDefValues[i][j].def_values);
				 if(this.props.definitionGroups[i].definitions[j].type == 1 || this.props.definitionGroups[i].definitions[j].type == 2){
					if(this.props.definitionGroups[i].definitions[j].def_values.length == 0){
						
                         deleteStringMultiItems += this.props.definitionGroups[i].definitions[j].id + ',' ;
					}
                    else{
						 
						let addEditString = false;
						if(this.props.definitionGroups[i].definitions[j].def_values.length != this.props.originalDefValues[i][j].def_values.length){
							addEditString = true;
						 
						}
						else{
							
							for (let y = 0 ; y < this.props.definitionGroups[i].definitions[j].def_values.length ; y++){
							  let findCounter = 0;
							  for (let z = 0 ; z < this.props.originalDefValues[i][j].def_values.length ; z++){	 
                                if(this.props.originalDefValues[i][j].def_values[z].value ==  this.props.definitionGroups[i].definitions[j].def_values[y].value || this.props.originalDefValues[i][j].def_values[z].name ==  this.props.definitionGroups[i].definitions[j].def_values[y].value){
								  findCounter++;
							    }
							  }
							  if(findCounter ==0){
								  addEditString = true;
								  break;
							  }
							  
							}
						
							}
			
							if(addEditString){
								addEditStringMultiItems =  this.props.definitionGroups[i].definitions[j].id + '|' ;
							    for(let r = 0 ; r<this.props.definitionGroups[i].definitions[j].def_values.length ; r++){
									//console.log(this.props.definitionGroups[i].definitions[j].def_values[r]);
									 if(this.props.definitionGroups[i].definitions[j].type == 1){
									    addEditStringMultiItems += this.props.definitionGroups[i].definitions[j].def_values[r].value +',';
									 }
									 else{
										  addEditStringMultiItems += this.props.definitionGroups[i].definitions[j].def_values[r].name +',';
									 }
								}
								 
								addEditStringMultiItems = addEditStringMultiItems.slice(0,-1);
								addEditStringMultiItems += ';';
								
							}
						
					}						
				 }
			 }
				
		   }
       	
		}
 	
			
		 //console.log(this.props.definitionGroups);
		 //console.log(this.props.originalDefValues);
	   }	   	 
	
	         deleteString = deleteString.slice(0 , -1);
	         addString = addString.slice(0 , -1);
			 editString = editString.slice(0 , -1);
			 deleteStringMultiItems = deleteStringMultiItems.slice(0 , -1);
			 addEditStringMultiItems = addEditStringMultiItems.slice(0 , -1);
	
    	if(this.props.addingUserRole){ //add/edit to temp array
		   if(this.props.isAdding){ //add to temp array
			   //console.log('add to temp array');
			   this.props.dispatch({
                    type: GlobalActions.ActionTypes.GEO_FILTERS.ADD_TEMP_GEO_FILTER_TO_TEMP_ROLE_ARR  , 
			        data:allDefItemsWithVals
               }); 
		   }
		   else if(this.props.isEditing){ //edit to temp array
		  
			    this.props.dispatch({
                         type: GlobalActions.ActionTypes.GEO_FILTERS.EDIT_TEMP_SECTORIAL_FILTERS_OF_NEW_ROLE  , 
			             addString , editString , deleteString , rowIndex  :this.props.editSectorialFilterRecordIndex
                     }); 
		   }
	   }
	   else{ // else add to existing role or temp array
	   
	//console.log(allDefItemsWithVals);
	if(this.props.isAdding){
     if(this.props.router.params.userKey == 'new'){
		 
	 }
	 else{
      if(allDefItemsWithVals != ''){
        GlobalActions.addNewSectorialFilterToRoleByUser(this.props.dispatch , this.props.router.params.userKey , this.props.roleUserID , allDefItemsWithVals , this.props.roleUserIndex , this.props.filterNameHeader);
	  }
	 }
	}
    else if(this.props.isEditing){
		 
		  if(this.props.router.params.userKey == 'new'){
		 
	 }
	 else{
		
		 if(!(deleteString == '' && editString == '' && addString == '' && addEditStringMultiItems == ''  &&  deleteStringMultiItems == '')){
             
			
			 this.rendered=undefined;
			 GlobalActions.AddEditDeleteFilters(this.props.dispatch , this.props.router.params.userKey , 
			   this.props.roleUserID  , this.props.roleUserIndex , addString , editString , deleteString , addEditStringMultiItems , deleteStringMultiItems , this.props.filterNameHeader , this.props.editSetorialFilterID );
		}
	 }
	 
		 
		
		
		
	}
	   }	
	   }
   }

   updateCollapseStatus(index , e){
	    this.props.dispatch({
            type: GlobalActions.ActionTypes.GEO_FILTERS.UPDATE_COLLAPSE_STATUS_OF_DEF_GROUP  , 
			rowIndex:index
        }); 
   }
   
   ChangeDefItem(defGroupIndex , defIndex , e){
	   // console.log(e.target.selectedItems); //- multiselect
	    this.props.dispatch({
            type: GlobalActions.ActionTypes.GEO_FILTERS.FILTER_ITEM_CHANGE  , 
			defGroupIndex , defIndex , newVal:e.target.value , multiArray:e.target.selectedItems
        });
		if(this.props.definitionGroups[defGroupIndex].definitions[defIndex].multiselect == 0){
			 
			let itemID = this.getIdOfArrayAndName(this.props.definitionGroups[defGroupIndex].definitions[defIndex].values , e.target.value);
			GlobalActions.loadDependenciesLists(this.props.dispatch , this.props.definitionGroups[defGroupIndex].definitions[defIndex].id , itemID);	
		}
        else{
        }			
   }
   
    /*Render component*/
    render() {	 
		   if(this.props.isEditing){ //here this will load filter items by user role ONCE only per window
			   if(this.rendered ==undefined){
				 this.rendered=1;
				 if(this.props.addingUserRole){
					 
					GlobalActions.loadTempSectorialFilterDefinitionGroupsValuesOnly(this.props.dispatch , this.props.editSectorialFilterRecordIndex);
				 }
				 else{
				    GlobalActions.loadGeoFilterDefinitionGroupsValuesOnly(this.props.dispatch , this.props.roleUserID);
				 }
			   }
			 
		   }
		
		let self = this;
		let filterItems = '';
			if(this.props.geoFiltersDefinitionGroups != undefined){
		        filterItems = this.props.geoFiltersDefinitionGroups.map(function (request, i) {
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
									   definitionValueContainer = <Combo onChange={self.ChangeDefItem.bind(self , i , j)} items={defRequest.values} value={"" + defRequest.def_value} itemIdProperty="id" itemDisplayProperty="value"  maxDisplayItems={5} />;
									 
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
                                                     <a  onClick={self.updateCollapseStatus.bind(self , i )}>
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
		
		
         return <div>
		 
		 
		     <ModalWindow show={this.props.isAdding || this.props.isEditing}   title={this.props.modalMainTitle} buttonOk={this.doAction.bind(this)}
                                 buttonCancel={this.hideThisModal.bind(this)} style={{zIndex: '9001'    }}>
								 <div>
								   <br/>
								     שם פילטר : <input type="text" className="form-control" value={this.props.filterNameHeader} onChange={this.changeFilterNameHeader.bind(this)}
 									  style={{borderColor:(this.props.filterNameHeader.trim() == '' ? '#ff0000' : '#ccc')}}  />
								    <br/>
								 {filterItems} 
								 </div>
								  <div style={{height:'100px'}}></div>
			 </ModalWindow>
		 </div>;
    }
}

function mapStateToProps(state) {

    return {
		 editSetorialFilterID : state.global.sectorialFiltersScreen.editSetorialFilterID ,
		 filterNameHeader : state.global.sectorialFiltersScreen.filterNameHeader,
         geoFiltersDefinitionGroups : state.global.sectorialFiltersScreen.definitionGroups,
		 isEditing : state.global.sectorialFiltersScreen.isEditing,
		 isAdding : state.global.sectorialFiltersScreen.isAdding,
		 addingUserRole: state.system.userScreen.addingUserRole,
		 modalMainTitle : state.global.sectorialFiltersScreen.modalMainTitle,
		 definitionGroups : state.global.sectorialFiltersScreen.definitionGroups,
		 originalDefValues : state.global.sectorialFiltersScreen.valuesOfAllDefinitionGroups,
		 roleUserID : state.global.sectorialFiltersScreen.role_by_user_id,
		 roleUserIndex :state.global.sectorialFiltersScreen.roleUserIndex, 
		 editSectorialFilterRecordIndex:state.global.sectorialFiltersScreen.editSectorialFilterRecordIndex  , 
		 editSectorialFilterDefinitionID:state.global.sectorialFiltersScreen.editSectorialFilterDefinitionID  , 
		 editSectorialFilterDefinitionGroupID:state.global.sectorialFiltersScreen.editSectorialFilterDefinitionGroupID  , 
         definitionValues:state.global.sectorialFiltersScreen.definitionValues,
	}
}

export default connect(mapStateToProps)(withRouter(SectorialFiltersModal));