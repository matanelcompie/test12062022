import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import Combo from '../../../global/Combo';
import constants from 'libs/constants';
import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';

class LastStepStage extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
    }

    componentWillMount() {
		
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: "קובץ: " + this.props.fileData.fileName });
    }

    initConstants() {
        this.aHrefStyle = { cursor: 'pointer' };
    }

	/*
	This function return branch status update type name by its id
	
	@param statusNumber - the branch status update type number
	*/
    getStatusUpdateTypeById(statusNumber) {
        switch (statusNumber) {
            case constants.supportStatusUpdateType.maximum:
                return 'סטטוס סניף מקסימלי';
                break;
            case constants.supportStatusUpdateType.minimum:
                return 'סטטוס סניף מינימלי';
                break;
            case constants.supportStatusUpdateType.always:
                return 'עדכן תמיד';
                break;

            default:
                return '';
                break;
        }
    }


	/*
	This function return csv-file-process-status name by its id
	
	@param statusNumber - the csv-file-process-status id
	*/
    getProcessStatus(statusNumber) {
        switch (statusNumber) {
            case constants.csvParserStatus.didNotStart:
                return 'לא התחיל';
                break;
            case constants.csvParserStatus.atWork:
                return 'בתהליך';
                break;
            case constants.csvParserStatus.success:
                return 'עבר בהצלחה';
                break;
            case constants.csvParserStatus.error:
                return 'אירעה שגיאה';
                break;
			case constants.csvParserStatus.waiting:
                return 'בהמתנה';
                break;	
			case constants.csvParserStatus.cancelled:
                return 'בוטל';
                break;
			case constants.csvParserStatus.restarted:
				return 'הפעלה מחדש';
				break;

            default:
                return '';
                break;
        }
    }

	/*
	This function calculates every render() the percentage that was loaded
	*/
    getProcessProgressPercent() {
        let returnedValue = 0;
 
        if (this.props.lastStepScreen.currentProcessedDataState.processedRowsCount &&  this.totalNumberOfRow) {
            returnedValue = parseInt((this.props.lastStepScreen.currentProcessedDataState.processedRowsCount * 100) / this.totalNumberOfRow);
        }
        if (this.props.lastStepScreen.currentProcessedDataState.processedRowsCount >= this.totalNumberOfRow) {
            clearInterval(this.loopInterval);
        }
        return returnedValue;
    }

	/*
	This function dynamicly constructs some items in progress list data , 
	and it's used in render() function
	*/
    constructDataItems() {
        //construct data definition collapse : 
        this.statusItem = [];
        if (this.props.selectedStatus.item != null) {
            this.statusItem.push(<dl id={0} key={0} className="inlineDl">
                <dt>{this.props.selectedStatus.value}</dt>
                <dd>סטטוס נבחר</dd>
            </dl>);
        }
        if (this.props.selectedStatus.item != null && this.props.extraData.updateStatusExists.item != null) {
            this.statusItem.push(<dl id={1} key={1} className="inlineDl">
                <dt>{this.props.extraData.updateStatusExists.value}</dt>
                <dd>כאשר קיים סטטוס סניף לתושב</dd>
            </dl>);
        }
        if (this.props.selectedStatus.item != null && this.props.supportStatusUpdateType != null) {
            this.statusItem.push(<dl id={2} key={2} className="inlineDl">
                <dt>{this.getStatusUpdateTypeById(this.props.supportStatusUpdateType)}</dt>
                <dd>סטטוס סניף</dd>
            </dl>);
        }
        if (this.props.selectedStatus.item != null && this.props.updateStatus4EachHousehold == true) {
            this.statusItem.push(<dl id={3} key={3} className="inlineDl">
                <dt>מוגדר</dt>
                <dd>עדכן את סטטוס הסניף לכל בית אב</dd>
            </dl>);
        }

        if (this.statusItem.length > 0) {
            this.statusItem = <div className="fileData">{this.statusItem}</div>
        }
        else {

            this.statusItem = <div className="preTitle updateStatusTitle">לא הוגדר סטטוס לעידכון.</div>;
        }

        //construct extra data collapse : 
        this.extraDataItem = [];
        if (this.props.selectedInstituteSelectedDataTop != '') {
            this.extraDataItem.push(<dl id={0} key={0} className="inlineDl">
                <dt>{this.props.selectedInstituteSelectedDataTop.substr(0, this.props.selectedInstituteSelectedDataTop.length - 1)}</dt>
                <dd>מוסד</dd>
            </dl>);
        }
        if (this.props.selectedRole.item != null) {
            this.extraDataItem.push(<dl id={1} key={1} className="inlineDl fileData">
                <dt>{this.props.selectedRole.value}</dt>
                <dd>תפקיד</dd>
            </dl>);
        }
        if (this.props.classificationItem.item != null) {
            this.extraDataItem.push(<dl id={2} key={2} className="inlineDl fileData">
                <dt>{this.props.classificationItem.value}</dt>
                <dd>רמת סיווג</dd>
            </dl>);
        }
        if (this.extraDataItem.length > 0) {
            this.extraDataItem = <div className="fileData">{this.extraDataItem}</div>
        }
        else {

            this.extraDataItem = <div className="preTitle updateStatusTitle">לא הוגדרו נתונים לעדכון</div>;
        }
		
		// construct voterGroup data item 
		this.voterGroupDataItem = [];
		if(this.props.extraData.selectedVoterGroupFullPathname == ''){
			this.voterGroupDataItem = <div className="preTitle updateStatusTitle">לא הוגדרו נתונים לעדכון</div>;
		}
		else{
			this.voterGroupDataItem = <div className="preTitle updateStatusTitle">{this.props.extraData.selectedVoterGroupFullPathname}</div>;
		}
		
		// construct additional params data item 
		this.additionalParamsDataItem = [];
		
		if(this.props.extraData.selectedEthnicGroup.item && this.props.extraData.selectedEthnicGroup.item.value){
			this.additionalParamsDataItem.push(<dl id={1} key={1} className="inlineDl fileData">
                <dt>{this.props.extraData.selectedEthnicGroup.value}</dt>
                <dd>עדה</dd>
            </dl>);
		}
		if(this.props.extraData.selectedGender.item && this.props.extraData.selectedGender.item.value){
			this.additionalParamsDataItem.push(<dl id={2} key={2} className="inlineDl fileData">
                <dt>{this.props.extraData.selectedGender.value}</dt>
                <dd>מגדר</dd>
            </dl>);
		}
		if(this.props.extraData.selectedOrthodox.item && this.props.extraData.selectedOrthodox.item.value){
			this.additionalParamsDataItem.push(<dl id={3} key={3} className="inlineDl fileData">
                <dt>{this.props.extraData.selectedOrthodox.value}</dt>
                <dd>חרדי</dd>
            </dl>);
		}
        if(this.props.extraData.selectedReligiousGroup.item && this.props.extraData.selectedReligiousGroup.item.value){
            this.additionalParamsDataItem.push(<dl id={4} key={4} className="inlineDl fileData">
                <dt>{this.props.extraData.selectedReligiousGroup.value}</dt>
                <dd>זרם</dd>
            </dl>);  
        }
		if (this.additionalParamsDataItem.length > 0) {
            this.additionalParamsDataItem = <div className="fileData">{this.additionalParamsDataItem}</div>
        }
        else {

            this.additionalParamsDataItem = <div className="preTitle updateStatusTitle">לא הוגדרו נתונים לעדכון</div>;
        }

    }

    componentDidMount() {
 
        ElectionsActions.getProcessedFileData(this.props.dispatch, this.props.router.params.csvFileKey);

        // set infinite loop to reload progress data : 
        let self = this;
        var millisecondsToWait = 1000 * 5;
        this.loopInterval = setInterval(function () {
            ElectionsActions.getProcessedFileData(self.props.dispatch, self.props.router.params.csvFileKey);
        }, millisecondsToWait);
    }

    componentWillUnmount() {
        clearInterval(this.loopInterval);
		//clean the iframe : 
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SET_IFRAME_CSV_FILE_SRC,
		srcName: ''});
    }
	/*
	This function opens/closes collapse status by collapse id
	
	@param container - the wanted collapse to be opened/closed
	*/
    updateCollapseStatus(container) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.FINAL_STEP_COLLAPSE_CHANGE, container });
    }


	/*
	This function gets csv from url
	
	@param actionName - the needed filter action
	@param rowsCount - current row count - if it's 0 then the request will not be sent
	*/
    makeCsvFile(actionName, rowsCount) {
		
        // console.log(actionName, rowsCount);
        if (rowsCount > 0) {
//			console.log(window.Laravel.baseURL + 'api/elections/imports/' + this.props.fileData.fileKey + '/filter/' + actionName)
            this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SET_IFRAME_CSV_FILE_SRC,
                 srcName: window.Laravel.baseURL + 'api/elections/imports/' + this.props.fileData.fileKey + '/filter/' + actionName });
        }
    }
    renderResultDataState(dataState){
        const dataStateObj = [
            { lable: 'מספר התושבים שעודכנו בפועל', 'dataParam': 'total_voter_rows', exportParam: 'UPDATED_VOTER_IDS' },
            { lable: 'מספר העדכונים שנעשו בפועל', 'dataParam': 'total_voter_updates_sum', exportParam: 'REALLY_UPDATED_VOTERS' },
            { lable: 'מספר השורות שהכילו נתונים זהים לנתונים הקודמים', 'dataParam': 'total_voter_not_updated_rows', exportParam: 'EXISTING_VOTERS_DATA_NOT_UPDATED' },

            { lable: 'מספר השורות עם תעודות זהות שאינה תקינה', 'dataParam': 'invalid_ids', exportParam: 'invalid_ids' },
            { lable: 'מספר השורות עם תעודות זהות שאינה קיימת', 'dataParam': 'unknown_voter', exportParam: 'unknown_voter' },
            { lable: 'מספר השורות ללא הרשאת משתשמש', 'dataParam': 'missing_user_permission', exportParam: 'missing_user_permission' },
            { lable: 'מספר השורות עם טלפון לא חוקי', 'dataParam': 'invalid_phones', exportParam: 'invalid_phones', hideIfEmpty: true },

            { lable: 'מספר השורות בהם העיר לא תקינה', 'dataParam': 'city_not_valid', exportParam: 'city_not_valid', hideIfEmpty: true }, 
            { lable: 'מספר השורות בהם  התאריך לא היה תקין', 'dataParam': 'date_not_valid', exportParam: 'date_not_valid', hideIfEmpty: true }, 
            { lable: 'מספר השורות בהם העדה לא קיימת במערכת', 'dataParam': 'ethnic_not_valid', exportParam: 'ethnic_not_valid', hideIfEmpty: true }, 
            { lable: 'מספר השורות בהם הזרם לא קיים במערכת', 'dataParam': 'religious_not_valid', exportParam: 'religious_not_valid', hideIfEmpty: true }, 
            { lable: 'מספר השורות בהם זמן הצבעה לא תקין', 'dataParam': 'vote_time_not_valid', exportParam: 'vote_time_not_valid', hideIfEmpty: true }, 
            { lable: 'מספר השורות בהם המייל שהוכנס לא תקין', 'dataParam': 'email_not_valid', exportParam: 'email_not_valid', hideIfEmpty: true }, 
            { lable: 'מספר השורות בהם מספר הטלפון שהוכנס לא תקין', 'dataParam': 'phone_not_valid', exportParam: 'phone_not_valid', hideIfEmpty: true }, 
            { lable: 'מספר השורות בהם הסטטוס לא קיים במערכת', 'dataParam': 'support_status_not_exist', exportParam: 'support_status_not_exist', hideIfEmpty: true }, 
            { lable: 'מספר השורות שבהם הערך "ספרדי" לא תקין', 'dataParam': 'sepharadi_not_valid', exportParam: 'sepharadi_not_valid', hideIfEmpty: true }, 
            { lable: 'מספר השורות שבהם הערך "חרדי" לא תקין', 'dataParam': 'strictly_orthodox_not_valid', exportParam: 'strictly_orthodox_not_valid', hideIfEmpty: true }, 
            { lable: 'מספר השורות שבהם הערך "דיווח מיתה" לא תקין', 'dataParam': 'deceased_not_valid', exportParam: 'deceased_not_valid', hideIfEmpty: true }, 

        ]
        const self = this;
        const dataRows = dataStateObj.map(function(rowData){
           let hideRow = rowData.hideIfEmpty && dataState[rowData.dataParam] == 0;
        //    console.log(hideRow,rowData);
           return (
               <div key={rowData.dataParam} className="col-lg-4 fileData" style={hideRow ? { display: 'none' } : {}}>
                   <dl className="inlineDl">
                       <dt><a style={self.aHrefStyle} onClick={self.makeCsvFile.bind(self, rowData.exportParam, dataState[rowData.dataParam])}>{dataState[rowData.dataParam]}</a></dt>
                       <dd>{rowData.lable}</dd>
                   </dl>
               </div>
           )

        });
        return dataRows;
    }
	
	/*
		Function that handles clicking 'back' arrows at bottom right
	*/
	backClick(){
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SET_IMPORT_TAB, tabName: 'extraData' });
	}
	
    render() {
		//console.log(this.props.fileData.totalRowsCount)
        this.totalNumberOfRow = this.props.fileData.totalRowsCount;
        if (this.props.isHeader || this.props.fileData.isHeader) {
            this.totalNumberOfRow--;
        }

        this.constructDataItems();
        let processProgressPercent = this.getProcessProgressPercent();
        let dataState=this.props.lastStepScreen.currentProcessedDataState;
		
		let backBackButtonDisabled = !this.props.lastStepScreen.currentProcessedDataState.csvFileStatus;
        // console.log(dataState);
        return (
            <div>
                <div className="resultsArea dataUpdate">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="preTitle dataSummary">להלן סיכום עידכון הנתונים:</div>
                        </div>
                    </div>
                    <div className="row contentContainer loadingStatus">
                        <div className="col-lg-3">
                            <h3>סטטוס טעינה
                                 : <span className="loadingStatusCounter">{(this.props.lastStepScreen.currentProcessedDataState.csvFileStatus == constants.csvParserStatus.atWork ? ((processProgressPercent > 0) ? (processProgressPercent + "%") : "טוען") : this.getProcessStatus(this.props.lastStepScreen.currentProcessedDataState.csvFileStatus))}</span>
                            </h3>
                        </div>
                        <div className="col-lg-9">
                            {(this.props.lastStepScreen.currentProcessedDataState.csvFileStatus == constants.csvParserStatus.atWork && processProgressPercent > 0) &&
                                <div className="progress">
                                    <div className="progress-bar progress-bar-info progress-bar-striped active" role="progressbar"
                                        aria-valuenow="54" aria-valuemin="0" aria-valuemax="100" style={{ width: processProgressPercent + "%" }}>
									</div>
                                </div>
                            }
                            {((!processProgressPercent && this.props.lastStepScreen.currentProcessedDataState.csvFileStatus == constants.csvParserStatus.atWork) || (this.props.lastStepScreen.currentProcessedDataState.csvFileStatus != 0 && !this.props.lastStepScreen.currentProcessedDataState.csvFileStatus)) &&
                                <span className="fa fa-spinner fa-spin"></span>
                            }
                        </div>
                    </div>
                    <div className="row wizardTabs">
                        <div className="tab-content tabContnt" id="tabMoreInfo">
                            <div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">

                                <div className="ContainerCollapse">
                                    <a onClick={this.updateCollapseStatus.bind(this, 'firstCollapseOpened')} aria-expanded={this.props.lastStepScreen.firstCollapseOpened}>
                                        <div className="row panelCollapse">
                                            <div className="collapseArrow closed"></div>
                                            <div className="collapseArrow open"></div>
                                            <div className="collapseTitle">פרטי קובץ</div>
                                        </div>
                                    </a>
                                    <Collapse isOpened={this.props.lastStepScreen.firstCollapseOpened}>
                                        <div className="row CollapseContent nomargin">
                                            <div className="fileData">
											    <dl className="inlineDl">
                                                    <dt>{this.props.fileData.id}</dt>
                                                    <dd>מספר עבודה</dd>
                                                </dl>
                                                <dl className="inlineDl">
                                                    <dt>{this.props.fileData.fileName}</dt>
                                                    <dd>שם הקובץ</dd>
                                                </dl>
                                                <dl className="inlineDl fileData">
                                                    <dt>{(this.props.fileData.fileSize / 1000)} KB</dt>
                                                    <dd>גודל הקובץ</dd>
                                                </dl>
                                                <dl className="inlineDl fileData">
                                                    <dt>{this.totalNumberOfRow}</dt>
                                                    <dd>מספר שורות</dd>
                                                </dl>
                                                <dl className="inlineDl fileData">
                                                    <dt>{this.getProcessStatus(dataState.csvFileStatus)}</dt>
                                                    <dd>סטטוס פעולה</dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                <div className="ContainerCollapse">
                                    <a onClick={this.updateCollapseStatus.bind(this, 'secondCollapseOpened')} aria-expanded={this.props.lastStepScreen.secondCollapseOpened}>
                                        <div className="row panelCollapse">
                                            <div className="collapseArrow closed"></div>
                                            <div className="collapseArrow open"></div>
                                            <div className="collapseTitle">מקור נתונים</div>
                                        </div>
                                    </a>
                                    <Collapse isOpened={this.props.lastStepScreen.secondCollapseOpened}>
                                        <div className="row CollapseContent nomargin">
                                            <div className="fileData">
                                                <dl className="inlineDl">
                                                    <dt>{this.props.dataSource}</dt>
                                                    <dd>מקור נתונים</dd>
                                                </dl>
                                                <dl className="inlineDl fileData">
                                                    <dt>{this.props.selectedVoterIdentity + ' ' + this.props.selectedVoterSmallData} </dt>
                                                    <dd>מביא הנתונים</dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                <div className="ContainerCollapse">
                                    <a onClick={this.updateCollapseStatus.bind(this, 'thirdCollapseOpened')} aria-expanded={this.props.lastStepScreen.thirdCollapseOpened}>
                                        <div className="row panelCollapse">
                                            <div className="collapseArrow closed"></div>
                                            <div className="collapseArrow open"></div>
                                            <div className="collapseTitle">נוהל עידכון סטטוס סניף</div>
                                        </div>
                                    </a>
                                    <Collapse isOpened={this.props.lastStepScreen.thirdCollapseOpened}>
                                        <div className="row CollapseContent nomargin">
                                            {this.statusItem}
                                        </div>
                                    </Collapse>
                                </div>

                                <div className="ContainerCollapse">
                                    <a onClick={this.updateCollapseStatus.bind(this, 'fourthCollapseOpened')} aria-expanded={this.props.lastStepScreen.fourthCollapseOpened}>
                                        <div className="row panelCollapse">
                                            <div className="collapseArrow closed"></div>
                                            <div className="collapseArrow open"></div>
                                            <div className="collapseTitle">הוספת מוסד ברירת מחדל</div>
                                        </div>
                                    </a>
                                    <Collapse isOpened={this.props.lastStepScreen.fourthCollapseOpened}>
                                        <div className="row CollapseContent nomargin">
                                            {this.extraDataItem}
                                        </div>
                                    </Collapse>
                                </div>
								<div className="ContainerCollapse">
                                    <a onClick={this.updateCollapseStatus.bind(this, 'eightsCollapseOpened')} aria-expanded={this.props.lastStepScreen.eightsCollapseOpened}>
                                        <div className="row panelCollapse">
                                            <div className="collapseArrow closed"></div>
                                            <div className="collapseArrow open"></div>
                                            <div className="collapseTitle">קבוצה</div>
                                        </div>
                                    </a>
                                    <Collapse isOpened={this.props.lastStepScreen.eightsCollapseOpened}>
                                        <div className="row CollapseContent nomargin">
                                            {this.voterGroupDataItem}
                                        </div>
                                    </Collapse>
                                </div>
								<div className="ContainerCollapse">
                                    <a onClick={this.updateCollapseStatus.bind(this, 'ninthCollapseOpened')} aria-expanded={this.props.lastStepScreen.ninthCollapseOpened}>
                                        <div className="row panelCollapse">
                                            <div className="collapseArrow closed"></div>
                                            <div className="collapseArrow open"></div>
                                            <div className="collapseTitle">פרמטרים נוספים</div>
                                        </div>
                                    </a>
                                    <Collapse isOpened={this.props.lastStepScreen.ninthCollapseOpened}>
                                        <div className="row CollapseContent nomargin">
                                            {this.additionalParamsDataItem}
                                        </div>
                                    </Collapse>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row wizardTabs">
                        <div className="tab-content tabContnt" id="tabMoreInfo">
                            <div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">
                                <div className="ContainerCollapse">
                                    <a onClick={this.updateCollapseStatus.bind(this, 'fifthCollapseOpened')} aria-expanded={this.props.lastStepScreen.fifthCollapseOpened}>
                                        <div className="row panelCollapse">
                                            <div className="collapseArrow closed"></div>
                                            <div className="collapseArrow open"></div>
                                            <div className="collapseTitle">סיכום הפעולות שנעשו</div>
                                        </div>
                                    </a>
                                    <Collapse isOpened={this.props.lastStepScreen.fifthCollapseOpened}>
                                        <div className="row CollapseContent nomargin">
                                            <div className="col-lg-4 fileData">
                                                <dl className="inlineDl">
                                                    <dt><a style={this.aHrefStyle} onClick={this.makeCsvFile.bind(this, 'ALL_ROWS', this.totalNumberOfRow)}>{this.totalNumberOfRow}</a></dt>
                                                    <dd>מספר השורות בקובץ</dd>
                                                </dl>
                                            </div>
                                            <div className="col-lg-4 fileData">
                                                <dl className="inlineDl">
                                                    <dt><a style={this.aHrefStyle} onClick={this.makeCsvFile.bind(this, 'PROCESSED_ROWS', dataState.processedRowsCount)}>{dataState.processedRowsCount}</a></dt>
                                                    <dd>מספר השורות שהתהליך רץ עליהם</dd>
                                                </dl>
                                            </div>
                                            <div className="col-lg-4 fileData">
                                                <dl className="inlineDl">
                                                    <dt><a style={this.aHrefStyle} onClick={this.makeCsvFile.bind(this, 'NOT_PROCESSED_ROWS', (this.totalNumberOfRow - dataState.processedRowsCount))}>{this.totalNumberOfRow - dataState.processedRowsCount}</a></dt>
                                                    <dd>מספר השורות שהתהליך עדיין לא רץ עליהם</dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                <div className="ContainerCollapse">
                                    <a onClick={this.updateCollapseStatus.bind(this, 'sixthCollapseOpened')} aria-expanded={this.props.lastStepScreen.sixthCollapseOpened}>
                                        <div className="row panelCollapse">
                                            <div className="collapseArrow closed"></div>
                                            <div className="collapseArrow open"></div>
                                            <div className="collapseTitle">להלן הפירוט של השורות שהתהליך רץ עליהם:({dataState.processedRowsCount} שורות)</div>
                                        </div>
                                    </a>
                                    <Collapse isOpened={this.props.lastStepScreen.sixthCollapseOpened}>
                                        <div className="row CollapseContent nomargin">
                                        {this.renderResultDataState(dataState)}
                                        
                                            <div className="col-lg-4 fileData">
                                                <dl className="inlineDl">
                                                    <dt><a style={this.aHrefStyle} onClick={this.makeCsvFile.bind(this, 'ALL_VALID_DATA', (dataState.processedRowsCount - dataState.totalInvalidRows))}>{dataState.processedRowsCount - dataState.totalInvalidRows}</a></dt>
                                                    <dd>סך כל השורות התקינות</dd>
                                                </dl>
                                            </div>
                                            <div className="col-lg-4 fileData">
                                                <dl className="inlineDl">
                                                    <dt><a style={this.aHrefStyle} onClick={this.makeCsvFile.bind(this, 'ALL_INVALID_DATA', dataState.totalInvalidRows)}>{dataState.totalInvalidRows}</a></dt>
                                                    <dd>סך כל השורות השגויות</dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                <div className="ContainerCollapse">
                                    <a onClick={this.updateCollapseStatus.bind(this, 'seventhCollapseOpened')} aria-expanded={this.props.lastStepScreen.seventhCollapseOpened}>
                                        <div className="row panelCollapse">
                                            <div className="collapseArrow closed"></div>
                                            <div className="collapseArrow open"></div>
                                            <div className="collapseTitle">סיכום הוספת טלפונים</div>
                                        </div>
                                    </a>
                                    <Collapse isOpened={this.props.lastStepScreen.seventhCollapseOpened}>
                                        <div className="row CollapseContent nomargin">
                                            <div className="col-lg-4 fileData">
                                                <dl className="inlineDl">
                                                    <dt><a style={this.aHrefStyle} onClick={this.makeCsvFile.bind(this, 'ALL_PHONES_DATA', (dataState.AddedPhonesCount + dataState.nonAddedPhonesCount))}>{dataState.AddedPhonesCount + dataState.nonAddedPhonesCount}</a></dt>
                                                    <dd>סך כל הטלפונים</dd>
                                                </dl>
                                            </div>
                                            <div className="col-lg-4 fileData">
                                                <dl className="inlineDl">
                                                    <dt><a style={this.aHrefStyle} onClick={this.makeCsvFile.bind(this, 'NEW_PHONES_DATA', dataState.AddedPhonesCount)}>{dataState.AddedPhonesCount}</a></dt>
                                                    <dd>סה"כ מספרים עודכנו</dd>
                                                </dl>
                                            </div>
                                            <div className="col-lg-4 fileData">
                                                <dl className="inlineDl">
                                                    <dt><a style={this.aHrefStyle} onClick={this.makeCsvFile.bind(this, 'EXISTING_PHONES_DATA', dataState.nonAddedPhonesCount)}>{dataState.nonAddedPhonesCount}</a></dt>
                                                    <dd>מספר הטלפונים שהיו קיימים כבר</dd>
                                                </dl>
                                            </div>

                                        </div>
                                    </Collapse>
                                </div>
                            </div>
                        </div>
                    </div>
					                      <div className="row prevNextRow">
                                            <div className="col-lg-6"> <a alt="חזרה" title="חזרה" style={{cursor:(backBackButtonDisabled ? 'not-allowed':'pointer') , opacity:(backBackButtonDisabled?'0.4':'')}} onClick={(backBackButtonDisabled ? null: this.backClick.bind(this))}><img src={ window.Laravel.baseURL + "Images/ico-arrows.svg"} /></a> </div>
										  </div>
                </div>
                <iframe src={this.props.fileSrc} style={{ display: 'none', border: '0', height: '0px', width: '0px', borderStyle: 'none' }} />
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        //static state fields : 
        lastStepScreen: state.elections.importScreen.lastStepScreen,
        fileData: state.elections.importScreen.dataDefinition.fileData,
        csvFile: state.elections.importScreen.loadData.csvFile,
        dataSource: state.elections.importScreen.loadData.dataSource,
        selectedVoterIdentity: state.elections.importScreen.loadData.selectedVoterIdentity,
        selectedVoterSmallData: state.elections.importScreen.loadData.selectedVoterSmallData,
        isHeader: state.elections.importScreen.dataDefinition.isHeader,
		extraData: state.elections.importScreen.extraData,
        selectedInstituteSelectedDataTop: state.elections.importScreen.extraData.selectedInstituteSelectedDataTop,
        selectedRole: state.elections.importScreen.extraData.selectedRole,
        classificationItem: state.elections.importScreen.extraData.classificationItem,

        selectedStatus: state.elections.importScreen.extraData.selectedStatus,
        //defaultNotSelectedStatus: state.elections.importScreen.extraData.defaultNotSelectedStatus,
        supportStatusUpdateType: state.elections.importScreen.extraData.supportStatusUpdateType,
        updateStatus4EachHousehold: state.elections.importScreen.extraData.updateStatus4EachHousehold,


        //dynamic state fields : 

        csvFileDataArray: state.elections.importScreen.lastStepScreen.csvFileDataArray,
        csvFileDataFilterName: state.elections.importScreen.lastStepScreen.csvFileDataFilterName,
        isDownloadingFile: state.elections.importScreen.lastStepScreen.isDownloadingFile,
        fileSrc: state.elections.importScreen.lastStepScreen.fileSrc,

    }
}

export default connect(mapStateToProps)(withRouter(LastStepStage));