import React from 'react'

import CampaignMessageItem from './CampaignMessageItem';


/**
 * CampaignMessageList component
 *
 * @param array messageList
 * function updateCampaignMessage
 * @return jsx
 */
const CampaignMessageList = ({ messagesList, updateCampaignMessage, editMessage, deleteMessage,disabledButtons }) => {

	//contant column list for campaign messages list
	let columnItems = [
		{ name: 'order', label: '#' },
		{ name: 'name', label: 'שם' },
		{ name: 'actions', label: 'פעולות' }
	];

	/**
	 * Convert messageList to array of CampaignMessageItem
	 *
	 * @return jsx
	 */
	function renderMessages() {
		let messages = messagesList.map(function (message) {
			return (
				<CampaignMessageItem
					key={message.key}
					message={message}
					updateCampaignMessage={updateCampaignMessage}
					editMessage={editMessage}
					deleteMessage={deleteMessage}
					disabledButtons={disabledButtons}
				/>
			);
		});
		return messages;
	}

	/**
	 * Render message list header
	 *
	 * @return jsx
	 */
	function renderHeader() {
		let renderedHeader = columnItems.map(function (item) {
			return <div key={item.name} className={"campaign-messages-list__cell campaign-messages-list__cell_col_" + item.name}>{item.label}</div>
		});

		return renderedHeader;
	}

	return (
		<div className="campaign-messages-list">
			<div className="campaign-messages-list-header">
				{renderHeader()}
			</div>
			{renderMessages()}
		</div>
	)
}

export default CampaignMessageList;