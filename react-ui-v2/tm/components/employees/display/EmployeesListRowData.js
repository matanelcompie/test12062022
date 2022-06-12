import React from 'react';
import PropTypes from 'prop-types';

import TextInput from 'tm/components/common/TextInput';
import ComboSelect from 'tm/components/common/ComboSelect';
import EmployeesListRowButtons from '../display/EmployeesListRowButtons';
import { validateEmail, isMobilePhone, regexRing } from 'libs/globalFunctions';

const EmployeesListRowData = ({ employee, languages, isEditing, onEditClick, onSaveClick,
    onChangeField, onCancelClick, onDeleteClick, onActiveClick ,allowEdit , allowDelete}) => {

    let languageOptions = languages.map(value => {
        return { value: value.id, label: value.name };
    });

    let mainLanguage = { value: '', main: 1, label: '' };
    let addidtionalLanguages = [];
    employee.languages.map(lang => {
        if (lang.main) {
            mainLanguage = lang;
        } else {
            addidtionalLanguages.push(lang);
        }
    });

        function onChangeFieldTemp(event) {
        let targetName = event.target.name;
        let target = targetName;
        let value = event.target.value;

        switch (targetName) {
            case "addidtionalLanguages":
                let selectedItems = event.target.selectedItems.map(i => { return { ...i, main: 0 } });
                value = [...selectedItems, mainLanguage];
                target = 'languages';
                break;
            case "mainLanguage":
                let selectedLang = event.target.selectedItem || { value: '', main: 1, label: '' };
                mainLanguage = { ...mainLanguage, value: selectedLang.value, label: selectedLang.label, main: 1 };
                value = [...addidtionalLanguages, { ...mainLanguage }];
                target = 'languages';
                break;
            case "mobilePhone":
            case "homePhone":
                value = { ...employee[event.target.name], value: event.target.value };
                break;
        }
        onChangeField(target, value);
    }

    function isValidData(isEmailValid) {
        if (!isEditing) {  return true; }
        let isValid = (mainLanguage.value != '') ? true : false;

        //check if email is valid
        if (isValid) {
            isValid = isEmailValid;
        }
        //check if mobile is valid
        if (isValid) {
            isValid = isMobilePhone(employee.mobilePhone.value) ? true : false;
        }
        //check if home phone is valid
        if (isValid) {
            isValid = (regexRing.isIsraelLandPhone(employee.homePhone.value) || (employee.homePhone.value == '')) ? true : false;
        }

        return isValid;
    }
    let isEmailValid = employee.user_email.length > 0 && validateEmail(employee.user_email) 
    return (
        <div className="employees-list-row-data employees-list-header">
            <div className="employees-list__cell employees-list__cell_col_small_cell less-padding">{employee.personal_identity}</div>
            <div className="employees-list__cell employees-list__cell_col_cell">{employee.first_name + ' ' + employee.last_name}</div>
            <div className="employees-list__cell employees-list__cell_col_phone_cell">
                {isEditing ?
                    <TextInput
                        value={employee.mobilePhone.value}
                        name="mobilePhone"
                        onChange={onChangeFieldTemp}
                        error={!isMobilePhone(employee.mobilePhone.value)}
                    />
                    :
                    <span>{employee.mobilePhone.value}</span>
                }
            </div>
            <div className="employees-list__cell employees-list__cell_col_cell">
                {isEditing ?
                    <TextInput
                        value={employee.user_email}
                        className="text-left"
                        error={!isEmailValid}
                        name="user_email"
                        onChange={onChangeFieldTemp} />
                    :
                    <span className="text-left">{employee.user_email}</span>
                }
            </div>
            <div className="employees-list__cell employees-list__cell_col_phone_cell">
                {isEditing ?
                    <TextInput
                        value={employee.homePhone.value}
                        name="homePhone"
                        onChange={onChangeFieldTemp}
                        error={!(regexRing.isIsraelLandPhone(employee.homePhone.value) || (employee.homePhone.value == ''))}
                    />
                    :
                    <span >{employee.homePhone.value}</span>
                }
            </div>
            <div className="employees-list__cell employees-list__cell_col_small_cell">
                {isEditing ?
                    <ComboSelect
                        name="mainLanguage"
                        className={(mainLanguage.value == '') ? 'has-error' : ''}
                        options={languageOptions}
                        onChange={onChangeFieldTemp}
                        itemDisplayProperty="label"
                        itemIdProperty="value"
                        value={mainLanguage.value}
                    />
                    :
                    <span>{mainLanguage.label}</span>
                }
            </div>
            <div className="employees-list__cell employees-list__cell_col_medium_cell" style={!isEditing ? { padding: '0 8px 0 0' } : { padding: '6px' }}>
                {
                    isEditing ?
                        <ComboSelect
                            name="addidtionalLanguages"
                            options={languageOptions}
                            onChange={onChangeFieldTemp}
                            itemDisplayProperty="label"
                            itemIdProperty="value"
                            multiSelect={true}
                            selectedValues={addidtionalLanguages.map(lang => lang.value)}
                        />
                        :
                        <span style={{ overflow: 'auto' }} title={addidtionalLanguages.map(lang => lang.label).join(', ')}>{addidtionalLanguages.map(lang => lang.label).join(', ')}</span>
                }
            </div>
            <EmployeesListRowButtons
                employee={employee}
                onEditClick={onEditClick}
                isEditing={isEditing}
                onSaveClick={onSaveClick}
                onCancelClick={onCancelClick}
                onDeleteClick={onDeleteClick}
                onActiveClick={onActiveClick}
                isValidData={isValidData(isEmailValid)}
				allowEdit={allowEdit}
				allowDelete={allowDelete}
            />
        </div>
    );
}

EmployeesListRowData.propTypes = {
    employee: PropTypes.object,
    languages: PropTypes.array,
    isEditing: PropTypes.bool,
    onEditClick: PropTypes.func,
    onSaveClick: PropTypes.func,
    onChangeField: PropTypes.func,
    onCancelClick: PropTypes.func,
    onDeleteClick: PropTypes.func
}

export default EmployeesListRowData;
