import React from 'react'
import Collapse from 'react-collapse'
import * as SystemActions from '../actions/SystemActions'
import { connect } from 'react-redux'

class MenuItem extends React.Component {

	menuClick(e) {
		e.preventDefault();
		if (this.props.item.children.length > 0) {
			this.props.dispatch({type: SystemActions.ActionTypes.MENU.TOGGLE_MENU_ITEM, item: this.props.item, isOpen: this.props.open});
		} else {
			this.props.linkClick(this.props.item);
		}
	}

	setPadding() {
		this.spanStyle = {
			paddingRight: this.props.level*10 + "px"
		}
	}

	setLinkStyle() {
		if (this.props.item.children.length > 0) {
			this.linkStyle = {
				backgroundRepeat: "no-repeat",
	    		backgroundPosition: "left 0px"
			}
			if (!this.props.open) {
				this.linkStyle.backgroundImage = "url('" + window.Laravel.baseURL + "Images/parent-item-icon.png')";
			} else {
				this.linkStyle.backgroundImage =  "url('" + window.Laravel.baseURL + "Images/parent-item-icon-open.png')";
			}			
		} else {
			this.linkStyle = {};
		}
	}

	setSubMenu() {
		if (this.props.item.children.length > 0) {
			var _this = this;
			let hasNestedMenu = false;
			this.subMenu = this.props.item.children.map(function(subMenu) {
				var open = (_this.props.openedMenuItems.indexOf(subMenu) == -1) ? false : true;
				if (subMenu.children.length > 0) hasNestedMenu = true;
				return <MenuItem showSearch={subMenu.showSearch} baseUrl={_this.props.baseUrl} dispatch={_this.props.dispatch} key={subMenu.id} item={subMenu} openedMenuItems={_this.props.openedMenuItems} open={open} level={_this.props.level + 1} linkClick={_this.props.linkClick} currentUser={_this.props.currentUser}/>
			});
			return <Collapse isOpened={this.props.open} hasNestedCollapse={hasNestedMenu}><ul className="nav Sidebar">{this.subMenu}</ul></Collapse>
		} else {
			return ;
		}
	}

	setLink() {
		if (this.props.item.children.length > 0) {
			this.link = undefined;
		} else {
			let needSlash = false;
			let baseUrl = this.props.baseUrl;
			if (this.props.baseUrl.charAt(this.props.baseUrl.length-1) == "/") {
				needSlash = false;
			} else {
				needSlash = true;
			}
			let link = "";
			if (this.props.item.url.charAt(0) == "/") {
				if (needSlash) link = this.props.item.url;
				else link = this.props.item.url.slice(1);
			} else {
				if (needSlash) link = "/" + this.props.item.url;
				else link = this.props.item.url;
			}
			this.link = baseUrl + link;
		}
	}

	setDisplay() {
		if ((!this.props.currentUser.admin)&&(!this.props.currentUser.permissions[this.props.item.permission_name])) {
			this.liStyle = {
				display: 'none'
			}
		} else {
			if(this.props.showSearch){
			   this.liStyle = {};
			}
			else{
				this.liStyle = {
				display: 'none'
			    }
			}
			   
		}
	}

	render() {
		this.setPadding();
		this.setLinkStyle();
		this.setLink();
		this.setDisplay();
		var subMenu = this.setSubMenu();
		return (
			<li style={this.liStyle}>
				<a href={this.link} style={this.linkStyle} onClick={this.menuClick.bind(this)}><span className="Icon SideBarIcon Account" style={this.spanStyle}></span>{this.props.item.name}</a>
				{subMenu}
			</li>
		)
	}
}

export default connect()(MenuItem)