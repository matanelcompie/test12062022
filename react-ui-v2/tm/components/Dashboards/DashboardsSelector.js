import React from 'react';
import { connect } from 'react-redux';
import * as campaignActions from 'tm/actions/campaignActions';
import {withRouter } from 'react-router';
import ModalWindow from 'tm/components/common/ModalWindow';
import Combo from 'components/global/Combo'


class DashboardsSelector extends React.Component {
    constructor(props) {
        super(props);
		this.state={
			selectedCampaign:{selectedValue:'' , selectedItem:null}
		};
    }
	
	componentWillMount(){
		campaignActions.getAllCampaignsRaw(this.props.dispatch);
	}
	
	componentWillReceiveProps(nextProps){
		if (this.props.currentUser.admin==false && nextProps.currentUser.permissions['tm.dashboard']!=true && this.props.currentUser.permissions['tm.dashboard']!=true && this.props.currentUser.first_name.length>1){          
		   this.props.router.replace('/unauthorized');
        }
	}
	
	/*
		Handles change in campaigns list combo
	*/
	changeCampaign(e){
		this.setState({selectedCampaign:{selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
	}
	
	/*
		Handles clicking button that redirect to tm-campaign
	*/
	redirectToCampaign(){
		this.props.resetToFirstPage();
		campaignActions.getDashboardCampaignDataByParams(this.props.dispatch , this.props.router.params.key , 'agents_work' , campaignActions.types.UPDATE_GLOBAL_FIELD_VALUE , 'agentsWorkDataStats' , null, { load_connected_only:this.props.loadConnectedOnly});	
		this.props.router.push('telemarketing/dashboards/' + this.state.selectedCampaign.selectedItem.key);
	}
	
    render() {
        return (
			<div className="row campain-first-ontainer">
            <div className="row">
			<div className="col-md-6">
			<div className="row">
               <div className="col-md-2">
					שם קמפיין : 
			   </div>
			   <div className="col-md-4">
					 <Combo items={this.props.campaignsList} placeholder={this.props.campaignsList.length ? "בחר קמפיין" :"טוען נתונים..."}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' value={this.state.selectedCampaign.selectedValue}  onChange={this.changeCampaign.bind(this)}  />
			   </div>
			   <div className="col-md-3">
					<button type='submit' className="btn btn-primary srchBtn" onClick={this.redirectToCampaign.bind(this)} disabled={!this.state.selectedCampaign.selectedItem || this.state.selectedCampaign.selectedValue == ''}>בחר</button>
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
        campaignsList: state.tm.campaign.list,
		currentUser: state.system.currentUser,
    };
}


export default connect(mapStateToProps)(withRouter(DashboardsSelector));
