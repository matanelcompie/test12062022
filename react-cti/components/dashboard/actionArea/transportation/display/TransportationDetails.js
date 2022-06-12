import React from 'react';
import { connect } from 'react-redux';

import ComboSelect from '../../../../common/ComboSelect';

import * as callActions from '../../../../../actions/callActions';
import * as uiActions from '../../../../../actions/uiActions';


class TransportationDetails extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.labels = {
            fromTime: 'משעה',
            toTime: 'עד שעה',
            carModel: 'סוג רכב',
            selectPassengers: 'בחר נוסעים'
        };

        this.arrCarTypes = [
            { value: 0, label: 'רגיל' },
            { value: 1, label: 'נכה' }
        ];
    }

    componentWillMount() {
        this.household = this.props.household.map(function (item, index) {
            return { value: item.id, label: item.first_name + ' ' + item.last_name };
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.transportation != nextProps.transportation) {
            let valid = true;
            if (nextProps.transportation.fromHours < 0 || nextProps.transportation.fromHours > 23) valid = false;
            if (valid && (nextProps.transportation.fromMinutes < 0 || nextProps.transportation.fromMinutes > 59)) valid = false;
            if (valid && (nextProps.transportation.toHours < 0 || nextProps.transportation.toHours > 23)) valid = false;
            if (valid && (nextProps.transportation.toMinutes < 0 || nextProps.transportation.toMinutes > 59)) valid = false;
            if (valid) {
                let fromMinutes = nextProps.transportation.fromHours * 60 + nextProps.transportation.fromMinutes;
                let toMinutes = nextProps.transportation.toHours * 60 + nextProps.transportation.toMinutes;
                if (fromMinutes >= toMinutes) valid = false;
            }
            uiActions.setActionAreaValidationStatus(this.props.dispatch, 'Transportation', valid);
        }
    }

    changeTransportInputField(fieldName, e) {
        callActions.changeTransportationInputField(this.props.dispatch, fieldName, e.target.value);
    }

    changePassengers(event) {
        let values = _.map(event.target.selectedItems, 'value');

        callActions.changeTransportationInputField(this.props.dispatch, 'passengers', values);
    }

    undoChanges() {
        callActions.undoTransportDataChanges(this.props.dispatch);
    }

    /**
     * Set style for time input
     *
     * @return void
     */
    setTimeStyle() {
        this.timeStyle = {
            fromHours: {},
            fromMinutes: {},
            toHours: {},
            toMinutes: {}
        };
            if (this.props.transportation.fromHours < 0 || this.props.transportation.fromHours > 23) this.timeStyle.fromHours.borderColor = "red";
            if (this.props.transportation.fromMinutes < 0 || this.props.transportation.fromMinutes > 59) this.timeStyle.fromMinutes.borderColor = "red";
            if (this.props.transportation.toHours < 0 || this.props.transportation.toHours > 23) this.timeStyle.toHours.borderColor = "red";
            if (this.props.transportation.toMinutes < 0 || this.props.transportation.toMinutes > 59) this.timeStyle.toMinutes.borderColor = "red";
            let fromMinutes = this.props.transportation.fromHours * 60 + this.props.transportation.fromMinutes;
            let toMinutes = this.props.transportation.toHours * 60 + this.props.transportation.toMinutes;
            if (fromMinutes >= toMinutes) {
                this.timeStyle.toHours.borderColor = "red";
                this.timeStyle.toMinutes.borderColor = "red";
            }          
    }

    render() {
        this.setTimeStyle();
        let passengersValue = "";

        if (this.props.transportation.passengers.length == 0) {
            passengersValue = "";
        } else {
            passengersValue = this.props.transportation.passengers.join(',');
        }

        return (
            <div className="transportation-details__container">
                <div className="transportation-details__column1">
                    <div className="transportation-details__label">
                        {this.labels.fromTime}
                    </div>

                    <div className="transportation-details__time">
                        <input type="number" min="00" max="59" step="1" value={this.props.transportation.fromMinutes}
                            disabled={!this.props.canEditDetails}
                            onChange={this.changeTransportInputField.bind(this, 'fromMinutes')} 
                            style={this.timeStyle.fromMinutes}/>
                        {'\u00A0'}:{'\u00A0'}
                        <input type="number" min="00" max="23" step="1" value={this.props.transportation.fromHours}
                            disabled={!this.props.canEditDetails}
                            onChange={this.changeTransportInputField.bind(this, 'fromHours')}
                            style={this.timeStyle.fromHours} />
                    </div>

                    <div className="transportation-details__label">
                        {this.labels.carModel}
                    </div>

                    <div>
                        <ComboSelect
                            value={this.props.transportation.isCrippled}
                            name="isCrippled"
                            options={this.arrCarTypes}
                            itemDisplayProperty="label"
                            itemIdProperty="value"
                            className="transportation-details__crippled"
                            onChange={this.changeTransportInputField.bind(this, 'isCrippled')}
                            disabled={!this.props.canEditDetails}
                        />
                    </div>
                </div>

                <div className="transportation-details__column2">
                    <div className="transportation-details__label">
                        {this.labels.toTime}
                    </div>

                    <div className="transportation-details__time">
                        <input type="number" min="00" max="59" step="1" value={this.props.transportation.toMinutes}
                            disabled={!this.props.canEditDetails}
                            onChange={this.changeTransportInputField.bind(this, 'toMinutes')}
                            style={this.timeStyle.toMinutes} />
                        {'\u00A0'}:{'\u00A0'}
                        <input type="number" min="00" max="23" step="1" value={this.props.transportation.toHours}
                            disabled={!this.props.canEditDetails}
                            onChange={this.changeTransportInputField.bind(this, 'toHours')}
                            style={this.timeStyle.toHours} />
                    </div>

                    <div className="transportation-details__label">{this.labels.selectPassengers}</div>

                    <div className="transportation-details__passengers">
                        <ComboSelect
                            value={passengersValue}
                            name="passengers"
                            options={this.household}
                            itemDisplayProperty="label"
                            itemIdProperty="value"
                            multiSelect={true}
                            selectedValues={this.props.transportation.passengers}
                            onChange={this.changePassengers.bind(this)}
                            disabled={!this.props.canEditDetails}
                        />
                    </div>
                </div>

                <div className="transportation-details__column3">
                    <button onClick={this.undoChanges.bind(this)}>
                        <i className="fa fa-undo fa-6" />
                    </button>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        transportation: state.call.activeCall.voter.transportation,
        household: state.call.activeCall.voter.household,
        oldTansportationData: state.call.oldTansportationData
    }
}

export default connect(mapStateToProps)(TransportationDetails);