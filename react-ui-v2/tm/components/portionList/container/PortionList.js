import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import * as portionActions from 'tm/actions/portionActions';
import * as systemActions from 'tm/actions/systemActions';

import PortionListHeader from '../display/PortionListHeader';
import PortionListItem from '../display/PortionListItem';
import PortionListTotal from '../display/PortionListTotal';

import DraggableListItem from 'tm/components/common/DraggableListItem';

class PortionList extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onActivePortionClick = this.onActivePortionClick.bind(this);
        this.onDeletePortionClick = this.onDeletePortionClick.bind(this);
        this.onPortionReorder = this.onPortionReorder.bind(this);
    }
    /**
     * @method onActivePortionClick
     * when active status changed for portion: recalculate the 
     * unique voters count for the portion and all the portions after it.
     * @param {string} portionKey -portion key
     * @param {bool} active -active or not
     */
    onActivePortionClick(portionKey, active) {
        let affectedPortions = [];
        let currentPortion = null;
        let isAffected = false;

        this.props.portions.map(portion => {
            if(portion.key == portionKey){
                isAffected = true;
                currentPortion = {...portion};
            }
            if (isAffected) {
                affectedPortions.push({ voterFilterKey: portion.key, unique: true, calculate: true, moduleType: "portion" });
            }
        });
        if(currentPortion){
            currentPortion.active = active;
            this.props.systemActions.showConfirmMessage('portionActions', 'updateActivePortion', [currentPortion, affectedPortions, active]);
        }
    }

    onDeletePortionClick(key) {
        let currentCampaignKey = this.props.currentCampaignKey;
        let data = { key, currentCampaignKey };

        //when delete portion: recalculate the unique voters count for all the portions after it.
        let affectedPortions = [];
        let isAffected = false;

        this.props.portions.map(portion => {
            if (isAffected) {
                affectedPortions.push({ voterFilterKey: portion.key, unique: true, calculate: true, moduleType: "portion" });
            }

            if (portion.key == key) {
                isAffected = true;
            }
        });
        this.props.systemActions.showConfirmMessage('portionActions', 'deletePortion', [data, affectedPortions]);
    }

    onPortionReorder(dragIndex, hoverIndex) {
        let editedPortions = _.cloneDeep(this.props.editedPortions);
        const dragPortion = editedPortions[dragIndex];

        editedPortions.splice(dragIndex, 1);
        editedPortions.splice(hoverIndex, 0, dragPortion);

        this.props.portionActions.onPortionReorder(editedPortions);
    }

    render() {
        let portions = this.props.isEditOrderMode ? this.props.editedPortions : this.props.portions;
        var reachedCurrentPortionId = false;

        return (
            <div className={"portion-list" + (this.props.isEditOrderMode ? ' portion-list_ordering' : '')}>
                <PortionListHeader />
                {portions.map((portion, index) => {
                    //prevent DnD for portions already finished (voters already called) in the portion.
                    let isPotionAlreadyFinishCalling = false;
                    if (this.props.currentPortionId != null) {
                        isPotionAlreadyFinishCalling = !reachedCurrentPortionId;
                        if (portion.id == this.props.currentPortionId) {
                            reachedCurrentPortionId = true;
                        }
                    }

                    let isDraggable = this.props.isEditOrderMode && !isPotionAlreadyFinishCalling;
                    return <DraggableListItem key={portion.key} onReorder={this.onPortionReorder} index={index} isDraggable={isDraggable} group={"portion" + (isDraggable ? '' : '-no')}>
                        <PortionListItem
                            portion={portion}
                            onOpenPortionModalClick={this.props.onOpenPortionModalClick}
                            onActivePortionClick={this.onActivePortionClick}
                            onDeletePortionClick={this.onDeletePortionClick}
                            isPotionAlreadyFinishCalling={isPotionAlreadyFinishCalling}
                            currentPortionId={this.props.currentPortionId}
                            potionInCalculateMode={this.props.portionsInCalculatingMode[portion.key]}
                            allowDelete={(this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaigns.portions.delete'] == true)}
                            allowEdit={(this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaigns.portions.edit'] == true)}
                        />
                    </DraggableListItem>
                })}
                <PortionListTotal portions={portions} />
            </div>
        );
    }
}

PortionList.propTypes = {
    portions: PropTypes.array,
    editedPortions: PropTypes.array,
    isEditOrderMode: PropTypes.bool,
    onOpenPortionModalClick: PropTypes.func,
};

PortionList.defaultProps = {
    portions: [],
    currentCampaignKey: '',
    currentPortionId: null
};

function mapStateToProps(state, ownProps) {
    return {
        portions: state.tm.portion.list,
        portionsInCalculatingMode: state.tm.portion.portionsInCalculatingMode,
        editedPortions: state.tm.portion.editedPortions,
        isEditOrderMode: state.tm.portion.isEditPortionsOrderMode,
        currentCampaignKey: state.tm.campaign.currentCampaignKey,
        currentUser: state.system.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        portionActions: bindActionCreators(portionActions, dispatch),
        systemActions: bindActionCreators(systemActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(PortionList));
