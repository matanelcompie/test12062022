import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';
import Combo from '../../../global/Combo';

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

class ListsRequestStatusRow extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
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
        const requestStatuskey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_DELETE_MODE_UPDATED, requestStatuskey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_STATUS_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const item = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_EDIT_MODE_UPDATED, item});
    }

    updateRowText(key, e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'requestStatus'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'requestStatus'});
    }

    saveEdit() {
        const item = this.props.requestStatusInEditMode;
        SystemActions.updateRequestStatus(store, item);
    }

    comboChange(columnName, el) {
        if (el.target.selectedItem) {
            //store the name
            var value = el.target.selectedItem.name;
            var key = columnName + '_name';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_EDIT_VALUE_CHANGED, key, value});

            //store the key
            value = el.target.selectedItem.id;
            key = columnName + '_id';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_EDIT_VALUE_CHANGED, key, value});
        }
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
                <tr className="lists-row">
                    <td>
                        {this.props.item.name}
                    </td>
                    <td>
                        <span>
                            {this.props.item.type_name}
                        </span>
                        <span className={"pull-left edit-buttons" + (this.props.isRequestStatusInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.status.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.status.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr'>
                    <td>
                        <input type="text" className="form-control" value={this.props.requestStatusInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>
                    </td>
                    <td>
                        <div className='row'>
                            <div className='col-md-7'>
                                <Combo className="" items={this.props.requestStatusType} maxDisplayItems={5} itemIdProperty="id" 
                                       itemDisplayProperty='name' defaultValue={this.props.requestStatusInEditMode.type_name} onChange={this.comboChange.bind(this, 'type')}/>
                            </div>
                            <div className='col-md-5'>
                                <span className="pull-left edit-buttons">
                                    <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                    disabled={(this.props.dirty && this.props.requestStatusInEditMode.name.length >= 2 ? "" : "disabled")} 
                                    title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                    <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                    title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                                </span>
                            </div>
                        </div>
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
        if (this.props.isRequestStatusInEditMode && this.props.item.key === this.props.requestStatusKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        if (this.props.isRequestStatusInDnDSort == true) {
            /* DND MODE */
            return this.renderDnDMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        requestStatusType: state.system.lists.requestStatusType,
        isRequestStatusInEditMode: state.system.listsScreen.requestTab.isRequestStatusInEditMode,
        requestStatusKeyInSelectMode: state.system.listsScreen.requestTab.requestStatusKeyInSelectMode,
        requestStatusTextBeingEdited: state.system.listsScreen.requestTab.requestStatusTextBeingEdited,
        requestStatusInEditMode: state.system.listsScreen.requestTab.requestStatusInEditMode,
        isRequestStatusInDnDSort: state.system.listsScreen.requestTab.isRequestStatusInDnDSort,        
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}

//using flow to combing two HOC on our DndSortItem class
export default connect(mapStateToProps)(withRouter(flow(
        DragSource(SystemActions.DragTypes.REQUEST_STATUS_DND_ROW, ItemSource, dragCollect),
        DropTarget(SystemActions.DragTypes.REQUEST_STATUS_DND_ROW, ItemTarget, dropCollect)
        )(withRouter(ListsRequestStatusRow))));