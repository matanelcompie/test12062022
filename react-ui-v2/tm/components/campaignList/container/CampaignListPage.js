import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import * as SystemActions from 'actions/SystemActions';

import * as campaignActions from 'tm/actions/campaignActions';

import { arraySort } from 'libs/globalFunctions';


import Title from '../display/Title';
import Filters from '../display/Filters';
import Buttons from '../display/Buttons';
import CampaignTable from '../display/CampaignTable';



class CampaignListPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    momentLocalizer(moment);

    this.state = {
      expandedRowKey: null,
      expandedManagementKey: null,
      isSearchStatusOpen: false,
      searchText: '',
      fromDate: null,
      toDate: null,
      sortColumn: null,
      sortDirection: 'asc',
      searchStatusesChecked: []
    };
    this.onExpandManagementClick = this.onExpandManagementClick.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onSortClick = this.onSortClick.bind(this);
    this.onSearchStatusClick = this.onSearchStatusClick.bind(this);
    this.onSearchStatusChange = this.onSearchStatusChange.bind(this);
  }

  initSearch() {
    let campaigns = this.props.campaigns.filter(campaign => {
      return campaign.name.includes(this.state.searchText);
    });

    if (this.state.fromDate) {
      campaigns = campaigns.filter(campaign => {
        return moment(campaign.updated_at).isSameOrAfter(moment(this.state.fromDate));
      });
    }

    if (this.state.toDate) {
      campaigns = campaigns.filter(campaign => {
        return moment(campaign.updated_at).isSameOrBefore(moment(this.state.toDate));
      });
    }

    if (this.state.searchStatusesChecked.length > 0) {
      campaigns = campaigns.filter(campaign => {
        return this.state.searchStatusesChecked.indexOf(campaign.status) > -1;
      });
    }

    let campaignsSorted = campaigns.sort(arraySort(this.state.sortDirection, this.state.sortColumn));

    return campaignsSorted;
  }

  componentWillMount() {
    this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'רשימת קמפיינים' });
    this.props.campaignActions.getAllCampaigns();

    if (this.props.currentUser.first_name.length > 0) {
      if (!this.props.currentUser.admin && this.props.currentUser.permissions['tm.campaigns'] != true) {
        this.props.router.push('/unauthorized');
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.currentUser.first_name.length > 0)) {
      if (!nextProps.currentUser.admin && nextProps.currentUser.permissions['tm.campaigns'] != true) {
        this.props.router.push('/unauthorized');
      }
    }
    if (!_.isEqual(nextProps.campaigns, this.props.campaigns)) {
      this.onSortClick('scheduled_start_date');
      this.setState({ 'sortDirection': 'desc' })

    }
  }

  onFilterChange(name, value) {
    let filter = { [name]: value };
    this.setState(filter);
  }

  onExpandRowClick(key, id) {
    let expandedRowKey = this.state.expandedRowKey == key ? null : key;
    if (expandedRowKey) {
      this.props.campaignActions.loadSingleCampaignUserStatistic(id);
    }
    this.setState({ expandedRowKey });
  }

  onExpandManagementClick(key) {
    let expandedManagementKey = this.state.expandedManagementKey == key ? null : key;

    this.setState({ expandedManagementKey });
  }

  onSortClick(key) {
    let sortDirection = (this.state.sortColumn == key && this.state.sortDirection == 'asc') ? 'desc' : 'asc';
    let sortColumn = key;
    this.setState({ sortColumn, sortDirection });
  }

  onSearchStatusClick() {
    let isSearchStatusOpen = !this.state.isSearchStatusOpen;
    this.setState({ isSearchStatusOpen });
  }

  onSearchStatusChange(statusArray) {
    this.setState({ searchStatusesChecked: statusArray });
  }

  setButtons() {
    if (!this.props.currentUser.admin && this.props.currentUser.permissions['tm.campaigns.add'] != true) {
      this.buttons = null;
    } else {
      this.buttons = (
        <Buttons />
      )
    }
  }


  render() {
    let campaigns = this.initSearch();
    this.setButtons();
    return (
      <div>
        <div className="row pageHeading1">
          <Title />
          {this.buttons}
        </div>
        <Filters
          searchText={this.state.searchText}
          fromDate={this.state.fromDate}
          toDate={this.state.toDate}
          onFilterChange={this.onFilterChange}
        />
        <CampaignTable
          campaigns={campaigns}
          currentUser={this.props.currentUser}
          expandedRowKey={this.state.expandedRowKey}
          onExpandRowClick={this.onExpandRowClick.bind(this)}
          expandedManagementKey={this.state.expandedManagementKey}
          onExpandManagementClick={this.onExpandManagementClick}
          sortColumn={this.state.sortColumn}
          sortDirection={this.state.sortDirection}
          onSortClick={this.onSortClick}
          isSearchStatusOpen={this.state.isSearchStatusOpen}
          onSearchStatusClick={this.onSearchStatusClick}
          searchStatusesChecked={this.state.searchStatusesChecked}
          onSearchStatusChange={this.onSearchStatusChange}
          campaignStatusOptions={this.props.campaignStatusOptions}
          campaignStatusConstOptions={this.props.campaignStatusConstOptions}
        />
      </div>
    );
  }
}

CampaignListPage.propTypes = {
  campaigns: PropTypes.array,
  campaignStatusOptions: PropTypes.array
};

function mapStateToProps(state, ownProps) {
  let campaignStatusOptions = state.tm.system.lists.campaignStatus || [];
  let campaignStatusConstOptions = state.tm.system.lists.campaignStatusConst || [];

  return {
    campaigns: state.tm.campaign.list,
    campaignStatusOptions,
    campaignStatusConstOptions,
    currentUser: state.system.currentUser,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    campaignActions: bindActionCreators(campaignActions, dispatch),
    dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CampaignListPage);
