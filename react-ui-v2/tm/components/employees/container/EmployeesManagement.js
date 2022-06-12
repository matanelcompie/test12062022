import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as employeeActions from 'tm/actions/employeeActions';

import ModalWindow from 'tm/components/common/ModalWindow';
import EmployeesManagementHeader from '../display/EmployeesManagementHeader';
import EmployeesList from '../display/EmployeesList';
import AddEmployee from '../display/AddEmployee';

class EmployeesManagement extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onOpenModalAddEmployee = this.onOpenModalAddEmployee.bind(this);
        this.onCloseModalAddEmployee = this.onCloseModalAddEmployee.bind(this);
        this.onSearchEmployee = this.onSearchEmployee.bind(this);
        this.onChangeField = this.onChangeField.bind(this);

        this.textMessages={
            thereIsNoInput:'לא הוזן מספר ת"ז',
            employeeWithTheSameIdExists:'קיים עובד עם אותו מספר ת"ז'
        };
    }

    onOpenModalAddEmployee() {
        this.props.employeeActions.onOpenModalAddEmployee();
    }

    onCloseModalAddEmployee() {
        this.props.employeeActions.onCloseModalAddEmployee();
    }


    onSearchEmployee() {
        let personalIdentity = this.props.addEmployee.personalIdentity || '';
        let usersWithTheSameId = this.props.employeesList.filter(user => user.personal_identity == personalIdentity);

        let errorMessage = '';

        if(personalIdentity.length == 0){
            errorMessage = this.textMessages.thereIsNoInput;
        }

        if(usersWithTheSameId.length > 0){
            errorMessage = this.textMessages.employeeWithTheSameIdExists;
        }
        if(errorMessage == ''){
            this.props.employeeActions.searchEmployee(personalIdentity);
        }
        this.props.employeeActions.onUpdateAddEmployeeErrorMsg(errorMessage);
    }

    onChangeField(event) {
        let employee = { ...this.props.addEmployee };
        employee[event.target.name] = event.target.value;
        this.props.employeeActions.onEditedEmployeeChange(employee);
    }

    render() {
        return (
            <div className="employees-management">
                <EmployeesManagementHeader
                    onOpenModalAddEmployee={this.onOpenModalAddEmployee}
                    isOpenModal={this.props.isOpenModal}
					allAddNewWorker={(this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.employees.add'])}
                    teamId={this.props.teamId}
                />
                {this.props.isOpenModal &&
                    <ModalWindow
                        show={true}
                        title={"הוספת עובד"}
                        buttonOk={this.onSearchEmployee}
                        buttonCancel={this.onCloseModalAddEmployee}
                        buttonX={this.onCloseModalAddEmployee}
                        children={
                            <div>
                                <AddEmployee
                                    employee={this.props.addEmployee}
                                    onChangeField={this.onChangeField} 
                                    onSearchEmployee={this.onSearchEmployee}
                                    errorMsg={this.props.addEmployeeErrorMsg}
                                    />
                            </div>
                        }
                    />
                }
                <EmployeesList
                    campaignKey={this.props.campaignKey}
                    employees={this.props.employeesList}
                />
            </div>
        );
    }
}

EmployeesManagement.propTypes = {
    employeesList: PropTypes.array
};

EmployeesManagement.defaultProps = {
    //
};

function mapStateToProps(state, ownProps) {
    let isOpenModal = state.tm.employee.isOpenModal;
    let addEmployee = {};
    if (isOpenModal && (state.tm.employee.editedEmployee.key == '')) {
        addEmployee = state.tm.employee.editedEmployee;
    }

    return {
        employeesList: state.tm.employee.employees,
        addEmployeeErrorMsg: state.tm.employee.addEmployeeErrorMsg,
        isOpenModal,
        addEmployee,
		currentUser:state.system.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        employeeActions: bindActionCreators(employeeActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeesManagement);
