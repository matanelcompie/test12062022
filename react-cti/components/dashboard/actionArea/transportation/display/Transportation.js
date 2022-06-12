import React from 'react';
import { connect } from 'react-redux';

import TransportationDetails from './TransportationDetails';
import TransportationDrivers from './TransportationDrivers';

import * as uiActions from '../../../../../actions/uiActions';
import * as callActions from '../../../../../actions/callActions';
import { getCtiPermission } from '../../../../../libs/globalFunctions';


class Transportation extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.label = {
            needsTransportation: 'הבוחר זקוק להסעה'
        };
        this.coordination = {
            phoneText: "מס' טלפון לתיאום הסעות"
        };
    }

    hideDriversBlock() {
        uiActions.hideDriversListBlock(this.props.dispatch);
    }

    allowEditTransport() {
        uiActions.allowEditTransportation(this.props.dispatch);
    }

    updateTransportationNeed() {
        let newTransportationNeed = !this.props.needsTransportation;

        callActions.updateTransportationNeed(this.props.dispatch, newTransportationNeed);
    }

    renderTransportationOverlay() {
        if (this.props.oldTansportationData.needsTransportation) {
            return (
                <div className={"transportation-content" + ((this.props.shouldEditTransportation) ? ' hide' : '')}>
                    <div className="transportation-overlay" />

                    <div className="transportation-edit">
                        <button className="cti-btn" onClick={this.allowEditTransport.bind(this)}>עריכה</button>
                    </div>
                </div>
            );
        }
    }

    renderTransportationDrivers() {
        if (this.props.needsTransportation && this.props.drivers.length > 0) {
            return (
                <TransportationDrivers
                    showDriversList={this.props.showDriversList}
                    hideDriversBlock={this.hideDriversBlock.bind(this)}
                    drivers={this.props.drivers}
                />
            );
        }
    }
    renderTransportationCoordinateDetails() {
        let coordinateStyle = {
            color: '#1BB48D',
            fontWeight: 'bold'
        };
        if (this.props.needsTransportation) {
            return (
                <div className="transportation-details__coordination">
                    <div style={{ color: '#1BB48D' }}>{this.coordination.phoneText}</div>
                   
                    <div style={coordinateStyle}>{ this.props.campaignData.transportation_coordination_phone }</div>
                </div>
            );
        }
    }

    renderTransportationDetails() {
        if (this.props.needsTransportation) {
            return <TransportationDetails canEditDetails={getCtiPermission(this.props.permissions, 'transportation_details', true)} />;
        }
    }

    render() {

        let switchStyle = {
            backgroundColor: '#ccc'
        };

        let headerStyle = {
            backgroundColor: '#EDEEF0'
        };

        if (this.props.needsTransportation) {
            headerStyle.backgroundColor = 'white';
            switchStyle.backgroundColor = '#1999e4';
        }
        let permissions = this.props.permissions;
        // console.log(this.props.campaignData);
        return (
            <div className="transportation action-content">
                <div className="action-content__header" style={headerStyle}>
                    <span className="action-content__title transportation-header__title">{this.label.needsTransportation}</span>

                    <div className="container">
                        <label htmlFor='switch-toggle' className="switch" style={switchStyle}>
                            <input id="switch-toggle" type="checkbox" checked={this.props.needsTransportation}
                                onChange={this.updateTransportationNeed.bind(this)} />
                            <div></div>
                        </label>
                    </div>
                </div>

                {getCtiPermission(permissions, 'drivers') && this.renderTransportationDrivers()}

                {this.renderTransportationOverlay()}

                {getCtiPermission(permissions, 'transportation_details') && this.renderTransportationDetails()}
                {getCtiPermission(permissions, 'phone_coordinate') && this.renderTransportationCoordinateDetails()}

            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        oldTansportationData: state.call.oldTansportationData,
        needsTransportation: state.call.activeCall.voter.transportation.needs_transportation,
        showDriversList: state.ui.transportation.showDriversList,
        shouldEditTransportation: state.ui.transportation.shouldEditTransportation,
        drivers: state.ui.transportation.drivers,
        inCallScreen: state.call.inCallScreen,
        permissions: state.campaign.permissions,
        campaignData: state.campaign.campaignData
    }
}

export default connect(mapStateToProps)(Transportation);
