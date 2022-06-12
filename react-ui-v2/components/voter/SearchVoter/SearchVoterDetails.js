import React from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';

class SearchVoterDetails extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
        this.styleIgniter();
    }

    componentWillMount() {
     // cleans voter search results   
     //   this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.RESET_SEARCH_RESULT});
//        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_DATA});
    }

    styleIgniter() {
        this.voterBtnStyle = {marginLeft: '10px', paddingRight: 0, paddingLeft: 0, minWidth: '112px'};
        
        if (this.props.returnUrl != '')
            this.voterBtnStyle.display = "none";
        this.requestBtnStyle = {paddingRight: 0, paddingLeft: 0, minWidth: '112px'};
    }

    textIgniter() {
        this.likeIconPath = (undefined == window.Laravel.baseURL) ? '' : window.Laravel.baseURL + 'Images/support-status-1.svg';
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
        this.genderField = 'מגדר';
        this.addressField = 'כתובת';
        this.landPhoneField = 'מס\' טלפון';
        this.cellPhoneField = 'מס\' טלפון נייד';
        this.emailField = 'דוא\'\'ל';
        this.roleField = 'תפקיד';
        this.systemUserField = 'משתמש במערכת';
    }

    goToRequestPage(e) {
        debugger
        var redirectUrl = 'crm/requests/new'+(this.props.searchVoterDetails.voters_key? '?voter_key='+this.props.searchVoterDetails.voters_key:'');;
        
        if (this.props.returnUrl != '') {
            redirectUrl = this.props.returnUrl;
            this.props.dispatch({type: SystemActions.ActionTypes.USERS.CLEAN_ADDING_USER});
        }
        let that=this;
        VoterActions.getVoterByKey(this.props.dispatch, this.props.searchVoterDetails.personalIdentity, false, false, this.props.router).then(function(params) {
            that.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.SET_SELECTED_VOTER_FOR_REDIRECT});
            that.props.router.push(redirectUrl);  
        })
    }

    goToVoterPage(forWhom, redirectPath, e) {
        VoterActions.redirectToRequestCreatorPage(this.props.dispatch, this.props.router, redirectPath, forWhom);
    }

    setVoterFullName() {
        this.voterFullName = this.props.searchVoterDetails.firstName?(this.props.searchVoterDetails.firstName + ' ' + this.props.searchVoterDetails.lastName):'\u00a0';
    }

    /**
     * Basically build the address sausage.
     */
    setVoterAddress() {
        let voterCavernPointer = '';
        if (undefined != this.props.searchVoterDetails.street && false == _.isEmpty(this.props.searchVoterDetails.street)) {
            voterCavernPointer = voterCavernPointer + this.props.searchVoterDetails.street.trim();
        }

        if (undefined != this.props.searchVoterDetails.house && false == _.isEmpty(this.props.searchVoterDetails.house)) {
            voterCavernPointer = voterCavernPointer + '\u0020' + this.props.searchVoterDetails.house;
        }

        if (undefined != this.props.searchVoterDetails.cityName && false == _.isEmpty(this.props.searchVoterDetails.cityName)) {
            voterCavernPointer = voterCavernPointer + ',\u0020' + this.props.searchVoterDetails.cityName;
        }
        if (undefined != this.props.searchVoterDetails.zip && false == _.isEmpty(this.props.searchVoterDetails.zip)) {
            voterCavernPointer = voterCavernPointer + ',\u0020' + this.props.searchVoterDetails.zip;
        }

        this.voterAddress = voterCavernPointer;
    }

    setDetailInfo() {
        if (undefined == this.props.searchVoterDetails.supportStatusName || true == _.isEmpty(this.props.searchVoterDetails.supportStatusName)) {
            this.statusStyle = {display: 'none'}
            this.firstLiStyle = {paddingRight: 0, paddingLeft: '5px', borderLeftStyle: 'none'};
            this.supportStatusView = '';
        } else {
            this.statusStyle = {};
            this.firstLiStyle = {paddingRight: 0, paddingLeft: '5px'};
            this.supportStatusView = this.props.searchVoterDetails.supportStatusName;
        }
        if (undefined == this.props.searchVoterDetails.supportStatusLikes || 1 * this.props.searchVoterDetails.supportStatusLikes < 1) {
            this.likesStyle = {display: 'none'};
        } else {
            this.likesStyle = {};
        }

        if (undefined == this.props.searchVoterDetails.voterRequestCount || 1 * this.props.searchVoterDetails.voterRequestCount < 1) {
            this.requestCount = '';
            this.voterRequestCountView = 'אין פניות';
        } else {
            this.requestCount = this.props.searchVoterDetails.voterRequestCount;
            this.voterRequestCountView = 'פניות';
        }
    }

    setGenderName() {
        this.genderName = '';
        if (this.props.searchVoterDetails.gender == null)
            return;
        if (this.props.searchVoterDetails.gender == 1)
            this.genderName = 'זכר';
        else
            this.genderName = 'נקבה';
    }

    setPhones() {
        var self = this;
        this.landPhone = '';
        this.mobilePhone = '';
        var phones = this.props.searchVoterDetails.phones;
        if (phones == undefined)
            return;
        phones.forEach(function (phone) {
            if (phone.phone_type_name.includes('נייח'))
                self.landPhone = phone.phone_number;
            if (phone.phone_type_name.includes('נייד'))
                self.mobilePhone = phone.phone_number;
        });
    }

    renderUserInfo() {
        if (this.props.searchVoterDetails.user_main_role && (this.props.currentUser.admin || (this.props.currentUser.permissions['elections.voter.search.show_users']))) {
            return(<div>
                        <dt>{this.systemUserField}</dt>
                        <dd>
                            <a className="textLInk Larger cursor-pointer" onClick={this.goToLink.bind(this, 'system/users/' + this.props.searchVoterDetails.user_key)}>{this.props.searchVoterDetails.user_main_role}</a>
                        </dd>
                    </div>
                    );
        }
    }

    goToLink(link, e) {
        e.preventDefault();
        this.props.router.push(link);
    }

    render() {
        this.setVoterFullName();
        this.setVoterAddress();
        this.setDetailInfo();
        this.setGenderName();
        this.setPhones();
        return (
                <div className="dtlsBox elctorRslts">
                    <div className="electorName">{this.voterFullName}</div>
                    <div className="row">
                        <div className="col-xs-12 col-lg-5 no-padding">
                            <ul className="electorDtlsRow nopadding">
                                <li style={this.firstLiStyle}>
                                    <div className="supportStatus" style={this.statusStyle}>{this.supportStatusView}<span className="supporStatusIndctr"><img src={this.likeIconPath} alt={this.supportStatusView} style={this.likesStyle}/></span></div>
                                </li>
                                <li style={{paddingRight: '5px', paddingLeft: 0}}>
                                    <span className="inqrCounter">{this.requestCount}</span>{this.voterRequestCountView}
                                </li>
                            </ul>
                        </div>
                        <div className="col-xs-12 col-lg-7 elctrBtns" style={{paddingLeft: 0}}>
                            <button type="button" className={"btn btn-primary fixedWidth"+ (this.props.searchVoterDetails.voters_key?'':' hidden')} style={this.voterBtnStyle} 
                                onClick={this.goToVoterPage.bind(this, 'this.isPureVoter', this.props.searchVoterDetails.voters_key)}>לכרטיס התושב</button>
                          
    
                          <button disabled={!this.props.searchVoterDetails.voters_key?true:false} type="button" className={"btn btn-primary fixedWidth"+ (this.props.searchVoterDetails.voters_key || this.props.returnUrl != ''?'':' hidden')} style={this.requestBtnStyle} 
                                onClick={this.goToRequestPage.bind(this)}>{this.props.searchVoterScreen.returnButtonText}</button>
                        </div>
                    </div>
                    <div className="electorDl">
                        <dl className="dl-horizontal">
                            <dt>{this.personalIdentityField}</dt>
                            <dd>{this.props.searchVoterDetails.personalIdentity}</dd>
                            <dt>{this.voterKeyField}</dt>
                            <dd>{this.props.searchVoterDetails.voters_key}</dd>
                            <dt>{this.ageField}</dt>
                            <dd>{this.props.searchVoterDetails.age}</dd>
                            <dt>{this.genderField}</dt>
                            <dd>{this.genderName}</dd>
                            <dt>{this.addressField}</dt>
                            <dd>{this.voterAddress}</dd>
                            <dt>{this.landPhoneField}</dt>
                            <dd>{this.landPhone}</dd>
                            <dt>{this.cellPhoneField}</dt>
                            <dd>{this.mobilePhone}</dd>
                            <dt>{this.emailField}</dt>
                            <dd>{this.props.searchVoterDetails.email}</dd>
                            <dt>{this.roleField}</dt>
                            <dd>{this.props.searchVoterDetails.electionRolesName}</dd>
                            <dt>{this.fatherFirstNameField}</dt>
                            <dd>{this.props.searchVoterDetails.fatherFirstName}</dd>
                            {this.renderUserInfo()}
                        </dl>
                    </div>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        searchVoterScreen: state.voters.searchVoterScreen,
        searchVoterDetails: state.voters.searchVoterScreen.searchVoterDetails,
        returnUrl: state.voters.searchVoterScreen.returnUrl,
        currentUser: state.system.currentUser,
    }
}

export default connect(mapStateToProps)(withRouter(SearchVoterDetails));
