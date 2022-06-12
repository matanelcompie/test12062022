import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

//Source item events
const ItemSource = {
    beginDrag(props) {
        return {item: props.item};
    },
    endDrag(props, monitor) {
        if (monitor.didDrop()) {
            props.drop();
        } else {
            props.revertToOriginal();
        }
    }
};

//collection for drag
function dragCollect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    };
}

//target item events
const ItemTarget = {};

//collection for drop
function dropCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        dragItem: monitor.getItem()
    };
}

class SupportStatusRow extends React.Component {

    constructor(props) {
        super(props);
        this.initVariables();
    }

    initVariables() {
        this.textValues = {
            active: 'פעיל',
            notActive: 'לא פעיל',
            nameIsSmall: 'שם נושא קטן מדי',
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };

        this.draggingStyle = {
            opacity: this.props.isDragging ? 0 : 1
        };
        this.dragHandleStyle = {
            cursor: "move",
            paddingLeft: "10px"
        };
    }

    deleteRow() {
        this.props.updateScrollPosition();
        const supportStatuskey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.SUPPORT_STATUS_DELETE_MODE_UPDATED, supportStatuskey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_SUPPORT_STATUS_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const supportStatuskey = this.props.item.key;
        const supportStatusName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.SUPPORT_STATUS_EDIT_MODE_UPDATED, supportStatuskey, supportStatusName});
    }

    updateRowText(e) {
        const supportStatusName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.SUPPORT_STATUS_EDIT_VALUE_CHANGED, supportStatusName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'SupportStatus'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.SUPPORT_STATUS_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'SupportStatus'});
    }

    saveEdit() {
        SystemActions.updateSupportStatus(store, this.props.supportStatusKeyInSelectMode, this.props.supportStatusTextBeingEdited);
    }

    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    //drag over callback for calculating height ration of mouse over element and moving items accordingly
    onDragOver(e) {
        if (this.props.isOver) {
            var table = this.self.parentNode.parentNode;
            var offsetTop = this.self.offsetTop + table.offsetHeight;
            var height = this.self.offsetHeight + table.offsetHeight;
            var mouseY = e.clientY;
            var yOffset = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            var over = (mouseY + yOffset - offsetTop) / height;

            if (over <= 0.5) {
                this.props.move(this.props.dragItem.item, this.props.item, true);
            } else {
                this.props.move(this.props.dragItem.item, this.props.item, false);
            }
        }
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row" style={this.props.style}>
                    <td className="row">
                        <span className="col-md-7">
                            <span>{this.props.item.name}</span>
                        </span>
                        <span className={"col-md-3 pull-left edit-buttons" + (this.props.isSupportStatusInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.support_status.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.support_status.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr'>
                    <td className="row">
                        <input type="text" className="col-md-7 form-control" value={this.props.supportStatusTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                        <span className="col-md-3 pull-left edit-buttons">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle} 
                                    disabled={(this.props.dirty && this.props.supportStatusTextBeingEdited.length >= 2 ? "" : "disabled")}><i className="fa fa-floppy-o"></i></button>&nbsp;
                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                    title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderDnDMode() {
        return (
                this.props.connectDropTarget(this.props.connectDragPreview(
                        <tr ref={this.getRef.bind(this)} style={this.draggingStyle} onDragOver={this.onDragOver.bind(this)}>
                            <td>
                                {this.props.connectDragSource(<i className="fa fa-drag-handle" style={this.dragHandleStyle}></i>)}
                                {this.props.item.name}
                            </td>
                        </tr>
                        ))
                );
    }

    render() {
        if (this.props.isSupportStatusInEditMode && this.props.item.key === this.props.supportStatusKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }

        if (this.props.issupportStatusInDnDSort == true) {
            /* DND MODE */
            return this.renderDnDMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isSupportStatusInEditMode: state.system.listsScreen.voterTab.isSupportStatusInEditMode,
        supportStatusKeyInSelectMode: state.system.listsScreen.voterTab.supportStatusKeyInSelectMode,
        supportStatusTextBeingEdited: state.system.listsScreen.voterTab.supportStatusTextBeingEdited,
        issupportStatusInDnDSort: state.system.listsScreen.voterTab.issupportStatusInDnDSort,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}

//using flow to combing two HOC on our DndSortItem class
export default connect(mapStateToProps)(withRouter(flow(
        DragSource('SUPPORT_STATUS_DND_ROW', ItemSource, dragCollect),
        DropTarget('SUPPORT_STATUS_DND_ROW', ItemTarget, dropCollect)
        )(withRouter(SupportStatusRow))));