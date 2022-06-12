import React from 'react';
import PropTypes from 'prop-types';

import TextInput from 'tm/components/common/TextInput';
import TextArea from 'tm/components/common/TextArea';
import ComboSelect from 'tm/components/common/ComboSelect';
import TextFieldOptions from './TextFieldOptions';
import constants from 'tm/constants/constants';

const QuestionForm = ({question, questions, onQuestionChange, questionTypeOptions, onRewindQuestionText, onCopyQuestionTextClick,
                         fieldOptions, onCopyLabel, errorFields, textField}) => {

    let textValues = {
        questionType: 'סוג השאלה',
        nextQuestion: 'שאלה הבאה',
        questionName: 'שם השאלה',
        questionText: 'טקסט השאלה',
        textGeneral: 'ניסוח לשני המינים',
        textMale: 'ניסוח לזכר',
        textFemale: 'ניסוח לנקבה'
    };

    let questionTypeOptionsArr = _.keys(questionTypeOptions).map(value => {
        return {value: Number(value), label: questionTypeOptions[value]};
    });
    let questionsArr = questions.filter(q => {
        return (q.key != question.key && q.active == 1);
    }).map(q => {
        return {value: Number(q.id), label: `${q.admin_order}# ${q.name}`};
    });
    questionsArr.push({value: -1, label: 'שאלה אחרונה'});

    function onDeleteQuestionText(fieldName) {
        let deleteValue  = "";
        onQuestionChange(fieldName,  deleteValue);
    }
    function onQuestionChangeTemp(event){
        let name=event.target.name;

        onQuestionChange(name, event.target.value);
    }

    /**
     * Get question input element
     *
     * @param object field
     * @return JSX
     */
    function getQuestionInput(field) {
        if (question.type != constants.TM.CAMPAIGN.QUESTIONS.TYPES.MESSAGE) {
            return (
                <TextInput 
                    label={field.label} 
                    value={question[field.name]} 
                    name={field.name}
                    onChange={onQuestionChangeTemp}
                    error={errorFields.indexOf(field.name) > -1? true: false}
                     />                
            )
        } else {
            return (
                <TextArea
                    label={field.label} 
                    value={question[field.name]} 
                    name={field.name}
                    onChange={onQuestionChangeTemp}
                    error={errorFields.indexOf(field.name) > -1? "שגיאה": ""}
                     />
            )
        }
    }

    /**
     * Get question input error message
     *
     * @param object field
     * @return string
     */
    function getQuestionInputError(field) {
        let errorText = '\u00A0';
        let baseErrorText = "כמות התווים גדולה מ: ";
        let questionConst = constants.TM.CAMPAIGN.QUESTIONS;
        let value = (question[field.name])? question[field.name] : '';
        if (question.type == questionConst.TYPES.MESSAGE && value.length > questionConst.LENGTH.MESSAGE) {
            errorText = baseErrorText + questionConst.LENGTH.MESSAGE;
        }
        else if (question.type != questionConst.TYPES.MESSAGE && value.length > questionConst.LENGTH.NORMAL) {
            errorText = baseErrorText + questionConst.LENGTH.NORMAL;
        }
        return errorText;
    }

    return (
        <div className="question-form">
            <div className="question-form__row">
                <ComboSelect
                    label={textValues.questionType}
                    value={question.type}
                    defaultValue={question.type}
                    name="type"
                    options={questionTypeOptionsArr}
                    onChange={onQuestionChangeTemp}
                    itemDisplayProperty="label"
                    itemIdProperty="value"
                    multiSelect={false}
                    error={errorFields.indexOf("type") > -1? true: false} />

                <ComboSelect
                    label={textValues.nextQuestion}
                    value={question.next_question_id}
                    defaultValue={question.next_question_id}
                    name="next_question_id"
                    options={questionsArr}
                    onChange={onQuestionChangeTemp}
                    itemDisplayProperty="label"
                    itemIdProperty="value"
                    multiSelect={false} />
            </div>
            <div className="question-form__row">
                <TextInput
                    label={textValues.questionName}
                    value={question.name}
                    name="name"
                    onChange={onQuestionChangeTemp}
                    error={errorFields.indexOf("name") > -1? true: false} />
            </div>
            <div className="question-form__texts-section">
                <span className="question-form__texts-title">{textValues.questionText}:</span>
                {textField.map(field =>
                    <div key={field.name}>
                        <div className="question-form__row">
                            {getQuestionInput(field)}
                            <div className="question-form__row-btns">
                                <span className="btn question-modal__btn" onClick={() => onRewindQuestionText(field.name)}>
                                    <i className="action-icon fa fa-repeat" aria-hidden="true" />
                                </span>
                                <span className="btn question-modal__btn" onClick={() => onCopyQuestionTextClick(field.name)}>
                                    <i className="action-icon fa fa-files-o fa-flip-horizontal" aria-hidden="true" />
                                </span>
                                <span className="btn question-modal__btn" onClick={() => onDeleteQuestionText(field.name)}>
                                    <i className="action-icon fa fa-trash" aria-hidden="true" />
                                </span>
                            </div>
                        </div>
                        <div className="question-form__row">
                            <div className="col-sm-2"></div>
                            <div className="col-sm-10 error">
                                {getQuestionInputError(field)}
                            </div>
                        </div>
                    </div>
                )}
            </div> 
            <TextFieldOptions fieldOptions={fieldOptions} onCopyLabel={onCopyLabel} />
        </div>     
    );
}

QuestionForm.propTypes = {
    question: PropTypes.object,
    questions: PropTypes.array,
    onQuestionChange: PropTypes.func,
    questionTypeOptions: PropTypes.object,
    onRewindQuestionText: PropTypes.func,
    onCopyQuestionTextClick: PropTypes.func,
    fieldOptions: PropTypes.array,
    onCopyLabel: PropTypes.func,
    errorFields: PropTypes.array
}

export default QuestionForm;