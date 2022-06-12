import React from 'react';
import { connect } from 'react-redux';
import Collapse from 'react-collapse';

import * as SystemActions from '../../../../actions/SystemActions';
import Combo from '../../../global/Combo';

class SmsProviders extends React.Component {
    componentWillMount() {
        this.types = ['default', 'telemarkting']
        this.initState = {
            isTmFormValid: false,
            isDefaultFormValid: false,
            defaultProvider: { key: null, provider: '', phone_number: '' },
            telemarktingProvider: { key: null, provider: '', phone_number: '' },
            defaultPhoneStyle: {},
            telemarktingPhoneStyle: {}
        }
        this.state = { ...this.initState }
    }
    componentWillReceiveProps(nextPorps) {
        if (nextPorps.sms_providers && this.props.sms_providers != nextPorps.sms_providers) {
            let newState = { ...this.state }
            nextPorps.sms_providers.forEach((providerData) => {
                let currentProviderType = this.types[providerData.type];
                if (currentProviderType && newState[currentProviderType + 'Provider']) {
                    newState[currentProviderType + 'Provider'] = { ...providerData };
                }
            })
            this.setState(newState);
        }
    }
    textIgniter() {
        this.textValues = {
            title: 'עריכת ספקי הודעות'
        };
    }
    updateCollapseStatus(container) {
        if (false == this.props.dirty) {
            this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container });
        } else {
            this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY });
        }
    }
    updateSmsProvider(providerName){
        let providerData = this.state[providerName + 'Provider'];
        if(providerData.key){
            SystemActions.updateSmsProvider(this.props.dispatch, providerData.key , providerData);
        }
    }
    onComboChange(providerName, e) {
        // let newValue = e.target.value;
        let selectedItem = e.target.selectedItem;
        if (selectedItem) {
            let newState = { ...this.state }
            newState[providerName + 'Provider'] = { ...newState[providerName + 'Provider'] }
            newState[providerName + 'Provider'].provider = selectedItem.name;
            this.checkValidData(providerName, newState);
            this.setState(newState)
        }
    }
    onInputChange(providerName, e) {
        let newState = { ...this.state }
        let newValue = e.target.value;
        let fullName = providerName + 'Provider';
        newState[fullName] = { ...newState[fullName] }
        newState[fullName].phone_number = newValue;
       this.checkValidData(providerName, newState);
        this.setState(newState)
    }
    checkValidData(providerName, newState) {
        if (providerName == 'default') {
            let isDefaultFormValid = true;
            newState.defaultPhoneStyle = {};
            let phoneNumberLen = newState.defaultProvider.phone_number.length
            if (phoneNumberLen < 1 || phoneNumberLen > 15) {
                newState.defaultPhoneStyle = { border: '2px red solid' }
                isDefaultFormValid = false;
            }
            newState.isDefaultFormValid = isDefaultFormValid;
        } else {
            let isTmFormValid = true;
            newState.telemarktingPhoneStyle = {};
            let phoneNumberLen = newState.telemarktingProvider.phone_number.length
            if (phoneNumberLen < 1 || phoneNumberLen > 15) {
                newState.telemarktingPhoneStyle = { border: '2px red solid' }
                isTmFormValid = false;
            }
            newState.isTmFormValid = isTmFormValid;
        }
    }
    renderSpinner(){
        return (
            <div className="row form-group">
                <div className="col-md-12">
                    <i className="fa fa-spinner fa-spin"></i>
                </div>
            </div>
        )
    }
    renderDefaultProvider(){
        if (!this.state.defaultProvider.key) {
            return this.renderSpinner();
        } else {
            return (
                <div className="row form-group">

                    <h2 className="col-md-12">
                        <label >ספק הודעות אימות</label>
                    </h2>
                    <div className="col-md-2">
                        <Combo
                            items={this.props.sms_providers_options}
                            itemIdProperty='id'
                            itemDisplayProperty='name'
                            showFilteredList={false}
                            value={this.state.defaultProvider.provider}
                            onChange={this.onComboChange.bind(this, 'default')}
                        />
                    </div>
                    <div className="col-md-2">
                        <input type="text" className="form-control" value={this.state.defaultProvider.phone_number}
                            style={this.state.defaultPhoneStyle} maxLength="15"
                            onChange={this.onInputChange.bind(this, 'default')} />
                    </div>
                    <div className="col-md-2">
                        <button type="button" className="btn btn-primary" disabled={!this.state.isDefaultFormValid}
                            onClick={this.updateSmsProvider.bind(this, 'default')}>שמור</button>
                    </div>
                </div>
            )
        }
        
    }
    renderTelemarktingProvider() {
        if (!this.state.telemarktingProvider.key) {
            return this.renderSpinner();
        } else {
            return (
                <div className="row form-group">
                    <h2 className="col-md-12">
                        <label >ספק הודעות שיווק</label>
                    </h2>
                    <div className="col-md-2">
                        <Combo
                            items={this.props.sms_providers_options}
                            itemIdProperty='id'
                            itemDisplayProperty='name'
                            showFilteredList={false}
                            value={this.state.telemarktingProvider.provider}
                            onChange={this.onComboChange.bind(this, 'telemarkting')}
                        />
                    </div>
                    <div className="col-md-2">
                        <input type="text" className="form-control" value={this.state.telemarktingProvider.phone_number}
                            style={this.state.telemarktingPhoneStyle} maxLength="15"
                            onChange={this.onInputChange.bind(this, 'telemarkting')} />
                    </div>
                    <div className="col-md-2">
                        <button type="button" className="btn btn-primary" disabled={!this.state.isTmFormValid}
                            onClick={this.updateSmsProvider.bind(this, 'telemarkting')}>שמור</button>
                    </div>
                </div>
            )
        }
       
    }
    render() {
        this.textIgniter();
        let hasTabPermission = (this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.sms_providers']);
        return (
            <div className={"ContainerCollapse" + (hasTabPermission ? '' : ' hidden')}>
                <a onClick={this.updateCollapseStatus.bind(this, 'smsProviders')} aria-expanded={this.props.containerCollapseStatus.smsProviders}>
                    <div className="collapseArrow closed"></div>
                    <div className="collapseArrow open"></div>
                    <span className="collapseTitle">{this.textValues.title}</span>
                </a>
                <Collapse isOpened={this.props.containerCollapseStatus.smsProviders}>
                    <div className="CollapseContent">
                        <form className="form-horizontal">
                            {this.renderDefaultProvider()}
                            {this.renderTelemarktingProvider()}
                        </form>

                    </div>
                </Collapse>
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        sms_providers: state.system.lists.sms_providers,
        sms_providers_options: state.system.listsScreen.systemTab.sms_providers_options,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        currentUser: state.system.currentUser,
        dirty: state.system.listsScreen.dirty,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(SmsProviders);