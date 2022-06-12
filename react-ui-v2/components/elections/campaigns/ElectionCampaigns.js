import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import ElectionCampaignItem from './ElectionCampaignItem';

import * as SystemActions from 'actions/SystemActions';
import * as ElectionsActions from 'actions/ElectionsActions';

class ElectionCampaigns extends React.Component {
    constructor(props) {
        super(props);
        this.initConstants();
    }

    componentWillMount() {
        if (this.props.currentUser.first_name.length > 0) {
            if (!this.props.currentUser.admin && this.props.currentUser.permissions['elections.campaigns'] != true) {
                this.props.router.push('/unauthorized');
            }
        }

        ElectionsActions.loadElectionCampaignsForManagement(this.props.dispatch);
        ElectionsActions.loadCurrentCampaignForManagement(this.props.dispatch);

        this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'ניהול תקופת בחירות'});
    }

    componentWillReceiveProps(nextProps) {
        if (0 == this.props.currentUser.first_name.length && nextProps.currentUser.first_name.length > 0) {
            if (!nextProps.currentUser.admin && nextProps.currentUser.permissions['elections.campaigns'] != true) {
                this.props.router.push('/unauthorized');
            }
        }
    }

	/*
		Init constant variables
	*/
    initConstants() {
        this.addButtonText = " הוסף מערכת בחירות";
    }

	/*
		Redirect to edit campaign page
	*/
    redirectToEditCampaign(campaignKey) {
        this.props.router.push('elections/campaigns/' + campaignKey);
    }

	/*
		Redirect to add new campaign page
	*/
    addElectionCampaign() {
        this.props.router.push('elections/campaigns/new');
    }

	/*
		Function that renders in loop all elections campaigns
	*/
    renderElectionsCampaigns() {
        let that = this;
        let editPermission = (this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.edit'] == true);
        let currentCampignId = 0;

        if ( this.props.currentCampaign.id != undefined ) {
            currentCampignId = this.props.currentCampaign.id;
        }

        let campaigns = this.props.electionsCampaigns.map( function (item, index) {
            return <ElectionCampaignItem key={item.key} campaignIndex={index} item={item}
                                         currentCampignId={currentCampignId} editPermission={editPermission}
                                         redirectToEditCampaign={that.redirectToEditCampaign.bind(that)}/>
        });

        return <tbody>{campaigns}</tbody>;
    }

	/*
		Dynamicly render 'add' button
	*/
    renderAddButton() {
        if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.add'] == true ) {
            return (
                <button className="btn new-btn-default btn-sm" onClick={this.addElectionCampaign.bind(this)}>
                    {this.addButtonText}
                </button>
            );
        } 
		else {
            return '\u00A0';
        }
    }

    render() {
		 
        return (
            <div className="stripMain">
				<h1>ניהול תקופת בחירות</h1>
                <div className="container">
                    <div className="dtlsBox srchRsltsBox box-content first-box-on-page" style={{marginTop:'7px'}}>
                        <div className="row rsltsTitleRow">
                            <div className="col-lg-8 col-md-10">
                                <div className="periods-list-title">רשימת תקופות במערכת </div>
                            </div>
                            <div className=" col-md-2 pull-left text-left ">{this.renderAddButton()}</div>
                        </div>

                        <div className="table-container">
                            <table className="table line-around table-striped">
                                <thead>
                                <tr>
                                    <th>מס"ד</th>
                                    <th>שם מערכת בחירות</th>
                                    <th>סוג מערכת בחירות</th>
                                    <th>תאריך יום בחירות</th>
                                    <th>שעת התחלת הצבעה</th>
                                    <th>שעת סיום הצבעה</th>
                                    <th className="text-center">מערכת פעילה</th>
                                    <th width="50px">{'\u00A0'}</th>
                                </tr>
                                </thead>
                                {this.renderElectionsCampaigns()}
								{ (this.props.electionsCampaigns.length == 0) &&
                                    <tbody>
                                        <tr>
                                            <td colSpan="8" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים... </td>
                                        </tr>
                                    </tbody>
								}
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
        currentUser: state.system.currentUser,
        electionsCampaigns: state.elections.electionsCampaignsScreen.combos.electionsCampaigns,
        currentCampaign: state.elections.electionsCampaignsScreen.currentCampaign
    };
}

export default connect(mapStateToProps) (withRouter(ElectionCampaigns));