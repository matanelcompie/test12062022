import React from 'react';
import {Link} from 'react-router';

const FileItem = ({campaignKey, item, fileIndex, downloadPermission}) => {
    function getExecutionDate() {
        if ( item.execution_date == null ) {
            return '\u00A0';
        } else {
            let dateElements = item.execution_date.split(' ');
            let executionDate = dateElements[0];

            return executionDate.split('-').reverse().join('/');
        }
    }

    function renderDownloadButton() {
        if ( downloadPermission ) {
            return (
                <Link to={"/elections/campaigns/" + campaignKey + "/budgets/files/" + item.key + '/download'} target="_blank">
                    <img src={window.Laravel.baseURL + "Images/download-icon.png"} alt="הורדת קובץ"/>
                </Link>
            );
        } else {
            return '\u00A0';
        }
    }

    return (
        <tr>
            <td>{fileIndex + 1}.</td>
            <td>{item.name}</td>
            <td>{Math.round(item.file_size / 1024)}KB</td>
            <td>{item.first_name + ' ' + item.last_name}</td>
            <td>{getExecutionDate()}</td>
            <td>{renderDownloadButton()}</td>
        </tr>
    );
};

export default FileItem;