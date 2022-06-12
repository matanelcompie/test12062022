import React from 'react';
import { connect } from 'react-redux';
// import { withRouter } from 'react-router';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';

import * as ElectionsActions from 'actions/ElectionsActions';
import Combo from 'components/global/Combo';

//Source item events
const ItemSource = {
    beginDrag(props) {
        return { option: props.option };
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

class DisplayColumn extends React.Component {
    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.labels = {
            sortAsc: 'סדר עולה',
            sortDesc: 'סדר יורד',
            colse: 'סגור'
        };

        this.draggingStyle = {
            opacity: this.props.isDragging ? 0.5 : 1
        };
    }

    removeOptionFromDisplayOptions(option) {
        if (!option.perElectionCampaign) {
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS,
                                  optionName: option.name, operation: 'delete' });
        } else {
            let optionData = {
                name: option.name,
                label: option.label,
                sortNumber: '',
                sortDirection: '',
                displayOrder: 0,
                electionCampaign: option.electionCampaign,
                perElectionCampaign: option.perElectionCampaign
            };

            /**
             * The reduce expects to get option name such as
             * previous_support_status_tm.
             * So the option name such as: previous_support_status_tm_{electionCampaignId}
             * is split.
             */
            let optionNameArr = option.name.split('_');
            optionNameArr = optionNameArr.splice(optionNameArr, optionNameArr.length - 1, 1);
            let optionName = optionNameArr.join('_');

            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS_WITH_ELECTION_CAMPAIGN,
                                  optionName, optionData, operation: 'delete' });
        }
    }

    setOptionSortDirection(optionName, sortDirection) {
        let option = this.props.selectedDetailColumns[optionName];
        let sortNumber = (sortDirection == '') ? '' : option.sortNumber;
        let optionData = {};

        if (option.sortNumber != '') {
            let optionData = { ...option, sortDirection, sortNumber };
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS, optionName, optionData, operation: 'edit' });
        }
    }

    setOptionSortNumber(optionName, e) {
        let sortNumber = e.target.selectedItem ? e.target.selectedItem.value : '';
        let optionData = { ...this.props.selectedDetailColumns[optionName], sortNumber, sortDirection:((sortNumber == '')? '':'asc')};
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS, optionName, optionData, operation: 'edit' });
    }

    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    //drag over callback for calculating height ration of mouse over element and moving items accordingly
    onDragOver(e) {
        if (this.props.isOver && (this.props.dragItem.option.name != this.props.option.name)) {
            let offsetTop = this.self.getBoundingClientRect().top;
            let height = this.self.offsetHeight;
            let mouseY = e.clientY;
            let over = (mouseY - offsetTop) / height;
            let isMoveOver = (over <= 0.5) ? true : false;
            this.props.changeColumnsOrder(this.props.dragItem.option, this.props.option, isMoveOver);
        }
    }

    getScrollAmount() {
        if (typeof window.pageYOffset != "undefined") {
            var scroll = window.pageYOffset;
        }
        else if (typeof document.documentElement.scrollTop != "undefined") {
            var scroll = document.documentElement.scrollTop;
        }
        else {
            var scroll = document.body.scrollTop;
        }

        return scroll;
    };

    render() {
        let { option, sortOptionsItems } = this.props;
        return (
            this.props.connectDropTarget(this.props.connectDragPreview(
                this.props.connectDragSource(
                    <li ref={this.getRef.bind(this)} style={this.draggingStyle} onDragOver={this.onDragOver.bind(this)}
                        className="item-line flexed-center">
                        <a title={this.labels.colse} className="close-item cursor-pointer" onClick={this.removeOptionFromDisplayOptions.bind(this, option)}></a>
                        <div className="box-info flexed flexed-space-between">
                            <span className="info">{!this.props.isOver && option.label}</span>
                            <Combo className="select-basic" items={sortOptionsItems} maxDisplayItems={10}
                                itemIdProperty="key" itemDisplayProperty='value' value={option.sortNumber}
                                onChange={this.setOptionSortNumber.bind(this, option.name)} />
                        </div>
                        <div className="filter">
                            <a title={this.labels.sortAsc} onClick={this.setOptionSortDirection.bind(this, option.name, (option.sortDirection == 'asc' ? '' : 'asc'))}
                                className={"cursor-pointer icon-sort " + (option.sortDirection == 'asc' ? 'order-on' : 'order-off')}></a>
                            <a title={this.labels.sortDesc} onClick={this.setOptionSortDirection.bind(this, option.name, (option.sortDirection == 'desc' ? '' : 'desc'))}
                                className={"cursor-pointer icon-sort descending " + (option.sortDirection == 'desc' ? 'order-on' : 'order-off')}></a>
                        </div>
                    </li>
                )))
        );
    }
}

function mapStateToProps(state) {
    return {
    };
}

//using flow to combing two HOC on our DndSortItem class
export default connect(mapStateToProps)(flow(
    DragSource('DISPLAY_COLUMN', ItemSource, dragCollect),
    DropTarget('DISPLAY_COLUMN', ItemTarget, dropCollect)
)(DisplayColumn))