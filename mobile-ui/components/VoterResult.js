import React from 'react';
import {formatBallotMiId} from '../libs/globalFunctions';

class VoterResult extends React.Component {
    constructor(props) {
        super(props);
        this.voterLabelStyle = { fontSize: '15px' };
    }
    renderNotVoted(voterData){
        let hadVoted = voterData.vote_id ? true : false;
        let div5Padding = { padding: '0 5px' };
        return (
            <div className="row form-group">
                <div className="col-xs-6" style={div5Padding}>
                    <div>שם בוחר</div>
                    <div><label className="text-primary" style={this.voterLabelStyle}>{voterData.first_name + ' ' + voterData.last_name}</label></div>
                </div>
                <div className="col-xs-3" style={div5Padding}>
                    <div>מספר בוחר</div>
                    <div><label className="text-primary" style={this.voterLabelStyle}>{voterData.voter_serial_number}</label></div>
                </div>
                <div className="col-xs-3" style={div5Padding}>
                    <div>סטטוס</div>
                    <div><label className={hadVoted ? 'text-green' : 'text-primary'} style={this.voterLabelStyle}>{hadVoted ? 'הצביע' : 'לא הצביע'}</label></div>
                </div>
            </div>
        )
    }
    renderVoteButtons(voterData){
        let voteButton;
        let hadVoted = voterData.vote_id ? true : false;
        if (hadVoted) {
            voteButton = <button type="button" className="btn btn-block btn-warning"
                onClick={this.props.cleanSerialNumber.bind(this)}>נקה</button>
        } else {
            voteButton = <button type="button" className="btn btn-block btn-success"
                onClick={this.props.addVoteToVoter.bind(this)}>עדכן הצבעה </button>
        }
        return voteButton;
    }
    renderAfterVoting(){
        let voterData = this.props.voterData;

        return (
            <div className="row text-green" style={{ padding: '0 15px 10px 0', fontSize: '14px' }}>
                <div className="col-xs-1" style={{ padding: '0',paddingTop: '6px' }}>
                    <img className="img-responsive" style={{ cursor: 'pointer', height: '20px' }}
                        src={window.Laravel.baseURL + 'Images/received-icon.png'} />
                </div>
                <div className="col-xs-11" style={{ fontWeight: 'bold', fontSize: '17px',padding:'0 5px' }}>
                    דיווח הצבעה לבוחר <span> {voterData.first_name + ' ' + voterData.last_name}</span>,
                    מספר <span>{voterData.voter_serial_number}</span>,
                    בקלפי <span>{formatBallotMiId(this.props.ballot_mi_id)}</span>,
                    התקבל בהצלחה!
                </div>
            </div>
        )
    }
    render() {
        let voterData = this.props.voterData;
        if (!this.props.voterAfterVoting) {
            return (<div className="col-xs-12"> <hr/>
                {this.renderNotVoted(voterData)}
                <div className="form-group"> {this.renderVoteButtons(voterData)} </div>
            </div>);
        } else {
            return (<div className="col-xs-12"> <hr/> {this.renderAfterVoting()}</div>)
        }
    }
}



export default VoterResult;