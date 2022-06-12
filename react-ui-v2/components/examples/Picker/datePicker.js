import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';

class Picker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: null
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(date) {
//        console.log('date parts', date.toObject());
//        console.log('toString', date.toString());

//        console.log('toDate', date.toDate());
//        console.log('date.format', date.format("DD-MM-YYYY"));
        console.log('date', date);

        this.setState({
            startDate: date
        });
    }

    handleChangeRaw(value) {
        const rawDate = moment(value, [ "DD/MM/YYYY", "YYYY/MM/DD", "DD-MM-YYYY", "YYYY-MM-DD", "YYYYDDMM","YYDDMM", "DDMMYY", "DDMMYYYY"], true);

        if(rawDate.isValid()){
            console.log('%c *** VALID *** ','color: #ff0000');
            console.log('rawDate',rawDate.toString());
            this.handleChange(rawDate);
        }
    }
    
    render() {
        return <DatePicker
            dateFormat="DD-MM-YYYY"
            selected={this.state.startDate}
            onChange={this.handleChange}
            todayButton={"היום"}
            placeholderText="Click to select a date"
            locale="he-il"
            isClearable={true}
            className="form-control"
            onChangeRaw={(event) =>this.handleChangeRaw(event.target.value)}
            />;
    }
}

export default Picker;