import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import * as VoterActions from '../../../../../actions/VoterActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import CityCouncilMemberRow from './CityCouncilMemberRow';
import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import { parseDateToPicker, parseDateFromPicker , isValidComboValue,validatePhoneNumber} from '../../../../../libs/globalFunctions';

class CityCouncilMembers extends React.Component {

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
					hideHistoricalRows:true,
					phoneIsValid:true
			});
	}
   

	/*
	function that initializes constant variables 
	*/
    initConstants() {
          this.mouseClickCursorStyle={cursor:'pointer'};
		  this.listHeader=<tr>
							<th className="status-data" width="3%"></th>
							<th width="10%">שם</th>
							<th  width="10%">מספר פלאפון</th>
							<th  width="10%">מחזיק בתיק</th>
							<th width="12%">מטעם מפלגת</th>
							<th>נציג ש"ס</th>
							<th width="10%">מס' מועצת עיר</th>
							<th width="12%">תאריך תחילת תפקיד</th>
							<th width="12%">תאריך סיום תפקיד</th>
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
            itemName: (this.props.collectionName+'DeleteIndex') , 
			itemValue : deleteRowIndex
        });

	}
	
	/*
	Handles change in add-new-role screen item : 
	*/
    newCityRoleItemChange(fieldName , e){
		let value = e.target.value;
		let selectedItem = e.target.selectedItem;
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

		if(fieldName == 'departmentItem' || fieldName == 'campaignItem' || fieldName == 'partyItem'){
			
			if(fieldName == 'campaignItem'){
				this.props.dispatch({
					type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
					screenName:this.props.newScreenName,
					itemName:'partyItem' ,
					itemValue:{selectedValue:'', selectedItem:null}
			    });
			}
			
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:fieldName ,
				itemValue:{selectedValue:value, selectedItem:e.target.selectedItem}
			});
		}
		else if(fieldName == 'shas'){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:fieldName ,
				itemValue:(e.target.checked?'1':'0')
			});
		}
		else if(fieldName == 'councilNumber'){
			if(value == '0' || !new RegExp('^[0-9]*$').test(value)){ // allow only numbers in personal-identity field
			   return;
			}
			if(parseInt(value) > 999){
					return;
			}
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:fieldName ,
				itemValue:value
			});
		}
		else if(fieldName == 'selectedPhone'){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:fieldName ,
				itemValue:{selectedValue:value, selectedItem:selectedItem}
			});
			if(fieldName == 'selectedPhone'){this.checkPhoneNumber(value,selectedItem)}
			return;
		}
		else{
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
	/*Handle key press "enter" at personal identity field - in new city-role row  */
    handleKeyPress(event) {
        if (event.charCode == 13) { /*if user pressed enter*/
            this.doSearchVoterActionByText();
        }
    }
	
    /*
	If personal identity field is not empty - it will search voter and will put it in the correct field : 
	*/
	doSearchVoterActionByText(){
		 
		    if(this.props.secondGeneralTabScreen[this.props.newScreenName].personalIdentity == ''){
                 
            }
            else{
                 ElectionsActions.searchVoterByIdentity(this.props.dispatch , this.props.secondGeneralTabScreen[this.props.newScreenName].personalIdentity , this.props.newScreenName);

            }
	}
	
	/*
		It will redirect to voter search page : 
	*/
	doRedirectToSearchPage(){
		this.setState({ shouldRedirectToSearchVoter: true });
		this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'elections.cities.roles.council.add' });
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
	doRealDeleteCouncilMember(){
		ElectionsActions.deleteCouncilMember(this.props.dispatch , this.props.router.params.cityKey , this.props.secondGeneralTabScreen[this.props.collectionName][this.props.secondGeneralTabScreen[this.props.collectionName+'DeleteIndex']].key );	
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
	 
		     this.changeOrderItem = null;
			 this.showHideOutdatedRowsItem = null;
             if(!this.props.secondGeneralTabScreen[this.props.newScreenName].visible && editsCount == 0){
			  if(this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.roles.council.edit'] == true ){
                   if(!this.props.isCityConcilMemberRowInDnDSort){
				     this.changeOrderItem=<button title="שינוי סדר" type="submit" className="btn btn-default saveChanges open-draggable-btn" style={{backgroundColor:'#498BB6'}} onClick={this.setSortingCouncilMebmers.bind(this,true)}>שינוי סדר</button>   
			       }
				   else{
					this.changeOrderItem = <div> 
					                         <button title="בטל" type="submit" className="btn btn-default saveChanges btn-secondary closed-draggable-btn" style={{backgroundColor:'transparent',borderColor:'#498BB6',color:'#498BB6'}} onClick={this.setSortingCouncilMebmers.bind(this,false)}>בטל</button>
                                            &nbsp;&nbsp; <button title="שמור" type="submit" className="item-space btn btn-default saveChanges closed-draggable-btn" style={{backgroundColor:'#498BB6'}} onClick={this.updateAllCandidatesOrders.bind(this)}>שמור</button>
										   </div>;
				   }
                }
				if(!this.props.isCityConcilMemberRowInDnDSort && editsCount==0){
				   this.showHideOutdatedRowsItem = <a className="show-all-btn" title={this.state.hideHistoricalRows ? this.props.btnShowAllText : this.props.btnHideAll} style={{cursor:'pointer' , fontWeight:'600'}} onClick={this.showHideOutdatedRows.bind(this)}>{this.state.hideHistoricalRows ? this.props.btnShowAllText : this.props.btnHideAll}</a>;
				}
			 }
		
		
		
		
		this.partiesItem = [];
		if(this.props.secondGeneralTabScreen[this.props.newScreenName].campaignItem.selectedItem){
			let self = this;
			this.partiesItem = this.props.allCityParties.filter(function(party){              
			      return party.election_campaign_id == self.props.secondGeneralTabScreen[self.props.newScreenName].campaignItem.selectedItem.id
            });
		}
		
		this.confirmDeleteCityRoleItem = null;
		if(this.props.secondGeneralTabScreen[this.props.collectionName+'DeleteIndex'] >=0){
		this.confirmDeleteCityRoleItem = <ModalWindow show={true} buttonOk={this.doRealDeleteCouncilMember.bind(this)}  buttonCancel={this.confirmDeleteCityRole.bind(this , -1)}  buttonX={this.confirmDeleteCityRole.bind(this , -1)} title={"אישור מחיקה"} style={{zIndex: '9001'}}>
                                                                <div>{"למחוק את חבר המועצה?"}</div>
                                                            </ModalWindow>;
															
		}
		
        this.addNewRowButton = null;
        if(this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.roles.council.add'] == true ){
             if(!this.props.isCityConcilMemberRowInDnDSort && editsCount == 0 && !this.props.secondGeneralTabScreen[this.props.newScreenName].visible){
                this.addNewRowButton = <a title={this.props.btnAddText} style={{fontWeight:'600' , cursor:'pointer'}} onClick={this.setAddingNewCouncilMember.bind(this,true)}><span>+</span>{this.props.btnAddText}</a>;
             }
        }
		
		this.newRowItem = null;
 
        if(this.props.secondGeneralTabScreen[this.props.newScreenName].visible){
			  let isWrongPersonalIdentity =   !(this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.first_name || this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.firstName);
        
              this.newRowItem=<tr className="edit-save-row">
					<td><span className="num-utem">{this.props.secondGeneralTabScreen[this.props.collectionName].length + 1}</span>.</td>
					<td>
						<div className="row">
						<div className='col-md-9 text-left no-padding'><input type="text" maxLength={9} className="form-control"  value={this.props.secondGeneralTabScreen[this.props.newScreenName].personalIdentity} onChange={this.newCityRoleItemChange.bind(this , 'personalIdentity')}   onKeyPress={this.handleKeyPress.bind(this)}  style={{borderColor:((this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.first_name || this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.firstName) ? '#ccc' :'#ff0000')}} /></div><div className='col-sm-1 text-right  no-padding' style={{paddingTop:'4px' , paddingRight:'2px' , cursor:'pointer'}}><img src={window.Laravel.baseAppURL + 'Images/ico-search-blue.svg'} onClick={this.doRedirectToSearchPage.bind(this)} /></div>
																			
						</div>
						{this.props.secondGeneralTabScreen[this.props.newScreenName].fullVoterName}
					</td>
					<td>
					<Combo disabled={isWrongPersonalIdentity} 
					items={this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.first_name?this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.phones : []}
					maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='phone_number'
					value={this.props.secondGeneralTabScreen[this.props.newScreenName].selectedPhone.selectedValue} onChange={this.newCityRoleItemChange.bind(this , 'selectedPhone')}
					inputStyle={{borderColor:(this.state.phoneIsValid ?'#ccc' :'#ff0000')}} />
					</td>
					<td>
						<Combo disabled={isWrongPersonalIdentity} items={this.props.secondGeneralTabScreen.allCityDepartments}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' value={this.props.secondGeneralTabScreen[this.props.newScreenName].departmentItem.selectedValue} onChange={this.newCityRoleItemChange.bind(this , 'departmentItem')}   inputStyle={{borderColor:((!this.props.secondGeneralTabScreen[this.props.newScreenName].departmentItem.selectedItem && this.props.secondGeneralTabScreen[this.props.newScreenName].departmentItem.selectedValue.split(' ').join('') != '')?'#ff0000' :'#ccc')}}  />
					</td>
					<td>
						<div className="row">
							<div className="col-md-11">
									<Combo disabled={isWrongPersonalIdentity}  placeholder="בחר קמפיין בחירות"  items={this.props.campaignsList}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'  value={this.props.secondGeneralTabScreen[this.props.newScreenName].campaignItem.selectedValue} onChange={this.newCityRoleItemChange.bind(this , 'campaignItem')} inputStyle={{borderColor:((!this.props.secondGeneralTabScreen[this.props.newScreenName].campaignItem.selectedItem && this.props.secondGeneralTabScreen[this.props.newScreenName].campaignItem.selectedValue.split(' ').join('') != '')?'#ff0000' :'#ccc')}}  />
							</div>
						</div>
						<div className="row">
							<div className="col-md-11">
									<Combo disabled={isWrongPersonalIdentity}  placeholder="בחר מפלגה"  items={this.partiesItem}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='letters' value={this.props.secondGeneralTabScreen[this.props.newScreenName].partyItem.selectedValue} onChange={this.newCityRoleItemChange.bind(this , 'partyItem')}  inputStyle={{borderColor:((!this.props.secondGeneralTabScreen[this.props.newScreenName].partyItem.selectedItem && this.props.secondGeneralTabScreen[this.props.newScreenName].partyItem.selectedValue.split(' ').join('') != '')?'#ff0000' :'#ccc')}}  />
							</div>
						</div>
					</td>
					<td>
						<input type="checkbox" disabled={isWrongPersonalIdentity} checked={this.props.secondGeneralTabScreen[this.props.newScreenName].shas == '1'} onChange={this.newCityRoleItemChange.bind(this , 'shas')} />
					</td>
					<td>
						<input type="text" disabled={isWrongPersonalIdentity} className="form-control"  value={this.props.secondGeneralTabScreen[this.props.newScreenName].councilNumber} onChange={this.newCityRoleItemChange.bind(this , 'councilNumber')} style={{borderColor:(this.props.secondGeneralTabScreen[this.props.newScreenName].councilNumber.split(' ').join('') == '' ? '#ff0000':'#ccc')}} />
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
						style={{borderColor:((this.props.secondGeneralTabScreen[this.props.newScreenName].toDate &&  parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate) > parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].toDate)) ? '#ff0000' :'#ccc')}} 
						format="DD/MM/YYYY"
						disabled={isWrongPersonalIdentity}
					/>
					</td>
					<td className="status-data">
							<button type="button" className="btn btn-success  btn-xs" disabled={!this.isNewRowValidated} >
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
		
		 
		let rowsCounter = 0; // indexer for rows - because some of rows can be hidden , so it'll display from 1 to n
        if(this.props.isCityConcilMemberRowInDnDSort){
             this.listRowsData = 
			  this.props.dndItems.map(function(item,index ){
				  if(self.state.hideHistoricalRows){
					  if(item.role_end != null && item.role_end != ''){
						  let endDatePartsArray = item.role_end.split("-");
						  let itemDateObject = (new Date(endDatePartsArray[1]+'/'+endDatePartsArray[2]+'/'+endDatePartsArray[0])).getTime();
						  let nowDateObject = (new Date()).getTime();
						  
						  if(itemDateObject-nowDateObject < 0 && editsCount == 0){return null;}
					  }
					}
				  rowsCounter++;
				  return <CityCouncilMemberRow key={index} index={index}  rowsCounter={rowsCounter}
				                   hideHistoricalRows = {self.state ? self.state.hideHistoricalRows : false} item={item}
								   confirmDeleteCityRole={self.confirmDeleteCityRole.bind(self)}
								   collectionName = {self.props.collectionName} 
								   move={self.move.bind(self)}  editsCount={editsCount}
                                   revertToOriginal={self.revertToOriginal.bind(self)} drop={self.drop.bind(self)} 
                                   isAuthorizedEdit={( self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.roles.council.edit'] == true )}
							       isAuthorizedDelete={( self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.roles.council.delete'] == true )}
				         />
			  });
        }
        else{
        this.listRowsData = 
			  this.props.secondGeneralTabScreen[this.props.collectionName].map(function(item,index ){
				  if(self.state.hideHistoricalRows){
					  if(item.role_end != null && item.role_end != ''){
						  let endDatePartsArray = item.role_end.split("-");
						  let itemDateObject = (new Date(endDatePartsArray[1]+'/'+endDatePartsArray[2]+'/'+endDatePartsArray[0])).getTime();
						  let nowDateObject = (new Date()).getTime();
						  
						  if(itemDateObject-nowDateObject < 0 && editsCount == 0){return null;}
					  }
					}
				  rowsCounter++;
				  return <CityCouncilMemberRow key={index} index={index}  rowsCounter={rowsCounter}
				                   hideHistoricalRows = {self.state ? self.state.hideHistoricalRows : false} item={item}
								   confirmDeleteCityRole={self.confirmDeleteCityRole.bind(self)}
								   collectionName = {self.props.collectionName} 
								   move={self.move.bind(self)}  editsCount={editsCount}
                                   revertToOriginal={self.revertToOriginal.bind(self)} drop={self.drop.bind(self)} 
                                   isAuthorizedEdit={( self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.roles.council.edit'] == true )}
							       isAuthorizedDelete={( self.props.currentUser.admin == true || self.props.currentUser.permissions['elections.cities.roles.council.delete'] == true )}
				         />
			  });

           }  
   
   }
	
   /*
   Each render do validation of new row
   */
   validateNewRowFields(){
	   
	   this.isNewRowValidated = true;
	   this.isNewRowValidated = (this.isNewRowValidated && (this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.first_name || this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.firstName));
       this.isNewRowValidated = this.isNewRowValidated && !(this.props.secondGeneralTabScreen[this.props.newScreenName].departmentItem.selectedItem == null && this.props.secondGeneralTabScreen[this.props.newScreenName].departmentItem.selectedValue.split(' ').join('') != '');
       this.isNewRowValidated = this.isNewRowValidated && !(this.props.secondGeneralTabScreen[this.props.newScreenName].campaignItem.selectedItem == null && this.props.secondGeneralTabScreen[this.props.newScreenName].campaignItem.selectedValue.split(' ').join('') != '');  
	   this.isNewRowValidated = this.isNewRowValidated && !(this.props.secondGeneralTabScreen[this.props.newScreenName].partyItem.selectedItem == null && this.props.secondGeneralTabScreen[this.props.newScreenName].partyItem.selectedValue.split(' ').join('') != '');  
       this.isNewRowValidated = (this.isNewRowValidated && (this.props.secondGeneralTabScreen[this.props.newScreenName].councilNumber.split(' ').join('') != ''));
       this.isNewRowValidated = (this.isNewRowValidated &&  this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate.split(' ').join('') != '' && parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate) != null );
	   this.isNewRowValidated = (this.isNewRowValidated &&  !(this.props.secondGeneralTabScreen[this.props.newScreenName].toDate &&  parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate) > parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].toDate)) );
	   this.isNewRowValidated = (this.isNewRowValidated &&  this.state.phoneIsValid);
	}
	
	/*
	shows/hides add new role row at bottom : 
	
	@param show
	*/
	setAddingNewCouncilMember(show){
		if(show){
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:('elections.cities.roles.council.add')});
		this.props.dispatch({
            type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
            screenName:this.props.newScreenName,
			itemName:'visible',
			itemValue:show
        });
		}
		else{
            this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:('elections.cities.roles.council.add')});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CLEAN_NEW_CITY_ROLE_SCREEN_DATA , screenName:this.props.newScreenName});
			
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
			dataRequest.shas = newRoleScreenData.shas;
			if(newRoleScreenData.departmentItem.selectedItem){
				dataRequest.department_key = newRoleScreenData.departmentItem.selectedItem.key;	
			}
			if(newRoleScreenData.campaignItem.selectedItem){
				dataRequest.campaign_key = newRoleScreenData.campaignItem.selectedItem.key;	
			}
			if(newRoleScreenData.partyItem.selectedItem){
				dataRequest.party_key = newRoleScreenData.partyItem.selectedItem.key;	
			}
			if(newRoleScreenData.selectedPhone.selectedItem){
				dataRequest.phone_key = newRoleScreenData.selectedPhone.selectedItem.key;	
			}else{
				dataRequest.new_phone_number = newRoleScreenData.selectedPhone.selectedValue;	
			}
			dataRequest.council_number = newRoleScreenData.councilNumber;
			dataRequest.from_date = newRoleScreenData.fromDate;
			dataRequest.to_date = newRoleScreenData.toDate;
			dataRequest.to_date = newRoleScreenData.toDate;
			
			ElectionsActions.addNewCityCouncilMember(this.props.dispatch , this.props.router.params.cityKey , dataRequest);
		    this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:('elections.cities.roles.council.add')});
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
	
	
	/*
	   change sorting status of the list to true/false
	   
	   @param isSorting
	   
	*/
	setSortingCouncilMebmers(isSorting){
		 this.props.dispatch({
            type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_SECOND_TAB_ITEM_VALUE_BY_NAME,
            itemName: 'isCityConcilMemberRowInDnDSort' , 
			itemValue : isSorting
        });
		if(!isSorting){
               this.props.dispatch ({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'CouncilMemberSort'});
			   this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DND_COUNCIL_MEMBER_ROW_REVERT_TO_ORIGINAL}); 
		}
        else{

               this.props.dispatch ({type:SystemActions.ActionTypes.SET_DIRTY, target:'CouncilMemberSort'});	
        }
	}
	
	/*
	Does real update to council members orders - it sends ordered list to api : 
	*/
    updateAllCandidatesOrders(){
		    let keysOrderedArray = [];
			for(let i=0;i<this.props.dndItems.length;i++){
				keysOrderedArray.push(this.props.dndItems[i].key);
			}
			ElectionsActions.editCityCouncilMembersOrders(this.props.dispatch , this.props.router.params.cityKey , JSON.stringify(keysOrderedArray));
			 this.props.dispatch ({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'CouncilMemberSort'});
	}
	
	//ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

	
	 //move items in hover - only if needed
    move(fromItem, toItem, before) {
         if (fromItem.key!= toItem.key) {
			var i=0;
			for (i=0; i<this.props.dndItems.length; i++) {
				if (this.props.dndItems[i].key == fromItem.key) break;
			}
			if (before) {
				if ((this.props.dndItems.length  == i + 1)||((this.props.dndItems.length > i + 1)&&(this.props.dndItems[i+1].key != toItem.key))) {
					this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DND_SORT_COUNCIL_MEMBER_ROW, fromItem: fromItem, toItem: toItem, before: before});
				}
			}else {
				if ((i == 0)||(( i > 0)&&(this.props.dndItems[i-1].key != toItem.key))) {
					this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DND_SORT_COUNCIL_MEMBER_ROW, fromItem: fromItem, toItem: toItem, before: before});
				}
			}
		}
		 /*
        if (fromItem.key != toItem.key) {
            var i = 0;
 
            for (let i = 0; i < this.props.secondGeneralTabScreen[this.props.collectionName].length; i++) {
                if (this.props.secondGeneralTabScreen[this.props.collectionName][i].key == fromItem.key)
                    break;
            }
            if (before) {
			 
                if ((this.props.secondGeneralTabScreen[this.props.collectionName].length == i + 1) || ((  this.props.secondGeneralTabScreen[this.props.collectionName].length > i + 1) && (  this.props.secondGeneralTabScreen[this.props.collectionName][i + 1].key != toItem.key))) {
                     this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DND_SORT_COUNCIL_MEMBER_ROW, fromItem: fromItem, toItem: toItem, before: before});
                }
            } else {
		 
                if ((i == 0) || ((i > 0) && (  this.props.secondGeneralTabScreen[this.props.collectionName][i - 1].key != toItem.key))) {
				 
                     this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DND_SORT_COUNCIL_MEMBER_ROW, fromItem: fromItem, toItem: toItem, before: before});
                }
            }
        }
*/
    }    
    
    //set drop callback - maybe send data to server
    drop() {
        this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DND_SORT_COUNCIL_MEMBER_ROW_DROP});
         
    }

    //return items to original state if not dropped on another item
    revertToOriginal() {
        this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DND_COUNCIL_MEMBER_ROW_REVERT_TO_ORIGINAL});
    }

 
 
    render() {
	 
		this.validateNewRowFields();
        this.initDynamicVariables();
        return (
             <div>
			 {this.confirmDeleteCityRoleItem}
                 <div>
					<div className="clearfix row-of-buttons">
					{this.changeOrderItem}
						
					</div>
					<div className="row panelContent" >
					<br/>
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
							<div className="col-md-7">
							</div>
							<div className="col-md-2 text-left">
							{this.showHideOutdatedRowsItem}
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
	   isCityConcilMemberRowInDnDSort : state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen.isCityConcilMemberRowInDnDSort,
       mainTabsActiveTabNumber:state.elections.citiesScreen.cityPanelScreen.mainTabsActiveTabNumber,
       dndSortScreenSecondTabCouncilMembers:state.elections.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers,
       dndItems : state.elections.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.items,
	   selectedVoterForRedirect: state.voters.searchVoterScreen.selectedVoterForRedirect,
	}
}

export default connect(mapStateToProps)(withRouter(CityCouncilMembers));