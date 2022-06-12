import React from 'react';
import { connect } from 'react-redux';

import Combo from '../../../global/Combo';
import {Link} from 'react-router';
import * as ElectionsActions from '../../../../actions/ElectionsActions';


class Captain50ActivitySearch extends React.Component {
    constructor(props) {
        super(props);
		this.state={
			       filteredCities : [],
				   filteredAreasList : [] , 
				   filteredSubAreasList : [] , 
				   filteredNeighborhoodsList:[]
				   };
        this.initConstants();
    }

    initConstants() {
        this.invalidColor = '#cc0000';
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
    }

    displayCaptain50Activity(event) {
        // Prevent page refresh
        event.preventDefault();

        if ( !this.isValidatedForm ) {
            return;
        }

        let searchObj = {
            area_id: (this.props.searchScreen.selectedArea.selectedItem ? this.props.searchScreen.selectedArea.selectedItem.id : null ),
            sub_area_id: (this.props.searchScreen.selectedSubArea.selectedItem ? this.props.searchScreen.selectedSubArea.selectedItem.id : null),
            city_id: (this.props.searchScreen.selectedCity.selectedItem ? this.props.searchScreen.selectedCity.selectedItem.id :null ),
			neighborhood_id: (this.props.searchScreen.selectedNeighborhood.selectedItem ? this.props.searchScreen.selectedNeighborhood.selectedItem.id : null )
        };
 
        ElectionsActions.displayCaptain50Activity(this.props.dispatch, searchObj);
    }

 
    /*
	    Init dynamic variables and components for render function  
	*/
	initVariables(){
		this.isValidatedForm = true;
		for(let key in this.props.validatorsObject){
			this.isValidatedForm = this.isValidatedForm && this.props.validatorsObject[key]; 
		}
	}
	
	cleanScreen(){
		 this.props.dispatch({type : ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CLEAN_SCREEN});
	}
		
