import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';
import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import Collapse from 'react-collapse';
import Combo from '../../../../global/Combo';

class FirstSubTab extends React.Component {

    constructor(props) {
        super(props);
    }
	
    /*
      Handles switching from edit to view or from view to edit mode :

      @param isViewMode
    */
    switchViewEditMode(isViewMode){
           this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.FIRST_TAB_FIRST_COLLAPSE_STATUS_CHANGE , isViewMode });

           if(isViewMode){
                this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'elections.cities.parameters_candidates.parameters.edit'});
              
             //restore original values : 
               if(this.state){
					this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MUNICIPAL_CAMPAIGN_CITY_DATA_ITEM_CHANGE , fieldName:'election_threshold'  , fieldValue:this.state.oldHasimaValue});
					this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MUNICIPAL_CAMPAIGN_CITY_DATA_ITEM_CHANGE , fieldName:'seats'  , fieldValue:this.state.oldMandatValue});
					this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MUNICIPAL_CAMPAIGN_CITY_DATA_ITEM_CHANGE , fieldName:'questionnaire_initial_message'  , fieldValue:this.state.oldQuestionaireMessage});	
               }
               this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.CHANGE_SELECTED_PARTY_FOR_CITY , selectedValue :'' , selectedItem:null});
               this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MAIN_CITY_PARTY_ITEM_CHANGE , fieldName:'isShas'  , fieldValue:false});	
               this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MAIN_CITY_PARTY_ITEM_CHANGE , fieldName:'name'  , fieldValue:''});	
               this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MAIN_CITY_PARTY_ITEM_CHANGE , fieldName:'letters'  , fieldValue:''});	
           }
           else{
                this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'elections.cities.parameters_candidates.parameters.edit'});
                if(this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData){
                      this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.CHANGE_SELECTED_PARTY_FOR_CITY , selectedValue :this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData.name , selectedItem:this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData});

                }
               //save original values :
               let self = this;
               this.setState({oldHasimaValue : self.props.cityMunicipalElectionsCampaignsData.municipal_election_city.election_threshold});
               this.setState({oldMandatValue : self.props.cityMunicipalElectionsCampaignsData.municipal_election_city.seats});
               this.setState({oldQuestionaireMessage : self.props.cityMunicipalElectionsCampaignsData.municipal_election_city.questionnaire_initial_message});
                 
           }
    }
	 
    /*
         handles main party of city combo change : 
    */
    cityPartyChange(e){
             this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.CHANGE_SELECTED_PARTY_FOR_CITY , selectedValue :e.target.value , selectedItem:e.target.selectedItem});	
    }

    /*
       in case of adding new party to city municipal campaign info - change field value by field name 
    
       @param fieldName
    */
    cityPartyFieldItemChange(fieldName,e){
             if(fieldName=='isShas'){
                 this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MAIN_CITY_PARTY_ITEM_CHANGE , fieldName  , fieldValue:e.target.checked});	
             }
             else{
                this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MAIN_CITY_PARTY_ITEM_CHANGE , fieldName  , fieldValue:e.target.value});	
             }
    }


     /*
       changing in municipal campaign city field :
    
       @param fieldName
    */
    municipalCampaignCityItemChange(fieldName,e){

         if(fieldName =='seats' || fieldName=='election_threshold'){
            // set number only fields : 
           if(!new RegExp('^[0-9]*$').test(e.target.value)){return;} // allow only numbers in the field
 
         } 
         this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MUNICIPAL_CAMPAIGN_CITY_DATA_ITEM_CHANGE , fieldName  , fieldValue:e.target.value});	
    }
 
 
	 /*
	function that sets dynamic items in render() function : 
	*/
    initDynamicVariables() {
		 this.currentParties = [{id:-1 , name:'-הוספת מפלגה חדשה-'}];
         this.lettersValue='';
         this.nameValue = '';
         this.isShasValue = '';
         this.mandatValue='';
         this.hasimaValue = '';
         this.questionaireMessage = '';
         if(this.props.cityMunicipalElectionsCampaignsData){
            this.currentParties = [ this.currentParties[0] ,...this.props.cityMunicipalElectionsCampaignsData.municipal_election_parties] ;
            if(this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.election_threshold != null){
                  this.hasimaValue = this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.election_threshold;
            }
            if(this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.seats != null){
                  this.mandatValue = this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.seats;
            }
            if(this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.questionnaire_initial_message != null){
                  this.questionaireMessage = this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.questionnaire_initial_message;
            }
            if(this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData != null){
                 this.lettersValue=this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData.letters;
                 this.nameValue = this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData.name;
                 this.isShasValue = (this.props.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData.shas == 1 ? 'כן' : 'לא');
            }
         }
 
		 if(this.props.selectedPartyForCity.selectedItem == null){
            this.nameItem = <input type="text" className="form-control" value='' onChange={this.cityPartyFieldItemChange.bind(this,'name')} disabled={true} />;
            this.lettersItem = <input type="text" className="form-control" value='' onChange={this.cityPartyFieldItemChange.bind(this,'letters')} disabled={true} />;
            this.isShasItem = <input type="checkbox" key={1}  disabled={true} onChange={this.cityPartyFieldItemChange.bind(this,'isShas')} />;
            this.mandatItem = <input type="text" value='' className="form-control" disabled={true}  />;
            this.hasimaItem = <input type="text" value='' className="form-control" disabled={true}  />;
            this.questionaireMessageItem = <textarea className="form-control" rows="3" disabled={true}></textarea>;
         }
         else{
               if(this.props.selectedPartyForCity.selectedItem.id == -1){
                     this.nameItem = <input type="text" className="form-control" value={this.props.editCityPartyScreen.name}  onChange={this.cityPartyFieldItemChange.bind(this,'name')} style={{borderColor:(this.props.editCityPartyScreen.name.split(' ').join('') == '' ? '#ff0000':'#ccc')}}  />;
                     this.lettersItem = <input type="text" className="form-control" maxLength={10}  value={this.props.editCityPartyScreen.letters} onChange={this.cityPartyFieldItemChange.bind(this,'letters')} style={{borderColor:(this.props.editCityPartyScreen.letters.split(' ').join('') == '' ? '#ff0000':'#ccc')}} />;
                     this.isShasItem = <input type="checkbox" key={2}   disabled={false} onChange={this.cityPartyFieldItemChange.bind(this,'isShas')} />;
               }
               else{
                     this.nameItem = <input type="text" className="form-control" value={this.props.selectedPartyForCity.selectedItem.name} onChange={this.cityPartyFieldItemChange.bind(this,'name')} disabled={true} />;
                     this.lettersItem = <input type="text" className="form-control" value={this.props.selectedPartyForCity.selectedItem.letters} onChange={this.cityPartyFieldItemChange.bind(this,'letters')} disabled={true} />;
                     this.isShasItem = <input type="checkbox"  key={3}   disabled={true} onChange={this.cityPartyFieldItemChange.bind(this,'isShas')} checked={this.props.selectedPartyForCity.selectedItem.shas == 1} />;
               }

               this.mandatItem = <input type="text" value={this.mandatValue} className="form-control" onChange={this.municipalCampaignCityItemChange.bind(this,'seats')}  />;
               this.hasimaItem = <input type="text" value={this.hasimaValue}  className="form-control"  onChange={this.municipalCampaignCityItemChange.bind(this,'election_threshold')}  />;
               this.questionaireMessageItem = <textarea className="form-control" rows="3" value={this.questionaireMessage} onChange={this.municipalCampaignCityItemChange.bind(this,'questionnaire_initial_message')}></textarea>;         
       }     

      this.editItem = null;
      if ( this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates.parameters.edit'] == true ){
            this.editItem = <div className="col-md-1 text-left">
								<a className="edit-item btn-edit text-left" title="ערוך" style={{cursor:'pointer'}}  onClick={this.switchViewEditMode.bind(this,!this.props.firstCollapseExpanded)}>
								<span className="glyphicon glyphicon-pencil"></span>
									&nbsp;ערוך
								</a>
							</div>;
      }   


     if(this.props.firstCollapseExpanded){
             this.collapseDisplayItem = <div className="row">
												<div className="col-md-11">
													<div className="main-tab-1-edit-content">
														<div className="row panelContent">
															<div className="col-lg-2"><label>אותיות</label></div>
															<div className="col-lg-3">{this.lettersValue || '-'}</div>
															<div className="col-lg-2">
																<div className="input-horizontal-default">
																	<label>
																		
																		תפקוד ש"ס
																	</label> : {this.isShasValue}
																</div>
															</div>
														</div>
														<div className="row panelContent">
															<div className="col-lg-2"><label>כינוי מפלגה</label></div>
															<div className="col-lg-3">{this.nameValue || '-'}</div>
															<div className="col-lg-2">
																<label className="item-space">מנדט</label>
																&nbsp;&nbsp;&nbsp;&nbsp;<span>{this.mandatValue || '-'}</span>
															</div>
															<div className="col-lg-3">
																<label className="item-space">אחוז החסימה</label>
																&nbsp;&nbsp;&nbsp;&nbsp;<span>{this.hasimaValue || '-'}</span>
															</div>
														</div>
														<div className="row panelContent">
															<div className="col-lg-2"><label>מסך לפתיחת השאלון</label></div>
															<div className="col-lg-7">
																{this.questionaireMessage || '-'} 
															</div>
														</div>
													</div>
												</div>
												{this.editItem}
											</div>; 
     }
     else{
            this.collapseDisplayItem = <div>
												<div className="row panelContent">
													<div className="col-lg-2"><label>בחר מפלגה</label></div>
													<div className="col-lg-3">
														<Combo items={this.currentParties }  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'    value={this.props.selectedPartyForCity.selectedValue}   onChange={this.cityPartyChange.bind(this)} />      
													</div>
													<div className="col-lg-7">
														<div className="input-horizontal-default">
															<label>
																{this.isShasItem}&nbsp;&nbsp;
																	תפקוד ש"ס
															</label>
														</div>
													</div>
												</div>
												<div className="row panelContent">
													<div className="col-lg-2"><label>אותיות</label></div>
													<div className="col-lg-3">
														{this.lettersItem}
													</div>
													<div className="col-lg-7 no-padding">
														   <div className="row">
																<div className="col-lg-1">
																	<label className="item-space">מנדט</label>
																</div>
																<div className="col-lg-2">
																	{this.mandatItem}
																</div> 
                                                                <div className="col-lg-2">
																	<label className="item-space">אחוז החסימה</label>
																</div>
                                                                <div className="col-lg-2 text-right" >
																	{this.hasimaItem}
																</div> 
															</div>
													</div>
													 
												</div>
												<div className="row panelContent">
													<div className="col-lg-2"><label>כינוי מפלגה</label></div>
													<div className="col-lg-3">
														{this.nameItem}
													</div>
												</div>
												<div className="row panelContent">
													<div className="col-lg-2"><label>מסך לפתיחת השאלון</label></div>
													<div className="col-lg-7">
														{this.questionaireMessageItem}
													</div>
                                                </div>
												<div className="row" style={{borderTop:'1px solid #ccc' , marginTop:'20px'}} >
													<div className="col-lg-12" style={{marginTop:'20px'}}>
														<button title="בטל" type="button" className="btn btn-default btn-secondary pull-right" style={{borderColor:'#498BB6' , color:'#498BB6' , fontSize:'18px' , padding:'6px 40px 6px 40px'}} onClick={this.switchViewEditMode.bind(this,true)}>בטל</button>
														<button title="שמור" type="button" className="btn btn-primary btn-save pull-left" style={{backgroundColor:'#498BB6' , fontSize:'18px' , padding:'6px 40px 6px 40px'}} onClick={this.saveMunicipalCampaignCityData.bind(this)} disabled={!this.props.cityMunicipalElectionsCampaignsData || !this.props.selectedPartyForCity.selectedItem} >שמור</button>
													</div>
												</div>
											</div>; 

     }
         
    }

    /*
       handles saving municipal election city to database :
    */
    saveMunicipalCampaignCityData(){
         let requestDataObj = {}; 
         if(this.props.selectedPartyForCity.selectedItem.id == -1){
            if(this.props.editCityPartyScreen.name.split(' ').join('') == '' || this.props.editCityPartyScreen.letters.split(' ').join('') == ''){
                   // missing required fields - do nothing
                 
                    return;
            }
            else{
                 //add new party and connect it to municipal election city : 
                 requestDataObj.party_key = null;
                 requestDataObj.party_name = this.props.editCityPartyScreen.name;
                 requestDataObj.letters = this.props.editCityPartyScreen.letters;
                 if(this.props.editCityPartyScreen.isShas){
                      requestDataObj.is_shas = '1';
                 }
            }
         }
         else{
                //connect existing party to municipal election city :
                requestDataObj.party_key = this.props.selectedPartyForCity.selectedItem.key;
         }
 
         if(this.hasimaValue > 0){
                      requestDataObj.hasima = this.hasimaValue;
         }
         if(this.mandatValue > 0){
                      requestDataObj.mandat = this.mandatValue;
         }
         if(this.questionaireMessage.split(' ').join('') != ''){
                      requestDataObj.questionaire_text = this.questionaireMessage;
         }
         ElectionsActions.saveExistingElectionCampaignCityExtendedData(this.props.dispatch , this.props.router.params.cityKey , this.props.selectedCampaign.selectedItem.key ,requestDataObj);
    }
	
 
    render() {
        this.initDynamicVariables();
        return (
          <div className="containerStrip">
              {this.collapseDisplayItem}
          </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
	    selectedCampaign : state.elections.citiesScreen.cityPanelScreen.selectedCampaign,
	    cityMunicipalElectionsCampaignsData : state.elections.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData,
        selectedPartyForCity: state.elections.citiesScreen.cityPanelScreen.selectedPartyForCity ,
        editCityPartyScreen: state.elections.citiesScreen.cityPanelScreen.editCityPartyScreen ,
        firstCollapseExpanded:state.elections.citiesScreen.cityPanelScreen.firstCollapseExpanded , 
    }
}

export default connect(mapStateToProps)(withRouter(FirstSubTab));