import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import * as VoterActions from '../../../../../actions/VoterActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import ReligiousOrShasRoleRow from './ReligiousOrShasRoleRow';
import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import { parseDateToPicker, parseDateFromPicker , isValidComboValue} from '../../../../../libs/globalFunctions';
import {validatePhoneNumber} from 'libs/globalFunctions'


class ReligiousOrShasRoles extends React.Component {

    constructor(props) {
        super(props);
		this.state = {
            isReturned: false,
            shouldRedirectToSearchVoter: false
        };
		momentLocalizer(moment); 
        this.initConstants();
    }

	componentWillMount(){
			this.setState({
                    hideHistoricalRows:true ,
                    phoneIsValid:true 
			});
	}
   

	/*
	function that initializes constant variables 
	*/
    initConstants() {
		  this.mouseClickCursorStyle={cursor:'pointer'};
		  let religiousCouncilMembers=this.props.collectionName == 'religiousCouncilMembers'?true:false
		  this.listHeader=<tr>
							<th>שם</th>
							<th>תפקיד</th>
							<th>נייד</th>
							<th width={religiousCouncilMembers?'10%':'1%'}>{religiousCouncilMembers?'נציג ש"ס':''}</th>
							<th>תאריך תחילת תפקיד</th>
							<th>תאריך סיום תפקיד</th>
							<th className="status-data"></th>
							<th className="status-data"></th>
						</tr>;
		
	}
	
	
		/*
	 Show confirm delete modal dialog
	 
	 @param deleteRowIndex - if is (-1) then hide dialog, else show
	 
	*/
	confirmDeleteCityRole(deleteRowIndex){
    
          this.props.dispatch({
            type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_SECOND_TAB_ITEM_VALUE_BY_NAME,
            itemName: (this.props.collectionName +(this.props.displayMode == 'ACTUAL_ROLES_ONLY'?'':'History') +'DeleteIndex') , 
			itemValue : deleteRowIndex
        });

	}
	
