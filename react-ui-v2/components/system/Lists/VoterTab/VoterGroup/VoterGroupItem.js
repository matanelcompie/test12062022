import React from 'react';
import { connect } from 'react-redux';
 
import * as SystemActions from 'actions/SystemActions';
import VoterGroupList from './VoterGroupList';
import constants from 'libs/constants';


class VoterGroupItem extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }
	
	/*
		Init constant labels
	*/
    textIgniter() {
        this.textValues = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול',
			addlTitle: 'הוספה',
			groups_permission_names: {
				none: 'ללא',
				geographic: 'גיאוגרפית',
				team: 'צוות',
				user: 'משתמש',
			}
        };
    }

    toggleDisplayChildes() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_VOTER_GROUP_OPEN_STSTUS, id: this.props.items.id});
    }
	/*
		Function that gets hex color and number and lightens/darkens that color
	*/
	lightenDarkenColor(col, amt) {
		var usePound = false;
		if (col[0] == "#") {
			col = col.slice(1);
			usePound = true;
		}
		var num = parseInt(col,16);
		var r = (num >> 16) + amt;
 
		if (r > 255) r = 255;
		else if  (r < 0) r = 0;
 
		var b = ((num >> 8) & 0x00FF) + amt;
 
		if (b > 255) b = 255;
		else if  (b < 0) b = 0;
 
		var g = (num & 0x0000FF) + amt;
 
		if (g > 255) g = 255;
			else if (g < 0) g = 0;
			return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
		}
	
	/*
		Returns child elements of this voter-group item
	*/
    getChildes() {
        if (this.props.items.children.length > 0) {
            var ulStyle = (this.props.openVoterGroups[this.props.items.id] == true) ? {} : {display: "none"};
            return(<VoterGroupList dispatch={this.props.dispatch} items={this.props.items.children} currentUser={this.props.currentUser} 
                            isEditMode={this.props.isEditMode} itemInEditMode={this.props.itemInEditMode}  
                            keyInSelectMode={this.props.keyInSelectMode} openVoterGroups={this.props.openVoterGroups} ulStyle={ulStyle} itemInAddMode={this.props.itemInAddMode}
							rgbExpandColor={this.lightenDarkenColor(this.props.rgbExpandColor,20)} rgbRowColor={this.lightenDarkenColor(this.props.rgbRowColor,15)}
							showAddEditNewGroupWindow={this.props.showAddEditNewGroupWindow.bind(this)}
							/>)
        }
    }

	/*
		Returns dynamically the plus sign of this item row
	*/
    setPlusIcon() {
        var display = {};
        if (this.props.items.children.length > 0) {
        } else {
            display.visibility = "hidden";
        }
		return  <a aria-expanded={this.props.openVoterGroups[this.props.items.id]?"true":"false"} className={"collapsed" + (this.props.openVoterGroups[this.props.items.id] ? "-in" :"")}  >
					<div className={"collapseIcon-groups "}  onClick={this.toggleDisplayChildes.bind(this)} style={{...display , backgroundColor:this.props.rgbExpandColor}}></div>
				</a>
    }
	getPermissionText(){
		let permission_type = this.props.items.permission_type ? this.props.items.permission_type : 0;
		let type = 'none';
		for(let per in constants.groups_permission_types){
			if(permission_type==constants.groups_permission_types[per]){type = per;}
		}
		let permissionText = this.textValues.groups_permission_names[type];
		return permissionText;
	}
	/*
		On clicking delete this toggles confirm delete prompt window
	*/
    deleteRow() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_GROUP_DELETE_MODE_UPDATED, key: this.props.items.key, name:this.props.items.name});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_GROUP_MODAL_DIALOG_DISPLAY});
    }


    render() {
        return(
                <li>
                    <div className="row  panelCollapse nomargin group-level-1" style={{backgroundColor:this.props.rgbRowColor}}>
						{this.setPlusIcon()}
                        <div className="collapseTitleGroups pull-right">{this.props.items.name}</div>
						<div className="pull-left">
							<div className={"details-group group-indicator " + (!this.props.items.voters_in_groups_count ? "empty" : "full") + "-group-indicator"}> </div>
							<div className="details-group">{(this.props.items.created_at.split(' ')[0]).split("-").reverse().join("/")}</div>
							<div className="details-group">{(this.props.items.user)? (this.props.items.user.first_name + " " + this.props.items.user.last_name) : '-'}</div>
							<div className="details-group">{this.getPermissionText()}</div>
							<span className="separation-icon"></span>
							<a className="cursor-pointer" title="מחק קבוצה"  onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}> <span className="edit-group delete-group"></span></a>
							<a className="cursor-pointer" title="ערוך קבוצה" onClick={this.props.showAddEditNewGroupWindow.bind(this , {id:this.props.items.id,actionType:'edit' , itemRef:this.props.items})}> <span className="edit-group edit-group-icon"></span></a>
							<span className="separation-icon"></span>
							<a className="cursor-pointer" title="הוסף תת קבוצה" onClick={this.props.showAddEditNewGroupWindow.bind(this , {parentID:this.props.items.id , actionType:'add'})}> <span className="edit-group add-group"></span></a>
							<a className="cursor-pointer" title="הוסף קבוצה" onClick={this.props.showAddEditNewGroupWindow.bind(this , {parentID:this.props.items.parent_id  , actionType:'add'})}> <span className="edit-group add-sub-group"></span></a>
						</div>
                    </div>
                    {this.getChildes()}
                </li>
                );
    }
}

export default connect()(VoterGroupItem);