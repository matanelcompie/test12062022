import React from 'react';
import {Router, Route, IndexRoute} from 'react-router';

import TmApp from './components/TmApp';
import CampaignListPage from './components/campaignList/container/CampaignListPage';
import CampaignDetailsPage from './components/campaignDetails/container/CampaignDetailsPage';
import NewCampaignPage from './components/campaignDetails/container/NewCampaignPage';
import DashboardsSelector from './components/Dashboards/DashboardsSelector';
import MainDashboardScreen from './components/Dashboards/MainDashboardScreen/MainDashboardScreen';
import AgentsPerformance from './components/Dashboards/AgentsPerformance/AgentsPerformance';
import CallsPerformace from './components/Dashboards/CallsPerformace/CallsPerformace';
import AgentsWork from './components/Dashboards/AgentsWork/AgentsWork';
import AgentCalls from './components/Dashboards/AgentCalls/AgentCalls';
import CallDetails from './components/Dashboards/CallDetails/CallDetails';

import GeneralTab from './components/campaignDetails/display/tabs/generalTab';

export default (
    <Route path="telemarketing" component={TmApp}>
        <IndexRoute component={CampaignListPage} />
 
		<Route path="dashboards/:key" component={MainDashboardScreen} />
		<Route path="dashboards/:key/agents_performance" component={AgentsPerformance} />
		<Route path="dashboards/:key/calls_performance" component={CallsPerformace} />
		<Route path="dashboards/:key/agents_work" component={AgentsWork} />
		<Route path="dashboards/:key/agent_calls/:agentKey" component={AgentCalls} />
		<Route path="dashboards/:key/agent_calls/:agentKey/calls/:callKey" component={CallDetails} />
		
        <Route path="campaigns">
        	<IndexRoute component={CampaignListPage} />
        	<Route path="new" component={NewCampaignPage} />
        	<Route path=":key(/:activeTab)" component={CampaignDetailsPage} />
        </Route>
    </Route>
);
