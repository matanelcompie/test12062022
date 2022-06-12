import React from 'react';

import constants from 'libs/constants';

const SupportUpdateItem = ({item, itemIndex, allowedToEdit, cancelStatusUpdate , restartCurrentProcess }) => {
    function getExecutionDate() {
        if ( item.execution_date == null ) {
            return '\u00A0';
        } else {
            let dateElements = item.execution_date.split(' ');
            let executionDate = dateElements[0];

            return executionDate.split('-').reverse().join('/');
        }
    }

    function getUpdateType() {
        const updateTypes = constants.electionCampaigns.supportStatusUpdate.types;

        switch (item.type) {
            case updateTypes.election:
                return 'סניף';
                break;

            case updateTypes.final:
                return 'סופי';
                break;
        }
    }

    function getUpdateStatus() {
        const cancelButtonText = 'בטל';
        const supportStatusUpdateStatuses = constants.electionCampaigns.supportStatusUpdate.Statuses;

        switch ( item.status ) {
            case supportStatusUpdateStatuses.didNotStart:
                return 'לא התחיל';
                break;

            case supportStatusUpdateStatuses.atWork:
                let htmlBlock = [];
                htmlBlock.push(
                    <div key={0} className="progress">
                        <div className="progress-bar progress-bar-info progress-bar-striped" role="progressbar"
                             aria-valuenow="20" aria-valuemin="0"
                             aria-valuemax="100" style={{ width: ((item.total_voters_processed * 100) / item.total_voters_count) + "%" }}>
                            <span className="sr-only">{((item.total_voters_processed * 100) / item.total_voters_count)}% Complete</span>
                        </div>
                    </div>
                );

          

                return htmlBlock;
                break;

            case supportStatusUpdateStatuses.success:
                return 'עבר בהצלחה';
                break;

			case supportStatusUpdateStatuses.error:
                return 'אירעה שגיאה';
                break;	
				
            case supportStatusUpdateStatuses.cancelled:
                return 'מבוטל';
                break;
				
			 case supportStatusUpdateStatuses.restarted:
                return 'הפעלה מחדש';
                break;
        }
    }

    return (
        <tr>
            <td>{itemIndex + 1}.</td>
            <td>{getExecutionDate()}</td>
            <td>{item.user_execute_first_name + ' ' + item.user_create_last_name}</td>
            <td>{getUpdateType()}</td>
            <td>{item.updated_voters_count}</td>
            <td>
				{(allowedToEdit && item.status == constants.ballotBoxFileParserStatus.atWork) ? <div style={{display:'inline'}}>
						<div style={{float:'right' , width:'80%'}}>
							{getUpdateStatus()}
							{(restartCurrentProcess!=null) && <i className="fa fa-undo fa-6" onClick={restartCurrentProcess} title="הפעלה מחדש" style={{cursor:'pointer'}}></i>}
						</div>
						<div style={{float:'right' , width:'10%'}}>
							{(allowedToEdit && item.status == constants.ballotBoxFileParserStatus.atWork) && <i className="glyphicon glyphicon-remove" style={{color:'#ff0000', cursor:'pointer' , display:'inline' , float:'right'}} title="ביטול תהליך" onClick={cancelStatusUpdate.bind(this, item.key)}></i>}
						</div>
					</div>
				:
				<span>
					{getUpdateStatus()}
					{(restartCurrentProcess!=null) && <i className="fa fa-undo fa-6" onClick={restartCurrentProcess} title="הפעלה מחדש" style={{cursor:'pointer'}}></i>}
				</span>
			    }
			</td>
        </tr>
    );
};

export default SupportUpdateItem;