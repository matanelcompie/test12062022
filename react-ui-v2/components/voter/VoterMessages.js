import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import * as GlobalActions from '../../actions/GlobalActions';
import Messages from '../global/Messages';
import ModalWindow from '../global/ModalWindow';

class VoterMessages extends React.Component {

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }

        this.tableHeaders = {
            number: 'סוג הודעה',
            date: 'תאריך',
            direction: 'כיוון',
            voter_communication_details: 'פרטי תקשורת',
			request: 'פנייה',
            subject: 'נושא',
            content: 'תוכן',
        }

        this.panelTitle = "הודעות";
    }

    closeGlobalDialog(e) {
        this.props.dispatch({type: GlobalActions.ActionTypes.MESSAGES.CLOSE_GLOBAL_DIALOG});
    }

    render() {
        this.initVariables();
        return (
                <div className="tab-content tabContnt" style={this.blockStyle}>
                    <div className="CollapseContent">
                        <div className="row panelTitle" style={{marginBottom: '15px'}}>{this.panelTitle}</div>

                        <table className='table table-bordered table-striped table-hover lists-table'>
                            <thead>
                                <tr>
                                    <th style={{width:'100px'}}>{this.tableHeaders.number}</th>
                                    <th>{this.tableHeaders.date}</th>
                                    <th>{this.tableHeaders.direction}</th>
                                    <th>{this.tableHeaders.voter_communication_details}</th>
									<th>{this.tableHeaders.request}</th>
                                    <th>{this.tableHeaders.subject}</th>
                                    <th>{this.tableHeaders.content}</th>
                                </tr>
                            </thead>
                            <Messages list={this.props.messagesList} showRequestLink={true} messageContentShow={((this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.voter.messages.content.show']))?true:false}/>
                        </table>        
                    </div>
                    <ModalWindow show={this.props.showGlobalDialog && ((this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.voter.messages.content.show']))} buttonOk={this.closeGlobalDialog.bind(this)} title={this.props.globalHeaderText} style={{zIndex: '9001'}}>
                        <div dangerouslySetInnerHTML={{__html: this.props.globalContentText}}></div>
                    </ModalWindow>
                </div>
                        );
            }
        }

        function mapStateToProps(state) {
            return {
                messagesList: state.global.messages_screen.messagesList,
                globalHeaderText: state.global.globalHeaderText,
                globalContentText: state.global.globalContentText,
                showGlobalDialog: state.global.showGlobalDialog,
                currentUser: state.system.currentUser
            }
        }

        export default connect(mapStateToProps)(withRouter(VoterMessages));