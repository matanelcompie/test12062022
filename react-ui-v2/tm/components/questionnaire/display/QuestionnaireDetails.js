import React from 'react';
import PropTypes from 'prop-types';

import TextInput from 'tm/components/common/TextInput';
import TextArea from 'tm/components/common/TextArea';
import LaddaButton from 'tm/components/common/LaddaButton';


const QuestionnaireDetails = ({ onSaveQuestionnaireClick, onFreezeQuestionnaireClick, onArciveQuestionnaireClick,
    onCancelNewQuestionnaire, isPending, newQuestionnaire, details, onDetailsChange,
    isEditQuestions, canEditQuestionnaire, canDeleteQuestionnaire }) => {
    let textValues = {
        name: 'שם',
        description: 'תיאור כללי',
        freezeLabel: 'הקפא',
        unfreezeLabel: 'הוצא מהקפאה',
        saveLabel: 'שמירה',
        deleteLabel: 'העבר לארכיון',
        cancelLabel: 'בטל',
    };
    /**
     * @function
     * check if the name of the questionnaire is valid
     * -> if not ,turn the save button off!
     */
    function checkValidName() {
        if (!details.name || details.name.trim().length < 3) {
            return false;
        }
        return true;
    }
    let renderBtns = () => {
        let btnArray = [];

        if (newQuestionnaire) {
            btnArray.push(
                <LaddaButton
                    key="cancel"
                    className="questionnaire-details__btn questionnaire-details__btn_type_cancel"
                    disabled={isEditQuestions}
                    onClick={() => onCancelNewQuestionnaire()}
                >{textValues.cancelLabel}</LaddaButton>
            );
        } else {
            btnArray.push(
                (canDeleteQuestionnaire && <LaddaButton
                    key="delete"
                    className="questionnaire-details__btn questionnaire-details__btn_type_delete"
                    disabled={isEditQuestions}
                    onClick={() => onArciveQuestionnaireClick()}
                >{textValues.deleteLabel}</LaddaButton>),
                (canEditQuestionnaire && <LaddaButton
                    key="freeze"
                    className="questionnaire-details__btn questionnaire-details__btn_type_freeze"
                    disabled={isEditQuestions}
                    onClick={() => onFreezeQuestionnaireClick()}
                >{details.activeQuestionnaire ? textValues.freezeLabel : textValues.unfreezeLabel}</LaddaButton>)
            );
        }
        btnArray.push(
            canEditQuestionnaire && <LaddaButton
                key="save"
                className="questionnaire-details__btn questionnaire-details__btn_type_save"
                onClick={() => onSaveQuestionnaireClick()}
                disabled={isEditQuestions || !checkValidName()}
                loading={isPending}
            >{textValues.saveLabel}</LaddaButton>
        );

        return btnArray;
    };

    return (
        <div className="questionnaire-details">
            <div className="form-horizontal row">
                <div className="col-xs-5">
                    <TextInput
                        name={'name'}
                        value={details.name}
                        type='text'
                        label={textValues.name}
                        onChange={onDetailsChange}
                        isHorizontal={true}
                    />
                </div>
                <div className="col-xs-7">
                    <TextArea
                        name={'description'}
                        value={details.description}
                        label={textValues.description}
                        onChange={onDetailsChange}
                        rows={3}
                        isHorizontal={true}
                    />
                </div>
                <div className="col-xs-12 text-left">{renderBtns()}</div>
            </div>
        </div>
    );
};

QuestionnaireDetails.propTypes = {
    onSaveQuestionnaireClick: PropTypes.func,
    onFreezeQuestionnaireClick: PropTypes.func,
    onDeleteQuestionnaireClick: PropTypes.func,
    onCancelNewQuestionnaire: PropTypes.func,
    isPending: PropTypes.bool,
    newQuestionnaire: PropTypes.bool,
    details: PropTypes.object,
    onDetailsChange: PropTypes.func,
};

QuestionnaireDetails.defaultProps = {
    onSaveQuestionnaireClick: () => { },
    onFreezeQuestionnaireClick: () => { },
    onDeleteQuestionnaireClick: () => { },
    onCancelNewQuestionnaire: () => { },
    isPending: false,
    newQuestionnaire: false,
};

export default QuestionnaireDetails;