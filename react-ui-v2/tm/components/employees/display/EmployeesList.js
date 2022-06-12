import React from 'react';
import PropTypes from 'prop-types';

import EmployeesListHeader from './EmployeesListHeader';
import EmployeesListRow from '../container/EmployeesListRow';
const EmployeesList = ({employees, campaignKey}) => {

    return (
        <div className="employees-list">
        	<EmployeesListHeader />
        	{employees.map(employee =>
        		<EmployeesListRow key={employee.key} employee={employee} campaignKey={campaignKey}/> 
        	)}
        </div>
    );
}

EmployeesList.defaultProps = {
 	
}

EmployeesList.propTypes = {
    employeesList: PropTypes.array
}

export default EmployeesList;
