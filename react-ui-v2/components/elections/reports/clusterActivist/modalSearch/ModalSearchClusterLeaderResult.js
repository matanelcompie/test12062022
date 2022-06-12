import React from 'react';

import ModalSearchClusterLeaderItem from './ModalSearchClusterLeaderItem';

const ModalSearchClusterLeaderResult = ({totalSummaryResults, clusterLeaders, selectedLeaderKey, selectLeader}) => {
    function getBlockStyle() {
        let style = {};

        if ( totalSummaryResults == 0 ) {
            style = {display: 'none'};
        }

        return style;
    }

    function getCounter() {
        let counterText = 'מציג תוצאות 1-';
        counterText += totalSummaryResults;

        return counterText;
    }

    function renderLeaders() {
        let leaders = clusterLeaders.map( function (leaderItem, index) {
            return <ModalSearchClusterLeaderItem key={index} leaderItem={leaderItem} selectedLeaderKey={selectedLeaderKey}
                                                 selectLeader={selectLeader.bind(this)}/>
        });

        return leaders;
    }

    return (
        <div className="containerStrip" style={getBlockStyle()}>
            <div className="row">
                <div className="col-lg-8 rsltsTitle">
                    <h3 className="noBgTitle">נמצאו <span className="rsltsCounter">{totalSummaryResults}</span> רשומות</h3>
                    <div className="showingCounter">{getCounter()}</div>
                </div>

                <div className="col-lg-12 tableList dataConf">
                    <div className="table-responsive">
                        <table className="table table-striped tableNoMarginB tableTight csvTable">
                            <thead>
                            <tr>
                                <th>ת.ז.</th>
                                <th>שם משפחה</th>
                                <th>שם פרטי</th>
                                <th>עיר</th>
                                <th>סטטוס שיבוץ</th>
                                <th>מס' בתי אב</th>
                            </tr>
                            </thead>

                            <tbody>
                                {renderLeaders()}
                            </tbody>
                        </table>                            
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalSearchClusterLeaderResult;