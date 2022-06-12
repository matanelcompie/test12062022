import React from 'react';
import {withRouter} from 'react-router';
import { connect } from 'react-redux';

import * as uiActions from '../../../../actions/uiActions';


class QuestionList extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.maxMarginBottom = 5;
    }

    geListRef(ref) {
        this.questionsListRef = ref;
    }

    getCallNoteRef(ref) {
        this.callNoteRef = ref;
    }

    componentDidUpdate() {
        let marginBottom = 0;
        this.toScroll = false;

        let listHeight = this.questionsListRef.scrollHeight - this.callNoteRef.scrollHeight;
        let questionHeight = 30;

        let numberOfQuestions = this.props.viewedQuestions.length;

        if ( numberOfQuestions > 1 ) {
            marginBottom = Math.floor( (listHeight - (questionHeight * numberOfQuestions )) / (numberOfQuestions - 1) );

            if ( marginBottom < 0 ) {
                this.toScroll = true;
                marginBottom = 0;
            } else if ( marginBottom > this.props.questionMaxMarginBottom ) {
                marginBottom = this.props.questionMaxMarginBottom;
            }
        } else {
            marginBottom = 30;
        }

        uiActions.calculateQuestionMarginBottom(this.props.dispatch, marginBottom);
    }

    renderViewedQuestions() {
        let that = this;
        let numberOfQuestions = this.props.viewedQuestions.length;
        let scrollStyle = {};

        if ( this.toScroll ) {
            scrollStyle = {
                overflowY: 'scroll'
            };
        }

        let viewedQuestions = this.props.viewedQuestions.map( function(questionId, i) {
            let marginBottom = 0;

            if ( i == (numberOfQuestions - 1) ) {
                marginBottom = 0;
            } else {
                marginBottom = that.props.calculatedQuestionMarginBottom;
            }

            let style = {
                marginBottom: marginBottom + 'px',
            };

            return (
                <div key={i}
                     className={
                         "question-list__question" +
                         (that.props.voterAnswers[questionId] ? " question-list__question_answered" : "") +
                         (questionId == that.props.activeQeustionId ? " question-list__question_active" : "")
                     }
                     style={style}
                     onClick={() => that.props.onQuestionClick(questionId)}>
                    {i + 1}
                </div>
            );
        });

        return (
            <div style={scrollStyle}>
                {viewedQuestions}
            </div>
        );
    }

    render() {
        return (
            <div className="question-list" ref={this.geListRef.bind(this)} style={{overflow: 'hidden'}}>
                {this.renderViewedQuestions()}

                <div className="question-list__note-marker" ref={this.getCallNoteRef.bind(this)}>
                    <i className="fa fa-pencil-square-o" aria-hidden="true"/>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        questionMaxMarginBottom: state.ui.questionMaxMarginBottom,
        calculatedQuestionMarginBottom: state.ui.calculatedQuestionMarginBottom
    }
}

export default connect(mapStateToProps)(withRouter(QuestionList));