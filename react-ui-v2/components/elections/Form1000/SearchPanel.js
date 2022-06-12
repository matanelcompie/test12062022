import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../global/Combo';
import * as ElectionsActions from '../../../actions/ElectionsActions';

class SearchPanel extends React.Component {

    constructor(props) {
        super(props);
    }
	
	/*
	Handles printing data by cityKey/clusterKey
	*/
	exportData() {
		let extraData = '';
		if(this.props.searchScreen.selectedCity.selectedItem){
			extraData += ("cityKey="+this.props.searchScreen.selectedCity.selectedItem.key);
		}
		if(this.props.searchScreen.selectedCluster.selectedItem){
			if(extraData != ''){
				extraData += "&";
			}
			extraData += ("clusterKey="+this.props.searchScreen.selectedCluster.selectedItem.key);
		}
		if ( this.props.searchScreen.selectedBallotbox.selectedItem ) {
            if(extraData != ''){
                extraData += "&";
            }
            extraData += ("ballotBoxKey="+this.props.searchScreen.selectedBallotbox.selectedItem.key);
        }
		if(extraData){
			let url = (window.Laravel.baseURL + 'api/elections/form1000/export?' + extraData);
			window.open(url, '_blank');
		}
	}

    /*
           Handles change in one of search-comboes 
    */
    searchFieldComboValueChange(fieldName, e) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SEARCH_SCREEN_ITEM_VALUE_CHANGE, fieldName: 'showSearchResults', fieldValue: false });//hide search results on any change

        this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.CLEAN_RESULTS_SCREEN });//hide and clean all previou search results search results on any change
        this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SEARCH_SCREEN_ITEM_VALUE_CHANGE, fieldName, fieldValue: { selectedValue: e.target.value, selectedItem: e.target.selectedItem } });
        switch (fieldName) {
            case 'selectedCity':
                this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SEARCH_SCREEN_ITEM_VALUE_CHANGE, fieldName: 'selectedCluster', fieldValue: { selectedValue: '', selectedItem: null } });
                this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SEARCH_SCREEN_ITEM_VALUE_CHANGE, fieldName: 'selectedBallotbox', fieldValue: { selectedValue: '', selectedItem: null } });
                if (e.target.selectedItem) {
                    //   ElectionsActions.loadClustersAndBallotsByCity(this.props.dispatch , e.target.selectedItem.key);
                    ElectionsActions.loadActivistCityClusters(this.props.dispatch, e.target.selectedItem.key, ElectionsActions.ActionTypes.FORM1000.UPDATE_CLUSTERS_LIST);
                    ElectionsActions.loadActivistCityBallots(this.props.dispatch, e.target.selectedItem.key, ElectionsActions.ActionTypes.FORM1000.UPDATE_BALLOTS_LIST);
                }
                else {
                    this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SEARCH_SCREEN_ITEM_VALUE_CHANGE, fieldName: 'clusters', fieldValue: [] });
                    this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SEARCH_SCREEN_ITEM_VALUE_CHANGE, fieldName: 'ballotBoxes', fieldValue: [] });
                }
                break;
            case 'selectedCluster':
                this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SEARCH_SCREEN_ITEM_VALUE_CHANGE, fieldName: 'selectedBallotbox', fieldValue: { selectedValue: '', selectedItem: null } });

                if (e.target.selectedItem) {
                    ElectionsActions.loadActivistClusterBallots(this.props.dispatch , e.target.selectedItem.key , ElectionsActions.ActionTypes.FORM1000.UPDATE_BALLOTS_LIST,false);
                }
                else {
                    this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SEARCH_SCREEN_ITEM_VALUE_CHANGE, fieldName: 'ballotBoxes', fieldValue: [] });
                }
                break;
            default:
                break;
        }

    }
    /*
         This will display search retults on button click.
    */
    showSearchResults() {
        this.props.setRouteDataClean(false);
        ElectionsActions.loadBallotboxVotersVotesData(this.props.dispatch, this.props.router, this.props.searchScreen.selectedBallotbox.selectedItem.key, false);
        this.props.router.push('elections/form1000/' + this.props.searchScreen.selectedBallotbox.selectedItem.key);
    }

	/*
		Function that handles 'clean all' button :
    */
    cleanAll() {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.CLEAN_SEARCH_SCREEN });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.CLEAN_RESULTS_SCREEN });
        this.props.router.push('elections/form1000');
    }

    render() {
		let isPrintAllDisabled = (!this.props.searchScreen.selectedCity.selectedItem && !this.props.searchScreen.selectedCluster.selectedItem);
        return (<div className="dtlsBox srchPanel first-box-on-page clearfix" style={{ marginTop: '15px' }}>
            <div className="row">

                <div className="col-lg-3 col-md-3">
                    <div className="form-group">
                        <label htmlFor="searchByCity" className="control-label">עיר</label>
                        <Combo items={this.props.currentUserGeographicalFilteredLists.cities} autoFocus={true} placeholder="בחר עיר" maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedCity.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedCity')}  inputStyle={{ borderColor: (this.props.searchScreen.selectedCity.selectedItem == null ? '#ff0000' : '#ccc') }} />
                    </div>
                </div>
                <div className="col-lg-3 col-md-3">
                    <div className="form-group">
                        <label htmlFor="sub-staff2" className="control-label">אשכול</label>
                        <Combo items={this.props.searchScreen.clusters} placeholder="בחר אשכול" maxDisplayItems={5}
                         itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedCluster.selectedValue}
                          onChange={this.searchFieldComboValueChange.bind(this, 'selectedCluster')} />
                    </div>
                </div>
                <div className="col-lg-3 col-md-3">
                    <div className="form-group">
                        <label htmlFor="sub-staff2" className="control-label">קלפי</label>
                        <Combo items={this.props.searchScreen.ballotBoxes} placeholder="בחר קלפי" maxDisplayItems={5}
                         itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedBallotbox.selectedValue}
                          onChange={this.searchFieldComboValueChange.bind(this, 'selectedBallotbox')} inputStyle={{ borderColor: (this.props.searchScreen.selectedBallotbox.selectedItem == null ? '#ff0000' : '#ccc') }} />
                    </div>
                </div>
                <div className="col-lg-3 col-md-3">
                    <div className="box-button-single">
                        <button title="הצג" type="submit" className="btn btn-primary srchBtn pull-right" disabled={!this.props.searchScreen.selectedBallotbox.selectedItem} onClick={this.showSearchResults.bind(this)} >הצג</button>
                        <button title="נקה" type="submit" className="btn btn-warning srchBtn pull-right" disabled={false} onClick={this.cleanAll.bind(this)} style={{backgroundColor:'#f0ad4e', marginRight: '10px'}}>נקה הכל</button>
                        {(this.props.currentUser.admin || this.props.currentUser.permissions['elections.form1000.print'] == true) && <a title="הדפסה" style={{ cursor: 'pointer' , marginTop:'22px' , cursor:(isPrintAllDisabled ? 'not-allowed':'pointer') , opacity:(isPrintAllDisabled ? 0.5:1) }} className="icon-box print pull-right"  onClick={isPrintAllDisabled ? null : this.exportData.bind(this)}  ></a>}
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
        clusters: state.elections.managementCityViewScreen.clusters,
        searchScreen: state.elections.form1000Screen.searchScreen,

    }
}

export default connect(mapStateToProps)(withRouter(SearchPanel));