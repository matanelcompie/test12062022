import React from 'react';
import PropTypes from 'prop-types';

import RadioSet from 'tm/components/common/RadioSet';
import ComboSelect from 'tm/components/common/ComboSelect';
import TextInput from 'tm/components/common/TextInput';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import { parseDateToPicker, parseDateFromPicker } from 'libs/globalFunctions';

const FilterField = ({ field, filterItem, onChangeField, isOrId, fieldValidation, listOptions, electionCampaign}) => {
    function onChangeFieldTemp(...args) {
		if (fieldValidation)
			args[1] = fieldValidation(args[1]);
		onChangeField(...args, field.model_list_dependency_id);
	}

	function handleDateTime(value, format, params) {
		onChangeFieldTemp(params.id, value, params.valueType, isOrId);
	}

	function handleValues(event) {
		let values = _.map(event.target.selectedItems, 'value');
		values = _.isEmpty(values) ? null : values;
		onChangeFieldTemp(event.target.name, values, 'values', isOrId);
	}

	function handleNumeric(event) {
		let value = (event.target.value != null && event.target.value !== "") ? Number(event.target.value) : null;
		onChangeFieldTemp(event.target.name, value, 'numeric_value', isOrId);
	}

	function handleString(event) {
		let value = (!_.isEmpty(event.target.value) ? event.target.value : null);
		onChangeFieldTemp(event.target.name, value, 'string_value', isOrId);
	}

	moment.locale('en-GB');
	momentLocalizer(moment);
	let fieldValue = null;

	if (filterItem) {
		 
		if (filterItem['values'] && filterItem['values'].length)
			fieldValue = filterItem['values'];
		else if (filterItem['numeric_value'] != null)
			fieldValue = filterItem['numeric_value'];
		else if (filterItem['time_value'] != null)
			fieldValue = filterItem['time_value'];
		else if (filterItem['date_value'] != null)
			fieldValue = filterItem['date_value'];
		else if (filterItem['string_value'] != null)
			fieldValue = filterItem['string_value'];
	}
	

	function renderField(filterItem) {
		switch (field.type) {
			case 'bool':
				return renderRadioField();
			case 'list':
				return renderListField(filterItem);
			case 'time':
			case 'date':
				return renderPickerField();
			default:
				return renderStringField();
		}
	}
	function renderListValuesManager() {
		switch (field.type) {
			case 'bool':
				return null;
			case 'list':
				return renderListOptions();
			case 'time':
			case 'date':
				return null;
			default:
				return null;
		}
	}

	function renderPickerField() {
		if (field.type == 'time') {
			return (
				<ReactWidgets.DateTimePicker
					isRtl={true}
					value={parseDateToPicker(fieldValue)}
					onChange={parseDateFromPicker.bind(this, { callback: handleDateTime, format: "HH:mm", functionParams: { id: field.id, valueType: 'time_value' } })}
					format="HH:mm"
					calendar={false}
					className="form-group"
					dropUp={true}
				/>
			);
		} else {
			return (
				<ReactWidgets.DateTimePicker
					isRtl={true}
					value={parseDateToPicker(fieldValue)}
					onChange={parseDateFromPicker.bind(this, { callback: handleDateTime, format: "YYYY-MM-DD", functionParams: { id: field.id, valueType: 'date_value' } })}
					time={false}
					format="DD/MM/YYYY"
					className="form-group"
					dropUp={true}
				/>
			);
		}
	}
	function renderRadioField() {
		let yesNoOptions = [
			{ value: 1, label: 'כן' },
			{ value: 0, label: 'לא' }
		];
		return (
			<ComboSelect
				name={`${field.id}`}
				options={yesNoOptions}
				onChange={handleNumeric}
				itemDisplayProperty="label"
				itemIdProperty="value"
				value={fieldValue}
				defaultValue={fieldValue}
			/>
		);
	}

	function renderListField(filterItem) {
		if (fieldValue === null) { fieldValue = [] }
		let multiSelect = !!field.multiselect;
		let onChangeFunction = multiSelect ? handleValues : handleNumeric;
		//console.log(fieldValue);
		let selectedValues = multiSelect ? fieldValue : [];
		// let options = _.map(listOptions, item => {
		// 		return Object.assign({}, item, { value: item.value.toString() })
		// });

		//filter list options if is per election campaign
		let filteredListOptions = [];
		if (electionCampaign && listOptions && listOptions.length > 0 && listOptions[0].hasOwnProperty("election_campaign_id")) {
		filteredListOptions = listOptions.filter( item => {
				if (item.election_campaign_id == electionCampaign || item.election_campaign_id == -1) return true;
				else return false;
			});
		} else {
			filteredListOptions = listOptions;
		}

		let options = [];
	 
		_.map(filteredListOptions, item => {
			if (item && (item.value || item.value == 0)) {
				options.push({ ...item, value: item.value.toString() });
			}
		});
		
		return (
			<ComboSelect
				name={`${field.id}`}
				options={options}
				onChange={onChangeFunction}
				itemDisplayProperty="label"
				itemIdProperty="value"
				// value={ `${fieldValue}`}  //remove because conflict with Combo behavior
				defaultValue={`${fieldValue}`}
				multiSelect={multiSelect}
				selectedValues={selectedValues}
				defaultSelectedValues={selectedValues}
				maxDisplayItems={6}
				clearCombo={!filterItem ? true : false}
			/>
		);
	}

	function renderStringField() {
        let currentYear = new Date().getFullYear();

		switch (field.name) {
			case 'from_birth_year':
            case 'to_birth_year':
                return (
					<TextInput
						name={`${field.id}`}
						type={`${field.type}` || "text"}
						minNumber={1900}
						maxNumber={currentYear}
						value={fieldValue}
						onChange={handleString}
					/>
                );
				break;

			default:
                return (
					<TextInput
						name={`${field.id}`}
						type={`${field.type}` || "text"}
						value={fieldValue}
						onChange={handleString}
					/>
                );
				break;
		}
	}

	function renderListOptions() {
		let clearLabel = '(נקה)';
		let selectAllLabel = '(סמן הכל)';
		let fieldValueTemp = (fieldValue === null) ? [] : fieldValue;
		let multiSelect = !!field.multiselect;
		let selectedValues = multiSelect ? fieldValueTemp : [];

		return (
			<div className={'values-control' + (((selectedValues.length > 0) || (multiSelect && (listOptions.length < 20) && (selectedValues.length != listOptions.length))) ? '' : ' hidden')}>
				{(selectedValues.length > 0) && <span onClick={listClear} >{clearLabel}</span>}
				{(multiSelect && (listOptions.length < 20) && (selectedValues.length != listOptions.length)) && <span onClick={listSelectAll}>{selectAllLabel}</span>}
			</div>
		);
	}

	function listSelectAll() {
		let values = listOptions.map(item => item['value'].toString());
		values = _.isEmpty(values) ? null : values;
		onChangeFieldTemp(field.id, values, 'values', isOrId);
	}

	function listClear() {
		let values = null;
		onChangeFieldTemp(field.id, values, 'values', isOrId);
	}

	return (
		<div className="filter-field">
			<label>{field.label}</label>
			{renderListValuesManager()}
			{renderField(filterItem)}
		</div>
	);
};

FilterField.propTypes = {
	field: PropTypes.object,
	filterItem: PropTypes.object,
	onChangeField: PropTypes.func,
	isOrId: PropTypes.number,
	fieldValidation: PropTypes.func
};

export default FilterField;
