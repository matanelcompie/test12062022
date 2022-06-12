import React from 'react';
import {withRouter, router} from 'react-router';
import {dateTimeReversePrint} from '../../../../libs/globalFunctions';
class SearchResultsRow extends React.Component {
    constructor(props) {
        super(props);
        this.descriptionStyle = {wordWrap: 'break-word'};
        this.closedRequestStatusTypes = ['סגור', 'מבוטל'];
        this.setDateStyle();
    }

    setDateStyle() {
        let targetDateFormatted = this.props.item.target_close_date.split('-');
        targetDateFormatted = new Date(targetDateFormatted[0], parseInt(targetDateFormatted[1]) - 1, targetDateFormatted[2]);
        let todaysDay = new Date();
        let dateDifference = (targetDateFormatted.getTime() - todaysDay.getTime());

        this.dateStyle = (dateDifference < 0 && this.closedRequestStatusTypes.indexOf(this.props.item.request_status_type) < 0) ?
                {color: '#ff0000', fontWeight: 'bold'} :
                {color: '#000', fontWeight: 'regular'};
    }

    openRequest() {
        this.props.router.push('/crm/requests/' + this.props.item.requests_key);
    }

    render() {
        const {item} = this.props;
        return (
                <tr>
                    <td><a className='cursor-pointer' onClick={this.openRequest.bind(this)}>{item.requests_key}</a></td>
                    <td>{dateTimeReversePrint(item.request_date, false)}</td>
                    <td>{item.topic_name}</td>
                    <td>{item.sub_topic_name}</td>
                    <td style={this.descriptionStyle}>{item.description}</td>
                    <td>{item.voter_name || item.unknown_voter_name}</td>
                    <td style={this.dateStyle}>{dateTimeReversePrint(item.target_close_date, false)}</td>
                    <td>{item.user_handler}</td>
                    <td>{item.team_handler_name}</td>
                    <td>{item.request_status_name}</td>
                    <td>{item.request_closure_reason_name}</td>
                    <td>{item.request_satisfaction_name}</td>
                </tr>
                );
    }
}

export default withRouter(SearchResultsRow);
