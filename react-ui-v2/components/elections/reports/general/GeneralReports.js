import React from 'react';
import { connect } from 'react-redux';
import Collapse from 'react-collapse';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import * as VoterFilterActions from 'actions/VoterFilterActions';
import * as GlobalActions from 'actions/GlobalActions';

import SlimVoterFilter from 'components/global/voterFilter/SlimVoterFilter';
import Summary from './summary/Summary';
import Results from './results/Results';
import constants from 'libs/constants';

class GeneralReports extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.isPermissionsLoaded = false;
        this.moduleType = 'general_report';
    }

    componentDidUpdate() {
        this.loadScreen();
    }
	
	componentWillMount(){
		ElectionsActions.loadSavedReportsNames(this.props.dispatch);
		ElectionsActions.loadAllQuestionaires(this.props.dispatch);
        ElectionsActions.loadSupportStatusesForGeneralReport(this.props.dispatch);
	}

    componentDidMount() {
        //set default selected columns for detailed report
        ElectionsActions.loadElectionCampaigns(this.props.dispatch);
        this.loadScreen();
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'דוח נתונים כללי' });
        this.resetReport();
    }

    resetReport(){
        this.props.dispatch({ type: VoterFilterActions.types.LOAD_VOTER_FILTER, voterFilter: {filter_items: [], geo_items: []}, moduleType: this.moduleType });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.RESET_REPORT_RESULTS, reportType: constants.generalReportTypes.COMBINED });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.RESET_REPORT_RESULTS, reportType: constants.generalReportTypes.DETAILED });
    }
	
	// expand/shrink all voter filter group definitions by parameter - expandAll - true of false:
	expandShrinkAllGroups(expandAll){
		this.props.dispatch({type:GlobalActions.ActionTypes.VOTER_FILTER.EXPAND_SHRINK_ALL_DEFINITION_GROUPS , isExpandAll:expandAll , moduleType:this.moduleType });

        this.props.dispatch({type: GlobalActions.ActionTypes.VOTER_FILTER.GEOGRAPHIC_FILTER.CHANGE_GROUP_EXPANDED_FLAG, flag: expandAll});
	}

    loadScreen() {
        if (this.props.currentUser.first_name.length && !this.isPermissionsLoaded) {
            this.isPermissionsLoaded = true;
            if (!((this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.reports.general']))) {
                this.props.router.replace('/unauthorized');
            }
        }
    }

    toggleActiveTab() {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.TOGGLE_FILTERS_COLLAPSE });
    }

    render() {
        return (
            <div className={"general-report" + (((this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.reports.general'])) ? '' : ' hidden')}>
                <h1>דוח נתונים כללי</h1>
				<div className="voter-filter Basic-box-bg">
                    <div className="panelCollapse">
                        <a aria-expanded={this.props.generalReport.isFiltersExpanded ? "true" : "false"}
                            onClick={this.toggleActiveTab.bind(this)} className="cursor-pointer" data-toggle="collapse">
                            <div className="collapseArrow closed"></div>
                            <div className="collapseArrow open"></div>
                            <span className="collapseTitle">מסננים</span>
                        </a>
                    </div>
                    <div style={{ display: this.props.generalReport.isFiltersExpanded ? '' : 'none' }}>
                        <SlimVoterFilter
                            moduleType={this.moduleType}
                            voterFilter={this.props.voterFilter}
                            resetReport={this.resetReport.bind(this)}
							expandShrinkAllGroups={this.expandShrinkAllGroups.bind(this)}
                        />
                    </div>
                </div>
                <Summary
                    voterFilter={this.props.voterFilter}
                />
                <Results
                    voterFilter={this.props.voterFilter}
                />
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        voterFilter: state.global.voterFilter['general_report'].vf,
        generalReport: state.elections.reportsScreen.generalReport,
        currentUser: state.system.currentUser,
    };
}

export default connect(mapStateToProps)(GeneralReports);