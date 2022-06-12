import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { bindActionCreators } from 'redux';

import FilterGroup from 'components/global/voterFilter/container/FilterGroup';

import * as voterFilterActions from 'actions/VoterFilterActions';


class Captain50SearchFilters extends React.Component {
    constructor(props) {
        super(props);
    }

    getGroupItems(filterItems, subGroups) {
        let groupDefinitionIds = [];

		if(subGroups){
			subGroups.map(function (group) {
				group.definitions.map(function (definition) {
					groupDefinitionIds.push(definition.id);
				});
			});
		}

        let groupItems = filterItems.filter(function (item) {
            return (groupDefinitionIds.indexOf(item.voter_filter_definition_id) > -1);
        });

        return groupItems;
    }

    filterGroupClick(fieldName){

    }

    render() {
        if (!this.props.modules.captain50_activist) { // If filter modules not loaded yet
            return (<div></div>);
        }
        return (
            <div className={"row containerStrip dtlsBox" + (this.props.searchCollapse ? "" : " hidden")} style={{marginTop:'-15px'}}>
                <div id="additional-filters" >
                    <div className="row">
                        <div className="col-lg-6">
                            <FilterGroup
                                onClick={this.filterGroupClick.bind(this , 'supportStatus')}
                                key={"filter" + 0}
                                moduleType={'captain50_activist'}
                                group={this.props.modules.captain50_activist[0]}
                                filterItems={this.getGroupItems(this.props.filterItems, this.props.modules.captain50_activist[0].sub_groups)}
                                filterItemsOld={this.getGroupItems(this.props.filterItemsOld, this.props.modules.captain50_activist[0].sub_groups)}
                            />
                        </div>

                        <div className="col-lg-6">
                            <FilterGroup
                                onClick={this.filterGroupClick.bind(this , 'votingStatus')}
                                key={"filter" + 1}
                                moduleType={'captain50_activist'}
                                group={this.props.modules.captain50_activist[1]}
                                filterItems={this.getGroupItems(this.props.filterItems, this.props.modules.captain50_activist[1].sub_groups)}
                                filterItemsOld={this.getGroupItems(this.props.filterItemsOld, this.props.modules.captain50_activist[1].sub_groups)}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-6">
                            <FilterGroup
                                onClick={this.filterGroupClick.bind(this , 'groupsInShas')}
                                key={"filter" + 2}
                                moduleType={'captain50_activist'}
                                group={this.props.modules.captain50_activist[2]}
                                filterItems={this.getGroupItems(this.props.filterItems, this.props.modules.captain50_activist[2].sub_groups)}
                                filterItemsOld={this.getGroupItems(this.props.filterItemsOld, this.props.modules.captain50_activist[2].sub_groups)}
                            />
                        </div>
						
						<div className="col-lg-6">
                            <FilterGroup
                                onClick={this.filterGroupClick.bind(this , 'groupsInShas')}
                                key={"filter" + 3}
                                moduleType={'captain50_activist'}
                                group={this.props.modules.captain50_activist[3]}
                                filterItems={this.getGroupItems(this.props.filterItems, this.props.modules.captain50_activist[3].sub_groups)}
                                filterItemsOld={this.getGroupItems(this.props.filterItemsOld, this.props.modules.captain50_activist[3].sub_groups)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        voterFilter: state.global.voterFilter.captain50_activist.vf,
        filterItems: state.global.voterFilter.captain50_activist.vf.filter_items,
        filterItemsOld: state.global.voterFilter.captain50_activist.old.filter_items,

        modules: state.global.voterFilter.modules,

        currentUser: state.system.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        voterFilterActions: bindActionCreators(voterFilterActions, dispatch)
    };
}


export default connect(mapStateToProps, mapDispatchToProps) (withRouter(Captain50SearchFilters));