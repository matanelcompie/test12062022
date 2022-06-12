import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import Combo from '../../../global/Combo';
import * as ElectionsActions from '../../../../actions/ElectionsActions';
import constants from '../../../../libs/constants';

class SearchPanel extends React.Component {

    constructor(props) {
        super(props);

    }

    componentWillMount(){
            let currentUserGeographicalFilteredLists = this.props.currentUserGeographicalFilteredLists;
        this.setState({
            filteredAreasList: currentUserGeographicalFilteredLists.areas,
            filteredSubAreasList: [],
            filteredCities: currentUserGeographicalFilteredLists.cities,
            clusters: [], ballots: []
        });
          this.exportBallotsText = 'קובץ שיבוץ קלפיות';
          this.exportClustersText = 'קובץ שיבוץ אשכולות';
          this.exportAppointmentLettersObserverText = 'כתבי מינוי משקיפים';
          this.exportAppointmentLettersBallotLeaderText = 'כתבי מינוי יו"ר';
          this.exportAppointmentLettersBallotMemberText = 'כתבי מינוי חברי קלפי';
    }

    componentWillReceiveProps(nextProps) {
            if(nextProps.currentUser &&  nextProps.currentUserGeographicalFilteredLists.cities.length > 0 && nextProps.currentUserGeographicalFilteredLists.areas.length > 0)
	        {     
               if(!this.state.loadedAreasAndCities){	
                    this.setState({loadedAreasAndCities:true});			   
					this.setState({filteredCities : nextProps.currentUserGeographicalFilteredLists.cities});
					this.setState({filteredAreasList : nextProps.currentUserGeographicalFilteredLists.areas});		
                    if(this.props.router.params.cityKey && !this.loadedByKey){
						this.loadedByKey=true;
						let foundCity = 0;
						for(let i = 0 ; i < nextProps.currentUserGeographicalFilteredLists.cities.length ; i++){
							if(nextProps.currentUserGeographicalFilteredLists.cities[i].key == this.props.router.params.cityKey){
								let selectedCity = nextProps.currentUserGeographicalFilteredLists.cities[i];
								this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedCity' , fieldValue:selectedCity.name , fieldItem:selectedCity});
								foundCity++;
                                ElectionsActions.loadClustersAndNeighborhoodsByCity(this.props.dispatch , selectedCity.key);
                                ElectionsActions.loadEntityActivistsSummary(this.props.dispatch , constants.geographicEntityTypes.city, selectedCity.id);
                                ElectionsActions.loadCityMunicipalCoordinators(this.props.dispatch , selectedCity.key);
								this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_SHOW_SEARCH_RESULTS , show:true});
								break;
							}
						}
						if(foundCity == 0){
							this.props.router.push('elections/activists/city_summary');
						}
					}			
               }
			}
			if(nextProps.currentUser &&  nextProps.currentUserGeographicalFilteredLists.sub_areas.length > 0)
	        {   
          		 if(!this.state.loadedSubAreas){
				   this.setState({loadedSubAreas:true});	
                  this.setState({filteredSubAreasList : nextProps.currentUserGeographicalFilteredLists.sub_areas});			   
				 }
			}
    
	 
	  if(nextProps.clusters.length > 0){
		    this.setState({clusters : nextProps.clusters});   
	  }
	  else{
		  if(this.state.clusters.length >0){
			  this.setState({clusters : []});
		  }  
	  }
    }

       /*
           Handles change in one of comboes 
    */
    searchFieldComboValueChange(fieldName , e){
		
             this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName , fieldValue:e.target.value , fieldItem:e.target.selectedItem});
			 this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.LOADED_CLUSTER_ACTIVISTS_AND_VOTES_DATA , data:{captain_fifty:[],cluster_leader_roles:[] , driver_roles:[],mamritz_roles:[] , shas_votes_count:0}});
            if (fieldName != 'selectedBallot') {
                this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedBallot' , fieldValue:'' , fieldItem:null});
                this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_SHOW_SEARCH_RESULTS, show: false });//hide search results on any change
            }
             let self = this;
				switch (fieldName){
                  case 'selectedArea' :
				     let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || city.area_id == e.target.selectedItem.id});
					 this.setState({filteredSubAreasList : this.props.currentUserGeographicalFilteredLists.sub_areas.filter(function(subArea){return !e.target.selectedItem || subArea.area_id == e.target.selectedItem.id})});
                     this.setState({filteredCities : newFilteredCities});
                     this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedSubArea' , fieldValue:'' , fieldItem:null});
                     this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedCity' , fieldValue:'' , fieldItem:null});
			    	 this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedCluster' , fieldValue:'' , fieldItem:null}); 
                    
					 break;
                  case 'selectedSubArea' :

                     if(this.props.searchScreen.selectedArea.selectedItem){
						this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || (city.area_id == self.props.searchScreen.selectedArea.selectedItem.id && city.sub_area_id == e.target.selectedItem.id)})});
						this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedCity' , fieldValue:'' , fieldItem:null});
                     }
                     else{
 
                        this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || (city.sub_area_id == e.target.selectedItem.id)})});
						this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedCity' , fieldValue:'' , fieldItem:null});
                        if(e.target.selectedItem){
							for(let i = 0 ;i < this.props.currentUserGeographicalFilteredLists.areas.length;i++){
                                 if(this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id){
                                       this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedArea' , fieldValue:this.props.currentUserGeographicalFilteredLists.areas[i].name , fieldItem:this.props.currentUserGeographicalFilteredLists.areas[i]});
                                       break;
                                 }
							}
                        }
                     }
                     break;
                  case 'selectedCity' :
				  
                  this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedSubArea' , fieldValue:'' , fieldItem:null});
				     this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedNeighborhood' , fieldValue:'' , fieldItem:null});
                     this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedCluster' , fieldValue:'' , fieldItem:null});
					 if(e.target.selectedItem){
                            let cityKey = e.target.selectedItem.key;
                            for(let i = 0 ;i < this.props.currentUserGeographicalFilteredLists.areas.length;i++){
                                 if(this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id){
                                       this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedArea' , fieldValue:this.props.currentUserGeographicalFilteredLists.areas[i].name , fieldItem:this.props.currentUserGeographicalFilteredLists.areas[i]});
                                       break;
                                 }
							}

                         for (let i = 0; i < this.props.currentUserGeographicalFilteredLists.sub_areas.length; i++) {
                             if (this.props.currentUserGeographicalFilteredLists.sub_areas[i].id == e.target.selectedItem.sub_area_id) {
                                 this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE, fieldName: 'selectedSubArea', fieldValue: this.props.currentUserGeographicalFilteredLists.sub_areas[i].name, fieldItem: this.props.currentUserGeographicalFilteredLists.sub_areas[i] });
                                 break;
                             }
                         }

                         if (this.props.cityCachedDataList[cityKey]) { //load from cache
                             this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_NEIGHBORHOODS_AND_CLUSTERS_ITEMS, neighborhoods: this.props.cityCachedDataList[cityKey].neighborhoods, clusters: this.props.cityCachedDataList[cityKey].clusters, ballots :this.props.cityCachedDataList[cityKey].ballots });
                         }
                         else { //load from api
                             ElectionsActions.loadClustersAndNeighborhoodsByCity(this.props.dispatch, cityKey);
                         }
                         if (this.props.clusterRequired != true) {
                             if (this.props.cityShasVotesCachedDataList[cityKey]) { //load from cache
                                 this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_NUMBER_ELECTION_CAMP_CITY_SHAS_VOTERS_COUNT, data: { clusters_regular_roles: this.props.cityShasVotesCachedDataList[cityKey].clusters_regular_roles, clusters_activated_ballots_countings: this.props.cityShasVotesCachedDataList[cityKey].clusters_activated_ballots_countings, numOfShasVotersThisCampaign: this.props.cityShasVotesCachedDataList[cityKey].numOfShasVotersThisCampaign } });
                             }
                             else { //load from api
                                 ElectionsActions.loadTotalNumberOfShasVoters(this.props.dispatch, cityKey);
                             }
                             if (this.props.citySupportStatusesCachedDataList[cityKey]) { //load from cache
                                 this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_CLUSTER_SUPPORT_VOTER_STATUSES, data: { clusters_support_statuses: this.props.citySupportStatusesCachedDataList[cityKey].clusters_support_statuses } });
                             }
                             else { //load from api
                                 ElectionsActions.loadClusterNumberOfSupportStatuses(this.props.dispatch, cityKey);
                             }
                         }
                         ElectionsActions.loadElectionRolesBudget(this.props.dispatch, cityKey);
                         ElectionsActions.loadRoleCityDefalutBudget(this.props.dispatch, cityKey);
                     }
                     else{
                        this.setState({ filteredClusters: undefined, filteredBallots: undefined });
                         this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_NEIGHBORHOODS_AND_CLUSTERS_ITEMS , neighborhoods:[] , clusters : [], ballots:[]});
						 this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_NUMBER_ELECTION_CAMP_CITY_SHAS_VOTERS_COUNT , data:{clusters_regular_roles:[] , clusters_activated_ballots_countings : [] , numOfShasVotersThisCampaign:0}});
						 this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_CLUSTER_SUPPORT_VOTER_STATUSES , data : {clusters_support_statuses:[]}});
                     }
                     break;
                 case 'selectedNeighborhood' :
                        this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE, fieldName: 'selectedCluster', fieldValue: '', fieldItem: null });
                        if (e.target.selectedItem) {
                            let clustersIdsHash = {};
                            let neighborhood_id = e.target.selectedItem.id
                            let filteredCluster = this.props.clusters.filter(function (cluster) {
                                if(cluster.neighborhood_id == neighborhood_id){
                                    clustersIdsHash[cluster.id] = cluster.id;
                                    return true;
                                }
                                return false;
                            });
                            let filteredBallots = this.props.ballots.filter(function (ballot) {
                                return clustersIdsHash.hasOwnProperty(ballot.cluster_id) ? true : false;
                            });
                            this.setState({ filteredClusters: filteredCluster, filteredBallots: filteredBallots });
                        } else {
                            this.setState({ filteredClusters: undefined, filteredBallots: undefined });
                        }
                    break;

                 case 'selectedCluster' :
                        if (e.target.selectedItem) {
                            let cluster_id = e.target.selectedItem.id;
                            let filteredBallots = this.props.ballots.filter(function (ballot) {
                                return ballot.cluster_id == cluster_id;
                            });
                            this.setState({ filteredBallots: filteredBallots });
                        } else {
                            this.setState({ filteredBallots: undefined });
                        }
                    break;
                 case 'selectedBallot' :
                        let ballotItem = e.target.selectedItem;
                        if (ballotItem) {
                            // If cluster not had selected.
                            if(!this.props.searchScreen.selectedCluster.selectedItem){ 
                                let cluster_id = ballotItem.cluster_id;
                                let currentCluster = this.props.clusters.find(function (cluster) {
                                    return cluster.id == cluster_id;
                                });
                                if (currentCluster) { //Set selected ballot cluster data.
                                    this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE, fieldName: 'selectedCluster', fieldValue: currentCluster.name, fieldItem: currentCluster });
                                    this.setState({ filteredBallots: currentCluster.ballot_boxes }); //Set ballots for this cluster
                                }
                            }
                        }
                    break;
				}
             
    }
    onSearch(currentCity){
        let entityData={
            entity_id: currentCity.id,
            entity_key: currentCity.key,
            entity_type: constants.geographicEntityTypes.city,
        }
        this.props.onSelectGeoEntity(entityData);
    }
    /*
         This will display search retults on button click.
    */
    showSearchResults(){
        console.log('this.props.clusterRequired', this.props.clusterRequired)
		if(this.props.clusterRequired == true){ //load cluster data
            let realRowIndex = this.props.getRealRowIndex();

					if(!this.props.clusters[realRowIndex].extended_ballot_boxes){
					 
						if(!this.props.clusters[realRowIndex].loaded_extended_data){
 
							this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_CLUSTER_ROW_DETAILS , rowIndex:realRowIndex , fieldName:'loaded_extended_data' , fieldValue:true});
							let ballotBoxesIds = [];
							for(let k =0 ;k<this.props.clusters[realRowIndex].ballot_boxes.length ; k++){
								ballotBoxesIds.push(this.props.clusters[realRowIndex].ballot_boxes[k].id);
							}

							ElectionsActions.loadClustersBallotsExtendedData(this.props.dispatch , this.props.searchScreen.selectedCity.selectedItem.key , ballotBoxesIds , realRowIndex);
							ElectionsActions.loadClusterActivistRoles(this.props.dispatch , this.props.searchScreen.selectedCity.selectedItem.key , this.props.searchScreen.selectedCluster.selectedItem.key ); 
						}
					}
				 
        } else{
            this.onSearch(this.props.searchScreen.selectedCity.selectedItem);
        }
        
        this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_SHOW_SEARCH_RESULTS , show:true});
        
    }

    render() {
        let emptyLink = <Link title="יצוא ל-אקסל" className="icon-box excel" style={{ opacity: '0.5' }} />;
        let exportClustersLink = emptyLink;
        let exportBallotsLink = emptyLink;
        let exportAppointmentLettersObserverLink = emptyLink;
        let exportAppointmentLettersBallotLeaderLink = emptyLink;
        let exportAppointmentLettersBallotMemberLink = emptyLink;

        let selectedCity = this.props.searchScreen.selectedCity.selectedItem;
        if (selectedCity != null) {
            exportClustersLink = <Link title="יצוא ל-אקסל" to={"elections/activist/city_summary/clusters/export?city_key=" + selectedCity.key} className="icon-box excel" target="_blank" />;
            exportAppointmentLettersObserverLink = <Link title="יצוא ל-אקסל" to={"api/elections/activists/appointment_letters/city/" + selectedCity.key + "/observer/export"} className="icon-box excel" target="_blank" />;
            exportAppointmentLettersBallotLeaderLink = <Link title="יצוא ל-אקסל" to={"api/elections/activists/appointment_letters/city/" + selectedCity.key + "/ballot_leader/export/from-tashbetz"} className="icon-box excel" target="_blank" />;
            exportAppointmentLettersBallotMemberLink = <Link title="יצוא ל-אקסל" to={"api/elections/activists/appointment_letters/city/" + selectedCity.key + "/ballot_member/export/from-tashbetz"} className="icon-box excel" target="_blank" />;
        }

        if (this.props.currentUserGeographicalFilteredLists.cities.length > 0) {
            let cityParams = (selectedCity != null)? "?city_key=" + selectedCity.key : "";
            exportBallotsLink = <Link title="יצוא ל-אקסל" to={"elections/activist/city_summary/export" + cityParams} className="icon-box excel" target="_blank" />;
        }
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        { !this.props.isMuniActivistsPage && (this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.city_summary.export'] == true) &&
                        <div className="col-md-4 pull-left">
                            <div className="col-md-5" style={{ textAlign: 'left', paddingLeft: '12px', paddingTop: '5px' }}>
                                {this.exportBallotsText}
                            </div>
                            <div className="col-md-1" style={{ padding: '0' }}>
                                {exportBallotsLink}
                            </div>
                            <div className="col-md-5" style={{ textAlign: 'left', paddingLeft: '12px', paddingTop: '5px' }}>
                                {this.exportClustersText}
                            </div>
                            <div className="col-md-1" style={{ padding: '0' }}>
                                {exportClustersLink}
                            </div>
                        </div>
                         }
                        { !this.props.isMuniActivistsPage && (this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.city_summary.appointment_letter'] == true) &&
                        <div className="col-md-6 pull-left">

                            <div className="col-md-3" style={{ textAlign: 'left', paddingLeft: '12px', paddingTop: '5px' }}>
                                {this.exportAppointmentLettersObserverText}
                            </div>
                            <div className="col-md-1" style={{ padding: '0' }}>
                                {exportAppointmentLettersObserverLink}
                            </div>
                            <div className="col-md-3" style={{ textAlign: 'left', paddingLeft: '12px', paddingTop: '5px' }}>
                                {this.exportAppointmentLettersBallotLeaderText}
                            </div>
                            <div className="col-md-1" style={{ padding: '0' }}>
                                {exportAppointmentLettersBallotLeaderLink}
                            </div>
                            <div className="col-md-3" style={{ textAlign: 'left', paddingLeft: '12px', paddingTop: '5px' }}>
                                {this.exportAppointmentLettersBallotMemberText}
                            </div>
                            <div className="col-md-1" style={{ padding: '0' }}>
                                {exportAppointmentLettersBallotMemberLink}
                            </div>
                        </div>

                        }
                    </div>
                </div>
            <div className="dtlsBox srchPanel first-box-on-page clearfix" style={{ marginTop: '5px' }}>

            <div className="row">
                <div className="col-lg-3 col-md-3">
                        <div className="form-group">
                            <label htmlFor="staff" className="control-label">אזור</label>
                            <Combo items={this.state.filteredAreasList} placeholder="בחר אזור"  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'  value={this.props.searchScreen.selectedArea.selectedValue}  onChange={this.searchFieldComboValueChange.bind(this , 'selectedArea')} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="type" className="control-label">אשכול</label>
                            <Combo items={this.state.filteredClusters || this.state.clusters} placeholder="בחר אשכול"  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'  value={this.props.searchScreen.selectedCluster.selectedValue}  onChange={this.searchFieldComboValueChange.bind(this , 'selectedCluster')} inputStyle={{borderColor:(this.props.clusterRequired == true && this.props.searchScreen.selectedCluster.selectedItem == null?'#ff0000':'#ccc')}} />
                        </div>
                </div>
                <div className="col-lg-3 col-md-3">
                        <div className="form-group">
                            <label htmlFor="sub-staff" className="control-label">תת אזור</label>
                            <Combo items={this.state.filteredSubAreasList} placeholder="בחר תת אזור"   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'   value={this.props.searchScreen.selectedSubArea.selectedValue} onChange={this.searchFieldComboValueChange.bind(this , 'selectedSubArea')} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="type" className="control-label">קלפי</label>
                            <Combo items={this.state.filteredBallots || this.props.ballots || []} placeholder="בחר קלפי" maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedBallot.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedBallot')} />
                        </div>
                </div>
                <div className="col-lg-3 col-md-3">
                     
                        <div className="form-group">
                            <label htmlFor="searchByCity" className="control-label">עיר</label>
                            <Combo items={this.state.filteredCities} placeholder="בחר עיר"  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'   value={this.props.searchScreen.selectedCity.selectedValue} onChange={this.searchFieldComboValueChange.bind(this , 'selectedCity')} inputStyle={{borderColor:(this.props.searchScreen.selectedCity.selectedItem == null?'#ff0000':'#ccc')}} />
                        </div>
                     
                </div>
                <div className="col-lg-3 col-md-3">
                    
                        <div className="form-group">
                            <label htmlFor="sub-staff2" className="control-label">אזור מיוחד</label>
                            <Combo items={this.props.neighborhoods} placeholder="בחר אזור מיוחד"  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'  value={this.props.searchScreen.selectedNeighborhood.selectedValue}  onChange={this.searchFieldComboValueChange.bind(this , 'selectedNeighborhood')} />
                        </div>
                        <div className="box-button-single">
                            <button title="הצג" type="submit" className="btn btn-default srchBtn pull-left" disabled={!this.props.searchScreen.selectedCity.selectedItem || (this.props.clusterRequired == true ? (this.props.searchScreen.selectedCluster.selectedItem == null) : false )} onClick={this.showSearchResults.bind(this)}>הצג</button>
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
               currentUser: state.system.currentUser,
               currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
               areas: state.system.currentUserGeographicalFilteredLists.areas,
               searchScreen:state.elections.managementCityViewScreen.searchScreen,
               neighborhoods:state.elections.managementCityViewScreen.neighborhoods,
               clusters:state.elections.managementCityViewScreen.clusters,
               ballots:state.elections.managementCityViewScreen.ballots,
               cityCachedDataList:state.elections.managementCityViewScreen.cityCachedDataList,
               showSearchResults:state.elections.managementCityViewScreen.showSearchResults,
			   cityShasVotesCachedDataList : state.elections.managementCityViewScreen.cityShasVotesCachedDataList ,
			   citySupportStatusesCachedDataList : state.elections.managementCityViewScreen.citySupportStatusesCachedDataList  ,
    }
}

export default connect(mapStateToProps)(withRouter(SearchPanel));