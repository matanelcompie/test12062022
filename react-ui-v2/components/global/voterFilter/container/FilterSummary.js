import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import FilterSummaryHeader from '../display/filterSummary/FilterSummaryHeader';
import FilterTypeSummary from './FilterTypeSummary';


class FilterSummary extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            isExpanded: false
        };

        this.onExpandFilterClick = this.onExpandFilterClick.bind(this);
    }

    onExpandFilterClick() {
        let isExpanded = this.state.isExpanded == true? false : true;
        this.setState({isExpanded});
    }

    render() {
       return (
            <div className="voter-filter-section filter-summary">
                <div className={"filter-type filter-type_full-width" + (this.state.isExpanded ? ' filter-type_expanded' : '')}>
                    <FilterSummaryHeader onExpandFilterClick={this.onExpandFilterClick} isExpanded={this.state.isExpanded} />
                    {this.state.isExpanded &&
                        <div className="filter-type-component filter-summary__component">
                            {this.props.filterDefinitions.map(group =>
                                <FilterTypeSummary
                                    key={group.key}
                                    filterTypeKey={group.key}
                                    moduleType={this.props.moduleType}
                                    voterFilterKey={this.props.voterFilterKey}
                                    filterDefinitions={group}
                                />
                            )}
                        </div>
                    }
                </div>
            </div>
        );
    }
}

FilterSummary.propTypes = {
    moduleType: PropTypes.string.isRequired,
    filterDefinitions: PropTypes.array,
    filterKey: PropTypes.string
};

FilterSummary.defaultProps = {
    filterDefinitions: []
};

function mapStateToProps(state, ownProps) {
    return {
        filterDefinitions: state.global.voterFilter.modules[ownProps.moduleType]
    };
}

export default connect(mapStateToProps)(FilterSummary);
