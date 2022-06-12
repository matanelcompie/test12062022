import React from 'react';
import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import {parseDateToPicker, parseDateFromPicker} from '../../../libs/globalFunctions';

class DateAndTimePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dateValue: new Date()
        };
        this.handleChange = this.handleChange.bind(this);
        momentLocalizer(moment);
    }

    handleChange(dateValue, format, functionParams) {
        console.log('date value from picker: ', dateValue);
        console.log('functionParams', functionParams);
        
        this.setState({
            dateValue
        });
    }

    render() {
        return(
                <div className="row">
                    <div className="col-md-3">
                        <ReactWidgets.DateTimePicker 
                            isRtl={true}
                            value={parseDateToPicker(this.state.dateValue)}
                            onChange={parseDateFromPicker.bind(this, {callback: this.handleChange, format: "DD-MM-YYYY HH:mm:ss", functionParams: 'dateTime'})}
                            format="DD/MM/YYYY HH:mm"
                            className="someClass"
                            style={{color: 'red'}}
                            />
                    </div>
                </div>
                        )
            }
        }

        export default DateAndTimePicker;