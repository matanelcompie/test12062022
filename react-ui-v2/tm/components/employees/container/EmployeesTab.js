import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import EmployeesHeader from '../display/EmployeesHeader';
import EmployeesManagement from './EmployeesManagement';

class EmployeesTab extends React.Component {
    constructor(props, context) {
        super(props, context);
    }
    render() {
        return (
            <div className="employees-tab">
                <EmployeesHeader
                    teamId={this.props.teamId}
                    teamDepartmentId={this.props.teamDepartmentId}
                    campaignKey={this.props.campaignKey}
                />
                <EmployeesManagement campaignKey={this.props.campaignKey}
                                    teamId={this.props.campaign.team_id}/>
            </div>
        );
    }
}

EmployeesTab.propTypes = {};

EmployeesTab.defaultProps = {};

function mapStateToProps(state, ownProps) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeesTab);
