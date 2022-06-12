import React from 'react';
import {connect} from 'react-redux';

import * as SystemActions from '../../actions/SystemActions';

class Main extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.requestsSummaryTitles = {
            open: 'פניות פתוחות',
            new : 'פניות חדשות',
            passedToMe: 'פניות שהועברו אלי',
            closed: 'פניות סגורות',
            inTherapy: 'פניות בטיפול',
            IPassedOver: 'פניות שהעברתי',
            exceedCloseDate: 'פניות שחורגות'
        };
        this.progressBarTitles = {
            mainTitle: ':זמן טיפול ממוצע',
            improvementRequired: 'טעון שיפור',
            medium: 'בינוני',
            good: 'טוב',
            veryGood: 'טוב מאוד',
            youExistHere: 'אתה נמצא כאן',
            noteTitle: 'הערה:',
            noteBody: 'אין מספיק נתונים לבצוע החישוב!'
        };
    }

    changeDisplayTarget(displayTarget) {
        this.props.dispatch({type: SystemActions.ActionTypes.USER_HOME.CHANGE_DISPLAYED_RESULTS, displayTarget});
    }

    render() {
        return (
                <div className="row inqryDtlsRow">
                    <div className="col-md-8 paddingL20">
						{this.props.loadedCrmRequests ? 
							<div className="row dtlsBox openInquiries cursor-pointer">
                            <div className={"col-md-3 openReq"+ (this.props.displayTarget == 'open' ? ' active' : '')} onClick={this.changeDisplayTarget.bind(this, 'open')}>
                                <div className="inqryCounterGeneral counter">{this.props.summaryCount.open}</div>
                                <div className="inqryCounterGeneral subTitle">{this.requestsSummaryTitles.open}</div>
                            </div>
                            <div className="col-md-9 inqryDlsContainer">
                                <div className="row"> 
                                    <a className={"col-md-4 inqrDlsLinkWrap" + (this.props.displayTarget == 'new' ? ' active' : '')} 
                                       onClick={this.changeDisplayTarget.bind(this, 'new')}>
                                        <div className="inqrDlsBox">
                                            <div className="inqrDtlsTitle">{this.requestsSummaryTitles.new}</div>
                                            <div className="inqrDtlsCounter">{this.props.summaryCount.new}</div>
                                        </div>
                                    </a> 
                                    <a className={"col-md-4 inqrDlsLinkWrap" + (this.props.displayTarget == 'passedToMe' ? ' active' : '')} 
                                       onClick={this.changeDisplayTarget.bind(this, 'passedToMe')}>
                                        <div className="inqrDlsBox">
                                            <div className="inqrDtlsTitle">{this.requestsSummaryTitles.passedToMe}</div>
                                            <div className="inqrDtlsCounter">{this.props.summaryCount.passedToMe}</div>
                                        </div>
                                    </a> 
                                    <a className={"col-md-4 inqrDlsLinkWrap" + (this.props.displayTarget == 'closed' ? ' active' : '')} 
                                       onClick={this.changeDisplayTarget.bind(this, 'closed')}>
                                        <div className="inqrDlsBox">
                                            <div className="inqrDtlsTitle">{this.requestsSummaryTitles.closed}</div>
                                            <div className="inqrDtlsCounter">{this.props.summaryCount.closed}</div>
                                        </div>
                                    </a> 
                                    <a className={"col-md-4 inqrDlsLinkWrap" + (this.props.displayTarget == 'inTherapy' ? ' active' : '')} 
                                       onClick={this.changeDisplayTarget.bind(this, 'inTherapy')}>
                                        <div className="inqrDlsBox">
                                            <div className="inqrDtlsTitle">{this.requestsSummaryTitles.inTherapy}</div>
                                            <div className="inqrDtlsCounter">{this.props.summaryCount.inTherapy}</div>
                                        </div>
                                    </a> 
                                    <a className={"col-md-4 inqrDlsLinkWrap" + (this.props.displayTarget == 'IPassedOver' ? ' active' : '')} 
                                       onClick={this.changeDisplayTarget.bind(this, 'IPassedOver')}>
                                        <div className="inqrDlsBox">
                                            <div className="inqrDtlsTitle">{this.requestsSummaryTitles.IPassedOver}</div>
                                            <div className="inqrDtlsCounter">{this.props.summaryCount.IPassedOver}</div>
                                        </div>
                                    </a> 
                                    <a className={"col-md-4 inqrDlsLinkWrap" + (this.props.displayTarget == 'exceedCloseDate' ? ' active' : '')} 
                                       onClick={this.changeDisplayTarget.bind(this, 'exceedCloseDate')}>
                                        <div className="inqrDlsBox">
                                            <div className="inqrDtlsTitle">{this.requestsSummaryTitles.exceedCloseDate}</div>
                                            <div className="inqrDtlsCounter exceptional">{this.props.summaryCount.exceedCloseDate}</div>
                                        </div>
                                    </a> 
                                </div>
                            </div>
                        </div>
							: 
						<div className="row dtlsBox openInquiries cursor-pointer" style={{height:'216px' , textAlign:'center' }}><div style={{fontSize:'40px' , fontWeight:'600' , paddingTop:'50px' }}>טוען נתונים ...</div></div>
						}
                        
                    </div>
                    <div className="col-md-4 nopaddingL paddingR20">
                        <div className="dtlsBox avergeTtime">
                            <div className="panelTitle">{this.progressBarTitles.mainTitle}</div>
                            <div className="timeTprogress">
                                <ul className="progressStages">
                                    <li>{this.progressBarTitles.improvementRequired}</li>
                                    <li>{this.progressBarTitles.medium}</li>
                                    <li>{this.progressBarTitles.good}</li>
                                    <li>{this.progressBarTitles.veryGood}</li>
                                </ul>
                                <div className="progress">
                                    <div className="progress-bar" role="progressbar" aria-valuenow="63" aria-valuemin="0" 
                                        aria-valuemax="100" style={{width: this.props.averageHandleTime + '%'}}>
                                        {(this.props.summaryCount.closed >=5) && <div className="progress-value">{this.progressBarTitles.youExistHere}</div>}
                                    </div>
                                </div>
                                <ul className="progressScales">
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                </ul>
                                {(this.props.summaryCount.closed<5) && <div className="progressComment"><strong>{this.progressBarTitles.noteTitle}</strong>&nbsp;{this.progressBarTitles.noteBody}</div>}
                            </div>
                        </div>
                    </div>
                </div>
                );
    }
}
export default connect()(Main);