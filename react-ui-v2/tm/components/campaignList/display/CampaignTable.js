import React from 'react';
import PropTypes from 'prop-types';

import CampaignRow from './CampaignRow';
import Statuses from './Statuses';
import TableColumns from './TableColumns';


const CampaignTable = ({ campaigns, currentUser, expandedRowKey, onExpandRowClick, expandedManagementKey, onExpandManagementClick,
  sortColumn, sortDirection, onSortClick, isSearchStatusOpen, onSearchStatusClick,
  searchStatusesChecked, onSearchStatusChange, campaignStatusOptions, campaignStatusConstOptions }) => {
  let columns = [
    { name: 'id', label: '#', order: true },
    { name: 'name', label: 'שם קמפיין', order: true },
    { name: 'creator_name', label: 'יוצר קמפיין', order: true },
    { name: 'scheduled_start_date', label: 'תאריך מתוכנן', order: true },
    { name: 'activation_start_date', label: 'תאריך הפעלה', order: true },
    { name: 'status', label: 'מצב' },
    { name: 'actions', label: '' },
  ];

  return (
    <div className="dtlsBox clearfix">
      <div className="row rsltsTitleRow">
        <div className="col-md-12 rsltsTitle">
          <div className="campaigns-table">
            <TableColumns
              columns={columns}
              onSortClick={onSortClick}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSearchStatusClick={onSearchStatusClick}
              searchStatusesChecked={searchStatusesChecked}
            />
            {isSearchStatusOpen &&
              <Statuses
                searchStatusesChecked={searchStatusesChecked}
                onCoverClick={onSearchStatusClick}
                onSearchStatusChange={onSearchStatusChange}
                campaignStatusOptions={campaignStatusOptions}
              />
            }
            <div className="campaigns-table__body">
              {campaigns.map(item =>
                <CampaignRow
                  key={item.key}
                  campaign={item}
                  currentUser={currentUser}
                  columns={columns}
                  isExpanded={expandedRowKey === item.key}
                  onExpandRowClick={onExpandRowClick}
                  isManagment={expandedManagementKey === item.key}
                  onExpandManagementClick={onExpandManagementClick}
                  campaignStatusOptions={campaignStatusOptions}
                  campaignStatusConstOptions={campaignStatusConstOptions}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

CampaignTable.propTypes = {
  campaigns: PropTypes.array,
  expandedRowKey: PropTypes.string,
  onExpandRowClick: PropTypes.func,
  expandedManagementKey: PropTypes.string,
  onExpandManagementClick: PropTypes.func,
  sortColumn: PropTypes.string,
  sortDirection: PropTypes.string,
  onSortClick: PropTypes.func,
  isSearchStatusOpen: PropTypes.bool,
  onSearchStatusClick: PropTypes.func,
  searchStatusesChecked: PropTypes.array,
  onSearchStatusChange: PropTypes.func,
  campaignStatusOptions: PropTypes.array,
  //campaignStatusConstOptions: PropTypes.array,
}

export default CampaignTable;
