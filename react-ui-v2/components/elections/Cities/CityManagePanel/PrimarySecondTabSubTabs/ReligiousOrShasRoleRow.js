import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import Combo from 'components/global/Combo';
import ReactWidgets from 'react-widgets';
import {findElementByAttr , parseDateToPicker, parseDateFromPicker , isValidComboValue,formatPhone} from 'libs/globalFunctions';

class ReligiousOrShasRoleRow extends React.Component {

    constructor(props) {
        super(props);
    }
	
 
	 /*
	function that sets dynamic items in render() function : 
	*/
    initDynamicVariables() {
			  let item = this.props.item;
			  let phone = findElementByAttr(item.phones,'id',item.voter_phone_id);
			  item.phone_number = phone ? phone.phone_number:'';
			  let index = this.props.index;
			   
					if(this.props.hideHistoricalRows){
					  if(item.role_end != null && item.role_end != ''){
						  let endDatePartsArray = item.role_end.split("-");
						  let itemDateObject = (new Date(endDatePartsArray[1]+'/'+endDatePartsArray[2]+'/'+endDatePartsArray[0])).getTime();
						  let nowDateObject = (new Date()).getTime();
					  }
					}
				   
				  if(item.editing == true){
					  let editPartiesItem = [];
		              let selectedCampID = -1;
					  for(let i = 0 ; i <  this.props.campaignsList.length ; i++){
						  if(this.props.campaignsList[i].name == item.election_campaign_name){
							  selectedCampID  = this.props.campaignsList[i].id;
							  break;
						  }
						  
					  }
					  if(selectedCampID  >= 0){
			          editPartiesItem = this.props.allCityParties.filter(function(party){              
			             return party.election_campaign_id == selectedCampID
                      });
					  }
		                this.isShasOrCouncilNumberNumberItem = <td></td>;
	                    if(this.props.collectionName == 'religiousCouncilMembers'){
		                  this.isShasOrCouncilNumberNumberItem = <td><input type="checkbox" checked={item.shas == '1'} onChange={this.editCityRoleItemChange.bind(this , index , 'shas')}  /></td>;
	                    }
	                    // else{
						//    this.isShasOrCouncilNumberNumberItem = <input type="text" className="form-control" value={item.council_number}
						//     onChange={this.editCityRoleItemChange.bind(this , index , 'council_number')} style={{borderColor:(item.council_number==''?'#ff0000':'#ccc')}}  />;
	                    // }

                        let isValidatedRow= true;
                       isValidatedRow = isValidatedRow && isValidComboValue(this.props.secondGeneralTabScreen[this.props.rolesCollectionName],item.role_name , 'name');
                       isValidatedRow = isValidatedRow && isValidComboValue(item.phones,item.phone_number , 'phone_number' , true);
                       isValidatedRow = isValidatedRow && (!(item.role_end &&  parseDateToPicker(item.role_start) > parseDateToPicker(item.role_end)));
                      
					  if(this.props.collectionName != 'religiousCouncilMembers'){
							isValidatedRow = isValidatedRow && (item.council_number!='');
                        }
                       isValidatedRow = isValidatedRow && (parseDateToPicker(item.role_start) != null);
	 
					    this.rowItem= <tr key={index}>
										<td>
											<a title={item.first_name + ' '+ item.last_name}>{item.first_name + ' '+ item.last_name}</a>
										</td>
										<td>
											<Combo items={this.props.secondGeneralTabScreen[this.props.rolesCollectionName]}  maxDisplayItems={5}  itemIdProperty="id"
											 itemDisplayProperty='name' value={item.role_name} onChange={this.editCityRoleItemChange.bind(this , index , 'role_name')} 
											   inputStyle={{borderColor:(isValidComboValue(this.props.secondGeneralTabScreen[this.props.rolesCollectionName],item.role_name , 'name')?'#ccc' :'#ff0000')}}  />
										</td>
											<td>
											<Combo items={item.phones}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='phone_number' value={item.phone_number}
												onChange={this.editCityRoleItemChange.bind(this , index , 'selectedPhone')}
												inputStyle={{borderColor:(isValidComboValue(item.phones,item.phone_number , 'phone_number' , true)?'#ccc' :'#ff0000')}}  />
										</td>
										{this.isShasOrCouncilNumberNumberItem}
										<td>
										<ReactWidgets.DateTimePicker
												isRtl={true} time={false}
												value={parseDateToPicker(item.role_start)}
													onChange={parseDateFromPicker.bind(this, {
													callback: this.editFromDateChange,
													format: "YYYY-MM-DD",
													functionParams: index
													})
												}
													
													style={{borderColor:((parseDateToPicker(item.role_start) == null ) ? '#ff0000' :'#ccc')}} 
													format="DD/MM/YYYY"
											/>
										</td>
										<td>
										<ReactWidgets.DateTimePicker
												isRtl={true} time={false}
												value={parseDateToPicker(item.role_end)}
													onChange={parseDateFromPicker.bind(this, {
													callback: this.editToDateChange,
													format: "YYYY-MM-DD",
													functionParams: index
													})
												}
													
													style={{borderColor:((item.role_end &&  parseDateToPicker(item.role_start) > parseDateToPicker(item.role_end)) ? '#ff0000' :'#ccc')}} 
													format="DD/MM/YYYY"
											/>
										</td>
							
										<td className="status-data" colSpan="2">
											<button type="button" className="btn btn-success  btn-xs" disabled={!isValidatedRow}  onClick={this.saveRowData.bind(this,index)}  >
													<i className="fa fa-pencil-square-o" ></i>
											</button>
											&nbsp; &nbsp;
											<button type="button" className="btn btn-danger btn-xs" title="ביטול" onClick={this.setRowEdiding.bind(this,false,index)}>
												<i className="fa fa-times"></i>
											</button>
										</td>
									</tr>; 
					  
				  }
				  else{
                      let editItem = null;
					  let deleteItem = null;
					  if(!this.props.secondGeneralTabScreen[this.props.newScreenName].visible && this.props.editsCount == 0){
						 if(this.props.isAuthorizedEdit){ 
                            editItem = <a title="ערוך" style={{cursor:'pointer'}} onClick={this.setRowEdiding.bind(this,true,index)}>
                                                                <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                                            </a>;
                         }
                         if(this.props.isAuthorizedDelete){
						  deleteItem = <a title="מחק" style={{cursor:'pointer'}} onClick={this.props.confirmDeleteCityRole.bind(this,index)}>
                                                                <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                                                            </a>;
                         }
					  }
					  let religiousCouncilMembers=this.props.collectionName == 'religiousCouncilMembers'?true:false

			       this.rowItem=<tr key={index}>
							<td>
							<Link title={item.first_name + ' '+ item.last_name}  to={'elections/voters/'+item.voter_key} target="_blank" >{item.first_name + ' '+ item.last_name}</Link>

							</td>
							<td>{item.role_name}</td>
							<td>{formatPhone(item.phone_number)}</td>
							<td>{religiousCouncilMembers? (item.shas == '1' ? 'כן' : 'לא'):'' }</td>
							<td>{item.role_start.split('-').reverse().join('/')}</td>
							<td>{item.role_end?item.role_end.split('-').reverse().join('/'):''}</td>
							<td className="status-data">
								{editItem}
							</td>
							<td className="status-data">
								{deleteItem}
							</td>
						</tr>; 
				  }
			  
		
    }
	
	
	/*
	do real save of row data via api
	
	@param rowIndex
	*/
	saveRowData(index){
		let rowScreen = this.props.secondGeneralTabScreen[this.props.collectionName][index];
		let dataRequest = {};
		let validatedRole = false;
		let validatedPhone = false;
		 
		for(let i = 0 ; i<this.props.secondGeneralTabScreen[this.props.rolesCollectionName].length ; i++){
				if(this.props.secondGeneralTabScreen[this.props.rolesCollectionName][i].name == rowScreen.role_name){
					dataRequest.role_key = this.props.secondGeneralTabScreen[this.props.rolesCollectionName][i].key;
				    validatedRole = true
                    break;				
				}
		}	
		 
		dataRequest.voter_phone_key = null;
		if(rowScreen.phone_number){
			for(let i = 0 ; i<rowScreen.phones.length ; i++){
					if(rowScreen.phones[i].phone_number == rowScreen.phone_number){
						dataRequest.voter_phone_key = rowScreen.phones[i].key;
						validatedPhone= true;
						break;				
					}
			}
		}else{
			validatedPhone=true;
		}

		 
		if(!validatedRole || !validatedPhone){
			return ;
		}

         
		if(this.props.collectionName == 'cityShasRolesByVoters'){
			if(rowScreen.council_number == ''){ // wrong council_number validation
				return;
			}
			if(this.council_number != rowScreen.council_number){
				dataRequest.council_number = rowScreen.council_number;
		    }
			dataRequest.role_type = 1; //city shas role
		}
		else{
			if(this.shas != rowScreen.shas){
				dataRequest.shas = rowScreen.shas;
		    }
			dataRequest.role_type = 0; //religeous role
		}
		
		if(rowScreen.role_start == null || rowScreen.role_start == '' ){ // wrong role_start validation
			return;
		}
		
		if(this.role_start != rowScreen.role_start){
			dataRequest.role_start = rowScreen.role_start;
		}
		
	    dataRequest.role_end = rowScreen.role_end;
		
		ElectionsActions.updateReligeousOrShasRole(this.props.dispatch , this.props.router.params.cityKey ,  rowScreen.key , dataRequest , index , this.props.collectionName);
		 this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:('elections.cities.roles.religeous.'+this.props.newScreenName+'.edit')});		
	}
 
   
	 

	/*
	Set specific row editing
	
	@param show
	@param index
	*/
	setRowEdiding(show , index){
		if(show){ //save original
            this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:('elections.cities.roles.religeous.'+this.props.newScreenName+'.edit')});
		    let rowScreen = this.props.secondGeneralTabScreen[this.props.collectionName][index];
			this.setState({role_name : rowScreen.role_name});
			this.setState({phone_number : rowScreen.phone_number});
			this.setState({council_number : rowScreen.council_number});
			this.setState({shas : rowScreen.shas});
			this.setState({role_start : rowScreen.role_start});
			this.setState({role_end : rowScreen.role_end});
		}
		else{ //in case of cancel - restore value
            this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:('elections.cities.roles.religeous.'+this.props.newScreenName+'.edit')});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'role_name' ,
				fieldValue:this.state.role_name
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'phone_number' ,
				fieldValue:this.state.phone_number
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'council_number' ,
				fieldValue:this.state.council_number
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'shas' ,
				fieldValue:this.state.shas
			});
			 
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'role_start' ,
				fieldValue:this.state.role_start
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'role_end' ,
				fieldValue:this.state.role_end
			});
		}
		this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				rowIndex : index , 
				fieldName:'editing' ,
				fieldValue:show
			});
		
	}
	
	/*
	Handle edit row screen - item value change : 
	*/
	editCityRoleItemChange(index , fieldName , e){
		if(fieldName == 'shas'){
			
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				rowIndex : index , 
				fieldName ,
				fieldValue:(e.target.checked ?'1':'0')
			});
		}else if(fieldName=='selectedPhone'){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				rowIndex : index , 
				fieldName:'voter_phone_id' ,
				fieldValue:e.target.selectedItem ? e.target.selectedItem.id : ''
			});
		}else {
			if(fieldName == 'election_campaign_name'){
				
				this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				rowIndex : index , 
				fieldName:'letters' ,
				fieldValue:''
			});
			}
			else if(fieldName == 'council_number' ){
				if(e.target.value == '0' || !new RegExp('^[0-9]*$').test(e.target.value)){ // allow only numbers in personal-identity field
			      return;
			    }
				if(parseInt(e.target.value) > 999){
					return;
				}
			}
		
		    this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				rowIndex : index , 
				fieldName ,
				fieldValue:e.target.value
			});
		}
			
		
	}
	
		/*
	Handles change in edit from_date field : 
	*/
	editFromDateChange(value,format, index) {
		if(value == null){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				fieldName:'role_start' ,
				fieldValue:'' , 
				rowIndex:index
			});
			
		}
		else{
		this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				fieldName:'role_start' ,
				fieldValue:value , 
				rowIndex:index
			});
		}
    }
	
	/*
	Handles change in edit to_date field : 
	*/
	editToDateChange(value,format, index) {
		if(value == null){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				fieldName:'role_end' ,
				fieldValue:'' , 
				rowIndex:index
			});
			
		}
		else{
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				fieldName:'role_end' ,
				fieldValue:value , 
				rowIndex:index
			});
		}

         
    }
	
 
    render() {
 
		this.initDynamicVariables();
 
        return (
          this.rowItem
        );
    }
}


function mapStateToProps(state) {
    return {
            allCityDepartments:state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen.allCityDepartments,
	        allCityParties:state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen.allCityParties,
			secondGeneralTabScreen:state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen,
            campaignsList : state.elections.citiesScreen.cityPanelScreen.campaignsList,
    }
}

export default connect(mapStateToProps)(withRouter(ReligiousOrShasRoleRow));