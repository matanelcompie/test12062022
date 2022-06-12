import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';
import _ from 'lodash';
import ReactWidgets from 'react-widgets';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import moment from 'moment';

import * as CrmActions from '../../../../actions/CrmActions';
import * as VoterActions from '../../../../actions/VoterActions';
import * as SystemActions from '../../../../actions/SystemActions';
import Combo from '../../../global/Combo';
import { parseDateToPicker, parseDateFromPicker } from '../../../../libs/globalFunctions';

class SearchContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { filteredStatuses: [] };
        this.textIgniter();
        this.styleIgniter();
        momentLocalizer(moment);
        this.updateDateValue = this.updateDateValue.bind(this);
    }

    textIgniter() {
        this.textValues = {
            fromRequestDate: 'מתאריך פניה',
            toRequestDate: 'עד תאריך פניה',
            fromCreateDate: 'מתאריך יצירה',
            toCreateDate: 'עד תאריך יצירה',
            fromCloseDate: 'מתאריך סגירה',
            toCloseDate: 'עד תאריך סגירה',
            topic: 'בנושא',
            subTopic: 'בתת נושא',
            statusType: 'בסוג סטטוס',
            status: 'בסטטוס',
            closure_reason: 'סיבת סגירה',
            satisfaction: 'שביעות רצון',
            priority: 'בעדיפות',
            includingOperation: 'כולל פעולות מסוג',
            inSetuation: 'במצב',
            inDate: 'במועד',
            voterRequests: 'פניות של תושב',
            requestsFromCity: 'פניות של תושבים מעיר',
            handlerUser: 'משתמש מטפל',
            handlerTeam: 'צוות מטפל',
            creatorUser: 'משתמש יוצר',
            updaterUser: 'משתמש מעדכן',
            callbizId: 'מזהה CallBIZ',
            datesTitle: 'תאריך פניה/יצירה/סגירה',
            noFiltersExist: 'נא לבחור שדה חיפוש',
            reset: 'נקה מסננים',
            search: 'חיפוש',
            phone: 'טלפון',
            firstName: 'שם פרטי',
            lastName: 'שם משפחה',
            requestKey: 'קוד פניה'
        };
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.status.length > 0 && this.props.status.length == 0 && this.state.filteredStatuses.length == 0) {
            this.setState({ filteredStatuses: nextProps.status });
        }
    }

    styleIgniter() {
        this.noPadding = { paddingLeft: 0, paddingRight: 0 };
        this.blueButtonStyle = { backgroundColor: '#2ab4c0', color: '#ffffff' };
    }

    updateCollapseStatus(container) {
        this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.CONTAINER_COLLAPSE_TOGGLE, container });
    }

    doSearch(e) {
        e.preventDefault();
        this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.BUTTON_PRESSED });
        this.validateFilters();
    }

    validateFilters() {
        let multiValueFilters = [
            'topics', 'subTopics', 'status', 'priority', 'voterRequests', 'satisfaction', 'closure_reason', 
            'requestsFromCity', 'handlerUser', 'handlerTeam', 'creatorUser', 'updaterUser'
        ];
        let searchDates = [
            'fromRequestDate', 'toRequestDate', 'fromCreateDate',
            'fromCloseDate', 'toCloseDate', 'toCreateDate'
        ];

        let clearedSerachFilters = {};
        let isFiltersHasErrors = false;
        let isThereFiltersExist = false;
        let errorMessage = '';
        _.forEach(this.props.searchFilters, function (value, key) {
            if (!_.isEmpty(value) || _.isNumber(value)) {
                isThereFiltersExist = true;
                if (_.indexOf(searchDates, key) != -1) {
                    clearedSerachFilters[key] = value;
                    return;
                }
                if (_.indexOf(multiValueFilters, key) != -1) {
                    let filterValues = [];
                    _.forEach(value, function (multiValueItem) {
                        let multiValueItemKey = multiValueItem.key || multiValueItem.city_key || multiValueItem.team_key || multiValueItem.id;
                        filterValues.push(multiValueItemKey);
                    });
                    value = filterValues;
                }
                if (_.indexOf(['includingOperation'], key) != -1) {
                    value = value.key;
                }
                if (_.indexOf(['statusType'], key) != -1) {
                    value = value.id;
                }

                clearedSerachFilters[key] = value;
            }
        });
        if (true == isThereFiltersExist && false == isFiltersHasErrors) {
            this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.STARTED, isFiltersHasErrors, isThereFiltersExist });
            CrmActions.searchRequest(this.props.dispatch, clearedSerachFilters);
        } else {
            this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.UPDATE_ERROR_MESSAGE, errorMessage, isFiltersHasErrors, isThereFiltersExist });
        }
    }

    updateFilterValue(filterName, e) {
        const value = e.target.value;
        this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.FILTER_VALUE_UPDATED, filterName, value });
    }

    updateDateValue(value, format, filterName) {
        this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.FILTER_VALUE_UPDATED, filterName, value });
        this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.UPDATE_DATE_VALUE });
    }

    comboChange(filterName, itemIdProperty, isMultiSelect, e) {
        this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.COMBO_VALUE_UPDATED, filterName, value: e.target.value });
        var value = (isMultiSelect) ? e.target.selectedItems : e.target.selectedItem;
        this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.FILTER_VALUE_UPDATED, filterName, value });

        if ('topics' == filterName) {
            this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.UPDATE_SUB_TOPICS_LIST });
        }

        else if ('handlerTeam' == filterName) {
            this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.UPDATE_TEAM_USERS_LIST });
        }

        else if (filterName == 'statusType') {
            this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.COMBO_VALUE_UPDATED, filterName: 'status', value: '' });
            this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.FILTER_VALUE_UPDATED, filterName: 'status', value: [] });
            if (!e.target.selectedItem) {
                this.setState({ filteredStatuses: this.props.status });
            }
            else {
                this.setState({ filteredStatuses: this.props.status.filter(statusItem => statusItem.type_id == e.target.selectedItem.id) });
            }
        }
    }

    resetSerachFilters(e) {
        e.preventDefault();
        this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.RESET_FILTERS });
    }

    selectVoterForRequestsSearch() {
        let returnUrl = 'crm/requests/search',
            returnButtonText = 'חזור למסך שאילתות';

        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT });
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_REDIRECT_TO_SEARCH,
            data: { returnUrl: returnUrl, returnButtonText: returnButtonText }
        });
        this.props.router.push('elections/voters/search');
    }

    componentWillMount() {
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'שאילתת פניות' });

        if (!_.isEmpty(this.props.selectedVoterForRedirect)) {
            let selectedVoter = {
                key: this.props.selectedVoterForRedirect.voters_key,
                full_name: this.props.selectedVoterForRedirect.firstName + ' ' + this.props.selectedVoterForRedirect.lastName
            };
            this.props.dispatch({ type: CrmActions.ActionTypes.SEARCH.NEW_USER_SELECTED, selectedVoter });
            this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT });
        }
    }

    render() {
        return (
            <div className="dtlsBox electorDtlsStrip clearfix">
                <form className="form-horizontal">
                    <div className="ContainerCollapse" style={{ ...this.noPadding, marginBottom: '20px' }}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'dates')} aria-expanded={this.props.collapseStatus.dates}>
                            <div className="collapseArrow closed"></div>
                            <div className="collapseArrow open"></div>
                            <span className="collapseTitle">{this.textValues.datesTitle + (true == this.props.isDateFilterExist && false == this.props.collapseStatus.dates ? ' *' : '')}</span>
                        </a>
                        <Collapse isOpened={this.props.collapseStatus.dates}>
                            <div className="CollapseContent" style={this.noPadding}>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="form-group row">
                                            <label htmlFor="fromRequestDate" className="col-md-4 control-label">{this.textValues.fromRequestDate}</label>
                                            <div className="col-md-8">
                                                <ReactWidgets.DateTimePicker
                                                    isRtl={true}
                                                    time={false}
                                                    value={parseDateToPicker(this.props.searchFilters.fromRequestDate)}
                                                    onChange={parseDateFromPicker.bind(this, { callback: this.updateDateValue, format: "YYYY-MM-DD", functionParams: 'fromRequestDate' })}
                                                    format="DD/MM/YYYY"
                                                    max={parseDateToPicker(this.props.searchFilters.toRequestDate) || new Date()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group row">
                                            <label htmlFor="fromCloseDate" className="col-md-4 control-label">{this.textValues.fromCloseDate}</label>
                                            <div className="col-md-8">
                                                <ReactWidgets.DateTimePicker
                                                    isRtl={true}
                                                    time={false}
                                                    value={parseDateToPicker(this.props.searchFilters.fromCloseDate)}
                                                    onChange={parseDateFromPicker.bind(this, { callback: this.updateDateValue, format: "YYYY-MM-DD", functionParams: 'fromCloseDate' })}
                                                    format="DD/MM/YYYY"
                                                    max={parseDateToPicker(this.props.searchFilters.toCloseDate) || new Date()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group row">
                                            <label htmlFor="fromCreateDate" className="col-md-4 control-label">{this.textValues.fromCreateDate}</label>
                                            <div className="col-md-8">
                                                <ReactWidgets.DateTimePicker
                                                    isRtl={true}
                                                    time={false}
                                                    value={parseDateToPicker(this.props.searchFilters.fromCreateDate)}
                                                    onChange={parseDateFromPicker.bind(this, { callback: this.updateDateValue, format: "YYYY-MM-DD", functionParams: 'fromCreateDate' })}
                                                    format="DD/MM/YYYY"
                                                    max={parseDateToPicker(this.props.searchFilters.toCreateDate) || new Date()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="form-group row">
                                            <label htmlFor="toRequestDate" className="col-md-4 control-label">{this.textValues.toRequestDate}</label>
                                            <div className="col-md-8">
                                                <ReactWidgets.DateTimePicker
                                                    isRtl={true}
                                                    time={false}
                                                    value={parseDateToPicker(this.props.searchFilters.toRequestDate)}
                                                    min={parseDateToPicker(this.props.searchFilters.fromRequestDate)}
                                                    onChange={parseDateFromPicker.bind(this, { callback: this.updateDateValue, format: "YYYY-MM-DD", functionParams: 'toRequestDate' })}
                                                    format="DD/MM/YYYY"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group row">
                                            <label htmlFor="toCloseDate" className="col-md-4 control-label">{this.textValues.toCloseDate}</label>
                                            <div className="col-md-8">
                                                <ReactWidgets.DateTimePicker
                                                    isRtl={true}
                                                    time={false}
                                                    value={parseDateToPicker(this.props.searchFilters.toCloseDate)}
                                                    min={parseDateToPicker(this.props.searchFilters.fromCloseDate)}
                                                    onChange={parseDateFromPicker.bind(this, { callback: this.updateDateValue, format: "YYYY-MM-DD", functionParams: 'toCloseDate' })}
                                                    format="DD/MM/YYYY"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group row">
                                            <label htmlFor="toCreateDate" className="col-md-4 control-label">{this.textValues.toCreateDate}</label>
                                            <div className="col-md-8">
                                                <ReactWidgets.DateTimePicker
                                                    isRtl={true}
                                                    time={false}
                                                    value={parseDateToPicker(this.props.searchFilters.toCreateDate)}
                                                    min={parseDateToPicker(this.props.searchFilters.fromCreateDate)}
                                                    onChange={parseDateFromPicker.bind(this, { callback: this.updateDateValue, format: "YYYY-MM-DD", functionParams: 'toCreateDate' })}
                                                    format="DD/MM/YYYY"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {false && <div className="col-md-3">
                                        <div className="form-group row">
                                            <label htmlFor="inDate" className="col-md-5 control-label">{this.textValues.inDate}</label>
                                            <div className="col-md-7">
                                                <Combo id='inDate' items={this.props.inDate} maxDisplayItems={5} itemIdProperty="id" value={this.props.searchFilters.inDate}
                                                    itemDisplayProperty='name' onChange={this.updateFilterValue.bind(this, "inDate")} />
                                            </div>
                                        </div>
                                    </div>}
                                </div>
                            </div>
                        </Collapse>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="well well-sm">
                            <div className="row">
                                        <div className="col-md-6">
                                    <div className="form-group row">
                                        <label htmlFor="requestKey" className="col-md-4 control-label">{this.textValues.requestKey}</label>
                                        <div className="col-md-8">
                                            <input type="text" className="form-control" id="requestKey" onChange={this.updateFilterValue.bind(this, 'requestKey')} />
                                        </div>
                                    </div>
                                </div>
                                </div>
                                <div className="row">
                                  
                                    <div className="col-md-6">
                                        <div className="form-group row">
                                            <label htmlFor="topic" className="col-md-4 control-label">{this.textValues.topic}</label>
                                            <div className="col-md-8">
                                                <Combo id='topic' items={this.props.topics} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='name'
                                                    multiSelect='true' onChange={this.comboChange.bind(this, "topics", "key", true)}
                                                    selectedItems={this.props.searchFilters.topics} value={this.props.comboFilters.topics} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group row">
                                            <label htmlFor="subTopic" className="col-md-3 control-label">{this.textValues.subTopic}</label>
                                            <div className="col-md-9">
                                                <Combo id='subTopic' items={this.props.subTopics} maxDisplayItems={5} itemIdProperty="key"
                                                    itemDisplayProperty={(this.props.searchFilters.topics.length == 1 ? 'name' : 'full_name')}
                                                    multiSelect='true' onChange={this.comboChange.bind(this, "subTopics", "key", true)}
                                                    selectedItems={this.props.searchFilters.subTopics} value={this.props.comboFilters.subTopics} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="well well-sm">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group row">
                                            <label htmlFor="statusType" className="col-md-5 control-label">{this.textValues.statusType}</label>
                                            <div className="col-md-7">
                                                <Combo id='statusType' items={this.props.statusType} maxDisplayItems={5} itemIdProperty="id"
                                                    itemDisplayProperty='name' onChange={this.comboChange.bind(this, "statusType", "id", false)}
                                                    value={this.props.comboFilters.statusType} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group row">
                                            <label htmlFor="status" className="col-md-4 control-label">{this.textValues.status}</label>
                                            <div className="col-md-8">
                                                <Combo id='status' items={this.state.filteredStatuses} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='name'
                                                    multiSelect='true' onChange={this.comboChange.bind(this, "status", "key", true)}
                                                    selectedItems={this.props.searchFilters.status} value={this.props.comboFilters.status} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group row">
                                            <label htmlFor="closure_reason" className="col-md-5 control-label">{this.textValues.closure_reason}</label>
                                            <div className="col-md-7">
                                                <Combo id='closure_reason' items={this.props.requestCloseReasonList} maxDisplayItems={5} itemIdProperty="key"
                                                     multiSelect='true' itemDisplayProperty='name' onChange={this.comboChange.bind(this, "closure_reason", "key", true)}
                                                    value={this.props.searchFilters.closure_reason} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group row">
                                            <label htmlFor="satisfaction" className="col-md-4 control-label">{this.textValues.satisfaction}</label>
                                            <div className="col-md-8">
                                                <Combo id='satisfaction' items={this.props.requestSatisfactionList} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='name'
                                                    multiSelect='true' onChange={this.comboChange.bind(this, "satisfaction", "key", true)}
                                                    selectedItems={this.props.searchFilters.satisfaction} value={this.props.comboFilters.satisfaction} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label htmlFor="firstName" className="col-md-6 control-label" >{this.textValues.firstName}</label>
                                        <div className="col-md-6">
                                            <input type='text' id="firstName" className='form-control' value={this.props.searchFilters.firstName}
                                                onChange={this.updateFilterValue.bind(this, "firstName")} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group dow">
                                        <label htmlFor="handlerUser" className="col-md-5 control-label">{this.textValues.lastName}</label>
                                        <div className="col-md-7">
                                            <input type='text' className='form-control' value={this.props.searchFilters.lastName}
                                                onChange={this.updateFilterValue.bind(this, "lastName")} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label htmlFor="phone" className="col-md-3 control-label">{this.textValues.phone}</label>
                                        <div className="col-md-9">
                                            <input type='text' id="phone" className='form-control' value={this.props.searchFilters.phone}
                                                onChange={this.updateFilterValue.bind(this, "phone")} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">

                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label htmlFor="creatorUser" className="col-md-5 control-label">{this.textValues.creatorUser}</label>
                                        <div className="col-md-7">
                                            <Combo id='creatorUser' items={this.props.teamsUsers} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='name'
                                                multiSelect='true' onChange={this.comboChange.bind(this, "creatorUser", "key", true)}
                                                selectedItems={this.props.searchFilters.creatorUser} value={this.props.comboFilters.creatorUser} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label htmlFor="updaterUser" className="col-md-5 control-label">{this.textValues.updaterUser}</label>
                                        <div className="col-md-7">
                                            <Combo id='updaterUser' items={this.props.users} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='name'
                                                multiSelect='true' onChange={this.comboChange.bind(this, "updaterUser", "key", true)}
                                                selectedItems={this.props.searchFilters.updaterUser} value={this.props.comboFilters.updaterUser} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label htmlFor="handlerTeam" className="col-md-6 control-label">{this.textValues.handlerTeam}</label>
                                        <div className="col-md-6">
                                            <Combo id='handlerTeam' items={this.props.teams} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='name'
                                                multiSelect='true' onChange={this.comboChange.bind(this, "handlerTeam", "key", true)}
                                                selectedItems={this.props.searchFilters.handlerTeam} value={this.props.comboFilters.handlerTeam} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group dow">
                                        <label htmlFor="handlerUser" className="col-md-5 control-label">{this.textValues.handlerUser}</label>
                                        <div className="col-md-7">
                                            <Combo id='handlerUser' items={this.props.teamsUsers} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='name'
                                                multiSelect='true' onChange={this.comboChange.bind(this, "handlerUser", "key", true)}
                                                selectedItems={this.props.searchFilters.handlerUser} value={this.props.comboFilters.handlerUser} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label htmlFor="includingOperation" className="col-md-6 control-label">{this.textValues.includingOperation}</label>
                                        <div className="col-md-6">
                                            <Combo id='includingOperation' items={this.props.actionTypes} maxDisplayItems={5} itemIdProperty="key"
                                                itemDisplayProperty='name' onChange={this.comboChange.bind(this, "includingOperation", "key", false)}
                                                selectedItem={this.props.searchFilters.includingOperation} value={this.props.comboFilters.includingOperation} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label htmlFor="priority" className="col-md-4 control-label">{this.textValues.priority}</label>
                                        <div className="col-md-8">
                                            <Combo id='priority' items={this.props.priority} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name'
                                                multiSelect='true' onChange={this.comboChange.bind(this, "priority", "id", true)}
                                                selectedItems={this.props.searchFilters.priority} value={this.props.comboFilters.priority} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group row">
                                <label htmlFor="callbizId" className="col-md-4 control-label">{this.textValues.callbizId}</label>
                                <div className="col-md-8">
                                    <input type="text" className="form-control" id="callbizId" onChange={this.updateFilterValue.bind(this, 'callbizId')} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group row">
                                <label htmlFor="voterRequests" className="col-md-3 control-label">{this.textValues.voterRequests}</label>
                                <div className="col-md-6">
                                    <Combo id='voterRequests' items={this.props.selectedVoters} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='full_name'
                                        selectedItems={this.props.searchFilters.voterRequests} value={this.props.comboFilters.voterRequests}
                                        multiSelect='true' onChange={this.comboChange.bind(this, "voterRequests", "key", true)} />
                                </div>
                                <span className="col-md-1">
                                    <button type="button" className="btn btn-primary btn-xs" onClick={this.selectVoterForRequestsSearch.bind(this)}>
                                        <i className="fa fa-search"></i>
                                    </button>
                                </span>
                            </div>

                        </div>
                        <div className="col-md-6">
                            <div className="form-group row">
                                <label htmlFor="requestsFromCity" className="col-md-4 control-label">{this.textValues.requestsFromCity}</label>
                                <div className="col-md-8">
                                    <Combo id='requestsFromCity' items={this.props.cities} maxDisplayItems={5} itemIdProperty="city_key" itemDisplayProperty='city_name'
                                        multiSelect='true' onChange={this.comboChange.bind(this, "requestsFromCity", "city_key", true)}
                                        selectedItems={this.props.searchFilters.requestsFromCity} value={this.props.comboFilters.requestsFromCity} />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <div className='has-error'>
                    <span className={"help-block" + (false == this.props.isThereFiltersExist && true == this.props.isSearchButtonPressed ? '' : ' not-visible')}>
                        {this.textValues.noFiltersExist}
                    </span>
                    <span className={"help-block" + (true == this.props.isFiltersHasErrors ? '' : ' not-visible')}>
                        {this.props.errorMessage}
                    </span>
                </div>
                <div className="row quickAccessContainer hidden-xs">
                    <div className="col-sm-2 col-md-2 col-lg-2"></div>
                    <div className="col-sm-10 col-md-10 col-lg-10">
                        <div className="row quickAccess">
                            <div className="col-sm-8 col-md-8 col-lg-8"></div>
                            <a href="#" title="search" onClick={this.doSearch.bind(this)}>
                                <div className="col-sm-2 col-md-2 col-lg-2 btn-hover" style={this.blueButtonStyle}>{this.textValues.search}</div>
                            </a>
                            <a href="#" title="search" onClick={this.resetSerachFilters.bind(this)} >
                                <div className="col-sm-2 col-md-2 col-lg-2 btn-hover" style={this.blueButtonStyle}>{this.textValues.reset}</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        cities: state.crm.requestSearch.lists.cities,
        teams: state.crm.requestSearch.lists.teams,
        teamsUsers: state.crm.requestSearch.lists.teamsUsers,
        topics: state.crm.requestSearch.lists.topics,
        subTopics: state.crm.requestSearch.lists.subTopics,
        priority: state.crm.requestSearch.lists.priority,
        status: state.crm.requestSearch.lists.status,
        statusType: state.crm.requestSearch.lists.statusType,
        requestCloseReasonList: state.crm.searchRequestsScreen.requestCloseReasonList,
        requestSatisfactionList: state.crm.searchRequestsScreen.requestSatisfactionList,
        users: state.crm.requestSearch.lists.users,
        actionTypes: state.crm.requestSearch.lists.actionTypes,
        inDate: state.crm.requestSearch.lists.inDate,
        selectedVoters: state.crm.requestSearch.lists.selectedVoters, /*=*/
        searchFilters: state.crm.requestSearch.searchFilters,
        comboFilters: state.crm.requestSearch.comboFilters,
        collapseStatus: state.crm.requestSearch.collapseStatus,
        isDateFilterExist: state.crm.requestSearch.isDateFilterExist,
        isThereFiltersExist: state.crm.requestSearch.isThereFiltersExist,
        isFiltersHasErrors: state.crm.requestSearch.isFiltersHasErrors,
        errorMessage: state.crm.requestSearch.errorMessage,
        isSearchButtonPressed: state.crm.requestSearch.isSearchButtonPressed,
        selectedVoterForRedirect: state.voters.searchVoterScreen.selectedVoterForRedirect
    };
}
export default connect(mapStateToProps)(withRouter(SearchContainer));
