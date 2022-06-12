import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import moment from 'moment';
import constants from '../../libs/constants';

import * as SystemActions from '../../actions/SystemActions';

class ResultsBody extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
        this.styleIgniter();
    }

    componentDidUpdate() {
        //update the unread requests count for the current display group ..
        this.props.dispatch({ type: SystemActions.ActionTypes.USER_HOME.UPDATE_UNREAD_REQUESTS_COUNT, unreadRequestsCount: this.unreadRequestsCount });
    }

    textIgniter() {
        this.tableTitles = {
            reqKey: '',
            descriptionTitle: 'תיאור הפנייה',
            requestDetails: 'פרטי הפנייה'
        };

        this.tooltip = {
            itemOpenedByMe: 'קראתי את הפניה',
            itemNotOpenedByMe: 'לא קראתי את הפניה',
            itemOpenedByOther: 'משתמש אחר קרא את הפניה',
            itemNotOpenedByOther: 'משתמש אחר לא קרא את הפניה'
        }
    }

    styleIgniter() {
        this.targetDatePassed = {
            color: 'red'
        };
    }

    goToLink(link, e) {
        e.preventDefault();
        e.stopPropagation();
        this.props.router.push(link);
    }

    toggleRequestOpen(requestKey, e) {
        e.preventDefault();
        e.stopPropagation();
        this.props.dispatch({ type: SystemActions.ActionTypes.USER_HOME.OPEN_REQUEST, requestKey });
    }

    getTooltip(item, handleByMe) {
        if ((item.opened) && (handleByMe)) return this.tooltip.itemOpenedByMe;
        if ((item.opened) && (!handleByMe)) return this.tooltip.itemOpenedByOther;
        if ((!item.opened) && (handleByMe)) return this.tooltip.itemNotOpenedByMe;
        return this.tooltip.itemNotOpenedByOther;
    }

    getTargetDateStyle(targetCloseDate, displayGroups) {
        if (displayGroups.indexOf('closed') != -1) return {};
        if (moment().diff(targetCloseDate) > 0) return this.targetDatePassed;
    }

    renderRequestInfo(item, goToRequest, handleByMe) {

        let isOpen = this.props.openRequests[item.req_key] ? true : false;
        let requestUrl = 'crm/requests/' + item.req_key;
        return (
            <tr key={item.req_key} onClick={this.toggleRequestOpen.bind(this, item.req_key)} className="cursor-pointer">
                <td><a className="collapsed" data-toggle="collapse" aria-expanded={isOpen ? "true" : "false"}
                    onClick={this.toggleRequestOpen.bind(this, item.req_key)}>
                    <div className="collapseToggle closed"></div>
                    <div className="collapseToggle open"></div>
                </a></td>
                <td><div className={"inqryPenddingIcon" + (item.opened ? ' viewed' : '')}
                    title={this.getTooltip(item, handleByMe)}></div></td>
                <td>
                    {goToRequest && <a href={this.props.router.location.basename + requestUrl} title={this.tableTitles.reqKey}
                        onClick={this.goToLink.bind(this, requestUrl)}>{item.req_key}</a>}
                    {!goToRequest && <span>{item.req_key}</span>}
                </td>
                <td>{item.topic_name}</td>
                <td>{item.sub_topic_name}</td>
                <td>{item.voter_name}</td>
                <td>{moment(item.date).format('DD/MM/YYYY')}</td>
                <td style={this.getTargetDateStyle(item.target_close_date, item.displayGroups)}>{moment(item.target_close_date).format('DD/MM/YYYY')}</td>
                <td>{item.status_name}</td>
            </tr>
        );

    }
    renderRequestBody(item, goToRequest) {
        let isOpen = this.props.openRequests[item.req_key] ? true : false;
        let requestUrl = 'crm/requests/' + item.req_key;
        return (
            <tr key={item.req_key + 'Body'} className={"tableExpandRow accordian-body" + (isOpen ? "" : " collapse")} aria-expanded={isOpen ? "true" : "false"} >
                <td colSpan="2"><div className="tdTitle">{this.tableTitles.descriptionTitle}</div></td>
                <td colSpan="6" className="tdText"><div>{item.actions_description}</div></td>
                <td colSpan="1" className="tdAlign">
                    {goToRequest &&
                        <a href={this.props.router.location.basename + requestUrl} className="btn btn-primary showMoreBTN"
                            onClick={this.goToLink.bind(this, requestUrl)}>{this.tableTitles.requestDetails}</a>}
                </td>
            </tr>
        );
    }

    renderRows() {
        let rows = [], unreadRequestsCount = 0;
        const goToRequest = ((this.props.currentUser.admin) || (this.props.currentUser.permissions['home.goto_request']));//if user has permission to visit the request
    
		this.props.requests.map(function (item) {
            if (item.displayGroups.indexOf('IPassedOver') > -1) {
                if (this.props.displayTarget == 'IPassedOver') {
                    rows.push(this.renderRequestInfo(item, goToRequest, false));
                    rows.push(this.renderRequestBody(item, goToRequest));
                    unreadRequestsCount += ((item.opened) ? 0 : 1);
                }
            } else {
                if (item.displayGroups.indexOf(this.props.displayTarget) > -1) {
                    rows.push(this.renderRequestInfo(item, goToRequest, true));
                    rows.push(this.renderRequestBody(item, goToRequest));
                    unreadRequestsCount += (((item.displayGroups.indexOf('IPassedOver') == -1) && item.opened) ? 0 : 1);
                }
            }
        }, this);

        this.unreadRequestsCount = unreadRequestsCount;
        this.rows = rows;
    }

    render() {
        this.renderRows();
        return (
            <tbody>
                {this.props.loadedCrmRequests ? (this.rows.length > 0 ? this.rows : (<tr><td colSpan="9" style={{textAlign:'center'}}>לא קיימות פניות</td></tr>)) : (<tr><td colSpan="9" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin" style={{marginTop: 5 , fontSize:'19px'}}/></td></tr>)}
            </tbody>
        );
    }
}


export default connect()(withRouter(ResultsBody));