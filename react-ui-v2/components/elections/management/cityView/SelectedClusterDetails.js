import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

 import * as ElectionsActions from '../../../../actions/ElectionsActions';
class SelectedClusterDetails extends React.Component {

    constructor(props) {
        super(props);
		this.initConstants();
    }
	
	/*
	Init constant variables once
	*/
	initConstants(){
		this.topStyle={paddingTop:'10px' , fontSize:'18px'};	
	}
	
	/*
	   calculate  some things - total number of ballot boxes , total number of voters
	*/
	performDataCalculations(){
	 
		this.ballotVotersCount = 0;
		this.supportersCount = 0;
		for(let i = 0 ; i < this.props.clusters.length;i++){
			this.ballotVotersCount  += parseInt(this.props.clusters[i].voters_count);	
		}
		if(this.props.selectedCluster.selectedItem && this.props.selectedCluster.selectedItem.extended_ballot_boxes){
			for(let i = 0 ; i < this.props.selectedCluster.selectedItem.extended_ballot_boxes.length;i++){
				this.supportersCount  += parseInt(this.props.selectedCluster.selectedItem.extended_ballot_boxes[i].voter_supporters_count);	
			}
		}
	}
	
	/*
	    Handles clicking on city name - it will goto the city page
	*/
	goToClustersCity(){
		this.props.router.push('elections/activists/city_summary/'+this.props.searchScreen.selectedCity.selectedItem.key);
	}

    cancelGoogleMap(e){
     
        let isChecked = e.target.checked;
        ElectionsActions.updateClusterGoogleMap(this.props.dispatch,this.props.selectedCluster.selectedItem.id, isChecked)
      
    }

    render() {
		if(!this.props.searchScreen.selectedCluster.selectedItem){return (<div></div>)}
		this.performDataCalculations();
	
        return (
            <div className="dtlsBox electorDtlsStrip clearfix">
            <div className="flexed flexed-space-between electorDtlsData">
           
                        <div className="city-name-content cluster">
                            <div className="city-name">{this.props.searchScreen.selectedCluster.selectedItem? this.props.searchScreen.selectedCluster.selectedItem.name :''}</div>
                        </div>
                        <div  className="info-items" style={this.topStyle}>
                            <dl className="flexed item-space">
                                <dt className="narrow-profit item-space">עיר</dt>
                                <dd><a title={this.props.searchScreen.selectedCity.selectedItem.name} style={{cursor:'pointer'}} onClick={this.goToClustersCity.bind(this)}>&nbsp;&nbsp;<u>{this.props.searchScreen.selectedCity.selectedItem.name}</u></a></dd>
                            </dl>
                        </div>
                        <div className="info-items"  style={this.topStyle}>
                            <dl className="flexed item-space">
                                <dt className="narrow-profit item-space">כתובת</dt>
                                <dd>
								&nbsp;&nbsp;{this.props.searchScreen.selectedCluster.selectedItem.street}</dd>
                            </dl>
                        </div>
                        <div className="info-items"  style={this.topStyle}>
                            <dl className="flexed item-space">
                                <dt className="narrow-profit item-space">קלפיות</dt>
                                <dd>&nbsp;&nbsp;{this.props.searchScreen.selectedCluster.selectedItem.ballot_boxes.length}</dd>
                            </dl>
                        </div>
                        <div className="info-items"  style={this.topStyle}>
                            <dl className="flexed item-space">
                                <dt className="narrow-profit item-space">תושבים</dt>
                                <dd>&nbsp;&nbsp;{this.ballotVotersCount}</dd>
                            </dl>
                        </div>
                        <div className="info-items"  style={this.topStyle}>
                            <dl className="flexed item-space">
                                <dt className="narrow-profit item-space">הצבעות ש"ס</dt>
                                <dd>&nbsp;&nbsp;{this.props.cluster_activists_and_votes.shas_votes_count}</dd>
                            </dl>
                        </div>
                        <div className="info-items"  style={this.topStyle}>
                            <dl className="flexed item-space">
                                <dt className="narrow-profit item-space">תומכים</dt>
                                <dd>&nbsp;&nbsp;{this.supportersCount}</dd>
                            </dl>
                        </div>
                      
                     

            </div>
            <div>
            <div className="info-items"  style={this.topStyle}>
                            <dl style={{marginBottom:10+'px'}} className="flexed item-space">
                                <dt className="narrow-profit item-space"> ביטול אימות מיקום גאוגרפי </dt> 
                                <div>
                                     <input style={{marginTop:'7px'}} disabled={(!this.props.currentUser.admin && !this.props.currentUser.permissions['elections.activists.cluster_summary.cancel-google-map'])} type="checkbox" onChange={this.cancelGoogleMap.bind(this)} title={this.props.cluster_activists_and_votes.cancel_google_map} checked={this.props.searchScreen.selectedCluster.selectedItem.cancel_google_map} value=""/>
                                </div>
                                
                                {/* <dd>&nbsp;&nbsp;</dd> */}
                            </dl>
                        </div>
            </div>
        </div>
        );
    }
}

function mapStateToProps(state) {
    return {
		    selectedCluster:state.elections.managementCityViewScreen.searchScreen.selectedCluster,
		    clusters:state.elections.managementCityViewScreen.clusters,
            searchScreen:state.elections.managementCityViewScreen.searchScreen,
			cluster_activists_and_votes : state.elections.managementCityViewScreen.cluster_activists_and_votes,
            currentUser: state.system.currentUser,
    }
}

export default connect(mapStateToProps)(withRouter(SelectedClusterDetails));