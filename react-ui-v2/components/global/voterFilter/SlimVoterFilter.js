import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as voterFilterActions from 'actions/VoterFilterActions';
import GeographicFilter from 'components/global/voterFilter/container/GeographicFilter';
import AdditionalFilters from 'components/global/voterFilter/container/AdditionalFilters';

class SlimVoterFilter extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    componentWillMount() {
        let voterFilter = _.cloneDeep(this.props.voterFilter);
        this.props.voterFilterActions.loadElectionCampaigns();
        this.props.voterFilterActions.loadSlimTmCampaigns();
		
        this.props.voterFilterActions.loadCurrentElectionCampaign();

        this.props.voterFilterActions.loadVoterFilter(voterFilter, this.props.moduleType);
    }

    render() {
        return (
            <div>
                {(this.props.moduleType == 'general_report') &&
                    <div className="pull-left reset-btns" style={{ paddingLeft: '15px', position: 'relative', bottom: '30px', height: '0' }}>
                    <button onClick={this.props.expandShrinkAllGroups.bind(this , true)} type="button" className="btn btn-success">פתח הכל</button>
                    <button onClick={this.props.expandShrinkAllGroups.bind(this , false)} type="button" className="btn btn-warning">סגור הכל</button>
                    <button onClick={this.props.resetReport.bind(this)} type="button" className="btn btn-danger">נקה הכל</button>
                </div>
                }
                <div className="voter-filter__sections">

                    <GeographicFilter
                        moduleType={this.props.moduleType}
                        voterFilterKey={this.props.voterFilter.key}
                        oldGeographicItems={this.props.voterFilter.geo_items}
                        isEnableEditing={false}
                    />
                    <AdditionalFilters
                        moduleType={this.props.moduleType}
                        voterFilterKey={this.props.voterFilter.key}
                        resetReport={this.props.resetReport}
                        expandShrinkAllGroups={this.props.expandShrinkAllGroups}
                    />
                </div>
            </div>
        );
    }
}

SlimVoterFilter.propTypes = {
    moduleType: PropTypes.string.isRequired,
    voterFilter: PropTypes.object,
    newVoterFilterParentKey: PropTypes.string
};

SlimVoterFilter.defaultProps = {
    voterFilter: {},
    isCalculatingCount:false
};

function mapStateToProps(state, ownProps) {
    let voterFilter = state.global.voterFilter;

    return {
        filterGroups: voterFilter.modules[ownProps.moduleType]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        voterFilterActions: bindActionCreators(voterFilterActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SlimVoterFilter);
