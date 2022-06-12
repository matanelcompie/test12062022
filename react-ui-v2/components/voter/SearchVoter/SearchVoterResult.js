import React from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router';
/**/
import * as VoterActions from '../../../actions/VoterActions';
import {logOnDev} from '../../../libs/globalFunctions';

class SearchVoterResult extends React.Component {

    constructor(props) {
        super(props);
        this.styleIgniter();
        this.textIgniter();
        this.extraColumnWidthStr = '0';
        this.scrollTableBody = 'scrollTableBody';
        this.onDev = false;
        this.hasScrollbar=false;
    }

    componentDidMount() {

        if (undefined!= this.self&& null !=this.self) {
            this.hasScrollbar = this.self.scrollHeight > this.self.clientHeight ?true:false;
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.VOTER_SEARCH_SCROLLER, searchVoterIsScroll: this.hasScrollbar});

        }

        if (this.props.searchVoterIsScroll == true){
            this.extraColumnWidthStr = this.props.scrollbarWidth + 'px';

        } else{
            this.extraColumnWidthStr = '0';
        }

    }

    componentWillReceiveProps(nextProps) {

        if (this.props.searchVoterIsScroll == false && nextProps.searchVoterIsScroll == true) {
            this.extraColumnWidthStr = this.props.scrollbarWidth + 'px';
        }

      }

    getRef(ref) {
        this.self = ref;
    }

    componentDidUpdate() {
        if (undefined!= this.self&& null !=this.self) {
            if (!this.props.searchVoterIsScroll) {
                this.hasScrollbar = this.self.scrollHeight > this.self.clientHeight ?true:false;
                if (this.hasScrollbar) this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.VOTER_SEARCH_SCROLLER, searchVoterIsScroll: this.hasScrollbar});
            }
        }        
    }

    styleIgniter() {
        this.theadStyle = {padding: '0 8px'};
        this.theadThStyle = {padding: '3px 8px'};
        this.theadThIdentityStyle = {padding: '3px 8px', width: '90px'};
        this.theadThVoterKeyStyle = {padding: '3px 8px', width: '108px'};
        this.theadThExtraStyle = {padding: '3px 8px', borderLeftWidth: '0 !important', borderLeftStyle: 'none'};
        this.theadThPhoneStyle = {padding: '3px 8px', width: '100px'};
        this.theadThAgeStyle = {padding: '3px 8px', width: '40px', borderLeft: 'none'};
        this.theadThFatherFirstNameStyle = {padding: '3px 8px', width: '60px'};
    }

    textIgniter() {
        this.personalIdentityField = 'ת\'\'ז';
        this.voterKeyField = 'קוד תושב';
        this.phoneField = 'מס\' טלפון';
        this.lastNameField = 'שם משפחה';
        this.firstNameField = 'שם פרטי';
        this.cityField = 'עיר';
        this.streetField = 'רחוב';
        this.birthYearField = 'שנת לידה';
        this.fatherFirstNameField = 'שם האב';
        this.ageField = 'גיל';

        this.personalIdentityFieldTitle = 'מס\' תעודת זהות';
    }

    goToVoterPage(forWhom, redirectPath, e) {
        e.preventDefault();
        VoterActions.redirectToRequestCreatorPage(this.props.dispatch, this.props.router, redirectPath, forWhom);
    }

    /**
     *
     * @returns {*}
     */
    assemblySearchVoterResultTHEAD() {

        if (true == this.props.searchVoterLevel.base) {
            if (undefined!= this.self&& null !=this.self) {
                this.hasScrollbar = this.self.scrollHeight > this.self.clientHeight ?true:false;            
            }
            if (true == this.hasScrollbar && this.props.scrollbarWidth > 0) {
                this.extraColumnWidthStr = this.props.scrollbarWidth + 'px'; 

                return this.searchVoterResultTHEAD =
                        <thead style={this.theadStyle}>
                            <tr>
                                <th style={this.theadThIdentityStyle}>{this.personalIdentityField}</th>
                                <th style={this.theadThVoterKeyStyle}>{this.voterKeyField}</th>
                                <th style={this.theadThStyle}>{this.phoneField}</th>
                                <th style={this.theadThStyle}>{this.firstNameField}</th>
                                <th style={this.theadThStyle}>{this.lastNameField}</th>
                                <th style={this.theadThStyle}>{this.cityField}</th>
                                <th className='last-but-one-thX' style={this.theadThExtraStyle}>{this.streetField}</th>
                                <th className='last-th' style={{width: this.extraColumnWidthStr, borderRight: 'none'}}></th>
                            </tr>
                        </thead>;
                        } else {

                    return this.searchVoterResultTHEAD =
                            <thead style={this.theadStyle}>
                                <tr>
                                    <th style={this.theadThIdentityStyle}>{this.personalIdentityField}</th>
                                    <th style={this.theadThVoterKeyStyle}>{this.voterKeyField}</th>
                                    <th style={this.theadThStyle}>{this.phoneField}</th>
                                    <th style={this.theadThStyle}>{this.firstNameField}</th>
                                    <th style={this.theadThStyle}>{this.lastNameField}</th>
                                    <th style={this.theadThStyle}>{this.cityField}</th>
                                    <th style={this.theadThStyle}>{this.streetField}</th>
                                </tr>
                            </thead>;
                }
            }

            if (true == this.props.searchVoterLevel.advanced) {
                /**
                 *
                 */
                if (undefined!= this.self&& null !=this.self) {
                    this.hasScrollbar = this.self.scrollHeight > this.self.clientHeight ?true:false;            
                }
                if (true == this.hasScrollbar && this.props.scrollbarWidth > 0) {
                    this.extraColumnWidthStr = this.props.scrollbarWidth + 'px'; 
                    
                    return this.searchVoterResultTHEAD =
                            <thead style={this.theadStyle}>
                                <tr>
                                    <th style={this.theadThIdentityStyle}>{this.personalIdentityField}</th>
                                    <th style={this.theadThVoterKeyStyle}>{this.voterKeyField}</th>
                                    <th style={this.theadThPhoneStyle}>{this.phoneField}</th>
                                    <th style={this.theadThStyle}>{this.firstNameField}</th>
                                    <th style={this.theadThStyle}>{this.lastNameField}</th>
                                    <th style={this.theadThStyle}>{this.cityField}</th>
                                    <th style={this.theadThStyle}>{this.streetField}</th>
                                    <th style={this.theadThFatherFirstNameStyle}>{this.fatherFirstNameField}</th>
                                    <th className='last-but-one-th' style={this.theadThAgeStyle}>{this.ageField}</th>
                                    <th className='last-th' style={{width: this.extraColumnWidthStr, borderRight: 'none'}}></th>
                                </tr>
                            </thead>;
                            } else {

                        return this.searchVoterResultTHEAD =
                                <thead style={this.theadStyle}>
                                    <tr>
                                        <th style={this.theadThIdentityStyle}>{this.personalIdentityField}</th>
                                        <th style={this.theadThVoterKeyStyle}>{this.voterKeyField}</th>
                                        <th style={this.theadThPhoneStyle}>{this.phoneField}</th>
                                        <th style={this.theadThStyle}>{this.firstNameField}</th>
                                        <th style={this.theadThStyle}>{this.lastNameField}</th>
                                        <th style={this.theadThStyle}>{this.cityField}</th>
                                        <th style={this.theadThStyle}>{this.streetField}</th>
                                        <th style={this.theadThFatherFirstNameStyle}>{this.fatherFirstNameField}</th>
                                        <th style={this.theadThAgeStyle}>{this.ageField}</th>
                                    </tr>
                                </thead>;
                    }
                }

                if (true == this.props.searchVoterLevel.ballot) {
                    /**
                     *
                     */
                    return this.searchVoterResultTHEAD = '';
                }
            }

            getMainPhoneNumber(voter) {
                var mainPhone = '';
                if (voter.main_voter_phone_id != null) {
                    for (var i = 0; i < voter.phones.length; i++) {
                        if (voter.phones[i].id == voter.main_voter_phone_id) {
                            mainPhone = voter.phones[i].phone_number;
                            break;
                        }
                    }
					if(mainPhone == '' && voter.phones.length > 0){
							mainPhone = voter.phones[0].phone_number;
					}
                } else {
                    if (voter.phones != undefined && voter.phones.length > 0)
                        mainPhone = voter.phones[0].phone_number;
                }
			 
                return mainPhone;
            }

    /**
     *
     * @returns {XML}
     */
    assemblySearchVoterResultTBODY() {
        let self = this;

        if (true == this.props.searchVoterLevel.base) {
            this.scrollTRlist = this.props.searchVoterResult.map(function (voter, i) {
				
                var mainPhone = self.getMainPhoneNumber(voter);
               // if (true == self.needForExtraColumn && self.extraColumnWidth > 0) {
                if (true == self.props.searchVoterIsScroll&& self.props.scrollbarWidth > 0) {
                    self.extraColumnWidthStr = self.props.scrollbarWidth + 'px';
                    return <tr id={i} key={i} onClick={self.searchVoterFillDetails.bind(self, i)} className={self.setTrSelectedCssClass(voter.isSelected, voter.voters_key)} style={{wordWrap: 'break-word'}}>
                        <td style={{whiteSpace: 'nowrap', width:'90px'}}><a title={self.personalIdentityFieldTitle} onClick={self.goToVoterPage.bind(self, 'this.isPureVoter', voter.voters_key)} 
                            href={self.props.router.location.basename + '/elections/voters/' + voter.voters_key} >{voter.personalIdentity}</a></td>
                        <td>{voter.voters_key}</td>
                        <td>{mainPhone}</td>
                        <td>{voter.firstName}</td>
                        <td>{voter.lastName}</td>
                        <td className='last-but-one-td'>{voter.cityName}</td>
                        <td style={{colSpan: 2}}>{voter.street?voter.street:''}</td>
                    </tr>;
                    } else {
                        return <tr id={i} key={i} onClick={self.searchVoterFillDetails.bind(self, i)} className={self.setTrSelectedCssClass(voter.isSelected, voter.voters_key)} style={{wordWrap: 'break-word'}}>
                            <td style={{whiteSpace: 'nowrap', width:'90px'}}><a title={self.personalIdentityFieldTitle} onClick={self.goToVoterPage.bind(self, 'this.isPureVoter', voter.voters_key)} 
                            href={self.props.router.location.basename + '/elections/voters/' + voter.voters_key} >{voter.personalIdentity}</a></td>
                            <td>{voter.voters_key}</td>
                            <td>{mainPhone}</td>
                            <td>{voter.firstName}</td>
                            <td>{voter.lastName}</td>
                            <td>{voter.cityName}</td>
                            <td>{(voter.street?voter.street:'')}</td>
                        </tr>;
                    }
                });
                
                return this.searchVoterResultTBODY =
                        <tbody ref={this.getRef.bind(this)} onScroll={self.scrollFeeder.bind(self)} style={{height: '450px'}}>{this.scrollTRlist}
                            <tr style={{ display:(this.props.searchVoterLoading && this.props.searchVoterCurrentPage>0 ) ? '' : 'none'}}>
                                <td><div className={"fa fa-spinner fa-spin pull-right" + (this.props.searchVoterLoading ? '' : ' hidden')} 
                                       ></div>     טוען  ...
                                </td>
                            </tr>
                        </tbody>;
                }

                if (true == this.props.searchVoterLevel.advanced) {
                    this.scrollTRlist = this.props.searchVoterResult.map(function (voter, i) {
                        var mainPhone = self.getMainPhoneNumber(voter);
                        var fatherFirstName = (voter.fatherFirstName != null) ? voter.fatherFirstName : '';
                       // if (true == self.needForExtraColumn && self.extraColumnWidth > 0) {
                        if (true == self.props.searchVoterIsScroll && self.props.scrollbarWidth > 0) {
                            self.extraColumnWidthStr = self.props.scrollbarWidth + 'px';

                            return <tr id={i} key={i} onClick={self.searchVoterFillDetails.bind(self, i)} className={self.props.searchVoterDetails.voters_key == voter.voters_key ? 'success' : ''} style={{wordWrap: 'break-word'}}>
                                <td style={{whiteSpace: 'nowrap', width:'90px'}}><a title={self.personalIdentityFieldTitle} onClick={self.goToVoterPage.bind(self, 'this.isPureVoter', voter.voters_key)} 
                                href={self.props.router.location.basename + '/elections/voters/' + voter.voters_key} >{voter.personalIdentity}</a></td>
                                <td>{voter.voters_key}</td>
                                <td style={{width:'100px'}}>{mainPhone}</td>
                                <td>{voter.firstName}</td>
                                <td>{voter.lastName}</td>
                                <td>{voter.cityName}</td>
                                <td>{voter.street}</td>
                                <td className='last-but-one-td' style={{width:'60px'}}>{fatherFirstName}</td>
                                <td style={{colSpan: 2, width:'40px'}}>{voter.age}</td>
                            </tr>;
                            } else {
                                return <tr id={i} key={i} onClick={self.searchVoterFillDetails.bind(self, i)} className={self.props.searchVoterDetails.voters_key == voter.voters_key ? 'success' : ''} style={{wordWrap: 'break-word'}}>
                                    <td style={{whiteSpace: 'nowrap', width:'90px'}}><a title={self.personalIdentityFieldTitle} onClick={self.goToVoterPage.bind(self, 'this.isPureVoter', voter.voters_key)} 
                                    href={self.props.router.location.basename + '/elections/voters/' + voter.voters_key} >{voter.personalIdentity}</a></td>
                                    <td>{voter.voters_key}</td>
                                    <td style={{width:'100px'}}>{mainPhone}</td>
                                    <td>{voter.firstName}</td>
                                    <td>{voter.lastName}</td>
                                    <td>{voter.cityName}</td>
                                    <td>{voter.street}</td>
                                    <td style={{width:'60px'}}>{fatherFirstName}</td>
                                    <td style={{colSpan: 2, width:'40px'}}>{voter.age}</td>
                                </tr>;
                            }
                        });

                        return this.searchVoterResultTBODY =
                                <tbody ref={this.getRef.bind(this)} onScroll={self.scrollFeeder.bind(self)} style={{height: '450px'}}>{this.scrollTRlist}</tbody>;
                        }

                        if (true == this.props.searchVoterLevel.ballot) {
                            this.scrollTRlist = this.props.searchVoterResult.map(function (voter, i) {
                                /*return <tr id={i} key={i} onClick={self.searchVoterFillDetails.bind(self, i)} style={self.trBodyStyle}><td style={self.tdStyle}>{voter.personalIdentity}</td><td style={self.tdStyle}>{voter.firstName.trim()}</td><td style={self.tdStyle}>{voter.lastName.trim()}</td><td style={self.tdStyle}>{voter.cityName}</td><td style={self.tdStyle}>{voter.street.trim()}</td><td style={self.tdStyle}>{voter.clusterName}</td><td style={self.tdStyle}>{voter.ballotBox}</td><td style={self.tdStyle}>{voter.ballotBoxVoterId}</td></tr>;*/
                                return '';
                            });

                            return this.searchVoterResultTBODY =
                                    <tbody ref={this.getRef.bind(this)} onScroll={self.scrollFeeder.bind(self)}>{this.scrollTRlist}</tbody>;
                        }
            }

            /**
             *
             * @param e
             */
            scrollFeeder(e) {
                logOnDev('scrollFeeder', this.onDev);
                logOnDev('scroll=loading=' + this.props.searchVoterLoading + ' currPage=' + this.props.searchVoterCurrentPage + ' hasMore=' + this.props.searchVoterHasMore, this.onDev);
                if (this.props.searchVoterHasMore) {
                    /*this.tbodyOverflowYStyle = {overflowY: 'scroll'};*/
                    let node = this.self;
                    let ratio = 0.8;
                    if ((!this.props.searchVoterLoading) && ((node.offsetHeight / (node.scrollHeight - node.scrollTop)) > ratio)) {
                        let searchForTheseParams = {};
                        for (let i in this.props.searchForParams) {
                            if (this.props.searchForParams[i].length < 1) {
                                continue;
                            }
                            if (i == 'city') {
                                var cities = this.props.searchForParams[i].map(function (city) {
                                    return {'id': city.id};
                                });
                                searchForTheseParams[i] = JSON.stringify(cities);
                            } else if (i == 'street') {
                                let list = this.props.searchForParams[i].map(function (item) {
                                        return {'key': item.key, 'name': item.name};
                                });
                                let value = JSON.stringify(list);
                                searchForTheseParams[i] = value;
                            } else {
                                searchForTheseParams[i] = this.props.searchForParams[i];
                            }
                        }
                        logOnDev('scrollHeight: ' + node.scrollHeight + ' scrollTop: ' + node.scrollTop + ', offsetHeight: ' + node.offsetHeight, this.onDev);
                        //this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.SET_SEARCH_PARAMS, searchForParams: searchForTheseParams});
                        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.DISABLE_NEW_SEARCH, disableNewSearch: true});
                        VoterActions.getVoterByParams(this.props.dispatch, searchForTheseParams, this.props.searchVoterCurrentPage);
                    }
                } else {
                    /*this.tbodyOverflowYStyle = {};*/
                }
            }

            searchVoterFillDetails(idx, e) {
                /**
                 * We should pass here 'idx' only...
                 */
                logOnDev('sss=' + idx, this.onDev);
                //VoterActions.setItSelected(this.props.dispatch, idx);
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.FILL_VOTER_DETAILS, searchVoterDetails: this.props.searchVoterResult[idx]});
            }

            /**
             * Set the '.request-select-row' CSS class on the selected row(tr).
             * TODO: Add here code in order to "keep the old class"
             *
             * @param isSelected
             * @param idx
             * @returns {string}
             */
            setTrSelectedCssClass(isSelected, voterKey) {
                let result = this.props.searchVoterDetails.voters_key == voterKey ? 'success' : '';

                if (true == isSelected) {
                    result += ' request-select-row';
                }

                return result;
            }

            setScrollWidth(target, value) {

                if (-1 == 1 * value && undefined != target) {
                    return target.scrollWidth;
                }
            }

            getScrollWidth(target) {
                if (undefined != target) {
                    return target.scrollWidth;
                }
            }

            render() {
                    this.assemblySearchVoterResultTHEAD();
                    this.assemblySearchVoterResultTBODY();

                    return (
                            <div className="dtlsBox srchRsltsBox">
                                <div id="scrollContainer" className="table-responsive">
                                    <table className={"table table-striped table-bordered table-hover table-scrollable" + (true == this.props.searchVoterLevel.advanced ? ' advancedTable' : '')} style={{marginBottom: 0, height: '450px'}}>
                                        {this.searchVoterResultTHEAD}
                                        {this.searchVoterResultTBODY}
                                    </table>
                                </div>
                            </div>
                                );
                    }
                }

                function mapStateToProps(state) {
                    return {
                        searchVoterScreen: state.voters.searchVoterScreen,
                        searchVoterLevel: state.voters.searchVoterScreen.searchVoterLevel,
                        searchForParams: state.voters.searchVoterScreen.searchForParams,
                        searchVoterResult: state.voters.searchVoterScreen.searchVoterResult,
                        searchVoterDetails: state.voters.searchVoterScreen.searchVoterDetails,
                        searchVoterLoading: state.voters.searchVoterScreen.searchVoterLoading,
                        searchVoterCurrentPage: state.voters.searchVoterScreen.searchVoterCurrentPage,
                        searchVoterHasMore: state.voters.searchVoterScreen.searchVoterHasMore,
                        searchVoterCount: state.voters.searchVoterScreen.searchVoterCount,
                        currentUser: state.system.currentUser,
                        searchVoterIsScroll: state.voters.searchVoterScreen.searchVoterIsScroll,
                        scrollbarWidth: state.system.scrollbarWidth,

                    }
                }
                export default connect(mapStateToProps)(withRouter(SearchVoterResult));
