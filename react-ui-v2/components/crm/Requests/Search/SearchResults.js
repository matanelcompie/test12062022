import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import SearchResultsRow from './SearchResultsRow';
import * as CrmActions from '../../../../actions/CrmActions';

class SearchResults extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            number: '#',
            date: 'תאריך פניה',
            topic: 'נושא',
            subTopic: 'תת נושא',
            description: 'תיאור',
            priority: 'שם התושב',
            toRequestDate: 'יעד לסיום טיפול',
            handlerUser: 'עובד מטפל',
            handlerTeam: 'צוות מטפל',
            status: 'סטטוס',
            close_reason: 'סיבת הסגירה',
            voter_satisfaction: 'שביעות רצון',
        };
    }
    renderRows() {
    this.tableRows = this.props.searchResults
        .map(function (item) {
            return <SearchResultsRow key={item.requests_key} item={item}/>;
        }, this);
    }

    orderList(orderColumn) {
        this.props.dispatch({type: CrmActions.ActionTypes.SEARCH.ORDER_RESULTS, orderColumn});
    }

    setOrderDirection() {
        this.orderDirection = this.props.searchResults.length ? (this.props.isResultsOrderedAsc ? 'desc' : 'asc') : '';
    }
    
    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    getScrollHeaderStyle() {
        return this.props.tableHasScrollbar ? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
    }

    componentDidUpdate() {
        let hasScrollbar = false;

        if (undefined != this.self && null != this.self) {
            hasScrollbar = this.self.scrollHeight > this.self.clientHeight ? true : false;
        }

        if (hasScrollbar != this.props.tableHasScrollbar) {
            this.props.dispatch({type: CrmActions.ActionTypes.SEARCH.TABLE_CONTENT_UPDATED, hasScrollbar});
        }
    }

    render() {
        this.renderRows();
        this.setOrderDirection();

        return (
                <div className="dtlsBox clearfix" style={{ minHeight: '500px'}}>
                    <div className="row rsltsTitleRow">
                        <div className="col-md-12 rsltsTitle">
                            <table className="table table-bordered table-striped table-hover lists-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <span onClick={this.orderList.bind(this,'requests_key')} className="cursor-pointer">
                                                {this.textValues.number}
                                                <i className={this.props.resultsOrderColumn==='requests_key'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this,'request_date')} className="cursor-pointer">
                                                {this.textValues.date}
                                                <i className={this.props.resultsOrderColumn==='request_date'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this,'topic_name')} className="cursor-pointer">
                                                {this.textValues.topic}
                                                <i className={this.props.resultsOrderColumn==='topic_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this,'sub_topic_name')} className="cursor-pointer">
                                                {this.textValues.subTopic}
                                                <i className={this.props.resultsOrderColumn==='sub_topic_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this,'description')} className="cursor-pointer">
                                                {this.textValues.description}
                                                <i className={this.props.resultsOrderColumn==='description'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this,'request_priority_name')} className="cursor-pointer">
                                                {this.textValues.priority}
                                                <i className={this.props.resultsOrderColumn==='request_priority_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this,'target_close_date')} className="cursor-pointer">
                                                {this.textValues.toRequestDate}
                                                <i className={this.props.resultsOrderColumn==='target_close_date'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this,'user_handler')} className="cursor-pointer">
                                                {this.textValues.handlerUser}
                                                <i className={this.props.resultsOrderColumn==='user_handler'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this,'team_handler_name')} className="cursor-pointer">
                                                {this.textValues.handlerTeam}
                                                <i className={this.props.resultsOrderColumn==='team_handler_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th style={{borderLeft:'none'}}>
                                            <span onClick={this.orderList.bind(this,'request_status_name')} className="cursor-pointer">
                                                {this.textValues.status}
                                                <i className={this.props.resultsOrderColumn==='request_status_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this,'request_closure_reason_name')} className="cursor-pointer">
                                                {this.textValues.close_reason}
                                                <i className={this.props.resultsOrderColumn==='request_closure_reason_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th style={{borderLeft:'none'}}>
                                            <span onClick={this.orderList.bind(this,'request_satisfaction_name')} className="cursor-pointer">
                                                {this.textValues.voter_satisfaction}
                                                <i className={this.props.resultsOrderColumn==='request_satisfaction_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                            </span>                                    
                                        </th>
                                        <th style={this.getScrollHeaderStyle()}></th>
                                    </tr>
                                </thead>
                                <tbody ref={this.getRef.bind(this)} style={{height: '400px'}}>
                                    {this.tableRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        searchResults: state.crm.requestSearch.searchResults,
        resultsOrderColumn: state.crm.requestSearch.resultsOrderColumn,
        isResultsOrderedAsc: state.crm.requestSearch.isResultsOrderedAsc,
        tableHasScrollbar: state.crm.requestSearch.tableHasScrollbar,
        scrollbarWidth : state.system.scrollbarWidth,
    };
}
export default connect(mapStateToProps)(withRouter(SearchResults));
