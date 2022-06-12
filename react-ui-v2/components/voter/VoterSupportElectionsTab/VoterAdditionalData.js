import React from 'react';
import {withRouter} from 'react-router';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import VoterMetaDataItem from './VoterMetaDataItem';
import SearchFiftyMinisterModal from 'components/global/Captain50SearchModal/SearchFiftyMinisterModal';

class VoterAdditionalData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // Boolean that shows
            // search captain50 modal
            captain50SearchModal:false
        };

        this.initConstants();
    }

    initConstants() {
        this.subHeader = "מידע נוסף";

        this.ministerOfFiftyHeader = "שר-מאה";
        this.screenPermission = 'elections.voter.support_and_elections.election_activity.additional_data';
    }

    renderMetaDataItems() {
        var metaDataKeys = this.props.metaDataVolunteerKeys;
        var voterMetaHash = this.props.voterMetaHash;
        var metaValuesHashByKeyId = this.props.metaValuesHashByKeyId;
      
        let metaDataRows = metaDataKeys.map(function(metaKeyItem, index) {
            let metaKeyId = metaKeyItem.id;

            let voterDataItem = voterMetaHash[metaKeyId];
            let metaValuesItems = [];
 
            switch ( metaKeyItem.key_type ) {
                case 0: // List values of meta key
			 
                    if ( metaValuesHashByKeyId[metaKeyId] != undefined ) {
                        metaValuesItems = metaValuesHashByKeyId[metaKeyId];
                    } else {
                        metaValuesItems = [];
                    }

                    if ( metaValuesHashByKeyId[metaKeyId] != undefined ) {
			 
                        return (
                            <VoterMetaDataItem key={metaKeyId} metaKeyId={metaKeyId}
                                               metaKeyItem={metaKeyItem}
                                               metaValuesItems={metaValuesItems}
                                               voterDataItem={voterDataItem}/>
                        );
                    } else {
						
                        return (
                            <div className="row" key={metaKeyId}>{metaKeyItem.key_name}</div>
                        );
                    }
                    break;

                case 1: // Free text meta value
                case 2: // Number meta value
                    metaValuesItems = [];

                    return (
                        <VoterMetaDataItem key={metaKeyId} metaKeyId={metaKeyId}
                                           metaKeyItem={metaKeyItem}
                                           metaValuesItems={metaValuesItems}
                                           voterDataItem={voterDataItem}/>
                    );
                    break;
            }
        });

        return metaDataRows;
    }
	
	hideCaptain50SearchModal() {
        this.setState({captain50SearchModal:false});
    }

	/*
		shows modal popup with searching for minister of fifty
	*/
    showCaptain50SearchModal() {
        this.setState({captain50SearchModal:true});
    }
	
	saveMinisterOf50( captainName, captainKey){
		this.hideCaptain50SearchModal();

		this.props.allocateVoterToCaptain50(captainKey);
		// this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: "elections.voter.support_and_elections.election_activity"});
	}

	/**
     * This function checks if the
     * captain50's allocation is locked.
     * If it's locked it renders the lock
     * icon, else it renders the delete button
	 */
	renderCaptain50Button() {
        const titles = {
            edit: 'ערוך',
            locked: 'השיבוץ נעול'
        };
        const lockIcon = window.Laravel.baseURL + 'Images/lock.png';

	    if ( this.props.ministerOfFifty.user_lock_id == null ) {
            return (
                <button type="button" className="btn btn-danger btn-xs"
                        onClick={this.props.unAllocateVoterToCaptain50.bind(this)}>
                    <i className="fa fa-trash-o"/>
                </button>
            );
        } else {
            return (
                <span title={titles.locked}>
                    <img data-toggle="tooltip" data-placement="left" title={titles.locked} src={lockIcon}
                         data-original-title={titles.locked}/>
                </span>
            );
        }
    }

    renderMinisterOfFifty() {
        if ( Object.keys(this.props.ministerOfFifty).length == 0 || !this.props.ministerOfFifty.first_name) {
            return (
                <div className="panel-heading">
                    <SearchFiftyMinisterModal show={this.state.captain50SearchModal}
                        screenPermission={this.screenPermission}
                        hideSearchFiftyMinisterModal={this.hideCaptain50SearchModal.bind(this)}
                        saveMinisterOf50={this.saveMinisterOf50.bind(this)} />
                    {this.ministerOfFiftyHeader}:
                    <a title='איתור שר 100' style={{ cursor: 'pointer', marginRight: '10px' }}
                        onClick={this.showCaptain50SearchModal.bind(this)}>
                        <i className="fa fa-search"></i>
                    </a>
                </div>
            );
        } else {
            return (
                <div className="panel-heading">
                    {this.ministerOfFiftyHeader}:
                    <span style={{fontWeight: 'normal', marginRight:'5px'}}>
                        {this.captainOfFiftyName}
                    </span>
                    &nbsp;&nbsp;&nbsp;
                    {this.renderCaptain50Button()}
                </div>
            );
        }
    }

    initVariables() {
        // console.log(this.props.ministerOfFifty);
        if (this.props.ministerOfFifty != null)  {
            let first_name = this.props.ministerOfFifty.first_name ? this.props.ministerOfFifty.first_name : '';
            let last_name = this.props.ministerOfFifty.last_name ? this.props.ministerOfFifty.last_name : '';
            let city = this.props.ministerOfFifty.city ?  ', ' + this.props.ministerOfFifty.city : '';
            this.captainOfFiftyName = first_name + ' '+ last_name + city;
        } else {
            this.captainOfFiftyName = '';
        }

        this.captainOfFiftyClass = "pull-left edit-buttons hidden";
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.captainOfFiftyClass = "pull-left edit-buttons";

            return;
        }

        if ( this.props.currentUser.permissions[this.screenPermission + '.edit'] == true ) {
            this.captainOfFiftyClass = "pull-left edit-buttons";
        }
    }

    render() {
 
        this.initVariables();

        this.checkPermissions();

        return(
            <div className="col-sm-12">
                <div className="subHeader">
                    <h4>{this.subHeader}</h4>
                </div>

                <div className="panel panel-default">
                    {this.renderMinisterOfFifty()}

                    <div className="panel-body">
                        {this.renderMetaDataItems()}
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        metaDataVolunteerKeys: state.voters.voterScreen.metaDataVolunteerKeys,
        metaDataValues: state.voters.voterScreen.metaDataValues,
        voterMetaHash: state.voters.voterScreen.voterMetaHash,
        metaValuesHashByKeyId: state.voters.voterScreen.metaValuesHashByKeyId,
        metaValuesHashByValueId: state.voters.voterScreen.metaValuesHashByValueId,
        ministerOfFifty : state.voters.activistScreen.ministerOfFifty,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps) (withRouter(VoterAdditionalData));