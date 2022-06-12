import React from 'react';
import PropTypes from 'prop-types';

import QuestionListComponent from '../container/QuestionListComponent';
import QuestionComponent from '../container/QuestionComponent';
import NoteComponent from '../container/NoteComponent';


const Questionnaire = ({nextCall, canUserEndCall}) => {
    return (
        <div className="questionnaire">
            <QuestionListComponent />
            <QuestionComponent nextCall={nextCall} canUserEndCall={canUserEndCall}/>
            <NoteComponent />
        </div>
    );
};

Questionnaire.PropTypes = {

};

export default Questionnaire;
