import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';

import * as voterFilterActions from 'actions/VoterFilterActions';
import * as systemActions from 'tm/actions/systemActions';
import * as portionActions from 'tm/actions/portionActions';

import GeographicHeader from '../display/GeographicFilter/GeographicHeader';
import GeographicItem from './GeographicItem';


class GeographicFilter extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onChangeItem = this.onChangeItem.bind(this);
        this.onResetItem = this.onResetItem.bind(this);
        this.onSaveItem = this.onSaveItem.bind(this);
        this.onActivateItem = this.onActivateItem.bind(this);
        this.onAddItem = this.onAddItem.bind(this);
        this.onDeleteItem = this.onDeleteItem.bind(this);
    }

    componentWillMount() {
        let screenPermission = null;
        switch (this.props.moduleType) {
            case 'general_report':
                screenPermission = 'elections.reports.general';
                break
            case 'portion':
                screenPermission = 'tm.campaign.portions';
                break
        }
        this.props.voterFilterActions.getGeoOptionsInit(screenPermission);
    }

    componentDidUpdate() {
        if ((!this.props.geographicItems.length) && (this.props.moduleType == 'general_report')) {
            this.onAddItem();
        }
    }

    onChangeItem(newItemData) {
        this.props.portionActions.setVoterFilterChangeStatus(true);
        this.props.voterFilterActions.changeGeoItem(newItemData, this.props.moduleType, this.props.voterFilterKey);
    }

    onResetItem(item) {
        let oldItem;
        if (item.isNew) {
            oldItem = { ...item, entity_type: 'area', entity_id: 0, active: true };
        } else {
            oldItem = _.find(this.props.oldGeographicItems, ['key', item.key]);
        }
        this.props.portionActions.setVoterFilterChangeStatus(false);
        this.onChangeItem(oldItem);
    }

    onSaveItem(item) {
        if (item.isNew) {
            this.props.voterFilterActions.createGeoItem(item, this.props.moduleType, this.props.voterFilterKey);
        } else {
            this.props.voterFilterActions.updateGeoItem(item, this.props.moduleType, this.props.voterFilterKey);
        }
        this.props.portionActions.setVoterFilterChangeStatus(true);
    }

    onActivateItem(item) {
        item = { ...item, active: !item.active };
        if (!this.isEnableEditingMode) {
            this.props.voterFilterActions.updateGeoItemInNoEditingMode(item, this.props.moduleType, this.props.voterFilterKey)
            return;
        }
        this.props.voterFilterActions.updateGeoItem(item, this.props.moduleType, this.props.voterFilterKey);
        this.props.portionActions.setVoterFilterChangeStatus(true);
    }

    onAddItem() {
        let isThereEmptyRow = false;
        this.props.geographicItems.map(item => {
            if (item.entity_id == 0) {
                isThereEmptyRow = true;
            }
        });

        if (!isThereEmptyRow) {
            let tempId = (this.props.geographicItems.length > 0) ? _.last(this.props.geographicItems).id + 1 : 0;
            this.props.voterFilterActions.addGeoItem(tempId, this.props.moduleType, this.props.voterFilterKey);
            this.props.portionActions.setVoterFilterChangeStatus(true);
        }
    }

    onDeleteItem(item) {
        if (this.props.geographicItems.length > 1) {// if this is the only item, reset it, else delete it
            if (!this.isEnableEditingMode) {
                this.props.voterFilterActions.deleteGeoItemInNoEditingMode(item.key, this.props.moduleType, this.props.voterFilterKey);
                return;
            }
            if (item.isNew) {
                this.props.voterFilterActions.deleteGeoItem(item, this.props.moduleType, this.props.voterFilterKey);
            } else {
                this.props.portionActions.setVoterFilterChangeStatus(true);
                this.props.systemActions.showConfirmMessage(
                    'voterFilterActions',
                    'deleteGeoItem',
                    [item, this.props.moduleType, this.props.voterFilterKey]
                );
            }
        } else {
            this.onResetItem(item);
        }
    }


    isItemEdited(item) {
        let oldItem = _.find(this.props.oldGeographicItems, ['key', item.key]);
        let newItem = _.find(this.props.geographicItems, ['key', item.key]);
        return !_.isEqual(oldItem, newItem);
    }

    render() {
		 
        this.isEnableEditingMode = this.props.hasOwnProperty('isEnableEditing') ? this.props.isEnableEditing : true;
        return (
            <div className="voter-filter-section geographic-filter">
                <GeographicHeader onAddClick={this.onAddItem} />
                <div className="voter-filter-section__filters">
                    {this.props.geographicItems.map((item, index) =>
                        <GeographicItem
                            key={item.key}
                            filterIndex={index}
                            item={item}
                            onChangeItem={this.onChangeItem}
                            onResetItem={this.onResetItem}
                            onSaveItem={this.onSaveItem}
                            onActivateItem={this.onActivateItem}
                            onDeleteItem={this.onDeleteItem}
                            isEdited={this.isItemEdited(item)}
                            isSaveButton={!!this.props.voterFilterKey}
                            isEnableEditing={this.isEnableEditingMode}
                        />
                    )}
                </div>
            </div>
        );
    }
}

GeographicFilter.propTypes = {
    moduleType: PropTypes.string.isRequired,
    voterFilterKey: PropTypes.string,
    geographicItems: PropTypes.array,
    oldGeographicItems: PropTypes.array,
};

GeographicFilter.defaultProps = {
    geographicItems: [],
    oldGeographicItems: [],
}

function mapStateToProps(state, ownProps) {
    let voterFilter = state.global.voterFilter[ownProps.moduleType];
    return {
        geographicItems: voterFilter.vf ? voterFilter.vf.geo_items : [],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        voterFilterActions: bindActionCreators(voterFilterActions, dispatch),
        systemActions: bindActionCreators(systemActions, dispatch),
        portionActions: bindActionCreators(portionActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GeographicFilter);
