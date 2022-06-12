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
        console.log('pagesCount', pagesCount)
        let firstIndex = (currentPage - 2 > 1 ? currentPage - 2 : 1);
        let lastIndex = (currentPage + 4) <= pagesCount ? currentPage + 4 : pagesCount;
        const Row = ({ i, label , disabled=false }) => <a onClick={disabled? null : navigateToPageIndex.bind(this,i)} className="page-link">{label}</a>;
        pages.push(<li key='first' className={"page-item " + ((currentPage == firstIndex) ? 'disabled' : 'cursor-pointer')}><Row i={currentPage - 1} label='&laquo;' /></li>);

        for (let i = firstIndex; i <= lastIndex; i++) {
			let pageDisabled=(disableFromPage && disableFromPage <= i);
            pages.push(
                <li key={i} className={"page-item " + ((i == currentPage) ? 'active' : (pageDisabled?   'disabled':'cursor-pointer'))  } title={pageDisabled?"טוען נתוני עמוד....":null}>
                    <Row i={i} label={i}  disabled={pageDisabled} />
                </li>
            );
        }

        pages.push(<li key='next' className={"page-item " + (currentPage == lastIndex || (disableFromPage && disableFromPage-1 <= currentPage)) ? 'disabled' : 'cursor-pointer'}>
                <Row i={currentPage + 1} label='&raquo;' disabled={(currentPage == lastIndex || (disableFromPage && disableFromPage-1 <= currentPage))} />
            </li>);
        return pages;
    }
	
	return (
        <nav className="survey-pagination" aria-label="דפדוף סקרים" style={{margin:'0 auto', marginBottom: 0}}>
            <ul className="pagination">
		        {renderPaginationOptions()}
            </ul>
        </nav>
	);
};

export default Pagination;
