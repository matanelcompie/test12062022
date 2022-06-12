import React from 'react';

class VotingReportHistory extends React.Component {

    renderVotingReportHistoryRows() {
        let self = this;
        let votingReportHistoryRows = this.props.votingReportHistoryList.map(function (item, index) {
            return (
                <tr key={index}>
                    <td><a onClick={self.props.cancelVoteToVoter.bind(this, item.voter_key, item.voter_serial_number)}>
                        <img className="img-responsive" style={{ cursor: 'pointer', paddingTop: '2px' }} 
                            src={window.Laravel.baseURL + 'Images/delete-report-icon.png'} />
                    </a></td>
                    <td>{item.voter_serial_number}</td>
                    <td>{item.first_name + ' ' + item.last_name}</td>
                </tr>
            )
        });
        return votingReportHistoryRows;
    }

    render() {
        let displayStyle = (this.props.votingReportHistoryList.length > 0) ? {} : { display: 'none' };

        return (
            <div className="col-xs-12">
                <div className="row" style={displayStyle}>
                    <div className="col-xs-12">
                        <hr />
                        <h4 className="text-primary">רשימת דיווחים אחרונים:</h4>
                        <table className="table table-borderless table-striped">
                            <tbody>
                                {this.renderVotingReportHistoryRows()}
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        );
    }
}

export default VotingReportHistory;