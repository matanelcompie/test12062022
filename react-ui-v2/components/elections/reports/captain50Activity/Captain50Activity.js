import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import store from '../../../../store';
import ModalWindow from 'components/global/ModalWindow';

import Captain50ActivitySearch from './Captain50ActivitySearch';
import Captain50ActivityActions from './Captain50ActivityActions';
import Captain50ActivitySearchResult from './Captain50ActivitySearchResult';
import Captain50ActivityLoadingData from './Captain50ActivityLoadingData';

import * as SystemActions from '../../../../actions/SystemActions';
import * as ElectionsActions from '../../../../actions/ElectionsActions';


class Captain50Activity extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,

            recordsPerPage: 30,

            currentPageRows: [] , 
			displayCaptainBallotsModal: false
        };
        this.screenPermission = 'elections.reports.captain_of_fifty_activity';
    }

    componentWillMount() {
		 this.props.dispatch({type : ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CLEAN_SCREEN});
        // Making sure that current user has been loaded
        if ( this.props.currentUser.first_name.length > 0 ) {
            // Checking if user is permitted to use the resource
            if ( !this.props.currentUser.admin && this.props.currentUser.permissions[this.screenPermission] != true ) {
                this.props.router.push('/unauthorized');
            }
        }

        SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
        ElectionsActions.loadSupportStatusesForCaptainActivity(this.props.dispatch);

        this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'דוח פעילות שרי מאה'});
    }

    componentDidMount() {
        let breadcrumbNewLocation = {
            elmentType: 'captain50',
            title: 'דוח פעילות שרי מאה',
            url: 'elections/reports/captain_fifty_activity'
        };
        this.props.dispatch({type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: breadcrumbNewLocation});
    }

    componentWillReceiveProps(nextProps) {
        // Making sure that current user has been loaded
        if ( 0 == this.props.currentUser.first_name.length && nextProps.currentUser.first_name.length > 0) {
            // Checking if user is permitted to use the resource
            if ( !nextProps.currentUser.admin && nextProps.currentUser.permissions[this.screenPermission] != true ) {
                this.props.router.push('/unauthorized');
            }
        }

        if ( this.props.summaryResult.length == 0 && nextProps.summaryResult.length > 0 ) {
            this.setState({currentPage: 1});

            this.loadPageRows(1, nextProps);

            this.loadMoreRows(3, nextProps);
        }
    }

    loadPageRows(currentPage, nextProps = null) {
        let currentPageRows = [];
        let summaryResult = [];
        let totalSummaryResults = 0;

        let bottomIndex = (currentPage - 1) * this.state.recordsPerPage;
        let topIndex = (currentPage * this.state.recordsPerPage) - 1;

        this.setState({currentPageRows: []});

        if ( null == nextProps ) {
            summaryResult= this.props.summaryResult;
            totalSummaryResults = this.props.totalSummaryResults;
        } else {
            summaryResult = nextProps.summaryResult;
            totalSummaryResults = nextProps.totalSummaryResults;
        }

        if ( topIndex > (totalSummaryResults - 1) ) {
            topIndex = totalSummaryResults - 1;
        }

        for ( let rowIndex = bottomIndex; rowIndex <= topIndex; rowIndex++ ) {
            currentPageRows.push(summaryResult[rowIndex]);
        }

        this.setState({currentPageRows});
    }

    loadMoreRows(nextPage, nextProps = null) {
        const maxRecoredsFromDb = 100;

        let totalSummaryResults = (null == nextProps) ? this.props.totalSummaryResults : nextProps.totalSummaryResults;
        let summaryResult = (null == nextProps) ? this.props.summaryResult : nextProps.summaryResult;
        let searchFields = (null == nextProps) ? this.props.searchFields : nextProps.searchFields;

        // total number of pages
        let totalPages = Math.ceil(totalSummaryResults / this.state.recordsPerPage);

        // Checking if we are in the last page
        if (nextPage > totalPages) {
            return;
        }

        // number of rows in pages 1 - nextPage
        let nextPageNumOfRecords= nextPage * this.state.recordsPerPage;

        // If number of rows in pages from 1 till next page
        // are less than summaryResult rows, then there
        // is nothing to load
        if (nextPageNumOfRecords <= summaryResult.length) {
            return;
        }

        let currentDbPage = Math.floor( (nextPage * this.state.recordsPerPage) / maxRecoredsFromDb ) + 1;
        ElectionsActions.loadMoreCaptain50Activity(this.props.dispatch, searchFields, currentDbPage);
    }

    navigateToPage(pageIndex) {
        this.setState({currentPage: pageIndex});

        this.loadPageRows(pageIndex);

        this.loadMoreRows(pageIndex + 1);
        this.loadMoreRows(pageIndex + 2);
    }

    recordsPerPageChange(rowsPerPage) {
        this.setState({recordsPerPage: rowsPerPage});
    }

    loadNewPerPageRows() {
        this.navigateToPage(1);
    }

    cancelSearch() {
        ElectionsActions.cancelCaptain50ActivityReport();
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CAPTAIN.UNSET_LOADING_DATA_FLAG});
    }

		
	/*
	Performs field validations for render() method
	*/
	validateFields(){
		this.validatorsObject = {};
		let validatedArea  = true;
		let validatedSubArea  = true;
		let validatedCity  = true;
		let validatedNeighborhood  = true;
		let validatedMinimumSearch = true;
		if(!this.props.searchScreen.selectedArea.selectedItem && this.props.searchScreen.selectedArea.selectedValue && this.props.searchScreen.selectedArea.selectedValue.split(' ').join('') != ''){
			validatedArea = false;

		}
		if(!this.props.searchScreen.selectedSubArea.selectedItem && this.props.searchScreen.selectedSubArea.selectedValue && this.props.searchScreen.selectedSubArea.selectedValue.split(' ').join('') != ''){
			validatedSubArea = false;
		}
		if(!this.props.searchScreen.selectedCity.selectedItem && this.props.searchScreen.selectedCity.selectedValue && this.props.searchScreen.selectedCity.selectedValue.split(' ').join('') != ''){
			validatedCity = false;
 
		}
		if(!this.props.searchScreen.selectedNeighborhood.selectedItem && this.props.searchScreen.selectedNeighborhood.selectedValue && this.props.searchScreen.selectedNeighborhood.selectedValue.split(' ').join('') != ''){
			validatedNeighborhood = false;
		}
	 
	    if(!this.props.searchScreen.selectedCity.selectedItem && !this.props.searchScreen.selectedArea.selectedItem){
			validatedMinimumSearch  = false;
			
		}
		 
	    this.validatorsObject.validatedArea = validatedArea;
		this.validatorsObject.validatedSubArea = validatedSubArea;
		this.validatorsObject.validatedCity = validatedCity;
		this.validatorsObject.validatedNeighborhood = validatedNeighborhood;
		this.validatorsObject.validatedMinimumSearch = validatedMinimumSearch;
	}
	
	displayCaptainBallots(captainKey){
        ElectionsActions.getCaptainBallots(this.props.dispatch, captainKey);
        setTimeout(() => {
            this.setState({displayCaptainBallotsModal: true})
        }, 1000)
    }
    renderCaptainBallots(){
       return this.props.captain_ballots.map((item, i) => {
            return (
                <tr key={i}>
                    <td>{item.mi_id}</td>
                    <td>{item.city_name}</td>
                </tr>
            )
        })
    }
    hideModal(){
        this.setState({displayCaptainBallotsModal: false})
    }
    renderCaptainBallotsModal(){
        return (
            <ModalWindow
            show={this.state.displayCaptainBallotsModal} buttonX={this.hideModal.bind(this)} buttonOk={this.hideModal.bind(this)}
            title="תצוגת קלפיות לשר50" style={{zIndex: '9001'}}
        >
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>קלפי</th>
                        <th>עיר</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderCaptainBallots()}
                </tbody>
            </table>
        </ModalWindow>
        )
    }
    render() {
		
		this.validateFields();
        return (
            <div className="container">
                    <div className="row">
                     <div className="col-md-6 text-right">
                         <h1>דוח פעילות שרי מאה</h1>
                     </div>
                    </div>
                    <Captain50ActivitySearch validatorsObject={this.validatorsObject} />

                    { (this.props.loadingData) &&
                        <Captain50ActivityLoadingData cancelSearch={this.cancelSearch.bind(this)}/>
                    }

                    <Captain50ActivityActions totalSummaryResults={this.props.totalSummaryResults} recordsPerPage={this.state.recordsPerPage}
                                              recordsPerPageChange={this.recordsPerPageChange.bind(this)}
                                              loadNewPerPageRows={this.loadNewPerPageRows.bind(this)} searchFields={this.props.searchFields}/>

					{this.props.summaryResult.length == 0 && this.props.loadedFirstSearchResults ? (this.props.loadingData?null:<div style={{textAlign:'center'}}>לא נמצאו תוצאות</div>) : 						  
                          <Captain50ActivitySearchResult supportStatuses={this.props.supportStatuses}
                                                   totalSummaryResults={this.props.totalSummaryResults}
                                                   currentPageRows={this.state.currentPageRows}
                                                   displayItemsPerPage={this.state.recordsPerPage}
                                                   currentPage={this.state.currentPage}
                                                   navigateToPage={this.navigateToPage.bind(this)}
                                                   displayCaptainBallots={this.displayCaptainBallots.bind(this)}
												  currentUser={this.props.currentUser}/>
	                }
                { this.renderCaptainBallotsModal() }
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
        supportStatuses: state.elections.captainScreen.supportStatuses,

        loadingData: state.elections.captainScreen.loadingData,
        loadedFirstSearchResults : state.elections.captainScreen.loadedFirstSearchResults,
        searchFields: state.elections.captainScreen.searchFields,
        searchScreen : state.elections.captainScreen.searchScreen,
        totalSummaryResults: state.elections.captainScreen.result.totalSummaryResults,
        summaryResult: state.elections.captainScreen.result.summaryResult,
        captain_ballots: state.elections.captainScreen.captain_ballots
    }
}

export default connect(mapStateToProps) (withRouter(Captain50Activity));