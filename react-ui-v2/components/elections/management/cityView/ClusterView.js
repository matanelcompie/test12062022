import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';


import SearchPanel from './SearchPanel'
import SelectedClusterDetails from './SelectedClusterDetails'
import SelectedClusterExtendedDetails from './SelectedClusterExtendedDetails'
import * as SystemActions from '../../../../actions/SystemActions';
import * as ElectionsActions from '../../../../actions/ElectionsActions';
import store from '../../../../store';

class ClusterView extends React.Component {

    constructor(props) {
      super(props);
      this.initConstants();
      ElectionsActions.loadElectionRoles(this.props.dispatch);
      ElectionsActions.loadElectionRolesShifts(this.props.dispatch);
      ElectionsActions.loadCurrentElectionRolesCampaignBudget(this.props.dispatch);
    }

    initConstants() {
        this.systemTitle = "פעילי אשכול וקלפי";
        this.screenPermission = 'elections.activists.cluster_summary';
    }

    componentWillMount(){
		if(this.props.router.params.clusterKey){
			this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_SHOW_SEARCH_RESULTS , show:true});
		    ElectionsActions.loadClusterDataFromKeyOnly(this.props.dispatch , this.props.router.params.clusterKey);
		}
		
      this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: this.systemTitle });
      SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
      ElectionsActions.loadActivistsSummaryBallotBoxRoles(this.props.dispatch);
    }
   
    componentWillReceiveProps(nextProps) {
 
		if (this.props.currentUser.admin==false && nextProps.currentUser.permissions[this.screenPermission]!=true && this.props.currentUser.first_name.length>1){          	  
		  this.props.router.replace('/unauthorized');
        }  
    }
 
    /*
         Init dynamic variables for render function
    */
    initDynamicVariables(){
           if(this.props.showSearchResults){
			   let self = this;
			   let filteredClusters = this.props.clusters;
		       if(this.props.searchScreen.selectedNeighborhood.selectedItem){
					
					filteredClusters = this.props.clusters.filter(function(cluster){
						return cluster.neighborhood_id == self.props.searchScreen.selectedNeighborhood.selectedItem.id
					});
				}
			    if(this.props.searchScreen.selectedCluster.selectedItem){
					filteredClusters = filteredClusters.filter(function(cluster){
						return cluster.id == self.props.searchScreen.selectedCluster.selectedItem.id
					}); 
				}
                  this.searchResultsItem = <div>
                      <SelectedClusterDetails />
                      <SelectedClusterExtendedDetails getRealRowIndex={this.getRealRowIndex.bind(this)}
                        electionRolesShifts={this.props.electionRolesShifts} />
                  </div>;

           }
           else{
                  this.searchResultsItem = null;

           }
		   this.loadingCluster = null;
		   if(this.props.showSearchResults){
				    this.loadingCluster = <div style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin" style={{fontSize:"24px"}}></i>טוען...</div>;
					if(this.props.searchScreen.selectedCluster.selectedItem){
						if(this.props.searchScreen.selectedCluster.selectedItem.extended_ballot_boxes){
							this.loadingCluster = null;
				
						}
					}	
		   }
    }
    
	componentWillUnmount(){
		  this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CLEAN_ALL_DATA});
	}
    getRealRowIndex(){
        let realRowIndex = -1;

        for(let i = 0 ; i < this.props.clusters.length ; i++){
            if(this.props.clusters[i].id == this.props.searchScreen.selectedCluster.selectedItem.id){
                realRowIndex = i;
                break;
            }
        }
        return realRowIndex;
    }
    render() {
        this.initDynamicVariables();
        return (
            <div>
			
               <div className="row">
                     <div className="col-md-6 text-right">
                         <h1>{this.systemTitle}</h1>
                     </div>
               </div>
              <SearchPanel clusterRequired={true} getRealRowIndex={this.getRealRowIndex.bind(this)}/>
			  {this.loadingCluster}
               {this.searchResultsItem}
	
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
      currentUser: state.system.currentUser,
      currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
      showSearchResults:state.elections.managementCityViewScreen.showSearchResults,
      currentPage :state.elections.managementCityViewScreen.currentPage,
      displayItemsPerPage :state.elections.managementCityViewScreen.displayItemsPerPage,
      clusters:state.elections.managementCityViewScreen.clusters,
      searchScreen:state.elections.managementCityViewScreen.searchScreen,
      electionRolesShifts: state.elections.activistsScreen.electionRolesShifts,
    }
}

export default connect(mapStateToProps)(withRouter(ClusterView));