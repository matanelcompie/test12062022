import React from 'react';
import PropTypes from 'prop-types';

import TextInput from 'tm/components/common/TextInput';

const AddEmployee = ({employee, onChangeField,onSearchEmployee,errorMsg}) => {

	let textValues = {
		addTZ: 'הזן מספר זהות',
	}

	return (
        <div className="add-employee">
            <TextInput
                value={employee.personalIdentity}
                name="personalIdentity"
                onChange={onChangeField} 
                onKeyDownEnter={onSearchEmployee}
                errorMsg={errorMsg}
                />
    	</div>
	)
}

AddEmployee.propTypes = {
    employee: PropTypes.object,
    onChangeField: PropTypes.func
}

export default AddEmployee;            