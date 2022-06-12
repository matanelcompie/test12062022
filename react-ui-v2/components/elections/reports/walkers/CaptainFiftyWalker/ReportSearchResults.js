import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import store from '../../../../../store';
import CaptainFiftyRowItem from './CaptainFiftyRowItem';
import CaptainFiftyCityRowItem from './CaptainFiftyCityRowItem';
import CaptainFiftyRelatedVoterRowItem from './CaptainFiftyRelatedVoterRowItem';
import CaptainFiftyRelatedVoterRowItemEdit from './CaptainFiftyRelatedVoterRowItemEdit';
import Pagination from '../../../../../components/global/Pagination';

import { parseDateToPicker, parseDateFromPicker , isValidComboValue } from '../../../../../libs/globalFunctions';


class ReportSearchResults extends React.Component {

    constructor(props) {
        super(props);
		this.initConstants();
    }
	
	/*
	   Init constant variables
	*/
	initConstants(){
		this.borderBottomStyle={borderBottom:'1px solid #498BB6'};
	}
	
	/*
	   Handles print button click
	*/
	printResults(pathUrl){
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
		
		let url = (window.Laravel.baseURL + 'api/elections/reports/captain_of_50_walker/' + pathUrl + '?')
			+ 'filter_items=' + JSON.stringify(this.props.filterItems)
			+ '&regular_search_filters=' + JSON.stringify(regular_search_filters) +
			'&show_support_status=' + (this.props.captain50WalkerReport.showCurrentSupportStatus ? 1 : 0);
		window.open(url, '_blank');
	}
	
	
	/*
	  Handle change of page number
	*/
	navigateToPage(nextPage) {
		let reportData = this.props.captain50WalkerReport;

		this.getMoreVotersData(nextPage, reportData.numberOfResultsPerPage);
		let maxPage = Math.ceil(this.props.totalVotersCount.length / reportData.numberOfResultsPerPage);
		 
		let pageNavigateTo = nextPage >= maxPage ? maxPage : nextPage;
		store.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_GLOBAL_REPORT_FIELD_VALUE, fieldName: 'currentPage', fieldValue: pageNavigateTo });
	}
	/*
	Handles number of results per page field is changing
	*/
	numberOfResultsFieldChanging(e){
		let value = parseInt(e.target.value)
		if(value < 1 || value > 100 || !new RegExp('^[0-9]*$').test(value)){return;} // allow only numbers in the field
		store.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_GLOBAL_REPORT_FIELD_VALUE , fieldName:'tempNumberOfResultsPerPage' , fieldValue:e.target.value});
	}
	
	/*
	Update real number of items per page
	*/
	updateResultsPerPage(results_per_page) {
		store.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_GLOBAL_REPORT_FIELD_VALUE , fieldName:'numberOfResultsPerPage' , fieldValue:results_per_page});
		store.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_GLOBAL_REPORT_FIELD_VALUE, fieldName: 'currentPage', fieldValue: 1 });
		this.getMoreVotersData(1, results_per_page);
	}
	getMoreVotersData(current_page, results_per_page) {
		let reportData = this.props.captain50WalkerReport;
		let skipRows = this.props.reportSearchResults.length;
 
		let filterObj = {
			'filter_items': JSON.stringify(this.props.filterItems), regular_search_filters: reportData.regularFiltersSearchQuery,skip_rows:  skipRows , 
			show_support_status:(this.props.captain50WalkerReport.showCurrentSupportStatus?1:0)
		}
		let nextPageTotal = current_page * results_per_page;
		if (nextPageTotal >= skipRows && skipRows < this.props.totalVotersCount) { //check if need to load more voters
			ElectionsActions.loadCap50ReportResults(store.dispatch, filterObj, reportData.displayWithEditOption, reportData.showCurrentSupportStatus, reportData.showPreviousSupportStatus, false);
		}
	}
	scrollToPageTop() {
		window.scrollTo(0, 0);
    }

    scrollToResultsTop() {
        if (this.self) {
            window.scrollTo(0, this.self.offsetTop)
        }
    }

	
    getRef(ref) {
        this.self = ref;
    }
	
	
	/*
	   Handles changes in on of editing fields
	*/
	editFieldValueChange(rowIndex , fieldName , e){
		// console.log(rowIndex , fieldName , e.target.value);
		let selectedItem = e.target.selectedItem;

		let value = e ? e.target.value : null;
		    if(fieldName=='first_phone' || fieldName=='second_phone' || fieldName=='house' || fieldName=='flat' || fieldName=='zip'){
				if(!new RegExp('^[0-9]*$').test(value)){return;}
			}
			if(fieldName=='first_phone' || fieldName=='second_phone'){
				value =	value.length <= 10 ? value : value.substring(0, 10) ;
			}
			if( fieldName=='house_entry' ){
				if(!new RegExp('^[0-9a-zA-Zא-ת]*$').test(value)){return;}
			}
		    if(fieldName == 'not_at_home' || fieldName=='additional_care'){
				this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName , fieldValue:(e.target.checked?'1':'0')});
			}
			else if(['actual_address_correct0' , 'actual_address_correct1' , 'actual_address_correctNULL'].indexOf(fieldName) != -1){
				let val = fieldName.replace('actual_address_correct','');
				let fieldValue = val != 'NULL' ? val : null;
				this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName:'actual_address_correct' , fieldValue:fieldValue});
			}
			else if(['household_update_support_status' , 'household_update_additional_care' , 'household_update_contact_info' , 'household_update_actual_address' , 'household_update_not_at_home'].indexOf(fieldName) != -1){
				this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName , fieldValue:(e.target.checked ? '1':'0') });
			}
			else if(['mainPhoneID1' , 'mainPhoneID2'].indexOf(fieldName) != -1){
				 
				 this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName:'mainPhoneID' , fieldValue:(fieldName == 'mainPhoneID1'?'1':'2')});
			}
			else  if(fieldName == 'voter_transportation_type_name'){
				   this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName:'voter_transportation_type_name' , fieldValue:value});
				   if(!selectedItem || selectedItem.id == 0){
					    this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName:'voter_transportations_id' , fieldValue:null});
				   }
				   else{
					   this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName:'voter_transportations_id' , fieldValue:'1'});
					   if(selectedItem.id==2){
						   this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName:'crippled' , fieldValue:'1'});
					   }
					   else{
						   this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName:'crippled' , fieldValue:'0'});
					   }
				   }
				}
			else  if(['religious_group' , 'ethnic_group'].indexOf(fieldName) != -1){
				let fieldId = null;
				if(selectedItem){ fieldId = selectedItem.id;}
				this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName: fieldName + '_name', fieldValue :value});
				
				this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName: fieldName + '_id' , fieldValue: fieldId});

			} else if(fieldName == 'sephardi'){
				let newValue = selectedItem ?  selectedItem.id : null;

				this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName , fieldValue: newValue});

			} else {
			   if(fieldName=='city_name'){
				   if(this.props.reportSearchResults[rowIndex].city_name != '')
				   {
					   this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName:'city_name' , fieldValue:' '});
				   }
				    this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName:'street' , fieldValue:''});
					if(selectedItem){
					     ElectionsActions.loadStreetsByCityKey( this.props.dispatch , selectedItem.key);
					}
					else{
						this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.CHANGE_GLOBAL_REPORT_FIELD_VALUE,rowIndex , fieldName:'dynamicStreets' , fieldValue:[]});
					}
			   }
			   else if(fieldName=='street'){
				   if(this.props.reportSearchResults[rowIndex].street != '')
				   {
					   this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName:'street' , fieldValue:' '});
				   }
			   }
			   this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE , rowIndex , fieldName , fieldValue:value});
			   
			}
			// Saving details immediately if edit row not open.
			let editedRow = this.props.reportSearchResults[rowIndex];
			if (!editedRow.expanded && (fieldName == 'not_at_home' || fieldName == 'support_status_name')) {
				let data = {};
				let valueToSave = null;

				if (fieldName == 'support_status_name' && selectedItem && editedRow['support_status_name'] != selectedItem.name) {
					valueToSave = selectedItem.name || null;
					data.support_status_key = selectedItem.key;
				} else if(fieldName == 'not_at_home'){
					valueToSave = e.target.checked;
				}

				if (valueToSave != null) {
					data[fieldName] = valueToSave;
					ElectionsActions.updateVoterByKeyInCap50ReportRow(this.props.dispatch, editedRow.voter_key, data, rowIndex);
				}
			}
	}
	
	/*
	before opening row to edit or after saving action - save old value
	*/
	saveOldData(rowIndex){
		let editedRow = this.props.reportSearchResults[rowIndex];
		this.setState({
			oldReligiousGroup: editedRow.religious_group_id,
			oldReligiousGroupName: editedRow.religious_group_name,
			oldEthnicGroup: editedRow.ethnic_group_id,
			oldEthnicGroupName: editedRow.ethnic_group_name,
			sephardi: editedRow.sephardi,
			oldNotAtHome: editedRow.not_at_home,
			oldCityName: editedRow.city_name,
			oldStreet: editedRow.street,
			oldHouse: editedRow.house,
			oldHouseEntry: editedRow.house_entry,
			oldflat: editedRow.flat,
			oldZip: editedRow.zip,
			oldActualAddressCorrect: editedRow.actual_address_correct,
			oldVoterTransportationTypeName: editedRow.voter_transportation_type_name,
			oldFromTime: editedRow.from_time,
			oldToTime: editedRow.to_time,
			oldVoterTransportationsID: editedRow.voter_transportations_id,
			oldCrippled: editedRow.crippled,
			oldMainVoterPhoneID: editedRow.main_voter_phone_id,
			oldFirstPhone: editedRow.first_phone,
			oldSecondPhone: editedRow.second_phone,
			oldMainPhoneID: editedRow.mainPhoneID,
			oldEmail: editedRow.email,
			oldComment: editedRow.comment,
			oldPreviousSupportStatusName: editedRow.previous_support_status_name,
			oldAdditionalCare: editedRow.additional_care,
			oldHouseholdUpdateSupportStatus: undefined,
			oldHouseholdUpdateAdditionalCare: undefined,
			oldHouseholdUpdateContactInfo: undefined,
			oldHouseholdUpdateActualAddress: undefined,
			oldHouseholdUpdateNotAtHome: undefined,
			
		});
	}
	
	
	/*
	Expands/shrink specific voter row
	*/
	expandShrinkVoterRow(rowIndex , willExpand){
		if(willExpand){
			for(let i = 0 ; i < this.props.cities.length ; i++){
				if(this.props.cities[i].name == this.props.reportSearchResults[rowIndex].city_name){
					ElectionsActions.loadStreetsByCityKey( this.props.dispatch , this.props.cities[i].key);
					break;
					
				}
			}
			this.saveOldData(rowIndex);
		}
		else{
			this.restoreOldData(rowIndex);
		}
		
		this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.EXPAND_REPORT_VOTER_ROW ,rowIndex , willExpand});
	}
	
	/*
	canceling/closing editing row - this will restore old data : 
	*/
	restoreOldData(rowIndex){
		  let updateObject = {};
		  updateObject['religious_group_id']=this.state.oldReligiousGroup;
		  updateObject['religious_group_name']=this.state.oldReligiousGroupName;
		  updateObject['ethnic_group_id']=this.state.oldEthnicGroup;
		  updateObject['ethnic_group_name']=this.state.oldEthnicGroupName;
		  updateObject['sephardi']=this.state.sephardi;
		  updateObject['not_at_home'] =this.state.oldNotAtHome;
	      updateObject['city_name'] =this.state.oldCityName;
		  updateObject['street'] =this.state.oldStreet;
		  updateObject['house'] =this.state.oldHouse;
		  updateObject['house_entry'] =this.state.oldHouseEntry;
		  updateObject['flat'] =this.state.oldFlat;
		  updateObject['zip'] =this.state.oldZip;
		  updateObject['actual_address_correct'] =this.state.oldActualAddressCorrect;
		  updateObject['voter_transportation_type_name'] =this.state.oldVoterTransportationTypeName;
		  updateObject['from_time'] =this.state.oldFromTime;
		  updateObject['to_time'] =this.state.oldToTime;
		  updateObject['voter_transportations_id'] =this.state.oldVoterTransportationsID;
		  updateObject['crippled'] =this.state.oldCrippled;
		  updateObject['main_voter_phone_id'] =this.state.oldMainVoterPhoneID;
		  updateObject['first_phone'] =this.state.oldFirstPhone;
		  updateObject['second_phone'] =this.state.oldSecondPhone;
		  updateObject['mainPhoneID'] =this.state.oldMainPhoneID;
		  updateObject['email'] =this.state.oldEmail;
		  updateObject['comment'] =this.state.oldComment;
		  updateObject['previous_support_status_name'] =this.state.oldPreviousSupportStatusName;
		  updateObject['additional_care'] =this.state.oldAdditionalCare;
		  updateObject['household_update_support_status'] =undefined;
		  updateObject['household_update_additional_care'] =undefined;
		  updateObject['household_update_contact_info'] =undefined;
		  updateObject['household_update_actual_address'] =undefined;
		  updateObject['household_update_not_at_home'] =undefined;
		  this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.REPORT_RESTORE_OLD_VALUES , rowIndex , updateObject});
	}

	
	
	/*
	   Display modal window with comment text
	   
	   @param comment
	*/
	showComment(comment){
		this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.SHOW_HIDE_GLOBAL_MODAL_DIALOG , show:true , modalHeader:'' , modalContent:comment});	
	}
	
	
	/*
	Init dynamic variables for render() function
	*/
	initDynamicVariables(){
	    this.printReportItem = null;
	    this.printRenovationReportItem = null;
		if(this.props.currentUser.admin == true ||   this.props.currentUser.permissions['elections.reports.captain_of_fifty_walker.print'] == true){
		    this.printResultsItem = <a title="הדפס הליכון שר 100" style={{cursor:'pointer'}} onClick={this.printResults.bind(this, 'print')} className="icon-box print"></a>;
		}			
		if(this.props.currentUser.admin == true ||   this.props.currentUser.permissions['elections.reports.captain_of_fifty_walker.print'] == true){
		    this.printRenovationReportItem = <a title="הדפס הליכון טיוב" style={{cursor:'pointer'}} onClick={this.printResults.bind(this, 'renovation/print', true)} className="icon-box print"></a>;
		}			
		/*
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.reports.captain_of_fifty_walker.export'] == true) {
            this.exportPDFResultsItem = <a title="שמירת קובץ" style={{ cursor: 'pointer' }} onClick={this.printResults.bind(this, 'pdf')} className="icon-box pdf"></a>;
		}
		*/
		this.pagesNumberItem= null;
		this.paginationItem = null;
		let currentPage = this.props.captain50WalkerReport.currentPage;
		let numberOfResultsPerPage = this.props.captain50WalkerReport.numberOfResultsPerPage;
		if ((this.props.totalVotersCount / numberOfResultsPerPage) > 1) { // check that more then 1 page
			this.paginationItem = <div className="row">
				<nav aria-label="Page navigation paginationRow">
					<div className="text-center">
						<Pagination navigateToPage={this.navigateToPage.bind(this)} resultsCount={this.props.totalVotersCount} currentPage={currentPage} displayItemsPerPage={numberOfResultsPerPage} />
					</div>
				</nav>
			</div>;
			this.pagesNumberItem = <div>מציג תוצאות {numberOfResultsPerPage * (currentPage - 1) + 1}-{numberOfResultsPerPage * (currentPage)}</div>;
		}
		
		this.rowsObject = []; //this object will hold all the rows of the table of results.
		let votersResult = this.props.reportSearchResults;
		let addNewCiteRow=false;
		let firstRow = (currentPage - 1) * numberOfResultsPerPage; // Define pagination
		let lastRow = currentPage * numberOfResultsPerPage;

		let detailsInPage = { cities: {}, captains50: {} };
		for (let i = firstRow; i < lastRow; i++) { //Go over all pagination rows
			let currentVoter = votersResult[i];
			if (!currentVoter) { return; }; //If row not exist
			let currentCaptainId = currentVoter.captain_personal_identity;

			if (!currentVoter) { continue; }
			if ( !detailsInPage.captains50.hasOwnProperty(currentCaptainId)) { // Define captian row every new captain
				detailsInPage.captains50[currentCaptainId] = currentCaptainId;
				let captainData = this.props.resultsCaptainHash[currentCaptainId];
				// if (!captainData) { return } //must check it out!
				this.rowsObject.push(<CaptainFiftyRowItem key={'CaptainRow-' + currentCaptainId}
					captainData={captainData} resultsPerPage={numberOfResultsPerPage}
					totalVotersCount={this.props.totalVotersCount} firstCaptainVoter={currentVoter} />);
				addNewCiteRow = true;
			}
			if (addNewCiteRow || !detailsInPage.cities.hasOwnProperty(currentVoter.city_id)) { // Define captian row every new city
				detailsInPage.cities[currentVoter.city_id] = currentVoter.city_id;
				this.rowsObject.push(<CaptainFiftyCityRowItem key={'cityRow-' + i + currentCaptainId + '-' + currentVoter.city_id} city_name={currentVoter.city_name} />);
				addNewCiteRow = false;
			}
			this.rowsObject.push(<CaptainFiftyRelatedVoterRowItem previousRow={votersResult[i-1]} key={'voterRow-' + i + currentVoter.personal_identity}
				showComment={this.showComment.bind(this)} expandShrinkVoterRow={this.expandShrinkVoterRow.bind(this)}
				editFieldValueChange={this.editFieldValueChange.bind(this)} currentVoter={currentVoter} index={i} />);
			if (currentVoter.expanded == true) {
				this.rowsObject.push(<CaptainFiftyRelatedVoterRowItemEdit previousRow={votersResult[i-1]}  key={'fourthRow' + currentVoter.personal_identity}
					saveOldData={this.saveOldData.bind(this, i)} expandShrinkVoterRow={this.expandShrinkVoterRow.bind(this)}
					editFieldValueChange={this.editFieldValueChange.bind(this)} item={currentVoter} index={i} />);
			}
		}
		let pageNavigateTo = this.props.captain50WalkerReport.currentPage > 1 ? (this.props.captain50WalkerReport.currentPage - 1) : false;
		if (this.rowsObject.length == 0 && pageNavigateTo) { //If no rows in page, then navigate to the previous page 
			store.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_GLOBAL_REPORT_FIELD_VALUE, fieldName: 'currentPage', fieldValue: pageNavigateTo });
		}
	}
    render() {
	    this.initDynamicVariables();
        return (
		        <div ref={this.getRef.bind(this)}>
				    <div style={{paddingTop:'5px'}}>
               <div className="row rsltsTitleRow">
                    <div className="col-lg-6 text-right">
                        <div id="go-top-list"></div>
                        <h3 className="separation-item noBgTitle">נמצאו<span className="counter">{this.props.totalVotersCount}</span>תושבים</h3>
                        <span className="item-space">הצג</span>
                        <input className="item-space input-simple" type="number" value={this.props.captain50WalkerReport.tempNumberOfResultsPerPage} onChange={this.numberOfResultsFieldChanging.bind(this)} />
                        <span className="item-space">תוצאות</span>
                        <button title="שנה" type="submit" className="btn btn-primary btn-sm" style={{backgroundColor:'#498BB6' , borderColor:'transparent'}} disabled={this.props.captain50WalkerReport.tempNumberOfResultsPerPage=='' || this.props.captain50WalkerReport.tempNumberOfResultsPerPage<=0} onClick={this.updateResultsPerPage.bind(this , this.props.captain50WalkerReport.tempNumberOfResultsPerPage)}>שנה</button>
                    </div>
                    <div className="col-lg-6 clearfix">
                        <div className="link-box pull-left">
							{this.printResultsItem} &nbsp;
							{this.printRenovationReportItem}
                        </div>
                    </div>
                </div>
				</div>
				
				 <div style={{paddingTop:'3px'}}>
					 {this.rowsObject.length > 0 ?
                  <div className="dtlsBox srchRsltsBox box-content">
                   
					<div className="table-container">
	                   <table className="table tableNoMarginB tableTight " id="printableData" ref="printableData" >
                            <thead>
                                <tr >
                                    <th style={this.borderBottomStyle}>מ"ס</th>
                                    <th style={this.borderBottomStyle}>כתובת</th>
                                    <th style={this.borderBottomStyle}>שם משפחה</th>
                                    <th style={this.borderBottomStyle}>שם פרטי</th>
                                    <th style={this.borderBottomStyle}>קוד תושב</th>
                                    <th style={this.borderBottomStyle}>גיל</th>
                                    <th style={this.borderBottomStyle}>טלפון</th>
                                    <th style={this.borderBottomStyle}>טלפון נוסף</th>
                                    <th style={{...this.borderBottomStyle , width:'80px'}}>סטטוס סניף</th>
                                    <th style={this.borderBottomStyle}>לא היה בבית</th>
                                    <th style={this.borderBottomStyle}>הסעה</th>
                                    <th style={this.borderBottomStyle}>הערה</th>
                                    <th style={this.borderBottomStyle}>כתובת קלפי</th>
                                    <th style={this.borderBottomStyle}>מס' קלפי</th>
                                    <th style={this.borderBottomStyle}>מס' בוחר</th>
                                </tr>
                                
                            </thead>
                            <tbody>
							{this.rowsObject}                                
                            </tbody>
                        </table>
                    </div>
                    <div className="rsltsTitleRow">
					    {this.pagesNumberItem}
                    </div>
                    <nav aria-label="Page navigation paginationRow">
                        <div className="text-center">
						{this.paginationItem}
                        </div>
                    </nav>
                </div>
					 :null}
				</div>
				
				  <div className="row single-line box-content">
                    <div className="col-lg-12">
                        <a data-toggle="tooltip"  onClick={this.scrollToPageTop.bind(this)} data-placement="left" className="go-top-page-btn item-space" style={{cursor:'pointer'}} title="לראש העמוד"></a>
                        <a data-toggle="tooltip"  onClick={this.scrollToResultsTop.bind(this)} data-placement="left" className="go-top-list-btn" style={{cursor:'pointer'}} title="לראש הרשימה"></a>
                    </div>
                </div>
				<br/>
				</div>
        );
    }
}


function mapStateToProps(state) {
    return {
		filterItems: state.global.voterFilter.captain50_walker_report.vf.filter_items,
		supportStatuses : state.elections.reportsScreen.captain50WalkerReport.supportStatuses,
		cities:state.system.cities,
		isEditingVoter:state.elections.reportsScreen.captain50WalkerReport.isEditingVoter,
	    modules:state.global.voterFilter.modules,
		captain50WalkerReport:state.elections.reportsScreen.captain50WalkerReport,
		voterFilter:state.global.voterFilter.general_report.vf,
		currentUser: state.system.currentUser,
		reportSearchResults: state.elections.reportsScreen.captain50WalkerReport.reportSearchResults,
		resultsCaptainHash: state.elections.reportsScreen.captain50WalkerReport.reportSearchResultsCaptainHash,
		totalVotersCount: state.elections.reportsScreen.captain50WalkerReport.totalVotersCount,
		loadingSearchResults:state.elections.reportsScreen.captain50WalkerReport.loadingSearchResults,
    }
}

export default connect(mapStateToProps)(withRouter(ReportSearchResults));