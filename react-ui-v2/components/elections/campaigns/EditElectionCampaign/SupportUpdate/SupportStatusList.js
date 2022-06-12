import React from 'react'
import Combo from 'components/global/Combo';

import constants from 'libs/constants';

class SupportStatusList extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			selectedItems: {},
			selectedValues: {},
			supportStatusType: null,
			supportStatusTypeName: ''
		}

		this.initConstants();

		this.changeSupportStatusType = this.changeSupportStatusType.bind(this);
	}

	/**
	 * Initialize constants
	 *
	 * @return void
	 */
	initConstants() {
        this.updateTypes = constants.electionCampaigns.supportStatusUpdate.types;
        this.supportStatusTypes = [
        	{id: constants.voterSupportStatusEntityTypes.election, name: 'סניף'},
        	{id: constants.voterSupportStatusEntityTypes.tm, name: 'טלמרקטינג'},
        	{id: constants.voterSupportStatusEntityTypes.final, name: 'סופי'}
        ]
    }

    componentWillReceiveProps(nextProps) {
    	if (this.props.updateType != nextProps.updateType) {
    		this.setState({
				selectedItems: {},
				selectedValues: {}    			
    		})
    	}
    }

	/**
	 * Change support status selection per key
	 *
	 * @param string key
	 * @param event e
	 * @return void
	 */
	changeSupportStatus(key, e) {
		let value = e.target.value;
		let selectedItem = e.target.selectedItem;

		let selectedItems = {...this.state.selectedItems};
		let selectedValues = {...this.state.selectedValues};
		selectedItems[key] = selectedItem;
		selectedValues[key] = value;
		this.setState({
			selectedItems: selectedItems,
			selectedValues: selectedValues
		});

		this.updateParentProps(selectedItems, this.state.supportStatusType);
	}

	/**
	 * Change support status type
	 *
	 * @param event e
	 * @return void
	 */
	changeSupportStatusType(e) {
		let value = e.target.value;
		let selectedItem = e.target.selectedItem;
		this.setState({
			supportStatusType: selectedItem,
			supportStatusTypeName: value
		});

		this.updateParentProps(this.state.selectedItems, selectedItem);
	}

	/**
	 * Update parent props
	 *
	 * @param array selectedItems
	 * @param object supportStatusType
	 * @return void
	 */
	updateParentProps(selectedItems, supportStatusType) {
		let disabled = true;
		//generate selected support status
		let selectedSupportStatus = [];
		for (var key in selectedItems) {
			if (selectedItems[key]) {
				let selected = {};
				selected[key] = selectedItems[key].key;
				selectedSupportStatus.push(selected);
				disabled = false;
			}
		};

		let selectedSupportStatusType = null;
		if (this.props.updateType == this.updateTypes.election) {
			selectedSupportStatusType = (supportStatusType)? supportStatusType.id : null;
			disabled = ((!supportStatusType) || disabled);
		}
		

		//update parent component
		this.props.updateAddDisabled(disabled);
		this.props.updateSelectedSupportStatus(selectedSupportStatus, selectedSupportStatusType);
	}

	/**
	 * Render support status row
	 * 
	 * @return void
	 */
	renderSupportStatusRows() {
		let self = this;
		let baseSupportStatus = (this.props.updateType == this.updateTypes.election)? 
									this.props.supportStatus[this.props.previousCampaignKey] :
									this.props.supportStatus[this.props.currentCampaignKey];
		baseSupportStatus = (baseSupportStatus) ? 
									baseSupportStatus : [];
		return baseSupportStatus.map(function(supportStatus, index) {
			let selectedItem = self.state.selectedItems[supportStatus.key];
			let value = self.state.selectedValues[supportStatus.key];
			if (value == undefined) value='';
			let validSelection = true;
			if (!selectedItem) validSelection = false;
			let comboStyle = (validSelection)? {} : {borderColor: 'red'};
			return (
				<div key={index} className="row">
					<div className="col-xs-5">{supportStatus.name}</div>
					<div className="col-xs-5">
						<Combo items={self.props.supportStatus[self.props.currentCampaignKey]}
								itemIdProperty="key"
								itemDisplayProperty="name"
								onChange={self.changeSupportStatus.bind(self, supportStatus.key)}
								value={value}
								selectedItem={selectedItem}
								inputStyle={comboStyle}/>
					</div>
				</div>
			)
		});
	}

	/**
	 * Render text base on updateType
	 *
	 * @return JSX
	 */
	renderText() {
		if (this.props.updateType == this.updateTypes.election) {
			this.baseCampaignName = this.props.previousCampaignName;
			let comboStyle = (this.state.supportStatusType)? {} : {borderColor: 'red'};
			return (
				<div>
					<div className="row">{'עדכן ערך סטטוס סניף ממערכת בחירות קודמת למערכת בחירות נוכחית'}</div>
					<div className="row">{'נא לבחור סוג סטטוס ועבור כל סטטוס ישן את הסטטוס החדש'}</div>
					<div className="row">{'סטטוס שלא יבחר לא יועתק'}</div>	
					<div className="row">
						<div className="col-xs-5">
							<Combo items={this.supportStatusTypes}
									itemIdProperty="id"
									itemDisplayProperty="name"
									onChange={this.changeSupportStatusType}
									value={this.state.supportStatusTypeName}
									selectedItem={this.state.supportStatusType}
									inputStyle={comboStyle}/>
						</div>
					</div>
				</div>
			) 
		}else {
			this.baseCampaignName = this.props.currentCampaignName;
			return (
				<div>
					<div className="row">{'עדכון ערך סטטוס סופי על פי ערכים בשדות סטטוס סניף וט"מ'}</div>
					<div className="row">{'נא לבחור עבור כל סטטוס סניף/ט"מ את הסטטוס הסופי'}</div>
					<div className="row">{'אם ישנם שני סטטוסים שונים, הסטטוס העדכני יותר ילקח'}</div>
					<div className="row">{'סטטוס שלא יבחר לא יועתק'}</div>	
				</div>
			)
		}
	}

	render() {
		return (
			<div>
				{this.renderText()}
				<div className="row">
					<div className="col-xs-5" style={{paddingTop: "5px", fontWeight: "bold"}}>{this.baseCampaignName}</div>
					<div className="col-xs-5" style={{paddingTop: "5px", fontWeight: "bold"}}>{this.props.currentCampaignName}</div>
				</div>
				{this.renderSupportStatusRows()}
			</div>
		)
	}
}

export default SupportStatusList