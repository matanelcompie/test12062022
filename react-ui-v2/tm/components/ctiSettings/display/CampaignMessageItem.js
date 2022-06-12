import React from 'react'

/**
 * CampaignMessageItem component
 *
 * @param object message
 * @param function updateCampaignMessage
 * @return jsx
 */
const CampaignMessageItem = ({ message, updateCampaignMessage, editMessage, deleteMessage, disabledButtons }) => {

    //constants
    let columnItems = [
        { name: 'order', label: '#' },
        { name: 'name', label: 'שם' },
        { name: 'actions', label: 'פעולות' }
    ];


    /**
     * Update campaign message to active
     *
     * @param event e
     * @return void
     */
    function updateCampaignMessageActive(e) {
        let parameters = {
            active: (message.active == 0) ? 1 : 0
        }
        updateCampaignMessage(message, parameters);
    }

    /**
     * Edit campaign message
     *
     * @param event e
     * @return void
     */
    function editMessageItem(e) {
        editMessage(message);
    }

    /**
     * Delete campaign message
     *
     * @param event e
     * @return void
     */
    function deleteMessageItem(e) {
        deleteMessage(message);
    }
    let disabledClass = disabledButtons ? 'disabledClass' : '';
    return (
        <div className={"campaign-messages-list-item" + (message.active ? '' : ' campaign-messages-list-item_inactive')}>
            {columnItems.map(item =>
                <div key={item.name} className={"campaign-messages-list__cell campaign-messages-list__cell_col_" + item.name}>
                    {
                        ((['name', 'order'].indexOf(item.name) > -1) ? (message[item.name] != undefined) ? message[item.name] : '' : '')
                        || (item.name === 'actions' &&
                            <span className="list-actions">
                                <i className={"action-icon fa fa-pencil " + disabledClass} aria-hidden="true"
                                    onClick={!disabledButtons ? editMessageItem : ''} />
                                <i className={"action-icon fa fa-trash " + disabledClass} aria-hidden="true"
                                    onClick={!disabledButtons ? deleteMessageItem : ''} />
                                <i className={disabledClass + " action-icon fa fa-eye" + (message.active ? '' : '-slash')} aria-hidden="true"
                                    onClick={!disabledButtons ? updateCampaignMessageActive : ''} />
                            </span>
                        )
                        || '\xa0' // non-breaking space
                    }
                </div>
            )}
        </div>
    )
}

export default CampaignMessageItem;