import React from 'react';
import { connect } from 'react-redux';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

import Ethnic from './Ethnic';
import ReligiousGroups from './ReligiousGroups';
import VoterTitle from './VoterTitle';
import VoterEnding from './VoterEnding';
import SupportStatus from './SupportStatus';
import VoterActionType from './VoterAction/VoterActionType';
import VoterMeta from './VoterMeta/VoterMetaKeys';
import VoterElectionRoles from './VoterElectionRoles';
import ShasRepresentativeRoles from './ShasRepresentativeRoles';
import ReligiousCouncilRoles from './ReligiousCouncilRoles';
import CityShasRoles from './CityShasRoles';
import Institute from './Institute/Institute';
import InstituteGroup from './InstituteGroup/InstituteGroup';
import InstituteNetwork from './InstituteNetwork';
import InstituteRole from './InstituteRole';
import VoterGroup from './VoterGroup/VoterGroup';
import PartyList from './PartyList/PartyList';
import CsvSource from './CsvSource/CsvSource';

class VoterTab extends React.Component {

    constructor(props) {
        super(props);
        this.isPermissionsLoaded = false;
    }

    componentDidMount() {
        this.loadLists();
    }

    componentDidUpdate() {
        this.loadLists();
    }

    loadLists() {
        if (this.props.currentUser.first_name.length && !this.isPermissionsLoaded) {
            this.isPermissionsLoaded = true;
            if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections'])) {
                /*if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.support_status'])) {
                    SystemActions.loadSupportStatus(store);
                }*/

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.action_topics_and_types'])) {
                    SystemActions.loadVoterActionType(store);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.metas'])) {
                    SystemActions.loadVoterMetaKeys(store);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.roles'])) {
                    SystemActions.loadVoterElectionRoles(store);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.ethnic_groups'])) {
                    SystemActions.loadEthnic(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.religious_groups'])) {
                    SystemActions.loadReligiousGroups(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.voter_titles'])) {
                    SystemActions.loadVoterTitle(store.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.voter_endings'])) {
                    SystemActions.loadVoterEnding(store.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.religious_council_roles'])) { 
                    SystemActions.loadReligiousCouncilRoles(store);
                }
                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.city_shas_roles'])) {
                    SystemActions.loadCityShasRoles(store);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.shas_representative_role'])) {
                    SystemActions.loadShasRepresentativeRoles(store);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute'])) {
                    SystemActions.loadInstitute(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.groups'])) {
                    SystemActions.loadInstituteGroups(store);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.networks'])) {
                    SystemActions.loadInstituteNetworks(store);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.types'])) {
                    SystemActions.loadAllInstituteTypes(store);
                }
				
                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.voter_groups'])) {
					SystemActions.loadVoterGroups(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.party_lists'])) {
                    SystemActions.loadPartyLists(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.csv_sources'])) {
                    SystemActions.loadCsvSource(this.props.dispatch);
                }
            }
        }
    }

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }
    }

    render() {
        this.initVariables();
        return (
            <div style={this.blockStyle} className="tabContnt">
                <PartyList />
                <VoterGroup />
                <Institute />
                <InstituteGroup />
                <InstituteNetwork />
                <InstituteRole />
                <ShasRepresentativeRoles />
                <ReligiousCouncilRoles />
                <CityShasRoles />
                <VoterElectionRoles />
                <VoterMeta />
                {/*<SupportStatus />*/}
                <Ethnic />
                <ReligiousGroups />
                <VoterTitle />
                <VoterEnding />
                <VoterActionType />
                <CsvSource />

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
    };
}

export default connect(mapStateToProps)(VoterTab);