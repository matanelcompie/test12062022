import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import constants from 'libs/constants';

import Combo from 'components/global/Combo';

import { parseDateToPicker, parseDateFromPicker } from '../../../libs/globalFunctions';

import * as ElectionsActions from 'actions/ElectionsActions';


class AddElectionCampaign extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            formFields: {
                name: '',
                type: {id: null, name: ''},
                election_date: '',
                vote_start_time: '',
                vote_end_time: ''
            },

            // State of the open button
            // after all fields are valid
            showAttention: false
        };

        momentLocalizer(moment);

        this.initConstants();
    }

    initConstants() {
        this.electionCampaignTypes = constants.electionCampaignTypes;

        this.electionCampaignTypesArr = [
            {id: this.electionCampaignTypes.knesset, name: 'כנסת'},
            {id: this.electionCampaignTypes.municipal, name: 'רשויות'},
            {id: this.electionCampaignTypes.intermediate, name: 'ביניים'}
        ];

        this.buttonTexts = {
            open: 'פתיחת תקופת בחירות',
            cancel: 'בטל תהליך פתיחת תקופת בחירות'
        };

        this.attentionBoxtexts = {
            attention: 'שים לב!',
            open: 'לאישור פתיחת התקופה לחץ שוב'
        };
        
        this.invalidColor = '#cc0000';
    }

    componentWillMount() {
        if (this.props.currentUser.first_name.length > 0) {
            if (!this.props.currentUser.admin && this.props.currentUser.permissions['elections.campaigns.add'] != true) {
                this.props.router.push('/unauthorized');
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (0 == this.props.currentUser.first_name.length && nextProps.currentUser.first_name.length > 0) {
            if (!nextProps.currentUser.admin && nextProps.currentUser.permissions['elections.campaigns.add'] != true) {
                this.props.router.push('/unauthorized');
            }
        }
    }

    addElectionCampaign(event) {
        // Prevent page refresh
        event.preventDefault();

        let formFields = {
            name: this.state.formFields.name,
            type: this.state.formFields.type.id,
            election_date: this.state.formFields.election_date,
            vote_start_time: this.state.formFields.vote_start_time + ':00',
            vote_end_time: this.state.formFields.vote_end_time + ':00'
        };

        ElectionsActions.addElectionCampaign(this.props.router, formFields);
    }

    showAttention(event) {
        // Prevent page refresh
        event.preventDefault();

        this.setState({showAttention: true});
    }

    cancel() {
        this.props.router.push('elections/campaigns');
    }

    getCurrentDate() {
        let currentDate = new Date();

        let year = currentDate.getFullYear();
        let month = currentDate.getMonth() + 1;
        let day = currentDate.getDate();

        let strDate = year + '-';
        strDate += (month < 10) ? '0' + month : month;
        strDate += (day < 10) ? '0' + day : day;

        return strDate;
    }

    voteEndTimeChange(value, filter) {
        let formFields = this.state.formFields;

        formFields.vote_end_time = value;
        this.setState({formFields});

        this.validateVariablesForConfirmState(formFields);
    }

    voteStartTimeChange(value, filter) {
        let formFields = this.state.formFields;

        formFields.vote_start_time = value;
        this.setState({formFields});

        this.validateVariablesForConfirmState(formFields);
    }

    electionDateChange(value, filter) {
        let formFields = this.state.formFields;

        formFields.election_date = value;
        this.setState({formFields});

        this.validateVariablesForConfirmState(formFields);
    }

    typeChange(event) {
        let selectedItem = event.target.selectedItem;
        let formFields = this.state.formFields;

        if ( null == selectedItem ) {
            formFields.type = {...this.emptyFieldObj, name: event.target.value};
        } else {
            formFields.type = {
                id: selectedItem.id,
                name: selectedItem.name
            };
        }
        this.setState({formFields});

        this.validateVariablesForConfirmState(formFields);
    }

    nameChange(event) {
        let formFields = this.state.formFields;

        formFields.name = event.target.value;
        this.setState({formFields});

        this.validateVariablesForConfirmState(formFields);
    }

    validateTime(fieldName, formFields) {
        let fieldValue = formFields[fieldName];

        return ( moment(fieldValue, 'HH:mm', true).isValid() );
    }

    validateElectionDate(electionDate) {
        return moment(electionDate, 'YYYY-MM-DD', true).isValid();
    }

    validateType(typeId) {
        return (typeId != null);
    }

    validateName(name) {
        return (name.length > 0);
    }

    validateVariablesForConfirmState(formFields) {
        let validInput = true;

        var validStartTime;
        var validEndTime;

        let currentDate = this.getCurrentDate();
        let isElectionCampaignIntermediate = (this.state.formFields.type.id == this.electionCampaignTypes.intermediate);

        if ( !this.validateName(formFields.name) ) {
            validInput = false;
        }

        if ( !this.validateType(formFields.type.id) ) {
            validInput = false;
        }
        if(!isElectionCampaignIntermediate){
            if ( !this.validateElectionDate(formFields.election_date) ) {
                validInput = false;
            } else if ( formFields.election_date < currentDate  ) {
                validInput = false;
            }
    
            if ( !this.validateTime('vote_start_time', formFields) ) {
                validInput = false;
    
                validStartTime = false;
            } else {
                validStartTime = true;
            }
            if ( !this.validateTime('vote_end_time', formFields) ) {
                validInput = false;
    
                validEndTime = false;
            } else {
                validEndTime = true;
            }
    
            if ( validEndTime && validStartTime && formFields.vote_start_time > formFields.vote_end_time ) {
                this.validInput = false;
                this.voteEndTimeInputStyle = {borderColor: this.invalidColor};
            }
        }




        this.setState({showAttention: validInput});
    }

    validateVariables() {
        this.validInput = true;

        var validStartTime;
        var validEndTime;

        let currentDate = this.getCurrentDate();
        let isElectionCampaignIntermediate = (this.state.formFields.type.id == this.electionCampaignTypes.intermediate);

        if ( !this.validateName(this.state.formFields.name) ) {
            this.validInput = false;
            this.nameInputStyle = { borderColor: this.invalidColor };
        }

        if ( !this.validateType(this.state.formFields.type.id) ) {
            this.validInput = false;
            this.typeInputStyle = { borderColor: this.invalidColor };
        }
        if(!isElectionCampaignIntermediate){

            if ( !this.validateElectionDate(this.state.formFields.election_date) ) {
                this.validInput = false;
                this.electionDateInputStyle = { borderColor: this.invalidColor };
            } else if ( this.state.formFields.election_date < currentDate  ) {
                this.validInput = false;
                this.electionDateInputStyle = { borderColor: this.invalidColor };
            }

            if ( !this.validateTime('vote_start_time', this.state.formFields) ) {
                validStartTime = false;

                this.validInput = false;
                this.voteStartTimeInputStyle = {borderColor: this.invalidColor};
            } else {
                validStartTime = true;
            }

            if ( !this.validateTime('vote_end_time', this.state.formFields) ) {
                validEndTime = false;

                this.validInput = false;
                this.voteEndTimeInputStyle = {borderColor: this.invalidColor};
            } else {
                validEndTime = true;
            }

            if ( validEndTime && validStartTime && this.state.formFields.vote_start_time > this.state.formFields.vote_end_time ) {
                this.validInput = false;
                this.voteEndTimeInputStyle = {borderColor: this.invalidColor};
            }
        }
    }

    initVariables() {
        this.nameInputStyle = {};
        this.typeInputStyle = {};
        this.electionDateInputStyle = {};
        this.voteStartTimeInputStyle = {};
        this.voteEndTimeInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className="stripMain elections-period-management">
                <form>
                    <div className="container">
                        <div className="bg-container first-box-on-page container-search-groups margin-bottom20">
                            <div className="row srchPanelLabel rsltsTitleRow">
                                <div className="col-md-5ths">
                                    <div className="form-group">
                                        <label htmlFor="name" className="control-label">שם מערכת</label>
                                        <input type="text" className="form-control" id="name" style={this.nameInputStyle}
                                               value={this.state.formFields.name} onChange={this.nameChange.bind(this)}/>
                                    </div>
                                </div>
                                <div className="col-md-5ths">
                                    <div className="form-group">
                                        <label htmlFor="type" className="control-label">סוג</label>
                                        <Combo id="type"
                                               items={this.electionCampaignTypesArr}
                                               itemIdProperty="id"
                                               itemDisplayProperty="name"
                                               maxDisplayItems={10}
                                               inputStyle={this.typeInputStyle}
                                               value={this.state.formFields.type.name}
                                               className="form-combo-table"
                                               onChange={this.typeChange.bind(this)}/>

                                    </div>
                                </div>
                                <div className="col-md-5ths">
                                    <div className="form-group">
                                        <label htmlFor="election-day" className="control-label"> תאריך יום בחירות</label>
                                        <ReactWidgets.DateTimePicker
                                            id="election-day"
                                            isRtl={true} time={false}
                                            value={parseDateToPicker(this.state.formFields.election_date)}
                                            onChange={parseDateFromPicker.bind(this, {callback: this.electionDateChange,
                                                format: "YYYY-MM-DD",
                                                functionParams: 'dateTime'})
                                            }
                                            format="DD/MM/YYYY"
                                            style={this.electionDateInputStyle}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-5ths">
                                    <div className="form-group">
                                        <label htmlFor="start-hour" className="control-label">שעת התחלת הצבעה</label>
                                        <ReactWidgets.DateTimePicker
                                            isRtl={true} time={true} calendar={false}
                                            value={parseDateToPicker(this.state.formFields.vote_start_time)}
                                            onChange={parseDateFromPicker.bind(this, {callback: this.voteStartTimeChange,
                                                format: "HH:mm",
                                                functionParams: 'dateTime'})}
                                            format="HH:mm"
                                            id="start-hour"
                                            style={this.voteStartTimeInputStyle}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-5ths">
                                    <div className="form-group">
                                        <label htmlFor="end-hour" className="control-label">שעת סיום הצבעה</label>
                                        <ReactWidgets.DateTimePicker
                                            isRtl={true} time={true} calendar={false}
                                            value={parseDateToPicker(this.state.formFields.vote_end_time)}
                                            onChange={parseDateFromPicker.bind(this, {callback: this.voteEndTimeChange,
                                                format: "HH:mm",
                                                functionParams: 'dateTime'})}
                                            format="HH:mm"
                                            id="end-hour"
                                            style={this.voteEndTimeInputStyle}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-container box-content">
                            <div className="title16">פעולות פתיחת המערכת</div>
                            <div className="row">
                                <div className="col-md-3">
                                    - שיוך תושבים<br/>
                                    - איפוס סטטוס תושבים<br/>
                                    - שיוך קלפיות<br/>
                                    - איפוס תפקידי פעילי מערכת בחירות <br/>
                                    - איפוס הקצאת תפקידים במפלגה <br/>
                                </div>
                                <div className="col-md-3">
                                    - איפוס נתוני תקציב לעיר<br/>
                                    - איפוס נתוני מערכת בחירות לרשויות העיר<br/>
                                    - איפוס נתוני הצבעה<br/>
                                    - איפוס נתוני הסעות <br/>
                                    - איפוס נתוני התנדבות <br/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row margin-bottom30">
                        <div className="col-md-6 text-right">
                            <button type="submit" className="btn cancel-btn-blue" onClick={this.cancel.bind(this)}>
                                {this.buttonTexts.cancel}
                            </button>
                        </div>
                        <div className="col-md-6 text-left">
                            <button type="submit" className={this.state.showAttention ? "btn btn-default btn-red pull-left"
                                                                                      : "btn new-btn-default"}
                                    disabled={!this.validInput}
                                    onClick={this.state.showAttention ? this.addElectionCampaign.bind(this)
                                                                      : this.showAttention.bind(this)}>
                                {this.buttonTexts.open}
                            </button>

                            { (this.state.showAttention) &&
                            <div className="pull-left attention-box">
                                <span className="attention">{this.attentionBoxtexts.attention}</span> {this.attentionBoxtexts.open}
                            </div>
                            }
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser
    };
}

export default connect(mapStateToProps) (withRouter(AddElectionCampaign));