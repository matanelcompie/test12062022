import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as voterFilterActions from 'actions/VoterFilterActions';
import * as portionActions from 'tm/actions/portionActions';

import VoterFilterHeader from '../display/VoterFilterHeader';
import GeographicFilter from './GeographicFilter';
import AdditionalFilters from './AdditionalFilters';
import FilterSummary from './FilterSummary';

class VoterFilter extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.getCountVoters = this.getCountVoters.bind(this);
    }

    componentWillMount() {
        let voterFilter = _.cloneDeep(this.props.baseVoterFilter);
        if (this.props.newVoterFilterParentKey) {
            voterFilter.newVoterFilterParentKey = this.props.newVoterFilterParentKey;
            delete voterFilter.key;
            delete voterFilter.id;
            if (voterFilter.name)
                voterFilter.name = 'שיכפול- ' + voterFilter.name;
        }
        this.props.voterFilterActions.loadVoterFilter(voterFilter, this.props.moduleType);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.baseVoterFilter.key != nextProps.baseVoterFilter.key) {
            // let voterFilter = _.cloneDeep(nextProps.baseVoterFilter);
            this.props.voterFilterActions.loadVoterFilter(nextProps.baseVoterFilter, nextProps.moduleType);
        }
    }

    onSaveClick() {
        this.props.voterFilterActions.saveVoterFilter(this.props.moduleType, this.props.voterFilter.key,this.props.currentCampaignKey);
        this.props.closeModal();
        // dispatch({type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: true, errorMessage: errors[errorCode]});

    }

    onNameChange(event) {
        let name = event.target.value;
        this.props.voterFilterActions.onVoterFilterNameChange(name, this.props.moduleType, this.props.voterFilter.key);
    }

    getCountVoters() {
        let voterFilterKey = this.props.voterFilter.key;
        let calculate = this.props.isEditedPortionChanged;
        let affectedPortions = [];
        affectedPortions.push({ voterFilterKey, unique: false, calculate, moduleType: this.props.moduleType });
        this.props.portionActions.setUpdatedPortions(affectedPortions);
    }

    render() {
        let isEnableEditing = this.props.voterFilter.key ? true : false;
        return (
            <div className="voter-filter">
                <VoterFilterHeader
                    name={this.props.voterFilter.name}
                    id={this.props.voterFilter.id}
                    countVoters={this.props.voterFilter.voters_count}
                    onNameChange={this.onNameChange.bind(this)}
                    onRefreshCountVotersClick={this.getCountVoters}
                    isCalculatingCount={this.props.isCalculatingCount}
                />
                <div className="voter-filter__sections">
                    <GeographicFilter
                        moduleType={this.props.moduleType}
                        voterFilterKey={this.props.voterFilter.key}
                        oldGeographicItems={this.props.voterFilter.geo_items}
                        isEnableEditing={isEnableEditing}
                    />
                    <AdditionalFilters
                        moduleType={this.props.moduleType}
                        voterFilterKey={this.props.voterFilter.key}
                    />
                    {false && <FilterSummary
                        moduleType={this.props.moduleType}
                        voterFilterKey={this.props.voterFilter.key}
                    />}
                </div>
                <div className="voter-filter__footer">
                    <button className="btn btn-primary btn-sm voter-filter__save-btn"
                        onClick={this.onSaveClick} disabled={!this.props.voterFilter.name ? true : false}>  שמירה
                    </button>
                </div>
            </div>
        );
    }
}

VoterFilter.propTypes = {
    moduleType: PropTypes.string.isRequired,
    voterFilter: PropTypes.object,
    newVoterFilterParentKey: PropTypes.string
};

VoterFilter.defaultProps = {
    voterFilter: {}
};

function mapStateToProps(state, ownProps) {
    return {
        isEditedPortionChanged: state.tm.portion.isEditedPortionChanged,
        isCalculatingCount: state.tm.portion.isCalculatingCount,
        voterFilter: state.global.voterFilter[ownProps.moduleType].vf,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        voterFilterActions: bindActionCreators(voterFilterActions, dispatch),
        portionActions: bindActionCreators(portionActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(VoterFilter);
