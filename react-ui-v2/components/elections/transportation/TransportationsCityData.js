import React from 'react';


const TransportationsCityData = function ({ cityData, totalVotersCount }) {
    let transportationsCount = cityData.transportations_count;
    let countStyle = { marginRight: '20px' }
    let voters_has_driver_count = transportationsCount.has_driver_count;
    let hasDriverPercent = ((voters_has_driver_count / totalVotersCount) * 100).toFixed(0);

    let totalDrivers = 0; let driversHasTransportationsPercent = 0;
    let driversHasTransportations = cityData.drivers_has_transportations;
    let driversNotHasTransportations = cityData.drivers_not_has_transportations;

    totalDrivers = driversHasTransportations + driversNotHasTransportations;
    if (totalDrivers > 0) {
        driversHasTransportationsPercent = ((driversHasTransportations / totalDrivers) * 100).toFixed(0);
    }

    let progressbarStyle = { width: 'calc(100% - 250px)', margin: '-4px 25px' }
    return (
        <div className="row" id="transportationsCityData" >
            <div className="dtlsBox srchRsltsBox clearfix" style={{ margin: '20px 0', minHeight: '90px', fontSize: '18px' }}>
                <div className="col-sm-2" style={{ color: 'blue' }}>
                    <h1>{cityData.city_name}</h1>
                </div>
                <div className="col-sm-10">
                    <div className="row">
                        <div className="col-sm-2">
                            <label>אשכולות</label>
                            <b style={countStyle}>{cityData.clusters.length}</b>
                        </div>
                        <div className="col-sm-2">
                            <label>נהגים</label>
                            <b style={countStyle}>{totalDrivers}</b>
                        </div>
                        <div className="col-sm-8">
                            <label>הסעות משובצות</label>
                            <div className="progress item-space" style={progressbarStyle}>
                                <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{ width: hasDriverPercent + "%" }}></div>
                            </div>
                            <b style={countStyle}>{voters_has_driver_count} / {totalVotersCount}</b>
                        </div>
                    </div>
                </div>
                <div className="col-sm-10">
                    <div className="row">
                        <div className="col-sm-2">
                            <label>הסעות</label>
                            <b style={countStyle}>{transportationsCount.not_cripple_count}</b>
                        </div>
                        <div className="col-sm-2">
                            <label>הסעות נכה</label>
                            <b style={countStyle}>{transportationsCount.cripple_count}</b>
                        </div>
                        <div className="col-sm-8">
                            <label>נהגים משובצים</label>
                            <div className="progress item-space" style={progressbarStyle}>
                                <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{ width: driversHasTransportationsPercent + "%" }}></div>
                            </div>
                            <b style={countStyle}>{driversHasTransportations} / {totalDrivers}</b>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransportationsCityData;