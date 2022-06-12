import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import HouseholdSearch from "./HouseholdSearch";
import Captain50SearchFilters from './Captain50SearchFilters';
import HouseholdResults from './HouseholdResults';
import HouseholdLoadingData from './HouseholdLoadingData';

class HouseholdAllocation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchCollapse: true,
            getOnlyVoters: 0,
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
    }

    updateCollapseSearch() {
        this.setState({searchCollapse: !this.state.searchCollapse});
    }

    getBlockClass() {
        return (this.props.display) ? "tab-pane active" : "tab-pane";
    }

    shouldComponentBeRendered() {
        if ( this.props.currentTabRoleSystemName == this.electionRoleSytemNames.ministerOfFifty ) {
            return true;
        } else {
            return false;
        }
    }
    inputCheckboxChange(fieldName, e){
        let isChecked = e.target.checked;
        let obj = new Object;
        obj[fieldName] = isChecked ? 1 : 0;
        this.setState(obj)
    }
    render() {
        if ( this.shouldComponentBeRendered() ) {
            return (
                <div role="tabpanel" className={this.getBlockClass()} id="Tab2">
                    <div className="containerStrip">
                        <div className="ContainerCollapse">
                            <a onClick={this.updateCollapseSearch.bind(this)}
                               aria-expanded={this.state.searchCollapse}>
                                <div className="row panelCollapse">
                                    <div className="collapseArrow closed"></div>
                                    <div className="collapseArrow open"></div>
                                    <div className="collapseTitle">חיפוש</div>
                                </div>
                            </a>

                        </div>

                        <HouseholdSearch 
                            searchCollapse={this.state.searchCollapse}
                            currentAllocationTab={this.props.currentAllocationTab}
                            currentTabRoleSystemName={this.props.currentTabRoleSystemName}
                            getOnlyVoters={this.state.getOnlyVoters}
                        />
      
                    </div>

                    { this.props.currentUser.admin && 
                        <div className="row" style={{textAlign: 'center', padding: '10px'}}> 
                            <div className="col-sm-12 "> 
                                <label className="control-label" >חיפוש ושיוך בוחרים בלבד! </label>
                                <input type="checkbox"  className="checkbox-inline" style={{ marginRight: '30px' }}
                                    checked={this.state.getOnlyVoters} onChange={this.inputCheckboxChange.bind(this, 'getOnlyVoters')} />
                            </div>
                        </div>
                    }
                    <Captain50SearchFilters searchCollapse={this.state.searchCollapse}/>
                    { this.props.loadingHouseholdsFlag &&
                        <HouseholdLoadingData/>
                    }

                    <HouseholdResults currentTabRoleSystemName={this.props.currentTabRoleSystemName} getOnlyVoters={this.state.getOnlyVoters}/>
                </div>
            );
        } else {
            return <div>{'\u00A0'}</div>;
        }
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        loadingHouseholdsFlag: state.elections.activistsScreen.loadingHouseholdsFlag
    };
}

export default connect(mapStateToProps)(HouseholdAllocation);