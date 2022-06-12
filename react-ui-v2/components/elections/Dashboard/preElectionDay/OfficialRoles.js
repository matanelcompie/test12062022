import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../../global/Combo';
import * as ElectionsActions from '../../../../actions/ElectionsActions';

class OfficialRoles extends React.Component {
    constructor(props) {
        super(props);
        this.initConstants();
    }

    initConstants() {
       this.lineStyle={borderBottom:'#CCCCCC solid 1px' ,   padding:'0 10px' , margin:'0 -20px'};
    }

	/*
		Handles change of election campaign combo value
	*/
	electionCampaignChange(e){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'officialsRolesScreen' ,  fieldName:'selectedCampaign' , fieldValue : {selectedValue:e.target.value , selectedItem:e.target.selectedItem} });
	}
	
	/*
		Calculate percentage for first ballots progress-bar
	*/
	getBallotsPercentage(){
		let value = 0;
		if(this.props.officialsRolesScreen.resultDataObject.needed_ballot_activists_count && this.props.officialsRolesScreen.resultDataObject.ballot_activists_count 
			&& parseInt(this.props.officialsRolesScreen.resultDataObject.needed_ballot_activists_count) > 0 && parseInt(this.props.officialsRolesScreen.resultDataObject.ballot_activists_count) > 0 ){
			value = (parseInt(this.props.officialsRolesScreen.resultDataObject.ballot_activists_count) * 100 )/ parseInt(this.props.officialsRolesScreen.resultDataObject.needed_ballot_activists_count);
			value = Math.ceil(value);
		} if(this.props.officialsRolesScreen.resultDataObject.ballot_activists_count >0 && this.props.officialsRolesScreen.resultDataObject.needed_ballot_activists_count < this.props.officialsRolesScreen.resultDataObject.ballot_activists_count){
			value = 100;
		}
		return value;
	}
	
	/*
		Calculate percentage for second observers progress-bar
	*/
	getObserversPercentage(){
		let value = 0;
		if(this.props.officialsRolesScreen.resultDataObject.needed_observers_count && this.props.officialsRolesScreen.resultDataObject.observers_count
			 && parseInt(this.props.officialsRolesScreen.resultDataObject.needed_observers_count) > 0 && parseInt(this.props.officialsRolesScreen.resultDataObject.observers_count) > 0 ){
			value = (parseInt(this.props.officialsRolesScreen.resultDataObject.observers_count) * 100 )/ parseInt(this.props.officialsRolesScreen.resultDataObject.needed_observers_count);
			value = Math.ceil(value);
		}else if(this.props.officialsRolesScreen.resultDataObject.observers_count >0 && this.props.officialsRolesScreen.resultDataObject.needed_observers_count < this.props.officialsRolesScreen.resultDataObject.observers_count){
			value = 100;
		}
		return value;
	}
	
	/*
		Calculate percentage for third clusters progress-bar
	*/
	getClustersPercentage(){
		let value = 0;
		if(this.props.officialsRolesScreen.resultDataObject.all_clusters_count && this.props.officialsRolesScreen.resultDataObject.shifted_clusters_count && parseInt(this.props.officialsRolesScreen.resultDataObject.all_clusters_count) > 0 && parseInt(this.props.officialsRolesScreen.resultDataObject.shifted_clusters_count) > 0 ){
			value = (parseInt(this.props.officialsRolesScreen.resultDataObject.shifted_clusters_count) * 100 )/ parseInt(this.props.officialsRolesScreen.resultDataObject.all_clusters_count);
			value = Math.ceil(value);
		}
		return value;
	}
	
    /*
		Calculate percentage for fourth cap50 progress-bar
	*/
	getCap50Percentage(){
		let value = 0;
		if(this.props.officialsRolesScreen.resultDataObject.cap50_count && this.props.officialsRolesScreen.resultDataObject.cap50_needed && parseInt(this.props.officialsRolesScreen.resultDataObject.cap50_count) > 0 && parseInt(this.props.officialsRolesScreen.resultDataObject.cap50_needed) > 0 ){
			value = (parseInt(this.props.officialsRolesScreen.resultDataObject.cap50_count) * 100 )/ parseInt(this.props.officialsRolesScreen.resultDataObject.cap50_needed);
			value = Math.ceil(value);
		}
		return value;
	}
	
	
	/*
		Calculate percentage for fifth motivator progress-bar
	*/
	getMotivatorPercentage(){
		let value = 0;
		if(this.props.officialsRolesScreen.resultDataObject.motivator_count && this.props.officialsRolesScreen.resultDataObject.motivator_needed && parseInt(this.props.officialsRolesScreen.resultDataObject.motivator_count) > 0 && parseInt(this.props.officialsRolesScreen.resultDataObject.motivator_needed) > 0 ){
			value = (parseInt(this.props.officialsRolesScreen.resultDataObject.motivator_count) * 100 )/ parseInt(this.props.officialsRolesScreen.resultDataObject.motivator_needed);
			value = Math.ceil(value);
		}
		return value;
	}
  
    /*
			Handles clicking "show" button
	*/
	loadDataPerElectionCampaign(){
		if(this.props.officialsRolesScreen.selectedCampaign.selectedItem){
				let entityType = null;
				let entityKey = null;
				if(this.props.searchScreen.selectedArea.selectedItem){
					this.dataHeader = this.props.searchScreen.selectedArea.selectedItem.name;
					entityType = 0;
			
					entityKey = this.props.searchScreen.selectedArea.selectedItem.key;
				}
				if(this.props.searchScreen.selectedSubArea.selectedItem){
			
				}
				if(this.props.searchScreen.selectedCity.selectedItem){
					this.dataHeader = this.props.searchScreen.selectedCity.selectedItem.name;
					entityType = 1;
			
				entityKey = this.props.searchScreen.selectedCity.selectedItem.key;
				}
				if(this.props.searchScreen.selectedNeighborhood.selectedItem){
					this.dataHeader = this.props.searchScreen.selectedNeighborhood.selectedItem.name;
					entityType = 2;
			
					entityKey = this.props.searchScreen.selectedNeighborhood.selectedItem.key;
				}
				if(this.props.searchScreen.selectedCluster.selectedItem){
					this.dataHeader = this.props.searchScreen.selectedCluster.selectedItem.name;
					entityType = 3;
			
					entityKey = this.props.searchScreen.selectedCluster.selectedItem.key;
				}
				if(this.props.searchScreen.selectedBallotBox.selectedItem){
					this.dataHeader = this.props.searchScreen.selectedBallotBox.selectedItem.id;
					entityType = 4;
			
					entityKey = this.props.searchScreen.selectedBallotBox.selectedItem.key;
				}
				this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'officialsRolesScreen' ,  fieldName:'resultDataObject' , fieldValue:null});
				ElectionsActions.loadDashboardSupportOfficialRoles( this.props.dispatch , entityType , entityKey , this.props.officialsRolesScreen.selectedCampaign.selectedItem.key);
		}
	}
  
    render() {
		if(this.props.officialsRolesScreen.resultDataObject){
			var ballotMembersPercent = this.getBallotsPercentage();
			var observersPercent = this.getObserversPercentage();
		}
            return (<div>
					  <div className="dtlsBox-vote-dashboard roles-box">
                                <div className="row" style={this.lineStyle}>
                                    <div className="panelTitle col-lg-7 no-padding text-right"> בעלי תפקידים
                                        <a href=""> <img src={window.Laravel.baseURL+"Images/info-icon.png"} alt="בעלי תפקידים" /></a>
                                    </div>
                                    <div className="left-panet-title col-lg-5 no-padding text-left">
                                        <div>
											<Combo items={this.props.electionCampaigns} placeholder="קמפיין בחירות" className="select-medium" 
												disabled={true} maxDisplayItems={5}  value={this.props.officialsRolesScreen.selectedCampaign.selectedValue}  
												itemIdProperty="id" itemDisplayProperty='name' onChange={this.electionCampaignChange.bind(this)}  />
										</div>
                                        <div>
                                            <button title="הצג" type="button" className="btn btn-primary btn-xs" disabled={!this.props.officialsRolesScreen.selectedCampaign.selectedItem} onClick={this.loadDataPerElectionCampaign.bind(this)}>הצג</button>
                                        </div>
                                    </div>
                                </div>
								{!this.props.officialsRolesScreen.resultDataObject ? <div style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i></div> : <div>
                                <div className="rolls-graph-erea">
                                    <div className="polls-members">
									{this.props.officialsRolesScreen.resultDataObject.ballot_activists_count} בשיבוץ חברי קלפיות מלא
                                    </div>
                                    <div className="sum-polls-members">סה”כ {this.props.officialsRolesScreen.resultDataObject.all_ballots_count} קלפיות</div>
									<div className="polls-graph">
									<span style={{padding:'10px', 'cursor':'pointer'}} title="קלפיות מוקצות לחברי קלפי">{this.props.officialsRolesScreen.resultDataObject.needed_ballot_activists_count}</span> 
                                    <div className="progress">
                                        <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{width:(ballotMembersPercent+'%')}}> </div>
                                    </div>
                                    </div>
                                </div>
                                <div className="observers-graph-erea">
                                    <div className="observers">
                                        {this.props.officialsRolesScreen.resultDataObject.observers_count} בשיבוץ משקיפים מלא
                                    </div>
									<div className="polls-graph">
									<span  style={{padding:'10px', 'cursor':'pointer'}} title="קלפיות מוקצות למשקיפים">{this.props.officialsRolesScreen.resultDataObject.needed_observers_count}</span>
                                        <div className="progress">
                                            <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{width:(observersPercent + '%')}}> </div>
                                        </div>
                                    </div>
                                </div>

                                {!this.props.officialsRolesScreen.resultDataObject.is_ballots && <div className="heads-graph-erea">
                                    <div className="heads">
                                        {this.props.officialsRolesScreen.resultDataObject.shifted_clusters_count} ראשי אשכולות שובצו
                                    </div>
                                    <div className="sum-heads">סה”כ {this.props.officialsRolesScreen.resultDataObject.all_clusters_count} אשכולות</div>
                                    <div className="polls-graph">{this.props.officialsRolesScreen.resultDataObject.all_clusters_count}
                                        <div className="progress">
                                            <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{width:(this.getClustersPercentage()+'%')}}> </div>
                                        </div>
                                    </div>
                                </div>}

                                <div className="ministers-graph-erea">
                                    <div className="ministers">
                                        {this.props.officialsRolesScreen.resultDataObject.cap50_count} שרי מאה
                                    </div>
                                    <div className="polls-graph">{this.props.officialsRolesScreen.resultDataObject.cap50_needed}
                                        <div className="progress">
                                            <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{width:(this.getCap50Percentage() +'%')}}> </div>
                                        </div>
                                    </div>
                                </div>

                                {!this.props.officialsRolesScreen.resultDataObject.is_ballots && <div className="stimulants-graph-erea">
                                    <div className="stimulants">
                                        {this.props.officialsRolesScreen.resultDataObject.motivator_count} ממריצים
                                    </div>
                                    <div className="polls-graph">{this.props.officialsRolesScreen.resultDataObject.motivator_needed}
                                        <div className="progress">
                                            <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{width:(this.getMotivatorPercentage() + '%')}}> </div>
                                        </div>
                                    </div>
                                </div>
								}
								</div>
								}
                                </div>	 
			        </div>
					);
         
    }
}

function mapStateToProps(state) {
    return {
		electionCampaigns:state.elections.preElectionsDashboard.generalLists.electionCampaigns,
		officialsRolesScreen:state.elections.preElectionsDashboard.officialsRolesScreen,
		searchScreen:state.elections.preElectionsDashboard.searchScreen,
    }
}

export default connect(mapStateToProps) (withRouter(OfficialRoles));