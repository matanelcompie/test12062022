import React from 'react'
import Collapse from 'react-collapse'
import { connect } from 'react-redux'
import * as SystemActions from '../../../actions/SystemActions'

class PermissionItem extends React.Component {

	getChildren() {
		var _this = this;
		if (this.props.item.children.length > 0) {
			this.children = this.props.item.children.map(function(item) {
				return <PermissionItem dispatch={_this.props.dispatch} key={item.key} item={item} selectedPermissions={_this.props.selectedPermissions} openPermissions={_this.props.openPermissions}/>
			});
			var ulStyle = (this.props.openPermissions[this.props.item.id] == true) ? {} : {display: "none"};
			ulStyle.listStyleType = "none";
			return 	<ul style={ulStyle}>
						{this.children}
					</ul>
		} else {
			return;
		}
	}

	toggleOpenPermissionChildren() {
		this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.TOGGLE_OPEN_PERMISSION_CHILDREN, id: this.props.item.id});
	}

	toggleCheck(item, checked) {
		if (checked == undefined) checked = false;
		// if item's parent is false, can't set checked the item
		if (this.props.selectedPermissions[this.props.item.parent.key] == false) { 
			
		} else{
			this.props.dispatch({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.permissionGroups.Items'}); //setting item changed as dirty
			this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.TOGGLE_SELECT_PERMISSION, key: item.key, checked: !checked});
			for (var i=0; i<item.children.length; i++) {
				this.toggleCheck(item.children[i], checked);
			}
		}
	}

	setPlusIcon() {
		var className;
		var display = {};
		if (this.props.item.children.length > 0) {
			if (this.props.openPermissions[this.props.item.id]) className = "fa fa-minus-square-o";
			else className = "fa fa-plus-square-o";
		} else {
			className="fa fa-plus-square-o";
			display.visibility = "hidden";
		}
		return <i className={className} onClick={this.toggleOpenPermissionChildren.bind(this)} style={display}></i>
	}

	setChecked() {
		if (this.props.selectedPermissions[this.props.item.key]) this.checked = true;
		else this.checked = false;

		// if item's parent is false, can't set checked the item - set itemNotAllowed= true to disable
		if (this.props.selectedPermissions[this.props.item.parent.key] == false){
			this.itemNotAllowed = true;
		} else{
			this.itemNotAllowed = false;
		}
	}

	render() {
		this.setChecked();
		return (
			<li>
				{this.setPlusIcon()}<input type="checkbox" disabled={(this.itemNotAllowed  ? "disabled" : "")} readOnly  checked={this.checked} onClick={this.toggleCheck.bind(this, this.props.item, this.props.selectedPermissions[this.props.item.key])} />
				{this.props.item.name}
				{this.getChildren()}
			</li>
		)
	}
}

export default connect()(PermissionItem)