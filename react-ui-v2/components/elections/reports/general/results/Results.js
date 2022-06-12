import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from 'actions/ElectionsActions';
import DetailedResults from './DetailedResults';
import SavedResults from './SavedResults';
import CombinedResults from './CombinedResults';
import constants from 'libs/constants';

import SendSmsModal from './SendSmsModal';

class Results extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
        this.setNavigateToTop();
        this.state = { showCountOnly:false,displayItemsPerPage: { [constants.generalReportTypes.DETAILED]: 0, [constants.generalReportTypes.COMBINED]: 0 }, downloadUrl: '' };

        this.reportTargetTypes = {
            DETAILED: constants.generalReportTypes.DETAILED,
            COMBINED: constants.generalReportTypes.COMBINED,
			SAVED: constants.generalReportTypes.SAVED,
            COMBINED_DETAILES: 'combined_detailes',
        };

        this.exportTypes = {
            PDF: 'pdf',
            XLS: 'xls',
            PRINT: 'print',
            SMS: 'sms',
            MENU: 'menu',
        };
        this.fileDownload = {
            downloadTimer: '',
            attempts: 100,
            downloadToken: new Date().getTime()
        }
    }

    componentWillMount() {
        let displayItemsPerPage = {
            [constants.generalReportTypes.DETAILED]: this.props.generalReport.results.displayItemsPerPage[constants.generalReportTypes.DETAILED],
            [constants.generalReportTypes.COMBINED]: this.props.generalReport.results.displayItemsPerPage[constants.generalReportTypes.COMBINED],
            [constants.generalReportTypes.SAVED]: this.props.generalReport.results.displayItemsPerPage[constants.generalReportTypes.SAVED]
			
        };

        this.setState({ displayItemsPerPage });
    }
    componentWillUnmount() {
        clearInterval(this.fileDownload.downloadTimer);
    }
    textIgniter() {
        this.lables = {
            detailedReport: 'הצג דוח מפורט',
            combinedReport: 'הצג דוח מסוכם',
            pageTop: 'לראש העמוד',
            resultsTop: 'לראש הרשימה',
            loadingReportCancelTooltip: 'לחץ לביטול יצירת הדוח',
            tooManyColumnsSelectedMsg: 'מספר העמודות להצגה גדול מדי, נא לצמצם!',
            noColumnsSelectedMsg: 'לא סומנו עמודות להצגה!',
        }
    }

    /** File export handler start */
    getCookie(name) {
        var parts = document.cookie.split(name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    unblockSubmit() {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.DOWNLOADING_REPORT_STATUS_CHANGED, isDownloading: false });
        window.clearInterval(this.fileDownload.downloadTimer);
        document.cookie = encodeURIComponent("downloadToken") + "=deleted; expires=" + new Date(0).toUTCString();
        this.fileDownload.attempts = 100;
    }

    // Prevents double-submits by waiting for a cookie from the server.
    blockResubmit() {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.DOWNLOADING_REPORT_STATUS_CHANGED, isDownloading: true });
        let _this = this;
        this.fileDownload.downloadTimer = window.setInterval(function () {
            var token = _this.getCookie("downloadToken");

            if ((token == _this.fileDownload.downloadToken) || (_this.fileDownload.attempts == 0)) {
                _this.unblockSubmit();
            }

            _this.fileDownload.attempts--;
        }, 1000);
    }
    /** File export handler end */

    changeDisplayCountValue(e) {
        let displayItemsPerPage = this.state.displayItemsPerPage;
        displayItemsPerPage[this.props.generalReport.currentDisplaiedReportType] = Number(e.target.value);
        this.setState({ displayItemsPerPage });
    }

    updateDisplayCountValue() {
        let value = this.state.displayItemsPerPage[this.props.generalReport.currentDisplaiedReportType];
        if (value > 0 && value <= 100) {
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_RESULTS_DISPLAY_COUNT_VALUE, value });
        }
    }

    updateMaxResultsCount(e) {
        let value = e.target.value;
        if ((value > 0 && value <= 1000) || value == '') {
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_MAX_RESULTS_COUNT, value });
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


    loadResults(target, isNewSearch) {
		let showCountOnly = false ;//will be true in one special case - combind(summing) report without selected column to sum on
        if (((this.props.voterFilter.filter_items.length > 0) || (this.props.voterFilter.geo_items[0].entity_id > 0))// there is filters selected
            && !this.props.generalReport.results.isLoadingResults && //there is no loading now
            (target == this.reportTargetTypes.SAVED || (target == this.reportTargetTypes.DETAILED && (_.size(this.props.generalReport.selectedDetailColumns) < 10 || _.size(this.props.generalReport.selectedDetailColumns) > 1)) // if detailed report and number of selected columns is less than 10
                || (target == this.reportTargetTypes.COMBINED && this.props.generalReport.combineOptions.combineBy.key > 0)
				|| (target == this.reportTargetTypes.COMBINED && this.props.generalReport.combineOptions.combineBy.key == 0)
				)
				) 
				{//if combine report with selected combineBy
			
			if(target == this.reportTargetTypes.COMBINED && this.props.generalReport.combineOptions.combineBy.key == 0){
				target = this.reportTargetTypes.DETAILED;
				showCountOnly = true;
			}
			
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
            if (target == this.reportTargetTypes.COMBINED || (this.props.generalReport.combineOptions.combineRowSelectedValue.length > 0)) {
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
            if(target == this.reportTargetTypes.COMBINED || target == this.reportTargetTypes.DETAILED){
				this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.SET_GENERAL_REPORT_VALUE , fieldName:'activeTab' , fieldValue:'new'});
			}
			
            if (target == this.reportTargetTypes.DETAILED) {
                reportRequestData['detailed_columns'] = this.getSelectedDetailsColumns();
            }

            //if set maxResultsCount value, add to the request data.
            if ((currentLoadIndex == this.props.generalReport.results.currentLoadIndex.defaultValue) && maxResultsCount != '') {
                reportRequestData['max_results_count'] = maxResultsCount;
            }
            
			if(target == this.reportTargetTypes.SAVED){
				 reportRequestData['report_system_name'] = this.props.generalReport.savedReports.selectedSavedReport.item.system_name;
                 reportRequestData['detectValidPhoneInsideHousehold'] = (this.props.generalReport.savedReports.detectValidPhoneInsideHousehold?'1':'0');						 
				 reportRequestData['phonesUniqueNumberPerVoter'] = (this.props.generalReport.savedReports.phonesUniqueNumberPerVoter ? '1':'0');
		         if(this.props.generalReport.savedReports.phonesPreferePhoneType.item){
			        reportRequestData['phonesPreferePhoneType'] = this.props.generalReport.savedReports.phonesPreferePhoneType.item.id;
		         }
                 reportRequestData['smsUniqueNumberPerVoter'] = (this.props.generalReport.savedReports.smsUniqueNumberPerVoter ? '1':'0');	
                 reportRequestData['smsShowBlockedSMSPhones'] = (this.props.generalReport.savedReports.smsShowBlockedSMSPhones ? '1':'0');		   
                 if(this.props.generalReport.savedReports.questionaireID.item){
			       reportRequestData['questionaireID'] = this.props.generalReport.savedReports.questionaireID.item.id;
		         }
			}

            if (showCountOnly) reportRequestData['only_count'] = true;
 
            this.currentRequestData = reportRequestData;
 
            ElectionsActions.loadGeneralReportResults(this.props.dispatch, reportRequestData , (target == this.reportTargetTypes.SAVED));
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_CURRENT_DISPLAIED_REPORT_TYPE, reportType });

            if (currentLoadIndex == this.props.generalReport.results.currentLoadIndex.defaultValue) {//reset the report setings if the loaded page is index 0 (in case of new search)
                this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.SET_SELECTED_COMBINE_ROW_DETAILES, detailesTitle: '', selectedValue: '' });
                this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.RESET_REPORT_RESULTS, reportType });
            }
        }
	 
		this.setState({showCountOnly});
	}

    displayCombineRowDetailes(selectedItem, columnKey, statusName) {
        if (this.checkValidForm()) {//check if there is selected combine option selected 

            let reportType = constants.generalReportTypes.DETAILED;
            let resultsPerLoad = this.props.generalReport.results.resultsPerLoad;
            let currentLoadIndex = this.props.generalReport.results.currentLoadIndex.defaultValue;
            let combineRowSelectedValue = (selectedItem.combine_id == null) ? '' : selectedItem.combine_id;

            let combineData = {
                combine_by: this.props.generalReport.combineOptions.combineBy.name, combine_row_selected_value: combineRowSelectedValue,
                column_key: columnKey, report_type: reportType
            };

            let reportRequestData = {
                ...this.props.voterFilter,  results_per_load: resultsPerLoad, current_load_index: currentLoadIndex,
                detailed_columns: this.getSelectedDetailsColumns(), ...combineData
            };

            //if combine by allow combine columns and combine columns have value.
            if (this.props.generalReport.combineOptions.combineBy.allowCombineColumns && (this.props.generalReport.combineOptions.combineColumns.key > 0)) {
                reportRequestData['combine_columns'] = this.props.generalReport.combineOptions.combineColumns.name;
            }

            if (this.props.generalReport.results.maxResultsCount != '') {
                reportRequestData['max_results_count'] = this.props.generalReport.results.maxResultsCount;
            }
            this.currentRequestData = reportRequestData;

            ElectionsActions.loadGeneralReportResults(this.props.dispatch, reportRequestData);

            let detailesTitle = this.props.generalReport.combineOptions.combineBy.label + ': ' + selectedItem.combine_name + (statusName.length > 0 ? ('  [ ' + statusName + ' ]') : '');
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.SET_SELECTED_COMBINE_ROW_DETAILES, detailesTitle, selectedValue: combineRowSelectedValue, selectedColumn: columnKey });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_CURRENT_DISPLAIED_REPORT_TYPE, reportType });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.RESET_REPORT_RESULTS, reportType });
        }
    }

    exportResults(exportType) {
        if (this.checkValidForm()) {
            if(!this.currentRequestData){
                this.currentRequestData = this.getReportRequestData();
            }
            if ( this.currentRequestData.filter_items.length == 0 ) {
                delete(this.currentRequestData.filter_items);
            }
            if ( this.currentRequestData.geo_items.length == 0 ) {
                delete(this.currentRequestData.geo_items);
            }

            this.currentRequestData.export_type = exportType;
            let url = (window.Laravel.baseURL + 'api/elections/reports/export?') + this.serializeUrl(this.currentRequestData);

            if (exportType == this.exportTypes.PRINT || exportType == this.exportTypes.XLS) {
                window.open(url, '_blank');
            }else if (exportType == this.exportTypes.MENU && this.props.generalReport.currentDisplaiedReportType != constants.generalReportTypes.SAVED) {
                this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.DOWNLOADING_REPORT_STATUS_CHANGED, isDownloading: true });
              ElectionsActions.createCsvServiceFromResults(this.props.dispatch , this.props.router,url);
			   // this.blockResubmit();
            }else {
                this.setState({ downloadUrl: url + ('&downloadToken=' + this.fileDownload.downloadToken) });
                this.blockResubmit();
            }
        }
    }
    displaySendSmsModal(showModal) {
        if (showModal) {
            if (!this.checkValidForm()) { return; } //If form not valid dont display the sms modal
            this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.SEND_SMS.VOTERS_COUNTER, votersCounter: null});

            this.getSmsVoterCount();
        }
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.SEND_SMS.SHOW_SMS_MODAL, show: showModal })
    }
    sendSms(message) {
        if (this.checkValidForm()) {
            let reportRequestData = this.getReportRequestData('sms');
            ElectionsActions.sendSms(this.props.dispatch, reportRequestData,message);
        }
    }
    getSmsVoterCount(){
        let reportRequestData = this.getReportRequestData('sms');
        ElectionsActions.countSmsVoters(this.props.dispatch, reportRequestData);
    }
    checkValidForm() {
        let validForm = false;
        if ((this.props.voterFilter.filter_items.length || this.props.voterFilter.geo_items[0].entity_id > 0) && // there is filters selected
            !this.props.generalReport.results.isDownloadingReport &&
            (_.size(this.props.generalReport.selectedDetailColumns) < 10 || _.size(this.props.generalReport.selectedDetailColumns) > 1)) {
            validForm = true;
        }
        return validForm
    }
    getReportRequestData(exportType){

	    let reportType = constants.generalReportTypes.DETAILED; //export file is only as DETAILED

        let reportRequestData = { ...this.props.voterFilter, export_type: exportType, report_type: reportType, detailed_columns: this.getSelectedDetailsColumns() };

			
        if(this.props.generalReport.currentDisplaiedReportType == constants.generalReportTypes.SAVED)
        {
            reportRequestData["report_type"] = constants.generalReportTypes.SAVED;
            reportRequestData['report_system_name'] = this.props.generalReport.savedReports.selectedSavedReport.item.system_name;	
        }
        
        if (this.props.generalReport.results.maxResultsCount != '') {
            reportRequestData['max_results_count'] = this.props.generalReport.results.maxResultsCount;
        
        }
        if( this.props.generalReport.currentDisplaiedReportType == this.reportTargetTypes.SAVED){
             reportRequestData['report_system_name'] = this.props.generalReport.savedReports.selectedSavedReport.item.system_name;
             reportRequestData['detectValidPhoneInsideHousehold'] = (this.props.generalReport.savedReports.detectValidPhoneInsideHousehold?'1':'0');						 
             reportRequestData['phonesUniqueNumberPerVoter'] = (this.props.generalReport.savedReports.phonesUniqueNumberPerVoter ? '1':'0');
             if(this.props.generalReport.savedReports.phonesPreferePhoneType.item){
                reportRequestData['phonesPreferePhoneType'] = this.props.generalReport.savedReports.phonesPreferePhoneType.item.id;
             }
             reportRequestData['smsUniqueNumberPerVoter'] = (this.props.generalReport.savedReports.smsUniqueNumberPerVoter ? '1':'0');	
             reportRequestData['smsShowBlockedSMSPhones'] = (this.props.generalReport.savedReports.smsShowBlockedSMSPhones ? '1':'0');		   
             if(this.props.generalReport.savedReports.questionaireID.item){
               reportRequestData['questionaireID'] = this.props.generalReport.savedReports.questionaireID.item.id;
             }
        }
        return reportRequestData;
    }
    serializeUrl(obj, prefix) {
        var str = [], p;
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push((v !== null && typeof v === "object") ?
                    this.serializeUrl(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    }

    navigateToPage(reportType, pageIndex) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.NAVIGATE_TO_RESULTS_PAGE_INDEX, pageIndex, reportType: reportType });
        let currentLoadedIndex = this.props.generalReport.results.currentLoadIndex[reportType];
        let resultsPerLoad = this.props.generalReport.results.resultsPerLoad;
        let resultsCount = this.props.generalReport.results.resultsCount[reportType];
        let displayItemsPerPage = this.props.generalReport.results.displayItemsPerPage[reportType];

        let alreadyLoadedResultsCount = currentLoadedIndex * resultsPerLoad;
        let isThereMoreResultsToLoad = (alreadyLoadedResultsCount < resultsCount) ? true : false;//is there more to load ... 
        let isPaginationNearTheEndOfLoadedResults = ((pageIndex * displayItemsPerPage) >= alreadyLoadedResultsCount * 0.7) ? true : false;//is current pagination index passed 0.7 of loaded results
        let isCombinedReport = reportType == this.reportTargetTypes.COMBINED; //For combined report - not need pagination
        //if there more to load AND current pagination index passed X% (70%) of loaded results
        if (!isCombinedReport && isThereMoreResultsToLoad && isPaginationNearTheEndOfLoadedResults) {
            this.loadResults(reportType, false);
        }
		 
        this.scrollToResultsTop();
    }

    getSelectedDetailsColumns() {
        let selectedColumns = [];

        Object.keys(this.props.generalReport.selectedDetailColumns).map(key => {
            let col = this.props.generalReport.selectedDetailColumns[key];
            let option = { name: col.name, sort_direction: col.sortDirection, sort_number: col.sortNumber,
                           per_election_campaign: col.perElectionCampaign, displayOrder: col.displayOrder };

            if (col.perElectionCampaign) {
                option['election_campaign'] = col.electionCampaign.id || '';
            }
            selectedColumns.push(option);
        });

        selectedColumns = _.orderBy(selectedColumns, 'displayOrder');

        return selectedColumns;
    }

    cancelGeneralReport() {
        ElectionsActions.cancelGeneralReport(this.props.dispatch);
    }

    setNavigateToTop() {
        this.setNavigateToTopElement =
            <div className="text-center">
                <a data-toggle="tooltip" data-placement="left" title={this.lables.pageTop} className="go-top-page-btn item-space"
                    onClick={this.scrollToPageTop.bind(this)}></a>
                <a data-toggle="tooltip" data-placement="left" title={this.lables.resultsTop} className="go-top-list-btn"
                    onClick={this.scrollToResultsTop.bind(this)}></a>
            </div>
    }

    render() {
        let resultsCount = this.props.generalReport.results.resultsCount[this.props.generalReport.currentDisplaiedReportType];
        let displayItemsPerPage = this.state.displayItemsPerPage[this.props.generalReport.currentDisplaiedReportType];
        let isValidDisplayValue = (displayItemsPerPage > 0 && displayItemsPerPage <= 100);
        let currentDisplayItemsPerPageValue = this.props.generalReport.results.displayItemsPerPage[this.props.generalReport.currentDisplaiedReportType];

        let buttonsActionClass = (((this.props.voterFilter.filter_items.length > 0) || (this.props.voterFilter.geo_items.length &&
                                     this.props.voterFilter.geo_items[0].entity_id > 0)) ? 'cursor-pointer' : 'disabled');
        let disabledDetailedReport =  (((_.size(this.props.generalReport.selectedDetailColumns) > 10 || _.size(this.props.generalReport.selectedDetailColumns) < 1)
                || !((this.props.voterFilter.filter_items.length > 0) || (this.props.voterFilter.geo_items.length && this.props.voterFilter.geo_items[0].entity_id > 0))));
        let disabledSummeryReport = (( 
                  ((this.props.voterFilter.filter_items.length > 0) || (this.props.voterFilter.geo_items.length && this.props.voterFilter.geo_items[0].entity_id > 0))
            ));

        return (
            <div ref={this.getRef.bind(this)}>
                <div className="row">
                    <div className="col-md-4">
                        <div id="go-top-list"></div>
                        {this.props.generalReport.results.isLoadingResults ? (<h3 className="separation-item noBgTitle">טרם הסתיים החיפוש</h3>) : (this.props.generalReport.results.isCanceledLoadingResults ? (<h3 className="separation-item noBgTitle">החיפוש בוטל</h3>) :(<h3 className="separation-item noBgTitle">נמצאו<span className="counter">{resultsCount.toLocaleString()}</span>רשומות</h3>))}
						
                        <span className="item-space">הצג</span>
                        <input className={"item-space input-simple" + (isValidDisplayValue ? '' : ' has-error')} type="number" placeholder="30" onChange={this.changeDisplayCountValue.bind(this)} value={displayItemsPerPage} />
                        <span className="item-space">תוצאות</span>
                        {(currentDisplayItemsPerPageValue != displayItemsPerPage) &&
                            <button title="שנה" type="submit" className="btn btn-primary btn-sm" onClick={this.updateDisplayCountValue.bind(this)} disabled={!isValidDisplayValue}>שנה</button>
                        }
                    </div>
                    <div className="col-md-3">
                        <span className="item-space">
                            <span className="item-space">מספר רשומות</span>
                            <input className="input-simple" type="text" onChange={this.updateMaxResultsCount.bind(this)}
                                value={this.props.generalReport.results.maxResultsCount} />
                        </span>
                    </div>
                    <div className="col-md-5 clearfix">
                        <div className="pull-left">
                            {this.props.generalReport.results.isDownloadingReport &&
                                <i className="fa fa-spinner fa-pulse fa-fw"></i>
                            }
                            {((this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.reports.general.sms'])) &&
                            <a title="הודעה" onClick={this.displaySendSmsModal.bind(this,true)}
                            className={"icon-box sendSmsBtn " + buttonsActionClass}></a>
                        }
                            { this.props.generalReport.activeTab == 'new' &&  <a title="עדכון נתונים מקובץ"   onClick={this.exportResults.bind(this, this.exportTypes.MENU) }
        							className={"icon-box menu " + buttonsActionClass}></a>}
                            {((this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.reports.general.pdf'])) &&
                                <a title="יצוא ל-pdf" onClick={this.exportResults.bind(this, this.exportTypes.PDF)}
                                    className={"icon-box pdf " + buttonsActionClass}></a>
                            }
                            {((this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.reports.general.excel'])) &&
                                <a title="יצוא ל-אקסל" onClick={this.exportResults.bind(this, this.exportTypes.XLS)}
                                    className={"icon-box excel " + buttonsActionClass}></a>
                            }
                            {((this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.reports.general.print'])) &&
                                <a title="הדפסה" onClick={this.exportResults.bind(this, this.exportTypes.PRINT)}
                                    className={"icon-box print " + buttonsActionClass}></a>
                            }
 
                        </div>
                        <div className="btn-group radio-btn-group hide-radio-btn pull-right">
                            <label className={"btn btn-default"+ (disabledDetailedReport ?' disabled' : '') 
                            + (this.props.generalReport.currentDisplaiedReportType == constants.generalReportTypes.DETAILED ? ' active' : '') }>
                                    
                                <input title={this.lables.detailedReport} type="radio"
                                    checked={(this.props.generalReport.currentDisplaiedReportType == constants.generalReportTypes.DETAILED)}
                                    onChange={() => { }}
                                    onClick={this.loadResults.bind(this, this.reportTargetTypes.DETAILED, true)}
                                />{this.lables.detailedReport}
                            </label>
                            <label className={"btn btn-default" + (disabledSummeryReport? '' : ' disabled') +
                             (this.props.generalReport.currentDisplaiedReportType == constants.generalReportTypes.COMBINED ? ' active' : '') }>

                                <input title={this.lables.combinedReport} type="radio"
                                    checked={(this.props.generalReport.currentDisplaiedReportType == constants.generalReportTypes.COMBINED)}
                                    onChange={() => { }}
                                    onClick={this.loadResults.bind(this, this.reportTargetTypes.COMBINED, true)}
                                />{this.lables.combinedReport}
                            </label>
                        </div>
                        {[(_.size(this.props.generalReport.selectedDetailColumns) > 10) &&
                            <p className="error-message">{this.lables.tooManyColumnsSelectedMsg}</p>
                            ,
                        (_.size(this.props.generalReport.selectedDetailColumns) < 1) &&
                        <p className="error-message">{this.lables.noColumnsSelectedMsg}</p>
                        ]}
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="resultsArea dataUpdate">
                            {(!this.state.showCountOnly && resultsCount > 0) && <div className="dtlsBox srchRsltsBox">
                                {(!this.state.showCountOnly && this.props.generalReport.currentDisplaiedReportType == constants.generalReportTypes.DETAILED) &&
                                    <DetailedResults
                                        results={this.props.generalReport.results}
                                        selectedDetailColumns={this.props.generalReport.selectedDetailColumns}
                                        navigateToPage={this.navigateToPage.bind(this)}
                                    >
                                        {this.setNavigateToTopElement}
                                    </DetailedResults>
                                }
								{(this.props.generalReport.currentDisplaiedReportType == constants.generalReportTypes.SAVED) &&
                                    <SavedResults
                                        results={this.props.generalReport.results}
                                        selectedDetailColumns={this.props.generalReport.selectedDetailColumns}
                                        navigateToPage={this.navigateToPage.bind(this)}
                                    >
                                        {this.setNavigateToTopElement}
                                    </SavedResults>
                                }
                                {(this.props.generalReport.currentDisplaiedReportType == constants.generalReportTypes.COMBINED) &&
                                    <CombinedResults
                                        results={this.props.generalReport.results}
                                        combineOptions={this.props.generalReport.combineOptions}
                                        displayCombineRowDetailes={this.displayCombineRowDetailes.bind(this)}
                                        navigateToPage={this.navigateToPage.bind(this)}
                                        combineColumns={this.props.generalReport.combineOptions.combineColumns}
                                        combineDisplayBy={this.props.generalReport.combineOptions.combineDisplayBy}
                                    >
                                        {this.setNavigateToTopElement}
                                    </CombinedResults>
                                }
                            </div>}
                            {this.props.generalReport.results.isLoadingResults &&
                                <div className='text-center loading-report cursor-pointer' onClick={this.cancelGeneralReport.bind(this)}>
                                    <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                                    <p className="loading-report-cancel">{this.lables.loadingReportCancelTooltip}</p>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <iframe
                    style={{ display: 'none' }}
                    src={this.state.downloadUrl}
                />
                {this.props.showSmsModal &&<SendSmsModal 
                    sendSms={this.sendSms.bind(this)}
                    displaySendSmsModal={this.displaySendSmsModal.bind(this)}
                />}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        showSmsModal : state.elections.reportsScreen.generalReport.sendSms.showModal,
        generalReport: state.elections.reportsScreen.generalReport,
        currentUser: state.system.currentUser,
    }
}

export default connect(mapStateToProps)(withRouter(Results));