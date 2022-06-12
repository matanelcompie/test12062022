import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';
import * as SystemActions from '../../actions/SystemActions';

//Source item events
const ItemSource = {
    beginDrag(props) {
        return {item: props.item}
    },
    endDrag(props, monitor) {
        if (monitor.didDrop())
            props.drop();
        else
            props.revertToOriginal();
    }
}

//collection for drag
function dragCollect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
}

//target item events
const ItemTarget = {

};

//collection for drop
function dropCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        dragItem: monitor.getItem()
    }
}

class DndSortItem extends React.Component {

    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
        //this.height = ref.offsetHeight;
        //console.log(this.height);
    }

    //drag over callback for calculating height ration of mouse over element and moving items accordingly
    onDragOver(e) {
        if (this.props.isOver) {
            var offsetTop = this.self.offsetTop;
            var height = this.self.offsetHeight;
            var mouseY = e.clientY;
            var over = (mouseY - offsetTop) / height;
            //console.log(this.self);
           //console.log(offsetTop + " ** " + height + " ** " + mouseY + " ** " + over);

            if (over <= 0.5)
                this.props.move(this.props.dragItem.item, this.props.item, true);
            else
                this.props.move(this.props.dragItem.item, this.props.item, false);
        }
    }

    setStyle() {
        this.style = {
            border: "1px solid black",
            padding: "3px",
            width: "200px",
            opacity: this.props.isDragging ? 0 : 1
        };
        this.dragHandleStyle = {
            cursor: "move"
        }
    }
    render() {
        this.setStyle();
        return this.props.connectDropTarget(this.props.connectDragPreview(
                <div ref={this.getRef.bind(this)} style={this.style} onDragOver={this.onDragOver.bind(this)}>
                    {this.props.connectDragSource(<i className="fa fa-drag-handle" style={this.dragHandleStyle}></i>)}
                    {this.props.item.city_name}
                </div>
                ))
    }
}

//using flow to combing two HOC on our DndSortItem class
export default flow(
        DragSource(SystemActions.DragTypes.EXAMPLE_DND_SORT, ItemSource, dragCollect),
        DropTarget(SystemActions.DragTypes.EXAMPLE_DND_SORT, ItemTarget, dropCollect)
        )(DndSortItem)