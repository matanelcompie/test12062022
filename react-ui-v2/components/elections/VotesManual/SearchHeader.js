import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../actions/ElectionsActions';
import * as SystemActions from '../../../actions/SystemActions';
import Combo from '../../global/Combo';

class SearchHeader extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
    }
	
	/*
	function that initializes constant variables 
	*/
    initConstants() {
         this.displayButtonStyle={marginTop:'20px'};
		 this.mainPanelStyle={minHeight:'143px' , paddingTop:'20px'};
		 this.mainWrapperStyle={paddingTop:'20px'};
		 this.cleanButtonStyle={paddingTop:'37px' , fontSize:'16px' , cursor:'pointer'};
		 this.screenName = "עדכון הצבעה";
	}
	
	/*
	Clean screen function
	*/
	cleanScreen(){
		 this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.CLEAN_SCREEN});
		 if(this.props.router.params.voterKey){
			 this.props.router.push('elections/votes/manual');
		 }
	}
	
	/*
	Function that handles change event inside cities combo box
	*/
	changeCityValue(e){
		this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE , fieldName:'selectedCity' , fieldValue: {selectedValue : e.target.value , selectedItem:e.target.selectedItem}});
		if(e.target.selectedItem){
			ElectionsActions.loadBallotsByCity(this.props.dispatch , e.target.selectedItem.key);
		}
		else{
			this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE , fieldName:'ballotBoxes' , fieldValue: []});
		}
		this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE , fieldName:'selectedBallotBox' , fieldValue: {selectedValue : '' , selectedItem:null}});
		this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE , fieldName:'selectedVoterNumber' , fieldValue: ''});
		this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE , fieldName:'possibleVoters' , fieldValue: []});
	}	
	
	/*
	Function that handles change event inside ballot boxes
	*/
	changeBallotValue(e){
		this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE , fieldName:'selectedBallotBox' , fieldValue: {selectedValue : e.target.value , selectedItem:e.target.selectedItem}});
		if(e.target.selectedItem){
			ElectionsActions.loadElectorsOfBallots(this.props.dispatch , e.target.selectedItem.key);
		}
		else{
			this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE , fieldName:'possibleVoters' , fieldValue: []});
		}
		this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE , fieldName:'selectedVoterNumber' , fieldValue: ''});
		
	}
	
	/*
	Function that handles voter's serial number (1...1000) change  - at left side : 
	*/
	voterSerialNumberChange(e){
		if(e.target.value == '0' || parseInt(e.target.value) > 1000  || !new RegExp('^[0-9]*$').test(e.target.value) || parseInt(e.target.value) > this.props.searchScreen.possibleVoters.length){return;} // allow only numbers in the field
		this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE , fieldName:'selectedVoterNumber' , fieldValue: e.target.value});
	}
	
	/*
	Function that handles voter's personal identity change
	*/
	voterPersonalIdentityChange(e){
		if(e.target.value == '0' || !new RegExp('^[0-9]*$').test(e.target.value)){return;} // allow only numbers in the field
		this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE , fieldName:'selectedVoterIdentityNumber' , fieldValue: e.target.value});
	}
	
	/*
	Handles left 'show' button click - goto voter from voter serial number
	*/
	gotoVoterBySerialNumber(){
		let selectedVoterNumber = this.props.searchScreen.selectedVoterNumber;
		let currentVoter = this.props.searchScreen.possibleVoters[parseInt(selectedVoterNumber) - 1];
		if(currentVoter.voter_serial_number != selectedVoterNumber){
			currentVoter = this.props.searchScreen.possibleVoters.find((item) => {
				return item == item.voter_serial_number
			}) 
		}
		let selectedVoterKey = currentVoter.key;

		ElectionsActions.loadManualVotesScreenVoter(this.props.dispatch , this.props.router , selectedVoterKey);
		this.props.router.push('elections/votes/manual/'+selectedVoterKey);
		//this.props.dispatch({type:ElectionsActions.ActionTypes.MANUAL_VOTES.CLEAN_SEARCH_SCREEN});
	}
	
 	/*
	Handles left 'show' button click - goto voter from voter's personal identity - only if exists
	*/
	gotoVoterByPersonalIdentity(){
		ElectionsActions.manualScreenSearchVoterByIdentity(this.props.dispatch , this.props.router , this.props.searchScreen.selectedVoterIdentityNumber);
	}
	
	/*handle key press "enter" at personal identity field */
    handlePersonalIdentityKeyPress(event) {
        if (event.charCode == 13) { /*if user pressed enter*/
            if(this.props.searchScreen.selectedVoterIdentityNumber == '' || this.props.searchScreen.selectedVoterIdentityNumber.length < 2){
				return;
			}
			this.gotoVoterByPersonalIdentity();
        }
    }
	
		
	/*handle key press "enter" at voter serial number field */
    handleSerialNumberKeyPress(event) {
        if (event.charCode == 13) { /*if user pressed enter*/
            if(this.props.searchScreen.selectedVoterNumber == ''){
				return;
			}
			this.gotoVoterBySerialNumber();
        }
    }
 
    render() {
        return (
	 
			  <div className="row">
                        <div className="col-lg-3">
                            <div className="row">
                                <div className="dtlsBox srchRsltsBox clearfix" style={this.mainPanelStyle}>
                                    <div className="form-horizontal">
                                        <div className="form-group nomargin">
										    <div className="row">
												<label htmlFor="city" className="col-lg-4 control-label">ת"ז</label>
												<div className="col-lg-8">
													<input type="text" className="form-control"  value={this.props.searchScreen.selectedVoterIdentityNumber} onChange={this.voterPersonalIdentityChange.bind(this)} maxLength={9} onKeyPress={this.handlePersonalIdentityKeyPress.bind(this)} />
												</div>
											</div>
											<div className="row">
												<div className="col-lg-12">
													<div className="box-button-single">
														<button title="הצג" className="btn btn-primary srchBtn pull-left"  style={this.displayButtonStyle} disabled={this.props.searchScreen.selectedVoterIdentityNumber == '' || this.props.searchScreen.selectedVoterIdentityNumber.length < 2} onClick={this.gotoVoterByPersonalIdentity.bind(this)}>הצג</button>
													</div>
												</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-9">
                            <div className="row">
                                <div className="dtlsBox srchRsltsBox clearfix"  style={this.mainPanelStyle}>
                                    <div className="col-lg-4">
                                        <div className="form-horizontal">
                                            <div className="form-group">
                                                <label htmlFor="area" className="col-lg-4 control-label">עיר</label>
                                                <div className="col-lg-8">
                                                    <Combo items={this.props.currentUserGeographicalFilteredLists.cities} value={this.props.searchScreen.selectedCity.selectedValue} onChange={this.changeCityValue.bind(this)}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'   />
												</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="form-horizontal">
                                            <div className="form-group">
                                                <label htmlFor="sub-area" className="col-lg-4 control-label">קלפי</label>
                                                <div className="col-lg-8">
                                                    <Combo items={this.props.searchScreen.ballotBoxes}  value={this.props.searchScreen.selectedBallotBox.selectedValue} onChange={this.changeBallotValue.bind(this)}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'   /> 
												</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="form-horizontal">
                                            <div className="form-group">
                                                <label htmlFor="city-2" className="col-lg-4 control-label">מס' בוחר</label>
                                                <div className="col-lg-8">
                                                    <input type="text" className="form-control" value={this.props.searchScreen.selectedVoterNumber} onChange={this.voterSerialNumberChange.bind(this)} style={{borderColor:(this.props.searchScreen.selectedVoterNumber == '' ? '#ff0000':'#ccc')}} onKeyPress={this.handleSerialNumberKeyPress.bind(this)} />
                                                </div>
                                                <div className="col-lg-12">
												    
                                                    <div className="box-button-single">
														<div className="row">
														    <div className="col-md-6 text-left no-padding"  style={this.cleanButtonStyle} onClick={this.cleanScreen.bind(this)}>
																<a>נקה</a>
															</div>
														    <div className="col-md-6">
																<button title="הצג" className="btn btn-primary srchBtn pull-left" style={this.displayButtonStyle} disabled={this.props.searchScreen.selectedVoterNumber == ''} onClick={this.gotoVoterBySerialNumber.bind(this)}>הצג</button>
															</div>
														</div>
													</div>
                                                </div>
                                            </div>
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
	   searchScreen : state.elections.manualVotesScreen.searchScreen,
	   currentUser: state.system.currentUser,
	   showModalDialog: state.elections.showModalDialog,
       modalHeaderText: state.elections.modalHeaderText,
       modalContentText: state.elections.modalContentText,
	   currentUser: state.system.currentUser,
       currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
    }
}

export default connect(mapStateToProps)(withRouter(SearchHeader));