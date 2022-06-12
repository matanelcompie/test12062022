import React from 'react';

import Pagination from '../../../global/Pagination';
import Captain50ActivityResultItem from './Captain50ActivityResultItem';

const Captain50ActivitySearchResult = ({supportStatuses, totalSummaryResults, currentPageRows, displayItemsPerPage,
                                        currentPage, navigateToPage, currentUser ,displayCaptainBallots}) => {
    function getBlockStyle() {
        let style = {};

        if ( totalSummaryResults == 0 ) {
            style = {display: 'none'};
        }

        return style;
    }

    function renderSupportStatusHeaders() {
        let supportItems = supportStatuses.map( function (item, index) {
            return <th key={item.key}>{item.name}</th>;
        });

        return supportItems;
    }

    function renderResultRows() {
        let rows = currentPageRows.map( function(item, index) {
            return <Captain50ActivityResultItem key={index} item={item} supportStatuses={supportStatuses}
                                                currentUser={currentUser} displayCaptainBallots={displayCaptainBallots}/>
        });

        return rows;
    }

    return (
        <div className="dtlsBox srchRsltsBox box-content" style={getBlockStyle()}>
            <div className="table-container">
                <table className="table table-striped line-around table-report-activity">
                    <thead>
                    <tr className="first-line">
                        <th colSpan="5" className="left-border" style={{fontSize:'16px'}}>משויכים</th>
                         <th colSpan="3"></th>
                        <th colSpan={supportStatuses.length + 3} className="left-border" >סטטוס סניף עדכונים שבוצעו</th>
                        
                    </tr>
                    <tr className="second-line" style={{color:'#323A6B'}}>
                        <th>שם מלא</th>
                        <th>ת.ז</th>
                        <th>מספר קלפיות</th>

                        <th>בתי אב</th>
                        <th className="left-border">תושבים</th>

                        <th>קיים שיוך זרם</th>
                        <th>קיים שיוך עדתי</th>
                        {/* <th>לא היו בבית</th> */}
                        <th>כתובות אומתו</th>
                        <th className="left-border">כתובת שגויה</th>

                        {renderSupportStatusHeaders()}
                        <th className="left-border">ללא סטטוס</th>

                        <th>סה"כ שינויים</th>
                    </tr>
                    </thead>

                    <tbody>
                        {renderResultRows()}
                    </tbody>
                </table>
            </div>

            { (totalSummaryResults > displayItemsPerPage) &&
            <Pagination resultsCount={totalSummaryResults}
                        displayItemsPerPage={displayItemsPerPage}
                        currentPage={currentPage}
                        navigateToPage={navigateToPage.bind(this)}/>
            }
        </div>
    );
};

export default Captain50ActivitySearchResult;