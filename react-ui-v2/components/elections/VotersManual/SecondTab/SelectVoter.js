import React from 'react';
import { connect } from 'react-redux';

import * as ElectionsActions from 'actions/ElectionsActions';


class SelectVoter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            personal_identity: '',
            voter_key: '',
        };

        this.initConstants();
    }

    initConstants() {
        this.invalidColor = '#cc0000';

        this.buttonText = 'הוסף';
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedVoter &&  !this.props.loadedSelectedVoter && nextProps.loadedSelectedVoter &&
            Object.keys(nextProps.selectedVoter).length > 0 ) {
            this.getSelectedVoter(nextProps.selectedVoter.key);
        }
    }

    getSelectedVoter(voterKey) {
        this.setState({ personal_identity: '' ,voter_key: ''});

        ElectionsActions.getSelectedVoter(this.props.dispatch, voterKey);
    }

    /*
	   Function that handles pressing "enter" in identity of voter field
	*/
    handleKeyPress(fieldName, event) {

        let value = this.state[fieldName];
        if ( event.charCode == 13 && (this.validateSearchField(fieldName) && !this.isVoterAlreadySelected(fieldName)) ) { /*if user pressed enter*/
            ElectionsActions.getVoterByIdentityOrKey(this.props.dispatch, value, fieldName, 2); //performing search of voter by identity
        }
    }

    onChange(fieldName, event) {
        let newState = { ...this.state }

        let value = event.target.value;
        newState[fieldName] = value;
        this.setState(newState);
        
        this.props.updateSelectedVoterError(this.isVoterAlreadySelected(fieldName ,value));
    }

    isVoterAlreadySelected(fieldName, value = null){
        let fieldValue = (value !== null)  ? value : this.state[fieldName];
        let fieldToCheck = fieldName == 'voter_key' ? 'key' : fieldName;
        let voterExist = this.props.isVoterAlreadySelected(fieldToCheck, fieldValue)
        if(voterExist){
            this[fieldName + '_input_style'] = {borderColor: this.invalidColor};
        }
        return voterExist;
    }

    validateSearchField(fieldName) {
        let validInput = this.state[fieldName].length > 0;
        if(!validInput){
            this[fieldName + '_input_style'] = {borderColor: this.invalidColor};
        }
        return validInput;
    }

    validateVariables() {
        this.validInput = true;

        if ( !this.validateSearchField('personal_identity') && !this.validateSearchField('voter_key') ) {
            this.validInput = false;
        } else if ( this.isVoterAlreadySelected('personal_identity' ) || this.isVoterAlreadySelected('voter_key' ) ) {
            this.validInput = false;
        }
    }

    initVariables() {
        this.personal_identity_input_style = {};
        this.voter_key_input_style = {};
    }

    getSearchVoterImgStyle() {
        if ( this.props.savedSelectedVotersFlag ) {
            return {};
        } else {
            return {cursor: 'pointer'};
        }
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className={"row nomargin" + (this.props.display ? '' : ' hidden')}>
                <div className="col-lg-12">
                    <div className="padding30">
                        <div className="col-lg-5 form-group">
                            <label htmlFor="voters-manual-second-tab-voter" className="col-sm-4 control-label">ת.ז. תושב</label>
                            <div className="col-sm-7">
                                <input type="text" className="form-control" id="voters-manual-second-tab-voter"
                                       style={this.personal_identity_input_style} value={this.state.personal_identity}
                                       onChange={this.onChange.bind(this, 'personal_identity')} onKeyPress={this.handleKeyPress.bind(this, 'personal_identity')}
                                         aria-describedby="helpBlock"/>
									   {(!this.props.selectedVoter &&  this.props.loadedSelectedVoter) &&
									   <div style={{color:'#ff0000' , fontWeight:'bold'}}>
											תושב לא נמצא
									   </div>
									   }
                            </div>
                            <div className="col-sm-1 srchIcon">
                                <img src={window.Laravel.baseURL + "Images/ico-search-blue.svg"} title="חפש תושב"
                                     style={this.getSearchVoterImgStyle()}
                                     onClick={this.props.showVoterSourceModal.bind(this)}/>
                            </div>
                        </div>
                        <div className="col-lg-5 form-group">
                            <label htmlFor="voters-manual-second-tab-voter-key" className="col-sm-4 control-label">קוד תושב</label>
                            <div className="col-sm-7">
                                <input type="text" className="form-control" id="voters-manual-second-tab-voter-key"
                                       style={this.voter_key_input_style} value={this.state.voter_key}
                                       onChange={this.onChange.bind(this, 'voter_key')} onKeyPress={this.handleKeyPress.bind(this, 'voter_key')}
                                         aria-describedby="helpBlock"/>
									   {(!this.props.selectedVoter &&  this.props.loadedSelectedVoter) &&
									   <div style={{color:'#ff0000' , fontWeight:'bold'}}>
											תושב לא נמצא
									   </div>
									   }
                            </div>
                            <div className="col-sm-1 srchIcon">
                                <img src={window.Laravel.baseURL + "Images/ico-search-blue.svg"} title="חפש תושב"
                                     style={this.getSearchVoterImgStyle()}
                                     onClick={this.props.showVoterSourceModal.bind(this)}/>
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
        loadedSelectedVoter: state.elections.votersManualScreen.secondTab.loadedVoter,
        selectedVoter: state.elections.votersManualScreen.secondTab.voter,

        savedSelectedVotersFlag: state.elections.votersManualScreen.savedSelectedVotersFlag
    }
}

export default connect(mapStateToProps) (SelectVoter);