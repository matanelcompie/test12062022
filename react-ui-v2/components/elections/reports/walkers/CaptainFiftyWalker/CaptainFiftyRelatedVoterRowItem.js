import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Combo from '../../../../global/Combo';
import { isValidComboValue } from '../../../../../libs/globalFunctions';


class CaptainFiftyRelatedVoterRowItem extends React.Component {

    constructor(props) {
        super(props); 
		this.initConstants();
    }
	
	/*
	Init constant variables
	*/
	initConstants(){
		  this.blueBorderStyle={ borderTop:'1px solid #498BB6' , borderBottom:'1px solid #498BB6'};
	}
	
	/*
	init dynamic variable for render() function
	*/
	initDynamicVariables(){
		let currentVoterRow = this.props.currentVoter;
		let currentVoterHousehold = this.props.reportSearchResultsHouseholdHash[currentVoterRow.household_id];
		
		this.isHighlighted = false;
		
		if(this.props.previousRow){
			if(this.props.previousRow.household_id != currentVoterRow.household_id){
				this.isHighlighted = true;
			}
		}
		else{
			this.isHighlighted = true;
		}
		//this.isHighlighted = currentVoterHousehold ? (currentVoterHousehold[0] == this.props.index) : false;
 
		 
	 	this.expandRowItem =  null;
		if(this.props.captain50WalkerReport.displayWithEditOption){
			if(this.props.isEditingVoter == true){
				if(currentVoterRow.expanded == true){
				this.expandRowItem = <a style={{cursor:'pointer'}} onClick={this.props.expandShrinkVoterRow.bind(this, this.props.index , false)}><img src={ window.Laravel.baseURL +  "Images/collapse-circle-open.svg" } /></a>;
				}
			}
			else{
				this.expandRowItem = <a style={{cursor:'pointer'}} onClick={this.props.expandShrinkVoterRow.bind(this, this.props.index , true)}><img src={ window.Laravel.baseURL + "Images/collapse-circle-close.svg"} /></a>;
			}   
		}

		this.commentImageItem=null;
		if(currentVoterRow.comment && currentVoterRow.comment.split(' ').join('') != ''){
			this.commentImageItem = <span><img src={ window.Laravel.baseURL + "Images/yes-comment.png"} style={{cursor:'pointer'}} onClick={this.props.showComment.bind(this,currentVoterRow.comment)} /></span>;
		}
		else
		{
			this.commentImageItem = <span><img src={ window.Laravel.baseURL + "Images/no-comment.png"} /></span>;
		}
		this.isValidSupportStatus = isValidComboValue(this.props.supportStatuses,currentVoterRow.support_status_name, 'name' , true);
			       
	}
	
	/*
	function that returns age by birthDate
	
	@param birthDate - in format yyyy-mm-dd
	*/
	getAgeByBirthDate(birthDate) {
		if(!birthDate) {return "";}
		else{
        var date = new Date();
        var currentYear = date.getFullYear();
        var birthYear = "";
        var arrOfDatElements = [];

        arrOfDatElements = birthDate.split('-');
        birthYear = arrOfDatElements[0];

        if ( null == birthDate ) {
            return '\u00A0';
        } else {
            return currentYear - birthYear;
        }
		}
    }
	
	
	formatBallotValue(ballotBoxId)
	{
	 
		if(!ballotBoxId) {return '';}
		else{
			let ballotBoxStr = ballotBoxId + '';
			if (ballotBoxStr.length == 1) {return ballotBoxStr;}
			else{
				return ballotBoxStr.slice(0, ballotBoxStr.length-1) + '-' + ballotBoxStr.slice(ballotBoxStr.length-1);
				
			}
		}
	}

    getBallotMiId(ballotMiId) {
		if(!ballotMiId){return '';}
        var miIdStr = ballotMiId.toString();
        var lastDigit = miIdStr.charAt(miIdStr.length - 1);

        return (miIdStr.substring(0, miIdStr.length - 1) + '.' + lastDigit);
    }

