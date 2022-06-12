import React from 'react';
import PropTypes from 'prop-types';


const EmployeesListHeader = ({}) => {
    let textValues = {
        idNumber: 'ת.ז',
        name: 'שם',
        phone: 'טל נייד',
        email: 'דוא"ל',
        homePhone: 'טל בית',
        mainLlanguage: 'שפה ראשית', 
        additionalLlanguage: 'שפות נוספות', 
        actions: 'פעולות',
    }
    return (
        <div className="employees-list-row-data employees-list-header">
            <div className="employees-list__cell employees-list__cell_col_small_cell less-padding">{textValues.idNumber}</div>
            <div className="employees-list__cell employees-list__cell_col_cell">{textValues.name}</div>
            <div className="employees-list__cell employees-list__cell_col_phone_cell">{textValues.phone}</div>
            <div className="employees-list__cell employees-list__cell_col_cell">{textValues.email}</div>
            <div className="employees-list__cell employees-list__cell_col_phone_cell">{textValues.homePhone}</div>
            <div className="employees-list__cell employees-list__cell_col_small_cell">{textValues.mainLlanguage}</div>
            <div className="employees-list__cell employees-list__cell_col_medium_cell">{textValues.additionalLlanguage}</div>
            <div className="employees-list__cell employees-list__cell_col_small_cell">{textValues.actions}</div>
        </div>
    );
}

EmployeesListHeader.propTypes = {

}

export default EmployeesListHeader;