import React from 'react';
import PropTypes from 'prop-types';

const EmployeesListRowButtons = ({ employee, isEditing, onEditClick, onSaveClick, onCancelClick, onDeleteClick, onActiveClick, isValidData , allowEdit , allowDelete}) => {
	return (
		<div className="employees-list__cell employees-list__cell_col_small_cell">
			<div className="list-actions">
				{isEditing ?
					[
						<i key="save" className={"action-icon fa fa-floppy-o" + (isValidData ? '' : ' invalid')} aria-hidden="true" onClick={() => {
							if (isValidData) { onSaveClick() }
						}} />,
						<i key="rewind" className={"action-icon fa " + (employee.isNew ? "fa-times" : "fa-repeat")} aria-hidden="true" onClick={() => onCancelClick()} />
					]
					:
					[
					   (allowEdit && <i key="edit" className="action-icon fa fa-pencil" aria-hidden="true" onClick={() => onEditClick()} />),
					   (allowDelete && <i key="delete" className="action-icon fa fa-trash" aria-hidden="true" onClick={() => onDeleteClick()} />),
						<i key="active" className={"action-icon fa fa-eye" + (employee.active ? '' : '-slash')} aria-hidden="true" onClick={() => onActiveClick()} />
					]
				}

			</div>
		</div>
	);
}

EmployeesListRowButtons.propTypes = {
	employee: PropTypes.object,
	isEditing: PropTypes.bool,
	onEditClick: PropTypes.func,
	onSaveClick: PropTypes.func,
	onCancelClick: PropTypes.func,
	onDeleteClick: PropTypes.func,
	onActiveClick: PropTypes.func
}

export default EmployeesListRowButtons;