import React from 'react'

class ComboListItem extends React.Component {

	constructor(props) {
		super(props);
		this.itemDisplayName = "";
		this.showItem = true;
	}

	renderItem() {
		if (this.props.divider) return;
		if (this.props.item != undefined) {
			if (!this.props.item.hasOwnProperty(this.props.itemDisplayProperty)) {
				console.error("item in Combo does not have display property '" + this.props.itemDisplayProperty + "'");
				this.showItem = false;
			} else {
				this.itemDisplayName = this.props.item[this.props.itemDisplayProperty];
				if (this.itemDisplayName == null) this.itemDisplayName = 'null';
				else if (this.itemDisplayName == undefined) this.itemDisplayName = 'undefined';
			}
		} else {
			console.error("item in Combo is not defined");
			this.showItem = false;
		}
	}
	setItemClick() {
		if (this.props.itemClick != undefined) {
			this.props.itemClick(this.props.item);
		}
	}
	setItemStyle() {
		if (this.showItem) {
			this.itemStyle = {
				display: "block"
			}
			if ((this.props.height != undefined)&&(this.props.divider != true)) this.itemStyle.height = this.props.height + "px";
		} else {
			this.itemStyle = {
				display: "none"
			}
		}
		if (this.props.selected) {
			this.itemClass = "combo-selected";
		} else if (this.props.divider) {
			this.itemClass = "divider";
		} else {
			this.itemClass = "";
		}
		if (this.props.style != undefined) this.itemStyle = {...this.itemStyle, ...this.props.style};
	}
	render() {
		this.renderItem();
		this.setItemStyle();
		return (
			<li className={this.itemClass} onClick={this.setItemClick.bind(this)} style={this.itemStyle}>
				<div>
					{this.itemDisplayName}
				</div>
			</li>
		)
	}
}

export default ComboListItem