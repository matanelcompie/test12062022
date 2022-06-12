import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';

import * as SystemActions from '../actions/SystemActions';
import * as ElectionsActions from '../actions/ElectionsActions';
class Breadcrumbs extends React.Component {
    constructor(props) {
        super(props);
		this.state = {};
        this.textIgniter();
    }

    componentDidMount() {
        this.handleUrlBreadcrumb();
    }

    componentDidUpdate() {
        if (this.shouldBreadcrumbUpdate()) {
            this.updateBreadcrumbData();
        }
    }

    componentWillReceiveProps(nextProps) {
		 
        if (this.props.location.pathname != nextProps.location.pathname) {
            this.handleUrlBreadcrumb();
        }
    }

    shouldBreadcrumbUpdate() {
		 
        var currentUrl = this.props.router.location.pathname.replace(/\/+$/, '');
        return ((['crm/requests/new', 'crm/requests', 'crm/requests/new/unknown', 'crm/requests/search', 'elections/voters/search'].indexOf(currentUrl) == -1)
            && (this.props.voterDetails.personal_identity && currentUrl.indexOf('elections/voters/') > -1)
			//|| (currentUrl.indexOf('elections/voters/manual') > -1 && currentUrl != 'elections/voters/manual')
            || (this.props.selectedUserData.key && currentUrl.indexOf('system/users/') > -1)
            || (this.props.originalDataRequest.reqKey && currentUrl.indexOf('crm/requests/') > -1)
            || (this.props.selectedUserRole.key && currentUrl.indexOf('system/permission_groups/') > -1)
            || (this.props.teamsScreen.editTeamName && currentUrl.indexOf('system/teams/') > -1)
			|| (currentUrl.indexOf('elections/votes/manual') > -1 && currentUrl != 'elections/votes/manual')
			
			|| (currentUrl.indexOf('elections/votes/dashboard') > -1)
            || (this.props.fileName && currentUrl.indexOf('elections/imports/') > -1)
			|| (this.props.selectedManagementSummayCityItem && currentUrl.indexOf('elections/activists/city_summary/') > -1 && currentUrl != 'elections/activists/city_summary' && currentUrl != 'elections/activists/city_summary/')
			|| (this.props.form1000SearchScreen.selectedBallotbox.selectedItem && currentUrl.indexOf('elections/form1000') > -1 && currentUrl != 'elections/form1000')
            || (currentUrl.indexOf('elections/activists/') > -1)
            ||( currentUrl.indexOf('elections/cities/')>-1)
        );
    }

