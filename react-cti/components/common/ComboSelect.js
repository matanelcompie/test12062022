import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Combo from './global/Combo';


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
        if(nextProps.value !== this.props.value) {
            this.setState({textValue: this.getValueLabel(nextProps.value)});
        }
    }

    onComboChange(event) {
        this.setState({textValue: event.target.value})
        if(event.target.selectedItem || event.target.value == '') {
            this.setState({isValid: true});
            event.target.name = this.props.name;
            event.target.value = event.target.selectedItem ? event.target.selectedItem.value : null;
            this.props.onChange(event);
        }
        else {
            this.setState({isValid: false});
        }
    }

    getOptionObj(value) {
        return _.find(this.props.options, {[this.props.itemIdProperty]: value}) || {};
    }

    getValueLabel(value) {
        let optionObj = this.getOptionObj(value);
        let label = optionObj[this.props.itemDisplayProperty];
        return (value != null && optionObj && label) ? label : "";
    }

    render() {
        let labelErrorStyle = {color: '#cc0000', margin: '0', fontSize: '14px'};
        let errorClass = !this.state.isValid || this.props.error ? 'has-error' : '';

        return (
            <div className={"form-group " + errorClass}>
              {this.props.label && <label>{this.props.label}</label>}
                <Combo
                    id={this.props.name}
                    items={this.props.options}
                    onChange={this.onComboChange}
                    onKeyDown={this.props.onKeyDown}
                    itemDisplayProperty={this.props.itemDisplayProperty}
                    itemIdProperty={this.props.itemIdProperty}
                    value={this.state.textValue}
                    defaultValue={this.getValueLabel(this.props.defaultValue)}
                    multiSelect={this.props.multiSelect}
                    selectedItems={this.props.selectedValues.map(value => this.getOptionObj(value))}
                    defaultSelectedItems={this.props.defaultSelectedValues.map(value => this.getOptionObj(value))}
                    maxDisplayItems={this.props.maxDisplayItems}
                    cleanSelectedItems={this.props.cleanSelectedItems}
                    itemHeight={this.props.itemHeight}
                    itemStyle={this.props.itemStyle}
                    zIndex={this.props.zIndex}
                    inputStyle={this.props.inputStyle}
                    className={this.props.className}
                    tabIndex={this.props.tabIndex}
                    style={this.props.style}
                    placeholder={this.props.placeholder}
                    disabled={this.props.disabled}
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
    selectedValues: [],
    defaultSelectedValues: [],
    onKeyDown: () => {}
};

export default (ComboSelect);
