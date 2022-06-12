import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Redirect, IndexRoute } from 'react-router';
import { createHistory, useBasename } from 'history';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
/*=*/
import App from './components/App';
import Home from './components/home/Home';
import Request from './components/crm/Requests/Request';
import Lists from './components/system/Lists/Lists';
import Teams from './components/system/Teams/Teams';
import Users from './components/system/Users/Users';
import Files from './components/system/Files/Files';
import Voter from './components/voter/Voter';
import Activists from './components/elections/activist/Activists';
import EditAllocation from './components/elections/activist/editAllocation/EditAllocation';
import RequestSearch from './components/crm/Requests/Search/Search';
import SearchVoter from './components/voter/SearchVoter/SearchVoter';
import PermissionByUserRoles from './components/system/managePermissions/PermissionByUserRoles';
import ElectionsDashboard from './components/elections/Import/ElectionsDashboard';
import ElectionsImport from './components/elections/Import/ElectionsImport';
import Captain50Activity from './components/elections/reports/captain50Activity/Captain50Activity';
import GeneralReports from './components/elections/reports/general/GeneralReports';
import CaptainFiftyWalkerReport from './components/elections/reports/walkers/CaptainFiftyWalker/ReportScreen';
import DayWalkerReport from './components/elections/reports/walkers/electionDay/ReportScreen';
import GeneralWalkerReport from './components/elections/reports/walkers/generalWalker/ReportScreen';
import StatusChange from './components/elections/reports/statusChange/StatusChange';
import VotesDashboard from './components/elections/VotesDashboard/VotesDashboard';
import EnrolledActivists from './components/elections/VotesDashboard/EnrolledActivists';
import WrongActivists from './components/elections/VotesDashboard/WrongActivists';
import MissedActivists from './components/elections/VotesDashboard/MissedActivists';
import UnverifiedActivists from './components/elections/VotesDashboard/UnverifiedActivists';
import VotesManual from './components/elections/VotesManual/VotesManual';
import CitySearch from './components/elections/Cities/CitySearch';
import CityManagePanel from './components/elections/Cities/CityManagePanel';
import ElectionsActivistsScreen from './components/elections/management/ElectionsActivistsScreen';
import ClusterView from './components/elections/management/cityView/ClusterView';
import PollingSummary from './components/elections/reports/ballots/PollingSummary';
import HouseHoldStatusChangeDatshboard from './components/elections/HouseholdsStatusChange/Dashboard';
import WizardSteps from './components/elections/HouseholdsStatusChange/WizardSteps';
import ClusterActivist from './components/elections/reports/clusterActivist/ClusterActivist';
import PreElectionDay from './components/elections/Dashboard/preElectionDay/PreElectionDay';
import ElectionDay from './components/elections/Dashboard/electionDay/ElectionDay';
import AreasPanelTable from './components/elections/Dashboard/preElectionDay/AreasPanelTable/AreasPanelTable';
import NotFound from './components/NotFound';
import Unauthorized from './components/Unauthorized';
import Form1000 from './components/elections/Form1000/Form1000';
import VotersManual from 'components/elections/VotersManual/VotersManual';
import ElectionCampaigns from 'components/elections/campaigns/ElectionCampaigns';
import UpdateCampaign from 'components/elections/campaigns/UpdateCampaign';
import Transportations from 'components/elections/transportation/Transportations';

import TmRoutes from './tm/routes';

//import Requests from './components/system/Requests/Requests';
// not yet import SystemPermissions from './components/system/permissions/SystemPermissions';
// not yet import SearchRequest from './components/crm/requests/SearchRequest';
// not yet import Request from './components/crm/requests/Request';
// not yet import NotFound from './components/NotFound';
import Test from './components/Test';
import DndSort from './components/examples/DndSort';
import D3Examples from './components/examples/D3/Examples';
import Picker from './components/examples/Picker/datePicker';
import DateAndTimePicker from './components/examples/Picker/DateAndTimePicker';
import Pickers from './components/examples/Picker/Pickers';
import Reducers from './reducers/Reducers';
import store from './store';
import * as SystemActions from './actions/SystemActions';

import './style/main.scss';

const browserHistory = useBasename(createHistory)({
  basename: window.Laravel.baseURL
});

//let app = ;

// Set logout timer
SystemActions.setLogoutTimer(store);
SystemActions.setSystemStatusInterval(store);
SystemActions.loadSystemSettings(store);
SystemActions.loadErrors(store);
SystemActions.loadCurrentUser(store);
SystemActions.loadCurrentCampaign(store.dispatch);
SystemActions.loadMenu(store);
SystemActions.loadGeneralCities(store);
SystemActions.loadLastViewedVoters(store.dispatch);
SystemActions.loadUserFavorites(store.dispatch);

