import React from 'react';

import ModalWindow from 'components/global/ModalWindow';

import RadioSet from 'tm/components/common/RadioSet';

import { validateURL } from 'libs/globalFunctions';

/**
 * Campaign message modal component
 */
class CampaignMessageModal extends React.Component {

	/**
	 * Class constructor
	 *
	 * @param object props
	 * @return void
	 */
	constructor(props) {
		super(props);
		this.initConstants();
	}


	componentWillMount() {
		this.initState();
	}

	/**
	 * Initialize component state
	 *
	 * @return void
	 */
	initState() {
		//initialize state for new message or existing message
		let messageType = 0;
		if (this.props.message.link != undefined) messageType = 1;

		let shareable = (this.props.message.shareable) ? 1 : 0;

		this.setState({
			name: (this.props.message.name != undefined) ? this.props.message.name : '',
			messageType: messageType,
			shareable: shareable,
			link: (this.props.message.link != undefined) ? this.props.message.link : '',
			file: undefined
		});
	}

	/**
	 * Initialize constants
	 *
	 * @return void
	 */
	initConstants() {

		//message type
		this.messageType = {
			file: 0,
			url: 1
		};

		//message type options for redio set component
		this.messageTypeOptions = [
			{ value: this.messageType.file, label: "קובץ" },
			{ value: this.messageType.url, label: "לינק" }
		];

		//mesage share options for redio set component
		this.shareOptions = [
			{ value: 0, label: "לא" },
			{ value: 1, label: "כן" }
		];
	}

	/**
	 * Save mesasge to API
	 *
	 * @return void
	 */
	saveMessage() {
		//create parameters if existing message
		if (this.props.message.key != undefined) {
			let parameters = {
				name: this.state.name,
				shareable: this.state.shareable
			};

			if (this.state.messageType == this.messageType.url) parameters.link = this.state.link;

			this.props.updateMessage(this.props.message, parameters);
		} else {
			//create parameters if new message
			let parameters = {
				name: this.state.name,
				shareable: this.state.shareable,
				type: this.state.messageType
			};
			if (this.state.messageType == this.messageType.file) parameters.file = this.state.file;
			else parameters.link = this.state.link;

			this.props.addMessage(parameters);
		}
	}

	/**
	 * Render dynamic parameters for each render pass
	 *
	 * @return void
	 */
	renderDynamicVariables() {
		if (this.props.message.key == undefined) {
			this.title = "הוספת מסר";
		} else {
			this.title = "עריכת מסר";
		}
	}

	/**
	 * Change message name
	 *
	 * @param event e
	 * @return void
	 */
	changeName(e) {
		this.setState({
			name: e.target.value
		});
	}

	/**
	 * Change message type
	 *
	 * @param event e
	 * @return void
	 */
	changeMesasgeType(e) {
		this.setState({
			messageType: e.target.value
		});
	}

	/**
	 * Change message shareable
	 *
	 * @param event e
	 * @return void
	 */
	changeShare(e) {
		this.setState({
			shareable: e.target.value
		});
	}

	/**
	 * Change message link
	 *
	 * @param event e
	 * @return void
	 */
	changeMessageLink(e) {
		this.setState({
			link: e.target.value
		});
	}

	/**
	 * Change message file
	 *
	 * @param event e
	 * @return void
	 */
	changeMessageFile(e) {
		let file = undefined;
		if (e.target.files != undefined) {
			file = e.target.files[0];
		}

		this.setState({
			file: file
		});
	}

	/**
	 * Render message main input according to message type
	 *
	 * @param event e
	 * @return void
	 */
	renderMessageInput() {
		//render file input
		if (this.state.messageType == this.messageType.file) {
			if (this.props.message.key == undefined) {
				return (
					<div className="form-group">
						<input key={0}
							type="file"
							name="message-file"
							onChange={this.changeMessageFile.bind(this)} />
					</div>
				)
			} else {
				return "";
			}
		} else {
			//render link input
			return (
				<div className="form-group">
					<input key={1}
						type="text"
						className="form-control"
						placeholder="הכנס כתובת"
						name="message-link"
						onChange={this.changeMessageLink.bind(this)}
						value={this.state.link} />
				</div>
			)
		}
	}

	/**
	 * Check if save button should be disabled
	 *
	 * @return boolean
	 */
	disableSaveButton() {
		//name must have 3 letters
		if (this.state.name.length < 3) return true;
		//new message
		if (this.props.message.key == undefined) {
			if (this.state.messageType == this.messageType.file) {

				//file must exist
				if (this.state.file == undefined) return true;
			} else {
				//url must be valid
				if (!validateURL(this.state.link)) return true;
			}
		} else {
			//url must be valid
			if (this.state.messageType == this.messageType.file) return false;
			if (!validateURL(this.state.link)) return true;
		}
		return false;
	}

	render() {
		this.renderDynamicVariables();
		return (
			<ModalWindow
				show={true}
				title={this.title}
				buttonCancel={this.props.buttonCancel}
				buttonX={this.props.buttonX}
				buttonOk={this.saveMessage.bind(this)}
				disabledOkStatus={this.disableSaveButton()}>
				<div style={{ width: '700px' }}>
					<div className="form-group">
						<label htmlFor="message-input">שם מסר</label>
						<input className="form-control"
							id="message-input"
							placeholder="נא הכנס שם מסר"
							onChange={this.changeName.bind(this)}
							value={this.state.name} />
					</div>
					<div className="form-group">
						<label>סוג מסר</label>
						<RadioSet
							name="message-type"
							options={this.messageTypeOptions}
							activeValue={this.state.messageType}
							onChange={this.changeMesasgeType.bind(this)}
							inline={true}
							disabled={(this.props.message.name != undefined)}
						/>
					</div>
					<div className="form-group">
						{this.renderMessageInput()}
					</div>
					<div className="form-group">
						<label>ניתן לשיתוף</label>
						<RadioSet
							name="shareable"
							options={this.shareOptions}
							activeValue={this.state.shareable}
							onChange={this.changeShare.bind(this)}
							inline={true}
						/>
					</div>
				</div>
			</ModalWindow>
		)
	}
}

export default CampaignMessageModal;