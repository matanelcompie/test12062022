import React from 'react';
import { connect } from 'react-redux';
import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import {dateTimeReversePrint, parseDateToPicker, parseDateFromPicker} from '../../../../../libs/globalFunctions';
import * as SystemActions from '../../../../../actions/SystemActions';
import {arraySort} from '../../../../../libs/globalFunctions';

class TopHeaderSearch extends React.Component {

	constructor(props) {
        super(props);
		this.state = {
            searchFields: {
				group_name : '',
                user_name : '' ,
                start_date: null,
                end_date: null
            },
        };
		momentLocalizer(moment);
    }
	
	/*
		Function that performs the search action
	*/
	doSearchAction(){
		let parentNotBelongingItemsCount = 0;
		this.props.dispatch({type:SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED , fieldName:'showSearchMode',fieldValue:true});
		let parentHashes = {};
		let foundResultsArray = [];
		let parentIDSArr = [];
		for(let i = 0 ; i < this.props.voterGroups.length ; i++){
			let isMatchingItem = true;
			if(this.props.voterGroups[i]){
				if(this.state.searchFields.group_name.trim().length > 0){
					if(this.props.voterGroups[i].name.indexOf(this.state.searchFields.group_name) == -1 ){
						isMatchingItem = isMatchingItem && false;
					}
				}
				if(this.state.searchFields.user_name.trim().length > 0){
					if(this.props.voterGroups[i].user){
						let fullName = this.props.voterGroups[i].user.first_name + " " + this.props.voterGroups[i].user.last_name
						if(fullName.indexOf(this.state.searchFields.user_name) == -1){
							isMatchingItem = isMatchingItem && false;
						}
					}
				}
				if(this.state.searchFields.start_date){
					let createdAtDate = (new Date(this.props.voterGroups[i].created_at));
					let selectedFromDate = (new Date(this.state.searchFields.start_date));
					if((createdAtDate-selectedFromDate)/(1000 * 60*60*24) < -1){
						isMatchingItem = isMatchingItem && false;
					}
				}
				if(this.state.searchFields.end_date){
					let createdAtDate = (new Date(this.props.voterGroups[i].created_at));
					let selectedToDate = (new Date(this.state.searchFields.end_date));
					if((selectedToDate - createdAtDate)/(1000 * 60*60*24) < -1){
						isMatchingItem = isMatchingItem && false;
					}
				}
			}
			if(isMatchingItem && this.props.voterGroups[i]){
	            parentHashes[this.props.voterGroups[i].id] = true;
				if(parentIDSArr.indexOf(this.props.voterGroups[i].id) < 0){
					 parentIDSArr.push(this.props.voterGroups[i].id);
				}
				foundResultsArray.push(this.props.voterGroups[i]);
				if(this.props.voterGroups[i].parent){
					let parentElement = this.props.voterGroups[i].parent;
					do{
						if(!parentHashes[parentElement.id] ){
							parentHashes[parentElement.id] = true;
							foundResultsArray.push(parentElement);
							this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_VOTER_GROUP_OPEN_STSTUS, id: parentElement.id});
							parentNotBelongingItemsCount++;
							
						}
					parentElement = parentElement.parent;
					}while(parentElement)
				}
			}
		}
		if(parentIDSArr.length > 0){
			for(let i = 0 ; i < this.props.voterGroups.length ; i++){
				if(this.props.voterGroups[i] && parentIDSArr.indexOf(this.props.voterGroups[i].parent.id) >=0){
					foundResultsArray.push(this.props.voterGroups[i]);
				}
			}
		}
		this.props.dispatch({type:SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED , fieldName:'parentNotBelongingItemsCount',fieldValue:parentNotBelongingItemsCount});
		let groups = [...foundResultsArray];
		let groupsHashMap = [];
        let groupsArray = [];
        let mainParents = [];
        groups.forEach(function (group) {
            if (group) {
                 groupsHashMap[group.id] = group;
				 group.children = [];
            }
        });
        groups.forEach(function (group) {
			if (group) {
				if (group.parent_id == 0) {
                      groupsArray.push(group);
                      group.parent = 0;
                      mainParents.push(group);
                      mainParents.sort(arraySort('asc', 'group_order'));
                      groupsArray.sort(arraySort('asc', 'group_order'));
                 } else {
                      let parentId = group.parent_id;
					  if(groupsHashMap[parentId]){
						groupsHashMap[parentId].children.push(group);
						group.parent = groupsHashMap[parentId];
						groupsHashMap[parentId].children.sort(arraySort('asc', 'group_order'));
					  }
                 }
            }
         });
        
		
		this.props.dispatch({type:SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED , fieldName:'topSearchAllResults',fieldValue:foundResultsArray});
		this.props.dispatch({type:SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED , fieldName:'topSearchHierarchyResults',fieldValue:groupsArray});
	}
	
	/*
		Handles changes in end date field
	*/
	endDateChange(value, filter) {
        let searchFields = this.state.searchFields;
        searchFields.end_date = value;

        this.setState({searchFields});
    }

	/*
		Handles changes in start date field
	*/
    startDateChange(value, filter) {
        let searchFields = this.state.searchFields;
        searchFields.start_date = value;
        this.setState({searchFields});
    }
	
	/*
		Handles change in group name search field
	*/
	groupNameChange(e){
		let searchFields = this.state.searchFields;
        searchFields.group_name = e.target.value;
		this.setState({searchFields});
	}
	
	/*
		Handles change in creating user name search field
	*/
	userNameChange(e){
		let searchFields = this.state.searchFields;
        searchFields.user_name = e.target.value;
		this.setState({searchFields});
	}
	
	/*
		Function that handles clicking "clean all" and it cleans search fields and search values
	*/
	resetSearch(){
		this.props.dispatch({type:SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED , fieldName:'parentNotBelongingItemsCount',fieldValue:0});
		this.setState({searchFields: {
				group_name : '',
                user_name : '' ,
                start_date: null,
                end_date: null
            }});
		this.props.dispatch({type:SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED , fieldName:'showSearchMode',fieldValue:false});
		this.props.dispatch({type:SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED , fieldName:'topSearchAllResults',fieldValue:[]});
		this.props.dispatch({type:SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED , fieldName:'topSearchHierarchyResults',fieldValue:[]});
	}
	
    render() {
            return (
					<div className="row srchPanelLabel">
						<div className="col-md-5ths">
							<div className="form-group">
								<label htmlFor="name" className="control-label">שם</label>
								<input type="text" className="form-control" id="name" value={this.state.searchFields.group_name} onChange={this.groupNameChange.bind(this)} />
							</div>
						</div>
						<div className="col-md-5ths">
							<div className="form-group">
								<label htmlFor="user-create" className="control-label">משתמש יוצר</label>
								<input type="text" className="form-control" id="user-create" value={this.state.searchFields.user_name} onChange={this.userNameChange.bind(this)}  />
							</div>
						</div>
						<div className="col-md-5ths">
								<label htmlFor="FromDateStatus" className="control-label"> מתאריך יצירה</label>
							    <ReactWidgets.DateTimePicker
                                                isRtl={true} time={false}
                                                value={parseDateToPicker(this.state.searchFields.start_date)}
                                                onChange={parseDateFromPicker.bind(this, {callback: this.startDateChange,
                                                    format: "YYYY-MM-DD",
                                                    functionParams: 'dateTime'})
                                                }
                                                format="DD/MM/YYYY"
                                 />
						</div>
						<div className="col-md-5ths">
								<label htmlFor="UntilDateStatus" className="control-label">עד תאריך יצירה</label>
								<ReactWidgets.DateTimePicker
                                                isRtl={true} time={false}
                                                value={parseDateToPicker(this.state.searchFields.end_date)}
                                                onChange={parseDateFromPicker.bind(this, {callback: this.endDateChange,
                                                    format: "YYYY-MM-DD",
                                                    functionParams: 'dateTime'})
                                                }
                                                format="DD/MM/YYYY"
                                    />
						</div>
						<div className="col-md-5ths">
							<input type="reset" value="נקה הכל" title="נקה חיפוש" className="ClearFields clear-search-groups" onClick={this.resetSearch.bind(this)} />
							<div className="text-left">
								<button type="submit" className="btn btn-primary srchBtn" 
										onClick={this.doSearchAction.bind(this)} 
										disabled={this.state.searchFields.user_name.trim().length ==0 && this.state.searchFields.group_name.trim().length == 0 && !this.state.searchFields.start_date && !this.state.searchFields.end_date}>הצג</button>
							</div>
						</div>
					</div>
                    );
        }
    }

    function mapStateToProps(state) {
        return {
            voterGroups: state.system.lists.voterGroups,
            hieraticalVoterGroups: state.system.lists.hieraticalVoterGroups,
            openVoterGroups: state.system.listsScreen.voterTab.openVoterGroups,
            parentNotBelongingItemsCount: state.system.listsScreen.voterTab.parentNotBelongingItemsCount,
        };
    }
    export default connect(mapStateToProps)(TopHeaderSearch);