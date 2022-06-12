import React from 'react';
import { connect } from 'react-redux';

import * as callActions from '../../../../../actions/callActions';

class ActionAreaMenu extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.menuItems = [
            { name: '', label: 'סיום שיחה', className: '', permission: 'allow' },
            { name: 'Household', label: 'בית אב', className: 'fa fa-home', permission: 'cti.activity_area.household' },
            { name: 'Transportation', label: 'הסעה', className: 'fa fa-bus', permission: 'cti.activity_area.transportation' },
            { name: 'Address', label: 'כתובת', className: 'fa fa-map-marker', permission: 'cti.activity_area.address' },
            { name: 'ContactInfo', label: 'פרטי קשר', className: 'fa fa-mobile', permission: 'cti.activity_area.contacts' },
            { name: 'Status', label: 'סטטוס', className: 'fa fa-archive', permission: 'cti.activity_area.support_status' },
            { name: 'Messages', label: 'מסרים', className: 'fa fa-file', permission: 'cti.activity_area.messages' },
        ];

        this.endCallText = 'סיום שיחה';
    }

    toggleShowEndCallStatusMenu() {
        if (this.props.showEndCallStatus) {
            callActions.hideEndCallStatusMenu(this.props.dispatch);
        } else {
            callActions.showEndCallStatusMenu(this.props.dispatch);
        }
    }

    /**
     * Check if campaign has permission to display menu item
     *
     * @param object permission
     * @return boolean
     */
    campaignHasPermission(permission) {
        if ((this.props.permissions[permission] != undefined) && (Number(this.props.permissions[permission].value) > 0)) {
            return true;
        } else {
            return false;
        }
    }

    render() {
        if (this.props.showEndCallStatus) {
            this.endCallStyle = {
                background: '#da4453',
                color: 'white'
            };

            this.endCallTextStyle = { fontWeight: 'bold' };
        } else {
            this.endCallStyle = {};
            this.endCallTextStyle = {};
        }

        return (
            <div className="action-area-menu">
                <div className="action-area-menu__btn action-area-menu__btn_type_end-call_icon"
                    style={this.endCallStyle}
                    onClick={this.toggleShowEndCallStatusMenu.bind(this)}>
                    <i className="fa fa-flag" aria-hidden="true"></i>
                </div>
                <div className="action-area-menu__btn action-area-menu__btn_type_end-call" style={this.endCallTextStyle}>
                    {this.endCallText}
                </div>
                {
                    this.menuItems.map(item => {
                        if ((this.props.actionAreaMenuItems.includes(item.name)) && (this.campaignHasPermission(item.permission))){
                            let notValidClass = this.props.validationVoterCallData[item.name] ? ' ' : ' nav-item_invalid';
                            return (
                                <div className={'action-area-menu__btn' + notValidClass + ' action-area-menu__btn_type_' + item.name 
                                   + ((item.name === this.props.activeActionArea && !this.props.showEndCallStatus) ? ' action-area-menu__btn_active' : '')
                                }
                                    key={item.name}
                                    onClick={() => this.props.onAreaAcionMenuClick(item.name)}
                                >
                                    <i className={item.className} aria-hidden="true" />{item.label}
                                </div>
                            );
                        }
                    })
                }
            </div>
        );
    }
};


function mapStateToProps(state) {
    return {
        validationVoterCallData: state.ui.validationVoterCallData,
        showEndCallStatus: state.call.activeCall.showEndCallStatus,
    }
}

export default connect(mapStateToProps)(ActionAreaMenu);