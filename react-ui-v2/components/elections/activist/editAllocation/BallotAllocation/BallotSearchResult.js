import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import Pagination from 'components/global/Pagination';
import ModalWindow from 'components/global/ModalWindow';
import BallotItem from './BallotItem';
import BallotDumbItem from './BallotDumbItem';
import BallotAdminItem from './BallotAdminItem';
import ReplaceShiftAlertModal from './ReplaceShiftAlertModal';

import * as ElectionsActions from 'actions/ElectionsActions';



class BallotSearchResult extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: null,

            currentPageBallots: [],

            allocationAlertModal: {
                show: false,
                title: '',
                content: ''
            },

            replaceAllocationAlertModa: {
                show: false,
                ballotItem: {},
                geoItem: {}
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.maxRecoredsFromDb = constants.activists.maxRecoredsFromDb;
        this.roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;

        this.ballotsPerPage = 30;

        //Can use for all ballots cols style.
        this.ballotsTableColsHeights = {
            city_name: '8%',
            cluster_name: '12%',
            address: '15%',
            mid: '7%',
            type: '7%',
            shift: '8%',
            role: '8%',
            form: '452px',
        }

        //list of contradicts shifts
        this.shiftContradictionHash = {};
        this.shiftContradictionHash[this.roleShiftsSytemNames.first] = [
            this.roleShiftsSytemNames.first,
            this.roleShiftsSytemNames.allDay,
            this.roleShiftsSytemNames.allDayAndCount
        ];
        this.shiftContradictionHash[this.roleShiftsSytemNames.second] = [
            this.roleShiftsSytemNames.second,
            this.roleShiftsSytemNames.allDay,
            this.roleShiftsSytemNames.allDayAndCount,
            this.roleShiftsSytemNames.secondAndCount
        ];
        this.shiftContradictionHash[this.roleShiftsSytemNames.allDay] = [
            this.roleShiftsSytemNames.first,
            this.roleShiftsSytemNames.second,
            this.roleShiftsSytemNames.allDay,
            this.roleShiftsSytemNames.secondAndCount,
            this.roleShiftsSytemNames.allDayAndCount
        ];
        this.shiftContradictionHash[this.roleShiftsSytemNames.count] = [
            this.roleShiftsSytemNames.count,
            this.roleShiftsSytemNames.secondAndCount,
            this.roleShiftsSytemNames.allDayAndCount
        ];
        this.shiftContradictionHash[this.roleShiftsSytemNames.secondAndCount] = [
            this.roleShiftsSytemNames.second,
            this.roleShiftsSytemNames.allDay,
            this.roleShiftsSytemNames.secondAndCount,
            this.roleShiftsSytemNames.allDayAndCount
        ];
        this.shiftContradictionHash[this.roleShiftsSytemNames.allDayAndCount] = [
            this.roleShiftsSytemNames.first,
            this.roleShiftsSytemNames.second,
            this.roleShiftsSytemNames.allDay,
            this.roleShiftsSytemNames.count,
            this.roleShiftsSytemNames.secondAndCount,
            this.roleShiftsSytemNames.allDayAndCount,
        ];
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.ballotsSearchResult.loadingBallotMemberBallots && nextProps.ballotsSearchResult.loadingBallotMemberBallots ) {
            this.setState({currentPage: 1, currentPageBallots: []});
        }

        if ( !this.props.ballotsSearchResult.loadingObserverBallots && nextProps.ballotsSearchResult.loadingObserverBallots ) {
            this.setState({currentPage: 1, currentPageBallots: []});
        }
        if ( !this.props.ballotsSearchResult.loadingCounterBallots && nextProps.ballotsSearchResult.loadingCounterBallots ) {
            this.setState({currentPage: 1, currentPageBallots: []});
        }
        if ( this.props.currentTabRoleSystemName != nextProps.currentTabRoleSystemName ) {
			let system_name = (nextProps.currentTabRoleSystemName == this.electionRoleSytemNames.ballotMember) ? 'ballotMember' : nextProps.currentTabRoleSystemName;

            this.setState({currentPage: 1});
            this.loadPageBallots(this.electionRoleSytemNames[system_name], 1, nextProps);
        }

        if ( !this.props.ballotsSearchResult.loadedObserverBallots && nextProps.ballotsSearchResult.loadedObserverBallots ) {
            this.setState({currentPage: 1});
            this.loadPageBallots(this.electionRoleSytemNames.observer, 1, nextProps);
        }

        if ( !this.props.ballotsSearchResult.loadedBallotMemberBallots && nextProps.ballotsSearchResult.loadedBallotMemberBallots ) {
            this.setState({currentPage: 1});
            this.loadPageBallots(this.electionRoleSytemNames.ballotMember, 1, nextProps);
        }
        
        if ( !this.props.ballotsSearchResult.loadedCounterBallots && nextProps.ballotsSearchResult.loadedCounterBallots ) {
            this.setState({currentPage: 1});
            this.loadPageBallots(this.electionRoleSytemNames.counter, 1, nextProps);
        }

        if ( !this.props.editedBalotBoxRoleFlag && nextProps.editedBalotBoxRoleFlag ) {
            this.loadPageBallots(this.electionRoleSytemNames.ballotMember, this.state.currentPage, nextProps);
        }
    }

    getShiftSystemName(electionRoleShiftkey) {
        let shiftIndex = this.props.electionRolesShifts.findIndex(item => item.key == electionRoleShiftkey);

        return this.props.electionRolesShifts[shiftIndex].system_name;
    }

    hideAllocationAlertModal() {
        let allocationAlertModal = {
            show: false,
            title: '',
            content: ''
        };

        this.setState({allocationAlertModal});
    }

    showAllocationAlertModal(electionRoleShiftkey) {
        let content = 'הפעיל משובץ לקלפי ';
        let shiftSystemName = this.getShiftSystemName(electionRoleShiftkey);
        let activistAllocatedShifts=this.props.activistAllocatedShifts;
        let showModal = false;
        let shiftSystemDataName;

        //find already allocated shift that contradicts the selected shift
        for (let otherShiftSystemName in activistAllocatedShifts) {
            if (this.shiftContradictionHash[otherShiftSystemName].indexOf(shiftSystemName) > -1) {
                showModal = true;
                shiftSystemDataName = otherShiftSystemName;
                break;
            }
        }

        //show modal if found contradict shift
        if (showModal) {
            let roleCurrentShiftData = activistAllocatedShifts[shiftSystemDataName];
            content += this.props.getBallotMiId(roleCurrentShiftData.ballotBoxMiId);
            content += ' באשכול ' + roleCurrentShiftData.clusterName;
            content += ' בתפקיד ' + roleCurrentShiftData.electionRoleName;
            content += ' במשמרת: ' + roleCurrentShiftData.electionRoleShiftName;
            let allocationAlertModal = {
                show: true,
                title: 'שיבוץ פעיל לקלפי',
                content: content
            };

            this.setState({ allocationAlertModal });
        }
    }

    /**
     * This function checks if the selected shift
     * can be assigned to the activist.
     *
     * @param electionRoleShiftkey - The selected shift to assign
     *                               for the activist
     *
     * @returns {boolean}
     */
    isShiftAllocatedToActivist(electionRoleShiftkey) {
        let shiftSystemName = this.getShiftSystemName(electionRoleShiftkey);
        //find already allocated shift that contradicts the selected shift
        for (let otherShiftSystemName in this.props.activistAllocatedShifts) {
            if (this.shiftContradictionHash[otherShiftSystemName].indexOf(shiftSystemName) > -1) return true;
        }
    }

    addGeoBallotToActivistRole(ballotKey, electionRoleShiftkey) {
        let activistItem = this.props.activistDetails;
        let electionRoleByVoterKey = null;

        let roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == this.props.currentTabRoleId);
        electionRoleByVoterKey = activistItem.election_roles_by_voter[roleIndex].key;

        this.hideReplaceShiftModal();

        ElectionsActions.addGeoBallotToActivistRole(this.props.dispatch, electionRoleByVoterKey, ballotKey, electionRoleShiftkey,
                                                    this.props.currentTabRoleId, this.props.searchBallotObj,this.props.currentTabRoleSystemName);
    }

    hideReplaceShiftModal() {
        let replaceAllocationAlertModa = this.state.replaceAllocationAlertModa;

        replaceAllocationAlertModa.show = false;
        replaceAllocationAlertModa.ballotItem = {};
        replaceAllocationAlertModa.geoItem = {};
        this.setState({replaceAllocationAlertModa});
    }

    showReplaceShiftModal(ballotItem, geoItem) {
        let replaceAllocationAlertModa = this.state.replaceAllocationAlertModa;

        replaceAllocationAlertModa.show = true;
        replaceAllocationAlertModa.ballotItem = ballotItem;
        replaceAllocationAlertModa.geoItem = geoItem;
        this.setState({replaceAllocationAlertModa});
    }

    replaceShift(ballotItem, geoItem) {
        if ( !this.isShiftAllocatedToActivist(geoItem.election_role_shift_key) ) {
            this.showReplaceShiftModal(ballotItem, geoItem);
        } else {
            this.showAllocationAlertModal(geoItem.election_role_shift_key);
        }
    }

    allocateShift(ballotKey, electionRoleShiftkey) {
        if ( !this.isShiftAllocatedToActivist(electionRoleShiftkey) ) {
            this.addGeoBallotToActivistRole(ballotKey, electionRoleShiftkey);
        } else {
            this.showAllocationAlertModal(electionRoleShiftkey);
        }
    }

    getElectionRoleKey() {
        let electionRoleIndex = this.props.electionRoles.findIndex(item => item.id == this.props.currentTabRoleId);

        return this.props.electionRoles[electionRoleIndex].key;
    }

    loadPageBallots(roleSystemName, currentPage, nextProps = null) {
        let currentPageBallots = [];
        let ballotsSearchResult = [];
        let totalBallotsSearchResult = 0;

        let electionsRolesByVoter = [];

        let bottomIndex = (currentPage - 1) * this.ballotsPerPage;
        let topIndex = (currentPage * this.ballotsPerPage) - 1;

        this.setState({currentPageBallots: []});

        let currentProps = nextProps ?nextProps : this.props;
            switch (roleSystemName) {
                case this.electionRoleSytemNames.observer:
                    ballotsSearchResult= currentProps.ballotsSearchResult.observer;
                    totalBallotsSearchResult = currentProps.ballotsSearchResult.observerTotalBallots;
                    break;

                case this.electionRoleSytemNames.ballotMember:
                    ballotsSearchResult= currentProps.ballotsSearchResult.ballotMember;
                    totalBallotsSearchResult = currentProps.ballotsSearchResult.ballotMemberTotalBallots;
                    break;
                case this.electionRoleSytemNames.counter:
                    ballotsSearchResult= currentProps.ballotsSearchResult.counter;
                    totalBallotsSearchResult = currentProps.ballotsSearchResult.counterTotalBallots;
                    break;
            }
            electionsRolesByVoter = currentProps.activistDetails.election_roles_by_voter;


        if ( topIndex > (totalBallotsSearchResult - 1) ) {
            topIndex = totalBallotsSearchResult - 1;
        }

        for ( let ballotIndex = bottomIndex; ballotIndex <= topIndex; ballotIndex++ ) {
            currentPageBallots.push(ballotsSearchResult[ballotIndex]);
        }

        this.setState({currentPageBallots});

        this.props.getAllocatedShifts(electionsRolesByVoter);
    }

    loadMoreBallots(nextPage) {
        let totalBallotsSearchResult = this.getTotalBallotsSearchResult();
        let ballotsSearchResult = this.getBallotsSearchResult();

        // total number of pages
        let totalPages = Math.ceil(totalBallotsSearchResult / this.ballotsPerPage);

        // number of ballots in pages 1 - nextPage
        let nextPageNumOfBallots = nextPage * this.ballotsPerPage;

        // Checking if we are in the last page
        if (nextPage > totalPages) {
            return;
        }

        // If ballotsSearchResult contains all the search result,
        // then there is nothing to load
        if ( ballotsSearchResult.length == totalBallotsSearchResult ) {
            return;
        }

        // If number of ballots in pages from 1 till next page
        // are less than ballotsSearchResult ballots, then there
        // is nothing to load
        if (nextPageNumOfBallots <= ballotsSearchResult.length) {
            return;
        }

        let currentDbPage = Math.floor( (nextPage * this.ballotsPerPage) / this.maxRecoredsFromDb ) + 1;
        ElectionsActions.loadMoreBallots(this.props.dispatch, this.getElectionRoleKey(), this.props.currentTabRoleSystemName,
                                         this.getBallotsSearchFields(), currentDbPage , 1)
    }

    navigateToPage(pageIndex) {
        this.setState({currentPage: pageIndex});

        this.loadPageBallots(this.props.currentTabRoleSystemName, pageIndex);

        this.loadMoreBallots(pageIndex + 1);
        this.loadMoreBallots(pageIndex + 2);
    }

    /**
     * This function checks if the ballot is
     * allocated to the activist in any shift.
     *
     * @param ballotItem
     * @returns {boolean}
     */
    isBallotAllocatedToActivist(ballotItem) {
        let activists_allocations_assignments = ballotItem.all_assignment;

        for(let i=0; i<activists_allocations_assignments.length; i++) {
            if (activists_allocations_assignments[i].voter_key == this.props.activistDetails.key) return true;
        }
        return false;
    }

    /**
     * This function checks if this
     * allocation is locked.
     *
     * @returns {boolean}
     */
    isActivistLocked() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == this.props.currentTabRoleId);

        return (activistItem.election_roles_by_voter[roleIndex].user_lock_id != null);
    }

    /**
     * This function checks if the current user has permission
     * of editing ballot_member role or observer role.
     *
     * @returns {boolean|*|string}
     */
    checkEditPermission(permissionName = 'edit') {
        return (this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.activists.' + this.props.currentTabRoleSystemName +  '.' + permissionName] == true
            );
    }

    renderBallots() {
        let that = this;
        let ballot_role_edit_permission = this.checkEditPermission('ballot_role_edit')

        let ballots = (this.state.currentPageBallots ? this.state.currentPageBallots.map(function (ballotItem, index) {
            if ( null == ballotItem.ballot_box_role_id) {
                if (ballot_role_edit_permission) {
                     return <BallotAdminItem key={ballotItem.key} item={ballotItem} 
                                             getBallotMiId={that.props.getBallotMiId.bind(that)}/>
                } else {
                    return <BallotDumbItem key={ballotItem.key} item={ballotItem} getBallotMiId={that.props.getBallotMiId.bind(that)}/>;
                }
            } else if (!that.checkEditPermission() || that.isActivistLocked()) {
                return <BallotDumbItem key={ballotItem.key} item={ballotItem} getBallotMiId={that.props.getBallotMiId.bind(that)} />;
            } else if (that.isBallotAllocatedToActivist(ballotItem)) {
                if (ballot_role_edit_permission) {
                    return <BallotAdminItem key={ballotItem.key} item={ballotItem} getBallotMiId={that.props.getBallotMiId.bind(that)} />}
               else {return <BallotDumbItem key={ballotItem.key} item={ballotItem} getBallotMiId={that.props.getBallotMiId.bind(that)}/>;}
            } else {
                return <BallotItem key={ballotItem.key} item={ballotItem}
                    currentTabRoleSystemName={that.props.currentTabRoleSystemName}
                    allocateShift={that.allocateShift.bind(that)}
                    replaceShift={that.replaceShift.bind(that)} getBallotMiId={that.props.getBallotMiId.bind(that)} />;
            }
        }) : null);

        return ballots;
    }

    getBallotsSearchFields() {
        switch (this.props.currentTabRoleSystemName) {
            case this.electionRoleSytemNames.observer:
                return this.props.balotSearchFields.observer;
                break;

            case this.electionRoleSytemNames.ballotMember:
                return this.props.balotSearchFields.ballotMember;
                break;
            case this.electionRoleSytemNames.counter:
                return this.props.balotSearchFields.counter;
                break;
        }
    }

    getBallotsSearchResult() {
        switch (this.props.currentTabRoleSystemName) {
            case this.electionRoleSytemNames.observer:
                return this.props.ballotsSearchResult.observer;
                break;

            case this.electionRoleSytemNames.ballotMember:
                return this.props.ballotsSearchResult.ballotMember;
                break;
            case this.electionRoleSytemNames.counter:
                return this.props.ballotsSearchResult.counter;
                break;
        }
    }

    getTotalBallotsSearchResult() {
        switch (this.props.currentTabRoleSystemName) {
            case this.electionRoleSytemNames.observer:
                return this.props.ballotsSearchResult.observerTotalBallots;
                break;
            case this.electionRoleSytemNames.ballotMember:
                return this.props.ballotsSearchResult.ballotMemberTotalBallots;
                break;
            case this.electionRoleSytemNames.counter:
                return this.props.ballotsSearchResult.counterTotalBallots;
                break;
        }
    }

    renderPagination() {
        let totalBallotsSearchResult = this.getTotalBallotsSearchResult();

        return ( totalBallotsSearchResult > this.ballotsPerPage);
    }

    getCounterTitle() {
        let counterTitle = 'מציג תוצאות ';
        let bottomIndex = (this.state.currentPage - 1) * this.ballotsPerPage + 1;
        let topIndex = this.state.currentPage * this.ballotsPerPage;
        let totalBallotsSearchResult = this.getTotalBallotsSearchResult();

        if ( totalBallotsSearchResult == 0 ) {
            return counterTitle;
        }

        if ( topIndex > totalBallotsSearchResult ) {
            topIndex = totalBallotsSearchResult;
        }

        counterTitle += bottomIndex + '-' + topIndex;

        return counterTitle;
    }

    isLoadingBallots() {
        switch (this.props.currentTabRoleSystemName) {
            case this.electionRoleSytemNames.observer:
                return this.props.ballotsSearchResult.loadingObserverBallots;
                break;

            case this.electionRoleSytemNames.ballotMember:
                return this.props.ballotsSearchResult.loadingBallotMemberBallots;
                break;
            case this.electionRoleSytemNames.counter:
                return this.props.ballotsSearchResult.loadingCounterBallots;
                break;
        }
    }

    render() {
        return (
            <div className={"containerStrip" + (this.isLoadingBallots() ? " hidden" : "")}>
                <div className="row rsltsTitleRow">
                    <div className="col-sm-4 rsltsTitle">
                        <h3 className="noBgTitle">נמצאו <span className="rsltsCounter">{this.getTotalBallotsSearchResult()}</span> קלפיות</h3>
                        <div className="showingCounter">{this.getCounterTitle()}</div>
                    </div>
                </div>
				<table className="table table-striped fixed_header table-multi-line multiple-line-duplicated table-frame standard-frame" style={{marginBottom:'-1px'}}>
                    <thead>
                        <tr>
                            <th style={{ width: this.ballotsTableColsHeights.city_name }}>עיר</th>
                            <th style={{ width: this.ballotsTableColsHeights.cluster_name }}>שם אשכול</th>
                            <th style={{ width: this.ballotsTableColsHeights.address }}>כתובת</th>
                            <th style={{ width: this.ballotsTableColsHeights.mid }}>מספר קלפי</th>
                            <th style={{ width: this.ballotsTableColsHeights.type }}>סוג קלפי</th>
                            <th style={{ width: this.ballotsTableColsHeights.shift }}>תפקיד קלפי</th>
                            <th style={{ width: this.ballotsTableColsHeights.role }} className="right-separator-line">משמרת</th>
                            <th style={{ width: this.ballotsTableColsHeights.form }}>פעיל משובץ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderBallots()}
                    </tbody>
                </table>

                {( this.renderPagination() ) &&
                <div className="row">
                    <Pagination resultsCount={this.getTotalBallotsSearchResult()}
                                displayItemsPerPage={this.ballotsPerPage}
                                currentPage={this.state.currentPage}
                                navigateToPage={this.navigateToPage.bind(this)}/>
                </div>
                }

                <ModalWindow show={this.state.allocationAlertModal.show} title={this.state.allocationAlertModal.title} style={{zIndex: '9001'}}
                             buttonOk={this.hideAllocationAlertModal.bind(this)} buttonCancel={this.hideAllocationAlertModal.bind(this)}
                             buttonX={this.hideAllocationAlertModal.bind(this)}>
                    <div>{this.state.allocationAlertModal.content}</div>
                </ModalWindow>

                <ReplaceShiftAlertModal show={this.state.replaceAllocationAlertModa.show}
                                        activistDetails={this.props.activistDetails}
                                        ballotItem={this.state.replaceAllocationAlertModa.ballotItem}
                                        geoItem={this.state.replaceAllocationAlertModa.geoItem}
                                        hideReplaceShiftModal={this.hideReplaceShiftModal.bind(this)}
                                        addGeoBallotToActivistRole={this.addGeoBallotToActivistRole.bind(this)}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,

        activistDetails: state.elections.activistsScreen.activistDetails,

        ballotsSearchResult: state.elections.activistsScreen.ballotsSearchResult,
        balotSearchFields: state.elections.activistsScreen.balotSearchFields,

        electionRoles: state.elections.activistsScreen.electionRoles,
        electionRolesShifts: state.elections.activistsScreen.electionRolesShifts,

        editedBalotBoxRoleFlag: state.elections.activistsScreen.editedBalotBoxRoleFlag
    };
}

export default connect(mapStateToProps) (BallotSearchResult);