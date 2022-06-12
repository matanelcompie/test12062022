import React from 'react';
import {Link} from 'react-router';

import constants from 'libs/constants';

const VotesFileItem = ({campaignKey, item, fileIndex, downloadPermission , allowedToEdit , cancelUpdate,restartCurrentProcess}) => {
    function getExecutionDate() {
        if ( item.execution_date == null ) {
            return '\u00A0';
        } else {
            let dateElements = item.execution_date.split(' ');
            let executionDate = dateElements[0];

            return executionDate.split('-').reverse().join('/');
        }
    }
	
	let cancelButtonText="בטל";

    function getStatus() {
        const voteFileParserStatus = constants.voteFileParserStatus;

        switch ( item.status ) {
            case voteFileParserStatus.didNotStart:
                return 'לא התחיל';
                break;

            case voteFileParserStatus.atWork:
				let htmlBlock = [];
                htmlBlock.push(
                    <div key={6} className="progress">
                        <div className="progress-bar progress-bar-info progress-bar-striped" role="progressbar"
                             aria-valuenow="20" aria-valuemin="0"
                             aria-valuemax="100" style={{ width: ((item.current_row * 100) / item.row_count) + "%" }}>
                            <span className="sr-only">{((item.current_row * 100) / item.row_count)}% Complete</span>
                        </div>
                    </div>
                );
			 
				return htmlBlock;
                break;

            case voteFileParserStatus.success:
                return 'עבר בהצלחה';
                break;
			case voteFileParserStatus.error:
                return 'אירעה שגיאה';
                break;
			case voteFileParserStatus.cancelled:
                return 'בוטל';
                break;
				
			case voteFileParserStatus.restarted:
                return 'הפעלה מחדש';
                break;
        }
    }

    function renderDownloadButton() {
        if ( downloadPermission ) {
            return (
                <Link to={"/elections/campaigns/" + campaignKey + "/vote/files/" + item.key + '/download'} target="_blank">
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
            <td>{Math.round(item.file_size / (1024 * 1024))}MB</td>
            <td>{item.first_name + ' ' + item.last_name}</td>
            <td>{getExecutionDate()}</td>
            <td>
				{(allowedToEdit && item.status == constants.ballotBoxFileParserStatus.atWork) ? <div style={{display:'inline'}}>
						<div style={{float:'right' , width:'80%'}}>
							{getStatus()}
							{(restartCurrentProcess!=null) && <i className="fa fa-undo fa-6" onClick={restartCurrentProcess} title="הפעלה מחדש" style={{cursor:'pointer'}}></i>}
						</div>
						<div style={{float:'right' , width:'10%'}}>
							{(allowedToEdit && item.status == constants.ballotBoxFileParserStatus.atWork) && <i className="glyphicon glyphicon-remove" style={{color:'#ff0000', cursor:'pointer' , display:'inline' , float:'right'}} title="ביטול תהליך" onClick={cancelUpdate.bind(this, item.key)}></i>}
						</div>
					</div>
				:
				  <span>
					{getStatus()}
					{(restartCurrentProcess!=null) && <i className="fa fa-undo fa-6" onClick={restartCurrentProcess} title="הפעלה מחדש" style={{cursor:'pointer'}}></i>}
				  </span>
				}
			</td>
            <td>{renderDownloadButton()}</td>
        </tr>
    );
};

export default VotesFileItem;