    handleUrlBreadcrumb() {

        var currentUrl = this.props.router.location.pathname.replace(/\/+$/, ''); //delete the last slash from the url if exists.
		if(!/telemarketing\/campaigns/.test(currentUrl) ){
			this.setState({loadedTmCampData:false});
		}

        switch (true) {
			case /elections\/form1000/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/form1000', 'טופס 1000', 'form1000');
				if (currentUrl != 'elections/form1000') {
                    this.addBreadcrumb(false, currentUrl, '', 'Form1000Ballot');
                }
            break;
			case /elections\/activists\/cluster_summary/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/activists/cluster_summary', 'פעילי אשכול וקלפי', 'electionsManagementClusterView');
            break;
			case /elections\/reports\/ballots_summary/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/reports/ballots_summary', 'דו"ח סיכומי קלפיות', 'electionsManagementClusterView');
            break;
			case /elections\/activists\/city_summary/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/activists/city_summary', 'פעילי עיר', 'electionsManagementCityView');
                 if((currentUrl != 'elections/activists/city_summary') && (currentUrl != 'elections/activists/city_summary/')){
					 this.addBreadcrumb(false, 'elections/activists/city_summary/'+this.props.router.params.cityKey, '', 'electionsManagementCityViewCity');
				 }
            break;
			case /elections\/household_status_change/.test(currentUrl):
                if((currentUrl != 'elections/household_status_change')){
					if( /elections\/household_status_change\/new/.test(currentUrl)){
						 this.addBreadcrumb(true, 'elections/household_status_change', 'עדכון סטטוסים לבית אב', 'householdStatusChange');
				          this.addBreadcrumb(false, '', 'הוספה', 'newHouseholdStatusChange');
						
					}
					else{
						 this.addBreadcrumb(true, 'elections/household_status_change', 'עדכון סטטוסים לבית אב', 'householdStatusChange');
				          this.addBreadcrumb(false, '', 'פרטי עדכון', 'newHouseholdStatusChange');
					}
				}
				else{
                    this.addBreadcrumb(true, 'elections/household_status_change', 'עדכון סטטוסים לבית אב', 'householdStatusChange');
				}
                break;
			case /elections\/votes\/dashboard/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/votes/dashboard', 'בקרת פעילי יום בחירות', 'votesDashboard');
	 
				if (currentUrl != 'elections/votes/manual') {
					 this.addBreadcrumb(false, currentUrl, '', 'voteManual');
				}
                break;
			case /elections\/votes\/manual/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/votes/manual', 'עדכון הצבעה ידני', 'votesManual');
				if (currentUrl != 'elections/votes/manual') {
					 this.addBreadcrumb(false, currentUrl, '', 'voteManual');
				}
                break;
			case /elections\/reports\/walkers\/election_day/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/reports/walkers/election_day', 'הליכון יום בחירות', 'electionDayWalkerReport');
                break;
			case /elections\/dashboards\/elections_day/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/dashboards/elections_day', 'כל הארץ', 'electionsAreasPanel');
                break;
			case /elections\/dashboards\/pre_elections_day\/areas_panel/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/dashboards/pre_elections_day/areas_panel', 'פאנל אזורים - כל הארץ', 'preElectionsAreasPanel');
                break;
			case /elections\/dashboards\/pre_elections_day/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/dashboards/pre_elections_day', 'דשבורד - כל הארץ', 'preElectionsDashboard');
                break;
			case /elections\/reports\/walkers\/captain_fifty/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/reports/walkers/captain_fifty', 'הליכון שר מאה', 'captainFiftyWalkerReport');
                break;
			case /elections\/reports\/walkers\/general/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/reports/walkers/general', 'הליכון', 'generalWalker');
                break;
            case /elections\/activists/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/activists', 'רשימת פעילים', 'activists');
                if (currentUrl != 'elections/activists') {
                    this.addBreadcrumb(false, currentUrl, 'שר מאה', 'ministerOfFifty');
                }
                break;
            case /elections\/campaigns/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/campaigns', 'ניהול תקופת בחירות', 'electionsCampaigns');
                break;
			case /system\/files/.test(currentUrl):
                this.addBreadcrumb(true, 'system/files', 'קבצים להורדה', 'generalFiles');
                break;
            case /system\/lists/.test(currentUrl):
                this.addBreadcrumb(true, currentUrl, 'תשתיות', 'systemList');
                break;
            case /system\/users/.test(currentUrl):
                this.addBreadcrumb(true, 'system/users', 'משתמשים', 'SystemUser');
                if (currentUrl != 'system/users') {
                    this.addBreadcrumb(false, currentUrl, 'משתמש', 'SystemUser');
                }
                break;
			case /elections\/voters\/manual/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/voters/manual', 'טופס קליטה', 'VotersManual');
                break;
            case /elections\/voters/.test(currentUrl):
                if (currentUrl == 'elections/voters/search') {//if search page
                    this.addBreadcrumb(true, currentUrl, 'איתור תושב', 'voter');
                } else {
                    if (currentUrl == 'elections/voters') {//if search page
                        this.addBreadcrumb(true, currentUrl, 'כרטיס תושב', 'voter');
                    } else {
                        //if (this.props.breadcrumbs.length == 1 || this.props.breadcrumbs.length > 2) {//if voter page
                            this.addBreadcrumb(true, 'elections/voters', 'כרטיס תושב', 'voter');
                        //}
                        this.addBreadcrumb(false, currentUrl, 'תושב', 'voter');
                    }
                }
                break;
            case /crm\/requests/.test(currentUrl):
                if (['crm/requests/new', 'crm/requests', 'crm/requests/new/unknown', 'crm/requests/search'].indexOf(currentUrl) > -1) {
                    this.addBreadcrumb(true, currentUrl, (currentUrl == 'crm/requests/search' ? 'שאילתת פניות' : 'יצירת פניה'), 'request');
                } else {//if request page
                    var lastBreadcrumb = this.props.breadcrumbs[this.props.breadcrumbs.length - 1];
                    if (this.props.breadcrumbs.length == 1 || (this.props.breadcrumbs.length > 2 && lastBreadcrumb.elmentType == 'request')) {
                        this.addBreadcrumb(true, 'crm/requests', 'יצירת פניה', 'request');

                    }

                    this.addBreadcrumb(false, currentUrl, 'פניה', 'request');
                }
                break;
            case /system\/teams/.test(currentUrl):
                this.addBreadcrumb(true, 'system/teams', 'צוותים', 'team');
                if (currentUrl != 'system/teams') {//if team page
                    this.addBreadcrumb(false, currentUrl, 'צוות', 'team');
                }
                break;
            case /system\/permission_groups/.test(currentUrl):
                this.addBreadcrumb(true, 'system/permission_groups', 'הרשאות', 'permissionGroup');
                if (currentUrl != 'system/permission_groups') {
                    this.addBreadcrumb(false, currentUrl, 'הרשאות', 'permissionGroup');
                }
                break;
            case /elections\/reports\/general/.test(currentUrl):
                this.addBreadcrumb(true, currentUrl, 'דוח נתונים כללי', 'generalReport');
                break;
            case /elections\/imports/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/imports', 'עדכון נתונים מקובץ', 'electionsImports');

                if (currentUrl != 'elections/imports') {
                    this.addBreadcrumb(false, currentUrl, 'הוספת חדש', 'electionsImports');
                }
                break;
            case /elections\/cities/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/cities', 'ניהול ערים', 'searchCity');
                if (currentUrl != 'elections/cities') {
                    this.addBreadcrumb(false, currentUrl, "ניהול עיר", 'searchCityFound');
                }
                break;
            case /elections\/transportations/.test(currentUrl):
                this.addBreadcrumb(true, 'elections/transportations', 'שיבוץ הסעות', 'Transportations');
                break;
			case /telemarketing\/campaigns/.test(currentUrl)   :
					if(!this.state.loadedTmCampData){
						this.setState({loadedTmCampData:true});
						this.addBreadcrumb(true, 'telemarketing', 'ניהול קמפיינים', 'AgentsPerformance');
					}
					
					this.setState({loadedTmCampData:true});
			 
				//this.addBreadcrumb(true, currentUrl, 'ניהול קמפיינים', 'AgentsPerformance');
                break;
			case /telemarketing/.test(currentUrl) && (/general/.test(currentUrl) || /questionnaire/.test(currentUrl) || /portions/.test(currentUrl)|| /employees/.test(currentUrl)|| /advanced_settings/.test(currentUrl)|| /cti_settings/.test(currentUrl)) :
				if(!this.state.loadedTmCampData){
					this.setState({loadedTmCampData:true});
					this.addBreadcrumb(true, 'telemarketing', 'ניהול קמפיינים', 'AgentsPerformance');
				}
				//this.addBreadcrumb(true, currentUrl, 'ניהול קמפיינים', 'AgentsPerformance');
                break;
            case /telemarketing/.test(currentUrl):
				this.addBreadcrumb(true, 'telemarketing', 'ניהול קמפיינים', 'AgentsPerformance');
               // this.addBreadcrumb(true, 'telemarketing', 'ניהול קמפיינים', 'AgentsPerformance');
                break;
            default:
                this.resetBreadcrumbs();
                break;
        }
    }

