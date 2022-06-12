import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import NewReportTab from './NewReportTab'
import SavedReportTab from './SavedReportTab'
import * as ElectionsActions from 'actions/ElectionsActions';


class Summary extends React.Component {
    constructor(props) {
        super(props);
        this.tabs = {
            NEW: 'new',
            SAVED: 'saved'
        };
        //this.state = { activeTab: this.tabs.NEW };
        this.textIgniter();
    }

    textIgniter() {
        this.labels = {
            newReport: 'דוח חדש',
            savedReport: 'דוח שמור'
        };
    }

    changeActiveTab(activeTab) {
	   this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.SET_GENERAL_REPORT_VALUE , fieldName:'activeTab' , fieldValue:activeTab});
    }
	

	 


    render() {
			 
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="containerTabs">
                        <ul className="nav nav-tabs tabsRow" role="tablist">
                            <li className={"cursor-pointer" + (this.props.generalReport.activeTab == this.tabs.NEW ? " active" : "")}>
                                <a onClick={this.changeActiveTab.bind(this, this.tabs.NEW)}>{this.labels.newReport}</a>
                            </li>
                            <li className={"cursor-pointer" + (this.props.generalReport.activeTab == this.tabs.SAVED ? " active" : "")}>
                                <a onClick={this.changeActiveTab.bind(this, this.tabs.SAVED)}>{this.labels.savedReport}</a>
                            </li>
                        </ul>
                    </div>
                    <div className="tab-content tabContnt">
                        {(this.props.generalReport.activeTab == this.tabs.NEW) &&
                            <NewReportTab
                                loadResults={this.props.loadResults}
                            />}
                        {(this.props.generalReport.activeTab == this.tabs.SAVED) &&
                            <SavedReportTab  />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        voterFilter: state.global.voterFilter['general_report'].vf,
        generalReport: state.elections.reportsScreen.generalReport,
        currentUser: state.system.currentUser,
    }
}

export default connect(mapStateToProps)(withRouter(Summary));