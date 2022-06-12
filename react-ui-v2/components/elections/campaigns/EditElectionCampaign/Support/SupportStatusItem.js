import React from 'react';
import { connect } from 'react-redux';
import Combo from 'components/global/Combo';
import * as GlobalFunctions from 'libs/globalFunctions';

import * as ElectionsActions from 'actions/ElectionsActions';


class SupportStatusItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: 0,
            editMode: false,
            name: props.item.name,
            level: String(props.item.level),
            validName: true,
            validLevel: true,
            validConnectedSupportStatus: true,
            connectedSupportStatusKey: this.props.item.connected_support_status_key,
            connectedSupportStatusName: this.props.item.connected_support_status_name,
            previousSupportStatus: [],
        };
    }

    componentWillMount() {
        this.setState({active: this.props.item.active});
        if (this.props.previousSupportStatus.length > 0) this.setPreviousSupportStatusList(this.props.previousSupportStatus);
    }

    /**
     * Set thinned list of previous support status without already used statuses
     *
     * @param array previousSupportStatus
     * @return void
     */
    setPreviousSupportStatusList(previousSupportStatus) {
        let _this = this;
        let selectedKeys = {};
        this.props.items.forEach(function(item) {
            if ((_this.props.item.key != item.key) && (item.connected_support_status_key != null)) {
                selectedKeys[item.connected_support_status_key] = true;
            }
        });
        let actualPreviousSupportStatus =  previousSupportStatus.filter(function(supportStatus) {
            return (selectedKeys[supportStatus.key] != true);
        });
        this.setState({
            previousSupportStatus: actualPreviousSupportStatus
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.item != nextProps.item) {
            this.setState({
                active: nextProps.item.active,
                name: nextProps.item.name,
                level: nextProps.item.level,
                validName: true,
                validLevel: true,
                validConnectedSupportStatus: true,
                connectedSupportStatusKey: nextProps.item.connected_support_status_key,
                connectedSupportStatusName: nextProps.item.connected_support_status_name,
            });
        }
        if (this.props.previousSupportStatus.length != nextProps.previousSupportStatus) {
            this.setPreviousSupportStatusList(nextProps.previousSupportStatus);
        }
    }

    /**
     * Get date in Hebrew format
     * 
     * @return string
     */
    getDate() {
        return GlobalFunctions.dateTimeReversePrint(this.props.item.updated_at);
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
            if ((item.key != _this.props.item.key) && 
                (value == item.name)) foundDuplicate = true;
        });
        let validName = (value.length > 2) && !foundDuplicate;
        this.setState({
            name: value,
            validName: validName
        });
    }

    /** 
     * Change connected support status
     *
     * @param event e
     * @return void
     */
    changeConnectedSupportStatus(e) {
        let value = e.target.value;
        let key = (e.target.selectedItem)? e.target.selectedItem.key : null;
        let validConnectedSupportStatus = (key || value == '')? true : false;
        this.setState({
            connectedSupportStatusKey: key,
            connectedSupportStatusName: value,
            validConnectedSupportStatus: validConnectedSupportStatus
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

    updateSupportStatus(event) {
        // Prevent page refresh
        event.preventDefault();
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.CHANGE_FIELD_VALUE , fieldName:'tabsLocked' , fieldValue:false});
        this.setState({editMode: false});
        this.props.setEditKey(null);
        ElectionsActions.updateElectionCampaignSupportStatus(this.props.dispatch,
                                                            this.props.campaignKey,
                                                            this.props.item.key, 
                                                            this.state.name.trim(),
                                                            this.state.active,
                                                            this.state.level,
                                                            this.state.connectedSupportStatusKey);
    }

    /**
     * Disable edit mode
     *
     * @return void
     */
    disableEditMode() {
        this.setState({
            editMode: false,
            active: this.props.item.active,
            name: this.props.item.name,
            level: String(this.props.item.level),
            validName: true,
            validLevel: true,
            validConnectedSupportStatus: true,
            connectedSupportStatusKey: this.props.item.connected_support_status_key,
            connectedSupportStatusName: this.props.item.connected_support_status_name
        });
        this.props.setEditKey(null);
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.CHANGE_FIELD_VALUE , fieldName:'tabsLocked' , fieldValue:false});
    }

    /**
     * Enable edit mode
     *
     * @return void
     */
    enableEditMode() {
        this.setState({editMode: true});
        this.props.setEditKey(this.props.item.key);
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.CHANGE_FIELD_VALUE , fieldName:'tabsLocked' , fieldValue:true});
    }

    /**
     * Change active status
     * 
     * @return void
     */
    supportStatusActiveChange() {
        let newSupportActive = (this.state.active) ? 0 : 1;
        this.setState({active: newSupportActive});
    }

    renderActiveStatus() {
        if ( this.state.editMode ) {
            return ;
        }
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
     * Get connected support status style
     * 
     * @return object
     */
    getConnectedSupportStatusStyle() {
        let style = {};
        if (!this.state.validConnectedSupportStatus) style.borderColor = "red";
        return style;
    }

    /**
     * return disable state for save button
     * 
     * @return boolean
     */
    saveDisabled() {
        return (!this.state.validName || !this.state.validLevel || !this.state.validConnectedSupportStatus);
    }

    /**
     * Show delete modal
     *
     * @return void
     */
    showDeleteModal() {
        this.props.showDeleteModal(this.props.item);
    }

    /**
     * Render status row
     *
     * @return JSX
     */
    renderRow() {
        let trStyle = {height: "51px"};
        if (this.state.editMode) {
            console.log(this.state.connectedSupportStatusKey);
            return (
                <tr style={trStyle}>
                    <td>{this.props.supportIndex + 1}.</td>
                    <td><input  type="text" 
                                className="form-control" 
                                value={this.state.name}
                                onChange={this.changeName.bind(this)}
                                style={this.getNameStyle()}/></td>
                    <td><input type="checkbox" title="פעיל" checked={this.state.active}
                          onChange={this.supportStatusActiveChange.bind(this)}/></td>
                    <td><input  type="number" 
                                className="form-control" 
                                value={this.state.level}
                                onChange={this.changeLevel.bind(this)}
                                style={this.getLevelStyle()}/></td>
                    <td><Combo items={this.state.previousSupportStatus}
                                itemIdProperty="key"
                                itemDisplayProperty="name"
                                onChange={this.changeConnectedSupportStatus.bind(this)}
                                value={this.state.connectedSupportStatusName}
                                inputStyle={this.getConnectedSupportStatusStyle()}/></td>
                    <td></td>
                    <td>{this.checkEditStatusPermission() ? this.renderButtons() : '\u00A0'}</td>
                </tr>
            )
        } else {
            let active = (this.state.active)? <img src={window.Laravel.baseURL + 'Images/icon-ok.png'}/> : '\u00A0';
            return (
                <tr style={trStyle}>
                    <td>{this.props.supportIndex + 1}.</td>
                    <td>{this.state.name}</td>
                    <td>{active}</td>
                    <td style={{direction: "ltr",textAlign: "right"}}>{this.state.level}</td>
                    <td>{this.state.connectedSupportStatusName}</td>
                    <td>{this.getDate()}</td>
                    <td>{this.renderButtons()}</td>
                </tr>
            );            
        }
    }

    /**
     * return edit button by permission
     *
     * @return JSX
     */
    getEditButton() {
        if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.support_status.delete'] == true ) {
            return <span className="edit-group edit-group-icon cursor-pointer"  onClick={this.enableEditMode.bind(this)}/>
        } else {
            return '\u00A0'
        }            
    }

    /**
     * return delete button by permission
     *
     * @return JSX
     */
    getDeleteButton() {
        if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.support_status.delete'] == true ) {
            return <span className="glyphicon glyphicon-trash green-icon cursor-pointer" onClick={this.showDeleteModal.bind(this)}></span>
        } else {
            return '\u00A0'
        }
    }

    /**
     * Render buttons
     * 
     * @return JSX
     */
    renderButtons() {
        if ( this.state.editMode ) {
            return [
                <button key={0} 
                        className="btn btn-success btn-xs"
                        title="שמירה"
                        onClick={this.updateSupportStatus.bind(this)}
                        disabled={this.saveDisabled()}>
                        <i className="fa fa-floppy-o"/>
                </button>,
                <button key={1} className="btn btn-danger btn-xs" title="ביטול" onClick={this.disableEditMode.bind(this)}>
                    <i className="fa fa-times"/>
                </button>
            ];
        } else {
            if (this.props.editItemKey == null) {
                return <div>
                    {this.getEditButton()}
                    {this.getDeleteButton()}
                    </div>
            } else {
                return ;
            }
        }
    }

    checkEditStatusPermission() {
        return ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.support_status.edit'] == true );
    }

    render() {
        return this.renderRow();
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser
    };
}

export default connect(mapStateToProps) (SupportStatusItem);