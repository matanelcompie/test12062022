import React from 'react';
import { connect } from 'react-redux';

import StatusNameMenuItem from './StatusNameMenuItem';

class ActionAreaMenuDrawer extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.endCallStatus = require('../../../../../libs/constants').endCallStatus;

        this.nextCallText = 'עבור לשיחה הבאה';
        this.askForBreakText = 'בקש הפסקה';
    }

    renderItems() {
        let that = this;

        this.rendredItems = this.props.endCallStatusesList.map(function (item, index) {
            return <StatusNameMenuItem key={index} item={item} endCallStatusCode={that.props.endCallStatusCode}
                endCallStatusSubItemValue={that.props.endCallStatusSubItemValue} canUserEndCall={that.props.canUserEndCall} />
        });
    }

    render() {
        let buttonDivStyle = { textAlign: 'center', marginTop: '20px' };
        this.renderItems();
        let endCallButtonStyle = this.props.canUserEndCall ? {} : { opacity: '0.7', cursor: 'not-allowed' }
        return (
            <div className={"action-area-menu-container " + ((!this.props.showEndCallStatus) ? 'hide' : '')}>
                <div className="action-area-menu-overlay"></div>
                <div className="action-area-menu-drawer">
                    {this.rendredItems}

                    <div style={buttonDivStyle}>
                        <button className="cti-btn cti-btn_type_primary" onClick={this.props.nextCall} style={endCallButtonStyle}>
                            {this.props.askForBreak ? this.askForBreakText : this.nextCallText}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        askForBreak: state.campaign.askForBreak,
        endCallStatusSubItemValue: state.call.activeCall.endCallStatusSubItemValue,
        endCallStatusCode: state.call.activeCall.endCallStatusCode,
        showEndCallStatus: state.call.activeCall.showEndCallStatus,
    }
}

export default connect(mapStateToProps)(ActionAreaMenuDrawer);