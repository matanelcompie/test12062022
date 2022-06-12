import React from 'react';
import { Route, Switch } from 'react-router';

import CampaignListPageComponent from 'components/campaignList/container/CampaignListPageComponent';
import DashboardComponent from 'components/dashboard/dashboard/container/DashboardComponent';


export default (
    <Switch>
        <Route exact path="/" component={CampaignListPageComponent}/>
        <Route path="/:key" component={DashboardComponent}/>
        <Route path="/:key/simulation" component={DashboardComponent}/>
    </Switch>
);