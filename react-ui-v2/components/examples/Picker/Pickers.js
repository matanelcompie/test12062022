import React from 'react';
import DatePicker from 'react-datepicker';
import ReactWidgets from 'react-widgets';
import moment from 'moment';

import momentLocalizer from 'react-widgets/lib/localizers/moment';

class Pickers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: null,
            startDate2: null,
        };
        this.datePickerHandleChange = this.datePickerHandleChange.bind(this);

        momentLocalizer(moment);
    }

    datePickerHandleChange(date) {
        console.log('date', date);

        this.setState({
            startDate: date
        });
    }

    handleChange2(date) {
        console.log('date2', moment(date));

        this.setState({
            startDate2: moment(date)
        });
    }

    handleChangeRaw(value) {
        const rawDate = moment(value, ["DD/MM/YYYY", "YYYY/MM/DD", "DD-MM-YYYY", "YYYY-MM-DD", "YYYYDDMM", "YYDDMM", "DDMMYY", "DDMMYYYY"], true);

        if (rawDate.isValid()) {
            console.log('%c *** VALID *** ', 'color: #ff0000');
            console.log('rawDate', rawDate.toString());
            this.datePickerHandleChange(rawDate);
        }
    }

    render() {
        var DateTimePicker = ReactWidgets.DateTimePicker;
        return(
                <div className="row">
                    <div className="col-md-3">
                        <DatePicker
                            dateFormat="DD-MM-YYYY"
                            selected={this.state.startDate}
                            onChange={this.datePickerHandleChange}
                            todayButton={"היום"}
                            placeholderText="Click to select a date"
                            locale="he-il"
                            isClearable={true}
                            className="form-control"
                            onChangeRaw={(event) => this.handleChangeRaw(event.target.value)}
                            />
                    </div>
                    <div className="col-md-3">
                    </div>
                    <div className="col-md-3">
                        <DateTimePicker 
                            isRtl={true}
                            value={this.state.startDate2}
                            onChange={this.handleChange2}
                            />
                    </div>
                </div>
                )
    }
}

export default Pickers;