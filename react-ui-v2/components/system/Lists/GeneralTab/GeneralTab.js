import React from 'react';
import { connect } from 'react-redux';

import * as SystemActions from 'actions/SystemActions';

import Country from './Country';
import City from './City';
import Area from './Area/Area';
import Neighborhood from './Neighborhood/Neighborhood';
import Street from './Street';
import PhoneType from './PhoneType';
import Language from './Language/Language';
import CityDepartment from './CityDepartment/CityDepartment';

class GeneralTab extends React.Component {
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
            if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general'])) {
                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.phone_types'])) {
                    SystemActions.loadPhoneType(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.cities'])
                    || (this.props.currentUser.permissions['system.lists.general.neighborhoods'])) {
                    SystemActions.loadCities(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.countries'])) {
                    SystemActions.loadCountries(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.areas']) 
                    || (this.props.currentUser.permissions['system.lists.general.cities'])) {
                    SystemActions.loadAreas(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.languages'])) {
                    SystemActions.loadLanguage(this.props.dispatch);
                }
                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.city_departments'])) {
                    SystemActions.loadCityDepartment(this.props.dispatch);
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
                <PhoneType />
                <Street />
                <Neighborhood />
                <Area />
                <City />
                <Country />
                <Language />
                <CityDepartment />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
    };
}

export default connect(mapStateToProps)(GeneralTab);