import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import moment from 'moment';

import Management from './Management';
import CampaignExtraInfo from './CampaignExtraInfo';



const CampaignRow = ({ campaign, currentUser, columns, isExpanded, onExpandRowClick, isManagment, onExpandManagementClick, campaignStatusOptions, campaignStatusConstOptions }) => {
  //console.log('campaign row');
  let statusOption = campaignStatusOptions.find(function (status) {
    if (campaign.status == status.id) return status;
  });
  let statusName = (statusOption != undefined) ? statusOption.name : '';
  if (isExpanded) {
    //get statistics
    // this.props.campaignActions.getCampaignStatistics(this.props.params.key);
  }
  return (
    <div className={`campaigns-table__row ${isExpanded ? ' campaigns-table__row_expanded' : ''} `}>
      <div className="campaign-list-row__content">
        {columns.map(column =>
          <div key={column.name} className={`campaigns-table__cell campaigns-table__cell_col_${column.name}`}>
            {(() => {
              switch (column.name) {
                case 'name':
                  return (
                    <Link to={`telemarketing/campaigns/${campaign.key}`}>
                      {campaign[column.name]}
                    </Link>
                  );
                case 'actions':
                  return (
                    <div>
                      <span className={`campaigns-table__phone-icon campaigns-table__phone-icon_mode_${campaign["telephone_predictive_mode"] == 1 ? "manual" : "predictive"}`} />
                      <span className="fa-stack fa-lg campaigns-table__expand-row-btn" onClick={() => { onExpandRowClick(campaign.key, campaign.id) }} >
                        <i className="fa fa-chevron-down fa-stack-1x"></i>
                        <i className="fa fa-circle-thin fa-stack-2x"></i>
                      </span>
                      <span onClick={() => { onExpandManagementClick(campaign.key) }}>
                        <i className={`fa fa-ellipsis-v fa-lg campaigns-table__management-btn ${isManagment ? 'campaigns-table__management-btn_active' : ''}`}></i>
                        {isManagment && <Management campaignKey={campaign.key} currentUser={currentUser}
                          activation_start_date={campaign.activation_start_date}
                          onClick={() => { onExpandManagementClick(campaign.key) }} />}
                      </span>
                    </div>
                  );
                case 'status':
                  return (<span className={`campaign-status campaign-status_${campaignStatusConstOptions[campaign.status].toLowerCase()}`}>{statusName}</span>);
                case 'scheduled_start_date':
                case 'activation_start_date':
                  return campaign[column.name] ? moment(campaign[column.name], 'YYYY-MM-DD').format('DD/MM/YY') : '\xa0';
                default:
                  return campaign[column.name] ? campaign[column.name] : '\xa0';
              }
            })()}
          </div>
        )}
      </div>
      {isExpanded && <CampaignExtraInfo campaignId={campaign.id} />}
    </div>
  );
};

CampaignRow.propTypes = {
  campaign: PropTypes.object,
  columns: PropTypes.array,
  expandedRowKey: PropTypes.bool,
  onExpandRowClick: PropTypes.func,
  expandedManagementKey: PropTypes.bool,
  onExpandManagementClick: PropTypes.func,
  campaignStatusOptions: PropTypes.array,
  campaignStatusConstOptions: PropTypes.array,
};

export default CampaignRow;
