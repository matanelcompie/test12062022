import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from 'components/global/Combo';
import constants from 'libs/constants';
import * as ElectionsActions from 'actions/ElectionsActions';
import Pagination from 'components/global/Pagination';



class SavedReportTab extends React.Component {

    constructor(props) {
        super(props);
		this.state={
			selectedPrimaryCombo : {value:'' , item:null} ,
			selectedSecondaryCombo : {value:'' , item:null} ,
			selectedThirdCombo : {value:'' , item:null} ,
		}

        //Load phone types
        ElectionsActions.loadGeneralReportPhoneTypes(this.props.dispatch);
    }

  
    changeCheckboxValueByNameAndValue(fieldName,e){
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_SAVED_REPORT_VALUE, fieldName, fieldValue:e.target.checked});
	}

    changeComboByNameAndValue(comboName , e){
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_SAVED_REPORT_VALUE, fieldName:comboName, fieldValue:{value:e.target.value , item:e.target.selectedItem}});
	} 
	
	changedSaveReportType(e){
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_SAVED_REPORT_VALUE, fieldName:'selectedSavedReport', fieldValue: {value:e.target.value , item:e.target.selectedItem} });
	}
	
	initDynamicVariables(){
		
		this.reportType=constants.generalReportTypes.SAVED;
		
		this.secondHeaderItem = null;
		this.thirdHeaderItem = null;
		this.secondComboItem = null;
		this.thirdComboItem = null;
		
		this.reportTypeButtonDisabled = true;
		
		if(this.props.savedReports.selectedSavedReport.item){
			this.reportTypeButtonDisabled = false;
			if(this.props.savedReports.selectedSavedReport.item.system_name == 'questionairs' && !this.props.savedReports.questionaireID.item){
				this.reportTypeButtonDisabled = true;
			}
		}
 
		if(!this.props.savedReports.selectedSavedReport.item){return;}
		switch(this.props.savedReports.selectedSavedReport.item.system_name){
			case  'questionairs':
 
			    this.secondHeaderItem = 'בחר שאלון';
			    this.secondComboItem = <Combo items={this.props.savedReports.questionairesList} itemIdProperty="id" itemDisplayProperty='name' value={this.props.savedReports.questionaireID.value} onChange={this.changeComboByNameAndValue.bind(this,'questionaireID')} inputStyle={{borderColor:((this.props.savedReports.selectedSavedReport.item.system_name == 'questionairs' && !this.props.savedReports.questionaireID.item)?'#ff0000':'#ccc')}}  />;
			    break;
			case  'sms':
			    this.secondComboItem =<div><input type="checkbox"  checked={this.props.savedReports.smsUniqueNumberPerVoter} onChange={this.changeCheckboxValueByNameAndValue.bind(this,'smsUniqueNumberPerVoter')} /> מספר יחיד לכל תושב</div>;
			    this.thirdComboItem =<div><input type="checkbox"  checked={this.props.savedReports.smsShowBlockedSMSPhones} onChange={this.changeCheckboxValueByNameAndValue.bind(this,'smsShowBlockedSMSPhones')} />  הצג גם מס' המסומנים כלא מאופשרים לשיחת סמס</div>;
			    break;
			case  'phones':
			    this.secondComboItem =<div><input type="checkbox"  checked={this.props.savedReports.phonesUniqueNumberPerVoter} onChange={this.changeCheckboxValueByNameAndValue.bind(this,'phonesUniqueNumberPerVoter')} /> מספר יחיד לכל תושב</div>;
				this.thirdHeaderItem = 'סוג טלפון';
			    this.thirdComboItem =<div><Combo items={this.props.savedReports.phoneTypes} value={this.props.savedReports.phonesPreferePhoneType.value} onChange={this.changeComboByNameAndValue.bind(this,'phonesPreferePhoneType')}  itemIdProperty="id" itemDisplayProperty='name' /></div>;
			    break;
			case  'households':
			    this.secondComboItem =<div><input type="checkbox" checked={this.props.savedReports.detectValidPhoneInsideHousehold} onChange={this.changeCheckboxValueByNameAndValue.bind(this,'detectValidPhoneInsideHousehold')} /> יש טלפון תקין כלשהו בבית אב</div>;
			    break;
		}
  	
	}
	
	showSavedReportSearchResults(isNewSearch){
		 
		let target = constants.generalReportTypes.SAVED;
		if (((this.props.voterFilter.filter_items.length > 0) || (this.props.voterFilter.geo_items[0].entity_id > 0))// there is filters selected
            && !this.props.generalReport.results.isLoadingResults && //there is no loading now
            (((_.size(this.props.generalReport.selectedDetailColumns) < 10 || _.size(this.props.generalReport.selectedDetailColumns) > 1)) // if detailed report and number of selected columns is less than 10
                )) {//if combine report with selected combineBy

            let reportType = target;
            let resultsPerLoad = this.props.generalReport.results.resultsPerLoad;
            let maxResultsCount = this.props.generalReport.results.maxResultsCount;
            let currentLoadIndex = isNewSearch ? this.props.generalReport.results.currentLoadIndex.defaultValue : this.props.generalReport.results.currentLoadIndex[reportType]; //per report type ...

            //check if there is max results set, and there is need to retrive less results than the defualt resultsPerLoad
            if ((maxResultsCount != '') && (((currentLoadIndex + 1) * resultsPerLoad) > maxResultsCount)) {
                resultsPerLoad = ((currentLoadIndex + 1) * resultsPerLoad) - maxResultsCount;
            }
            let reportRequestData = { ...this.props.voterFilter, results_per_load: resultsPerLoad, current_load_index: currentLoadIndex, report_type: reportType };

            //if combine report or there is combine row selected(displaying combined row in detailes)
            if ((this.props.generalReport.combineOptions.combineRowSelectedValue.length > 0)) {
                reportRequestData['combine_by'] = this.props.generalReport.combineOptions.combineBy.name;

                //if there is combine row selected value (display combined row in details), add the slected value to the request data.
                if (this.props.generalReport.combineOptions.combineRowSelectedValue.length > 0) {
                    reportRequestData['combine_row_selected_value'] = this.props.generalReport.combineOptions.combineRowSelectedValue;
                    reportRequestData['column_key'] = this.props.generalReport.combineOptions.selectedColumn;
                }

                //if combine by allow combine columns and combine columns have value.
                if (this.props.generalReport.combineOptions.combineBy.allowCombineColumns && (this.props.generalReport.combineOptions.combineColumns.key > 0)) {
                    reportRequestData['combine_columns'] = this.props.generalReport.combineOptions.combineColumns.name;
                }

                //if combine by allow combine columns, get the combine display by (voters/households) value.
                if (this.props.generalReport.combineOptions.combineBy.allowCombineColumns) {
                    reportRequestData['combine_display_by'] = this.props.generalReport.combineOptions.combineDisplayBy;
                }
            }	
           reportRequestData['report_system_name'] = this.props.savedReports.selectedSavedReport.item.system_name;	
           reportRequestData['detectValidPhoneInsideHousehold'] = (this.props.savedReports.detectValidPhoneInsideHousehold ? '1':'0');	
           reportRequestData['phonesUniqueNumberPerVoter'] = (this.props.savedReports.phonesUniqueNumberPerVoter ? '1':'0');
		   if(this.props.savedReports.phonesPreferePhoneType.item){
			   reportRequestData['phonesPreferePhoneType'] = this.props.savedReports.phonesPreferePhoneType.item.id;
		   }
           reportRequestData['smsUniqueNumberPerVoter'] = (this.props.savedReports.smsUniqueNumberPerVoter ? '1':'0');	
           reportRequestData['smsShowBlockedSMSPhones'] = (this.props.savedReports.smsShowBlockedSMSPhones ? '1':'0');		   
           if(this.props.savedReports.questionaireID.item){
			   reportRequestData['questionaireID'] = this.props.savedReports.questionaireID.item.id;
		   }
		   
            //if set maxResultsCount value, add to the request data.
            if ((currentLoadIndex == this.props.generalReport.results.currentLoadIndex.defaultValue) && maxResultsCount != '') {
                reportRequestData['max_results_count'] = maxResultsCount;
            }
 
            ElectionsActions.loadGeneralReportResults(this.props.dispatch, reportRequestData , true);
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_CURRENT_DISPLAIED_REPORT_TYPE, reportType });

            if (currentLoadIndex == this.props.generalReport.results.currentLoadIndex.defaultValue) {//reset the report setings if the loaded page is index 0 (in case of new search)
                this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.SET_SELECTED_COMBINE_ROW_DETAILES, detailesTitle: '', selectedValue: '' });
                this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.RESET_REPORT_RESULTS, reportType });
            }
        }
	 
	}
	
	

    render() {
		//console.log(this.props.generalReport.savedReports.searchResults);
		//console.log(this.props.generalReport.savedReports.totalResultsCount);
		 //console.log(this.props.generalReport.savedReports.searchResultsColumns);
        this.initDynamicVariables();
		
        return (
            <div className="tab-pane active"  style={{display:this.props.display}}>
                <div className="containerStrip">
                    <div className="panelContent dividing-line">
                        <div className="row">
                            <div className="col-lg-4">
                              
                                    <div className="form-group">
                                        <label className="col-lg-4 control-label">בחר דוח</label>
                                        <div className="col-lg-8">
                                            <Combo items={this.props.savedReports.definitionComboes} value={this.props.savedReports.selectedSavedReport.value} onChange={this.changedSaveReportType.bind(this)}  itemIdProperty="id" itemDisplayProperty='name'  />
                                        </div>
                                    </div>
                              
                            </div>
                            <div className="col-lg-4">
                              
                                    <div className="form-group">
                                        <label className="col-lg-4 control-label">{this.secondHeaderItem}</label>
                                        <div className="col-lg-8">
										{this.secondComboItem}
                                        </div>
                                    </div>
                            </div>
							 <div className="col-lg-4">
                              
                                    <div className="form-group">
                                        <label className="col-lg-4 control-label">{this.thirdHeaderItem}</label>
                                        <div className="col-lg-8">
										{this.thirdComboItem}
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <button title="הצג" className="btn btn-primary srchBtn pull-left" onClick={this.showSavedReportSearchResults.bind(this,true)} disabled={this.reportTypeButtonDisabled || !((this.props.voterFilter.filter_items.length > 0) || (this.props.voterFilter.geo_items.length && this.props.voterFilter.geo_items[0].entity_id > 0))}>הצג</button>
                        </div>
                    </div>
			 
                </div>
            </div>);
    }
}

function mapStateToProps(state) {
    return {
             savedReports: state.elections.reportsScreen.generalReport.savedReports,
			 voterFilter: state.global.voterFilter['general_report'].vf,
             generalReport: state.elections.reportsScreen.generalReport,
			 results: state.elections.reportsScreen.generalReport.results,
    }
}

export default connect(mapStateToProps)(withRouter(SavedReportTab));