    updateBreadcrumbData() {
 
        var currentUrl = this.props.router.location.pathname.replace(/\/+$/, '');
 
        switch (true) {
            case /system\/users/.test(currentUrl):
                var title = this.props.selectedUserData.personal_identity + ' ' + this.props.selectedUserData.first_name + ' ' + this.props.selectedUserData.last_name;
                this.updateBreadcrumbTitle(title);
                break;
			case /elections\/voters\/manual/.test(currentUrl):
                this.updateBreadcrumbTitle( 'טופס קליטה');
                break;
            case /elections\/voters/.test(currentUrl):
		 
                var title = this.props.voterDetails.personal_identity + ' ' + this.props.voterDetails.first_name + ' ' + this.props.voterDetails.last_name;
                this.updateBreadcrumbTitle(title);
                break;
            case /crm\/requests/.test(currentUrl):
                var title = "פניה מס' " + this.props.originalDataRequest.reqKey + ' ' + this.props.originalDataRequest.topic_name;
                this.updateBreadcrumbTitle(title);
                break;
            case /system\/teams/.test(currentUrl):
                this.updateBreadcrumbTitle(this.props.teamsScreen.editTeamName);
                break;
            case /system\/permission_groups/.test(currentUrl):
                //			if(this.props.selectedUserRole.name != null && this.props.selectedUserRole.name !=''){
                var title = "הרשאה: " + this.props.selectedUserRole.name;
                this.updateBreadcrumbTitle(title);
                //			}
                break;
            case /elections\/imports/.test(currentUrl):
                var title = "קובץ: " + this.props.fileName;
                this.updateBreadcrumbTitle(title);
                break;
				
			 case /elections\/form1000/.test(currentUrl):
                var title = "קלפי " + this.props.form1000SearchScreen.selectedBallotbox.selectedItem.name;
                this.updateBreadcrumbTitle(title);
                break;
		 
		    case  /elections\/votes\/manual/.test(currentUrl):
			    if(this.props.foundVoterData){
					var title =  this.props.foundVoterData.personal_identity + ' ' + this.props.foundVoterData.first_name + ' ' + this.props.foundVoterData.last_name;
					this.updateBreadcrumbTitle(title);
			    }
                break;

            case /elections\/cities/.test(currentUrl):
 
                if (currentUrl != 'elections/cities') {

                    this.updateBreadcrumbTitle("ניהול עיר '"+(this.props.cityPanelScreen.topScreen?this.props.cityPanelScreen.topScreen.cityName : '')+"'");
                }
                break;
            case /elections\/activists\/city_summary/.test(currentUrl):
                    if((currentUrl != 'elections/activists/city_summary') && (currentUrl != 'elections/activists/city_summary/')){
                        this.updateBreadcrumbTitle((this.props.selectedManagementSummayCityItem?this.props.selectedManagementSummayCityItem.name : ''));
                    }
                break;

        }
    }

