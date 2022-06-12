import React from 'react'
import ModalWindow from 'components/global/ModalWindow'

import * as ElectionsActions from 'actions/ElectionsActions';

class AddSupportStatusModal extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			name: '',
			level: 0,
			validName: false,
			validLevel: true,
		};

		this.changeName = this.changeName.bind(this);
		this.changeLevel = this.changeLevel.bind(this);
		this.addSupportStatus = this.addSupportStatus.bind(this);

	}

	/**
	 * Get modal buttons
	 *
	 * @return JSX
	 */
	getButtons() {
		return [
                {
                    class: 'btn new-btn-default btn-secondary',
                    text: 'ביטול',
                    action: this.props.hideModal,
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text:  'שמירה',
                    action: this.addSupportStatus,
                    disabled: (!this.state.validName || !this.state.validLevel)
                }
            ]
	}

    /** 
     * Change status name
     *
     * @param event e
     * @return void
     */
    changeName(e) {
        let _this = this;
        let value = e.target.value;
        let foundDuplicate = false;
        this.props.items.forEach(function(item) {
            if (value == item.name) foundDuplicate = true;
        });
        let validName = (value.length > 2) && !foundDuplicate;
        this.setState({
            name: value,
            validName: validName
        });
    }

    /**
     * Change level
     * 
     * @param event e
     * @return void
     */
    changeLevel(e) {
        let value = e.target.value;
        let validLevel = (value.indexOf(".") < 0);
        this.setState({
            level: value,
            validLevel: validLevel
        });
    }

    /**
     * Get level style
     *
     * @return object
     */
    getLevelStyle() {
        let style = {
            direction: "ltr",
            textAlign: "right",
            width: "100px"
        };
        if (!this.state.validLevel) style.borderColor = "red";
        return style;
    }

    /**
     * Get name style
     * 
     * @return object
     */
    getNameStyle() {
        let style = {};
        if (!this.state.validName) style.borderColor = "red";
        return style;
    }

    /**
     * Add support status
     *
     * @return void
     */
	addSupportStatus() {
		ElectionsActions.addElectionCampaignSupportStatus(this.props.dispatch,
														this.props.campaignKey,
														this.state.name,
														this.state.level);
		this.props.hideModal();
	}

	render() {

		return (
			<ModalWindow title="סטטוס תמיכה חדש"
						show={true}
						buttonX={this.props.hideModal}
						buttons={this.getButtons()}>
				<form>
					<div className="row containerStrip" style={{borderBottom: 'none', paddingBottom: '10px'}}>
						<div className="form-group">
							<label htmlFor="add_support_status_name" className="col-xs-2 control-label nopadding">שם סטטוס</label>
							<input type="text" 
									className="form-control col-xs-8"
									id="add_support_status_name"
									value={this.state.name}
									onChange={this.changeName}
									style={this.getNameStyle()}/>
						</div>
					</div>
					<div className="row containerStrip" style={{borderBottom: 'none', paddingBottom: '10px'}}>
						<div className="form-group">
							<label htmlFor="add_support_status_level" className="col-xs-2 control-label nopadding">רמה</label>
							<input type="number"
									className="form-control col-xs-4"
									id="add_support_status_level"
									value={this.state.level}
									onChange={this.changeLevel}
									style={this.getLevelStyle()}/>
						</div>
					</div>
				</form>
			</ModalWindow>
		)
	}
}

export default AddSupportStatusModal