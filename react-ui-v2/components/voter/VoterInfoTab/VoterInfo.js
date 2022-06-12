import React from 'react';
import {withRouter} from 'react-router';
import { connect } from 'react-redux';

import VoterDetails from './VoterDetails';
import VoterContact from './VoterContact';
import VoterAddress from './VoterAddress';
import VoterUser from './VoterUser';
import VoterAdditionalData from './VoterAdditionalData';

import * as VoterActions from '../../../actions/VoterActions';


class VoterInfo extends React.Component {

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            };
        } else {
            this.blockStyle = {};
        }

        this.infoBlockClass = "tab-content tabContnt hidden";

        this.detailsTabStyle = {
            display: "none"
        };

        this.contactTabStyle = {
            display: "none"
        };

        this.addressTabStyle = {
            display: "none"
        };

        this.userTabStyle = {
            display: "none"
        };

        this.metaTabStyle = {
            display: "none"
        };
    }

    updateCollapseStatus(container) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_COLLAPSE_CHANGE,
                             container: container});
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.infoBlockClass = "tab-content tabContnt";

            this.detailsTabStyle = {};
            this.contactTabStyle = {};
            this.addressTabStyle = {};
            this.userTabStyle = {};
            this.metaTabStyle = {};

            return;
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data'] == true) {
            this.infoBlockClass = "tab-content tabContnt";
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data.details'] == true) {
            this.detailsTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data.contact_details'] == true) {
            this.contactTabStyle  = {};
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data.address'] == true) {
            this.addressTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data.user'] == true) {
            this.userTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data.meta'] == true) {
            this.metaTabStyle = {};
        }
    }

    render() {
        this.initVariables();

        this.checkPermissions();

        return (
            <div className={this.infoBlockClass} id="tabMoreInfo" style={this.blockStyle}>
                <div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">
                    <div className="ContainerCollapse" style={this.detailsTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'infoDetails')}
                           aria-expanded={this.props.containerCollapseStatus.infoDetails}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">פרטים נוספים</div>
                            </div>
                        </a>

                        <VoterDetails/>
                    </div>

                    <div className="ContainerCollapse" style={this.contactTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'infoContact')}
                           aria-expanded={this.props.containerCollapseStatus.infoContact}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">פרטי קשר</div>
                            </div>
                        </a>

                        <VoterContact/>
                    </div>

                    <div className="ContainerCollapse" style={this.addressTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'infoAddress')}
                           aria-expanded={this.props.containerCollapseStatus.infoAddress}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">כתובת</div>
                            </div>
                        </a>

                        <VoterAddress/>
                    </div>

                    <div className="ContainerCollapse" style={this.userTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'infoUser')}
                           aria-expanded={this.props.containerCollapseStatus.infoUser}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">משתמש מערכת</div>
                            </div>
                        </a>

                        <VoterUser/>
                    </div>

                    <div className="ContainerCollapse" style={this.metaTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'infoAdditionalData')}
                           aria-expanded={this.props.containerCollapseStatus.infoAdditionalData}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">נתונים נוספים</div>
                            </div>
                        </a>

                        <VoterAdditionalData/>
                    </div>
                </div>                    
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterInfo));