import React from 'react';
import { connect } from 'react-redux';

import Combo from 'components/global/Combo';
import InstituteModal from 'components/global/instituteModal/InstituteModal';

import * as ElectionsActions from 'actions/ElectionsActions';


class InstituteUpdate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: false,

            dataFields: {
                institute: {
                    id: null,
                    key: null,
                    name: '',
                    institute_type_id: null
                },

                institute_role: {id: null, name: ''}
            },

            combos: {
                instituteRoles: []
            },

            instituteModal: {
                show: false
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.emptyFieldObj = {id: null, name: '', key: null};

        this.invalidColor = '#cc0000';
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.cleanData && nextProps.cleanData ) {
            let dataFields = {
                institute: {
                    id: null,
                    key: null,
                    name: '',
                    institute_type_id: null
                },

                institute_role: {id: null, name: ''}
            };
            this.setState({dataFields});

            this.props.resetMassUpdateClean('instituteData');
        }
    }

    updateCollapseStatus() {
        let collapsed = !this.state.collapsed;

        this.setState({collapsed});
    }

    updateComponentParent(dataFieldsObj ) {
        let validInput = true;

        if ( dataFieldsObj.institute.id != null && dataFieldsObj.institute_role.id == null ) {
            validInput = false;
        }

        let dataObj = {
            institute_id: dataFieldsObj.institute.id,
            institute_role_id: dataFieldsObj.institute_role.id,

            validInput: validInput
        };
        this.props.updateMassUpdateData('instituteData', dataObj);
    }

    instituteRoelChange(event) {
        let selectedItem = event.target.selectedItem;
        let dataFields = this.state.dataFields;

        if ( null == selectedItem ) {
            dataFields.institute_role = {...this.emptyFieldObj, name: event.target.value};
        } else {
            dataFields.institute_role = {
                id: selectedItem.id,
                name: selectedItem.name,
                key: selectedItem.key
            };
        }
        this.setState({dataFields});

        this.updateComponentParent(dataFields );
    }

    loadInstitutesRoles(instituteTypeId) {
        let combos = this.state.combos;
        combos.instituteRoles = this.props.instituteRoles.filter(roleItem => roleItem.institute_type_id == instituteTypeId);
        this.setState({combos});
    }

    updateInstituteDetails(instituteDetails) {
        let dataFields = this.state.dataFields;

        dataFields.institute = {
            id: instituteDetails.id,
            key: instituteDetails.key,
            name: instituteDetails.name,
            institute_type_id: instituteDetails.institute_type_id
        };

        dataFields.institute_role = this.emptyFieldObj;

        this.setState({dataFields});

        this.loadInstitutesRoles(instituteDetails.institute_type_id);

        this.hideInstituteModal();

        this.updateComponentParent(dataFields );
    }

    hideInstituteModal() {
        let instituteModal = this.state.instituteModal;

        instituteModal.show = false;
        this.setState({instituteModal});
    }

    showInstituteModal() {
        let instituteModal = this.state.instituteModal;

        instituteModal.show = true;
        this.setState({instituteModal});
    }

    validateInstituteRole(dataFieldsObj = null) {
        let instituteRoleId = (dataFieldsObj == null) ? this.state.dataFields.institute_role.id : dataFieldsObj.id;
        let instituteRoleName = (dataFieldsObj == null) ? this.state.dataFields.institute_role.name : dataFieldsObj.name;

        if ( instituteRoleName.length == 0 ) {
            return true;
        } else {
            return (instituteRoleId != null);
        }
    }

    validateVariables() {
        if ( this.state.dataFields.institute.id != null && this.state.dataFields.institute_role.id == null ) {
            this.instituteRoleInputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.instituteRoleInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className="ContainerCollapse institute-update">
                <a data-toggle="collapse" onClick={this.updateCollapseStatus.bind(this)} aria-expanded={this.state.collapsed}
                   aria-controls="collapseExample">
                    <div className="row panelCollapse">
                        <div className="collapseArrow closed"/>
                        <div className="collapseArrow open"/>
                        <div className="collapseTitle">עדכון מוסד</div>
                    </div>
                </a>

                <div className={"institute-mass-update" + (this.state.collapsed ? "" : " hidden")}>
                    <div className="row CollapseContent nomargin">
                        <div className="col-lg-4">
                            <div className="form-group">
                                <label htmlFor="voter-manuals-institute-details" className="col-sm-4 control-label">פרטי מוסד</label>
                                <div className="col-sm-7">
                                    <input type="text" className="form-control" id="voter-manuals-institute-details"
                                           aria-describedby="helpBlock" value={this.state.dataFields.institute.name} disabled={true}/>
                                </div>
                                <div className="col-sm-1 srchIcon">
                                    <img src={window.Laravel.baseURL + "Images/ico-search-blue.svg"} title="חפש מוסד"
                                         style={{cursor: 'pointer'}} onClick={this.showInstituteModal.bind(this)}/>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="form-group">
                                <label htmlFor="voter-manuals-institute-role" className="col-sm-4 control-label">תפקיד במוסד</label>
                                <div className="col-sm-8">
                                    <Combo id="voter-manuals-institute-role"
                                           items={this.state.combos.instituteRoles}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.instituteRoleInputStyle}
                                           value={this.state.dataFields.institute_role.name}
                                           className="form-combo-table"
                                           onChange={this.instituteRoelChange.bind(this)}/>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">{'\u00A0'}</div>
                    </div>
                </div>

                <InstituteModal show={this.state.instituteModal.show} hideModal={this.hideInstituteModal.bind(this)}
                                updateInstituteDetails={this.updateInstituteDetails.bind(this)}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        instituteRoles: state.elections.votersManualScreen.combos.instituteRoles
    }
}

export default connect(mapStateToProps) (InstituteUpdate);