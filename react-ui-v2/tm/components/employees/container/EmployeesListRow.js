import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as employeeActions from 'tm/actions/employeeActions';
import * as systemActions from 'tm/actions/systemActions';

import EmployeesListRowData from '../display/EmployeesListRowData';

class EmployeesListRow extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onEditClick = this.onEditClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.onChangeField = this.onChangeField.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);
        this.onActiveClick = this.onActiveClick.bind(this);
    }

    componentDidMount() {
        //if employee is new and there is no languages for him, add the main language.
        if (this.props.employee.isNew && !this.props.employee.languages.length) {
            let value = [];
            this.props.languages.map(lang => {
                if (lang.main == 1) {
                    value.push({ value: lang.id, main: 1, label: lang.name });
                }
            });
            this.onChangeField('languages', value);
        }
    }

    onEditClick() {
        this.props.employeeActions.onEditEmployee(this.props.employee.key);
    }

    onSaveClick() {
        if (this.props.employee.isNew) {
            this.props.employeeActions.addEmployee(this.props.employee, this.props.campaignKey);
        } else {
            this.props.employeeActions.onUpdateEmployee(this.props.employee.key, this.props.employee, this.props.campaignKey);
        }
    }

    onCancelClick() {
        this.props.employeeActions.onCancelUpdateEmployee(this.props.employee.key);

        if (this.props.employee.isNew) {
            this.props.employeeActions.onCancelAddNewEmployee(this.props.employee.key);
        }
    }

    onDeleteClick() {
        this.props.systemActions.showConfirmMessage('employeeActions', 'deleteEmployee',
            [this.props.employee.key, this.props.campaignKey]);
    }

    onActiveClick() {
        let active = !this.props.employee.active;
        let updateDetails = { active: active }
        let confirmData = [this.props.employee.key, updateDetails, this.props.campaignKey];
        this.props.systemActions.showConfirmMessage('employeeActions', 'onUpdateEmployee', confirmData);
    }

    onChangeField(name, value) {
        let employee = { ...this.props.employee };
        employee[name] = value;
        this.props.employeeActions.onEditedEmployeeChange(employee);
    }


    render() {
        return (
            <EmployeesListRowData
                key={this.props.employee.key}
                employee={this.props.employee}
                languages={this.props.languages}
                isEditing={this.props.isEditing}
                onEditClick={this.onEditClick}
                onSaveClick={this.onSaveClick}
                onChangeField={this.onChangeField}
                onCancelClick={this.onCancelClick}
                onDeleteClick={this.onDeleteClick}
                onActiveClick={this.onActiveClick}
				allowEdit={(this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.employees.edit'])}
				allowDelete={(this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.employees.delete'])}
            />
        );
    }
}

EmployeesListRow.propTypes = {
    employee: PropTypes.object
};

EmployeesListRow.defaultProps = {
    //
};

function mapStateToProps(state, ownProps) {
    let isEditing;
    let employee = ownProps.employee;
    let editedEmployee = state.tm.employee.editedEmployee;
    if (employee.key == editedEmployee.key) {
        isEditing = true;
        employee = editedEmployee;
    }
    else {
        isEditing = false;
    }


    return {
        languages: state.tm.system.lists.languages || [],
        isEditing,
        employee,
		currentUser:state.system.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        employeeActions: bindActionCreators(employeeActions, dispatch),
        systemActions: bindActionCreators(systemActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeesListRow);
