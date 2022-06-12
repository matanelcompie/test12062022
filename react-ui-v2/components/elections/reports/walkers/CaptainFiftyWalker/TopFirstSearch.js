import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import store from '../../../../../store';
import SearchActivistModal from '../../common/SearchActivistModal';


class TopFirstSearch extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
    }
	
	componentWillMount(){
		  this.setState({showDisplayCaptainFiftyVoterSearchModal : false});
          this.setState({filteredCities : []});
          this.setState({filteredAreasList : []});
          this.setState({filteredSubAreasList : []});
		  this.setState({clusters : []});
		  this.setState({ballotBoxes : []});
    }

    componentWillReceiveProps(nextProps) {
            if(nextProps.currentUser &&  nextProps.currentUserGeographicalFilteredLists.cities.length > 0 && nextProps.currentUserGeographicalFilteredLists.areas.length > 0)
	        {     
               if(!this.state.loadedAreasAndCities){	
                    this.setState({loadedAreasAndCities:true});			   
					this.setState({filteredCities : nextProps.currentUserGeographicalFilteredLists.cities});
					this.setState({filteredAreasList : nextProps.currentUserGeographicalFilteredLists.areas});		   
               }
			}
			if(nextProps.currentUser &&  nextProps.currentUserGeographicalFilteredLists.sub_areas.length > 0)
	        {   
          		 if(!this.state.loadedSubAreas){
				   this.setState({loadedSubAreas:true});	
                  this.setState({filteredSubAreasList : nextProps.currentUserGeographicalFilteredLists.sub_areas});			   
				 }
			}
 
	  if(nextProps.searchScreen && nextProps.searchScreen.clusters.length > 0){
		    this.setState({clusters : nextProps.searchScreen.clusters});   
	  }
	  else{
		  if(this.state.searchScreen && this.state.searchScreen.clusters.length >0){
			  this.setState({clusters : []});
		  }  
	  }
	 
	   if(nextProps.searchScreen && nextProps.searchScreen.ballotBoxes.length > 0){
		    this.setState({ballotBoxes : nextProps.searchScreen.ballotBoxes});   
	  }
	  else{
		  if(this.state.searchScreen && this.state.searchScreen.ballotBoxes.length >0){
			  this.setState({ballotBoxes : []});
		  }  
	  }
    }
	

	/*
	function that initializes constant variables 
	*/
    initConstants() {
         
		
	}
	
	
	
	/*
	   Open modal window for searching captain of fifty voter :
	*/
	showSearchCaptainModalDialog(){
		 
	   store.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'showDisplayCaptainFiftyVoterSearchModal' , fieldValue:true});
	}
 
    /*
	   Search activists modal screen -  set specific row in search-results of activist as selected , and others unselected
	*/
	setRowSelected(rowIndex){
	    this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.SET_VOTER_SEARCH_RESULT_ROW_SELECTED , rowIndex});	
	}
	
	/*
	      Search activists modal screen -  Close modal window for searching captain of fifty voter :
	*/
	closeSearchCaptainModalDialog(){	 
	   this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'showDisplayCaptainFiftyVoterSearchModal' , fieldValue:false});
	}
	
	/*
	   Search activists modal screen -  Handles changes in one of combo-fields
	*/
	searchActivistModalFieldComboValueChange(fieldName , e){
		 this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_MODAL_SEARCH_VOTER_IN_SEARCH_REPORT_FIELD_VALUE , fieldName , fieldValue:{selectedValue :e.target.value , selectedItem:e.target.selectedItem}});
	     if(fieldName == 'selectedCity'){
			 if(e.target.selectedItem){
				 ElectionsActions.getClustersOnlyByCity(this.props.dispatch , e.target.selectedItem.key);
			 }else{
				 this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_MODAL_SEARCH_VOTER_IN_SEARCH_REPORT_FIELD_VALUE , fieldName:'clusters' , fieldValue:[]});
			     this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_MODAL_SEARCH_VOTER_IN_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedCluster' , fieldValue:{selectedValue :'' , selectedItem:null}});
			 }
		 }
	}
 
    /*
	Search activists modal screen - Handles changing value in text fields
	*/
	searchActivistModalFieldTextValueChange(fieldName , e)
	{
		if(fieldName == 'ministerID'){
			 if(!new RegExp('^[0-9]*$').test(e.target.value)){return;} // allow only numbers in the field
		}
	    this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_MODAL_SEARCH_VOTER_IN_SEARCH_REPORT_FIELD_VALUE , fieldName , fieldValue: e.target.value});			
	}
	
	searchActivistModalUnmount(){
          this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CLEAN_SEARCH_CAPTAIN50_VOTER_MODAL_FIELDS});
    }
	
	searchActivistModalWillMount(){
          this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CLEAN_SEARCH_CAPTAIN50_VOTER_MODAL_FIELDS});
    }
	
	/*
	Search activists modal screen - Function that searches for voter by params
	*/
	doSearchActivist(){
		let params = {
		};
		if(this.props.searchCaptainFiftyVoterModal.selectedCity.selectedItem){
			params.city_key = this.props.searchCaptainFiftyVoterModal.selectedCity.selectedItem.key;	
		}
		if(this.props.searchCaptainFiftyVoterModal.selectedCluster.selectedItem){
			params.cluster_key = this.props.searchCaptainFiftyVoterModal.selectedCluster.selectedItem.key;	
		}
		if(this.props.searchCaptainFiftyVoterModal.ministerID != ''){
			params.personal_identity = this.props.searchCaptainFiftyVoterModal.ministerID;
		}
		if(this.props.searchCaptainFiftyVoterModal.ministerFirstName.trim() != ''){
			params.first_name = this.props.searchCaptainFiftyVoterModal.ministerFirstName;
		}
		if(this.props.searchCaptainFiftyVoterModal.ministerLastName.trim() != ''){
			params.last_name = this.props.searchCaptainFiftyVoterModal.ministerLastName;
		}
		ElectionsActions.searchCaptains50VotersByParams(this.props.dispatch , params); 
	}
	
	/*
	Search activists modal screen - function that passes selected found voter captain of fifty into parent screen and closes this modal window
	*/
	setParentScreenActivistData(rowIndex){
         this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'ministerID' , fieldValue:this.props.searchCaptainFiftyVoterModal.foundVoters[rowIndex].personal_identity});
		 this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'ministerFirstName' , fieldValue:this.props.searchCaptainFiftyVoterModal.foundVoters[rowIndex].first_name});
		 this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'ministerLastName' , fieldValue:this.props.searchCaptainFiftyVoterModal.foundVoters[rowIndex].last_name});
		 this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'showDisplayCaptainFiftyVoterSearchModal' , fieldValue:false});
	}
	
	
    render() { 
        return (
		  <div className="containerTabs first-box-on-page" style={{marginTop:'15px'}}>
		           {this.props.searchScreen.showDisplayCaptainFiftyVoterSearchModal ? 
				             <SearchActivistModal windowTitle='איתור שר מאה' searchScreen={this.props.searchScreen} modalName='captainFifty' 
							                setRowSelected={this.setRowSelected.bind(this)} closeSearchCaptainModalDialog={this.closeSearchCaptainModalDialog.bind(this)} 
											searchActivistModalFieldComboValueChange={this.searchActivistModalFieldComboValueChange.bind(this)} 
											searchActivistModalFieldTextValueChange={this.searchActivistModalFieldTextValueChange.bind(this)}  
											searchActivistModalUnmount={this.searchActivistModalUnmount.bind(this)} doSearchActivist={this.doSearchActivist.bind(this)}
          				                     setParentScreenActivistData = {this.setParentScreenActivistData.bind(this)}  />
					: null}
                    <ul className="nav nav-tabs tabsRow" role="tablist">
                        <li className="active" role="presentation">
                            <a title="נתונים למערכת הבחירות ברשויות" href="#Tab1" data-toggle="tab">
                                צור דו"ח חדש
                            </a>
                        </li>
                    </ul>
                    <div className="tab-content tabContnt">
                        <div role="tabpanel" className="tab-pane active" id="Tab1">
                            <div className="containerStrip">
                                    <table width="100%">
									<tbody>
                                    <tr>
                                        <td width="20%">
                                                <label className="control-label">אזור</label>
                                                <div className="row"><div className="col-md-11"><Combo items={this.state.filteredAreasList} placeholder="בחר אזור"  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'  value={this.props.searchScreen.selectedArea.selectedValue}  onChange={this.searchFieldComboValueChange.bind(this , 'selectedArea')}  inputStyle={{borderColor:(this.props.validatorsObject.validatedArea ? '#ccc' : '#ff0000')}}  /></div></div>
                                        </td>
                                        <td width="20%">
                                                <label  className="control-label">תת אזור</label>
                                                <div className="row"><div className="col-md-11"><Combo items={this.state.filteredSubAreasList} placeholder="בחר תת אזור"   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'   value={this.props.searchScreen.selectedSubArea.selectedValue} onChange={this.searchFieldComboValueChange.bind(this , 'selectedSubArea')} inputStyle={{borderColor:(this.props.validatorsObject.validatedSubArea ? '#ccc' : '#ff0000')}} /></div></div>
                                        </td>
                                        <td width="20%">
                                                <label  className="control-label">עיר</label>
                                                <div className="row"><div className="col-md-11"><Combo items={this.state.filteredCities} placeholder="בחר עיר"  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'   value={this.props.searchScreen.selectedCity.selectedValue} onChange={this.searchFieldComboValueChange.bind(this , 'selectedCity')} inputStyle={{borderColor:(this.props.validatorsObject.validatedCity && this.props.validatorsObject.validatedMinimumSearch ? '#ccc' : '#ff0000')}} /></div></div>
                                        </td>
                                         <td width="20%">
                                                <label className="control-label">אזור מיוחד</label>
                                                <div className="row"><div className="col-md-11"><Combo items={this.props.searchScreen.neighborhoods} placeholder="בחר אזור מיוחד"  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'  value={this.props.searchScreen.selectedNeighborhood.selectedValue}  onChange={this.searchFieldComboValueChange.bind(this , 'selectedNeighborhood')} inputStyle={{borderColor:(this.props.validatorsObject.validatedNeighborhood ? '#ccc' : '#ff0000')}} /></div></div>
                                        </td>
                                        <td width="20%">
                                                <label  className="control-label">אשכול</label>
                                                <div className="row"><div className="col-md-11"><Combo items={this.state.filteredClusters || this.state.clusters} placeholder="בחר אשכול"  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'  value={this.props.searchScreen.selectedCluster.selectedValue}  onChange={this.searchFieldComboValueChange.bind(this , 'selectedCluster')} inputStyle={{borderColor:(this.props.validatorsObject.validatedCluster ? '#ccc' : '#ff0000')}} /></div></div>
                                        </td>
								    </tr>
									<tr><td colSpan="5" style={{height:'15px'}}></td></tr>
                                    <tr>
                                        <td>
                                                <label  className="control-label">קלפי</label>
                                                <div className="row"><div className="col-md-11"><Combo items={this.state.filteredBallotBoxes || this.state.ballotBoxes} placeholder="בחר אשכול"  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='mi_id'  value={this.props.searchScreen.selectedBallotBox.selectedValue}  onChange={this.searchFieldComboValueChange.bind(this , 'selectedBallotBox')} inputStyle={{borderColor:(this.props.validatorsObject.validatedBallotBox ? '#ccc' : '#ff0000')}} /></div></div>
                                        </td>
                                        <td>
                                                <label className="control-label">שם פרטי שר מאה</label>
												<input type="text" className="form-control" onChange={this.searchFieldComboValueChange.bind(this , 'ministerFirstName')} value={this.props.searchScreen.ministerFirstName}
												style={{borderColor:(this.props.validatorsObject.validatedMinimumSearch ? '#ccc' : '#ff0000'),width:'90%'}}
												/>
                                        </td>
                                        <td>
										        <label  className="control-label">שם משפחה שר מאה</label>
												<input type="text" className="form-control"  onChange={this.searchFieldComboValueChange.bind(this , 'ministerLastName')} value={this.props.searchScreen.ministerLastName}
												style={{borderColor:(this.props.validatorsObject.validatedMinimumSearch ? '#ccc' : '#ff0000'),width:'90%'}} />
                                        </td>
                                        <td>
                                                <label  className="control-label">ת.ז שר מאה</label>
                                                <div className="row">
												<div className="col-md-11" style={{paddingLeft:'0px'}}>
												<input type="text" className="form-control" maxLength="9"  onChange={this.searchFieldComboValueChange.bind(this , 'ministerID')} value={this.props.searchScreen.ministerID} onKeyPress={this.handleKeyPress.bind(this)}
												style={{borderColor:(this.props.validatorsObject.validatedMinimumSearch ? '#ccc' : '#ff0000'),width:'95%'}}/>
                                                </div>
												<div className="col-md-1 no-padding">
												<a className="search-icon blue" title="חפש" onClick={this.showSearchCaptainModalDialog.bind(this)} style={{cursor:'pointer' , position:'relative',left:'40px' , top:'2px'}}> </a>
                                                </div>
												</div>
										</td>
										<td></td>
                                    </tr>
									</tbody>
									</table>
                                 
                            </div>
                        </div>
                    </div>
                </div>
        );
    }
	
	 /*handle key press "enter" at personal identity field */
    handleKeyPress(event) {
        if (event.charCode == 13) { /*if user pressed enter*/
		  if(this.props.searchScreen.ministerID != ''){
            ElectionsActions.searchCap50VoterById(this.props.dispatch , this.props.searchScreen.ministerID);
		  }
		}
    }
	
	
	/*
           Handles change in one of comboes 
    */
    searchFieldComboValueChange(fieldName , e){
		
		     if(['selectedArea' , 'selectedSubArea','selectedCity','selectedNeighborhood','selectedCluster' , 'selectedBallotBox'].indexOf(fieldName) >= 0){
                this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName , fieldValue:{selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
             }
			 else{
				 if(fieldName == 'ministerID'){
					 
					 if(!new RegExp('^[0-9]*$').test(e.target.value)){return;} // allow only numbers in the field
				 }
				 this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName , fieldValue:e.target.value});
			 }
			 // this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_SHOW_SEARCH_RESULTS , show:false});//hide search results on any change
             let self = this;
				switch (fieldName){
                  case 'selectedArea' :
				     let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || city.area_id == e.target.selectedItem.id});
					 this.setState({filteredSubAreasList : this.props.currentUserGeographicalFilteredLists.sub_areas.filter(function(subArea){return !e.target.selectedItem || subArea.area_id == e.target.selectedItem.id})});
                     this.setState({filteredCities : newFilteredCities});
                     this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName:'selectedSubArea' , fieldValue:{selectedValue:'' , selectedItem:null}});
                     this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedCity' , fieldValue:{selectedValue:'' , selectedItem:null}});
                    
					 break;
                  case 'selectedSubArea' :
                     if(this.props.searchScreen.selectedArea.selectedItem){
						this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || (city.area_id == self.props.searchScreen.selectedArea.selectedItem.id && city.sub_area_id == e.target.selectedItem.id)})});
						this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedCity' , fieldValue:{selectedValue:'' , selectedItem:null}});
                     }
                     else{
 
                        this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || (city.sub_area_id == e.target.selectedItem.id)})});
						this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedCity' , fieldValue:{selectedValue:'' , selectedItem:null}});
                        if(e.target.selectedItem){
							for(let i = 0 ;i < this.props.currentUserGeographicalFilteredLists.areas.length;i++){
                                 if(this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id){
                                       this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedArea' , fieldValue:this.props.currentUserGeographicalFilteredLists.areas[i].name , fieldItem:this.props.currentUserGeographicalFilteredLists.areas[i]});
                                       break;
                                 }
							}
                        }
                     }
                     break;
                  case 'selectedCity' :
				  
				     this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedNeighborhood' , fieldValue:{selectedValue:'' , selectedItem:null}});
                     this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedCluster' , fieldValue:{selectedValue:'' , selectedItem:null}});
					 if(e.target.selectedItem){
						if(!this.props.searchScreen.selectedArea.selectedItem){
                            for(let i = 0 ;i < this.props.currentUserGeographicalFilteredLists.areas.length;i++){
                                 if(this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id){
                                       this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName:'selectedArea' , fieldValue:this.props.currentUserGeographicalFilteredLists.areas[i].name , fieldItem:this.props.currentUserGeographicalFilteredLists.areas[i]});
                                       break;
                                 }
							}
						}
                        if(!this.props.searchScreen.selectedSubArea.selectedItem){
                            for(let i = 0 ;i < this.props.currentUserGeographicalFilteredLists.sub_areas.length;i++){
                                 if(this.props.currentUserGeographicalFilteredLists.sub_areas[i].id == e.target.selectedItem.sub_area_id){
                                       this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedSubArea' , fieldValue:this.props.currentUserGeographicalFilteredLists.sub_areas[i].name , fieldItem:this.props.currentUserGeographicalFilteredLists.sub_areas[i]});
                                       break;
                                 }
							}
						}
                        
                       // if(this.props.searchScreen.cityCachedDataLists[e.target.selectedItem.key]){ //load from cache
							//this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_NEIGHBORHOODS_AND_CLUSTERS_ITEMS ,  neighborhoods:this.props.cityCachedDataList[e.target.selectedItem.key].neighborhoods , clusters : this.props.cityCachedDataList[e.target.selectedItem.key].clusters});
                       // }
                       // else{ //load from api
                            ElectionsActions.getClustersNeighborhoodsBallotsByCity(this.props.dispatch , e.target.selectedItem.key , 'captain50walkerReport');
                       // }
						
                     }
                     else{
						  this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'clusters' , fieldValue:[]});
	                      this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'neighborhoods' , fieldValue:[]});
	                      this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'ballotBoxes' , fieldValue:[]});
                     }
                     break;
                 case 'selectedNeighborhood' :
				    this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedCluster' , fieldValue:{selectedValue:'' , selectedItem:null}});
                    if(e.target.selectedItem){
					 	let filteredCluster = this.props.searchScreen.clusters.filter(function(cluster){
							return cluster.neighborhood_id == e.target.selectedItem.id;
						});
						this.setState({filteredClusters:filteredCluster});
						
						let filteredBallotBoxes = this.props.searchScreen.ballotBoxes.filter(function(ballotBox){
							return ballotBox.neighborhood_id == e.target.selectedItem.id;
						});
						this.setState({filteredBallotBoxes:filteredBallotBoxes});
						 
					}
					else{
						 this.setState({filteredClusters:null});
						 this.setState({filteredBallotBoxes:null});
					}
                    break;
				 case 'selectedCluster' :
				    this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedBallotBox' , fieldValue:{selectedValue:'' , selectedItem:null}});
                    if(e.target.selectedItem){
					 
						let filteredBallotBoxes = this.props.searchScreen.ballotBoxes.filter(function(ballotBox){
							return ballotBox.cluster_id == e.target.selectedItem.id;
						});
						this.setState({filteredBallotBoxes:filteredBallotBoxes});
						 
					}
					else{
						 this.setState({filteredClusters:null});
						 this.setState({filteredBallotBoxes:null});
					}
                    break;

                  default:
                     break;
				}
             
    }
	
}


function mapStateToProps(state) {
    return {
		 currentUser: state.system.currentUser,
	     currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		 searchScreen:state.elections.reportsScreen.captain50WalkerReport.searchScreen,
		 searchCaptainFiftyVoterModal : state.elections.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal,
    }
}

export default connect(mapStateToProps)(withRouter(TopFirstSearch));