import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';
import Combo from '../../../../global/Combo';

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

class RequestTopicRow extends React.Component {
    constructor(props) {
        super(props);
        this.initVariables();
    }

    componentDidMount(){
        this.state = {
            newUserHandlerId: null
        }
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

    deleteRow(e) {
        this.props.updateScrollPosition();
        const requestTopickey = this.props.item.key;
        const subTopicsParentKey = this.isSubTopicItem ? this.props.subTopicsParentKey : null;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_DELETE_MODE_UPDATED, requestTopickey, subTopicsParentKey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_TOPIC_MODAL_DIALOG_DISPLAY});
        e.stopPropagation();
    }

    editRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const requestTopickey = this.props.item.key;
        const requestTopic = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_EDIT_MODE_UPDATED, requestTopickey, requestTopic});

    }

    comboChange(columnName, el) {
        //store the name

        let value = el.target.value;
        let key = columnName + '_name';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_EDIT_VALUE_CHANGED, key, value});

        //store the key
        let id = el.target.selectedItem ? el.target.selectedItem.id : null;
        let idKey = columnName + '_id';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_EDIT_VALUE_CHANGED, key: idKey, value: id});
        this.props.dispatch({type: SystemActions.ActionTypes.SET_DIRTY, target: 'requestTopic'});

        if(columnName == 'user_handler'){
            this.setState({newUserHandlerId: id})
        }
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type: SystemActions.ActionTypes.SET_DIRTY, target: 'requestTopic'});
    }

    cancelEditMode() {
        this.setState({newUserHandlerId: null})
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'requestTopic'});
    }

    saveEdit() {
        this.props.onSaveTopicData(this.state.newUserHandlerId != null, [this.props.requestTopicKeyInSelectMode]);
        this.setState({newUserHandlerId: null})
    }

    showNameErrorMessage() {
        if (this.props.requestTopicInEditedMode.name.length <= 2) {
            return <span className="help-block not-visible">{this.textValues.nameIsSmall}</span>
        }
    }

    openRequestSubTopics() {
        if (!this.isSubTopicItem && !this.props.isRequestTopicInEditMode && !this.props.isSubTopicsInDnDSort) {
            const key = this.props.item.key;
            const id = this.props.item.id;
            const name = this.props.item.name;
            SystemActions.loadRequestTopics(store.dispatch, key);
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.LOAD_SUB_TOPICS, id, key, name});
        }

    }

    highlight() {
        if (this.props.isSubTopicsDisplayed == true && (this.props.item.id == this.props.requestTopicInEditedMode.parent_id)) {
            return 'lists-row success';
        }
        return 'lists-row';
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

    componentWillMount() {
        this.isSubTopicItem =  (this.props.item.parent_id == 0) ? false : true;
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr'>
                    <td>
                        <div className={"form-group" + (this.props.requestTopicInEditedMode.name.length >= 2 ? '' : ' has-error')}>
                            <input type="text" className="form-control" value={this.props.requestTopicInEditedMode.name} onChange={this.updateRowText.bind(this, 'name')}/>
                            {this.showNameErrorMessage.bind(this)}
                        </div>
                    </td>
                    <td>
                        <div className="checkbox">
                            <label>
                                <input type="checkbox" value={this.props.requestTopicInEditedMode.active}
                                       onChange={this.updateRowText.bind(this, 'active')}
                                       checked={this.props.requestTopicInEditedMode.active == 1 ? 'checked' : ''}/>
                                {this.textValues.active + '?'}
                            </label>
                        </div>
                    </td>
                    {/* Select team handler */}

                    { !this.isSubTopicItem && <td> 
                        <Combo items={this.props.teams} maxDisplayItems={5} itemIdProperty="key" 
                        defaultValue={(null == this.props.requestTopicInEditedMode.team_handler_name ? '' : this.props.requestTopicInEditedMode.team_handler_name)}
                        itemDisplayProperty='name' onChange={this.comboChange.bind(this, 'team_handler')}/>
                    </td> }
                    {/* Select user handler */}

                    { this.isSubTopicItem && <td> 
                        <Combo items={this.props.requestModuleUsers} maxDisplayItems={5} itemIdProperty="key" 
                        defaultValue={(null == this.props.requestTopicInEditedMode.user_handler_name ? '' : this.props.requestTopicInEditedMode.user_handler_name)}
                        itemDisplayProperty='name' onChange={this.comboChange.bind(this, 'user_handler')}/>
                    </td>}

                    { this.isSubTopicItem && <td> 
                        <div className="form-group">
                            <input type="text" className="form-control" onChange={this.updateRowText.bind(this, 'target_close_days')} 
                                   value={(null == this.props.requestTopicInEditedMode.target_close_days ? '' : this.props.requestTopicInEditedMode.target_close_days)}/>
                        </div>
                    </td> }
                    { this.isSubTopicItem && <td> 
                    <Combo items={this.props.requestStatus} maxDisplayItems={5} itemIdProperty="key" 
                       itemDisplayProperty='name' defaultValue={(null == this.props.requestTopicInEditedMode.request_status_name ? '' : this.props.requestTopicInEditedMode.request_status_name)} onChange={this.comboChange.bind(this, 'default_request_status')}/>
                    </td> }
                <td>
                    <div className="row">
                        <div className="col-md-4">
                            {this.props.item.topic_order}
                        </div>
                        <div className="col-md-8">
                            <span className="edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" disabled={(this.props.dirty && this.props.requestTopicInEditedMode.name.length >= 2 ? "" : "disabled")} 
                                        onClick={this.saveEdit.bind(this)} title={this.textValues.editTitle}><i className="fa fa-floppy-o"></i></button>
                                &nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} title={this.textValues.deleteTitle}>
                                    <i className="fa fa-times"></i></button>
                            </span>
                        </div>
                    </div>
                </td>
                </tr>
                );
    }

    renderDisplayMode() {
        return (
                <tr className={this.highlight()} style={this.props.style} onClick={this.openRequestSubTopics.bind(this)}>
                    <td>{this.props.item.name}</td>
                    <td>{(this.props.item.active == "1") ? this.textValues.active : this.textValues.notActive}</td>
                   { !this.isSubTopicItem && <td>{this.props.item.team_handler_name}</td>}

                   { this.isSubTopicItem && <td>{this.props.item.user_handler_name}</td>}
                   { this.isSubTopicItem && <td>{this.props.item.target_close_days}</td>}
                   { this.isSubTopicItem && <td>{this.props.item.request_status_name}</td>}

                    <td>{this.props.item.topic_order}
                        <span className={"pull-left edit-buttons" + ((this.props.isRequestTopicInEditMode || this.props.isSubTopicsInDnDSort) ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.topics.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.saveTitle}>
                                <i className="fa fa-pencil-square-o"></i>
                            </button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.topics.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.cancelTitle}>
                                <i className="fa fa-trash-o"></i>
                            </button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderDnDMode() {
        return (
                this.props.connectDropTarget(this.props.connectDragPreview(
                        <tr ref={this.getRef.bind(this)} className={this.highlight()} style={this.draggingStyle} onDragOver={this.onDragOver.bind(this)}>
                            <td>
                                {this.props.connectDragSource(<i className="fa fa-drag-handle" style={this.dragHandleStyle}></i>)}
                                {this.props.item.name}
                            </td>
                            <td>{(this.props.item.active == "1") ? this.textValues.active : this.textValues.notActive}</td>
                            <td className={(this.isSubTopicItem ? '' : 'hidden')}>{this.props.item.target_close_days}</td>
                            <td className={(this.isSubTopicItem ? '' : 'hidden')}>{this.props.item.request_status_name}</td>
                            <td>{this.props.item.topic_order}</td>
                        </tr>
                        ))
                );
    }

    render() {
 
        if (this.props.isRequestTopicInEditMode && this.props.item.key == this.props.requestTopicKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }

        if ((!this.isSubTopicItem && this.props.isTopicsInDnDSort == true) || (this.isSubTopicItem && this.props.isSubTopicsInDnDSort == true)) {
            /* DND MODE */
            return this.renderDnDMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        requestStatus: state.system.lists.requestStatus,
        isRequestTopicInEditMode: state.system.listsScreen.requestTab.isRequestTopicInEditMode,
        requestTopicKeyInSelectMode: state.system.listsScreen.requestTab.requestTopicKeyInSelectMode,
        requestTopicInEditedMode: state.system.listsScreen.requestTab.requestTopicInEditedMode,
        isSubTopicsDisplayed: state.system.listsScreen.requestTab.isSubTopicsDisplayed,
        subTopicsParentKey: state.system.listsScreen.requestTab.subTopicsParentKey,
        isTopicsInDnDSort: state.system.listsScreen.requestTab.isTopicsInDnDSort,
        isSubTopicsInDnDSort: state.system.listsScreen.requestTab.isSubTopicsInDnDSort,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}

//using flow to combing two HOC on our DndSortItem class
export default connect(mapStateToProps)(withRouter(flow(
        DragSource('TOPICS_DND_ROW', ItemSource, dragCollect),
        DropTarget('TOPICS_DND_ROW', ItemTarget, dropCollect)
        )(RequestTopicRow)));