	/*
	Handles change in add-new-role screen item : 
	*/
    newCityRoleItemChange(fieldName , e){
		let value = e.target.value;
        let selectedItem=e.target.selectedItem;
 
		if(fieldName == 'personalIdentity'){
			if(!new RegExp('^[0-9]*$').test(value)){ // allow only numbers in personal-identity field
			   return;
			}
			else{ //every change in identity number will clean found voter : 
				if(!(this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.first_name || this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.firstName)){
				}
				else{
					
					this.props.dispatch({
                    type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
                    screenName:this.props.newScreenName,
			        itemName:'foundVoter' ,
			        itemValue:[]
                    });
					
					this.props.dispatch({
                    type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
                    screenName:this.props.newScreenName,
			        itemName:'fullVoterName' ,
			        itemValue:''
                    });
				}
			}
	    } 

		if( fieldName == 'selectedRole'||fieldName == 'selectedPhone'){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:fieldName ,
				itemValue:{selectedValue:value, selectedItem:selectedItem}
			});
			if(fieldName == 'selectedPhone'){this.checkPhoneNumber(value,selectedItem)}
		}
		else if(fieldName == 'shas'){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:fieldName ,
				itemValue:(e.target.checked?'1':'0')
			});
		}else{
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:fieldName ,
				itemValue:value
			});
		}

	}	
	checkPhoneNumber(phoneNumber,selectedItem){
		let phoneIsValid=true;
		if(selectedItem){
			phoneIsValid = validatePhoneNumber(selectedItem.phone_number);
		}else if(phoneNumber){
			phoneIsValid = validatePhoneNumber(phoneNumber);
		}
		this.setState({phoneIsValid});
	}
	// checkPhoneValid(){
	// 	return (!this.props.secondGeneralTabScreen[this.props.newScreenName].selectedPhone.selectedItem &&
	// 		 this.props.secondGeneralTabScreen[this.props.newScreenName].selectedPhone.selectedValue.split(' ').join('') != '' )
	// }
	/*Handle key press "enter" at personal identity field - in new city-role row  */
    handleKeyPress(event) {
        if (event.charCode == 13) { /*if user pressed enter*/
            this.doSearchVoterAction();
        }
    }
	
    /*
	If personal identity field is not empty - it will search voter and will put it in the correct screen:
	*/
	doSearchVoterAction(){
		    if(this.props.secondGeneralTabScreen[this.props.newScreenName].personalIdentity == ''){
                 
            }
            else{
                 ElectionsActions.searchVoterByIdentity(this.props.dispatch , this.props.secondGeneralTabScreen[this.props.newScreenName].personalIdentity , this.props.newScreenName);

            }
	}
	
	componentDidUpdate(){
 
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

      
				 if (this.props.secondGeneralTabScreen[this.props.newScreenName].visible) {
		 
                   	this.props.dispatch({
                    type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
                    screenName:this.props.newScreenName,
			        itemName:'foundVoter' ,
			        itemValue:this.props.selectedVoterForRedirect
                    });
					this.props.dispatch({
                    type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
                    screenName:this.props.newScreenName,
			            itemName: 'personalIdentity', itemValue: this.props.selectedVoterForRedirect.personalIdentity
                    });
					this.props.dispatch({
                    type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
                    screenName:this.props.newScreenName,
			            itemName: 'fullVoterName', itemValue: (this.props.selectedVoterForRedirect.firstName + ' ' + this.props.selectedVoterForRedirect.lastName)
                    });
                }  

                this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_FOUND_VOTER_DATA, data });
                this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT });
            }
        }

        if (this.state.shouldRedirectToSearchVoter) {
            this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT });
			var returnUrl = 'elections/cities/' + this.props.router.params.cityKey;

			var data = {
				returnUrl: returnUrl,
				returnButtonText: "חזרה לניהול העיר"
			};

			// This dispatch changes the parameters in data object
			this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_REDIRECT_TO_SEARCH, data });
			this.props.router.push('elections/voters/search');
            this.setState({ shouldRedirectToSearchVoter: false, isReturned: false });
        }
	}
	
	/*
		It will redirect to voter search page : 
	*/
	doRedirectToSearchPage(){
		this.setState({ shouldRedirectToSearchVoter: true });
		this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: ('elections.cities.roles.religeous.'+this.props.newScreenName+'.add')});
	}
	
	/*
	Will show/hide outdated rows 
	*/
	showHideOutdatedRows(){
		this.setState({
                    hideHistoricalRows:!this.state.hideHistoricalRows 
			});
	}
 
    /*
	Performs real delete of council member via api : 
	*/
	doRealDeleteRow(){
		ElectionsActions.deleteReligeousOrShasRoleItem(this.props.dispatch , this.props.router.params.cityKey , this.props.secondGeneralTabScreen[this.props.collectionName][this.props.secondGeneralTabScreen[this.props.collectionName +(this.props.displayMode == 'ACTUAL_ROLES_ONLY' ? '' : 'History') +'DeleteIndex']].key , (this.props.collectionName == 'religiousCouncilMembers' ? 3 : 4));	
	}
 
    /*
	Function that sets dynamic items in render() function : 
	*/
    initDynamicVariables() {
	
       let editsCount = 0;
		for(let i =0;i<this.props.secondGeneralTabScreen[this.props.collectionName].length ; i++){
			if(this.props.secondGeneralTabScreen[this.props.collectionName][i].editing){
				editsCount++;
				break;
				
			}
		}

	    let isWrongPersonalIdentity =   !(this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.first_name || this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.firstName);
             
	   this.isShasOrCouncilNumberNumberItem = null;
	   if(this.props.collectionName == 'religiousCouncilMembers'){
		   this.isShasOrCouncilNumberNumberItem = <input type="checkbox" disabled={isWrongPersonalIdentity} checked={this.props.secondGeneralTabScreen[this.props.newScreenName].shas == '1'} onChange={this.newCityRoleItemChange.bind(this , 'shas')} />;
	   }
	   else{
		   this.isShasOrCouncilNumberNumberItem = null;
	   }
	
		this.confirmDeleteCityRoleItem = null;
		if(this.props.secondGeneralTabScreen[this.props.collectionName + (this.props.displayMode == 'ACTUAL_ROLES_ONLY'?'':'History')  +'DeleteIndex'] >=0){
		this.confirmDeleteCityRoleItem = <ModalWindow show={true} buttonOk={this.doRealDeleteRow.bind(this)}  buttonCancel={this.confirmDeleteCityRole.bind(this , -1)}  buttonX={this.confirmDeleteCityRole.bind(this , -1)} title={"אישור מחיקה"} style={{zIndex: '9001'}}>
                                                                <div>{"למחוק את התפקיד?"}</div>
                                                            </ModalWindow>;
															
		}
		
        this.addNewRowButton = null;
		if(!this.props.secondGeneralTabScreen[this.props.newScreenName].visible && !this.props.secondGeneralTabScreen[this.props.newScreenName].visibleHistory && this.props.displayMode!='HISTORY_ROLES_ONLY'  && editsCount == 0){
		  if(this.props.currentUser.admin == true || (this.props.collectionName == 'religiousCouncilMembers' && this.props.currentUser.permissions['elections.cities.roles.religious_council.add'] == true) || (this.props.collectionName == 'cityShasRolesByVoters' && this.props.currentUser.permissions['elections.cities.roles.shas.add'] == true)){
		    this.addNewRowButton = <a title={this.props.btnAddText} style={{fontWeight:'600' , cursor:'pointer'}} onClick={this.setAddingNewCouncilMember.bind(this,true)}><span>+</span>{this.props.btnAddText}</a>;
          }
		}
		this.newRowItem = null;
 
        if(this.props.secondGeneralTabScreen[this.props.newScreenName]['visible'+(this.props.displayMode == 'ACTUAL_ROLES_ONLY' ? '' :'History')]){
			  this.newRowItem=<tr className="edit-save-row">
                                                             
								<td>
									<div className="row">
									<div className='col-md-9 text-left no-padding'><input type="text" maxLength={9} className="form-control"  value={this.props.secondGeneralTabScreen[this.props.newScreenName].personalIdentity} onChange={this.newCityRoleItemChange.bind(this , 'personalIdentity')}   onKeyPress={this.handleKeyPress.bind(this)}  style={{borderColor:((this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.first_name || this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.firstName ) ? '#ccc' :'#ff0000')}} /></div><div className='col-sm-1 text-right  no-padding' style={{paddingTop:'4px' , paddingRight:'2px' , cursor:'pointer'}}><img src={window.Laravel.baseAppURL + 'Images/ico-search-blue.svg'} onClick={this.doRedirectToSearchPage.bind(this)} /></div>
																						
									</div>
									{this.props.secondGeneralTabScreen[this.props.newScreenName].fullVoterName}
								</td>
								<td>
										<Combo disabled={isWrongPersonalIdentity} items={this.props.secondGeneralTabScreen[this.props.rolesCollectionName]}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' value={this.props.secondGeneralTabScreen[this.props.newScreenName].selectedRole.selectedValue} onChange={this.newCityRoleItemChange.bind(this , 'selectedRole')}   inputStyle={{borderColor:((!this.props.secondGeneralTabScreen[this.props.newScreenName].selectedRole.selectedItem )?'#ff0000' :'#ccc')}}  />
								</td>
								<td>
										<Combo disabled={isWrongPersonalIdentity} items={this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.first_name?this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.phones : []}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='phone_number'
										 value={this.props.secondGeneralTabScreen[this.props.newScreenName].selectedPhone.selectedValue} onChange={this.newCityRoleItemChange.bind(this , 'selectedPhone')}
										    inputStyle={{borderColor:(this.state.phoneIsValid ?'#ccc' :'#ff0000')}} />
								</td>
								<td>
									{this.isShasOrCouncilNumberNumberItem}
								</td>
								
								<td>
									<ReactWidgets.DateTimePicker
									isRtl={true} time={false}
									value={parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate)}
										onChange={parseDateFromPicker.bind(this, {
										callback: this.newFromDateChange,
										format: "YYYY-MM-DD",
										functionParams: 'dateTime'
										})
									}
										disabled={isWrongPersonalIdentity}
										style={{borderColor:((parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate) == null ) ? '#ff0000' :'#ccc')}} 
										format="DD/MM/YYYY"
								/>
								</td>
								<td>
									<ReactWidgets.DateTimePicker
									isRtl={true} time={false}
									value={parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].toDate)}
										onChange={parseDateFromPicker.bind(this, {
										callback: this.newToDateChange,
										format: "YYYY-MM-DD",
										functionParams: 'dateTime'
										})
									}
									disabled={isWrongPersonalIdentity}
									style={{borderColor:((this.props.secondGeneralTabScreen[this.props.newScreenName].toDate &&  parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate) > parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].toDate)) ? '#ff0000' :'#ccc')}} 
									format="DD/MM/YYYY"
								/>
								</td>
								<td className="status-data">
										<button type="button" className="btn btn-success  btn-xs" disabled={!this.isNewRowValidated}   >
										<i className="fa fa-pencil-square-o" onClick={this.addNewCouncilMember.bind(this)}></i>
										</button>
								</td>
								<td className="status-data">
									<button type="button" className="btn btn-danger  btn-xs"   onClick={this.setAddingNewCouncilMember.bind(this,false)}>
										<i className="fa fa-times"></i>
										</button>
								</td>
							</tr>;

		}		
  
        let self=this;
        this.listRowsData = 
			  this.props.secondGeneralTabScreen[this.props.collectionName].map(function(item,index ){
				
                  if(item.role_end != null && item.role_end != ''){
						   
						  let endDatePartsArray = item.role_end.split("-");
				          let itemDateObject = (new Date(endDatePartsArray[1]+'/'+endDatePartsArray[2]+'/'+endDatePartsArray[0])).getTime();
				          let nowDateObject = (new Date()).getTime();
                           ;
                          if(itemDateObject-nowDateObject < 0){if(self.props.displayMode == 'ACTUAL_ROLES_ONLY'){return null;}}
						  else {if(self.props.displayMode=='HISTORY_ROLES_ONLY'){return null;}}
				  }
				  else{
           
                     if(self.props.displayMode=='HISTORY_ROLES_ONLY')
                     {
 
                       return null;
                     }
                  }
                   
				  return <ReligiousOrShasRoleRow key={index} index={index} 
				                   hideHistoricalRows = {self.state ? self.state.hideHistoricalRows : false} item={item}
								   confirmDeleteCityRole={self.confirmDeleteCityRole.bind(self)}
								   collectionName = {self.props.collectionName} 
								   rolesCollectionName ={self.props.rolesCollectionName}
                                   isAuthorizedEdit={(self.props.currentUser.admin == true || (self.props.collectionName == 'religiousCouncilMembers' && self.props.currentUser.permissions['elections.cities.roles.religious_council.edit'] == true) || (self.props.collectionName == 'cityShasRolesByVoters' && self.props.currentUser.permissions['elections.cities.roles.shas.edit'] == true))}
                                   isAuthorizedDelete={(self.props.currentUser.admin == true || (self.props.collectionName == 'religiousCouncilMembers' && self.props.currentUser.permissions['elections.cities.roles.religious_council.delete'] == true) || (self.props.collectionName == 'cityShasRolesByVoters' && self.props.currentUser.permissions['elections.cities.roles.shas.delete'] == true))}
								  editsCount={editsCount}
                                   newScreenName = {self.props.newScreenName}
				         />
			  });  
   
   }
	
   /*
   Each render do validation of new row
   */
   validateNewRowFields(){
	   
	   this.isNewRowValidated = true;
	   this.isNewRowValidated = (this.isNewRowValidated && (this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.first_name || this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.firstName));
       this.isNewRowValidated = (this.isNewRowValidated &&  this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate.split(' ').join('') != '' && parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate) != null );
	   this.isNewRowValidated = (this.isNewRowValidated &&  this.props.secondGeneralTabScreen[this.props.newScreenName].selectedRole.selectedItem);
	   this.isNewRowValidated = (this.isNewRowValidated &&  this.state.phoneIsValid);
	   if(this.props.collectionName == 'cityShasRolesByVoters'){
		    this.isNewRowValidated=(this.isNewRowValidated );
		   
	   }
	   this.isNewRowValidated = (this.isNewRowValidated &&  !(this.props.secondGeneralTabScreen[this.props.newScreenName].toDate &&  parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate) > parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].toDate)) );
	}
	
	/*
	shows/hides add new role row at bottom : 
	
	@param show
	*/
	setAddingNewCouncilMember(show){
		if(show){
         this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:('elections.cities.roles.religeous.'+this.props.newScreenName+'.add')});
		this.props.dispatch({
            type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
            screenName:this.props.newScreenName,
			itemName:('visible' + (this.props.displayMode == 'ACTUAL_ROLES_ONLY' ? '' :'History')),
			itemValue:show
        });
		}
		else{
            this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:('elections.cities.roles.religeous.'+this.props.newScreenName+'.add')});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CLEAN_NEW_RELIGEOUS_OR_SHAS_ROLE , screenName:this.props.newScreenName , isHistoryItem:(this.props.displayMode == 'HISTORY_ROLES_ONLY')});
			
		}
			
		
	}
	
	/*
	Adding new city role via api if all fields validated :
	*/
	addNewCouncilMember(){
		if(this.isNewRowValidated){
			let newRoleScreenData = this.props.secondGeneralTabScreen[this.props.newScreenName];

			let dataRequest={};
			 
			if(newRoleScreenData.foundVoter.key){
				dataRequest.voter_key = newRoleScreenData.foundVoter.key;
			}
			else{
				dataRequest.voter_key = newRoleScreenData.foundVoter.voters_key;
			}
			if(this.props.collectionName=='religiousCouncilMembers'){
			    dataRequest.shas = newRoleScreenData.shas;
			}
			else{
				dataRequest.council_number = newRoleScreenData.councilNumber;
			}
			dataRequest.role_name_key = newRoleScreenData.selectedRole.selectedItem.key;	
			if(newRoleScreenData.selectedPhone.selectedItem){
				dataRequest.phone_key = newRoleScreenData.selectedPhone.selectedItem.key;	
			}else{
				dataRequest.new_phone_number = newRoleScreenData.selectedPhone.selectedValue;	
			}
			dataRequest.from_date = newRoleScreenData.fromDate;
			dataRequest.to_date = newRoleScreenData.toDate;
			dataRequest.role_type_id = (this.props.collectionName == 'religiousCouncilMembers' ? 0:1);
			this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:('elections.cities.roles.religeous.'+this.props.newScreenName+'.add')});
            ElectionsActions.addNewReligeousOrShasRoleItem(this.props.dispatch , this.props.router.params.cityKey , dataRequest  , this.props.newScreenName);
		}
		else{
			 //don't add if not validated
		}
	}
	

	/*
	Handles change in new from_date field : 
	*/
	newFromDateChange(value, filter) {
		  
		if(value == null){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:'fromDate' ,
				itemValue:''
			});
			
		}
		else{
		this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:'fromDate' ,
				itemValue:value
			});
		}
    }
	
	/*
	Handles change in new to_date field : 
	*/
	newToDateChange(value, filter) {
		if(value == null){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:'toDate' ,
				itemValue:''
			});
			
		}
		else{
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:'toDate' ,
				itemValue:value
			});
		}

         
    }
	
 
    render() {
	
		this.validateNewRowFields();
        this.initDynamicVariables();
			 
        return (
             <div>
			 {this.confirmDeleteCityRoleItem}
                 <div>
						<div className="row panelContent">
								<table className="table table-striped tableNoMarginB tableTight table-scroll">
									<thead>
										{this.listHeader}
									</thead>
									<tbody>    
										{this.listRowsData}
										{this.newRowItem}
									</tbody>
								</table>
								<div className="add-item-line">
								<div className="row">
								<div className="col-md-3">
									{this.addNewRowButton}
								</div>
								
								</div>
								</div>
							</div>
						</div>                     
             </div>
        );
    }
}


function mapStateToProps(state) {
    return {
       currentUser: state.system.currentUser,
	   secondGeneralTabScreen:state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen,
	   allCityDepartments:state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen.allCityDepartments,
	   allCityParties:state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen.allCityParties,
       campaignsList : state.elections.citiesScreen.cityPanelScreen.campaignsList,
	   selectedVoterForRedirect: state.voters.searchVoterScreen.selectedVoterForRedirect,
	}
}

export default connect(mapStateToProps)(withRouter(ReligiousOrShasRoles));