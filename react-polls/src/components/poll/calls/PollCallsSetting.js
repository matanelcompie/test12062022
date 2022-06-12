import React from "react";

import SendTestMessageModal from "./SendTestMessageModal";
import AddCallSectionModal from "./AddCallSectionModal";
import CallQuestion from "./CallQuestion";
import constants from "../../../libs/constants";

class PollCallsSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editQuestionData: this.getEmptyQuestion(),
      questionTextMode: 'sms',
      showSendTestMessageModal: false,
      showAddCallSectionModal: false,
    };
  }
  componentDidUpdate(prevProps){
    if(prevProps.questions.length != this.props.questions.length){
    }
  }
  displayModal(name, bool) {
    console.log(name, bool, "sfsdf", `show${name}Modal`);
    let newState = { ...this.state };
    newState[`show${name}Modal`] = bool;
    this.setState(newState);
  }
  displayEditQuestionModal(){
    this.displayModal("AddCallSection", true)
    this.setState({editQuestionData: this.getEmptyQuestion()})
  }
  editQuestion(questionData){
    this.displayModal("AddCallSection", true)
    this.setState({editQuestionData: questionData})
  }
  getEmptyQuestion(){
    return new Object ({
      id: null,
      main: false,
      sms_text: "",
      ivr_text: "",
      response_type: constants.polls.questions.responseTypes.yes,
      answers: [],
    });
  }
  removeCallAnswer(index){
    let newState = {...this.state}
    newState.editQuestionData = {...this.state.editQuestionData}
    let answers = [...this.state.editQuestionData.answers]
    
    let currentAnswer = answers[index];
    // console.log('index', index, currentAnswer)
    if(!currentAnswer.id){ // Remove new answer
      answers.splice(index, 1);
    }  else {
      answers[index].deleted = true;
    }
    // console.log('answers', answers)
    newState.editQuestionData.answers = answers; 
    this.setState(newState)
  }
  addCallAnswer(emptyAnswer){
    let newState = {...this.state}
    newState.editQuestionData = {...this.state.editQuestionData}
    newState.editQuestionData.answers = [...this.state.editQuestionData.answers]
    
    newState.editQuestionData.answers.push(emptyAnswer)

    this.setState(newState)
  }

  renderCallQuestions(){
    console.log('this.props.questions', this.props.questions)
    // Need to check type: sms or ivr!
   return this.props.questions.map((question) => {
      return <CallQuestion
        key={question.id}
        questionTextMode={this.state.questionTextMode}
        question={question}
        editQuestion={this.editQuestion.bind(this, question)}
      ></CallQuestion>
    })
  }
  render() {
    console.log(this.state.showSendTestMessageModal);
    return (
      <div
        className={
          "tab-pane fade new-survey-tab-content " +
          (this.props.currentTab == "call-setting" ? "show active" : "hide")
        }
        id="newSurveyContent"
        role="tabpanel"
        aria-labelledby="conversation-tab"
      >
        {/* tab-content new-survey-tab-content" id="newSurveyContent" */}
        <form>
          <div className="card ">
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  {" "}
                  <p className="black-medium-title">
                    {" "}
                    לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית קולורס
                    מונפרד אדנדום סילקוף, מרגשי ומרגשח עמחליף לפרומי בלוף קינץ
                    תתיח לרעח
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="card ">
            <div className="card-body card-graph-wrapper">
              <div className="row">
                <div className="col-4">
                  <div className="row type-conversation-row">
                    <div className="col-auto">
                      <ul
                        className="nav"
                        id="convesation-type-tab"
                        role="tablist"
                      >
                        <li className="nav-item" role="presentation">
                          <a
                            className="nav-link active"
                            id="sms-tab"
                            data-toggle="tab"
                            role="tab"
                            aria-controls="sms-type"
                            aria-selected="true"
                            onClick={() => {this.setState({questionTextMode: 'sms'})}}

                          >
                            ניסוחי SMS
                          </a>
                        </li>
                        <li className="nav-item" role="presentation">
                          <a
                            className="nav-link"
                            id="ivr-tab"
                            data-toggle="tab"
                            role="tab"
                            aria-controls="ivr-type"
                            aria-selected="false"
                            onClick={() => {this.setState({questionTextMode: 'ivr'})}}
                          >
                            ניסוחי IVR
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <div className="tab-content" id="ConversationTypeContent">
                        <div
                          className="tab-pane fade show active"
                          id="sms-type"
                          role="tabpanel"
                          aria-labelledby="sms-type-tab"
                        >
                          <button
                            onClick={this.displayModal.bind(
                              this,
                              "SendTestMessage",
                              true
                            )}
                            type="button"
                            className="send-test"
                            data-toggle="modal"
                            // data-target="#sendTestModal"
                          >
                            {/* <svg xmlns="http://www.w3.org/2000/svg" width="18.328" height="18.328" viewBox="0 0 18.328 18.328"><defs><style>.a{fill:#323a6b;}</style></defs><path className="a" d="M16.5,0H1.833A1.825,1.825,0,0,0,.009,1.833L0,18.328l3.666-3.666H16.5a1.832,1.832,0,0,0,1.833-1.833v-11A1.832,1.832,0,0,0,16.5,0ZM6.415,8.248H4.582V6.415H6.415Zm3.666,0H8.248V6.415h1.833V8.248Zm3.666,0H11.913V6.415h1.833Z"/></svg> */}
                            שלח הודעת בדיקה
                          </button>
                          <div className="question-section">
                            <ol className="question-content">
                              {this.renderCallQuestions()}
                            </ol>
                          </div>
                        </div>
                        <div
                          className="tab-pane fade"
                          id="ivr-type"
                          role="tabpanel"
                          aria-labelledby="ivr-type-tab"
                        >
                          <button
                            type="button"
                            className="send-test"
                            data-toggle="modal"
                            data-target="#sendVoiceTestModal"
                            onClick={this.displayModal.bind(this,"SendTestMessage")}
                          >
                            {/* <svg xmlns="http://www.w3.org/2000/svg" width="14.656" height="14.694" viewBox="0 0 14.656 14.694"><defs><style>.a{fill:#323a6b;}</style></defs><path className="a" d="M.923,10.784l2.05-2.051a1.363,1.363,0,0,1,2.269.513,1.4,1.4,0,0,0,1.61.879,6.322,6.322,0,0,0,3.807-3.808,1.327,1.327,0,0,0-.878-1.611,1.364,1.364,0,0,1-.512-2.27L11.318.384a1.462,1.462,0,0,1,1.976,0l1.391,1.391c1.391,1.465-.146,5.346-3.587,8.788s-7.32,5.053-8.784,3.588L.923,12.761A1.463,1.463,0,0,1,.923,10.784Z" transform="translate(-0.539 0)"/></svg> */}
                            שלח שיחת בדיקה
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="add-section"
                    data-toggle="modal"
                    data-target="#add-section-modal"
                    onClick={this.displayEditQuestionModal.bind(this,"AddCallSection")}
                  >
                    <img src="src/images/plus.svg" aria-hidden="true" /> הוספת
                    מקטע

                  </button>
                </div>

                <div className="col-8">
                  <div className="inner-card"></div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="back-btn btn-step"
            data-step="survey-tab"
            data-toggle="tab"
          >
            <img
              src="/site/src/images/arrows back.svg"
              title="חזרה"
              alt="חזרה"
            />
          </button>
          <div className="btn-form-wrapper">
            <button
              type="submit"
              className="base-btn outline-button"
              aria-label="שמירה"
              title="שמירה"
            >
              שמירה
            </button>
            <button
              type="button"
              className="base-btn btn-step"
              data-step="population-tab"
              data-toggle="tab"
              aria-label="המשך"
              title=""
            >
              המשך
            </button>
          </div>
        </form>
        <SendTestMessageModal
          show={this.state.showSendTestMessageModal}
          displayModal={this.displayModal.bind(this)}
        ></SendTestMessageModal>
        <AddCallSectionModal
          show={this.state.showAddCallSectionModal}
          editQuestionData={this.state.editQuestionData}
          questions={this.props.questions}
          displayModal={this.displayModal.bind(this)}
          addCallAnswer={this.addCallAnswer.bind(this)}
          removeCallAnswer={this.removeCallAnswer.bind(this)}
          getEmptyQuestion={this.getEmptyQuestion.bind(this)}
          pollKey={this.props.pollKey}
          dispatch={this.props.dispatch}
        ></AddCallSectionModal>
      </div>
    );
  }
}

export default PollCallsSetting;