    render() { 
	    this.initDynamicVariables();
		// let i = this.props.cap50Index;
		let currentVoterRow = this.props.currentVoter;
        return (
			<tr  style={{backgroundColor:(this.isHighlighted ? '#F9F9F9' : ''), textAlign:'right' , color:(this.isHighlighted? '#323A6B' : '' )  , fontWeight:(this.isHighlighted ? 'bold' : '')}}>
				<td className="num"  style={this.isHighlighted ? this.blueBorderStyle:null}>
					<div className="flexed">
						{this.expandRowItem} 
						&nbsp;&nbsp;&nbsp;<span>{currentVoterRow.indexInCaptain}</span>
					</div>
				</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{ ((currentVoterRow.street)? currentVoterRow.street : '') + ' ' + ((currentVoterRow.house && parseInt(currentVoterRow.house) > 0)?currentVoterRow.house:'') + ((currentVoterRow.flat && parseInt(currentVoterRow.flat) > 0) ? '/' + currentVoterRow.flat : '')}</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{currentVoterRow.last_name}</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{currentVoterRow.first_name}</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{currentVoterRow.voter_key}</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{this.getAgeByBirthDate(currentVoterRow.birth_date)}</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{currentVoterRow.first_phone}</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{currentVoterRow.second_phone}</td>
				<td  style={{...this.isHighlighted ? this.blueBorderStyle:null,minWidth:'110px'}}>
				{this.props.captain50WalkerReport.showCurrentSupportStatus ?((this.props.captain50WalkerReport.displayWithEditOption) ? 
					<Combo items={this.props.supportStatuses} maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' value={currentVoterRow.support_status_name} onChange={this.props.editFieldValueChange.bind(this , this.props.index , 'support_status_name')} inputStyle={{borderColor:(this.isValidSupportStatus?'#ccc':'#ff0000')}} /> : currentVoterRow.support_status_name):null}
				</td>
				<td  style={{...this.isHighlighted ? this.blueBorderStyle:null,textAlign:'center'}}>
					{this.props.captain50WalkerReport.displayWithEditOption ? <input type="checkbox" checked={(currentVoterRow.not_at_home == '1' )} onChange={this.props.editFieldValueChange.bind(this , this.props.index , 'not_at_home')} />: currentVoterRow.not_at_home == '1' ? 'כן' : 'לא'}
				</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{currentVoterRow.voter_transportations_id ? (currentVoterRow.crippled=='1'?'נכה':'כן'):'לא'}</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{this.commentImageItem}</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{ currentVoterRow.cluster_street}</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{this.getBallotMiId(currentVoterRow.mi_id)}</td>
				<td  style={this.isHighlighted ? this.blueBorderStyle:null}>{currentVoterRow.voter_serial_number}</td>
			</tr>
        );
    }
	
}


function mapStateToProps(state) {
    return {
		filterItems: state.global.voterFilter.captain50_walker_report.vf.filter_items,
		supportStatuses : state.elections.reportsScreen.captain50WalkerReport.supportStatuses,
		cities:state.system.cities,
		isEditingVoter:state.elections.reportsScreen.captain50WalkerReport.isEditingVoter,
	    modules:state.global.voterFilter.modules,
		captain50WalkerReport:state.elections.reportsScreen.captain50WalkerReport,
		voterFilter:state.global.voterFilter.general_report.vf,
		currentUser: state.system.currentUser,
		reportSearchResults:state.elections.reportsScreen.captain50WalkerReport.reportSearchResults,
		reportSearchResultsHouseholdHash:state.elections.reportsScreen.captain50WalkerReport.reportSearchResultsHouseholdHash,
		loadingSearchResults:state.elections.reportsScreen.captain50WalkerReport.loadingSearchResults,
    }
}

export default connect(mapStateToProps)(withRouter(CaptainFiftyRelatedVoterRowItem));