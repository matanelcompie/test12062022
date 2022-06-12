import React from 'react'
import MenuItem from './MenuItem'
import * as SystemActions from '../actions/SystemActions'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

class Menu extends React.Component {

	setMenuStyle() {
		if (this.props.open) {
			this.menuStyle = {
				right: "0px"
			}
		} else {
			this.menuStyle = {
				right: "-320px"
			}
		}
	}

	setMenuItems() {
		var _this = this;
		this.menuItems = this.props.menu.map(function(menu) {
			var open = (_this.props.openedMenuItems.indexOf(menu) == -1) ? false : true;
			return <MenuItem showSearch={menu.showSearch} baseUrl={_this.props.router.location.basename} key={menu.id} item={menu} openedMenuItems={_this.props.openedMenuItems} open={open} level={0} linkClick={_this.linkClick.bind(_this)} currentUser={_this.props.currentUser}/>
		});
	}

	linkClick(item) {
		this.props.dispatch({type: SystemActions.ActionTypes.MENU.TOGGLE_MENU});
		if (item.actionName != null) {
			SystemActions.executeMenuAction(item.actionName, this.props.dispatch);
		}
		if (item.external_link) window.open(window.Laravel.baseURL  + item.url); 
		else this.props.router.push(item.url);
	}

	searchNavTextChange(e){
		this.props.dispatch({type: SystemActions.ActionTypes.MENU.SEARCH_NAV_TEXT_CHANGE , data:e.target.value});
	    this.props.dispatch({type: SystemActions.ActionTypes.MENU.SEARCH_IN_MENU , data:e.target.value});
	}
	
	
	render() {
		//console.log(this.props.menu);
		this.setMenuStyle();
		this.setMenuItems();
		return (
			<div className="SidebarWrapper" style={this.menuStyle}>
				<input type="text" className="QuickNav" placeholder="ניווט מהיר" value={this.props.navSeatchText} onChange={this.searchNavTextChange.bind(this)} />
				<ul className="nav Sidebar">          
		      		{this.menuItems}
				</ul>
			</div>
		)
	}
}

function mapStateToProps(state) {

	return {
		open: state.system.menus.open,
		menu: state.system.menus.menu,
		openedMenuItems: state.system.menus.openedMenuItems,
		changesSaved: state.system.changesSaved,
		currentUser: state.system.currentUser,
		navSeatchText: state.system.navSeatchText,
	}
}

export default connect(mapStateToProps)(withRouter(Menu))