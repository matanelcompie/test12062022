import React from 'react';
import { connect } from 'react-redux';

import Combo from 'components/global/Combo';

import * as ElectionsActions from 'actions/ElectionsActions';


class DataSource extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataFields: {
                source: {id: null, name: ''},
                personal_identity: '',

                voter: {
                    id: null,
                    key: null,
                    personal_identity: null,
                    first_name: null,
                    last_name: null
                }
            },

            voterSourceModal: {
                show: false
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.invalidColor = '#cc0000';

        this.emptySource = {id: null, name: ''};

        this.buttonText = 'המשך';
    }

    updateVoterDetails(voterDetails) {
        let dataFields = this.state.dataFields;

        dataFields.voter = {
            id: voterDetails.id,
            key: voterDetails.key,
            personal_identity: voterDetails.personal_identity,
            first_name: voterDetails.first_name,
            last_name: voterDetails.last_name
        };

        if ( voterDetails.id != null ) {
            dataFields.personal_identity = voterDetails.first_name + ' ' + voterDetails.last_name;
        }

        this.setState({dataFields});
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.loadedVoter && nextProps.loadedVoter ) {
            this.updateVoterDetails(nextProps.voter);
        }

        if ( this.props.showVoterModal && !nextProps.showVoterModal ) {
            this.updateVoterDetails(nextProps.voterDetails);
        }

        if ( !this.props.cleanData && nextProps.cleanData ) {
            let  dataFields = {
                source: {id: null, name: ''},
                personal_identity: '',

                voter: {
                    id: null,
                    key: null,
                    personal_identity: null,
                    first_name: null,
                    last_name: null
                }
            };
            this.setState({dataFields});

            this.props.resetDataSourceClean();
        }
    }

    updateDataSource(event) {
        // Prevent page refresh
        event.preventDefault();

        let dataSourceObj = {
            source_id: this.state.dataFields.source.id,

            voter: {
                id: this.state.dataFields.voter.id,
                key: this.state.dataFields.voter.key,
                personal_identity:this.state.dataFields.voter.personal_identity,
                first_name: this.state.dataFields.voter.first_name,
                last_name: this.state.dataFields.voter.last_name
            }
        };

        this.props.updateDataSource(dataSourceObj);
    }

    hideVoterSourceModal() {
        let voterSourceModal = this.state.voterSourceModal;

        voterSourceModal.show = false;
        this.setState({voterSourceModal});
    }

    showVoterSourceModal() {
        let voterSourceModal = this.state.voterSourceModal;

        voterSourceModal.show = true;
        this.setState({voterSourceModal});
    }

    searchForVoterByIdentity() {
        ElectionsActions.getVoterByIdentityOrKey(this.props.dispatch, this.state.dataFields.personal_identity, 'personal_identity', 1);
    }

    /*
	   Function that handles pressing "enter" in identity of voter field
	*/
    handleKeyPress(event) {
        if (event.charCode == 13) { /*if user pressed enter*/
		     var regPersonalIdentity = /^[0-9]{2,10}$/;
			 if(!regPersonalIdentity.test(this.state.dataFields.personal_identity)){return ;}
             this.searchForVoterByIdentity(); //performing search of voter by identity
        }
    }

    personalIdentityChange(event) {
        let dataFields = this.state.dataFields;

        dataFields.voter = {
            id: null,
            key: null,
            personal_identity: null,
            first_name: null,
            last_name: null
        };

        dataFields.personal_identity = event.target.value;

        this.setState({dataFields});
    }

    sourceChange(event) {
        let selectedItem = event.target.selectedItem;
        let dataFields = this.state.dataFields;

        if ( null == selectedItem ) {
            dataFields.source = {...this.emptySource, name: event.target.value};
        } else {
            dataFields.source = {
                id: selectedItem.id,
                name: selectedItem.name
            };
        }

        this.setState({dataFields});
    }

    validatePersonalIdentity() {
       return (this.state.dataFields.voter.id != null);
    }

    validateSource() {
        return (this.state.dataFields.source.id != null);
    }

    validateVariables() {
        this.validInput = true;

        if ( !this.validateSource() ) {
            this.validInput = false;
            this.sourceInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validatePersonalIdentity() ) {
            this.validInput = false;
            this.personalIdentityInputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.sourceInputStyle = {};
        this.personalIdentityInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className={"row nomargin" + (this.props.display ? '' : ' hidden')}>
                <div className="col-lg-12">
                    <form className="padding30">
                        <div className="col-lg-5 form-group">
                            <label htmlFor="voters-manual-data-source-source" className="col-sm-4 control-label">מקור הנתונים</label>
                            <div className="col-sm-8">
                                <Combo items={this.props.csvSources}
                                       id="voters-manual-data-source-source"
                                       maxDisplayItems={10}
                                       itemIdProperty="id"
                                       itemDisplayProperty="name"
                                       className="form-combo-table"
                                       inputStyle={this.sourceInputStyle}
                                       value={this.state.dataFields.source.name}
                                       onChange={this.sourceChange.bind(this)}
                                />
                            </div>
                        </div>

                        <div className="col-lg-5 form-group">
                            <label htmlFor="voters-manual-data-source-voter" className="col-sm-4 control-label">ת.ז. מביא הנתונים</label>
                            <div className="col-sm-7">
                                <input type="text" className="form-control" id="voters-manual-data-source-voter"
                                       style={this.personalIdentityInputStyle} value={this.state.dataFields.personal_identity}
                                       onChange={this.personalIdentityChange.bind(this)} onKeyPress={this.handleKeyPress.bind(this)}
                                       aria-describedby="helpBlock"/>
                            </div>
                            <div className="col-sm-1 srchIcon">
                                <img src={window.Laravel.baseURL + "Images/ico-search-blue.svg"} title="חפש תושב"
                                     style={{cursor: 'pointer'}} onClick={this.props.showVoterSourceModal.bind(this)}/>
                            </div>
                        </div>
                        <div className="col-lg-2 nopadding">
                            <button className="btn btn-primary pull-left" disabled={!this.validInput}
                                    onClick={this.updateDataSource.bind(this)}>
                                {this.buttonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        csvSources: state.elections.votersManualScreen.combos.csvSources,
        loadedVoter: state.elections.votersManualScreen.data_source.loadedVoter,
        voter: state.elections.votersManualScreen.data_source.voter
    }
}

export default connect(mapStateToProps) (DataSource);