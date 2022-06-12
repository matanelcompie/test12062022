import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import moment from 'moment';

import * as ElectionsActions from 'actions/ElectionsActions';
import constants from 'libs/constants';
import Pagination from 'components/global/Pagination';

class DetailedResults extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
        this.reportType = constants.generalReportTypes.DETAILED;
    }

    textIgniter() {
        this.labels = {
            back: 'חזור',
            number: 'מ"ס'
        }
    }

    renderHeaders() {
        let headers = [];
        headers.push(<th key='num'>{this.labels.number}</th>);
        _.orderBy(this.props.selectedDetailColumns, 'displayOrder').map(option => {
            let label = option.label;

            headers.push(
                <th key={option.name}>
                    {(option.sortNumber != '' && option.sortDirection != '') &&
                        <i className={'cursor-pointer icon-sort order-on' + (option.sortDirection == 'desc' ?' descending':'')}></i>
                    }
                    {label}
                </th>
            );
        });
        return headers;
    }

    getBallotMiId(ballotMiId) {
        var miIdStr = ballotMiId.toString();
        var lastDigit = miIdStr.charAt(miIdStr.length - 1);

        return miIdStr;
    }

    renderColumnByName(item, columnName) {
        let optionName = columnName;
        if ( optionName.includes('previous_election_ballot_box_mi_id') ) {
            optionName = 'previous_election_ballot_box_mi_id';
        }

        switch (optionName) {
            case 'personal_id':
            case 'voter_key':
                return <a target="_blank" href={this.props.router.location.basename + 'elections/voters/' + item.key}>{item[columnName]}</a>;
                break;

            case 'current_election_ballot_box_id':
            case 'previous_election_ballot_box_mi_id':
                if ( item[columnName] == undefined || item[columnName] == ''  ) {
                    return '\u00A0';
                } else {
                    return this.getBallotMiId(item[columnName]);
                }
                break;

            default:
                return item[columnName];
                break;
        }
    }

    renderResults() {
        let currentPage = this.props.results.currentDisplayPaginationIndex[this.reportType];
        let startIndex = (currentPage - 1) * this.props.results.displayItemsPerPage[this.reportType];
        let lastIndex = currentPage * this.props.results.displayItemsPerPage[this.reportType];
        let releventResults = this.props.results.data[this.reportType].slice(startIndex, lastIndex);
        let columns = _.orderBy(this.props.selectedDetailColumns, 'displayOrder');

        return releventResults.map((item, i) => {
            let index = startIndex + i + 1;
            return <tr key={index}>
                <td>{index}</td>
                {columns.map(column =>
                    <td key={column.name}>{this.renderColumnByName(item, column.name)}</td>
                )}
            </tr>
        });
    }

    backToCombineReport() {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_CURRENT_DISPLAIED_REPORT_TYPE, reportType: constants.generalReportTypes.COMBINED });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.SET_SELECTED_COMBINE_ROW_DETAILES, detailesTitle: '', selectedValue: '' });
    }

    render() {
        return (
            <div className="results">
                <div className="table-responsive">
                    {this.props.results.combineRowDetailesTitle && <div className="title-row">
                        <a title={this.labels.back} onClick={this.backToCombineReport.bind(this)} className='cursor-pointer'>
                            <span className="icon arrow-turquoise opacity-over item-space"></span>
                        </a>
                        <div className="title-text">{this.props.results.combineRowDetailesTitle}</div>
                    </div>}
                    <table className="table table-striped tableTight table-fixed">
                        <thead>
                            <tr>
                                {this.renderHeaders()}
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderResults()}
                        </tbody>
                    </table>
                </div>
                <div className="row">
                    <div className="col-md-3">
                        {this.props.children}
                    </div>
                    <div className="col-md-6">
                        <Pagination
                            resultsCount={this.props.results.resultsCount[this.reportType]}
                            displayItemsPerPage={this.props.results.displayItemsPerPage[this.reportType]}
                            currentPage={this.props.results.currentDisplayPaginationIndex[this.reportType]}
                            navigateToPage={this.props.navigateToPage.bind(this, this.reportType)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {

    }
}

export default connect(mapStateToProps)(withRouter(DetailedResults));