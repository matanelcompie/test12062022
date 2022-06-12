import React from 'react';
import PropTypes from 'prop-types';

const TableColumns = ({columns, onSortClick, sortColumn, sortDirection, onSearchStatusClick, searchStatusesChecked}) => {
    return (
        <div className="campaigns-table__header">
            <div className="campaigns-table__row">
                {columns.map(column =>
                    <div
                        key={column.name}
                        className={`campaigns-table__cell campaigns-table__cell_col_${column.name}` + (column.order ? " campaigns-table__cell_col__sortable" : "")} 
                        onClick={() => {column.order && onSortClick(column.name)}}
                    >
                        {column.label}
                        {column.order &&
                            <span className="campaigns-table__sorting">
                                <i className={`fa fa-long-arrow-up ${(sortColumn == column.name && sortDirection == 'desc')?'campaigns-table__active-sort':''}`}></i>
                                <i className={`fa fa-long-arrow-down ${(sortColumn == column.name && sortDirection == 'asc')?'campaigns-table__active-sort':''}`}></i>
                            </span>
                        }
                        {column.name == 'status' &&
                            <span
                                onClick={onSearchStatusClick}
                                className={`campaigns-table__filter-btn ${searchStatusesChecked.length ? 'campaigns-table__filter-btn_active' : ''}`}>
                                <i className="fa fa-filter"></i>
                            </span>
                        }
                        {column.name == 'actions' &&
                            <span>&nbsp;</span>
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

TableColumns.propTypes = {
    sortColumn: PropTypes.string,
    sortDirection: PropTypes.string,
    onSortClick: PropTypes.func,
    onSearchStatusClick: PropTypes.func,
    searchStatusesChecked: PropTypes.array,
    onSearchStatusChange: PropTypes.func
}

export default TableColumns;
