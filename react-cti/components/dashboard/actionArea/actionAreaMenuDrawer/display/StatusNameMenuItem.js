import React from 'react';
import { connect } from 'react-redux';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import CheckboxInput from 'components/common/CheckboxInput';
import ComboSelect from 'components/common/ComboSelect';

import { parseDateToPicker, parseDateFromPicker } from '../../../../../libs/globalFunctions';

import * as callActions from '../../../../../actions/callActions';


class StatusNameMenuItem extends React.Component {
    constructor(props) {
        super(props);

        momentLocalizer(moment);
    }

    onCheck() {
        if (this.props.item.code == this.props.endCallStatusCode) {
            callActions.changeEndCallStatusCode(this.props.dispatch);
        } else {
            callActions.changeEndCallStatusCode(this.props.dispatch, this.props.item.code);
        }
    }

    comboChange(subItemName, event) {
        if (event.target.selectedItem != null) {
            callActions.changeEndCallStatusSubMenu(this.props.dispatch, subItemName, event.target.selectedItem.value);
        } else {
            callActions.changeEndCallStatusSubMenu(this.props.dispatch, subItemName, '');
        }
    }

    timeDataChange(value, params) {
        if (null == value) {
            callActions.changeEndCallStatusSubMenu(this.props.dispatch, params.subItemName, '');
        } else {
            callActions.changeEndCallStatusSubMenu(this.props.dispatch, params.subItemName, value);
        }
    }

    renderSubItems() {
        let that = this;
        let comboInputStyle = {};

        let subItems = this.props.item.subItems.map(function (subItem, index) {
            let itemValue = '';
            let dateInputStyle = {}
            let redBorderStyle = { border: '1px solid red' }

            if (that.props.endCallStatusSubItemValue[subItem.name] == undefined ||
                that.props.endCallStatusSubItemValue[subItem.name] == null) {
                itemValue = '';
                comboInputStyle = {};
            } else {
                itemValue = that.props.endCallStatusSubItemValue[subItem.name];
                comboInputStyle = { color: 'black', height: '20%' };
            }
            if (!that.props.canUserEndCall) {
                if (itemValue == '' || itemValue == 'Invalid date') {
                    dateInputStyle = { ...redBorderStyle };
                    comboInputStyle = { ...comboInputStyle, ...redBorderStyle };
                }
            }
            switch (subItem.type) {
                case 'combo':
                    return (
                        <li key={subItem.name}>
                            <ComboSelect
                                options={subItem.items}
                                className="drawer-combo"
                                inputStyle={comboInputStyle}
                                name={subItem.name}
                                value={itemValue}
                                defaultValue={itemValue}
                                itemDisplayProperty="label"
                                itemIdProperty="value"
                                multiSelect={false}
                                onChange={that.comboChange.bind(that, subItem.name)}
                            />
                        </li>
                    );

                case 'date':
                    return (
                        <li key={subItem.name} className="sub-item-datetime sub-item-date">
                            <ReactWidgets.DateTimePicker
                                isRtl={true} time={false}
                                value={parseDateToPicker(itemValue)}
                                onChange={parseDateFromPicker.bind(that, {
                                    callback: that.timeDataChange,
                                    format: "YYYY-MM-DD",
                                    functionParams: { subItemName: subItem.name }
                                })
                                }
                                min={new Date()}
                                format={"DD/MM/YYYY"}
                                style={dateInputStyle}
                            />
                        </li>
                    );

                case 'time':
                    return (
                        <li key={subItem.name} className="sub-item-datetime sub-item-time">
                            <ReactWidgets.DateTimePicker
                                isRtl={true} calendar={false} time={true}
                                value={parseDateToPicker(itemValue)}
                                onChange={parseDateFromPicker.bind(that, {
                                    callback: that.timeDataChange,
                                    format: "HH:mm:ss",
                                    functionParams: { subItemName: subItem.name }
                                })
                                }
                                format={"HH:mm"}
                                timeFormat={"HH:mm"}
                                style={dateInputStyle}
                            />
                        </li>
                    );
            }
        });

        return subItems;
    }

    render() {
        return (
            <div className="action-area-menu-drawer_item" key={this.props.key}>
                <div className="action-area-menu-drawer_item-head">
                    <CheckboxInput
                        name="end_call_status"
                        checked={this.props.item.code == this.props.endCallStatusCode}
                        onChange={this.onCheck.bind(this)}
                        label={this.props.item.label}
                        className="drawer-checkbox"
                    />
                    {(this.props.item.subItems.length > 0) ? <i className="fa fa-caret-down"></i> : ''}
                </div>
                {
                    (this.props.item.subItems.length > 0 && this.props.item.code == this.props.endCallStatusCode) ?
                        <ul className="action-area-menu-drawer_item-sub-items">
                            {this.renderSubItems()}
                        </ul> : ''
                }
            </div>
        );
    }
}

export default connect()(StatusNameMenuItem);