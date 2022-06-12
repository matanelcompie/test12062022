import React from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';
import { findDOMNode } from 'react-dom';


const portionSource = {
    beginDrag(props) {
        return {
            id: props.id,
            index: props.index,
        };
    },
    canDrag(props, monitor) {
        return props.isDraggable;
    },
};

const portionTarget = {
    hover(props, monitor, component) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

        // Get vertical middle
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
            return;
        }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
            return;
        }

        // Time to actually perform the action
        props.onReorder(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
    },
};

const DraggableListItem = ({isDragging, connectDragSource, connectDropTarget, connectDragPreview, onReorder, index, group, children, isDraggable}) => {
    return connectDragPreview(connectDropTarget(
        <div className={"draggable-list-item"
            + (isDragging ? ' draggable-list-item_dragging' : '')
            + (isDraggable ? ' draggable-list-item_draggable' : '')
        }>
            {connectDragSource(<div className="draggable-list-item__reorder-handle"><i className="fa fa-drag-handle"/></div>)}
            {children}
        </div>
    ));
};

DraggableListItem.propTypes = {
    onReorder: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    group: PropTypes.string.isRequired,
    isDraggable: PropTypes.bool,
};

DraggableListItem.defaultProps = {
    group: 'no-group',
    isDraggable: true,
};

export default flow(
    DragSource(props => props.group, portionSource, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
    })),
    DropTarget(props => props.group, portionTarget, connect => ({
        connectDropTarget: connect.dropTarget(),
    })),
)(DraggableListItem);
