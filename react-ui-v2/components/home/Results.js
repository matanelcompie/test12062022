import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import ResultsBody from './ResultsBody';
import * as SystemActions from '../../actions/SystemActions';

class Component extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.tableTitles = {
            number: "מס' פניה",
            topic: 'נושא',
            subTopic: 'תת נושא',
            voter: 'תושב',
            openDate: 'ת. פתיחה',
            targetCloseDate: 'ת. יעד לסיום',
            status: 'סטטוס'
        };

        this.tooltip = {
            readItems: 'כמות פניות שלא נקראו'
        }
    }

    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.USER_HOME.ORDER_RESULTS, orderColumn});
    }

    columnOrderClass(columnName) {
        return (this.props.orderColumn === columnName ? ('fa fa-1x fa-sort-' + (this.props.isOrderedAsc ? 'asc' : 'desc')) : '');
    }

    render() {
	 
        return (
                <div className="resultsArea">
                    <div className="row rsltsTitleRow hidden">
                        <div className="col-sm-8 rsltsTitle">
                            <h3 className="noBgTitle">נמצאו <span className="rsltsCounter">21</span> רשומות</h3>
                        </div>
                    </div>
                    <div className="row nopaddingR nopaddingL">
                        <div className="col-sm-12">
                            <div className="dtlsBox srchRsltsBox">
                                <div className="table-responsive">
                                    <table className="table table-striped tableNoMarginB tableTight">
                                        <thead>
                                            <tr>
                                                <th width="5%"></th>
                                                <th width="5%">
                                                    <span className={"label label-info" + ((this.props.loadedCrmRequests && this.props.unreadRequestsCount) > 0 ? '' : ' hidden')}
                                                            title={this.tooltip.readItems}>
                                                        {this.props.unreadRequestsCount}
                                                    </span>
                                                </th>
                                                <th width="10%">{this.tableTitles.number}</th>
                                                <th width="16%">
                                                    <span className="cursor-pointer" onClick={this.orderList.bind(this, 'topic_name')}>{this.tableTitles.topic}</span>&nbsp;
                                                    <i className={this.columnOrderClass('topic_name')}></i>
                                                </th>
                                                <th width="16%">
                                                    <span className="cursor-pointer" onClick={this.orderList.bind(this, 'sub_topic_name')}>{this.tableTitles.subTopic}</span>&nbsp;
                                                    <i className={this.columnOrderClass('sub_topic_name')}></i>
                                                </th>
                                                <th width="14%">
                                                    <span className="cursor-pointer" onClick={this.orderList.bind(this, 'voter_name')}>{this.tableTitles.voter}</span>&nbsp;
                                                    <i className={this.columnOrderClass('voter_name')}></i>
                                                </th>
                                                <th width="10%">
                                                    <span className="cursor-pointer" onClick={this.orderList.bind(this, 'date')}>{this.tableTitles.openDate}</span>&nbsp;
                                                    <i className={this.columnOrderClass('date')}></i>
                                                </th>
                                                <th width="10%">
                                                    <span className="cursor-pointer" onClick={this.orderList.bind(this, 'target_close_date')}>{this.tableTitles.targetCloseDate}</span>&nbsp;
                                                    <i className={this.columnOrderClass('target_close_date')}></i>
                                                </th>
                                                <th width="11%">
                                                    <span className="cursor-pointer" onClick={this.orderList.bind(this, 'status_name')}>{this.tableTitles.status}</span>&nbsp;
                                                    <i className={this.columnOrderClass('status_name')}></i>
                                                </th>
                                            </tr>
                                        </thead>
                                        <ResultsBody loadedCrmRequests={this.props.loadedCrmRequests} displayTarget={this.props.summaryDisplayTarget} requests={this.props.summaryData} 
                                            openRequests={this.props.openRequests} currentUser={this.props.currentUser}/>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        summaryData: state.system.crmHomeScreen.summaryData,
        summaryDisplayTarget: state.system.crmHomeScreen.summaryDisplayTarget,
        unreadRequestsCount: state.system.crmHomeScreen.unreadRequestsCount,
        isOrderedAsc: state.system.crmHomeScreen.isOrderedAsc,
        orderColumn: state.system.crmHomeScreen.orderColumn,
        openRequests: state.system.crmHomeScreen.openRequests,
        currentUser: state.system.currentUser,
    };
}

export default connect(mapStateToProps)(withRouter(Component));