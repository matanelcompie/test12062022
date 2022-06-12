import React from 'react';
import { Link } from 'react-router';

const ClusterActivistActions = ({ displayClusterInSeperatePage, displayClusterInSeperatePageChange, totalSummaryResults, searchFields,
  recordsPerPage, recordsPerPageChange, loadNewPerPageRows, currentUser }) => {
  function getBlockStyle() {
    let style = {};

    if (totalSummaryResults == 0) {
      style = { display: 'none' };
    }

    return style;
  }

  function clustersPerPageChange(event) {
    recordsPerPageChange(event.target.value);
  }

  function convertToUrlKeys() {
    if (totalSummaryResults == 0) {
      return '';
    }

    let searchKeys = Object.keys(searchFields);
    let urlKeys = [];

    for (let searchIndex = 0; searchIndex < searchKeys.length; searchIndex++) {
      let searchKey = searchKeys[searchIndex];

      if (searchFields[searchKey] != null && searchFields[searchKey] != '' && searchKey != 'selected_roles') {
        urlKeys.push(searchKey + '=' + searchFields[searchKey]);
      }
    }

    if (urlKeys.length > 0) {
      for (let selectedIndex = 0; selectedIndex < searchFields.selected_roles.length; selectedIndex++) {
        urlKeys.push('selected_roles[]=' + searchFields.selected_roles[selectedIndex]);
      }

      return urlKeys.join('&');
    } else {
      return '';
    }
  }

  let urlKeys = convertToUrlKeys();
  let exportLink = 'elections/reports/cluster-activist/export';

  if (totalSummaryResults > 0) {
    exportLink += '?' + urlKeys;
  }

  return (
    <div className="row rsltsTitleRow" style={getBlockStyle()}>
      <div className="col-lg-8 col-md-10">
        <h3 className="separation-item noBgTitle">נמצאו<span className="counter">{totalSummaryResults}</span>רשומות</h3>

        <label className="item-space radio-inline last-radio">
          <input type="radio" name="RadioOptions2" id="Radio4" value="option4" checked={displayClusterInSeperatePage}
            onChange={displayClusterInSeperatePageChange.bind(this, true)} />הצג דף נפרד לכל אשכול
        </label>

        <label className="item-space radio-inline">
          <input type="radio" name="RadioOptions2" id="Radio3" value="option3" checked={!displayClusterInSeperatePage}
            onChange={displayClusterInSeperatePageChange.bind(this, false)} />הצג{'\u00A0'}
        </label>
        <input className="item-space input-simple" type="number" value={recordsPerPage} disabled={displayClusterInSeperatePage}
          onChange={clustersPerPageChange.bind(this)} />
        <span className="item-space">אשכולות</span>
        <button type="submit" className="btn btn-default btn-sm" onClick={loadNewPerPageRows.bind(this)}>הצג</button>
      </div>

      <div className="col-lg-4 col-md-2 clearfix">
        <div className="link-box pull-left">
          {(currentUser.admin || currentUser.permissions['elections.reports.cluster_activists.print'] == true) &&
            <Link title="הדפסה" to={exportLink + '&file_type=print'} className="icon-box print" target="_blank" />
          }

          {(currentUser.admin || currentUser.permissions['elections.reports.cluster_activists.export'] == true) &&
            <Link title="יצוא ל-pdf" to={exportLink + '&file_type=pdf'} className="icon-box pdf" target="_blank" />
          }
        </div>
      </div>
    </div>
  );
};

export default ClusterActivistActions;
