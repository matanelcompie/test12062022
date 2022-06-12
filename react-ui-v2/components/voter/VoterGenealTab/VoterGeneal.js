import React from 'react';
import { connect } from 'react-redux';

import * as VoterActions from '../../../actions/VoterActions';


class VoterGeneal extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.itemTitles = {
            requests: 'פניות',
            documents: 'מסמכים מצורפים',
            polls: 'סקרים בהשתתפות',
            votes: 'כמות ההצבעות',
            messages: 'הודעות',
            actions: 'פעולות'
        };

        this.itemLinkTitles = {
            requests: 'לפניות',
            documents: 'למסמכים מצורפים',
            polls: 'לסקרים בהשתתפות',
            votes: 'לכמות ההצבעות',
            messages: 'להודעות',
            actions: 'לפעולות'
        };

        this.tabRequests = {
            name: 'requests'
        };

        this.tabDocuments = {
            name: 'documents'
        };

        this.tabActions = {
            name: 'actions'
        };

        this.tabMessages = {
            name: 'messages'
        };
    }

    /**
     * This function is triggered by event
     * of clicking tab in the top lists screen.
     *
     * @param string tabName - The clicked tab's name
     */
    tabClick(tabName) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE,
                             voterTab: tabName
        });
    }

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }

        this.generalBlockClass = "tab-content tabContnt hidden";

        this.requestsClass = "col-sm-3 hidden";
        this.documentsClass = "col-sm-3 hidden";
        this.actionsClass = "col-sm-3 hidden";
        this.messagesClass = "col-sm-3 hidden";
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.generalBlockClass = "tab-content tabContnt";

            this.requestsClass = "col-sm-3";
            this.documentsClass = "col-sm-3";
            this.actionsClass = "col-sm-3";
            this.messagesClass = "col-sm-3";

            return;
        }

        if (this.props.currentUser.permissions['elections.voter.general'] == true) {
            this.generalBlockClass = "tab-content tabContnt";
        }

        if (this.props.currentUser.permissions['elections.voter.requests'] == true) {
            this.requestsClass = "col-sm-3";
        }

        if (this.props.currentUser.permissions['elections.voter.documents'] == true) {
            this.documentsClass = "col-sm-3";
        }

        if (this.props.currentUser.permissions['elections.voter.actions'] == true) {
            this.actionsClass = "col-sm-3";
        }

        if (this.props.currentUser.permissions['elections.voter.messages'] == true) {
            this.messagesClass = "col-sm-3";
        }
    }

    render() {

        this.initVariables();

        this.checkPermissions();

        return (
            <div className={this.generalBlockClass} id="tabGeneral" style={this.blockStyle}>
                <div className="tab-pane fade active in" role="tabpanel" id="home"
                     aria-labelledby="more-info">
                    <div className="containerStrip genealTabStrip">
                        <div className="row">
                            <div className={this.requestsClass}>
                                <a href="#" title={this.itemLinkTitles.requests}
                                   onClick={this.tabClick.bind(this, this.tabRequests.name)}>
                                    <div className="generalItem">
                                        <div className="itemCounter">{this.props.numOfRequests}</div>
                                        <div className="itemTitle">{this.itemTitles.requests}</div>
                                    </div>
                                </a>
                            </div>

                            <div className={this.actionsClass}>
                                <a href="#" title={this.itemLinkTitles.actions}
                                   onClick={this.tabClick.bind(this, this.tabActions.name)}>
                                    <div className="generalItem">
                                        <div className="itemCounter">{this.props.numOfActions}</div>
                                        <div className="itemTitle">{this.itemTitles.actions}</div>
                                    </div>
                                </a>
                            </div>

                            <div className={this.documentsClass}>
                                <a href="#" title={this.itemLinkTitles.documents}
                                   onClick={this.tabClick.bind(this, this.tabDocuments.name)}>
                                    <div className="generalItem">
                                        <div className="itemCounter">{this.props.numOfDocuments}</div>
                                        <div className="itemTitle">{this.itemTitles.documents}</div>
                                    </div>
                                </a>
                            </div>

                            <div className={this.messagesClass}>
                                <a href="#" title={this.itemLinkTitles.messages}
                                   onClick={this.tabClick.bind(this, this.tabMessages.name)}>
                                    <div className="generalItem">
                                        <div className="itemCounter">{this.props.numOfMessages}</div>
                                        <div className="itemTitle">{this.itemTitles.messages}</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect()(VoterGeneal);