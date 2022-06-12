import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import * as VoterActions from '../actions/VoterActions';
import * as CrmActions from '../actions/CrmActions';
import * as GlobalActions from '../actions/GlobalActions';
import * as SystemActions from '../actions/SystemActions';

class HeaderSearchItem extends React.Component {

    setDisplayText() {
        let displayText = <tr></tr>;
        if (this.props.searchType == 'voter') {
            displayText = <tr onClick={this.gotoTarget.bind(this)}>
                <td><a href={"/elections/voters/" + this.props.item.key}> {this.props.item.personal_identity} </a></td>
                <td><a href={"/elections/voters/" + this.props.item.key}>{this.props.item.first_name + " " + this.props.item.last_name} </a></td>
                <td><a href={"/elections/voters/" + this.props.item.key}>&nbsp;{this.props.item.city} </a></td>
                {(this.props.item.user_count>0) && <td><i className="fa fa-user" title="משתמש במערכת"></i></td>}
                {(this.props.item.crm_requests_count>0) && <td><i className="fa fa-ticket" title="קיים פניה לתושב"></i></td>}
                {(this.props.item.get_representative_details_count>0) && <td><i className="fa fa-users" title="נציג שס"></i></td>}
            </tr>;
        } else {
            displayText = <tr onClick={this.gotoTarget.bind(this)}>
                <td > <a href={"/elections/voters/" + this.props.item.key}>{this.props.item.key} </a></td>
                <td > <a href={"/elections/voters/" + this.props.item.key}>&nbsp;{this.props.item.topic_name} </a></td>
                <td > <a href={"/elections/voters/" + this.props.item.key}>{(this.props.item.voter_name || this.props.item.unknown_voter_name)} </a></td>
            </tr>;
        }
        return displayText;
    }

    gotoTarget(e) {
        e.preventDefault();
        var baseUrl = ((this.props.searchType == 'voter') ? "/elections/voters/" : "/crm/requests/");
        this.props.router.push(baseUrl + this.props.item.key);
        this.props.dispatch({ type: SystemActions.ActionTypes.HEADER.CLEAR_SEARCH });
        if (this.props.searchType == 'request') {
            CrmActions.getRequestByKey(this.props.dispatch, this.props.router, this.props.router.params.reqKey);
            CrmActions.getRequestActionByRequestKey(this.props.dispatch, this.props.router.params.reqKey);
            CrmActions.getRequestHistoryByRequestKey(this.props.dispatch, this.props.router.params.reqKey);
            CrmActions.getRequestCallBizByRequestKey(this.props.dispatch, this.props.router.params.reqKey);
            GlobalActions.getEntityDocuments(this.props.dispatch, 1, this.props.router.params.reqKey);
            GlobalActions.getEntityMessages(this.props.dispatch, this.props.router, 1, this.props.router.params.reqKey);
        }
    }

    render() {
        return (
            this.setDisplayText()
        );
    }
}

export default connect()(withRouter(HeaderSearchItem))