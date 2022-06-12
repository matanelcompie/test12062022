import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from 'actions/ElectionsActions';
import ColumnsDisplayOptions from './ColumnsDisplayOptions';
import Combo from 'components/global/Combo';
import constants from 'libs/constants';
import options from './options';

class NewReportTab extends React.Component {

    constructor(props) {
        super(props);

        this.textIgniter();
        this.state = { columnsDisplayOptionsVilsable: false };
    }

    componentWillMount() {
        //set default values
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_COMBINE_OPTIONS_VALUE, key: 'combineBy', value: options.combineBy[0] });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_COMBINE_OPTIONS_VALUE, key: 'combineColumns', value: options.combineColumns[0] });

        this.defaultCombineColumns = { ...options.combineColumns[0] };
        this.setState({
            combineByValue: options.combineBy[0].label,
            combineColumnsValue: this.defaultCombineColumns.label,
            combineByStyle: {},
            combineColumnsStyle: {}
        });
    }

    textIgniter() {
        this.labels = {
            combineBy: 'סכם לפי',
            combineColumns: 'עמדות לסיכום',
            combineDisplayBy: { voters: 'תושבים', households: 'בתי אב' }
        };
    }

    toggleActiveTab() {
        this.setState(prevState => ({ columnsDisplayOptionsVilsable: !prevState.columnsDisplayOptionsVilsable }));
    }

    comboChange(key, e) {
        let value = e.target.selectedItem;
        let newState = { ...this.state };

        if (value) {
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_COMBINE_OPTIONS_VALUE, key, value });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.RESET_REPORT_RESULTS, reportType: constants.generalReportTypes.COMBINED });
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.RESET_REPORT_RESULTS, reportType: constants.generalReportTypes.DETAILED });
            if (key == 'combineBy') {
                let defaultCombineColumns =options.combineColumns[0];
                this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_COMBINE_OPTIONS_VALUE, key: 'combineColumns', value: defaultCombineColumns.key });
                newState['combineColumnsValue'] = defaultCombineColumns.label;
            }
            newState[key + 'Style'] = {}

        }else{
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_COMBINE_OPTIONS_VALUE, key, value: 0 });
            if (key == 'combineBy') {
                let defaultCombineColumns = options.combineColumns[0];
                newState['combineColumnsValue'] = defaultCombineColumns.label;
                this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_COMBINE_OPTIONS_VALUE, key: 'combineColumns', value: defaultCombineColumns.key });
            }
            newState[key + 'Style'] = {border: '1px solid red'}
        }
        newState[key + 'Value'] = e.target.value;
        this.setState(newState);

    }

    combineDisplayChanged(key, e) {
        let value = e.currentTarget.value;
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.CHANGE_COMBINE_OPTIONS_VALUE, key, value });
    }


    render() {
        return (
            <div className="tab-pane active" style={{ display: this.props.display }}>
                <div className="containerStrip">
                    <div className="panelContent dividing-line">
                        <div className="row">
                            <div className="col-lg-4">
                                <form className="form-horizontal">
                                    <div className="form-group">
                                        <label className="col-lg-4 control-label">{this.labels.combineBy}</label>
                                        <div className="col-lg-8">
                                            <Combo className="" items={options.combineBy}
                                                maxDisplayItems={10}
                                                itemIdProperty="key" itemDisplayProperty='label' value={this.state.combineByValue || ''}
                                                inputStyle={this.state.combineByStyle}
												showFilteredList={false}
                                                onChange={this.comboChange.bind(this, "combineBy")} />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="col-lg-4">
                                <form className="form-horizontal">
                                    <div className="form-group">
                                        <label className="col-lg-4 control-label">{this.labels.combineColumns}</label>
                                        <div className="col-lg-8">
                                            <Combo className="" items={options.combineColumns} 
                                                maxDisplayItems={5}
                                                itemIdProperty="key" itemDisplayProperty='label' value={this.state.combineColumnsValue || ''}
                                                inputStyle={this.state.combineColumnsStyle}
                                                disabled={!this.props.generalReport.combineOptions.combineBy.allowCombineColumns}
                                                onChange={this.comboChange.bind(this, "combineColumns")} />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="col-lg-4">
                                <form className="form-horizontal">
                                    <div className="form-group">
                                        <label className="col-lg-3 control-label">הצג כמות</label>
                                        <div className="col-lg-9">
                                            <label className="radio-inline">
                                                <input type="radio" value={constants.combineDisplayBy.VOTERS} name="options-radios"
                                                    checked={this.props.generalReport.combineOptions.combineDisplayBy == constants.combineDisplayBy.VOTERS}
                                                    disabled={(this.props.generalReport.combineOptions.combineColumns.key == 0) || !this.props.generalReport.combineOptions.combineBy.allowCombineColumns}
                                                    onChange={this.combineDisplayChanged.bind(this, 'combineDisplayBy')} /> {this.labels.combineDisplayBy.voters}
                                            </label>
                                            <label className="radio-inline">
                                                <input type="radio" value={constants.combineDisplayBy.HOUSEHOLDS} name="options-radios"
                                                    checked={this.props.generalReport.combineOptions.combineDisplayBy == constants.combineDisplayBy.HOUSEHOLDS}
                                                    disabled={(this.props.generalReport.combineOptions.combineColumns.key == 0) || !this.props.generalReport.combineOptions.combineBy.allowCombineColumns}
                                                    onChange={this.combineDisplayChanged.bind(this, 'combineDisplayBy')} /> {this.labels.combineDisplayBy.households}
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="panelCollapse">
                            <a aria-expanded={this.state.columnsDisplayOptionsVilsable ? "true" : "false"}
                                onClick={this.toggleActiveTab.bind(this)} className="cursor-pointer" data-toggle="collapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <span className="collapseTitle">הגדרת עמודות ידנית</span>
                            </a>
                        </div>
                        <ColumnsDisplayOptions
                            isOpened={this.state.columnsDisplayOptionsVilsable}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        generalReport: state.elections.reportsScreen.generalReport,
    }
}

export default connect(mapStateToProps)(withRouter(NewReportTab));