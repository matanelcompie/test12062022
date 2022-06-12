import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { withRouter } from 'react-router';
import {bindActionCreators} from 'redux';

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import * as campaignActions from 'tm/actions/campaignActions';

import CampaignDetailsHeader from '../display/CampaignDetailsHeader';


class NewCampaignPage extends React.Component {
    constructor(props, context) {
        super(props, context);

        momentLocalizer(moment);

        this.state = {
            campaignEdits: {
                general_election: 1,
            }
        };

        this.onSaveClick = this.onSaveClick.bind(this);
        this.onChangeField = this.onChangeField.bind(this);
        this.onEditClick = this.onEditClick.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
     }

     componentWillMount() {
        if ( this.props.currentUser.first_name.length > 0 ) {
            if (!this.props.currentUser.admin && this.props.currentUser.permissions['tm.campaigns.add'] != true) {
               this.props.router.push('/unauthorized');
            }
        }
     }

     componentWillReceiveProps(nextProps) {
         let list1 = JSON.stringify(this.props.campaigns);
         let list2 = JSON.stringify(nextProps.campaigns);
         if(this.props.campaigns.length && list1 != list2) {
             let newCampaignKey = _.last(nextProps.campaigns).key;
             this.props.router.push(`telemarketing/campaigns/${newCampaignKey}`);
         }

        if ((nextProps.currentUser.first_name.length > 0)) {
            if (!nextProps.currentUser.admin && nextProps.currentUser.permissions['tm.campaigns.add'] != true) {
                this.props.router.push('/unauthorized');
            }
        }
     }

    onSaveClick(event) {
        // Do validation!
        event.preventDefault();

        this.props.campaignActions.addCampaign(this.state.campaignEdits);
    }

    onEditClick() {
        this.setState({isEditing: true});
    }

    onChangeField(name, value) {
        let campaignEdits = Object.assign({}, this.state.campaignEdits);
        campaignEdits[name] = value;
        this.setState({campaignEdits});
    }

    onCancelClick(event) {
        this.props.router.goBack();
    }

    render() {
        return (
            <div>
                <CampaignDetailsHeader
                    campaignEdits={this.state.campaignEdits}
                    isEditing={true}
                    onSaveClick={this.onSaveClick}
                    onChangeField={this.onChangeField}
                    onCancelClick={this.onCancelClick}
                    campaignElectionTypeOptions={this.props.campaignElectionTypeOptions}
                    currentUser={this.props.currentUser}
                    isPending={this.props.isPending}
                />
            </div>
        );
    }
}

NewCampaignPage.propTypes = {
    campaigns: PropTypes.array,
    isPending: PropTypes.bool
};

function mapStateToProps(state, ownProps) {
    let campaignElectionTypeOptions = state.tm.system.lists.campaignElectionType || {};

    return {
        campaigns: state.tm.campaign.list,
        campaignElectionTypeOptions,
        currentUser: state.system.currentUser,
        isPending: state.tm.campaign.pending ? true: false,
        currentUser: state.system.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        campaignActions: bindActionCreators(campaignActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCampaignPage);
