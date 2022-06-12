import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import ModalWindow from 'components/global/ModalWindow';


class EditRoleModal extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();

        this.state = {
            formFields: {
                type: this.electionRolesEditTypes.updateForCitiesWithEqualAmount,
                budget: ''
            },

            buttons: [
                {
                    class: 'btn new-btn-default btn-secondary pull-right',
                    text: 'ביטול',
                    action: this.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text:  'שמור ועדכן',
                    action: this.editRole.bind(this),
                    disabled: true
                }
            ]
        };
    }

    initConstants() {
        this.electionRolesEditTypes = constants.electionCampaigns.budget.electionRolesEditTypes;

        this.invalidColor = '#cc0000';
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.editedRoleFlag && nextProps.editedRoleFlag ) {
            this.hideModal();
        }
    }

    resetState() {
        let formFields = [...this.state.formFields];
        let buttons = [...this.state.buttons];

        formFields.type = this.electionRolesEditTypes.updateForCitiesWithEqualAmount;
        formFields.budget = '';
        buttons[1].disabled = true;
        this.setState({formFields, buttons});
    }

    editRole() {
        let buttons = this.state.buttons;
        buttons[1].disabled = true;
        this.setState({buttons});

        this.props.editRole(this.props.electionRoleItem.key, this.state.formFields);
    }

    hideModal() {
        this.resetState();

        this.props.hideEditRoleModal();
    }

    getTitle() {
        if ( this.props.electionRoleItem == null ) {
            return '\u00A0';
        }

        let title = "עריכת תקציב לתפקיד: ";
        title += this.props.electionRoleItem.election_role_name;

        return title;
    }

    typeChange(newType) {
        let formFields = { ...this.state.formFields };
        formFields.type = newType;

        this.setState({formFields});
    }

    budgetChange(event) {
        let formFields = { ...this.state.formFields };
        let buttons = [...this.state.buttons];

        formFields.budget = event.target.value;
        buttons[1].disabled = !this.validateBudget(formFields.budget);

        this.setState({formFields, buttons});
    }

    validateBudget(budget) {
        let reg = /[0-9]+/;
        let regLeadingZeros = /^0+/;

        if ( budget.length == 0 ) {
            return false;
        } else if (reg.test(budget) && !regLeadingZeros.test(budget)) {
            return (budget != this.props.electionRoleItem.budget);
        }
    }

    validateVariables() {
        if ( !this.validateBudget(this.state.formFields.budget) ) {
            this.budgetInputStyle = { borderColor: this.invalidColor };
        }
    }

    initVariables() {
        this.budgetInputStyle = {};
    }

    render() {
        this.initVariables();
        this.validateVariables();
        return (
            <ModalWindow show={this.props.show} buttonX={this.hideModal.bind(this)}
                         title={this.getTitle()} style={{zIndex: '9001'}} buttons={this.state.buttons}>
                <div className="row">
                    <div className="col-lg-5">
                        <div className="col-lg-5">תפקיד</div>
                        <div className="col-lg-7">
                            <strong>{this.props.electionRoleItem != null ? this.props.electionRoleItem.election_role_name : '\u00A0'}</strong>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-5">
                        <div className="col-lg-5">סכום נוכחי</div>
                        <div className="col-lg-7">
                            <strong>{this.props.electionRoleItem != null ? this.props.electionRoleItem.budget : '\u00A0'}</strong>
                        </div>
                    </div>

                    <div className="col-lg-7">
                        <form className="form-horizontal">
                            <label htmlFor="inputModalSum" className="col-lg-4 control-label">סכום לעדכון</label>
                            <div className="col-lg-5">
                                <input type="text" className="form-control" style={this.budgetInputStyle} id="inputModalSum"
                                       value={this.state.formFields.budget} onChange={this.budgetChange.bind(this)}/>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <input type="radio" checked={this.state.formFields.type == this.electionRolesEditTypes.updateForAllCities}
                               onChange={this.typeChange.bind(this, this.electionRolesEditTypes.updateForAllCities)}/>
                        <span>{'\u00A0'}עדכן לכל הערים</span>
                    </div>

                    <div className="form-group">
                        <input type="radio"
                               checked={this.state.formFields.type == this.electionRolesEditTypes.updateForCitiesWithEqualAmount}
                               onChange={this.typeChange.bind(this, this.electionRolesEditTypes.updateForCitiesWithEqualAmount)}/>
                        <span>{'\u00A0'}עדכן הסכום רק לערים שבהן הסכום הנוכחי זהה</span>
                    </div>

                    <div className="form-group">
                        <input type="radio"
                               checked={this.state.formFields.type == this.electionRolesEditTypes.updateForCitiesWithInEqualAmount}
                               onChange={this.typeChange.bind(this, this.electionRolesEditTypes.updateForCitiesWithInEqualAmount)}/>
                        <span>{'\u00A0'}עדכן הסכום רק לערים שבהן הסכום הנוכחי שונה</span>
                    </div>

                    <div className="form-group">
                        <input type="radio"
                               checked={this.state.formFields.type == this.electionRolesEditTypes.updateWithoutCities}
                               onChange={this.typeChange.bind(this, this.electionRolesEditTypes.updateWithoutCities)}/>
                        <span>{'\u00A0'}שמור ואל תעדכן בערים</span>
                    </div>
                </div>
            </ModalWindow>
        );
    }
};

function mapStateToProps(state) {
    return {
        editedRoleFlag: state.elections.electionsCampaignsScreen.budget.editedRoleFlag
    };
}

export default connect(mapStateToProps) (EditRoleModal);