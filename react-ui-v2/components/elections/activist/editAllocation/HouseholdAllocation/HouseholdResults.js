import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import Pagination from 'components/global/Pagination';
import ModalWindow from 'components/global/ModalWindow';
import HouseholdItem from './HouseholdItem';
import HouseholdLoadingData from './HouseholdLoadingData';

import * as ElectionsActions from 'actions/ElectionsActions';


class HouseholdResults extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,

            currentPageHouseholds: [],

            selectedHouseholds: {},
            householdsWithCaptain50Hash: {},
            showHouseholdsHasCaptain50Modal: false,

            selectAllHouseholds: false,

            numberOfHouseholdsToSelect: 50,
            numberOfHouseholdsToComplete: 50,
            allBallotHouseHolds: false,
            allocatedHouseholdsHash: {},
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.maxRecoredsFromDb = constants.activists.maxRecoredsFromDb;

        this.householdsPerPage = 50;

        this.buttonsTexts = {
            select: 'בחר',
            complete: 'השלם',
            add: 'הוסף'
        };
		
        this.searchResultsHeaderFont = {fontSize:'16px' , fontWeight:'600' , marginTop:'10px'};
        this.captainRole = this.props.electionRoles.find(function (role) { 
           return ( role.system_name == 'captain_of_fifty' )
        })
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.editCaptainHouseholdsFlag && nextProps.editCaptainHouseholdsFlag) {
            this.setState({selectedHouseholds: {}, selectAllHouseholds: false, allBallotHouseHolds: false});

            this.loadPageHouseholds(this.state.currentPage, nextProps);
        }

        if ( !this.props.loadingHouseholdsFlag && nextProps.loadingHouseholdsFlag) {
            this.setState({currentPage: 1, currentPageHouseholds: [], allBallotHouseHolds: false});
        }

        if ( !this.props.loadedHouseholdsFlag && nextProps.loadedHouseholdsFlag && nextProps.totalHouseholdsSearchResult > 0) {
            this.setState({currentPage: 1, allBallotHouseHolds: false});

            this.loadPageHouseholds(1, nextProps);

            this.loadMoreHouseholds(3, nextProps);
        }

        if ( !this.props.loadedMoreHouseholdsFlag && nextProps.loadedMoreHouseholdsFlag) {
            this.loadPageHouseholds(this.state.currentPage, nextProps);
        }
    }

    getAllocatedHouseholds(electionsRolesByVoter) {
        let allocatedHouseholdsHash = {};
        let roleIndex = electionsRolesByVoter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.ministerOfFifty);

        if ( -1 == roleIndex ) {
            return;
        }

        for ( let householdIndex = 0; householdIndex < electionsRolesByVoter[roleIndex].captain50_households.length; householdIndex++ ) {
            let householdKey = 'household_' + electionsRolesByVoter[roleIndex].captain50_households[householdIndex].household_id;

            allocatedHouseholdsHash[householdKey] = true;
        }

        this.setState({allocatedHouseholdsHash});

        return allocatedHouseholdsHash;
    }
    checkIfHouseholdsHasCaptain50(){
        if(this.state.allBallotHouseHolds){
            let currentBallot = this.props.ballots.find((item) => {
                return item.id == this.props.householdSearchFields.ballot_id
            })
            ElectionsActions.addBallotHouseholdsToCaptain50(this.props.dispatch, this.props.activistKey, currentBallot.key);
            return;
        }
        if (Object.keys(this.state.householdsWithCaptain50Hash).length == 0) {
            this.addHouseholdsToCaptain50();
        } else {
            this.displayHouseholdsHasCaptain50Modal(true)
        }

    }
    displayHouseholdsHasCaptain50Modal(bool){
        this.setState({ showHouseholdsHasCaptain50Modal: bool })
    }
    addHouseholdsToCaptain50() {
        if ( Object.keys(this.state.selectedHouseholds).length == 0 ) {
            return;
        }
        let households = [];
  
        for ( let householdKey in this.state.selectedHouseholds ) {
            let householdKeyElements = householdKey.split('_');
            if(householdKeyElements[1]){
                households.push(householdKeyElements[1]);
            }
        }
        let voterKeys = [];
        if(this.props.getOnlyVoters){
            households.forEach((household_id) => {
                let voter = this.props.householdsSearchResult.find((item) => {return (item.household_id == household_id)})
                if(voter){
                    voterKeys.push(voter.voter_key);
                }
            })
        } 
        this.setState({ selectedHouseholds: {}, householdsWithCaptain50Hash: {}, currentPage: 1, showHouseholdsHasCaptain50Modal: false });

        ElectionsActions.addHouseholdsToCaptain50(this.props.dispatch, this.props.activistKey, households, voterKeys, this.props.getOnlyVoters);
    }

    getActivistHouseholds() {
        let activistItem = this.props.activistDetails;

        let roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.ministerOfFifty);
        if ( -1 == roleIndex ) {
            return [];
        }

        return activistItem.election_roles_by_voter[roleIndex].captain50_households;
    }

    completeHouseholdNumber() {
        let numberOfSelectedHouseholds = Object.keys(this.state.selectedHouseholds).length;
        let selectedHouseholds = this.state.selectedHouseholds;

        let householdsResultCnt = this.state.currentPageHouseholds.length;
        let numberOfHouseholdsToComplete = this.state.numberOfHouseholdsToComplete;

        if ( numberOfSelectedHouseholds >= numberOfHouseholdsToComplete )  {
            return;
        }

        for (let householdIndex = 0; householdIndex < householdsResultCnt; householdIndex++) {
            if ( numberOfSelectedHouseholds == numberOfHouseholdsToComplete ) { break; }

            let householdKey = 'household_' + this.state.currentPageHouseholds[householdIndex].household_id;
            let captainKey = this.state.currentPageHouseholds[householdIndex].captain_key;

            if ( captainKey != this.props.activistKey && this.state.selectedHouseholds[householdKey] != true ) {
                selectedHouseholds[householdKey] = true;
                numberOfSelectedHouseholds++;
            }
        }

        this.setState({selectedHouseholds});
    }

    selectHouseholds() {
        let numberOfSelectedHouseholds = Object.keys(this.state.selectedHouseholds).length;
        let selectedHouseholds = this.state.selectedHouseholds;

        let numberOfHouseholdsToSelect = this.state.numberOfHouseholdsToSelect;

        for (let householdIndex = 0; householdIndex < numberOfHouseholdsToSelect; householdIndex++) {
            if (this.state.currentPageHouseholds[householdIndex]) {
                let householdKey = 'household_' + this.state.currentPageHouseholds[householdIndex].household_id;
                let captainKey = this.state.currentPageHouseholds[householdIndex].captain_key;

                if (captainKey != this.props.activistKey && this.state.selectedHouseholds[householdKey] != true) {
                    selectedHouseholds[householdKey] = true;
                }
            }

        }

        this.setState({selectedHouseholds});
    }
    selectAllBallotHouseHolds(){
        this.setState({allBallotHouseHolds: !this.state.allBallotHouseHolds});
    }
    numberOfHouseholdsToSelectChange(event) {
        this.setState({numberOfHouseholdsToSelect: event.target.value});
    }

    numberOfHouseholdsToCompleteChange(event) {
        this.setState({numberOfHouseholdsToComplete: event.target.value});
    }

    loadPageHouseholds(currentPage, nextProps = null) {
        let currentPageHouseholds = [];
        let householdsSearchResult = [];
        let totalHouseholdsSearchResult = 0;
        let electionRolesByVoter = [];

        let bottomIndex = (currentPage - 1) * this.householdsPerPage;
        let topIndex = (currentPage * this.householdsPerPage) - 1;

        this.setState({currentPageHouseholds: []});

        if ( null == nextProps ) {
            householdsSearchResult= this.props.householdsSearchResult;
            totalHouseholdsSearchResult = this.props.totalHouseholdsSearchResult;

            electionRolesByVoter = this.props.activistDetails.election_roles_by_voter;
        } else {
            householdsSearchResult = nextProps.householdsSearchResult;
            totalHouseholdsSearchResult = nextProps.totalHouseholdsSearchResult;

            electionRolesByVoter = nextProps.activistDetails.election_roles_by_voter;
        }

        let allocatedHouseholdsHash = this.getAllocatedHouseholds(electionRolesByVoter);

        if ( topIndex > (totalHouseholdsSearchResult - 1) ) {
             topIndex = totalHouseholdsSearchResult - 1;
        }
        for ( let householdIndex = bottomIndex; householdIndex <= topIndex; householdIndex++ ) {

            if (!householdsSearchResult[householdIndex]) { continue; }
            let householdKey = 'household_' + householdsSearchResult[householdIndex].household_id;

            if ( allocatedHouseholdsHash[householdKey] != true ) {
                currentPageHouseholds.push(householdsSearchResult[householdIndex]);
            }else{
                topIndex++;
            }
        }

        this.setState({currentPageHouseholds});
    }

    loadMoreHouseholds(nextPage, nextProps = null) {
        let totalHouseholdsSearchResult = (null == nextProps) ? this.props.totalHouseholdsSearchResult : nextProps.totalHouseholdsSearchResult;
        let householdsSearchResult = (null == nextProps) ? this.props.householdsSearchResult : nextProps.householdsSearchResult;
        let householdSearchFields = (null == nextProps) ? this.props.householdSearchFields : nextProps.householdSearchFields;

        // total number of pages
        let totalPages = Math.ceil(totalHouseholdsSearchResult / this.householdsPerPage);

        // Checking if we are in the last page
        if (nextPage > totalPages) {
            return;
        }

        // number of households in pages 1 - nextPage
        let nextPageNumOfHouseholds = nextPage * this.householdsPerPage;

        // If number of households in pages from 1 till next page
        // are less than householdsSearchResult households, then there
        // is nothing to load
        if (nextPageNumOfHouseholds <= householdsSearchResult.length) {
            return;
        }

        let currentDbPage = Math.floor( (nextPage * this.householdsPerPage) / this.maxRecoredsFromDb ) + 1;
        if ( this.props.filterItems.length > 0 ) {
            ElectionsActions.loadMoreHouseholds(this.props.dispatch, householdSearchFields, currentDbPage, JSON.stringify(this.props.filterItems));
        } else {
            ElectionsActions.loadMoreHouseholds(this.props.dispatch, householdSearchFields, currentDbPage);
        }
    }

    navigateToPage(pageIndex) {
        this.setState({currentPage: pageIndex});

        this.setState({selectAllHouseholds: false});

        this.loadPageHouseholds(pageIndex);

        this.loadMoreHouseholds(pageIndex + 1);
        this.loadMoreHouseholds(pageIndex + 2);
    }

    changeSelectedHousehold(householdId, captainId) {
        let householdKey = 'household_' + householdId;
        let selectedHouseholds = this.state.selectedHouseholds;
        let householdsWithCaptain50Hash = this.state.householdsWithCaptain50Hash;

        if (selectedHouseholds[householdKey] ) {
            delete selectedHouseholds[householdKey];
            if(captainId){ delete householdsWithCaptain50Hash[householdKey];}
        } else {
            selectedHouseholds[householdKey] = true;
            if(captainId){  householdsWithCaptain50Hash[householdKey] = true; }
        }
        this.setState({selectedHouseholds, householdsWithCaptain50Hash});
    }
	
	selectUnselectAll(e) {
        let householdsWithCaptain50Hash = this.state.householdsWithCaptain50Hash;

		let selectedHouseholds = [];
		let selectAllHouseholds = !this.state.selectAllHouseholds;

        for(let i = 0 ; i < this.state.currentPageHouseholds.length ; i++){
            let householdKey = 'household_' + this.state.currentPageHouseholds[i].household_id;
            let captainId =this.state.currentPageHouseholds[i].captain_id;
            if (selectAllHouseholds) {
                selectedHouseholds[householdKey] = true;
                if (captainId) { householdsWithCaptain50Hash[householdKey] = true; }
            } else {
                delete selectedHouseholds[householdKey];
                if (captainId) { delete householdsWithCaptain50Hash[householdKey]; }
            }
        }
 
        this.setState({selectedHouseholds,householdsWithCaptain50Hash, selectAllHouseholds});
    }

    isActivistLocked() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);

        return (activistItem.election_roles_by_voter[roleIndex].user_lock_id != null);
    }

    renderHouseholds() {
        let that = this;
        let isActivistLocked = this.isActivistLocked();

		let households = null;
		
		if(this.state.currentPageHouseholds){
			households = this.state.currentPageHouseholds.map( function (item, index) {
				if(!item){return;}
				let householdKey = 'household_' + item.household_id;
				let householdIndex = (that.state.currentPage - 1) * that.householdsPerPage + index + 1;

				return <HouseholdItem key={index}
					householdIndex={householdIndex}
					item={item} activistKey={that.props.activistKey}
					householdSelected={that.state.selectedHouseholds[householdKey] == true}
					householdAllocated={that.state.allocatedHouseholdsHash[householdKey] == true}
					changeSelectedHousehold={that.changeSelectedHousehold.bind(that)}
					isActivistLocked={isActivistLocked}
					currentUser={that.props.currentUser}
					captainRoleKey={that.captainRole.key}
				/>
			});

			return <tbody>{households}</tbody>;
		}
		else{
			return null;
		}
    }

    getCounterTitle() {
        let bottomIndex = (this.state.currentPage - 1) * this.householdsPerPage + 1;
        let topIndex = this.state.currentPage * this.householdsPerPage;
        let counterTitle = 'מציג תוצאות ';

        if ( this.props.totalHouseholdsSearchResult == 0 ) {
            return counterTitle;
        }

        if ( topIndex > this.props.totalHouseholdsSearchResult ) {
            topIndex = this.props.totalHouseholdsSearchResult;
        }

        counterTitle += bottomIndex + '-' + topIndex;

        return counterTitle;
    }

    getCurrentCaptainHouseholdsCount(){
        return Object.keys(this.state.allocatedHouseholdsHash).length;
    }

    renderActionsBlock(totalHouseholdsSearchResult ) {
        let needToDisplayResult = (totalHouseholdsSearchResult > 0 ? "" : " hidden");
        if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.captain_of_fifty.edit'] == true ) {
            
            let searchHasBallot = this.props.householdSearchFields.ballot_id;
            const completeHouseholdsElements = [
                    <div key={0} className={"col-md-3 nopaddingR filterRslts" + needToDisplayResult} style={{textAlign:'right' ,width: searchHasBallot ? '28%' : '30%'}}>
                        <div className="form-group">
  
                            <label htmlFor="inputActions-household-result" className="col-sm-2 control-label"
                                style={this.searchResultsHeaderFont}>בחר</label>
                            <div className="col-sm-2 nopadding">
                                <select className="form-control" id="inputActions-household-result"
                                        value={this.state.numberOfHouseholdsToSelect}
                                        onChange={this.numberOfHouseholdsToSelectChange.bind(this)}>
                                    <option value={50}>50</option>
                                    <option value={20}>20</option>
                                    <option value={10}>10</option>
                                </select>
                            </div>
                            <div className="col-sm-5 filterDscrp" style={this.searchResultsHeaderFont}> רשומות ראשונות</div>
                        </div>
                        <div className="col-sm-2" style={{bottom: '12px' , paddingLeft:'10px'}}>
                            <button type="submit" className="btn new-btn-default submitBtn"
                                    onClick={this.selectHouseholds.bind(this)}>
                                {this.buttonsTexts.select}
                            </button>
                        </div>
 
                </div>,
                <div key={1} className={"col-md-3 nopaddingR filterRslts" + needToDisplayResult} style={{width: searchHasBallot ? '29%' : '31%'}}>
                        { !this.state.allBallotHouseHolds &&
                            <div className="form-group">
                                    <label htmlFor="inputActions-household-result" className="col-sm-3 control-label"  style={this.searchResultsHeaderFont}>השלם ל</label>
                                    <div className="col-sm-3 nopadding">
                                        <select className="form-control" id="inputActions-household-result"
                                                value={this.state.numberOfHouseholdsToComplete}
                                                onChange={this.numberOfHouseholdsToCompleteChange.bind(this)} style={{marginTop:'2px'}}>
                                            <option value={50}>50</option>
                                            <option value={20}>20</option>
                                            <option value={10}>10</option>
                                        </select>
                                    </div>
                                    <div className="col-sm-3 filterDscrp"  style={this.searchResultsHeaderFont}>בתי אב</div>
                                    <div className="col-sm-2" style={{right: '26px'}}>
                                        <button type="submit" className="btn new-btn-default submitBtn"
                                                onClick={this.completeHouseholdNumber.bind(this)}>
                                            {this.buttonsTexts.complete}
                                        </button>
                                    </div>
     
                            </div>
                        }
    
                </div>
            ];
                const resultDataElement = <div key={4} className="col-md-3 rsltsTitle nopaddingL" style={{textAlign:'right', width: searchHasBallot ? '21%' : '26%'}}>
                                                <div  style={this.searchResultsHeaderFont}>נמצאו <span className="rsltsCounter">{totalHouseholdsSearchResult}</span>
                                                    בתי אב  &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; 
                                                    {this.getCounterTitle()}
                                                    <span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>
                                                </div>
                                            </div>
                const allBallotElement = <div key={2} className={"col-md-1 nopaddingL filterRslts" + needToDisplayResult }   style={{textAlign:'left', width:'10%'}}>
                                            <label className="checkbox">
                                                <input type="checkbox"  onChange={this.selectAllBallotHouseHolds.bind(this)}/>
                                                כל הקלפי
                                                <span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>
                                            </label>
                                        </div>;

                let buttonDisabled =(this.props.loadingHouseholdsFlag  || this.props.editingCaptainHouseholdsFlag) ||
                (Object.keys(this.state.selectedHouseholds).length == 0 && !this.state.allBallotHouseHolds)
                const AddButtonElement = <div key={3} className={"col-md-2 attAddBtn" + needToDisplayResult} style={{width:'10%'}}>
                                            <button className="btn btn-primary srchBtn pull-left"
                                                    disabled={buttonDisabled}
                                                    onClick={this.checkIfHouseholdsHasCaptain50.bind(this)}>
                                                {this.buttonsTexts.add}
                                            </button>
                                        </div>
                const displayElements = [resultDataElement];

                if(searchHasBallot){
                    displayElements.push(allBallotElement)
                }
                if(!this.state.allBallotHouseHolds){
                    completeHouseholdsElements.forEach(el => {
                        displayElements.push(el);
                    })
                }
                displayElements.push(AddButtonElement)
            return (displayElements);
        } else {
            return (
                [
                    <div key={0} className="col-sm-3 nopaddingR filterRslts">{'\u00A0'}</div>,
                    <div key={1} className="col-sm-3 nopaddingR filterRslts">{'\u00A0'}</div>,
                    <div key={2} className="col-sm-2 attAddBtn">{'\u00A0'}</div>
                ]
            );
        }
    }
    render() {
        let currentCaptainHouseholdsCount =this.getCurrentCaptainHouseholdsCount();
        let numberOfHouseholdsWithCaptain50 = Object.keys(this.state.householdsWithCaptain50Hash).length;
        let totalHouseholdsSearchResult = this.props.totalHouseholdsSearchResult;
        //if(!this.props.currentUser.admin){ totalHouseholdsSearchResult -= currentCaptainHouseholdsCount; } //Old code, user can now assign more than 50 households
        let modalTitle = ' שים לב! קיימים ' + numberOfHouseholdsWithCaptain50 + ' משוייכים לשר 100 אחר! ' ;

        return (
            
            <div className={"containerStrip srchRsltsAt" + (this.props.loadingHouseholdsFlag ? " hidden" : "")}>
                <div className="row rsltsTitleRow">

                    {this.renderActionsBlock(totalHouseholdsSearchResult )}
                    { ( this.props.editingCaptainHouseholdsFlag ) && 
                        <HouseholdLoadingData divClass={''}/>
                    }
                </div>
                { (this.props.loadingMoreHouseholdsFlag ) && 
                    <HouseholdLoadingData/>
                }

                <div className="tableList attribtnRslts">
                    <div className="table-responsive">
                        <table className="table table-frame table-striped tableNoMarginB">
                            <thead>
                            <tr>
                                <th><input type="checkbox" checked={this.state.selectAllHouseholds}
                                           onChange={this.selectUnselectAll.bind(this)}/></th>
                                <th>מספר</th>
                                <th>שם משפחה</th>
                                <th>מספר תושבים</th>
                                <th>כתובת בפועל</th>
                                <th>אשכול</th>
                                <th>קלפי</th>
                                <th>שם שר מאה</th>
                            </tr>
                            </thead>

                            {this.renderHouseholds()}
                        </table>
                    </div>
                </div>


                {( totalHouseholdsSearchResult > this.householdsPerPage ) &&
                <div className="row">
                    <Pagination resultsCount={totalHouseholdsSearchResult}
                                displayItemsPerPage={this.householdsPerPage}
                                currentPage={this.state.currentPage}
                                navigateToPage={this.navigateToPage.bind(this)}/>
                </div>
                }
                <div className="householdsHasCaptain50Modal" style={{ width: '400px' }}>
                    <ModalWindow
                        title={modalTitle}
                        show={this.state.showHouseholdsHasCaptain50Modal}
                        buttonCancel={this.displayHouseholdsHasCaptain50Modal.bind(this, false)}
                        buttonX={this.displayHouseholdsHasCaptain50Modal.bind(this, false)}
                        buttonOk={this.addHouseholdsToCaptain50.bind(this)}
                    >
                        <div>האם ברצונך לשייך אותם לשר 100 אחר?</div>
                    </ModalWindow>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        activistKey: state.elections.activistsScreen.activistDetails.key,
        activistDetails: state.elections.activistsScreen.activistDetails,
        householdsSearchResult: state.elections.activistsScreen.householdsSearchResult,
        totalHouseholdsSearchResult: state.elections.activistsScreen.totalHouseholdsSearchResult,
        householdSearchFields: state.elections.activistsScreen.householdSearchFields,

        editCaptainHouseholdsFlag: state.elections.activistsScreen.editCaptainHouseholdsFlag,
        editingCaptainHouseholdsFlag: state.elections.activistsScreen.editingCaptainHouseholdsFlag,

        loadingHouseholdsFlag: state.elections.activistsScreen.loadingHouseholdsFlag,
        loadedHouseholdsFlag: state.elections.activistsScreen.loadedHouseholdsFlag,
        loadingMoreHouseholdsFlag: state.elections.activistsScreen.loadingMoreHouseholdsFlag,
        loadedMoreHouseholdsFlag: state.elections.activistsScreen.loadedMoreHouseholdsFlag,
        electionRoles: state.elections.activistsScreen.electionRoles,

        filterItems: state.global.voterFilter.captain50_activist.vf.filter_items,
        ballots: state.elections.activistsScreen.household.combos.ballots
    };
}

export default connect(mapStateToProps) (HouseholdResults);