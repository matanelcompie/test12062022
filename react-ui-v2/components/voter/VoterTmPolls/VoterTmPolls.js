import React from 'react';
import { connect } from 'react-redux';

import * as VoterActions from '../../../actions/VoterActions';
import SmallAudio from 'tm/components/common/SmallAudio'


class VoterTmPolls extends React.Component {
    constructor(props) {
        super(props);
		this.state = {statusesArray:[]};
    }

 
 
    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }

		this.panelTitle = "סקרים";
        this.pollsClass = "col-sm-12 hidden";
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.pollsClass = "col-sm-12";
            return;
        }

        if (this.props.currentUser.permissions['elections.voter.polls'] == true) {
            this.pollsClass = "col-sm-12";
        }
    }
	
	componentWillReceiveProps(nextProps){
		if(nextProps.polls.length > 0 && this.props.polls.length != nextProps.polls.length){
			console.log("loaded all polls");
			this.setState({statusesArray : (new Array(nextProps.polls.length).fill(0))});	
		}
	}
	
	changeExpansitonStatus(index){
		let statusesArray = this.state.statusesArray;
		statusesArray[index] = statusesArray[index] ^ 1; //xor operation that alternates 1 and 0
		this.setState({statusesArray});
	}
	
	formatDateTime(dt){
		let partsOfDatetime = dt.split(' ');
		return (partsOfDatetime[0].split("-").reverse().join("/") + "  " + partsOfDatetime[1]);
	}

    render() {
		 
        this.initVariables();
        this.checkPermissions();
		let self = this;
        return (
            <div className="tab-content tabContnt" id="tabGeneral" style={this.blockStyle}>
                 <div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">
						<div className="containerStrip">
							<div className="row panelTitle">
								{this.panelTitle}   
							</div>
							 <div className="row panelContent">
                            <table className="table table-bordered table-striped">
                                <thead>
                                <tr>
                                    <th>מס' קמפיין</th>
                                    <th>שם קמפיין</th>
                                    <th>תאריך</th>
                                    <th>נציג</th>
                                    <th>מספר טלפון</th>
                                    <th>משך שיחה</th>
                                    <th>סיכום שיחה</th>
                                    <th>קובץ קול</th>
                                    <th>מענה לשאלון</th>
                                </tr>
                                </thead>
								<tbody>
                                {this.props.polls.map(function(item,index){
									 
									let subRow=[];
									if(self.state.statusesArray[index] == 1){
										subRow = <tr key={"subRow"+index}>
													<td colSpan="8">
														<br/>
														<div className="call-details-box-in">
															{item.questions.length > 0 && <div className="col-md-6 details-box-title">שם שדה / שאלה</div>}
															{item.questions.length > 0 &&<div className="col-md-6 details-box-title">תשובה</div>}
															{item.questions.length > 0 &&
																item.questions.map(function(q_item ,q_index){
																	return (<div className="details-call-line" key={"subrRow"+index+"question"+q_index}  >
																				<div className="col-md-6 details-box-text font-600">{q_item.text_general}</div>
																				<div className="col-md-6 details-box-text">{q_item.answer_text}</div>
																			</div>)
																})
															}
															<div className="details-call-remark">הערה : {item.note || "-"} </div>
														</div>
													</td>
												</tr>;
										return([<tr key={"mainRow"+index}>
												<td>{item.campaign_id}</td>
												<td>{item.campaign_name}</td>
												<td>{self.formatDateTime(item.created_at)}</td>
												<td>{item.agent_name}</td>
												<td>{item.phone_number}</td>
												<td>{item.call_duration_seconds ? item.call_duration_seconds.substr(3) : ''}</td>
												<td>{item.call_end_status}</td>
												<td>{item.audio_file_name? <SmallAudio audioFileName={item.audio_file_name} campaign_id={item.campaign_id}/> : "" }</td>
												<td>
													{(item.answered_poll == 1 ? 'כן' : (item.answered_poll == 0 ? 'לא':'הערה'))} &nbsp;&nbsp;
														{(item.answered_poll != 0)  &&  <button type="button" className="btn btn-primary btn-sm" onClick={self.changeExpansitonStatus.bind(self , index)}>{self.state.statusesArray[index] ? '- סגור' : '+ פירוט'}</button>}

												</td>
										   </tr> , subRow] )
									}
									else{
										return(<tr key={"mainRow"+index}>
												<td>{item.campaign_id}</td>
												<td>{item.campaign_name}</td>
												<td>{self.formatDateTime(item.created_at)}</td>
												<td>{item.agent_name}</td>
												<td>{item.phone_number}</td>
												<td>{item.call_duration_seconds ? item.call_duration_seconds.substr(3) : ''}</td>
												<td>{item.call_end_status}</td>
												<td>{item.audio_file_name? <SmallAudio audioFileName={item.audio_file_name} campaign_id={item.campaign_id}/> : "" }</td>
												<td>
													{(item.answered_poll == 1 ? 'כן' : (item.answered_poll == 0 ? 'לא':'הערה'))} &nbsp;&nbsp;
														{(item.answered_poll != 0)  &&  <button type="button" className="btn btn-primary btn-sm" onClick={self.changeExpansitonStatus.bind(self , index)}>{self.state.statusesArray[index] ? '- סגור' : '+ פירוט'}</button>}

												</td>
										   </tr>);
									}
								})}
								</tbody>
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
		polls: state.voters.voterScreen.polls,
	}
}

export default connect(mapStateToProps)(VoterTmPolls);