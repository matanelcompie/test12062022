import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from 'actions/SystemActions';
import * as ElectionsActions from 'actions/ElectionsActions';
 


class DataSummaryLastStep extends React.Component {

    constructor(props) {
        super(props);
       
    }

 
    componentWillMount() {
		
           
    }

	/*
	Handles returning to previous stage
	*/
	goToPreviousStage(){
		 if(this.props.router.params.updateKey == 'new'){
			this.props.dispatch({type:ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE , fieldName:'selected_voters_count' , fieldValue:-1 });
			this.props.dispatch({type:ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE , fieldName:'total_households_count' , fieldValue:-1 });
		 }
		 this.props.dispatch({type:ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE , fieldName:'currentStageNumber' , fieldValue:1 });
	} 
	
	/*
	Do real addition of task via api
	*/
	addNewUpdateHouseholdStatusTask(){
		let data={};
		data.name = this.props.searchScreen.updateName;
		data.total_voters_count_in_geo_entity=this.props.searchScreen.total_voters_count_in_geo_entity;
		data.total_households_count_in_geo_entity=this.props.searchScreen.total_households_count_in_geo_entity;
		data.total_voters_count=this.props.searchScreen.selected_voters_count;
		data.total_households_count=this.props.searchScreen.total_households_count;
		data.selected_support_status_id=this.props.searchScreen.selectedFinalSupportStatus.selectedItem.id;
		data.household_voters_inclusion_support_status_type=this.props.searchScreen.selectedDefinitionEntityType.selectedItem.id;
		data.household_voters_inclusion_limit=this.props.searchScreen.selectedDefinitionHouseholdsNumHouseholds;
		data.household_voters_inclusion_type=this.props.searchScreen.selectedDefinitionHouseholdsWhereCondition.selectedItem.id;
		
		
		let entity_type=0;
		let entity_id = 0;
		if(this.props.searchScreen.selectedBallotBox.selectedItem && this.props.searchScreen.selectedCluster.selectedItem && this.props.searchScreen.selectedCity){
		     entity_type = 4;	
			 entity_id = this.props.searchScreen.selectedBallotBox.selectedItem.id;
		}
		else if(this.props.searchScreen.selectedCluster.selectedItem && this.props.searchScreen.selectedCity){
		     entity_type = 3;	
			 entity_id = this.props.searchScreen.selectedCluster.selectedItem.id;
		}
		else if(this.props.searchScreen.selectedNeighborhood.selectedItem && this.props.searchScreen.selectedCity){
		     entity_type = 2;	
			 entity_id = this.props.searchScreen.selectedNeighborhood.selectedItem.id;
		}
		else if(this.props.searchScreen.selectedCity){
		     entity_type = 1;	
			 entity_id = this.props.searchScreen.selectedCity.selectedItem.id;
		}
		data.entity_type = entity_type;
		data.entity_id = entity_id;
		data.defined_support_statuses = '';
		data.actual_support_statuses = '';
		for(let i = 0 ; i < this.props.searchScreen.definedVoterSupportStatuses.length ; i++){
				if(this.props.searchScreen.definedVoterSupportStatuses[i]){
					if(i == this.props.searchScreen.definedVoterSupportStatuses.length-1){
						data.defined_support_statuses+= '-1,';
						
					}else{
						data.defined_support_statuses+= ''+this.props.searchScreen.supportStatuses[i].id + ',';
					}
				}
				
				if(this.props.searchScreen.actualVoterSupportStatuses[i]){
					if(i == this.props.searchScreen.actualVoterSupportStatuses.length-1){
						data.actual_support_statuses+= '-1,';
						
					}else{
						data.actual_support_statuses+= ''+this.props.searchScreen.supportStatuses[i].id + ',';
					}
				}
		}
		ElectionsActions.addNewUpdateHouseholdStatusTask(this.props.dispatch , this.props.router , data);	
	}
  
    /*
	Handles redirecting url to dashboard main page
	*/
    redirectToDashboard(){
		this.props.dispatch({type: ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CLEAN_STAGES_DATA });
		this.props.router.push('elections/household_status_change');
	}
 
