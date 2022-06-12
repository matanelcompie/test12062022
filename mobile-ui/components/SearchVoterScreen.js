import React from 'react';
import { connect } from 'react-redux';
import * as Actions from '../actions/Actions';

import { validNumber } from '../libs/globalFunctions';
import ActivistReporterData from '../components/ActivistReporterData';
import VoterResult from '../components/VoterResult';
import VotingReportHistory from '../components/VotingReportHistory';


class SearchVoterScreen extends React.Component {
    constructor(props) {
        super(props);
        this.InitialState = {
            serialNumber: '',
            firstSearchDone: ''
        }
        this.state = { ...this.InitialState };
        this.inputRef = React.createRef();
        this.searchtimeOut=null;
    }
    componentDidMount() {
        this.inputRef.current.focus();
    }
    componentWillUnmount(){
        if(this.searchtimeOut){clearInterval(this.searchtimeOut)}
    }
    onChangeSerialNumber(e) {
        let serialNumberValue = e.target.value;
        if (!validNumber(serialNumberValue)) {
            let value = parseInt(serialNumberValue);
            serialNumberValue = isNaN(value) ? '' : value;
        } else if (serialNumberValue.length > 3) {
            serialNumberValue = serialNumberValue.substring(0, 3);
        }
        this.setState({ serialNumber: serialNumberValue })
    }
    checkSerialNumber() {
        let serialNumber = this.state.serialNumber
        if (serialNumber == '' || parseInt(serialNumber) < 1) {
            return false;
        }
        return true;
    }
    searchVoter(e) {
        if(!this.state.firstSearchDone){
            let self = this;
           this.searchtimeOut = setTimeout(function () {self.setState({ firstSearchDone: true });}, 3000);
        }
        e.preventDefault();
        Actions.searchVoter(this.props.dispatch, this.state.serialNumber)
    }
    addVoteToVoter(e) {
        e.preventDefault();
        Actions.addVoteToVoter(this.props.dispatch, this.props.voterData);
        this.setState({ serialNumber: '' });
        this.inputRef.current.focus();
    }
    cancelVoteToVoter(voter_key, voter_serial_number) {
        let voterSerialNumber = this.state.serialNumber == voter_serial_number ? voter_serial_number : null;
        Actions.cancelVoteToVoter(this.props.dispatch, voter_key, voterSerialNumber);
    }
    cleanSerialNumber() {
        this.props.dispatch({ type: Actions.ActionTypes.SET_VOTER_DATA, voterData: null });
        this.setState({ serialNumber: '' });
        this.inputRef.current.focus();
    }
    render() {
        let validSerialNumber = this.checkSerialNumber()
        let voterData = this.props.voterData;
        let inputStyle = validSerialNumber ? { display: 'inline-block' } : { display: 'inline-block', borderColor: 'red' };
        return (
            <div style={{ marginTop: '10px' }}>
                <ActivistReporterData currentUser={this.props.currentUser}></ActivistReporterData>
                <div className="row section" style={{ marginTop: '10px' }}>
                    <div className="col-md-12">
                            <div className="row">
                                <div className="col-xs-8">
                                    <h3 className="text-primary">מספר מצביע</h3>
                                </div>
                            </div>
                            <div className="row form-group">
                                <div className="col-xs-8">
                                    <input type="number" ref={this.inputRef} className="form-control" value={this.state.serialNumber} onChange={this.onChangeSerialNumber.bind(this)} style={inputStyle} />
                                </div>
                                <div className="col-xs-4">
                                    <button disabled={!validSerialNumber} type="submit" className="btn btn-block btn-primary" onClick={this.searchVoter.bind(this)}>הצג בוחר</button>
                                </div>
                            </div>
                    </div>
                    {voterData && <VoterResult
                        voterData={voterData}
                        ballot_mi_id={this.props.currentUser.ballot_mi_id}
                        voterAfterVoting={this.props.voterAfterVoting}
                        cleanSerialNumber={this.cleanSerialNumber.bind(this)}
                        addVoteToVoter={this.addVoteToVoter.bind(this)}
                    />}
                    {(this.state.firstSearchDone && !voterData) &&
                        <h4 className="col-xs-12 text-warning">לא נמצא בוחר עם מספר זה</h4>
                    }
                    <VotingReportHistory
                        votingReportHistoryList={this.props.votingReportHistoryList}
                        cancelVoteToVoter={this.cancelVoteToVoter.bind(this)}
                    />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        voterData: state.voterData,
        votingReportHistoryList: state.votingReportHistoryList,
        voterAfterVoting: state.voterAfterVoting,
    };
}
export default connect(mapStateToProps)(SearchVoterScreen);

