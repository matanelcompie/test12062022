import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import ReactWidgets from 'react-widgets';
import {dateTimeReversePrint, parseDateToPicker, parseDateFromPicker} from '../../../libs/globalFunctions';
import Combo from '../../global/Combo';

import ModalAddPhoneToVoter from 'components/global/ModalAddPhoneToVoter';
import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';


class VoterBallotItem extends React.Component {

    constructor(props) {
        super(props);
		this.state={addNewPhoneComponent:false};
        this.initConstants();
    }

    initConstants() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        this.transportList = [
            {id: 1, name: 'כן', value: 0},
            {id: 2, name: 'נכה', value: 1}
        ];

        this.placholders = {
            transportDate: 'dd/mm/yyyy hh:mm'
        };

        this.didVoteList = [
            {value: 0, name: 'לא'},
            {value: 1, name: 'כן'}
        ];

        this.tooltips = {
            saveButton: "לשמור שינויים",
            enableEditing: "לאפשר עריכה",
            disableEditing: "לבטל שינויים"
        };

        this.setDirtyTarget = "elections.voter.support_and_elections.ballot";
    }

    saveInState() {
		if(this.props.voterPhones.length == 0 && this.props.item.transport_name.trim().length > 0){
			//show popup modal to add phone : 
			this.setState({addNewPhoneComponent:true});
		}
		else{
			//proceede regular : 
			this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
			this.props.dispatch({type: VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.SAVE_IN_STATE});
		}
		 
        
       
    }

    disableEditing() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.DISABLE_ROW_EDITING});

        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget});
    }

    enableEditing() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.ENABLE_ROW_EDITING,
                             rowIndex: this.props.voterCampaignIndex});
    }


    didVoteChange(e) {
        var didVoteName = e.target.value;
        var didVote = "";

        switch ( didVoteName ) {
            case this.didVoteList[0].name: // No
                didVote = this.didVoteList[0].value; // 0
                break;

            case this.didVoteList[1].name: // yes
                didVote = this.didVoteList[1].value; // 1
                break;

            default:
                didVote = -1;
                break;
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.VOTER_DID_VOTE_CHANGE,
                             didVote: didVote, didVoteName: didVoteName});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    transportDateChange(value, format, params) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.TRANSPORT_DATE_CHANGE, timeValue: value,'timeType':params.timeType});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    getTransportName(transportName) {
        let transportIndex = -1;
        let transportCrippled = "";

        transportIndex = this.transportList.findIndex(transportItem => transportItem.name == transportName);
        if ( -1 == transportIndex ) {
            return -1;
        } else {
            transportCrippled = this.transportList[transportIndex].value;
            return transportCrippled;
        }
    }

    transportChange(e) {
        var transportName = e.target.value;
        var transportCrippled = "";

        if ( transportName.length > 0 ) {
            transportCrippled = this.getTransportName(transportName);
        } else {
            transportCrippled = "";
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.TRANSPORT_CHANGE,
                             transportCrippled: transportCrippled,
                             transportdName: transportName });
    }

    renderNonEditingLastColumn(vote_source_name) {
        var displayButton = false;

        if ( this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.voter.support_and_elections.ballot.edit'] == true ) {
            displayButton = true;
        } else {
            displayButton = false;
        }

        if (this.props.enable_editing && displayButton) {
            return (
                <td>
                    {vote_source_name}
                    <span className={this.editButtonClass}>
                        <button type="button" className="btn btn-success btn-xs"
                                title={this.tooltips.enableEditing}
                                onClick={this.enableEditing.bind(this)}>
                            <i className="fa fa-pencil-square-o"/>
                        </button>
                    </span>
                </td>
            );
        } else {
            return (
                <td>
                    {vote_source_name}
                </td>
            );
        }
    }

    getBallotMiId(ballotMiId) {
        var miIdStr = ballotMiId.toString();
        var lastDigit = miIdStr.charAt(miIdStr.length - 1);

        return (miIdStr.substring(0, miIdStr.length - 1) + '.' + lastDigit);
    }

    renderNonEditingModeRow() {
        var index = this.props.ballotIndex;
        let electionCampaign = this.props.item;
        let vote_source_name = '';
        let vote_date = '';
        let voter_transport_date = '';
        let td_voted = '';
        let ballot_address = electionCampaign.cluster_streeet + ', ' + electionCampaign.city_name;

        if ( null == electionCampaign.vote_source_id ) {
            td_voted = 'לא';
        } else {
            td_voted = 'כן';
        }

        if ( null == electionCampaign.vote_source_name ) {
            vote_source_name = '';
        } else {
            vote_source_name = electionCampaign.vote_source_name;
        }

        if ( null == electionCampaign.voter_transport_date ) {
            voter_transport_date = "";
        } else {
            voter_transport_date = electionCampaign.voter_transport_date;
        }

        if ( null == electionCampaign.vote_date ) {
            vote_date = "";
        } else {
            vote_date = dateTimeReversePrint(electionCampaign.vote_date, true, true);
        }
        let fromTime = electionCampaign.voter_transport_from_time ? electionCampaign.voter_transport_from_time.substring(0, 5) : '';
        let toTime = electionCampaign.voter_transport_to_time ? electionCampaign.voter_transport_to_time.substring(0, 5) : '';
        return (
            <tr id={index} key={index}>
                <td>{electionCampaign.election_campaign_name}</td>
                <td>{electionCampaign.cluster_name + ', ' + ballot_address}</td>
                <td>{this.getBallotMiId(electionCampaign.mi_id)}</td>
                <td>{electionCampaign.voter_serial_number == 0 ? '\u00A0' : electionCampaign.voter_serial_number}</td>
                <td>{electionCampaign.transport_name}</td>
                <td>{fromTime}</td>
                <td>{toTime}</td>
                <td>{electionCampaign.reporting == '1' ? 'כן' : 'לא'}</td>
                <td>{td_voted}</td>
                <td>{vote_date}</td>
                {this.renderNonEditingLastColumn(vote_source_name)}
            </tr>
        );
    }

	proceedToAddTrasnportation(){
		 this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
		 this.props.dispatch({type: VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.SAVE_IN_STATE});
		 this.setState({addNewPhoneComponent:false});
	}
	
    renderEditingModeRow() {
        var index = this.props.ballotIndex;
        let electionCampaign = this.props.item;
        let vote_source_name = '';
        let ballot_address = electionCampaign.cluster_streeet + ', ' + electionCampaign.city_name;

        if ( null == electionCampaign.vote_source_name ) {
            vote_source_name = ''
        } else {
            vote_source_name = electionCampaign.vote_source_name;
        }

        let fromTime = electionCampaign.voter_transport_from_time ? electionCampaign.voter_transport_from_time.substring(0, 5) : '';
        let toTime = electionCampaign.voter_transport_to_time ? electionCampaign.voter_transport_to_time.substring(0, 5) : '';

        return (
            <tr id={index} key={index}>
                <td>{electionCampaign.election_campaign_name}</td>
                <td>{electionCampaign.cluster_name + ', ' + ballot_address}</td>
                <td>{this.getBallotMiId(electionCampaign.mi_id)}</td>
                <td>{electionCampaign.voter_serial_number == 0 ? '\u00A0' : electionCampaign.voter_serial_number}</td>
                <td>
                    <Combo items={this.transportList} maxDisplayItems={3} itemIdProperty="id"
                           itemDisplayProperty='name'
                           className="form-combo-table"
                           value={electionCampaign.transport_name}
                           onChange={this.transportChange.bind(this)}
                           inputStyle={this.transportStyle}
                    />
					{this.state.addNewPhoneComponent?
						<ModalAddPhoneToVoter buttonCancel={(e) => this.setState({addNewPhoneComponent:false})} 
											  buttonOK={(e) => this.proceedToAddTrasnportation()}
											  voterKey={this.props.router.params.voterKey}
												/>
							:
						null
					}
                </td>
                <td>
                <ReactWidgets.DateTimePicker
                    isRtl={true}
					format="HH:mm"
                    value={parseDateToPicker(fromTime)}
                    onChange={parseDateFromPicker.bind(this, 
                        { callback: this.transportDateChange, format: "HH:mm", functionParams: { timeType: 'from_time' } })}
                    timeFormat="HH:mm"
                    calendar={false}
                    className="form-group"
                 />
                </td>
                <td>
                <ReactWidgets.DateTimePicker
                    isRtl={true}
					format="HH:mm"
                    value={parseDateToPicker(toTime)}
                    onChange={parseDateFromPicker.bind(this, 
                        { callback: this.transportDateChange, format: "HH:mm", functionParams: { timeType: 'to_time' } })}
                    timeFormat="HH:mm"
                    calendar={false}
                    className="form-group"
					style={this.toDateStyle}
                 />
                </td>
                <td>{electionCampaign.reporting == '1' ? 'כן' : 'לא'}</td>
                <td>
                    <Combo items={this.didVoteList} maxDisplayItems={3}
                           itemIdProperty="value"
                           itemDisplayProperty='name'
                           className="form-combo-table"
                           value={electionCampaign.did_vote_name}
                           onChange={this.didVoteChange.bind(this)}
                           inputStyle={this.didVoteStyle}
                    />
                </td>
                <td>{'\u00A0'}</td>
                <td>
                    <span className={this.editButtonClass}>
                        <button type="button" className="btn btn-success btn-xs"
                                title={this.tooltips.saveButton}
                                onClick={this.saveInState.bind(this)}
                                disabled={this.saveButtonDisabled}>
                            <i className="fa fa-floppy-o"/>
                        </button>
                        {'\u00A0'}
                        <button type="button" className="btn btn-danger btn-xs"
                                title={this.tooltips.disableEditing}
                                onClick={this.disableEditing.bind(this)}>
                            <i className="fa fa-times"/>
                        </button>
                    </span>
                </td>
            </tr>
        );
    }

    initVariables() {
        this.transportStyle = {
            borderColor: this.borderColor.valid
        };

        this.didVoteStyle = {
            borderColor: this.borderColor.valid
        };
		
		this.toDateStyle = {
            borderColor: this.borderColor.valid
        };

        this.editButtonClass = "pull-left edit-buttons hidden";
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.editButtonClass = "pull-left edit-buttons btn-xs";
            return;
        }

        if (this.props.currentUser.permissions['elections.voter.support_and_elections.ballot.edit'] == true) {
            this.editButtonClass = "pull-left edit-buttons btn-xs";
        }
    }

    validateDidVote() {
        var didVote = this.props.item.did_vote;

        if ( -1 == didVote ) {
            return false;
        } else {
            return true;
        }
    }
	
	 validateToDate() {
        let electionCampaign = this.props.item;
		let fromTime = electionCampaign.voter_transport_from_time ? electionCampaign.voter_transport_from_time.substring(0, 5) : '';
        let toTime = electionCampaign.voter_transport_to_time ? electionCampaign.voter_transport_to_time.substring(0, 5) : '';
		
		if(toTime && fromTime > toTime){
			  return false;
		}
		else{
			return true;
		}
	}

    validateTransport() {
        var transportdName = this.props.item.transport_name;
        var crippled = this.props.item.voter_transport_crippled;

        if ( 0 == transportdName.length ) {
            return true;
        }

        if ( -1 == crippled ) {
            return false;
        } else {
            return true;
        }
    }

    validateVariables() {
        this.validInputs = true;

        if ( !this.validateTransport() ) {
            this.transportStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.transportStyle.borderColor = this.borderColor.valid;
        }

        if ( !this.validateDidVote() ) {
            this.didVoteStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.didVoteStyle.borderColor = this.borderColor.valid;
        }
		
		if(!this.validateToDate()){
			this.toDateStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
		}
		else{
			this.toDateStyle.borderColor = this.borderColor.valid;
		}
		
        this.saveButtonDisabled = !this.validInputs;
    }

    render() {
        this.initVariables();

        this.checkPermissions();

        this.validateVariables();

        let entity_mode = this.props.editing_mode;

        if ( this.props.item.election_campaign_end_date == null ) {
            if ( entity_mode ) {
                return this.renderEditingModeRow();
            } else {
                return this.renderNonEditingModeRow();
            }
        } else {
            let currentDate = new Date();

            var seconds = currentDate.getSeconds();
            var minutes = currentDate.getMinutes();
            var hour = currentDate.getHours();

            let year = currentDate.getFullYear();
            let month = currentDate.getMonth() + 1;
            let day = currentDate.getDate();

            let currentDateStr =  year + '-' + month + '-'  + day + ' ' + hour + ':' + minutes + ':' + seconds;

            if ( currentDateStr > this.props.item.election_campaign_end_date) {
                return this.renderNonEditingModeRow();
            } else {
                if ( entity_mode ) {
                    return this.renderEditingModeRow();
                } else {
                    return this.renderNonEditingModeRow();
                }
            }
        }
    }
}


function mapStateToProps(state) {
    return {
        electionVoteSources: state.voters.voterScreen.electionVoteSources,
        currentUser: state.system.currentUser,
		voterPhones: state.voters.voterDetails.phones,
    }
}

export default connect(mapStateToProps)(withRouter(VoterBallotItem));