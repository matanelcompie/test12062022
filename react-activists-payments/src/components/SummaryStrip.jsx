import React, { useContext, useEffect, useState, useRef } from 'react';
import { CircularProgress, LinearProgress } from '@material-ui/core';
import { useGetSummaryData } from '../hooks/useCall.jsx';
import { objectIsNotEmpty, numberWithCommas, formatNumberAfterPoint } from '../helpers/variousHelpers.js';

const SummaryStrip = () => {
  const { summaryData, loadingSummary } = useGetSummaryData(); 
  const [loadingSummaryDelayed, setLoadingSummaryDelayed] = useState(true)

  useEffect(() => {
    if (!loadingSummary) {
      setTimeout(() => {
        setLoadingSummaryDelayed(false);
      }, 1000);
    }
  }, [loadingSummary])

  return (
    <div className="summary-strip-wrp">
      { !loadingSummaryDelayed ?
      <>
        { (summaryData && objectIsNotEmpty(summaryData)) ? 
        <>
          <div className="votes-privilege count">
            <div className="display-block count-txt">בעלי זכות בחירה</div>
            <div className="display-block count-data">{numberWithCommas(summaryData.count_election_voters)}</div>
          </div>
          <div className="votes-voters count">
            <div className="display-block count-txt">בוחרים בפועל</div>
            <div className="display-block count-data">{numberWithCommas(summaryData.count_all_votes)}</div>
          </div>
          <div className="votes-percent count">
            <div className="display-block count-txt">אחוז בוחרים בפועל</div>
            <div className="display-block count-data">{formatNumberAfterPoint(summaryData.present_votes, 2)}%</div>
          </div>
          <div className="votes-rejected count">
            <div className="display-block count-txt">קולות פסולים</div>
            <div className="display-block count-data">{numberWithCommas(summaryData.count_not_valid_votes)}</div>
          </div>
          <div className="votes-actual count">
            <div className="display-block count-txt">קולות כשרים</div>
            <div className="display-block count-data">{numberWithCommas(summaryData.count_valid_votes)}</div>
          </div>
        </>
        :
        <>
          <div className="overall linearProgress">
          <div className="circular-wrp linearProgress">
            <div>נראה שהיתה בעיה בטעינת הנתונים. יש לרענן את הדף.</div>
            <div>אם הבעיה נמשכת - פנה למנהל המערכת.</div>
          </div>
        </div>
        </>
        }
      </>
      :
      <>
        <div className="overall linearProgress">
          <div className="circular-wrp linearProgress">
            <div>מכין נתונים...</div>
            <LinearProgress />
          </div>
        </div>
      </>
      }
    </div>
  )
}

export default SummaryStrip;
