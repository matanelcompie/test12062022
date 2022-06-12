import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';

import * as ElectionsActions from '../../../../actions/ElectionsActions';
import * as VoterActions from '../../../../actions/VoterActions';
import ModalWindow from '../../../global/ModalWindow';
import CityRolesByVoters from './PrimarySecondTabSubTabs/CityRolesByVoters';
import CityCouncilMembers from './PrimarySecondTabSubTabs/CityCouncilMembers';
import ReligeousCouncilOrCityShasMembers from './PrimarySecondTabSubTabs/ReligeousCouncilOrCityShasMembers';

class PrimarySecondTab extends React.Component {

    constructor(props) {
        super(props);
    }
	
    updateActiveTabIndex(activeTabIndex) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_SUB_TAB, activeTabIndex });
    }
	
	 /*
	function that sets dynamic items in render() function : 
	*/
    initDynamicVariables() {
		 this.firstTabHeaderItem = null;
         this.firstTabContentItem = null;
         this.secondTabHeaderItem = null;
         this.secondTabContentItem = null;
         this.thirdTabHeaderItem = null;
         this.thirdTabContentItem = null;
         this.fourthTabHeaderItem = null;
         this.fourthTabContentItem = null;
         this.fifthTabHeaderItem = null;
         this.fifthTabContentItem = null;
         let tabsIndexer = 0;

         if ( this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.roles.mayor'] == true ){
                 this.firstTabHeaderItem=
                                <li className={"cursor-pointer" + (this.props.activeTabIndex == tabsIndexer ? " active" : "")} role="presentation"  onClick={this.updateActiveTabIndex.bind(this, tabsIndexer)}>
                                    <a href={"#tab-2-Tab" + tabsIndexer} role="moreInfo" data-toggle="tab">ראש העיר</a>
                                </li>;
                 this.firstTabContentItem=<div role="tabpanel" className={this.props.activeTabIndex == tabsIndexer ? "tab-pane active":"tab-pane"} id={"tab-2-Tab" + tabsIndexer}>
                                    <div className="containerStrip">
                                        <div className="row panelContent">
                                             <CityRolesByVoters roleType={0} collectionName='cityRolesMayors' newScreenName='newMayorRoleScreen' hideOutdatedRoles={false} btnAddText="הוסף ראש עיר" />
                                        </div>
                                    </div>
                                </div>;
                 tabsIndexer++;
          }
          if ( this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.roles.deputy'] == true ){
                 this.secondTabHeaderItem = <li role="presentation" className={"cursor-pointer" + (this.props.activeTabIndex == tabsIndexer ? " active" : "")}  onClick={this.updateActiveTabIndex.bind(this, tabsIndexer)}>
                                               <a href={"#tab-2-Tab" + tabsIndexer} role="tab" data-toggle="tab">סגני ראש העיר</a>
                                            </li>;
                 this.secondTabContentItem = <div role="tabpanel" className={this.props.activeTabIndex == tabsIndexer ? "tab-pane active":"tab-pane"} id={"tab-2-Tab" + tabsIndexer}>
                                                <div className="containerStrip">
                                                     <div className="row panelContent">
                                                        <CityRolesByVoters roleType={1} collectionName='cityRolesDeputyMayors'  newScreenName='newDeputyMayorRoleScreen' hideOutdatedRoles={true} btnAddText="הוסף סגן ראש עיר" btnShowAllText="הצג את כל הסגנים" btnHideAll="הצג רק סגנים פעילים" />
                                                     </div>
                                                </div>
                                             </div>;
                 tabsIndexer++;
          }
          if ( this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.roles.council'] == true ){
 
                 this.thirdTabHeaderItem = <li role="presentation" className={"cursor-pointer" + (this.props.activeTabIndex == tabsIndexer ? " active" : "")}  onClick={this.updateActiveTabIndex.bind(this, tabsIndexer)}>
                                                  <a href={"#tab-2-Tab" + tabsIndexer} role="tab" data-toggle="tab">חברי מועצה</a>
                                           </li>;
                 this.thirdTabContentItem = <div role="tabpanel" className={this.props.activeTabIndex == tabsIndexer ? "tab-pane active":"tab-pane"} id={"tab-2-Tab" + tabsIndexer}>
                                               <div className="containerStrip">
                                                  <div className="row panelContent">
                                                     <CityCouncilMembers collectionName='cityCouncilMembers'  newScreenName='newCouncilMebmerScreen' btnAddText="הוסף חבר מועצה" btnShowAllText="הצג את כל חברי המועצה" btnHideAll="הצג רק חברי מועצה פעילים" />
                                                  </div>
                                               </div>
                                            </div>;
                 tabsIndexer++;
          }
          if ( this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.roles.religious_council'] == true ){
                this.fourthTabHeaderItem = <li role="presentation" className={"cursor-pointer" + (this.props.activeTabIndex == tabsIndexer ? " active" : "")}  onClick={this.updateActiveTabIndex.bind(this, tabsIndexer)}>
                                               <a href={"#tab-2-Tab" + tabsIndexer} role="tab" data-toggle="tab">תפקידים במועצה הדתית</a>
                                           </li>;
                this.fourthTabContentItem = <div role="tabpanel" className={this.props.activeTabIndex == tabsIndexer ? "tab-pane active":"tab-pane"} id={"tab-2-Tab" + tabsIndexer}>
                                               <div className="containerStrip">
                                                  <div className="row panelContent">
                                                     <ReligeousCouncilOrCityShasMembers newScreenName='newCouncilReligeousRole' 
											                                   collectionName='religiousCouncilMembers'
                                                                               btnAddText="הוסף חבר מועצה דתית"
																			   rolesCollectionName='religiousCouncilRoles'
																			   regularHeader="תפקידים במועצה דתית נוכחית"
																			   historyHeader="תפקידים היסטוריים במועצה דתית"
																			   
																			   />
                                                  </div>
                                               </div>
                                             </div>;
                tabsIndexer++;
          }
          if ( this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.roles.shas'] == true ){
                this.fifthTabHeaderItem = <li role="presentation" className={"cursor-pointer" + (this.props.activeTabIndex == tabsIndexer ? " active" : "")} onClick={this.updateActiveTabIndex.bind(this, tabsIndexer)}>
                                             <a href={"#tab-2-Tab" + tabsIndexer} role="tab" data-toggle="tab">איוש תפקידי ש"ס בעיר</a>
                                          </li>;
                this.fifthTabContentItem = <div role="tabpanel" className={this.props.activeTabIndex == tabsIndexer ? "tab-pane active":"tab-pane"} id={"tab-2-Tab" + tabsIndexer}>
                                              <div className="containerStrip">
                                                 <div className="row panelContent">
                                                     <ReligeousCouncilOrCityShasMembers newScreenName='newCouncilCityShasRole' 
											                                   collectionName='cityShasRolesByVoters' 
																			   btnAddText="הוסף תפקיד"
																			   rolesCollectionName='cityShasRoles'
																			   regularHeader="תפקידי שס בעיר"
																			   historyHeader="תפקידי שס היסטוריים בעיר"
																			   
																			   />
                                                 </div>
                                              </div>
                                           </div>;
                tabsIndexer++;
          }
		
    }
	
    render() {
        this.initDynamicVariables();
        return (
					<div role="tabpanel">
                        <div className="containerTabs">
                            <ul className="nav nav-tabs tabsRow" role="tablist">
                                {this.firstTabHeaderItem}
                                {this.secondTabHeaderItem}
                                {this.thirdTabHeaderItem}
                                {this.fourthTabHeaderItem}
                                {this.fifthTabHeaderItem}
                            </ul>
                            <div className="tab-content tabContnt"> 
                                {this.props.activeTabIndex == 0 && this.firstTabContentItem}
                                {this.props.activeTabIndex == 1 && this.secondTabContentItem}
                                {this.props.activeTabIndex == 2 && this.thirdTabContentItem}
                                {this.props.activeTabIndex == 3 && this.fourthTabContentItem}
                                {this.props.activeTabIndex == 4 && this.fifthTabContentItem}
                            </div>
                        </div>
                    </div>
        );
    }
}


function mapStateToProps(state) {
    return {
	   currentUser: state.system.currentUser,
	   secondGeneralTabScreen:state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen,
       campaignsList : state.elections.citiesScreen.cityPanelScreen.campaignsList,
	   activeTabIndex: state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen.activeTabIndex,
    }
}

export default connect(mapStateToProps)(withRouter(PrimarySecondTab));