import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from 'actions/SystemActions';
import * as ElectionsActions from 'actions/ElectionsActions';

import constants from 'libs/constants';
import ModalWindow from '../../global/ModalWindow';
import ImportLoad from './LoadTab/ImportLoad';
import SecondStepDataDefinition from './DataDefinitionTab/SecondStepDataDefinition';
import ThirdStepExtraData from './ExtraDataTab/ThirdStepExtraData';
import LastStepStage from './LastStep/LastStepStage';

class ElectionsImport extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
    }

    initConstants() {
        this.systemTitle = "עידכון נתוני תושבים";
        this.pageHeader = "עידכון נתונים";
        this.notAllowedCursorStyle = { cursor: 'not-allowed' }
        this.currentTabsConfiguration = ''; //dynamic tabs configuration
        this.currentStepWindow = ''; //dynamic component for current step
    }

    componentWillReceiveProps(nextProps) {

        if (this.props.currentUser.admin == false && nextProps.currentUser.permissions['elections.import'] != true && this.props.currentUser.permissions['elections.import'] != true && this.props.currentUser.first_name.length > 1) {
            this.props.router.replace('/unauthorized');
        }
    }

    componentWillMount() {
        ElectionsActions.getEthnicGroups(this.props.dispatch );
		ElectionsActions.getAllVotersGroups(this.props.dispatch);
        if (this.props.router.params.csvFileKey != 'new' && this.props.router.params.csvFileKey.split(' ').join('') != '') {

            ElectionsActions.loadCsvFileFullData(this.props.dispatch, this.props.router, this.props.router.params.csvFileKey);
        }
        else {

            this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_FIRST_STAGE });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_SECOND_STAGE });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_THIRD_STAGE });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_FOURTH_STAGE });
        }
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: this.systemTitle });
    }

	/*
	   function that dynamicly renders tabs according to stage : 
	*/
    setCorrectTabsConfiguration() {
	 
        switch (this.props.importTab) {
            case 'loadData':  //first stage
                this.currentTabsConfiguration = <ul className="nav nav-tabs steps steps-5">
                    {this.renderSingleTab(1, this.tabLoad.title, '', false, true)}
                    {this.renderSingleTab(2, this.tabSettings.title, '', true, false)}
                    {this.renderSingleTab(3, this.tabAdditional.title, '', true, false)}
                    {this.renderSingleTab(4, this.tabEnd.title, '', true, false)}
                </ul>;
                this.currentStepWindow = <ImportLoad />;
                //this.currentStepWindow = <ThirdStepExtraData/>;
                //this.currentStepWindow = <LastStepStage/>;
                break;
            case 'dataDefinition':  //second stage
                this.currentTabsConfiguration = <ul className="nav nav-tabs steps steps-5">
                    {this.renderSingleTab(1, this.tabLoad.title, '', false, false)}
                    {this.renderSingleTab(2, this.tabSettings.title, '', false, true)}
                    {this.renderSingleTab(3, this.tabAdditional.title, '', true, false)}
                    {this.renderSingleTab(4, this.tabEnd.title, '', true, false)}
                </ul>;

                this.currentStepWindow = <SecondStepDataDefinition />;

                break;
            case 'extraData'://third stage
                this.currentTabsConfiguration = <ul className="nav nav-tabs steps steps-5">
                    {this.renderSingleTab(1, this.tabLoad.title, '', false, false)}
                    {this.renderSingleTab(2, this.tabSettings.title, '', false, false)}
                    {this.renderSingleTab(3, this.tabAdditional.title, '', false, true)}
                    {this.renderSingleTab(4, this.tabEnd.title, '', true, false)}
                </ul>;

                this.currentStepWindow = <ThirdStepExtraData />;
                break;
            case 'lastStep'://third stage
                this.currentTabsConfiguration = <ul className="nav nav-tabs steps steps-5">
                    {this.renderSingleTab(1, this.tabLoad.title, '', false, false)}
                    {this.renderSingleTab(2, this.tabSettings.title, '', false, false)}
                    {this.renderSingleTab(3, this.tabAdditional.title, '', false, false)}
                    {this.renderSingleTab(4, this.tabEnd.title, '', false, true)}
                </ul>;

                this.currentStepWindow = <LastStepStage />;
                break;
            default:
                this.currentTabsConfiguration = '';
                break;
        }


    }

    initVariables() {
        this.tabLoad = {
            name: 'load',
            className: '',
            title: "טעינת קובץ",
            display: false
        };

        this.tabSettings = {
            name: 'settings',
            className: '',
            title: "הגדרת נתונים",
            display: false
        };

        this.tabAdditional = {
            name: 'additional',
            className: '',
            title: "נתונים נוספים",
            display: false
        };

        this.tabEnd = {
            name: 'end',
            className: '',
            title: "סיום",
            display: false
        };
        this.backToList="חזרה לרשימה";
        this.cancelProcess="ביטול תהליך";
		this.restartProcessTitle = "הפעלה מחדש";
    }

    /*general function that closes all types of dialogues */
    closeModalDialog() {
        this.props.dispatch({
            type: ElectionsActions.ActionTypes.SET_MODAL_DIALOG_DATA , visible:false , headerText:'' , modalText :''
        });
    }

	/*
	  function that construct tab dynamicly, and the params are :
	   number - tab numeric order (from 1 to 4)
	   title - the text displayed inside the tab
	   href - if there is a href - it will create it inside <A> tag
	   isDisabled - show red 'not-allowed' cursor on the tab
	   isActive - set if this tab is currently active and highlighted
	
	*/
    renderSingleTab(number, title, href, isDisabled, isActive) {
        let aHrefElement = undefined;
        let listElement = undefined;
        if (href == '') {
            aHrefElement = <a title={title}>
                <span className="WizNumber">{number}.</span>
                <span className="WizText WizTextMobile">{title}</span>
            </a>;
        }
        else {
            aHrefElement = <a href={href} title={title}>
                <span className="WizNumber">{number}.</span>
                <span className="WizText WizTextMobile">{title}</span>
            </a>;
        }

        if (isDisabled) {
            if (isActive) {
                listElement = <li style={this.notAllowedCursorStyle} className="active">{aHrefElement}</li>;
            }
            else {
                listElement = <li style={this.notAllowedCursorStyle}>{aHrefElement}</li>;
            }
        }
        else {
            if (isActive) {
                listElement = <li className="active">{aHrefElement}</li>;
            }
            else {
                listElement = <li>{aHrefElement}</li>;
            }
        }
        return listElement;
    }

    clickBackToList(){
        this.props.router.push('/elections/imports')
    }

    cancelCurrentProcess(){
		ElectionsActions.editCsvFileStatus(this.props.dispatch, this.props.router.params.csvFileKey);
        this.props.router.push('/elections/imports')
    }
	
	restartCurrentProcess(){
		ElectionsActions.editCsvFileStatus(this.props.dispatch, this.props.router.params.csvFileKey , {edit_type:'reload'}) ;
	}

    render() {
		this.initVariables();
        this.setCorrectTabsConfiguration();
        return (
            <div>
                <div className="row pageHeading1">
                    <div className="col-lg-8">
                        <h1>{this.pageHeader}</h1>
                    </div>
                    <div className="col-lg-4">
                        <button type="button" className="btn btn-primary pull-left" onClick={this.clickBackToList.bind(this)}>{this.backToList}</button>
						{(this.props.importTab == 'lastStep' && (this.props.lastStepScreen.currentProcessedDataState.csvFileStatus == constants.csvParserStatus.atWork)) && <button type="button"  className="btn btn-primary pull-left" style={{marginLeft:'10px'}}  onClick={this.cancelCurrentProcess.bind(this)}>{this.cancelProcess}</button>}
						{(this.props.importTab == 'lastStep' && ((this.props.lastStepScreen.currentProcessedDataState.csvFileStatus == constants.csvParserStatus.cancelled || this.props.lastStepScreen.currentProcessedDataState.csvFileStatus == constants.csvParserStatus.error))) && <button type="button" className="btn btn-primary pull-left" title={this.restartProcessTitle} onClick={this.restartCurrentProcess.bind(this)}  style={{marginLeft:'10px'}}><i className="fa fa-undo fa-6"></i></button>}
					</div>
                </div>

                <div className="dataUpdate">
                    <div className="row nomargin Wizard dataUpdateWizard">
                        {this.currentTabsConfiguration}
                    </div>
                    {this.currentStepWindow}
                </div>
                <ModalWindow show={this.props.showModalDialog} buttonX={this.closeModalDialog.bind(this)} buttonOk={this.closeModalDialog.bind(this)} title={this.props.modalHeaderText} style={{ zIndex: '9001' }}>
                    <div>{this.props.modalContentText}</div>
                </ModalWindow>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        importTab: state.elections.importScreen.importTab,
        csvFile: state.elections.importScreen.csvFile,
        currentUser: state.system.currentUser,
        showModalDialog: state.elections.showModalDialog,
        modalHeaderText: state.elections.modalHeaderText,
        modalContentText: state.elections.modalContentText,
		lastStepScreen: state.elections.importScreen.lastStepScreen,
    }
}

export default connect(mapStateToProps)(withRouter(ElectionsImport));