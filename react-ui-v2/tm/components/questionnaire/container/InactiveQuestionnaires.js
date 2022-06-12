import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as questionnaireActions from 'tm/actions/questionnaireActions';

import ModalWindow from 'tm/components/common/ModalWindow';
import ChooseInactiveQuestionnaire from '../display/ChooseInactiveQuestionnaire';

class InactiveQuestionnaires extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onCloseChooseInactiveQuestionnaires = this.onCloseChooseInactiveQuestionnaires.bind(this);
        this.onActivateQuestionnaire = this.onActivateQuestionnaire.bind(this);
        this.onChooseQuestionnaireToActive = this.onChooseQuestionnaireToActive.bind(this);
        this.checkOkBtnStatus = this.checkOkBtnStatus.bind(this);
    }

    onActivateQuestionnaire() {
        if (this.props.questionnaireKey) {
            this.props.arciveOldQuestionnaire(this.props.questionnaireKey);
        }
        let questionnaire;
        if (this.props.questionnaireToActivate) {
            questionnaire = { key: this.props.questionnaireToActivate, active: 1 };
            this.props.questionnaireActions.updateQuestionnaire(questionnaire);
        } else {
            Object.keys(this.props.otherQuestionnaires).forEach((item, i) => {
                if (this.props.otherQuestionnaires[i].key == this.props.copyQuestionnaire)
                    questionnaire = this.props.otherQuestionnaires[i];
            });
            this.props.questionnaireActions.copyOtherQuestionnaireToCampaign(questionnaire.key, this.props.campaignKey);
        }
    }

    onCloseChooseInactiveQuestionnaires() {
        this.props.questionnaireActions.onCloseInactiveQuestionnairesModal();
    }

    onChooseQuestionnaireToActive(event) {

        if (event.target.name == "questionnaire")
            this.props.questionnaireActions.onChososeCampaignQuestionnaire(event.target.value);
        else
            this.props.questionnaireActions.onChososeOtherQuestionnaire(event.target.value);
    }
    checkOkBtnStatus() {
        if (!this.props.questionnaireToActivate && !this.props.copyQuestionnaire) {
            return true;
        }
        return false;
    }
    render() {
        return (
            <ModalWindow
                show={true}
                title={"בחר שאלון קיים"}
                buttonOk={(_.isEmpty(this.props.inactiveQuestionnaires) && _.isEmpty(this.props.otherQuestionnaires) ? this.onCloseChooseInactiveQuestionnaires : this.onActivateQuestionnaire)}
                buttonCancel={this.onCloseChooseInactiveQuestionnaires}
                buttonX={this.onCloseChooseInactiveQuestionnaires}
                disabledOkStatus={this.checkOkBtnStatus()}
                children={
                    <div>
                        <ChooseInactiveQuestionnaire
                            inactiveQuestionnaires={this.props.inactiveQuestionnaires}
                            otherQuestionnsires={this.props.otherQuestionnaires}
                            onChooseQuestionnaireToActive={this.onChooseQuestionnaireToActive}
                            copyQuestionnaire={this.props.copyQuestionnaire}
                            questionnaireToActivate={this.props.questionnaireToActivate}
                        />
                    </div>
                }
            />
        );
    }
}

InactiveQuestionnaires.propTypes = {
    isEditQuestions: PropTypes.bool
};

function mapStateToProps(state, ownProps) {
    return {
        inactiveQuestionnaires: state.tm.questionnaire.inactiveQuestionnaires || {},
        otherQuestionnaires: state.tm.questionnaire.otherQuestionnaires || {},
        copyQuestionnaire: state.tm.questionnaire.copyQuestionnaire || '',
        questionnaireToActivate: state.tm.questionnaire.questionnaireToActivate || '',
        campaignKey: state.tm.campaign.currentCampaignKey,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        questionnaireActions: bindActionCreators(questionnaireActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InactiveQuestionnaires);
