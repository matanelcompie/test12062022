import React from 'react';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import Combo from '../../global/Combo';

import { parseDateToPicker, parseDateFromPicker } from '../../../libs/globalFunctions';


class FilesFilters extends React.Component {
    constructor(props) {
        super(props);

        momentLocalizer(moment);

        this.state = {
            searchFields: {
                from_date: '',
                to_date: '',
                file_name: '',
                execution_status: {id: null, name: ''},
                user: ''
            },

            combos: {
                cscParserStatus: []
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.csvParserStatus = require('../../../libs/constants').csvParserStatus;

        this.emptyExecutionStatus = {id: null, name: ''};

        this.invalidColor = '#cc0000';

        this.buttonTexts = {
            search: 'חפש',
            reset: 'נקה הכל'
        };
    }

    componentWillMount() {
        let combos = this.state.combos;

        combos.cscParserStatus = [
            {id: this.csvParserStatus.didNotStart, name: 'לא התחיל'},
            {id: this.csvParserStatus.atWork, name: 'בתהליך'},
            {id: this.csvParserStatus.success, name: 'עבר בהצלחה'},
            {id: this.csvParserStatus.waiting, name: 'ממתין לאישור'}
        ];
        this.setState({combos});
    }

    resetFilters() {
        let searchFields = this.state.searchFields;

        searchFields.from_date = '';
        searchFields.to_date = '';
        searchFields.file_name = '';
        searchFields.execution_status = this.emptyExecutionStatus;
        searchFields.user = '';

        this.setState({searchFields});
    }

    changeCsvFilters() {
        this.props.changeCsvFilters(this.state.searchFields);
    }

    executionStatusChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        if ( null == selectedItem ) {
            searchFields.execution_status = {...this.emptyExecutionStatus, name: event.target.value};
        } else {
            searchFields.execution_status = {
                id: selectedItem.id,
                name: selectedItem.name
            };
        }

        this.setState({searchFields});
    }

    inputFieldChange(fieldName, event) {
        let searchFields = this.state.searchFields;

        searchFields[fieldName] = event.target.value;
        this.setState({searchFields});
    }

    toDateChange(value, filter) {
        let searchFields = this.state.searchFields;

        searchFields.to_date = value;
        this.setState({searchFields});
    }

    fromDateChange(value, filter) {
        let searchFields = this.state.searchFields;

        searchFields.from_date = value;
        this.setState({searchFields});
    }

    validateExecutionStatus() {
        if ( this.state.searchFields.execution_status.name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.execution_status.id != null);
        }
    }

    validateToDate() {
        if ( 0 == this.state.searchFields.to_date.length ) {
            return true;
        }

        if (moment(this.state.searchFields.to_date, 'YYYY-MM-DD', true).isValid()) {
            return this.state.searchFields.to_date >= this.state.searchFields.from_date;
        } else {
            return false;
        }
    }

    validateFromDate() {
        if ( 0 == this.state.searchFields.from_date.length ) {
            return true;
        }

        return moment(this.state.searchFields.from_date, 'YYYY-MM-DD', true).isValid();
    }

    validateVariables() {
        this.validInputs = true;

        if ( !this.validateFromDate() ) {
            this.fromDateInputStyle = {borderColor: this.invalidColor};
            this.validInputs = false;
        }

        if ( !this.validateToDate() ) {
            this.toDateInputStyle = {borderColor: this.invalidColor};
            this.validInputs = false;
        }

        if ( !this.validateExecutionStatus() ) {
            this.executionStatusInputStyle = {borderColor: this.invalidColor};
            this.validInputs = false;
        }
    }

    initVariables() {
        this.fromDateInputStyle = {};
        this.toDateInputStyle = {};
        this.executionStatusInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className="dtlsBox srchPanel clearfix" style={{marginTop: '20px'}}>
                <div className="col-lg-4 col-md-4">
                    <div className="form-group">
                        <label htmlFor="elections-import-upload-from" className="control-label">העלאה מתאריך</label>
                        <ReactWidgets.DateTimePicker
                            id="elections-import-upload-from"
                            isRtl={true} time={false}
                            value={parseDateToPicker(this.state.searchFields.from_date)}
                            onChange={parseDateFromPicker.bind(this, {callback: this.fromDateChange,
                                format: "YYYY-MM-DD",
                                functionParams: 'dateTime'})
                            }
                            format="DD/MM/YYYY"
                            style={this.fromDateInputStyle}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="elections-import-file-name" className="control-label">שם קובץ</label>
                        <input type="text" className="form-control" id="elections-import-file-name"
                               value={this.state.searchFields.file_name}
                               onChange={this.inputFieldChange.bind(this, 'file_name')}/>
                    </div>
                </div>

                <div className="col-lg-4 col-md-4">
                    <div className="form-group">
                        <label htmlFor="elections-import-upload-to" className="control-label">העלאה עד תאריך</label>
                        <ReactWidgets.DateTimePicker
                            id="elections-import-upload-to"
                            isRtl={true} time={false}
                            value={parseDateToPicker(this.state.searchFields.to_date)}
                            onChange={parseDateFromPicker.bind(this, {callback: this.toDateChange,
                                format: "YYYY-MM-DD",
                                functionParams: 'dateTime'})
                            }
                            format="DD/MM/YYYY"
                            style={this.toDateInputStyle}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="elections-import-user" className="control-label">משתמש מעלה</label>
                        <input type="text" className="form-control" id="elections-import-user"
                               value={this.state.searchFields.user}
                               onChange={this.inputFieldChange.bind(this, 'user')}/>
                    </div>
                </div>

                <div className="col-lg-4 col-md-4">
                    <div className="form-group">
                        <label htmlFor="elections-import-execution-status" className="control-label">סטטוס ביצוע</label>
                        <Combo id="elections-import-execution-status"
                               items={this.state.combos.cscParserStatus}
                               maxDisplayItems={10}
                               itemIdProperty="id"
                               itemDisplayProperty="name"
                               className="form-combo-table"
                               inputStyle={this.executionStatusInputStyle}
                               value={this.state.searchFields.execution_status.name}
                               onChange={this.executionStatusChange.bind(this)}
                        />
                    </div>

                    <div className="box-button-double pull-left">
                        <button title="חפש" type="submit" className="btn btn-primary srchBtn"
                                onClick={this.changeCsvFilters.bind(this)}
                                disabled={!this.validInputs}>
                            {this.buttonTexts.search}
                        </button>


                        <button title="נקה הכל" type="submit" className="btn btn-danger" style={{marginRight: '10px'}}
                                onClick={this.resetFilters.bind(this)}>
                            {this.buttonTexts.reset}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default FilesFilters;