import React from 'react';
import PropTypes from 'prop-types';

const QuestionnaireHeader = ({questionnaireId, isEditQuestions, onClickChooseQuestionnaire, canEditQuestionnaire}) => {

    let textValues = {
        title: 'ניהול שאלון',
        id: 'מספר שאלון',
        chooseExisting: 'בחר שאלון קיים',
    };

    return (
        <div className="tab-title questionnaire-header">
            <div className="tab-title__title">
                {textValues.title}
                {questionnaireId && <span className="questionnaire-header__id">{textValues.id}: {questionnaireId}</span>}
            </div>
            {canEditQuestionnaire && <div className="tab-title__btns">
                <div className={"tm-btn tm-btn_type_choose-existing" + (isEditQuestions ? ' tm-btn_disabled' : '')}  onClick={() => onClickChooseQuestionnaire()}>
                    <i className="fa fa-pencil-square-o" aria-hidden="true"/>
                    <span>{textValues.chooseExisting}</span>
                </div>
            </div>
			}
        </div>
    );
};

QuestionnaireHeader.propTypes = {
    questionnaireId: PropTypes.number,
    onClickChooseQuestionnaire: PropTypes.func
};

QuestionnaireHeader.defaultProps = {
};

export default QuestionnaireHeader;