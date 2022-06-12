import { types } from 'tm/actions/employeeActions';

const PHONE_TYPE_HOME = 1;
const PHONE_TYPE_MOBILE = 2;
const initialState = {
	teams: [],
	roles: [],
	employees: [],
	editedEmployee: {},
	isOpenModal: false,
	addEmployeeErrorMsg:''
}

export default function (state = initialState, action) {
	switch (action.type) {
		case types.GET_EMPLOYEES_SUCCESS:
			var newState = { ...state };
			newState.employees = action.data;
			newState.editedEmployee = {};
			return newState;
			break;

		case types.ON_EDIT_EMPLOYEE: {
			let editedEmployee = {};
			if (action.employeeKey) {
				editedEmployee = state.employees.filter(e => {
					return e.key == action.employeeKey
				})[0];
			}
			editedEmployee['isNew'] = false;
			return Object.assign({}, state, { editedEmployee })
		}

		case types.ON_EDITED_EMPLOYEE_CHANGE: {
			let editedEmployee = action.employee;
			return { ...state, editedEmployee };
		}

		case types.GET_EMPLOYEE_SUCCESS: {
			let employees = [...state.employees].map(e => {
				return e.key == action.data.key ? action.data : e;
			});

			let editedEmployees = [...state.editedEmployees].filter(e =>
				e.key != action.data.key
			) || [];
			return Object.assign({}, state, { employees, editedEmployees });
		}

		case types.ON_CANCEL_UPDATE_EMPLOYEE: {
			let editedEmployee = {};
			return Object.assign({}, state, { editedEmployee });
		}

		case types.DELETE_EMPLOYEE_SUCCESS: {
			let newEmployees = [...state.employees].filter(e =>
				e.key != action.employeeKey
			) || [];
			return Object.assign({}, state, { employees: newEmployees });
		}

		case types.ON_OPEN_MODAL_ADD_EMPLOYEE: {
			return Object.assign({}, state, { isOpenModal: true, editedEmployee: { key: "", id: "" },addEmployeeErrorMsg: '' });
		}

		case types.ON_CLOSE_MODAL_ADD_EMPLOYEE: {
			return Object.assign({}, state, { isOpenModal: false, editedEmployee: {} });
		}

		case types.UPDATE_ADD_EMPLOYEE_ERROR_MESSAGE: {
			return Object.assign({}, state, { addEmployeeErrorMsg: action.errorMessage });
		}

		case types.ADD_EMPLOYEE_SUCCESS: {
			let employees = [...state.employees];
			let editedEmployee = [...state.editedEmployee];
			let newEmployee = action.employee;
			let isOpenModal = true;

			if (newEmployee.personal_identity) {
				isOpenModal = false;
				let { id, key, personal_identity, first_name, last_name, email, userPhones } = newEmployee;//extract only the relevant data from the new employee
				let mobilePhone = { key: null, value: "", type: "mobile" };
				let homePhone = { key: null, value: "", type: "home" };
				userPhones.map(phone => {
					if (phone.phone_type_id == PHONE_TYPE_HOME) {
						homePhone = { ...homePhone, key: phone.key, value: phone.phone_number };
					}

					if (phone.phone_type_id == PHONE_TYPE_MOBILE) {
						mobilePhone = { ...homePhone, key: phone.key, value: phone.phone_number };
					}
				});

				editedEmployee = {
					id, key, personal_identity, first_name, last_name,
					user_email: email,
					active: 1,
					languages: newEmployee.languages || [],
					mobilePhone,
					homePhone,
					role_name:'',
					isNew: true
				};
				employees.push(editedEmployee);
			}

			let newSata = { ...state, employees, editedEmployee, isOpenModal };
			return Object.assign({}, state, newSata);
		}

		case types.LOADED_TEAMS:
			var newState = { ...state };
			newState.teams = action.data;
			return newState;
			break;

		case types.LOADED_ROLES:
			var newState = { ...state };
			newState.roles = action.data;
			return newState;
			break;

		default:
			return state;
	}
}