const Main = () => (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Redirect from="." to="/" />
        <Route path="home" component={Home} />
        <Route path="test" component={Test} />
            /*=*/
        <Route path="system/lists" component={Lists} />
            /*=*/
        <Route path="system/teams(/:teamKey)" component={Teams} />
            /*=*/
        <Route path="system/users(/:userKey)" component={Users} />
        <Route path="system/permission_groups(/:groupKey)" component={PermissionByUserRoles} />
        <Route path="system/files" component={Files} />
            /*=*/
        <Route path='elections/voters/search' component={SearchVoter} />
        <Route path='elections/voters/manual' component={VotersManual} />
        <Route path='elections/voters(/:voterKey)' component={Voter} />


        <Route path='elections/votes/dashboard' component={VotesDashboard} />
        <Route path='elections/votes/dashboard/unverified' component={UnverifiedActivists} />
        <Route path='elections/votes/dashboard/missed' component={MissedActivists} />
        <Route path='elections/votes/dashboard/wrong' component={WrongActivists} />
        <Route path='elections/votes/dashboard/enrolled' component={EnrolledActivists} />
        <Route path='elections/votes/manual(/:voterKey)' component={VotesManual} />

            /** Elections Activists **/
        <Route path='elections/activists' component={Activists} />
        <Route path='elections/activists/city_summary(/:cityKey)' component={ElectionsActivistsScreen} />
        <Route path='elections/activists/cluster_summary(/:clusterKey)' component={ClusterView} />
        <Route path='elections/activists(/:activistKey)' component={EditAllocation} />
        <Route path='elections/activists(/:activistKey)(/:roleKey)' component={EditAllocation} />

            /** Election Campaigns **/
        <Route path='elections/campaigns' component={ElectionCampaigns} />
        <Route path='elections/campaigns(/:campaignKey)' component={UpdateCampaign} />

            /** Elections Imports **/
        <Route path='elections/imports' component={ElectionsDashboard} />
        <Route path='elections/imports/:csvFileKey' component={ElectionsImport} />

        <Route path='elections/cities' component={CitySearch} />

        <Route path='elections/cities/:cityKey' component={CityManagePanel} />
            /** Elections Reports **/

        <Route path='elections/reports/general' component={GeneralReports} />
        <Route path='elections/reports/walkers/captain_fifty' component={CaptainFiftyWalkerReport} />
        <Route path='elections/reports/support_status_change' component={StatusChange} />
        <Route path='elections/reports/ballots_summary' component={PollingSummary} />
        <Route path='elections/reports/captain_fifty_activity' component={Captain50Activity} />
        <Route path='elections/reports/walkers/election_day' component={DayWalkerReport} />
        <Route path='elections/reports/walkers/general' component={GeneralWalkerReport} />
        <Route path='elections/reports/cluster-activist' component={ClusterActivist} />


        <Route path='elections/dashboards/elections_day' component={ElectionDay} />
        <Route path='elections/dashboards/pre_elections_day' component={PreElectionDay} />
        <Route path='elections/dashboards/pre_elections_day/areas_panel' component={AreasPanelTable} />

            /** Household status change **/
        <Route path='elections/household_status_change' component={HouseHoldStatusChangeDatshboard} />
        <Route path='elections/household_status_change/:updateKey' component={WizardSteps} />
        <Route path='elections/form1000(/:ballotKey)' component={Form1000} />
            /*=*/
        <Route path='elections/transportations' component={Transportations} />

            /*=*/
        <Route path='crm/requests/search' component={RequestSearch} />
        <Route path='crm/Requests/new/unknown' component={Request} />
        <Route path='crm/Requests(/:reqKey)' component={Request} />
        <Route path='crm/Requests/action(/:actionKey)' component={Request} />
        <Route path='crm/Requests/callbiz(/:callbizKey)' component={Request} />
        <Route path='crm/Requests/history(/:historyKey)' component={Request} />
        <Route path='crm/Requests/topics(/:topicKey)' component={Request} />
        <Route path='crm/Requests/status(/:statusKey)' component={Request} />
        <Route path='crm/Requests/priority(/:priorityKey)' component={Request} />

        {/* not yet <Route path='elections/voters(/:voterKey)' component={Voter}/>
             <Route path='system/permissions(/:groupKey)' component={SystemPermissions}/>
             <Route path='crm/requests/search/(:reqKey)' component={SearchRequest}/>
             <Route path='crm/requests(/:reqKey)' component={Request}/>
             <Route path='crm/requests/action(/:actionKey)' component={Request}/>
             <Route path='crm/requests/callbiz(/:callbizKey)' component={Request}/>
             <Route path='crm/requests/history(/:historyKey)' component={Request}/>
             <Route path='crm/requests/topics(/:topicKey)' component={Request}/>
             <Route path='crm/requests/status(/:statusKey)' component={Request}/>
             <Route path='crm/requests/priority(/:priorityKey)' component={Request}/>
             <Route path='/system/teams(/:teamKey)' component={Request}/>*/}
        {TmRoutes}
        <Route path="examples/dnd/sort" component={DndSort} />
        <Route path="examples/picker/date" component={Picker} />
        <Route path="examples/picker/date_time" component={DateAndTimePicker} />
        <Route path="examples/picker" component={Pickers} />
        <Route path="examples/d3" component={D3Examples} />
        <Route path="unauthorized" component={Unauthorized} />
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  </Provider>);
ReactDOM.render(<Main />, document.getElementById('app'));
