import React from 'react';
import PropTypes from 'prop-types';

import TextInput from 'tm/components/common/TextInput';
import ComboSelect from 'tm/components/common/ComboSelect';

import PossibleAnswerButtons from '../display/PossibleAnswerButtons';

const PossibleAnswer = ({questions, question, possibleAnswer, onPossibleAnswerChange, onDeletePossibleAnswer, 
                            isHaveNextQuestion, onAddPossibleAnswerClick, supportStatusConstOptions, isEditMode}) => {

    let textValues = {
        nextQuestion: 'שאלה הבאה',
        possibleAnswer: 'תשובה אפשרית'
    };

    let jumpToQuestion = {};
    let supportStatusName = '';
    let questionsArr = questions.filter(q => {
        return (q.key != question.key && q.active==1);
    }).map(q => {
        if (possibleAnswer.jump_to_question_id == q.id) {jumpToQuestion = q}
        return {value: Number(q.id), label: `${q.admin_order}# ${q.name}`};
    });

    let supportStatusConstOptionsArr = supportStatusConstOptions.map(value => {
        if (possibleAnswer.support_status_id == value.id) {supportStatusName = value.name}
        return {value: value.id, label: value.name};
    });

    function onPossibleAnswerChangeTemp(event){
        let name=(event.target.name).substr((event.target.name).indexOf('_')+1);
        onPossibleAnswerChange(name, event.target.value, possibleAnswer.id);
    }

    return (
        <div className='possible-answer'>
            {isEditMode ?
                <div className="possible-answer__fields">
                    <TextInput
                        name={`${possibleAnswer.id}_text_general`}
                        value={possibleAnswer.text_general}
                        onChange={onPossibleAnswerChangeTemp}
                    />
                    {isHaveNextQuestion &&
                        <ComboSelect
                            value={possibleAnswer.jump_to_question_id}
                            defaultValue={possibleAnswer.jump_to_question_id}
                            name={`${possibleAnswer.id}_jump_to_question_id`}
                            options={questionsArr}
                            onChange={onPossibleAnswerChangeTemp}
                            itemDisplayProperty="label"
                            itemIdProperty="value"
                            multiSelect={false}
                        />
                    }
                    <ComboSelect
                        value={possibleAnswer.support_status_id}
                        defaultValue={possibleAnswer.support_status_id}
                        name={`${possibleAnswer.id}_support_status_id`}
                        options={supportStatusConstOptionsArr}
                        onChange={onPossibleAnswerChangeTemp}
                        itemDisplayProperty="label"
                        itemIdProperty="value"
                        multiSelect={false}
                    />
                </div>
                :
                <div className="possible-answer__fields">
                    <div className="possible-answer__plain-text form-group">{possibleAnswer.text_general}</div>
                    {isHaveNextQuestion &&
                        <div className="possible-answer__plain-text form-group">{(possibleAnswer.jump_to_question_id ? `${jumpToQuestion.admin_order}# ${jumpToQuestion.name}` : '' )}</div>
                    }
                    <div className="possible-answer__plain-text form-group">{supportStatusName}</div>
                </div>
            }
            <PossibleAnswerButtons
                possibleAnswer={possibleAnswer}
                onDeletePossibleAnswer={onDeletePossibleAnswer}
                onAddPossibleAnswerClick={onAddPossibleAnswerClick}
                onPossibleAnswerChange={onPossibleAnswerChange}
                isEditMode={isEditMode}
            />
        </div>
    );
}

PossibleAnswer.propTypes = {
    questions: PropTypes.array,
    question: PropTypes.object,
    possibleAnswer: PropTypes.object,
    onPossibleAnswerChange: PropTypes.func,
    onDeletePossibleAnswer: PropTypes.func,
    isHaveNextQuestion: PropTypes.bool,
    onAddPossibleAnswerClick: PropTypes.func,
    supportStatusConstOptions: PropTypes.array,
    isEditMode: PropTypes.bool
}

export default PossibleAnswer;