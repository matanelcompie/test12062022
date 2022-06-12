import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import store from '../../../../../store';
import FilterGroup from 'components/global/voterFilter/container/FilterGroup';
import ReportSearchResults from './ReportSearchResults';

import { bindActionCreators } from 'redux';
import * as voterFilterActions from 'actions/VoterFilterActions';



class TopFiletersSearch extends React.Component {

    constructor(props) {
        super(props);
		this.state = {
			filtersExpanded:false
		}
    }
	
	
	//get the relevant items for the group
    getGroupItems(filterItems, subGroups) {
        const groupDefinitionIds = [];
        subGroups.map(function (group) {
            group.definitions.map(function (definition) {
                groupDefinitionIds.push(definition.id);
            });
        });

        let groupItems = filterItems.filter(function (item) {
            return (groupDefinitionIds.indexOf(item.voter_filter_definition_id) > -1);
        });
        return groupItems;
    }
	
	/*
	    Handles expanding/shrinking one of filters
	*/
	filterGroupClick(fieldName){
        	
	}
	
	/*
	    Init dynamic variables and components for render function  
	*/
	initDynamicVariables(){
		this.isValidatedForm = true;
		for(let key in this.props.validatorsObject){
			this.isValidatedForm = this.isValidatedForm && this.props.validatorsObject[key]; 
		}
		
		if(this.state.filtersExpanded){
			this.expandAllItem = null;
			this.shrinkAllItem=<div className="col-lg-12 text-left rsltsTitleRow">
                                    <a className="link-underline-over" style={{cursor:'pointer'}} onClick={this.expandShringAllFilters.bind(this,false)}>סגור הכל</a>
                                </div>;
		}
		else{
			this.expandAllItem=<div className="col-lg-12 text-left">
                                    <a className="link-underline-over" style={{cursor:'pointer'}} onClick={this.expandShringAllFilters.bind(this,true)}>פתח הכל</a>
                                </div>;
			this.shrinkAllItem = null;
		}
	    this.searchWithEditItem = null;
		if(this.props.currentUser.admin == true ||   this.props.currentUser.permissions['elections.reports.captain_of_fifty_walker.edit'] == true){
		    this.searchWithEditItem =  <button title="הצג עם אפשרות עידכון" className="item-space btn btn-primary srchBtn btn-negative" style={{color:'#2AB4C0' , backgroundColor:'#ffffff' , borderColor:'#2AB4C0' , borderWidth:'2px'}} onClick={this.showReportsData.bind(this , true)} disabled={!this.isValidatedForm }>הצג עם אפשרות עידכון</button>;
		}
		this.loading = <div><i className="fa fa-spinner fa-spin"></i> טוען...</div>;
		this.firstFilter = null;
		this.secondFilter = null;
		this.thirdFilter = null;		
		this.filteredModules=[];
		if(this.props.modules.captain50_walker_report){
			this.filteredModules =this.props.modules.captain50_walker_report;
	 
		if(this.filteredModules) {	
		    this.loading = null;
			if(this.filteredModules[0]){
 
				this.firstFilter = <FilterGroup
				    onClick={this.filterGroupClick.bind(this , 'supportStatus')}
				    isExpanded = {this.props.additionalFiltersExpanded.supportStatus}
					key={"filter" + 0}
					id={"filter" + 0}
					moduleType={'captain50_walker_report'}
					voterFilterKey={this.props.voterFilterKey}
					group={this.filteredModules[0]}
					filterItems={this.getGroupItems(this.props.filterItems, this.filteredModules[0].sub_groups)}
					filterItemsOld={this.getGroupItems(this.props.filterItemsOld, this.filteredModules[0].sub_groups)}
					/>;
			}
			if(this.filteredModules[1]){
 
				this.secondFilter = <FilterGroup
				    onClick={this.filterGroupClick.bind(this , 'votingStatus')}
				    isExpanded = {this.props.additionalFiltersExpanded.votingStatus}
					key={"filter" + 1}
					id={"filter" + 1}
					moduleType={'captain50_walker_report'}
					voterFilterKey={this.props.voterFilterKey}
					group={this.filteredModules[1]}
					filterItems={this.getGroupItems(this.props.filterItems, this.filteredModules[1].sub_groups)}
					filterItemsOld={this.getGroupItems(this.props.filterItemsOld, this.filteredModules[1].sub_groups)}
					/>;
			}
			if(this.filteredModules[2]){
 
				this.thirdFilter = <FilterGroup
				    onClick={this.filterGroupClick.bind(this , 'groupsInShas')}
				    isExpanded = {this.props.additionalFiltersExpanded.groupsInShas}
					key={"filter" + 2}
					id={"filter" + 2}
					moduleType={'captain50_walker_report'}
					voterFilterKey={this.props.voterFilterKey}
					group={this.filteredModules[2]}
					filterItems={this.getGroupItems(this.props.filterItems, this.filteredModules[2].sub_groups)}
					filterItemsOld={this.getGroupItems(this.props.filterItemsOld, this.filteredModules[2].sub_groups)}
					/>;
			}
			if(this.filteredModules[3]){
				this.fourthFilter = <FilterGroup
				    onClick={this.filterGroupClick.bind(this , 'reportsData')}
				    isExpanded = {this.props.additionalFiltersExpanded.reportsData}
					key={"filter" + 3}
					id={"filter" + 3}
					moduleType={'captain50_walker_report'}
					voterFilterKey={this.props.voterFilterKey}
					group={this.filteredModules[3]}
					filterItems={this.getGroupItems(this.props.filterItems, this.filteredModules[3].sub_groups)}
					filterItemsOld={this.getGroupItems(this.props.filterItemsOld, this.filteredModules[3].sub_groups)}
					/>;
			}
		}
			
       	}
	}
	
