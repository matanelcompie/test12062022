import React from 'react';
import PropTypes from 'prop-types';

const NextQuestions = ({ question, questions }) => {
    let nextQuestionOrder;
    if (question.next_question_id) {
        let nextQuestion = questions.filter(q => {
            return q.id == question.next_question_id;
        })
        nextQuestionOrder = nextQuestion[0] ? nextQuestion[0].admin_order : null;
    }
    let nextQuestionPossibleAnswer = question.possible_answers.filter(q => {
            if (q.jump_to_question_id && q.active) {
                return q;
            }
        }).map(pa => {
            let question = questions.filter(q => {
                return pa.jump_to_question_id == q.id;
            })
            return question[0] ? { order: question[0].admin_order } : null;
        }).filter(q => {
            return q ? true : false;
        });

    return (
        <div className='next-questions'>
            {nextQuestionOrder &&
                <span className="next-questions__q next-questions__q_type_next">{nextQuestionOrder}</span>
            }
            {nextQuestionPossibleAnswer.map((nextQuestion, i) => {
                return <span className="next-questions__q next-questions__q_type_pa" key={i}>{nextQuestion.order}</span>
            })}
        </div>
    );
};

NextQuestions.propTypes = {
    question: PropTypes.object,
    questions: PropTypes.array,
}

export default NextQuestions;