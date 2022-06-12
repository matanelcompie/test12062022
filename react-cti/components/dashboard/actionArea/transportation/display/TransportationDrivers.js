import React from 'react';
import { getCtiPermission } from 'libs/globalFunctions';


class TransportationDrivers extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.texts = {
            attention: 'שים לב !, שים לב, לאשכול משובץ נהג.',
            driversList: 'רשימה של נהגים'
        };
    }

    getDriversForColumns() {
        let numOfdriversCol1 = 0;
        let driverIndex = 0;

        this.driversCol1 = [];
        this.driversCol2 = [];

        numOfdriversCol1 = Math.ceil(this.props.drivers.length / 2);

        for (driverIndex = 0; driverIndex < numOfdriversCol1; driverIndex++) {
            this.driversCol1.push(this.props.drivers[driverIndex]);
        }

        for (driverIndex = numOfdriversCol1; driverIndex < this.props.drivers.length; driverIndex++) {
            this.driversCol2.push(this.props.drivers[driverIndex]);
        }
    }

    renderColumn2() {
        let drivers = this.driversCol2.map(function (item, index) {
            return (
                <div key={index} className="transportation-drivers__driver-name">
                    {item.name} - {item.phone_number}
                </div>
            );
        });

        return drivers;
    }

    renderColumn1() {
        let drivers = this.driversCol1.map(function (item, index) {
            return (
                <div key={index} className="transportation-drivers__driver-name">
                    {item.name} - {item.phone_number}
                </div>
            );
        });

        return drivers;
    }

    render() {
        let displayBlockStyle = {};

        if (!this.props.showDriversList) {
            displayBlockStyle = { display: 'none' };
        }

        this.getDriversForColumns();

        return (
            <div className="transportation-drivers" style={displayBlockStyle}>
                <div className="transportation-drivers__row">
                    <div className="transportation-drivers__attention">{this.texts.attention}</div>
                    <div className="transportation-drivers__close">
                        <i className="fa fa-times-circle-o" aria-hidden="true" onClick={this.props.hideDriversBlock}></i>
                    </div>
                </div>

                <div className="transportation-drivers__list-title">{this.texts.driversList}</div>

                <div className="transportation-drivers__row">
                    <div className="transportation-drivers__list-col1">
                        {this.renderColumn1()}
                    </div>

                    <div className="transportation-drivers__list-col2">
                        {this.renderColumn2()}
                    </div>
                </div>
            </div>
        );
    }
}

export default TransportationDrivers;