import React from 'react';
import { connect } from 'react-redux';

import Captain50Item from './Captain50Item';

class CaptainFiftySearchResult extends React.Component {
    constructor(props) {
        super(props);
    }

    renderCaptains() {
        let that = this;

        let captains = this.props.minister50SearchResult.map( function(item, index) {
            return <Captain50Item key={index} item={item} selectedCaptainId={that.props.selectedCaptainId}
                                  captain50Click={that.props.captain50Click.bind(that)}/>
        });

        return <tbody>{captains}</tbody>;
    }

    getCounterText() {
        let counterText = '';

        if ( this.props.totalCaptains50SearchResult > 0 ) {
            counterText += 'מציג תוצאות ';
            counterText += '1-' + this.props.totalCaptains50SearchResult;
        }

        if ( '' === counterText ) {
            counterText = '\u00A0';
        }

        return counterText;
    }

    render() {
        return (
            <div className="containerStrip">
                <div className="row">
                    <div className="col-lg-8 rsltsTitle">
                        <h3 className="noBgTitle">נמצאו <span className="rsltsCounter">{this.props.totalCaptains50SearchResult}</span> רשומות</h3>
                        <div className="showingCounter">{this.getCounterText()}</div>
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

                                {this.renderCaptains()}
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        minister50SearchResult: state.elections.captain50Search.minister50SearchResult,
        totalCaptains50SearchResult: state.elections.captain50Search.totalCaptains50SearchResult
    };
}

export default connect(mapStateToProps) (CaptainFiftySearchResult);