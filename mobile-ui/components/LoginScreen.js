import React from 'react';
import ModalWindow from '../components/global/ModalWindow';

import { formatBallotMiId } from '../libs/globalFunctions';
const history = require("history").createBrowserHistory()

class LoginScreen extends React.Component {
    constructor(props) {
        super(props);
        this.InitialState = {
            ballotId: '',
            showInfoModal: false,
        }
        this.state = { ...this.InitialState };
        this.modalInfoTitle="כיצד למצוא את מס' הקלפי שלי"
    }
	
  
	
    onChangeBallotId(e) {
        let ballotIdValue = e.target.value;

		let pattern = /^\d{1,9}(\.\d{0,1})?$/;
		if(ballotIdValue == '' ){
			this.setState({ ballotId: '' });
			return;
		}
		if(!pattern.test(ballotIdValue)){return;}
         
        this.setState({ ballotId: ballotIdValue });
    }
    checkBallotBoxId(){
        let ballotId = this.state.ballotId
        if (ballotId == '' || parseInt(ballotId) < 1) {
            return false;
        }
        if (this.props.loginErrorData && this.state.ballotId == this.props.loginErrorData.data.ballot_mi_id) {
            return false;
        }
        return true;
    }
    login(e) {
        e.preventDefault();
        let pathnameData = history.location.pathname.split("/");
        let vote_reporting_key = pathnameData[pathnameData.length - 1];
		
		let ballotID = this.state.ballotId + "";
		if(ballotID.indexOf(".") >= 0){ // if dot  exists
			if(ballotID.slice(-1) == "."){ // if last character is "." like "80." or "23."
				ballotID = ballotID.substr(0 , ballotID.length-1) + "0";
			}
			else{ // else if format is like "20.0" or "342.1"
				ballotID = ballotID.replace(".","");
			}
		}
	 
       this.props.login({ vote_reporting_key: vote_reporting_key, ballot_mi_id: parseInt(ballotID) })
    }
    renderLoginError(){
        let phoneNumber= this.props.cityPhone;
 
        let phoneItem =  <div><span> פנה למוקד במס</span> <a href={'tel::' + phoneNumber}>{phoneNumber}</a></div>;
        let errorData = this.props.loginErrorData.data;
        let errorCode = this.props.loginErrorData.error_code;
        if (errorCode == 'M001') {
            let voteFullDate = errorData.vote_end_time.substring(0, 5) + ' - ' + errorData.vote_start_time.substring(0, 5)
                + ' ' + errorData.election_date;
            return <div className="row" style={{ padding: '0 12px 20px 0', fontSize: '16px' }}>
                <div className="col-xs-1" style={{padding:'0'}}>
                    <img className="img-responsive" style={{ cursor: 'pointer', height: '20px' }}
                        src={window.Laravel.baseURL + 'Images/alert-mobile-icon.png'} />
                </div>
                <div className="col-xs-11">
                    <span style={{ color: '#CC0000' }}>שים לב !</span> <br />
                    <span style={{ color: '#CC0000' }}> הכניסה אפשרית במועד הבחירות בלבד</span>  <br />
                    <span>יום {errorData.hebrewDate}</span> <br />
                    <span>{voteFullDate}</span>
                    {phoneItem}
                </div>
            </div>
        } else {
            return <div>
                <span>  לא קיים שיוך לקלפי מס' </span> <b>{formatBallotMiId(this.props.loginErrorData.data.ballot_mi_id)}</b> לפעיל
                {phoneItem}
            </div>

        }

    }
    displayInfoModal(bool) {
        this.setState({ showInfoModal: bool });
    }
    render() {
        let validBallotId = this.checkBallotBoxId()
        return (
            <div>
                <h3 className="text-primary">כניסה למערכת</h3>
                <div className="row section">
                    <div className="col-md-12">
                        <form>
                            <h4><label>קלפי לדיווח</label>
                                <a onClick={this.displayInfoModal.bind(this, true)}><img className="img-responsive pull-left" style={{ cursor: 'pointer', height: '15px', 'marginTop': '8px' }}
                                    src={window.Laravel.baseURL + 'Images/info-icon-mobile.png'} /></a>
                            </h4>
                            <div className="row form-group">
                                <div className="col-xs-12">
                                    <input className="form-control" value={this.state.ballotId} onChange={this.onChangeBallotId.bind(this)} />
                                </div>
                            </div>
                            <div className="row form-group">
                                <div className="col-xs-4 pull-left">
                                    <button disabled={!validBallotId} type="submit" className="btn btn-block btn-primary" onClick={this.login.bind(this)}>המשך</button>
                                </div>
                            </div>
                        </form>
                    </div>
                {this.props.loginErrorData && <div className="col-xs-12"> {this.renderLoginError()} </div>}
                </div>
                <ModalWindow
                    show={this.state.showInfoModal}
                    title={this.modalInfoTitle}
                    buttonOk={this.displayInfoModal.bind(this, false)}
                    buttonOkText='סגור'
                    buttonX={this.displayInfoModal.bind(this, false)}
                >
                    <div style={{ padding: '10px' }}>
                        <h5 style={{ marginTop: 0 }}>בטופס סימון ההצבעה שבועדת הקלפי מוצג מס' קלפי בפינתו השמאלית למעלה בהתאם לדוגמא</h5>
                        <img className="img-responsive" src={window.Laravel.baseURL + 'Images/find-ballot-number.png'} />
                    </div>
                </ModalWindow>
            </div>
        );
    }
}



export default LoginScreen;