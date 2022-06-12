import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import {dateTimeReversePrint} from '../../../libs/globalFunctions';
import ModalWindow from '../../global/ModalWindow';

import * as VoterActions from '../../../actions/VoterActions';


/**
 * This class is a lower component which
 * is displayed on clicking lower tab
 * requests.
 * This component displays a table with
 * requests related to the voter.
 */
class VoterRequests extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.panelTitle = "פניות אחרונות";
        this.newRequestTitle = "פנייה חדשה";

        this.subTopicText = "תת נושא";
        this.requestDescriptionText = "תיאור הפנייה";
        this.userHandlerText = "עובד מטפל";
        this.teamHandlerText = "צוות מטפל";
        this.createdDateText = "תאריך פתיחה";
        this.targetDateText = "יעד לסיום";
        this.detailsButtonText = "פרטי הפניה";

        this.priorityIcon = window.Laravel.baseURL + 'Images/ico-priority.svg';
        this.statusIcon = window.Laravel.baseURL + 'Images/ico-inquiry-status-1.svg';
        this.attachedIcon = window.Laravel.baseURL + "Images/ico-attached.svg";
    }

    requestDetailsClick(requestKey) {
        this.props.router.push('crm/requests/' + requestKey);
    }

    newRequestClick() {
        this.props.router.push('/crm/requests/new/');
    }

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }

        this.requestsBlockClass = "tab-content tabContnt hidden";
        this.allowRequestDocumentShow = false;
        this.allowRequestDocumentDownload = false;
    }

    checkPermissions() {
        if (this.props.currentUser.admin) {
            this.requestsBlockClass = "tab-content tabContnt";
            this.allowRequestDocumentShow = true;
            this.allowRequestDocumentDownload = true;
            return;
        }

        if (this.props.currentUser.permissions['elections.voter.requests'] == true) {
            this.requestsBlockClass = "tab-content tabContnt";
        }

        if (this.props.currentUser.permissions['crm.requests.documents'] == true) {
            this.allowRequestDocumentShow = true;
        }

        if (this.props.currentUser.permissions['crm.requests.documents.download'] == true) {
            this.allowRequestDocumentDownload = true;
        }
    }

    /**
     * This function closes the Modal
     * dialog of documents
     */
    closeModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_CLOSE_REQUEST_MODAL_DIALOG});
    }

    loadRequestDocumentsModal(requestId, requestDocuments) {
        var modalRows = '';
        var modalHeader = '';
        var modalContent = '';
        var that = this;

        modalHeader = "מסמכי פניה מספר ";
        modalHeader += requestId;

        modalRows = requestDocuments.map(function (document, index) {
            let td_created_date = dateTimeReversePrint(document.created_at, true, true);
            let td_document_to = '/documents/' + document.key;
            let td_key = '';

            if ( that.allowRequestDocumentDownload ) {
                td_key = <Link to={td_document_to} target="_blank">{document.key}</Link>
            } else {
                td_key = document.key;
            }

            return (
                <tr key={index}>
                    <td>{td_key}</td>
                    <td>{document.type}</td>
                    <td>{document.name}</td>
                    <td>{td_created_date}</td>
                </tr>
            )
        });

        modalContent = <table className="table table-striped table-bordered" width={"100%"} cellSpacing={'0'}>
            <thead style={{backgroundColor: '#eeeeee'}}>
            <tr>
                <th>מס' מסמך</th>
                <th>סוג מסמך</th>
                <th>שם המסמך</th>
                <th>מועד יצירה</th>
            </tr>
            </thead>

            <tbody>
                {modalRows}
            </tbody>
        </table>

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_OPEN_REQUEST_MODAL_DIALOG,
                             header: modalHeader,
                             content: modalContent});
    }

    renderDocumentsLinks( requestItem ) {
        var linkTitle = "מסמכי פניה מספר ";
        linkTitle += requestItem.id;

        if ( requestItem.documents.length > 0 ) {
            if ( this.allowRequestDocumentShow ) {
                return (
                    <div className="inqryIndctrs">
                        <span className="attachedDocs">
                            <a href="#" title={linkTitle}
                               onClick={this.loadRequestDocumentsModal.bind(this, requestItem.id,
                                                                            requestItem.documents)}>
                                <img src={this.attachedIcon} alt={linkTitle}/>
                            </a>
                        </span>
                    </div>
                );
            } else {
                return (
                    <div className="inqryIndctrs">
                        <span className="attachedDocs">
                            <img src={this.attachedIcon} alt={linkTitle}/>
                        </span>
                    </div>
                );
            }
        } else {
            return (
                <div className="inqryIndctrs">{'\u00A0'}</div>
            );
        }
    }

    renderRequests() {
        var that = this;

        this.requestsRows = this.props.voterRequests.map(function (requestItem, index) {
            var requestDescription = '';
            var userHandlerFullName = requestItem.first_name + ' ' + requestItem.last_name;
            var createDate = dateTimeReversePrint(requestItem.date, true, true);
            var targetDate = dateTimeReversePrint(requestItem.target_close_date, true, true);
            var targetDateFormatted = requestItem.target_close_date.split(' ')[0];
			targetDateFormatted = targetDateFormatted.split('-');
			targetDateFormatted = new Date(targetDateFormatted[0] , parseInt(targetDateFormatted[1]) - 1 , targetDateFormatted[2]);
			var todaysDay = new Date();
			var dateDifference = (targetDateFormatted.getTime() - todaysDay.getTime());
            createDate = createDate.split(' ').reverse().join(' | ');
            targetDate = targetDate.split(' ').reverse().join(' | ');

            if ( requestItem.actions.length > 0 ) {
                requestDescription = requestItem.actions[0].description;
            }

            return (
                <div className="col-xs-12 inqryPanel" key={index}>
                    <div className="row inqryPanelHead">
                        <div className="col-sm-7">
                            <div className="row">
                                <div className="col-xs-3 col-sm-2 inqryNo nopadding"> {requestItem.key} </div>
                                <div className="col-xs-9 col-sm-10 inqryTitle nopadding">
                                    {requestItem.topic_name}
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-2 nopadding"></div>
                        <div className="col-sm-3 inqryPanelStatus panelInnerBorder clearfix">
                            <span className="inqryPrrty">
                                <img src={that.priorityIcon}/>{requestItem.request_priority_name}
                            </span>
                            <span className="inqryStatus">
                                <img src={that.statusIcon}/>{requestItem.request_status_name}
                            </span>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-6 col-md-8 inqryCategories">
                            <div className="row">
                                <div className="col-md-2 nopadding"> {that.subTopicText} </div>
                                <div className="col-md-10 inqrySub nopadding">
                                    <strong>{requestItem.sub_topic_name}</strong>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-2 nopadding"> {that.requestDescriptionText} </div>
                                <div className="col-md-10 inqrySubject nopadding">{requestDescription}</div>
                            </div>
                        </div>
                        <div className="col-xs-6 col-sm-3 col-md-2 panelInnerCol">
                            <dl>
                                <dt>{that.userHandlerText}</dt>
                                <dd>{userHandlerFullName}</dd>
                                <dt>{that.teamHandlerText}</dt>
                                <dd>{requestItem.team_name}</dd>
                            </dl>
                            {that.renderDocumentsLinks(requestItem)}
                        </div>
                        <div className="col-xs-6 col-sm-3 col-md-2 panelInnerCol">
                            <dl>
                                <dt>{that.createdDateText}</dt>
                                <dd>{createDate}</dd>
                                <dt>{that.targetDateText}</dt>
                                <dd><span style={{color:(dateDifference < 0 ?'#ff0000' : '#000' ) , fontWeight:(dateDifference < 0 ? 'bold' : 'regular')}}>{targetDate}</span></dd>
                            </dl>
                            {that.renderRequestDetailsButton(requestItem.key)}
                        </div>
                    </div>
                </div>
            );
        });

        return this.requestsRows;
    }

    renderRequestDetailsButton(requestKey) {
        var displayButton = false;

        if ( this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.voter.requests.show'] == true ) {
            displayButton = true;
        }

        if ( displayButton ) {
            return (
                <button type="button" className="btn btn-primary btnAddNew"
                        data-toggle=""
                        data-target=""
                        onClick={this.requestDetailsClick.bind(this, requestKey)}>
                    {this.detailsButtonText}
                </button>
            );
        }
    }

    renderNewRequestButton() {
        var displayButton = false;

        if ( this.props.currentUser.admin|| this.props.currentUser.permissions['elections.voter.requests.add'] == true ) {
            displayButton = true;
        }

        if ( displayButton ) {
            return (
                <button className="btn btn-primary mainBtn pull-left"
                        onClick={this.newRequestClick.bind(this)}>
                    <span className="glyphicon glyphicon-plus" aria-hidden="true"/>
                    {this.newRequestTitle}
                </button>
            );
        }
    }

    render() {

        this.initVariables();

        this.checkPermissions();

        this.checkPermissions();

        return (
            <div className={this.requestsBlockClass} id="tabInquiries" style={this.blockStyle}>
                <div className="tab-pane fade active in" role="tabpanel" id="home"
                     aria-labelledby="more-info">
                    <div className="containerStrip">
                        <div className="row panelTitle">
                            {this.panelTitle}
                            {this.renderNewRequestButton()}
                        </div>

                        <div className="row panelContent">
                            {this.renderRequests()}
                        </div>
                    </div>
                </div>

                <ModalWindow show={this.props.showRequestModalDialog}
                             buttonOk={this.closeModalDialog.bind(this)}
                             title={this.props.requestModalHeader} style={{zIndex: '9001'}}>
                    <div>{this.props.requestModalContent}</div>
                </ModalWindow>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        voterRequests: state.voters.voterScreen.requests,
        showRequestModalDialog: state.voters.voterScreen.showRequestModalDialog,
        requestModalHeader: state.voters.voterScreen.requestModalHeader,
        requestModalContent: state.voters.voterScreen.requestModalContent,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterRequests));