import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import ReactWidgets from 'react-widgets';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import moment from 'moment';

import Combo from '../global/Combo';
import {parseDateToPicker, parseDateFromPicker} from '../../libs/globalFunctions';
class Search extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
        momentLocalizer(moment);
    }

    textIgniter() {
        this.blockTitle='חפש פנייה';
        this.filtersTitle={
            targetCloseDate:'תאריך יעד לסגירה',
            toDate:'עד תאריך',
            handleDate:'מועד טיפול',
            status:'סטטוס טיפול',
            type:'סוג הפניה',
            topic:'נושא הפניה',
            subTopic:'תת נושא הפניה',
            search:'חפש'
        };
        //{this.filtersTitle.}
    }
test(){}
    render() {
        return (
        <div className="ContainerCollapse dtlsBox srchPanel dashboardSrch clearfix">
            <a className="" data-toggle="collapse" href="#CollapseSrchInqry" aria-expanded="true" aria-controls="collapseExample">
                <div className="row panelCollapse in">
                    <div className="collapseArrow closed"></div>
                    <div className="collapseArrow open"></div>
                    <div className="collapseTitle">{this.blockTitle}</div>
                </div>
            </a>
            <div id="CollapseSrchInqry" className="collapse" aria-expanded="true">
                <div className="row CollapseContent">
                    <div className="">
                        <div className="row">
                            <div className="col-xs-12 col-md-4">
                                <form className="form-horizontal">
                                    <div className="form-group">
                                        <label htmlFor="inqryCloseDate" className="col-sm-4 control-label">{this.filtersTitle.targetCloseDate}</label>
                                        <div className="col-sm-8">
                                            <ReactWidgets.DateTimePicker 
                                                    isRtl={true}
                                                    time={false}
                                                    value={parseDateToPicker()}
                                                    onChange={parseDateFromPicker.bind(this, {callback: this.test, format: "YYYY-MM-DD", functionParams: ''})}
                                                    format="DD/MM/YYYY"
                                                />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="srchToDate" className="col-sm-4 control-label">{this.filtersTitle.toDate}</label>
                                        <div className="col-sm-8" id="srchToDate">
                                            <ReactWidgets.DateTimePicker 
                                                isRtl={true}
                                                time={false}
                                                value={parseDateToPicker()}
                                                onChange={parseDateFromPicker.bind(this, {callback: this.test, format: "YYYY-MM-DD", functionParams: ''})}
                                                format="DD/MM/YYYY"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="srchTrtmnt" className="col-sm-4 control-label">{this.filtersTitle.handleDate}</label>
                                        <div className="col-sm-8">
                                            <select className="form-control" id="srchTrtmnt">
                                                <option hidden="">בחר</option>
                                                <option>4</option>
                                                <option>3</option>
                                                <option>2</option>
                                                <option>1</option>
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="col-xs-12 col-md-4">
                                <form className="form-horizontal">
                                    <div className="form-group">
                                        <label htmlFor="srchStatus" className="col-sm-4 control-label">{this.filtersTitle.status}</label>
                                        <div className="col-sm-8">
                                            <select className="form-control" id="srchStatus">
                                                <option hidden="">בחר</option>
                                                <option>4</option>
                                                <option>3</option>
                                                <option>2</option>
                                                <option>1</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="srchType" className="col-sm-4 control-label">{this.filtersTitle.type}</label>
                                        <div className="col-sm-8">
                                            <select className="form-control" id="srchType">
                                                <option hidden="">בחר</option>
                                                <option>4</option>
                                                <option>3</option>
                                                <option>2</option>
                                                <option>1</option>
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="col-xs-12 col-md-4">
                                <form className="form-horizontal">
                                    <div className="form-group">
                                        <label htmlFor="srchSubject" className="col-sm-4 control-label">{this.filtersTitle.topic}</label>
                                        <div className="col-sm-8">
                                            <select className="form-control" id="srchSubject">
                                                <option hidden="">בחר</option>
                                                <option>4</option>
                                                <option>3</option>
                                                <option>2</option>
                                                <option>1</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="srchSub" className="col-sm-4 control-label">{this.filtersTitle.subTopic}</label>
                                        <div className="col-sm-8">
                                            <select className="form-control" id="srchSub">
                                                <option hidden="">בחר</option>
                                                <option>4</option>
                                                <option>3</option>
                                                <option>2</option>
                                                <option>1</option>
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="col-xs-5 col-sm-4 col-sm-offset-4">
                                <button className="btn btn-primary srchBtn pull-left">{this.filtersTitle.search}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    }
}

function mapStateToProps(state) {
    return {

    }
}

export default connect(mapStateToProps)(withRouter(Search));