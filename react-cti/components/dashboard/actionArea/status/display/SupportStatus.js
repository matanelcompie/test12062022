import React from 'react';
import { connect } from 'react-redux';

import * as callActions from '../../../../../actions/callActions';
import { getCtiPermission } from '../../../../../libs/globalFunctions';

class SupportStatus extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // This variable points to the li
            // of the support status tm  that
            // the mouse is over
            statusTmOver: null
        };

        this.initConstants();
    }

    initConstants() {
        this.sectionTitle = 'סטטוסים';

        this.titles = {
            tm: 'סטטוס TM',
            final: 'סטטוס סניף'
        };
    }

    supportStatusTmChange(supportStatusTm) {
        callActions.updateVoterSupportStatusTm(this.props.dispatch, supportStatusTm);
    }

    /**
     * This function resets the pointer
     * when mouse is out of the li of the
     * support status tm.
     */
    mouseOutAction() {
        this.setState({ statusTmOver: null });
    }

    /**
     * This function updates the pointer
     * of the li of the support status tm
     * that the mouse is over it.
     *
     * @param supportStatusTm
     */
    mouseOverAction(supportStatusTm) {
        // The li css of current value support status tm
        // should not be changed
        if (supportStatusTm != this.props.support_status_tm) {
            this.setState({ statusTmOver: supportStatusTm });
        }
    }

    /**
     * This function renders all
     * the supoort statuse
     * in the tm status column.
     *
     * @returns {XML}
     */
    renderTmStatuses() {
        let statusTmPermissionDisplay = getCtiPermission(this.props.permissions, 'support_status_tm');
        let statusTmPermissionEdit = getCtiPermission(this.props.permissions, 'support_status_tm', true);

        if (!statusTmPermissionDisplay) {
            return (<div></div>);
        }

        let that = this;
        let supportStatusTm = this.props.support_status_tm;

        let lists = this.props.support_statuses.map(function (statusItem, index) {
            let className = "";

            let statusOverStyle = {};

            if (statusItem.value == supportStatusTm) {
                className = "support-status__active-status";

                statusOverStyle = {};
            } else {
                className = "support-status__non-active-status";

                // Change the background of the li which the mouse
                // is over it.
                if (statusItem.value == that.state.statusTmOver) {
                    statusOverStyle = {
                        backgroundColor: '#e9e9e9'
                    };
                }
            }
            if (statusTmPermissionEdit) {
                var listItem = <li key={index} className={className} style={statusOverStyle}
                    onClick={that.supportStatusTmChange.bind(that, statusItem.value)}
                    onMouseOver={that.mouseOverAction.bind(that, statusItem.value)}
                    onMouseOut={that.mouseOutAction.bind(that)}>
                    <div className="support-status__tm-status-name">{statusItem.label}</div>
                </li>

            } else {
                var listItem = <li key={index} className={className} style={statusOverStyle}>
                    <div className="support-status__tm-status-name">{statusItem.label}</div>
                </li>
            }
            return listItem;
        });

        return (
            <div>
                <div className="support-status__column-tm-title">{this.titles.tm}</div>
                <div className="support-status__column-tm-status">
                    <ul>
                        {lists}
                    </ul>
                </div>
            </div>
        );

    }

    /**
     * This function returns the final
     * status name according to final
     * status id.
     */
    getFinalStatus() {
        let supportIndex = -1;
        let support_statuses = this.props.support_statuses
        supportIndex = support_statuses.findIndex(statusItem => statusItem.value == this.props.support_status_final);

        return support_statuses[supportIndex] ? support_statuses[supportIndex].label: null;
    }

    /**
     * This function renders the
     * final status column.
     *
     * @returns {XML}
     */
    renderFinalStatus(finalBoxStyle) {
        if (this.props.support_status_final == null || this.props.support_status_final == '') {
            return '\u00A0';
        } else {
            return (
                <div className="support-status__column-final-status">
                    <div className="support-status__final-status-header">{this.titles.final}</div>
                    <div className="support-status__final-status-box" style={finalBoxStyle}>
                        <div className="support-status__final-status-name">{this.getFinalStatus()}</div>
                    </div>
                </div>
            );
        }
    }

    render() {
        let finalBoxStyle = {};

        if (this.props.support_status_final == null || this.props.support_status_final == '') {
            finalBoxStyle = {
                display: 'none'
            };
        }
        let statusElectionsPermission = getCtiPermission(this.props.permissions, 'support_status_elections');
        return (
            <div className="action-content support-status">
                <div className="support-status__header">{this.sectionTitle}</div>

                <div className="support-status__data-row">
                    {this.renderTmStatuses()}
                    {statusElectionsPermission && this.renderFinalStatus(finalBoxStyle)}
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        support_statuses: state.system.lists.support_statuses,
        support_status_tm: state.call.activeCall.voter.support_status_tm,
        support_status_final: state.call.activeCall.voter.support_status_final
    }
}

export default connect(mapStateToProps)(SupportStatus);