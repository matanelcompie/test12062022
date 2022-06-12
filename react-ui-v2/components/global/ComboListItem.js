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
				else if ((typeof(this.itemDisplayName)) != 'string') this.itemDisplayName = String(this.itemDisplayName);
			}

			//set marked text if exists, otherwise empty it
			if (!this.props.markText) {
				this.emptyMarkText();
			} else {
				let markPosition = this.itemDisplayName.indexOf(this.props.markText);
				if (markPosition < 0) {
					this.emptyMarkText();
				} else {
					this.beforeMarkText = this.itemDisplayName.substr(0, markPosition);
					this.afterMarkText = this.itemDisplayName.substr(this.beforeMarkText.length + this.props.markText.length);
					this.markText = this.props.markText;
				}
			}
		} else {
			console.error("item in Combo is not defined");
			this.showItem = false;
		}
	}

	/**
	 * Empty the marked text for display
	 *
	 * @return void
	 */
	emptyMarkText() {
		this.beforeMarkText = this.itemDisplayName;
		this.markText = '';
		this.afterMarkText = '';
	}

	setItemClick() {
		if (this.props.itemClick != undefined) {
			this.props.itemClick(this.props.item);
		}
	}
	componentDidMount(){
		 this.refs.listItem.focus();
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
		if(this.props.disabled){
		
			this.itemClass=this.itemClass+' disabled';
		}
		
		if (this.props.style != undefined) this.itemStyle = {...this.itemStyle, ...this.props.style};
	}
	render() {
		this.renderItem();
		this.setItemStyle();
		return (
			<li  className={this.itemClass} onClick={this.setItemClick.bind(this)} style={this.itemStyle} ref="listItem">
				<div>
					{this.beforeMarkText}<strong>{this.markText}</strong>{this.afterMarkText}
				</div>
			</li>
		)
	}
}

export default ComboListItem