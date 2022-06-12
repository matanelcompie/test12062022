import React from 'react';
import PropTypes from 'prop-types';
import SubGroupWithElectionCampaign from './SubGroupWithElectionCampaign';
import SubGroupWithTmCampaign from './SubGroupWithTmCampaign';
import SubGroup from './SubGroup';

class FilterGroupBody extends React.Component {
	
    render() {
		 
        return (
            <div className="filter-type-component user-definition" >
                {this.props.subGroups.map(subGroup => {
                    if (!!subGroup.per_election_campaign) {
                        return <SubGroupWithElectionCampaign
                            key={subGroup.key}
                            subGroup={subGroup}
                            filterItems={this.props.filterItems}
                            onChangeField={this.props.onChangeField}
                            moduleType={this.props.moduleType}
                        />
                    } 
					else if (!!subGroup.per_telemarketing_campaign) {
                        return <SubGroupWithTmCampaign
                            key={subGroup.key}
                            subGroup={subGroup}
                            filterItems={this.props.filterItems}
                            onChangeField={this.props.onChangeFieldTm}
                            moduleType={this.props.moduleType}
                        />
                    } 
					else {
                        return <SubGroup
                        key={subGroup.key}
                        subGroup={subGroup}
                        filterItems={this.props.filterItems}
                        onChangeField={this.props.onChangeField}
                        moduleType={this.props.moduleType}
                    />
                    }
                }
                )}
            </div>
        );
    }
};

FilterGroupBody.propTypes = {
    subGroups: PropTypes.array,
    onChangeField: PropTypes.func,
    filterItems: PropTypes.array
};

FilterGroupBody.defaultProps = {
    filterItems: [],
    subGroups: []
};

export default FilterGroupBody;
