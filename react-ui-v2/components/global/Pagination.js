import React from 'react';
/**
 * resultsCount:results count, to determine the pagination options need to be displaied. 
 * displayItemsPerPage: the count of the item you want to display when rendering the results.
 * currentPage: the current page selected in your pagination
 * navigateToPage: function to excute when page is changed (pageIndex will be sent with the function), your function will render the relevant results
 * disableFromPage - if this is number and not null - this will disable pagination from some index
 */
const Pagination = ({ resultsCount, displayItemsPerPage, currentPage, navigateToPage , disableFromPage=null }) => {
	function navigateToPageIndex(pageIndex) {
        if (pageIndex != currentPage && pageIndex > 0 && pageIndex <= paginationPagesCount()) {
			navigateToPage(pageIndex);
        }
    }

    function paginationPagesCount() {
        return Math.ceil(resultsCount / displayItemsPerPage);
    }

    function renderPaginationOptions() {
        let pages = [];
        let pagesCount = paginationPagesCount();
        let firstIndex = (currentPage - 2 > 1 ? currentPage - 2 : 1);
        let lastIndex = (currentPage + 2) <= pagesCount ? currentPage + 2 : pagesCount;
        const Row = ({ i, label , disabled=false }) => <a onClick={disabled? null : navigateToPageIndex.bind(this,i)} className="no-user-select">{label}</a>;
        pages.push(<li key='first' className={(currentPage == firstIndex) ? 'disabled' : 'cursor-pointer'}><Row i={currentPage - 1} label='&lt;' /></li>);

        for (let i = firstIndex; i <= lastIndex; i++) {
			let pageDisabled=(disableFromPage && disableFromPage <= i);
            pages.push(
                <li key={i} className={(i == currentPage) ? 'active' : (pageDisabled?   'disabled':'cursor-pointer')  } title={pageDisabled?"טוען נתוני עמוד....":null}>
                    <Row i={i} label={i}  disabled={pageDisabled} />
                </li>
            );
        }

        pages.push(<li key='next' className={(currentPage == lastIndex || (disableFromPage && disableFromPage-1 <= currentPage)) ? 'disabled' : 'cursor-pointer'}><Row i={currentPage + 1} label='&gt;' disabled={(currentPage == lastIndex || (disableFromPage && disableFromPage-1 <= currentPage))} /></li>);
        return pages;
    }
	
	return (
		<nav aria-label="Page navigation paginationRow">
			<div className="text-center">
				<ul className="pagination">
					{renderPaginationOptions()}
				</ul>
			</div>
        </nav>
	);
};

export default Pagination;