	/*
           Handles change in one of comboes 
    */
    searchFieldComboValueChange(fieldName , e){
		
		     if(['selectedArea' , 'selectedSubArea','selectedCity','selectedNeighborhood'].indexOf(fieldName) >= 0){
                this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName , fieldValue:{selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
             }
	         let self = this;

				switch (fieldName){
                  case 'selectedArea' :
				     let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || city.area_id == e.target.selectedItem.id});
					 this.setState({filteredSubAreasList : this.props.currentUserGeographicalFilteredLists.sub_areas.filter(function(subArea){return !e.target.selectedItem || subArea.area_id == e.target.selectedItem.id})});
                     this.setState({filteredCities : newFilteredCities});
                     this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName:'selectedSubArea' , fieldValue:{selectedValue:'' , selectedItem:null}});
                     this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedCity' , fieldValue:{selectedValue:'' , selectedItem:null}});
                    this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedNeighborhood' , fieldValue:{selectedValue:'' , selectedItem:null}});
					 break;
                  case 'selectedSubArea' :
                     if(this.props.searchScreen.selectedArea.selectedItem){
						this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || (city.area_id == self.props.searchScreen.selectedArea.selectedItem.id && city.sub_area_id == e.target.selectedItem.id)})});
						
						this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedCity' , fieldValue:{selectedValue:'' , selectedItem:null}});
						this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedNeighborhood' , fieldValue:{selectedValue:'' , selectedItem:null}});
                     }
                     else{
 
                        this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || (city.sub_area_id == e.target.selectedItem.id)})});
						this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedCity' , fieldValue:{selectedValue:'' , selectedItem:null}});
                        if(e.target.selectedItem){
							for(let i = 0 ;i < this.props.currentUserGeographicalFilteredLists.areas.length;i++){
                                 if(this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id){
                                       this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedArea' , fieldValue:this.props.currentUserGeographicalFilteredLists.areas[i].name , fieldItem:this.props.currentUserGeographicalFilteredLists.areas[i]});
                                       break;
                                 }
							}
                        }
                     }
                     break;
                  case 'selectedCity' :
				  
				     this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedNeighborhood' , fieldValue:{selectedValue:'' , selectedItem:null}});
                     this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedCluster' , fieldValue:{selectedValue:'' , selectedItem:null}});
					 if(e.target.selectedItem){
						if(!this.props.searchScreen.selectedArea.selectedItem){
                            for(let i = 0 ;i < this.props.currentUserGeographicalFilteredLists.areas.length;i++){
                                 if(this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id){
                                       this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName:'selectedArea' , fieldValue:this.props.currentUserGeographicalFilteredLists.areas[i].name , fieldItem:this.props.currentUserGeographicalFilteredLists.areas[i]});
                                       break;
                                 }
							}
						}
                        if(!this.props.searchScreen.selectedSubArea.selectedItem){
                            for(let i = 0 ;i < this.props.currentUserGeographicalFilteredLists.sub_areas.length;i++){
                                 if(this.props.currentUserGeographicalFilteredLists.sub_areas[i].id == e.target.selectedItem.sub_area_id){
                                       this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'selectedSubArea' , fieldValue:this.props.currentUserGeographicalFilteredLists.sub_areas[i].name , fieldItem:this.props.currentUserGeographicalFilteredLists.sub_areas[i]});
                                       break;
                                 }
							}
						}
                        
                         ElectionsActions.getClustersNeighborhoodsBallotsByCity(this.props.dispatch , e.target.selectedItem.key , 'captainScreen');
						
                     }
                     else{
	                      this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE , fieldName:'neighborhoods' , fieldValue:[]});
                     }
                     break;
         

                  default:
                     break;
				}
             
    }
 
    render() {
        this.initVariables();
        let exportCaptainByBallotsLink = 'elections/reports/captain50-by-ballots/export';

        return (
      
                <div className="bg-container first-box-on-page" style={{marginTop:'15px'}}>
                    <div className="panelCollapse">
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <div className="collapseTitle">חיפוש
                            { this.props.currentUser.admin &&
                                <Link title="ייצוא שרי מאה לפי קלפיות" to={exportCaptainByBallotsLink} className="icon-box excel" target="_blank" style={{float:'left'}}/>
                            }
                            { this.props.currentUser.admin &&
                                <Link title="ייצוא שר50 עיקרי קלפיות" to={exportCaptainByBallotsLink + '?ballot_single_captain50=true'} className="icon-box excel" target="_blank" style={{float:'left', marginLeft: '20px'}}/>
                            }
                        </div>
                    </div>
                    <div id="collapse-search" className="collapse in" aria-expanded="true">
                        <div className="row panelContent srchPanelLabel">
               
                                <div className="col-md-5ths">
                                    <div className="form-group">
                                        <label htmlFor="captain50-activity-report-area" className="control-label">אזור</label>
                                        <Combo items={this.state.filteredAreasList} placeholder="בחר אזור" 
               								   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' 
											   value={this.props.searchScreen.selectedArea.selectedValue}  
											   onChange={this.searchFieldComboValueChange.bind(this , 'selectedArea')}  
											   inputStyle={{borderColor:(this.props.validatorsObject.validatedArea  && this.props.validatorsObject.validatedMinimumSearch  ? '#ccc' : this.invalidColor )}}  />
                                    </div>
                                </div>
                                <div className="col-md-5ths">
                                    <div className="form-group">
                                        <label htmlFor="captain50-activity-report-sub-area" className="control-label">תת אזור</label>
                                        <Combo items={this.state.filteredSubAreasList} placeholder="בחר תת אזור"  
 										       maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'   
											   value={this.props.searchScreen.selectedSubArea.selectedValue}
											   onChange={this.searchFieldComboValueChange.bind(this , 'selectedSubArea')}
											   inputStyle={{borderColor:(this.props.validatorsObject.validatedSubArea ? '#ccc' : this.invalidColor )}} />
                                    </div>
                                </div>
                                <div className="col-md-5ths">
                                    <div className="form-group">
                                        <label htmlFor="captain50-activity-report-city" className="control-label">עיר</label>
                                        <Combo items={this.state.filteredCities} placeholder="בחר עיר"  maxDisplayItems={5}  
										       itemIdProperty="id" itemDisplayProperty='name'   value={this.props.searchScreen.selectedCity.selectedValue}
											   onChange={this.searchFieldComboValueChange.bind(this , 'selectedCity')}
											   inputStyle={{borderColor:(this.props.validatorsObject.validatedCity && this.props.validatorsObject.validatedMinimumSearch ? '#ccc' : this.invalidColor )}} />
                                    </div>
                                </div>
                                <div className="col-md-5ths">
                                    <div className="form-group">
                                        <label htmlFor="ty-4" className="control-label">איזורים מיוחדים</label>
                                        <Combo items={this.props.searchScreen.neighborhoods} placeholder="בחר אזור מיוחד"  maxDisplayItems={5} 
										itemIdProperty="id" itemDisplayProperty='name'  value={this.props.searchScreen.selectedNeighborhood.selectedValue}  
										onChange={this.searchFieldComboValueChange.bind(this , 'selectedNeighborhood')} 
										inputStyle={{borderColor:(this.props.validatorsObject.validatedNeighborhood ? '#ccc' : this.invalidColor )}} />
                                    </div>
                                </div>
                                <div className="col-md-5ths">
                                    <div className="form-group">
                                        <div className="flex-end">
                                            <a style={{cursor:'pointer'}} onClick={this.cleanScreen.bind(this)} className="clear-btn">נקה הכל</a>
                                            <div className="box-button-single">
                                                <button type="submit" className="btn btn-primary srchBtn"
                                                        onClick={this.displayCaptain50Activity.bind(this)}
                                                        disabled={!this.isValidatedForm }>הצג</button>
                                            </div>
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
        currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
        searchScreen : state.elections.captainScreen.searchScreen,
        loadingData: state.elections.captainScreen.loadingData
    }
}

export default connect(mapStateToProps) (Captain50ActivitySearch);