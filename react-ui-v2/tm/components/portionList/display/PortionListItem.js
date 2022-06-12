import React from 'react';
import PropTypes from 'prop-types';

const PortionListItem = ({ portion, onOpenPortionModalClick, onActivePortionClick, onDeletePortionClick,
     isPotionAlreadyFinishCalling, currentPortionId, potionInCalculateMode , allowDelete , allowEdit }) => {
    let isCurrentPortion = (portion.id == currentPortionId);
    let columnLabels1 = {
        order: '#',
        name: 'שם מנה',
        creator_name: 'יוצר',
        created_at: 'תאריך יצירה',
    };
    let columnLabels2 = {
		sent_to_dialer:"נשלחו לחייגן",
        processed_count: 'טופלו',
        processing_count: 'בטיפול',
		answered_percentage: 'אחוז מענה',
    };
    let loader =  <i className="fa fa-spinner fa-spin"/>
    let inVotersCountCalc = potionInCalculateMode && potionInCalculateMode['voters_count'] ? true : false
    let inUniqueVotersCountCalc = potionInCalculateMode && potionInCalculateMode['unique_voters_count'] ? true :false
    return (

        <div className={"portion-list-item" + (portion.active ? '' : ' portion-list-item_inactive')}>
            {Object.keys(columnLabels1).map(key =>
                <div key={key} className={"portion-list__cell portion-list__cell_col_" + key}>
                    {((portion[key] == undefined) ? '' : portion[key])}
                </div>
            )}
            <div key={'voters_count'} className={"portion-list__cell portion-list__cell_col_voters_count"}>
                {(portion['voters_count'] === undefined || inVotersCountCalc) ? loader : portion['voters_count']}
            </div>
            <div key={'unique_voters_count'} className={"portion-list__cell portion-list__cell_col_unique_voters_count"}>
                {(portion['unique_voters_count'] === undefined || inUniqueVotersCountCalc) ? loader : portion['unique_voters_count']}
            </div>
            {Object.keys(columnLabels2).map(key =>
                <div key={key} className={"portion-list__cell portion-list__cell_col_" + key}>
                    {
                        ((['processed_count', 'processing_count'].indexOf(key) > -1) ?
                            ((portion[key] == undefined) ? '' : portion[key].toLocaleString()) : portion[key])
                        || '\xa0' // non-breaking space
                    }
                </div>
            )}
            <div key={'actions'} className={"portion-list__cell portion-list__cell_col_actions"}>
            <span className="list-actions">
                {(!isPotionAlreadyFinishCalling && allowEdit) &&
                    <i className="action-icon fa fa-pencil" aria-hidden="true"
                        onClick={() => onOpenPortionModalClick(portion.key, false)} />}

                {(!isPotionAlreadyFinishCalling && allowDelete) &&
                    <i className="action-icon fa fa-trash" aria-hidden="true"
                        onClick={() => onDeletePortionClick(portion.key)} />}

                <i className="action-icon fa fa-files-o fa-flip-horizontal" aria-hidden="true"
                    onClick={() => onOpenPortionModalClick(portion.key, true)} />

                {!isPotionAlreadyFinishCalling &&
                    <i className="action-icon fa fa-file-excel-o" aria-hidden="true"
                        onClick={() => { }} />}

                {(!isPotionAlreadyFinishCalling || isCurrentPortion) &&
                    <i className={"action-icon fa fa-eye" + (portion.active ? '' : '-slash')} aria-hidden="true"
                        onClick={() => onActivePortionClick(portion.key, portion.active ? 0 : 1)} />}
            </span>
        </div>
        </div>
    );
}

PortionListItem.propTypes = {
    portion: PropTypes.object,
    onOpenPortionModalClick: PropTypes.func,
    onActivePortionClick: PropTypes.func,
    onDeletePortionClick: PropTypes.func,
    isPotionAlreadyFinishCalling: PropTypes.bool
}

export default PortionListItem;
