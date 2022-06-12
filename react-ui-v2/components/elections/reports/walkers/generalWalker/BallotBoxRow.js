import React from 'react';
const BallotBoxRow = ({ item, cityName, clusterName, currentPage, numberPerPage }) => {
    // console.log(item.voter_count, numberPerPage, ballotBoxDisplayedUsers);
    let firstBallotIndex = item.firstBallotIndex; //the first row index of the ballotBox (according of the Previous ballotBoxes)

    let positionInBallotBox = (currentPage * numberPerPage) - firstBallotIndex; // Subtract the others ballotBoxes rows
    let pageInBallotBox = Math.ceil(positionInBallotBox / numberPerPage); //Current page position in the ballotBox

    let totalPages =getBallotBoxTotalPages(item,numberPerPage,firstBallotIndex);
    /**
     * @function getBallotBoxTotalPages()
     * Calculate the total number of ballot box pages
     * -> According of the number of the page voters.
     * -> Check if the  ballotBox start in the middle of page  
     */
     function getBallotBoxTotalPages(item,numberPerPage,firstBallotIndex) {

        let firstBallotPage = Math.ceil(firstBallotIndex / numberPerPage); //Get the first page of the ballotBox
        let lastBallotPage = Math.ceil((firstBallotIndex + item.voter_count) / numberPerPage);  //Get the last page of the ballotBox
        let pages = lastBallotPage - firstBallotPage; //Number of pages
        if (firstBallotIndex % numberPerPage != 0) { //Start in  middle of page
            pages += 1;
        }
        return pages;
    }

    function getBallotMiId(ballotMiId) {
        var miIdStr = ballotMiId.toString();
        var lastDigit = miIdStr.charAt(miIdStr.length - 1);

        return (miIdStr.substring(0, miIdStr.length - 1) + '.' + lastDigit);
    }

    let blueBorderStyle = { borderTop: '1px solid #498BB6', borderBottom: '1px solid #498BB6' };
    return <tr key={'ballotBox' + item.mi_id} style={{ color: '#323A6B', fontSize: '18px', backgroundColor: '#CCDEEA' }}>
        <td style={blueBorderStyle}>עיר</td>
        <th style={blueBorderStyle}><strong>{cityName}</strong></th>
        <td style={blueBorderStyle}>אשכול</td>
        <th style={blueBorderStyle}><strong>{clusterName}</strong></th>
        <td colSpan="3" style={blueBorderStyle} className="text-right">
            <span className="item-space">מספר קלפי</span>
            <strong>{getBallotMiId(item.mi_id)}</strong>&nbsp;&nbsp;
                </td>
        <td colSpan="2" style={blueBorderStyle} className="text-right">
            <span className="item-space">מס' תושבים</span>
            <strong>{item.voter_count}</strong>
        </td>
        <td colSpan="2" style={blueBorderStyle} className="text-right">
            <span className="item-space">עמודים לקלפי</span>
            <strong>{pageInBallotBox}</strong>/<strong>{totalPages}</strong>
        </td>
    </tr>
}
export default BallotBoxRow;