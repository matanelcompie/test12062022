import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from 'store'; 
 
import * as questionnaireActions from 'tm/actions/questionnaireActions';
import * as systemActions from 'tm/actions/systemActions';

import QuestionnaireDetails from '../display/QuestionnaireDetails';
import QuestionnaireHeader from '../display/QuestionnaireHeader';
import QuestionsManagment from './QuestionsManagment';
import NoData from 'tm/components/common/NoData';
import InactiveQuestionnaires from './InactiveQuestionnaires';

class QuestionnaireTab extends React.Component {
    constructor(props, context) {
        super(props, context);
	 
        this.state = {
            details: this.props.details,
            newQuestionnaire: false,
			loadedQst:this.props.loadedQsts,
        }

        this.onDetailsChange = this.onDetailsChange.bind(this);
        this.onSaveDetailsClick = this.onSaveDetailsClick.bind(this);
        this.onFreezeQuestionnaireClick = this.onFreezeQuestionnaireClick.bind(this);
        this.onArciveQuestionnaireClick = this.onArciveQuestionnaireClick.bind(this);
        this.arciveOldQuestionnaireClick = this.arciveOldQuestionnaireClick.bind(this);
        this.onNewQuestionnaireClick = this.onNewQuestionnaireClick.bind(this);
        this.onCancelNewQuestionnaire = this.onCancelNewQuestionnaire.bind(this);
        this.onClickChooseQuestionnaire = this.onClickChooseQuestionnaire.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let state = {};
        let d1 = JSON.stringify(this.props.details);
        let d2 = JSON.stringify(nextProps.details);
        if (d1 != d2){
            this.setState({ details: nextProps.details , loadedQst:true });
		}
		 
		if(!this.props.loadedQsts && nextProps.loadedQsts){
		    this.setState({loadedQst:true});
		}
    }
	
	componentWillUnmount(){
		 //store.dispatch({type:questionnaireActions.types.SET_CAMPAIGN_QST_FIELD , fieldName:'loadedQsts' , fieldValue:false});
	}

    onDetailsChange(event) {
        let details = Object.assign({}, this.state.details);
        details[event.target.name] = event.target.value;
        this.setState({ details });
    }

    onSaveDetailsClick() {
        if (this.state.newQuestionnaire) {
            this.props.questionnaireActions.addQuestionnaire(this.state.details, this.props.campaignKey);
            this.setState({ newQuestionnaire: false });
        }
        else
            this.props.questionnaireActions.updateQuestionnaire(this.state.details);
    }

    onFreezeQuestionnaireClick() {
        let details = Object.assign({}, this.state.details);
        let q = { key: details.key, active: !details.activeQuestionnaire };
        this.props.systemActions.showConfirmMessage('questionnaireActions', 'updateQuestionnaire', [q]);
    }

    arciveOldQuestionnaireClick() {
        this.props.questionnaireActions.archiveOldQuestionnaire(this.state.details.key);
    }
    onArciveQuestionnaireClick() {
        this.props.systemActions.showConfirmMessage('questionnaireActions', 'deleteQuestionnaire', [this.state.details.key, false]);
    }

    onNewQuestionnaireClick() {
        this.setState({ newQuestionnaire: true });
    }

    onCancelNewQuestionnaire() {
        this.setState({ newQuestionnaire: false });
    }

    onClickChooseQuestionnaire() {
        if (!this.props.isEditQuestions) {
            this.props.questionnaireActions.getInactiveQuestionnaires(this.props.campaignKey);
            this.props.questionnaireActions.getOtherQuestionnaires(this.props.campaignKey);
        }
    }

    canAddQuestionnaire(type) {
        if (this.props.currentUser.first_name.length > 0) {
            if (this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.questionnaire.' + type]) return true;
        } else {
            return false;
        }
    }



    render() {
        let canAddQuestionnaire = this.canAddQuestionnaire('add');
        let noDataProps = {
            noDataText: 'לא קיים שאלון',
            rightButtonText: 'צור שאלון חדש',
            leftButtonText: 'בחר שאלון קיים',
            onRightButtonClick: canAddQuestionnaire ? this.onNewQuestionnaireClick : undefined,
            onLeftButtonClick: canAddQuestionnaire ? this.onClickChooseQuestionnaire : undefined,
            isPermittedAdding: canAddQuestionnaire
        }
        return (
            <div className="questionnaire-tab tabContnt containerStrip">
                {(this.props.isNoData && !this.state.newQuestionnaire) ?
                    (this.state.loadedQst ? <NoData {...noDataProps} /> : <div style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים...</div>)
                    :
                    <div>
                        <QuestionnaireHeader
                            questionnaireId={this.state.details.id}
                            onClickChooseQuestionnaire={this.onClickChooseQuestionnaire}
                            isEditQuestions={this.props.isEditQuestions}
                            canEditQuestionnaire={this.canAddQuestionnaire('edit')}
                        />
                        <QuestionnaireDetails
                            onFreezeQuestionnaireClick={this.onFreezeQuestionnaireClick}
                            onArciveQuestionnaireClick={this.onArciveQuestionnaireClick}
                            isPending={this.props.isSaveDetailsPending}
                            onSaveQuestionnaireClick={this.onSaveDetailsClick}
                            isEditQuestions={this.props.isEditQuestions}
                            newQuestionnaire={this.state.newQuestionnaire}
                            onCancelNewQuestionnaire={this.onCancelNewQuestionnaire}
                            details={this.state.details}
                            onDetailsChange={this.onDetailsChange}
                            canEditQuestionnaire={this.canAddQuestionnaire('edit')}
                            canDeleteQuestionnaire={this.canAddQuestionnaire('delete')}
                        />
                        {!this.state.newQuestionnaire &&
                            <QuestionsManagment noDataProps={noDataProps} />
                        }
                    </div>
                }
                {this.props.isOpenInactiveQuestionnaires &&
                    <InactiveQuestionnaires questionnaireKey={this.state.details.key} arciveOldQuestionnaire={this.arciveOldQuestionnaireClick}/>
                }
            </div>
        );
    }
}

QuestionnaireTab.propTypes = {
    isEditQuestions: PropTypes.bool
};

function mapStateToProps(state, ownProps) {
    let details = {};
    if (state.tm.questionnaire.questionnaire) {
        details = {
            id: state.tm.questionnaire.questionnaire.id,
            key: state.tm.questionnaire.questionnaire.key,
            name: state.tm.questionnaire.questionnaire.name,
            description: state.tm.questionnaire.questionnaire.description,
            activeQuestionnaire: state.tm.questionnaire.questionnaire.active
        };
    }

    return {
        isNoData: _.isEmpty(state.tm.questionnaire.questionnaire),
        details,
        isEditQuestions: state.tm.questionnaire.isEditQuestionsMode,
        isSaveDetailsPending: !!state.tm.questionnaire.saveDetailsPending,
        campaignKey: state.tm.campaign.currentCampaignKey,
        isOpenInactiveQuestionnaires: state.tm.questionnaire.isOpenInactiveQuestionnaires,
        inactiveQuestionnaires: state.tm.questionnaire.inactiveQuestionnaires,
        currentUser: state.system.currentUser,
		questionnaire:state.tm.questionnaire.questionnaire,
		loadedQsts:state.tm.questionnaire.loadedQsts,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        questionnaireActions: bindActionCreators(questionnaireActions, dispatch),
        systemActions: bindActionCreators(systemActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuestionnaireTab);
