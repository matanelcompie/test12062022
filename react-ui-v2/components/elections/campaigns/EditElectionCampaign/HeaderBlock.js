import React from 'react';

import constants from 'libs/constants';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import { parseDateToPicker, parseDateFromPicker } from 'libs/globalFunctions';
import { displayDbDate } from '../../../../helper/DateActionHelper';


class HeaderBlock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editMode: false,

            formFields: {
                election_date: '',
                vote_start_time: '',
                vote_end_time: '',
                start_date: '',
                end_date: '',
                
            }
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

    componentWillReceiveProps(nextProps) {
        
        if ( !this.props.loadedCampaignDetailsFlag && nextProps.loadedCampaignDetailsFlag ) {
  
            let formFields = {
                election_date: nextProps.campaignDetails.election_date,
                start_date: nextProps.campaignDetails.start_date,
                end_date: nextProps.campaignDetails.end_date,
                vote_start_time: this.getTime(nextProps.campaignDetails.vote_start_time, true),
                vote_end_time: this.getTime(nextProps.campaignDetails.vote_end_time, true)
            };

            this.setState({formFields});
        }

    }

    getTime(timeValue, leadingZero = false) {
        let timeElements = timeValue.split(':');
        let hour = timeElements[0];
        let minutes = timeElements[1];

        if ( !leadingZero && hour.indexOf("0") == 0 ) {
            hour = hour.slice(1);
        }

        return (hour + ':' + minutes);
    }

    getType() {
        const electionCampaignTypes = constants.electionCampaignTypes;

        switch (this.props.campaignDetails.type) {
            case electionCampaignTypes.knesset:
                return 'כנסת';
                break;

            case electionCampaignTypes.municipal:
                return 'רשויות';
                break;

            case electionCampaignTypes.intermediate:
                return 'ביניים';
                break;

            default:
                return <i className="fa fa-spinner fa-spin"/> ;
                break;
        }
    }

    voteEndTimeChange(value, filter) {
        
        let formFields = this.state.formFields;

        formFields.vote_end_time = value;
        this.setState({formFields});
    }

    voteStartTimeChange(value, filter) {
        
        let formFields = this.state.formFields;

        formFields.vote_start_time = value;
        this.setState({formFields});
    }

    electionDateChange(value, filter) {
        
        let formFields = this.state.formFields;

        formFields.election_date = value;
        this.setState({formFields});
    }

    electionStartDateChange(value, filter) {
        let formFields = this.state.formFields
        formFields.start_date = value;
        this.setState({formFields});
    }

    electionEndDateChange(value, filter) {
        
        let formFields = this.state.formFields;

        formFields.end_date = value;
        this.setState({formFields});
    }

    editModeChange() {
        
        let newEditMode = !this.state.editMode;
        this.setState({editMode: newEditMode});
    }

    updateCampaignDetails() {
        this.setState({editMode: false});
        
        this.props.updateCampaignDetails(this.props.campaignDetails.key, {...this.state.formFields});
    }

    renderButtons() {
        if ( this.state.editMode ) {
            return [
                <button key={0} className="btn btn-success btn-xs" title="שמירה" style={{cursor: 'pointer'}}
                        onClick={this.updateCampaignDetails.bind(this)} disabled={!this.validInput}>
                    <i className="fa fa-floppy-o"/>
                </button>,
                <button key={1} className="btn btn-danger btn-xs" title="ביטול" style={{cursor: 'pointer'}}
                        onClick={this.editModeChange.bind(this)}>
                    <i className="fa fa-times"/>
                </button>
            ];
        } else {
            return <span className="edit-group edit-group-icon" style={{cursor: 'pointer'}}
                         onClick={this.editModeChange.bind(this)}/>;
        }
    }

    renderVoteEndTime() {
        if ( this.state.editMode ) {
            return <ReactWidgets.DateTimePicker
                        isRtl={true} time={true} calendar={false}
                        value={parseDateToPicker(this.state.formFields.vote_end_time)}
                        onChange={parseDateFromPicker.bind(this, {callback: this.voteEndTimeChange,
                            format: "HH:mm",
                            functionParams: 'dateTime'})
                        }
                        format="HH:mm"
                        id="end-hour"
                        style={this.voteEndTimeInputStyle}/>;
        } else {
            return (this.props.campaignDetails.vote_end_time != null ? this.getTime(this.props.campaignDetails.vote_end_time)
                : <i className="fa fa-spinner fa-spin"/>);
        }
    }

    renderVoteStartTime() {
        if ( this.state.editMode ) {
            return <ReactWidgets.DateTimePicker
                        isRtl={true} time={true} calendar={false}
                        value={parseDateToPicker(this.state.formFields.vote_start_time)}
                        onChange={parseDateFromPicker.bind(this, {callback: this.voteStartTimeChange,
                            format: "HH:mm",
                            functionParams: 'dateTime'})
                        }
                        format="HH:mm"
                        id="start-hour"
                        style={this.voteStartTimeInputStyle}/>;
        } else {
            return (this.props.campaignDetails.vote_start_time != null ? this.getTime(this.props.campaignDetails.vote_start_time)
                : <i className="fa fa-spinner fa-spin"/>);
        }
    }

    renderElectionDate() {
        if ( this.state.editMode ) {
            return <ReactWidgets.DateTimePicker
                        id="election-day"
                        isRtl={true} time={false}
                        value={parseDateToPicker(this.state.formFields.election_date)}
                        onChange={parseDateFromPicker.bind(this, {callback: this.electionDateChange,
                            format: "YYYY-MM-DD",
                            functionParams: 'dateTime'})
                        }
                        format="DD/MM/YYYY"
                        style={this.electionDateInputStyle}/>;
        } else {
            return (this.props.campaignDetails.election_date != null ? this.props.campaignDetails.election_date.split('-').reverse().join('/')
                : <i className="fa fa-spinner fa-spin"/>);
        }
    }

    renderElectionStartDate() {
        if ( this.state.editMode ) {
            return <ReactWidgets.DateTimePicker
                        id="election-day"
                        isRtl={true} time={false}
                        value={parseDateToPicker(this.state.formFields.start_date)}
                        onChange={parseDateFromPicker.bind(this, {callback: this.electionStartDateChange,
                            format: "YYYY-MM-DD",
                            functionParams: 'dateTime'})
                        }
                        format="DD/MM/YYYY"
                        style={this.electionDateInputStyle}/>;
        } else {
            return (this.props.campaignDetails.start_date != null ?displayDbDate(this.props.campaignDetails.start_date,false,'/')
                : <div><i style={{opacity:'0.5'}}>לא הוגדר</i></div>);
        }
    }

    renderElectionEndDate() {
        if ( this.state.editMode ) {
            return <ReactWidgets.DateTimePicker
                        id="election-day"
                        isRtl={true} time={false}
                        value={parseDateToPicker(this.state.formFields.end_date)}
                        onChange={parseDateFromPicker.bind(this, {callback: this.electionEndDateChange,
                            format: "YYYY-MM-DD",
                            functionParams: 'dateTime'})
                        }
                        format="DD/MM/YYYY"
                        style={this.electionDateInputStyle}/>;
        } else {
            return (this.props.campaignDetails.end_date != null ? displayDbDate(this.props.campaignDetails.end_date,false,'/')
                : <div><i style={{opacity:'0.5'}}>לא הוגדר</i></div>);
        }
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

    validateTime(fieldName) {
        let fieldValue = this.state.formFields[fieldName];
        
        return ( moment(fieldValue, 'HH:mm', true).isValid());
    }

    validateElectionDate() {
        return moment(this.state.formFields.election_date, 'YYYY-MM-DD', true).isValid();
    }

    validateVariables() {
        var validStartTime;
        var validEndTime;

        let currentDate = this.getCurrentDate();

        this.electionDateInputStyle = {};
        this.voteStartTimeInputStyle = {};
        this.voteEndTimeInputStyle = {};
        this.validInput = true;

        if ( !this.validateElectionDate() ) {
            this.validInput = false;
            this.electionDateInputStyle = { borderColor: this.invalidColor };
        }

        if ( !this.validateTime('vote_start_time') ) {
            validStartTime = false;

            this.validInput = false;
            this.voteStartTimeInputStyle = {borderColor: this.invalidColor};
        } else {
            validStartTime = true;
        }

        if ( !this.validateTime('vote_end_time') ) {
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

    render() {
        if ( this.state.editMode ) {
            this.validateVariables();
        }

        return (
            <div className="election-campaigns-header dtlsBox electorDtlsStrip clearfix first-box-on-page">
                <div className="flexed flexed-space-between flexed-center electorDtlsData">
                    <div className="city-name-content cluster">
                        <div className="city-name">
                            <a className="cursor-pointer" onClick={this.props.goBackFunction.bind(this)}>
                                <img src={window.Laravel.baseURL + "Images/arrow-back-elections.png"} alt="חזרה"/>
                            </a>{'\u00A0'}{'\u00A0'}
                            {this.props.campaignDetails.name == null ? <i className="fa fa-spinner fa-spin"></i> : this.props.campaignDetails.name}
                        </div>
                    </div>

                    <div className="info-items">
                        <dl className="flexed-column">
                            <dt className="narrow-profit item-space">סוג</dt>
                            <dd>{this.getType()}  </dd>
                        </dl>
                    </div>
                    <div className="info-items">
                        <dl className="flexed-column">
                            <dt className="narrow-profit item-space">תאריך יום בחירות</dt>
                            <dd>{this.renderElectionDate()}</dd>
                        </dl>
                    </div>
                    <div className="info-items">
                        <dl className="flexed-column">
                            <dt className="narrow-profit item-space">תחילת תקופה</dt>
                            <dd>{this.renderElectionStartDate()}</dd>
                        </dl>
                    </div>
                    <div className="info-items">
                        <dl className="flexed-column">
                            <dt className="narrow-profit item-space">סיום תקופה</dt>
                            <dd>{this.renderElectionEndDate()}</dd>
                        </dl>
                    </div>
                    <div className="info-items">
                        <dl className="flexed-column">
                            <dt className="narrow-profit item-space">שעת התחלת ההצבעה</dt>
                            <dd>{this.renderVoteStartTime()}</dd>
                        </dl>
                    </div>
                    <div className="info-items">
                        <dl className="flexed-column">
                            <dt className="narrow-profit item-space">שעת סיום הצבעה</dt>
                            <dd>{this.renderVoteEndTime()}</dd>
                        </dl>
                    </div>
                    <div className="info-items">
                          <dl className="flexed-column">
                          <dt style={{height:'30px'}} className="narrow-profit item-space"></dt>
                          <dd>{this.renderButtons()}</dd>
                      </dl>
                    
                    </div>
                </div>
            </div>
        );
    }
}

export default HeaderBlock;