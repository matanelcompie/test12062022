import React from 'react';
import PropTypes from 'prop-types';

import TextInput from 'tm/components/common/TextInput';
import DateInput from 'tm/components/common/DateInput';

const Filters = ({searchText, fromDate, toDate, onFilterChange}) => {

	let textValues = {
		searchTitle: 'שם',
		searchFromDate: 'מתאריך',
		searchToDate: 'עד תאריך'
	}

	function onFilterChangeTemp(event) {
		onFilterChange(event.target.name, event.target.value)
	}

	return (
		<div className="campaign-list-filters">
			<DateInput
				label={textValues.searchFromDate}
				name='fromDate'
				value={fromDate}
				onChange={onFilterChange}
				format="DD/MM/YYYY"
				savingFormat="YYYY-MM-DD"
			/>
			<DateInput
				label={textValues.searchToDate}
				name='toDate'
				value={toDate}
				onChange={onFilterChange}
				format="DD/MM/YYYY"
				savingFormat="YYYY-MM-DD"
			/>
			<TextInput
				name='searchText'
				value={searchText}
				onChange={onFilterChangeTemp}
				placeholder={textValues.searchTitle}
				bsFeedbackIcon={"search"}
			/>
		</div>
	);
};

Filters.propTypes = {
	searchText: PropTypes.string,
	fromDate: PropTypes.string,
	toDate: PropTypes.string,
	onFilterChange: PropTypes.func
};

export default Filters;
