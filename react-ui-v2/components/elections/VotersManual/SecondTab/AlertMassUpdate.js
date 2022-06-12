import React from 'react';
import constants from 'libs/constants';

const AlertMassUpdate = ({massUpdate}) => {
    function getMessage() {
		let msgPartsCount=0;
        let message = 'הנתונים הבאים מעודכנים רוחבית ולא ניתן לשנות אותם ידנית: ';

        if ( massUpdate.statusData.support_status_chosen_id != null ) {
			msgPartsCount++;
            message += 'סטטוס תמיכה';
        }

        if ( massUpdate.instituteData.institute_id != null ) {
			if(msgPartsCount > 0 ){
				message += ',';
			}
            message += 'מוסד';
        }

        return message;
    }
	 
	if(massUpdate.massUpdateType == constants.massUpdateType.manual){
		return <div></div> ;
	}
	else{
		 return (
			<div className="row alertContainer">
				<div className="alert mass-update-warning" role="alert"><strong>שים לב!</strong>
					{getMessage()}
				</div>
			</div>
		);
	}
   
};

export default AlertMassUpdate;