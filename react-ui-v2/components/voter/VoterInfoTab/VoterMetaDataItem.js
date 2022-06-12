import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Combo from '../../global/Combo';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';


class VoterMetaDataItem extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.fieldTextPlaceholder = "ערך";
        this.fieldNumberPlaceholder = "ערך מספרי";

        this.setDirtyTarget = "elections.voter.additional_data.meta";
    }

    getComboFieldId(fieldValue) {
        let valuesList = this.props.metaValuesItems;
        let selectedIndex = -1;
        let selectedId = 0;

        selectedIndex = valuesList.findIndex(fieldItem => fieldItem.value == fieldValue);
        if ( -1 == selectedIndex ) {
            return 0;
        } else {
            selectedId = valuesList[selectedIndex].id;
            return selectedId;
        }
    }

    comboValueChange(e) {
        var fieldValue = e.target.value;
        var fieldId = 0; // The id of the selected row in combo list
        var validField = true;

        fieldId = this.getComboFieldId(fieldValue);

        if ( fieldValue.length > 0 && 0 == fieldId ) {
            validField = false;
        } else {
            validField = true;
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_ADDITIONAL_DATA_COMBO_CHANGE,
                             metaKeyId: this.props.metaKeyId,
                             fieldId: fieldId,
                             fieldValue: fieldValue,
                             validField: validField});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    fieldNumberValueChange(e) {
        var fieldValue = e.target.value;
        var validField = true;

        validField = this.validateNumber(fieldValue);

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_ADDITIONAL_DATA_NUMBER_INPUT_CHANGE,
                             metaKeyId: this.props.metaKeyId,
                             fieldValue: fieldValue,
                             validField: validField});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    fieldTextValueChange(e) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_ADDITIONAL_DATA_TEXT_INPUT_CHANGE,
                             metaKeyId: this.props.metaKeyId,
                             fieldValue: e.target.value});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    initVariables () {
        this.fieldId = "inputField" + this.props.metaKeyId;

        this.fieldListDivClass = "form-group";
        this.fieldNumberDivClass = "form-group";
    }

    validateNumber(fieldValue) {
        if ( 0 == fieldValue.length ) {
            return true;
        }

        let reg = /^(|[1-9]\d*)$/;
        let regLeadingZeros = /^0+/;

        if ( fieldValue.length == 1 && 0 == fieldValue  ) {
            return true;
        }

        if ( reg.test(fieldValue) && !regLeadingZeros.test(fieldValue) ) {
            return true;
        } else {
            return false;
        }
    }

    validateFieldValueNumber() {
        if ( this.props.voterDataItem == undefined ) {
            return true;
        }

        if ( this.validateNumber(this.props.voterDataItem.value) ) {
            if ( this.props.voterDataItem.value > this.props.metaKeyItem.max ) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    validateFieldValueText() {
        if ( this.props.voterDataItem == undefined ) {
            return true;
        }

        if ( 0 == this.props.voterDataItem.value.length ) {
            return true;
        }

        if ( this.props.voterDataItem.value.length > this.props.metaKeyItem.max ) {
            return false;
        } else {
            return true;
        }
    }

    validateFieldValueOfList() {
        if ( this.props.voterDataItem == undefined ) {
            return true;
        }

        if ( 0 == this.props.voterDataItem.value.length ) {
            return true;
        }

        if ( 0 == this.props.voterDataItem.voter_meta_value_id ) {
            return false;
        } else {
            return true;
        }
    }

    validateVariables() {
        this.validInputs = true;

        switch ( this.props.metaKeyItem.key_type ) {
            case 0: // field with list values
                if ( !this.validateFieldValueOfList() ) {
                    this.validInputs = false;
                    this.fieldListDivClass = "form-group has-error";
                } else {
                    this.fieldListDivClass = "form-group";
                }
                break;

            case 1: // field of free text type
                if ( !this.validateFieldValueText() ) {
                    this.validInputs = false;
                    this.fieldTextDivClass = "form-group has-error";
                } else {
                    this.fieldTextDivClass = "form-group";
                }
                break;

            case 2: // field of type number
                if ( !this.validateFieldValueNumber() ) {
                    this.validInputs = false;
                    this.fieldNumberDivClass = "form-group has-error";
                } else {
                    this.fieldNumberDivClass = "form-group";
                }
                break;
        }
    }

    render () {

        var fieldvalue = '';

        this.initVariables();

        this.validateVariables();

        switch ( this.props.metaKeyItem.key_type ) {
            case 0: // Value of a list
                if ( this.props.voterDataItem == undefined ) {
                    fieldvalue = '';
                } else {
                    let voter_meta_value_id = this.props.voterDataItem.voter_meta_value_id;

                    if ( voter_meta_value_id > 0 && voter_meta_value_id != null ) {
                        fieldvalue = this.props.metaValuesHashByValueId[voter_meta_value_id].value;
                    } else {
                        fieldvalue = this.props.voterDataItem.value;
                    }
                }

                return (
                    <div className={this.fieldListDivClass}>
                        <label htmlFor={this.fieldId} className="col-sm-4 control-label">
                            {this.props.metaKeyItem.key_name}
                        </label>
                        <div className="col-sm-8">
                            <Combo items={this.props.metaValuesItems}
                                   maxDisplayItems={10}
                                   id={this.fieldId}
                                   itemIdProperty="id"
                                   itemDisplayProperty='value'
                                   className="form-combo-table"
                                   value={fieldvalue}
                                   onChange={this.comboValueChange.bind(this)}/>
                        </div>
                    </div>
                );
                break;

            case 1: // Free text value
                if ( this.props.voterDataItem == undefined ) {
                    fieldvalue = '';
                } else {
                    fieldvalue = this.props.voterDataItem.value;
                }

                return (
                    <div className={this.fieldTextDivClass}>
                        <label htmlFor={this.fieldId} className="col-sm-4 control-label">
                            {this.props.metaKeyItem.key_name}
                        </label>
                        <div className="col-sm-8">
                            <input type="text" className="form-control" id={this.fieldId}
                                   placeholder={this.fieldTextPlaceholder} value={fieldvalue}
                                   onChange={this.fieldTextValueChange.bind(this)}/>
                        </div>
                    </div>
                );
                break;

            case 2: // Number value
                if ( this.props.voterDataItem == undefined ) {
                    fieldvalue = '';
                } else {
                    fieldvalue = this.props.voterDataItem.value;
                }

                return (
                    <div className={this.fieldNumberDivClass}>
                        <label htmlFor={this.fieldId} className="col-sm-4 control-label">
                            {this.props.metaKeyItem.key_name}
                        </label>
                        <div className="col-sm-8">
                            <input type="text" className="form-control" id={this.fieldId}
                                   placeholder={this.fieldNumberPlaceholder} value={fieldvalue}
                                   onChange={this.fieldNumberValueChange.bind(this)}/>
                        </div>
                    </div>
                );
                break;
        }
    }
}


function mapStateToProps(state) {
    return {
        metaValuesHashByValueId: state.voters.voterScreen.metaValuesHashByValueId
    }
}

export default connect(mapStateToProps)(withRouter(VoterMetaDataItem));
