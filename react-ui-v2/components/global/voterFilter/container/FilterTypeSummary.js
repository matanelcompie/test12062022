import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import FilterTypeSummaryHeader from '../display/filterSummary/FilterTypeSummaryHeader';
import FilterTypeSummaryItemList from '../display/filterSummary/FilterTypeSummaryItemList';

class FilterTypeSummary extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            isExpanded: false
        };

        this.onExpandFilterClick = this.onExpandFilterClick.bind(this);
    }

    onExpandFilterClick() {
        let isExpanded = this.state.isExpanded !== true;
        this.setState({isExpanded});
    }

    render() {
        const textValues = {
            1: 'סינון סטטוס תמיכה',
            2: 'סינון סטטוס הצבעה',
            3: 'סינון קבוצות ונציגויות ש"ס',
            4: 'סינון תפקידי יום בחירות ומאפייני משתמש',
            5: 'סינון מאפיינים מגזריים',
            6: 'סינון מאפיינים מכרטיס התושב',
            7: 'פרטי כתובת וקשר'
        };

        if(_.isEmpty(this.props.filterItems))
            return null;

        return(
            <div className={"filter-type-summary" + (this.state.isExpanded ? ' filter-type-summary_expanded' : '')}>
                <FilterTypeSummaryHeader
                    filterTitle={textValues[this.props.filterTypeKey]}
                    onExpandFilterClick={this.onExpandFilterClick}
                    isExpanded={this.state.isExpanded}
                />
                <FilterTypeSummaryItemList
                    filterDefinitions={this.props.filterDefinitions}
                    filterItems={this.props.filterItems}
                />
            </div>
        );
    }
}


FilterTypeSummary.propTypes = {
    filterDefinitions: PropTypes.object,
    filterTypeKey: PropTypes.string.isRequired,
    filterItems: PropTypes.object,
    voterFilterKey: PropTypes.string,
    moduleType: PropTypes.string.isRequired
};

function mapStateToProps(state, ownProps) {
    let voterFilter = state.global.voterFilter[ownProps.moduleType];
    let filterItems = {};
    // if(voterFilter.vf.filter_items && voterFilter.vf.filter_items[ownProps.filterTypeKey])
    //     filterItems = voterFilter.vf.filter_items[ownProps.filterTypeKey];
    // filterItems = _.isEmpty(filterItems) ? [] : filterItems;

    return {
        filterItems,
        voterFilterKey: ownProps.voterFilterKey
    };
}

function mapDispatchToProps(dispatch) {
    return {
       //
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterTypeSummary);
