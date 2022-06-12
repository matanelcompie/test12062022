import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import Combo from 'components/global/Combo';

import * as ElectionsActions from 'actions/ElectionsActions';


class MoreInfoUpdate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: false,

            dataFieldsObj: {
                ethnic_group: {id: null, name: ''},
                religious_group: {id: null, name: ''},
                gender: {id: null, name: ''},
                ultraOrthodox: {id: null, name: ''}
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.emptyFieldObj = {id: null, name: ''};

        this.gender = constants.gender;
        this.genderArr = [
            {id: constants.gender.male, name: 'זכר'},
            {id: constants.gender.female, name: 'נקבה'}
        ];

        this.ultraOrthodoxArr = [
            {id: 0, name: 'לא'},
            {id: 1, name: 'כן'}
        ];

        this.invalidColor = '#cc0000';
    }

    componentWillMount() {
        ElectionsActions.loadEthnicGroupsForVotersManual(this.props.dispatch);
        ElectionsActions.loadReligiousGroupsForVotersManual(this.props.dispatch);
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.cleanData && nextProps.cleanData ) {
            let dataFieldsObj = {
                ethnic_group: {id: null, name: ''},
                religious_group: {id: null, name: ''},
                gender: {id: null, name: ''},
                ultraOrthodox: {id: null, name: ''}
            };
            this.setState({dataFieldsObj});

            this.props.resetMassUpdateClean('moreInfoData');
        }
    }

    updateCollapseStatus() {
        let collapsed = !this.state.collapsed;

        this.setState({collapsed});
    }

    updateComponentParent(dataFieldsObj ) {
        let dataObj = {
            ethnic_group_id: dataFieldsObj.ethnic_group.id,
            religious_group_id: dataFieldsObj.religious_group.id,
            gender: dataFieldsObj.gender.id,
            ultraOrthodox: dataFieldsObj.ultraOrthodox.id,

            validInput: (this.validateComboField('ethnic_group', dataFieldsObj.ethnic_group) &&
                         this.validateComboField('religious_group', dataFieldsObj.religious_group) &&
                         this.validateComboField('gender', dataFieldsObj.gender) &&
                         this.validateComboField('ultraOrthodox', dataFieldsObj.ultraOrthodox))
        };
        this.props.updateMassUpdateData('moreInfoData', dataObj);
    }

    comboValueChange(fieldName, event) {
        let selectedItem = event.target.selectedItem;
        let dataFields = this.state.dataFieldsObj;

        if ( null == selectedItem ) {
            dataFields[fieldName] = {...this.emptyFieldObj, name: event.target.value};
        } else {
            dataFields[fieldName] = {
                id: selectedItem.id,
                name: selectedItem.name
            };
        }
        this.setState({dataFields});

        this.updateComponentParent( dataFields );
    }

    validateComboField(fieldName, fieldObj = null) {
        let fieldId = (null == fieldObj) ? this.state.dataFieldsObj[fieldName].id : fieldObj.id;
        let name = (null == fieldObj) ? this.state.dataFieldsObj[fieldName].name : fieldObj.name;

        if ( name.length == 0 ) {
            return true;
        } else {
            return (fieldId != null);
        }
    }

    validateVariables() {
        if ( !this.validateComboField('ethnic_group') ) {
            this.ethnicGroupInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateComboField('religious_group') ) {
            this.religiousGroupInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateComboField('gender') ) {
            this.genderInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateComboField('ultraOrthodox') ) {
            this.ultraOrthodoxInputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.ethnicGroupInputStyle = {};
        this.religiousGroupInputStyle = {};
        this.genderInputStyle = {};
        this.ultraOrthodoxInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className="ContainerCollapse more-info-mass-update">
                <a data-toggle="collapse" onClick={this.updateCollapseStatus.bind(this)} aria-expanded={this.state.collapsed}
                   aria-controls="collapseExample">
                    <div className="row panelCollapse">
                        <div className="collapseArrow closed"/>
                        <div className="collapseArrow open"/>
                        <div className="collapseTitle">פרמטרים נוספים</div>
                    </div>
                </a>

                <div className={"more-info-mass-update" + (this.state.collapsed ? "" : " hidden")}>
                    <div className="row CollapseContent">
                        <div className="col-lg-4">
                            <div className="form-group">
                                <label htmlFor="more-info-mass-update-ethnic" className="col-sm-4 control-label">עדה</label>
                                <div className="col-sm-8">
                                    <Combo id="more-info-mass-update-ethnic"
                                           items={this.props.ethnicGroups}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.ethnicGroupInputStyle}
                                           value={this.state.dataFieldsObj.ethnic_group.name}
                                           className="form-combo-table"
                                           onChange={this.comboValueChange.bind(this, 'ethnic_group')}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="form-group">
                                <label htmlFor="more-info-mass-update-religious-group" className="col-sm-4 control-label">זרם</label>
                                <div className="col-sm-8">
                                    <Combo id="more-info-mass-update-religious-group"
                                           items={this.props.religiousGroups}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.religiousGroupInputStyle}
                                           value={this.state.dataFieldsObj.religious_group.name}
                                           className="form-combo-table"
                                           onChange={this.comboValueChange.bind(this, 'religious_group')}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="form-group">
                                <label htmlFor="more-info-mass-update-gender" className="col-sm-4 control-label">מגדר</label>
                                <div className="col-sm-8">
                                    <Combo id="more-info-mass-update-gender"
                                           items={this.genderArr}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.genderInputStyle}
                                           value={this.state.dataFieldsObj.gender.name}
                                           className="form-combo-table"
                                           onChange={this.comboValueChange.bind(this, 'gender')}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        ethnicGroups: state.elections.votersManualScreen.combos.ethnicGroups,
        religiousGroups: state.elections.votersManualScreen.combos.religiousGroups
    }
}

export default connect(mapStateToProps) (MoreInfoUpdate);