	/*
	   Handles changes in checkbox values
	*/
	changeCheckboxParameterChecked(fieldName , e){
		store.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_GLOBAL_REPORT_FIELD_VALUE , fieldName , fieldValue:e.target.checked});
	}

	/*
	handle getting report data and displaying it :
	*/
	showReportsData(withEditingOption){
	    let regular_search_filters = {};
		let searchScreen = this.props.captain50WalkerReport.searchScreen;
		if(searchScreen.selectedArea.selectedItem){
			regular_search_filters.area_key = searchScreen.selectedArea.selectedItem.key;
		}
		if(searchScreen.selectedSubArea.selectedItem){
			regular_search_filters.sub_area_key = searchScreen.selectedSubArea.selectedItem.key;
		}
		if(searchScreen.selectedCity.selectedItem){
			regular_search_filters.city_key = searchScreen.selectedCity.selectedItem.key;
		}
		if(searchScreen.selectedNeighborhood.selectedItem){
			regular_search_filters.neighborhood_key = searchScreen.selectedNeighborhood.selectedItem.key;
		}
		if(searchScreen.selectedCluster.selectedItem){
			regular_search_filters.cluster_key = searchScreen.selectedCluster.selectedItem.key;
		}
		if(searchScreen.selectedBallotBox.selectedItem){
			regular_search_filters.ballot_box = searchScreen.selectedBallotBox.selectedItem.id;
		}
		if(searchScreen.ministerID != ''){
			regular_search_filters.minister_personal_identity = searchScreen.ministerID ;
		}
		if(searchScreen.ministerFirstName.split(' ').join('') != ''){
			regular_search_filters.minister_first_name = searchScreen.ministerFirstName ;
		}
		if(searchScreen.ministerLastName.split(' ').join('') != ''){
			regular_search_filters.minister_last_name = searchScreen.ministerLastName ;
		}
		store.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_GLOBAL_REPORT_FIELD_VALUE, fieldName: 'currentPage', fieldValue: 1 });
		ElectionsActions.loadCap50ReportResults(store.dispatch , {'filter_items':JSON.stringify(this.props.filterItems) , regular_search_filters:JSON.stringify(regular_search_filters) , show_support_status:(this.props.captain50WalkerReport.showCurrentSupportStatus?1:0) } , withEditingOption , this.props.captain50WalkerReport.showCurrentSupportStatus , this.props.captain50WalkerReport.showPreviousSupportStatus,true);
	}
	
	/*
	   Expand/shrink all filters by param name - expand:true/false
	*/
	expandShringAllFilters(expand){
		this.setState({filtersExpanded:expand});
		store.dispatch({type:ElectionsActions.ActionTypes.REPORTS.EXPAND_SHRINK_ALL_ADDITIONAL_FILTERS  , expand});
	}
 
    render() {
		
		this.initDynamicVariables();
        return (
		  <div className="row containerStrip dtlsBox box-content-collapse" style={{marginTop:'-15px'}}>
                    <div className="collapse-all-content">
                        <a data-toggle="collapse" href="#additional-filters" aria-expanded="true" className="">
                            <div className="panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">
                                    <span>מסננים נוספים</span>
                                </div>
                            </div>
                        </a>
                        <div id="additional-filters" className="collapse in" aria-expanded="true" >
                            <div className="row">
							{this.expandAllItem}
							{this.shrinkAllItem}
							</div>
							<div className="row">
                                <div className="col-lg-12">
								   <div className="row">
								       <div className="col-lg-6">
									       {this.firstFilter}
									   </div>
									   <div className="col-lg-6">
									       {this.secondFilter}
									   </div>
								   </div>
								   <div className="row">
								       <div className="col-lg-6">
									       {this.thirdFilter}
									   </div>
									   <div className="col-lg-6">
									       {this.fourthFilter}
									   </div>
								   </div>
								   <div className="row">
									<div className="col-lg-6">
										{this.fifthFilter}
									</div>
								   </div>
							       {this.loading}
                                </div>
							</div>
							<div className="row">
							    {this.shrinkAllItem}
                                
							</div>
                    </div>
					<table width="100%">
								<tbody>
								  <tr>
                                        <td colSpan="5" style={{textAlign:'left'}}>
                                            <div className="flex-end flexed-end">
                                                <div className="checkbox item-space">
                                                    <label>
                                                        <input type="checkbox" checked={this.props.captain50WalkerReport.showCurrentSupportStatus} onChange={this.changeCheckboxParameterChecked.bind(this , 'showCurrentSupportStatus')} />
                                                        הצג סטטוס סניף
                                                    </label>
                                                </div>
                                                <div className="checkbox item-space">
                                                    <label>
                                                        <input type="checkbox" checked={this.props.captain50WalkerReport.showPreviousSupportStatus} onChange={this.changeCheckboxParameterChecked.bind(this , 'showPreviousSupportStatus')} />
                                                        הצג סטטוס בחירות קודמות
                                                    </label>
                                                </div>
												{this.searchWithEditItem}
                                                <button title="הצג" type="submit" className="btn btn-primary srchBtn" style={{borderColor:'transparent'}} onClick={this.showReportsData.bind(this , false)} disabled={!this.isValidatedForm }>הצג</button>
                                            </div>
                                        </td>
                                    </tr>
									</tbody>
									</table>
                            
                        </div>
                </div>
        );
    }
}


function mapStateToProps(state) {
	let voterFilter = state.global.voterFilter;
    return {
		filterItems: voterFilter.captain50_walker_report.vf.filter_items,
        filterItemsOld: voterFilter.captain50_walker_report.old.filter_items,
		modules:state.global.voterFilter.modules,
		captain50WalkerReport:state.elections.reportsScreen.captain50WalkerReport,
		voterFilter:state.global.voterFilter.captain50_walker_report.vf,
		currentUser: state.system.currentUser,
		additionalFiltersExpanded:state.elections.reportsScreen.captain50WalkerReport.additionalFiltersExpanded,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        voterFilterActions: bindActionCreators(voterFilterActions, dispatch)
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(withRouter(TopFiletersSearch));