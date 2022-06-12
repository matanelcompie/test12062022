import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Combo from 'components/global/Combo'

class ComboSelect extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            textValue: props.value ? this.getValueLabel(props.value) : '',
            isValid: true
        };
	 
        this.onComboChange = this.onComboChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
	 
		if ( nextProps.value != null &&  nextProps.value != undefined &&  nextProps.value != '' && !this.props.value ) {
            
			let textValue = this.getValueLabel(nextProps.value, nextProps)
            this.setState({ textValue: textValue , loadedTextValue:true });
        } 
		 
        if ( nextProps.value != null &&  nextProps.value != undefined   && !this.state.loadedTextValue) {
            
			let textValue = this.getValueLabel(nextProps.value, nextProps)
            this.setState({ textValue: textValue , loadedTextValue:true });
        }
		if(this.props.value && (nextProps.value=='' || nextProps.value==undefined || nextProps.value==null) && this.state.textValue){
			 
			 this.setState({ textValue: ''  , loadedTextValue:true });
		}
        if ( nextProps.clearCombo && !this.props.clearCombo ) {
			 
            this.setState({ textValue: '' });
		 
        }
    }

    onComboChange(event) {
        this.setState({ textValue: event.target.value });
        if ((!this.props.multiSelect && event.target.selectedItem) || (this.props.multiSelect && event.target.selectedItems) || event.target.value == '') {
            
			this.setState({ isValid: true });
            event.target.name = this.props.name;
            event.target.value = (!this.props.multiSelect && event.target.selectedItem) ? event.target.selectedItem.value : null;
            
			this.props.onChange(event);
        }
        else {
            this.setState({ isValid: false });
        }
    }

    getOptionObj(value, nextProps = null) {
        let options = nextProps ? nextProps.options : this.props.options
        return _.find(options, { [this.props.itemIdProperty]: value }) || {};
    }

    getValueLabel(value, nextProps = null) {
        let optionObj = this.getOptionObj(value, nextProps);
        let label = optionObj[this.props.itemDisplayProperty];
        return (value != null && optionObj && label) ? label : "";
    }

    render() {
        let labelErrorStyle = { color: '#cc0000', margin: '0', fontSize: '14px' };
        let errorClass = !this.state.isValid || this.props.error ? 'has-error' : '';
        let selectedItems = (this.props.selectedValues == undefined) ? undefined : this.props.selectedValues.map(value => this.getOptionObj(value, null));
        
		let defaultSelectedItems = (this.props.defaultSelectedValues == undefined) ? undefined : this.props.defaultSelectedValues.map(value => this.getOptionObj(value, null));
 
		let defaultValue = (this.props.defaultValue == undefined) ? undefined : this.getValueLabel(this.props.defaultValue);
     
		return (
            <div className={"form-group " + errorClass}>
                {this.props.label && <label>{this.props.label}</label>}
                <Combo
                    //id={this.props.name}
                    items={this.props.options}
                    onChange={this.onComboChange}
                    onKeyDown={this.props.onKeyDown}
                    itemDisplayProperty={this.props.itemDisplayProperty}
                    itemIdProperty={this.props.itemIdProperty}
                    value={this.state.textValue || ''}
                    defaultValue={defaultValue}
                    multiSelect={this.props.multiSelect}
                    selectedItems={selectedItems}
                    defaultSelectedItems={defaultSelectedItems}
                    maxDisplayItems={this.props.maxDisplayItems}
                    cleanSelectedItems={this.props.cleanSelectedItems}
                    itemHeight={this.props.itemHeight}
                    itemStyle={this.props.itemStyle}
                    zIndex={this.props.zIndex}
                    inputStyle={this.props.inputStyle}
                    className={this.props.className}
                    tabIndex={this.props.tabIndex}
                    autoFocus={this.props.autoFocus}
                    style={this.props.style}
                    placeholder={this.props.placeholder}
                />
                {!this.state.isValid && <span style={labelErrorStyle}>בחירה לא תקנית</span>}
            </div>
        );
    }
}

ComboSelect.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string,
    options: PropTypes.array,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    onKeyDown: PropTypes.func,
    itemDisplayProperty: PropTypes.string,
    itemIdProperty: PropTypes.string,
    // value: PropTypes.string,
    // defaultValue: PropTypes.string,
    //multiSelect: PropTypes.array,
    selectedValues: PropTypes.array,
    defaultSelectedValues: PropTypes.array,
    // maxDisplayItems: PropTypes.array,
    // cleanSelectedItems: PropTypes.array,
    // itemHeight: PropTypes.array,
    // itemStyle: PropTypes.array,
    // zIndex: PropTypes.array,
    // inputStyle: PropTypes.array,
    className: PropTypes.string,
    // tabIndex: PropTypes.array,
    // style: PropTypes.array,
    placeholder: PropTypes.string,
};

ComboSelect.defaultProps = {
    onKeyDown: () => { }
};

export default (ComboSelect);
