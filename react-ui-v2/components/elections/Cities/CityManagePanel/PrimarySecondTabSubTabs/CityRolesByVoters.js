import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import * as VoterActions from '../../../../../actions/VoterActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import CityRoleByVoterRow from './CityRoleByVoterRow';
import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import { parseDateToPicker, parseDateFromPicker , isValidComboValue} from '../../../../../libs/globalFunctions';

class CityRolesByVoters extends React.Component {

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
		if(this.props.hideOutdatedRoles){
			this.setState({
                    hideHistoricalRows:true 
			});
		}
	}
   

	/*
	function that initializes constant variables 
	*/
    initConstants() {
          this.mayorRoleType = 0;
          this.deputyRoleType = 1;
          this.mouseClickCursorStyle={cursor:'pointer'};
		  this.listHeader = <tr>
								<th className="status-data" width="3%"></th>
								<th width="13%">שם</th>
								<th  width="10%">מחזיק בתיק</th>
								<th width="15%">מטעם מפלגת</th>
								<th>נציג ש"ס</th>
								<th width="10%">מס' מועצת עיר</th>
								<th  width="7%">קדנציה</th>
								<th width="15%">תאריך תחילת תפקיד</th>
								<th width="15%">תאריך סיום תפקיד</th>
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
		if(fieldName == 'personalIdentity'){
			if(!new RegExp('^[0-9]*$').test(e.target.value)){ // allow only numbers in personal-identity field
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
				itemValue:{selectedValue:e.target.value, selectedItem:e.target.selectedItem}
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
			if(e.target.value =='0' || !new RegExp('^[0-9]*$').test(e.target.value)){ // allow only numbers  
			   return;
			}
			if(parseInt(e.target.value) > 999){
					return;
			}
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:fieldName ,
				itemValue:e.target.value
			});
		}
		else if( fieldName == 'termOfOffice'){
			if(e.target.value =='0' || !new RegExp('^[0-9]*$').test(e.target.value)){ // allow only numbers 
			   return;
			}
			if(parseInt(e.target.value) > 10){
					return;
			}
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:fieldName ,
				itemValue:e.target.value
			});
		}
		else{
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
				screenName:this.props.newScreenName,
				itemName:fieldName ,
				itemValue:e.target.value
			});
		}

	}	
	
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
		this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: ('elections.cities.roles.'+this.props.newScreenName+'.add')});
	}
	/*
	if this.props.hideOutdatedRoles is true - it will show/hide outdated rows 
	*/
	showHideOutdatedRows(){
		this.setState({
                    hideHistoricalRows:!this.state.hideHistoricalRows 
			});
	}
 
    /*
	Performs real delete of city-role via api : 
	*/
	doRealDeleteCityRole(){
		let requestData = {};
		requestData.role_type = this.props.roleType;
		ElectionsActions.deleteCityRoleByVoter(this.props.dispatch , this.props.router.params.cityKey , this.props.secondGeneralTabScreen[this.props.collectionName][this.props.secondGeneralTabScreen[this.props.collectionName+'DeleteIndex']].key ,  requestData);
		
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
		
		this.showHideOutdatedRowsItem = null;
		
		if(!this.props.secondGeneralTabScreen[this.props.newScreenName].visible && editsCount == 0 && this.props.hideOutdatedRoles){
			this.showHideOutdatedRowsItem=<a className="show-all-btn" title={this.state.hideHistoricalRows ? this.props.btnShowAllText : this.props.btnHideAll} style={{cursor:'pointer' , fontWeight:'600'}} onClick={this.showHideOutdatedRows.bind(this)}>{this.state.hideHistoricalRows ? this.props.btnShowAllText : this.props.btnHideAll}</a>;
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
		this.confirmDeleteCityRoleItem = <ModalWindow show={true} buttonOk={this.doRealDeleteCityRole.bind(this)}  buttonCancel={this.confirmDeleteCityRole.bind(this , -1)}  buttonX={this.confirmDeleteCityRole.bind(this , -1)} title={"אישור מחיקה"} style={{zIndex: '9001'}}>
                                                                <div>{"למחוק את התפקיד?"}</div>
                                                            </ModalWindow>;
															
		}
		this.addNewRowButton = null;
        if(this.props.currentUser.admin == true||(this.props.roleType ==  this.mayorRoleType && this.props.currentUser.permissions['elections.cities.roles.mayor.add'] == true) || (this.props.roleType ==  this.deputyRoleType && this.props.currentUser.permissions['elections.cities.roles.deputy.add'] == true))
        {
          if(editsCount == 0 && !this.props.secondGeneralTabScreen[this.props.newScreenName].visible){
		    this.addNewRowButton = <a title={this.props.btnAddText} style={{fontWeight:'600' , cursor:'pointer'}} onClick={this.setAddingNewRole.bind(this,true)}><span>+</span>{this.props.btnAddText}</a>;
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
											<Combo disabled={isWrongPersonalIdentity} items={this.props.allCityDepartments}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' value={this.props.secondGeneralTabScreen[this.props.newScreenName].departmentItem.selectedValue} onChange={this.newCityRoleItemChange.bind(this , 'departmentItem')}   inputStyle={{borderColor:((!this.props.secondGeneralTabScreen[this.props.newScreenName].departmentItem.selectedItem && this.props.secondGeneralTabScreen[this.props.newScreenName].departmentItem.selectedValue.split(' ').join('') != '')?'#ff0000' :'#ccc')}}  />
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
										<input type="text" disabled={isWrongPersonalIdentity} className="form-control"  value={this.props.secondGeneralTabScreen[this.props.newScreenName].termOfOffice} onChange={this.newCityRoleItemChange.bind(this , 'termOfOffice')} style={{borderColor:(this.props.secondGeneralTabScreen[this.props.newScreenName].termOfOffice.split(' ').join('') == '' ? '#ff0000':'#ccc')}} />
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
											<button type="button" className="btn btn-success  btn-xs" disabled={!this.isNewRowValidated}   >
											<i className="fa fa-pencil-square-o" onClick={this.addNewCityRole.bind(this)}></i>
											</button>
									</td>
									<td className="status-data">
										<button type="button" className="btn btn-danger  btn-xs"   onClick={this.setAddingNewRole.bind(this,false)}>
											<i className="fa fa-times"></i>
											</button>
									</td>
                                                        </tr>;
         
		}		
  
        let self=this;
        this.listRowsData = 
			  this.props.secondGeneralTabScreen[this.props.collectionName].map(function(item,index ){
				  
				  return <CityRoleByVoterRow hideOutdatedRoles={self.props.hideOutdatedRoles} 
				                   hideHistoricalRows = {self.state ? self.state.hideHistoricalRows : false} item={item}
								   key={index} index={index} confirmDeleteCityRole={self.confirmDeleteCityRole.bind(self)}
								   collectionName = {self.props.collectionName} roleType={self.props.roleType}
								   showIsAddingNewRow={self.props.secondGeneralTabScreen[self.props.newScreenName].visible}
								   editsCount = {editsCount}
                                   newScreenName = {self.props.newScreenName}
                                   isAuthorizedEdit = {(self.props.currentUser.admin == true||(self.props.roleType ==  self.mayorRoleType && self.props.currentUser.permissions['elections.cities.roles.mayor.edit'] == true) || (self.props.roleType ==  self.deputyRoleType && self.props.currentUser.permissions['elections.cities.roles.deputy.edit'] == true))}
                                   isAuthorizedDelete = {(self.props.currentUser.admin == true||(self.props.roleType ==  self.mayorRoleType && self.props.currentUser.permissions['elections.cities.roles.mayor.delete'] == true) || (self.props.roleType ==  self.deputyRoleType && self.props.currentUser.permissions['elections.cities.roles.deputy.delete'] == true))}
				         />
			  });  
   
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
	   this.isNewRowValidated = (this.isNewRowValidated && (this.props.secondGeneralTabScreen[this.props.newScreenName].termOfOffice.split(' ').join('') != ''));
       this.isNewRowValidated = (this.isNewRowValidated &&  this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate.split(' ').join('') != '' && parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate) != null );
       this.isNewRowValidated = (this.isNewRowValidated &&  !(this.props.secondGeneralTabScreen[this.props.newScreenName].toDate &&  parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate) > parseDateToPicker(this.props.secondGeneralTabScreen[this.props.newScreenName].toDate)) );
	}
	
	/*
	shows/hides add new role row at bottom : 
	
	@param show
	*/
	setAddingNewRole(show){
		if(show){
		this.props.dispatch({
            type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE,
            screenName:this.props.newScreenName,
			itemName:'visible',
			itemValue:show
        });
            this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:('elections.cities.roles.'+this.props.newScreenName+'.add')});
		}
		else{
            this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:('elections.cities.roles.'+this.props.newScreenName+'.add')});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CLEAN_NEW_CITY_ROLE_SCREEN_DATA , screenName:this.props.newScreenName});
			
		}
			
		
	}
	
	/*
	Adding new city role via api if all fields validated :
	*/
	addNewCityRole(){
		if(this.isNewRowValidated){
			let dataRequest={
				
			};
			dataRequest.role_type = this.props.roleType;
			if(this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.key){
				dataRequest.voter_key = this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.key;
			}
			else{
				dataRequest.voter_key = this.props.secondGeneralTabScreen[this.props.newScreenName].foundVoter.voters_key;
			}
			
			dataRequest.shas = this.props.secondGeneralTabScreen[this.props.newScreenName].shas;
			if(this.props.secondGeneralTabScreen[this.props.newScreenName].departmentItem.selectedItem){
				dataRequest.department_key = this.props.secondGeneralTabScreen[this.props.newScreenName].departmentItem.selectedItem.key;	
			}
			if(this.props.secondGeneralTabScreen[this.props.newScreenName].campaignItem.selectedItem){
				dataRequest.campaign_key = this.props.secondGeneralTabScreen[this.props.newScreenName].campaignItem.selectedItem.key;	
			}
			if(this.props.secondGeneralTabScreen[this.props.newScreenName].partyItem.selectedItem){
				dataRequest.party_key = this.props.secondGeneralTabScreen[this.props.newScreenName].partyItem.selectedItem.key;	
			}
			dataRequest.council_number = this.props.secondGeneralTabScreen[this.props.newScreenName].councilNumber;
			dataRequest.term_of_office = this.props.secondGeneralTabScreen[this.props.newScreenName].termOfOffice;
			dataRequest.from_date = this.props.secondGeneralTabScreen[this.props.newScreenName].fromDate;
			dataRequest.to_date = this.props.secondGeneralTabScreen[this.props.newScreenName].toDate;
			
			ElectionsActions.addNewCityRoleByVoter(this.props.dispatch , this.props.router.params.cityKey , dataRequest);
		    this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:('elections.cities.roles.'+this.props.newScreenName+'.add')});
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
	   selectedVoterForRedirect: state.voters.searchVoterScreen.selectedVoterForRedirect,
	}
}

export default connect(mapStateToProps)(withRouter(CityRolesByVoters));