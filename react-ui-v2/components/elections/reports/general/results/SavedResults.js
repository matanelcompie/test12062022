import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import moment from 'moment';

import * as ElectionsActions from 'actions/ElectionsActions';
import constants from 'libs/constants';
import Pagination from 'components/global/Pagination';

class SavedResults extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
        this.reportType = constants.generalReportTypes.SAVED;
    }

    textIgniter() {
        this.labels = {
            back: 'חזור',
            number: 'מ"ס'
        }
    }

    renderHeaders() {
 
       let headers = [];
        headers.push(<th key='num'>מס'</th>);
        this.props.generalReport.savedReports.searchResultsColumns.map(option => {
            headers.push(
                <th key={option.name}>
                    {(option.sortNumber && option.sortDirection && option.sortNumber != '' && option.sortDirection != '') &&
                        <i className={'cursor-pointer icon-sort order-on' + (option.sortDirection == 'desc' ?' descending':'')}></i>
                    }
                    {option.label}
                </th>
            );
        });
        return headers;
    }

    renderResults() {
		 
        let currentPage = this.props.results.currentDisplayPaginationIndex[this.reportType];
		 
        let startIndex = (currentPage - 1) * this.props.results.displayItemsPerPage[this.reportType];
        let lastIndex = currentPage * this.props.results.displayItemsPerPage[this.reportType];
        this.releventResults = this.props.results.data[this.reportType].slice(startIndex, lastIndex);
        let columns = this.props.generalReport.savedReports.searchResultsColumns;
 
        return this.releventResults.map((item, i) => {
            let index = startIndex + i + 1;
			
            return <tr key={index}>
                <td>{index}</td>
                {columns.map(column =>
				 
                    <td key={column.name}>
                        {(column.name == 'personal_id') ?
                            <a target="_blank" href={this.props.router.location.basename + 'elections/voters/' + item.key}>{item[column.name]}</a> :
                            (
							(column.name == 'ballot_box_id') ? ((item[column.name]+'').substr(0,2) + '-'+(item[column.name]+'').substr(2)) :  
							  ((column.name == 'voter_answers_to_questionairs') ? 
							       item[column.name].map(function(item,index){
									   return <div  key={index} >
									              <div style={{fontWeight:'bold'}}>
												  {"שאלה : " + item.question}
												  </div>
												  <div>
												  {"תשובה : " + item.answer}
												  <br/><br/>
												  </div>
											  </div>
								   })
								   :  
								    (
									   (column.name == 'datetime')  ?  ((item[column.name].split(' ')[0]).split("-").reverse().join("/")  +' ' + item[column.name].split(' ')[1])
									      : 
										    (column.name == 'cap50_households_count')  ? (parseInt(item[column.name]) > 50 ? 0 : (50-parseInt(item[column.name])))  : item[column.name]
									)
								)
							)
                        }
                    </td>
					 
                )}
            </tr>
        });
		 
    }

    backToCombineReport() {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_CURRENT_DISPLAIED_REPORT_TYPE, reportType: constants.generalReportTypes.COMBINED });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.SET_SELECTED_COMBINE_ROW_DETAILES, detailesTitle: '', selectedValue: '' });
    }
	
	 

    render() {
		this.relevantResults = this.renderResults();	
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
                            {this.relevantResults}
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
             savedReports: state.elections.reportsScreen.generalReport.savedReports,
			 voterFilter: state.global.voterFilter['general_report'].vf,
             generalReport: state.elections.reportsScreen.generalReport,
			 results: state.elections.reportsScreen.generalReport.results,
    }
}

export default connect(mapStateToProps)(withRouter(SavedResults));