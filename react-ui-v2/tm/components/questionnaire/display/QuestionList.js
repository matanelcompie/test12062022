import React from 'react';
import PropTypes from 'prop-types';

import QuestionListRow from '../container/QuestionListRow';
import QuestionListHeader from './QuestionListHeader';
import DraggableListItem from 'tm/components/common/DraggableListItem';

const QuestionList = ({questions, isEditQuestions, onReorder}) => {
    return (
        <div className={"question-list" + (isEditQuestions ? ' question-list_editing' : '')}>
            <QuestionListHeader />
            {questions.map((question, index) =>
                <DraggableListItem
                    key={question.key}
                    index={index}
                    isDraggable={isEditQuestions}
                    onReorder={onReorder}
                    group={'question'}
                >
                    <QuestionListRow question={question} isEditQuestions={isEditQuestions}/>
                </DraggableListItem>
            )}
        </div>
    );
}

QuestionList.propTypes = {
    questions: PropTypes.array,
    isEditQuestions: PropTypes.bool,
}

QuestionList.defaultProps = {
    questions: []
}

export default QuestionList;