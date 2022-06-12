import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from 'actions/ElectionsActions';
import ModalWindow from '../../../global/ModalWindow';
import Combo from '../../../global/Combo';

import FirstSubTab from './PrimaryFirstTabSubTabs/FirstSubTab';
import SecondSubTab from './PrimaryFirstTabSubTabs/SecondSubTab';
import ThirdSubTab from './PrimaryFirstTabSubTabs/ThirdSubTab';

class PrimaryFirstTab extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
    }

	/*
	function that initializes constant variables 
	*/
    initConstants() {
        this.knessetElectionCampaignType = 1;
        this.tabsLabels = [
            "נתונים למערכת הבחירות ברשויות",
            "רשימת מועמדים למועצת העיר",
            "מפלגות מתמודדות למועצת העיר",
        ];
    }

    updateActiveTabIndex(activeTabIndex) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.FIRST_TAB.CHANGE_SUB_TAB, activeTabIndex });
    }

    /*
   function that sets dynamic items in render() function : 
   */
    renderTabsOptions() {
        let tabsOptions = [];

        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates.parameters'] == true) {
            let index = 0;
            tabsOptions.push(
                <li key={index.toString()} className={"cursor-pointer" + (this.props.activeTabIndex == index ? " active" : "")} role="presentation">
                    <a title={this.tabsLabels[index]} onClick={this.updateActiveTabIndex.bind(this, index)} data-toggle="tab">
                        {this.tabsLabels[index]}
                    </a>
                </li>
            );
        }
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates.candidates'] == true) {
            let index = 1;
            tabsOptions.push(
                <li key={index.toString()} className={"cursor-pointer" + (this.props.activeTabIndex == index ? " active" : "")} role="presentation">
                    <a title={this.tabsLabels[index]} onClick={this.updateActiveTabIndex.bind(this, index)} data-toggle="tab">
                        {this.tabsLabels[index]}
                    </a>
                </li>
            );
        }
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates.council_parties'] == true) {
            let index = 2;
            tabsOptions.push(
                <li key={index.toString()} className={"cursor-pointer" + (this.props.activeTabIndex == index ? " active" : "")} role="presentation">
                    <a title={this.tabsLabels[index]} onClick={this.updateActiveTabIndex.bind(this, index)} data-toggle="tab">
                        {this.tabsLabels[index]}
                    </a>
                </li>
            );
        }

        return tabsOptions;
    }

	/*
	   handles changes of election-campaign combo item
	*/
    electionCampaignChange(e) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.MUNICIAL_CAMPAIGN_COMBO_VALUE_CHANGE, fieldValue: e.target.value, fieldItem: e.target.selectedItem });
        if (e.target.selectedItem) {
            ElectionsActions.loadMunicipalElectionsExtendedData(this.props.dispatch, this.props.router.params.cityKey, e.target.selectedItem.key);
        }
    }

    render() {
        this.filteredMunicipalCampaignsList = this.props.campaignsList.filter(campaign => {
            return campaign.type == this.knessetElectionCampaignType;
        });

        return (
            <div role="tabpanel">
                <div className="containerStrip tabContnt" style={{ backgroundColor: '#ffffff', borderTopColor: 'transparent' }}>
                    <div className="form-horizontal">
                        <div className="row">
                            <label htmlFor="system-select" className="col-lg-2 control-label">בחר מערכת בחירות</label>
                            <div className="col-lg-2">
                                <Combo items={this.filteredMunicipalCampaignsList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name'
                                    value={this.props.selectedCampaign.selectedValue} onChange={this.electionCampaignChange.bind(this)} />
                            </div>
                        </div>
                    </div>
                </div>
                <br />
                {
                    (this.props.selectedCampaign.selectedItem) &&
                    <div className="containerTabs">
                        <ul className="nav nav-tabs tabsRow" role="tablist">
                            {this.renderTabsOptions()}
                        </ul>
                        <div className="tab-content tabContnt">
                            {(this.props.activeTabIndex == 0) && <div className="tab-pane active"><FirstSubTab /></div>}
                            {(this.props.activeTabIndex == 1) && <div className="tab-pane active"><SecondSubTab /></div>}
                            {(this.props.activeTabIndex == 2) && <div className="tab-pane active"><ThirdSubTab /></div>}
                        </div>
                    </div>
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        selectedCampaign: state.elections.citiesScreen.cityPanelScreen.selectedCampaign,
        campaignsList: state.elections.citiesScreen.cityPanelScreen.campaignsList,
        activeTabIndex: state.elections.citiesScreen.cityPanelScreen.firstGeneralTabScreen.activeTabIndex,
    }
}

export default connect(mapStateToProps)(withRouter(PrimaryFirstTab));