    render() {
         return  <div>
					 <div className="first-box-on-page"  style={{marginTop:'15px'}}>
						<div className="row nomargin Wizard dataUpdateWizard">
							<ul className="nav nav-tabs steps-2 steps ">
								<li style={{width:'50%'}}><a style={{cursor:'pointer'}} title="תנאי הגדרה" onClick={this.goToPreviousStage.bind(this)}><span className="WizNumber1">1.</span><span className="WizText" style={{fontSize:'22px' , marginTop:'-3px'}}>תנאי הגדרה</span></a></li>
								<li  style={{width:'50%'}} className="active"><a title="סיכום ועידכון"><span className="WizNumber">2.</span><span className="WizText WizTextMobile " style={{fontSize:'22px' , marginTop:'-3px'}}>סיכום ועידכון</span></a></li>
							</ul>
						</div>
						<div className="row contentContainer sum-erea">
							<div className="col-md-3">
								<h3 style={{color:'#327DA4' , fontWeight:'600'}}>{this.props.searchScreen.total_voters_count_in_geo_entity == -1 ?  <i className="fa fa-spinner fa-spin"></i> :this.props.searchScreen.total_voters_count_in_geo_entity }</h3>
								<p style={{fontSize:'18px'}}>תושבים באיזור שהוגדר</p>
							</div>
							<div className="col-md-3">
								<h3 style={{color:'#327DA4' , fontWeight:'600'}}>{this.props.searchScreen.total_households_count_in_geo_entity == -1 ?  <i className="fa fa-spinner fa-spin"></i> :this.props.searchScreen.total_households_count_in_geo_entity }</h3>
								<p style={{fontSize:'18px'}}>בתי אב באיזור שהוגדר</p>
							</div>
							<div className="col-md-3">
								<h3 style={{color:'#327DA4' , fontWeight:'600'}}>{this.props.searchScreen.total_households_count == -1 ?  <i className="fa fa-spinner fa-spin"></i> :this.props.searchScreen.total_households_count || 0  }</h3>
								<p style={{fontSize:'18px'}}>בתי אב שעונים על ההגדרה</p>
							</div>
							<div className="col-md-3">
								<h3 style={{color:'#327DA4' , fontWeight:'600'}}>{this.props.searchScreen.selected_voters_count == -1 ?  <i className="fa fa-spinner fa-spin"></i> :this.props.searchScreen.selected_voters_count || 0 }</h3>
								<p style={{fontSize:'18px'}}>תושבים להם יבוצע עדכון</p>
							</div>
						</div>
					 </div>
					 
					 {this.props.router.params.updateKey == 'new' ? 
					 <div className="row nomargin">
						<a style={{cursor:'pointer'}}  onClick={this.goToPreviousStage.bind(this)} title="תנאי הגדרה"><div className="col-md-6 back-to-definitions" style={{fontSize:'20px' , fontWeight:'600'}}>
						<img src={window.Laravel.baseURL + "Images/arrows-right.png"} />&nbsp;
						חזור לשלב ההגדרות</div></a>
				        <div className="col-md-6">
							<button type="submit" className="btn btn-primary pull-left" style={{backgroundColor:'#498BB6' , fontSize:'18px',padding:'6px 40px 6px 40px'}} onClick={this.addNewUpdateHouseholdStatusTask.bind(this)} disabled={this.props.searchScreen.total_voters_count_in_geo_entity == -1 || this.props.searchScreen.total_households_count_in_geo_entity == -1 || this.props.searchScreen.selected_voters_count == -1 || this.props.searchScreen.total_households_count == -1}>עדכן</button>
                            <a onClick={this.redirectToDashboard.bind(this)}><button type="submit" className="btn btn-primary pull-left btn-cancel" style={{backgroundColor:'#fff',padding:'6px 0', color:'#498BB6' , fontWeight:'600' , width:'120px' , fontSize:'18px' , marginLeft:'15px'}}>בטל הכל</button></a>
                       </div>
                     </div> : <div className="row nomargin">
						<a style={{cursor:'pointer'}}  onClick={this.goToPreviousStage.bind(this)} title="תנאי הגדרה"><div className="col-md-6 back-to-definitions" style={{fontSize:'20px' , fontWeight:'600'}}>
						<img src={window.Laravel.baseURL + "Images/arrows-right.png"} />&nbsp;
						חזור לשלב ההגדרות</div></a><div className="col-md-6 text-left">
							 <a style={{cursor:'pointer'}} title="חזרה לרשימת עבודות" onClick={this.props.goToDashboard.bind(this)}>
				         <button type="submit" className="btn btn-primary"   style={{backgroundColor:'#498BB6' , fontSize:'18px' , padding:'6px 40px 6px 40px'}}>חזרה לרשימת עבודות</button>
					</a>
                       </div></div> }
					 
                 </div>
    }
}


function mapStateToProps(state) {
    return {
         currentUser: state.system.currentUser,
		 currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		 searchScreen:state.elections.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen,  
    }
}

export default connect(mapStateToProps)(withRouter(DataSummaryLastStep));