import React from 'react';
import PropTypes from 'prop-types';


const EmployeesManagementHeader = ({ onOpenModalAddEmployee  , allAddNewWorker, teamId}) => {

    let textValues = {
        title: 'עובדים לקמפיין',
        addEmployee: 'הוספת עובד',
        importFromCampagin: 'ייבוא מקמפיין',
        importFromFile: 'ייבוא מקובץ'
    }
    let btnWhiteStyle = { backgroundColor: '#fff' };

    return (
        <div className="tab-title">
            <div className="tab-title__title">{textValues.title}</div>
            <div className="tab-title__btns">
                <button className="btn btn-success hidden" style={{ ...btnWhiteStyle, color: '#4cae4c' }}>{textValues.importFromFile}</button> &nbsp; &nbsp;
                <button className="btn btn-info hidden" style={{ ...btnWhiteStyle, color: '#1b6d85' }}>{textValues.importFromCampagin}</button> &nbsp; &nbsp;
				{allAddNewWorker && teamId && <button className="btn btn-info" style={{ backgroundColor: '#00bcd5', borderColor: '#00bcd5', color: '#fff', padding: '6px 15px' }}
                        onClick={() => onOpenModalAddEmployee()} ><i className="fa fa-plus" aria-hidden="true"></i> &nbsp; &nbsp;{textValues.addEmployee}
				</button>}
            </div>
        </div>
    );
}

EmployeesManagementHeader.propTypes = {
    onOpenModalAddEmployee: PropTypes.func
}

export default EmployeesManagementHeader;