    updateBreadcrumbTitle(title) {
        if (title != this.props.breadcrumbs[(this.props.breadcrumbs.length - 1)].title) {
            this.props.dispatch({ type: SystemActions.ActionTypes.UPDATE_BREADCRUMBS, title });
        }
    }

    addBreadcrumb(reset, url, title, elmentType) {
        if (reset) {
            this.resetBreadcrumbs();
        }

        this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url, title, elmentType } });
    }

    resetBreadcrumbs() {
        this.props.dispatch({ type: SystemActions.ActionTypes.RESET_BREADCRUMBS });
    }

    textIgniter() {
        this.textValues = {
            toPDF: 'יצוא לPDF',
            add: 'הדפסה',
            addToFavorites: 'הוספת דף למועדפים',
            removeFromFavorites: 'הסרת דף מהמועדפים',
        };
    }

    renderFavoritesIcon() {
        var isPageInFavoritesList = false;
        var pageKey = null;
        const currentUrl = this.props.router.location.pathname;

        this.props.favorites.map(function (item) {
            if (item.url == currentUrl) {
                isPageInFavoritesList = true;
                pageKey = item.key;
                return;
            }
        });

        this.favoritesIcon = <i onClick={this.addToFavorites.bind(this)} className="fa fa-star-o fa-lg cursor-pointer"
            title={this.textValues.addToFavorites} style={{ color: '#498bb6' }}></i>;
        if (isPageInFavoritesList) {
            this.favoritesIcon = <i onClick={this.removeFromFavorites.bind(this, pageKey)} className="fa fa-star fa-lg cursor-pointer"
                title={this.textValues.removeFromFavorites} style={{ color: '#498bb6' }}></i>
        }
    }

    addToFavorites() {
        let currentUrl = this.props.router.location.pathname;
        let title = this.props.systemTitle;
        SystemActions.addToFavorites(this.props.dispatch, currentUrl, title);
    }
    removeFromFavorites(pageKey) {
        SystemActions.removeFromFavorites(this.props.dispatch, pageKey);
    }

    renderBreadcrumbs() {
		
        this.breadcrumbs = this.props.breadcrumbs.map(function (item, i) {
		 
			if(item.url == 'elections/dashboards/pre_elections_day' || item.url == '/elections/dashboards/pre_elections_day' || 
																item.url == 'elections/votes/dashboard' || item.url == '/elections/votes/dashboard' || 
																item.url == 'elections/dashboards/pre_elections_day/areas_panel' || 
																item.url == '/elections/dashboards/pre_elections_day/areas_panel' || 
																item.url == '/elections/dashboards/elections_day' || item.url == 'elections/dashboards/elections_day'  ){
				 
				return <li key={i}><a style={{cursor:'pointer'}} onClick={this.visitPage.bind(this, item.url , item)}>{item.title}</a></li>;
			}
			else{
				 
				return <li key={i}><a href={this.props.router.location.basename + item.url} onClick={this.visitPage.bind(this, item.url , false)}>{item.title}</a></li>;
			}
        }, this);
    }

    visitPage(url , item, e) {
		if(url == 'elections/votes/dashboard' || url == '/elections/votes/dashboard'){
			item.onClick(item.entityType , item.key);
			return;
		}
		if(url == 'elections/dashboards/pre_elections_day' || url == '/elections/dashboards/pre_elections_day'){
			 
			item.onClick(item.entityType , item.key)
			return;
		}
		else if(item.url == 'elections/dashboards/pre_elections_day/areas_panel' || item.url == '/elections/dashboards/pre_elections_day/areas_panel'){
			item.onClick(item.entityType , item.areaID , item.subAreaID , item.cityID);
			return;
		}
		else if(url == 'elections/dashboards/elections_day' || url == '/elections/dashboards/elections_day'){
			 
			 
			item.onClick(item.entityType , item.key)
			return;
		}
        if (url == '/crm/requests') {
            SystemActions.executeMenuAction('clean_voter_details', this.props.dispatch);
        }
        e.preventDefault();
        this.props.router.push(url);
    }

    render() {
        this.renderFavoritesIcon();
        this.renderBreadcrumbs();
        return (
            <div className="breadCrumbsStrip clearfix">
                {this.favoritesIcon}
                <ol className="breadcrumb">
                    {this.breadcrumbs}
                </ol>
            </div>
        )
    }
}
function mapStateToProps(state) {
    return {
        favorites: state.system.header.favorites,
        systemTitle: state.system.systemTitle,
        breadcrumbs: state.system.breadcrumbs,
        teamsScreen: state.system.teamsScreen,
        voterDetails: state.voters.voterDetails,
        originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
        selectedUserData: state.system.selectedUserData,
        selectedUserRole: state.system.permissionGroupsScreen.selectedUserRole,
        fileName: state.elections.importScreen.dataDefinition.fileData.fileName,
        voterActivistHouseholdsScreen: state.voters.voterActivistHouseholdsScreen ,
        cityPanelScreen:state.elections.citiesScreen.cityPanelScreen,
		selectedManagementSummayCityItem:state.elections.managementCityViewScreen.searchScreen.selectedCity.selectedItem,
		form1000SearchScreen:state.elections.form1000Screen.searchScreen,
		foundVoterData:state.elections.manualVotesScreen.foundVoterData,
    }
}

export default connect(mapStateToProps)(withRouter(Breadcrumbs))
