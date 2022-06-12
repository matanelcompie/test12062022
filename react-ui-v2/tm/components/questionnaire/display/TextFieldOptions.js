import React from 'react';
import PropTypes from 'prop-types';

const TextFieldOptions = ({fieldOptions, onCopyLabel}) => {

	let textValue ={
		textLabel: 'שדות להטעמה בטקסט'
	};

	return(
		<div className="question-form__row text-field-options">
			<label className="question-form__texts-title">{textValue.textLabel}</label>
			<div className="text-field-options__options">
				{fieldOptions.map(option =>
					<div
						className="btn text-field-options__option-btn"
						key={option.value}
						onClick={() => onCopyLabel(`[${option.value}]`)}
					>{option.label}</div>
				)}
			</div>
		</div>
		);
}

TextFieldOptions.propTypes = {
    fieldOptions: PropTypes.array,
    onCopyLabel: PropTypes.func
}

export default TextFieldOptions;