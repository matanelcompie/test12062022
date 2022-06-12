<?php

namespace App\Libraries\Services;

use App\Models\Tm\Question;

class QuestionnaireService
{
    /**
     * @method copyQuestionsToQuestionnaire
     * Copy questions from old questionnaire to new questionnaire.
     * -> save the pointers between the old questions
     * 1. create new question from old question
     * 2. save the old question id, that point to the new question id.
     * 3. update the "next_question_id" from the old question id.
     * 4. update all the possible answers id, in the same way.
     * @param [array] $oldQuestions
     * @param [int] $newQuestionnaireId
     * 
     * @var [object] $questionsIdHash 
     * save the old question id, and get the new question id, for every question.
     * 
     * @return void
     */
    public static function copyQuestionsToQuestionnaire($oldQuestions, $newQuestionnaireId, $currentSupportStatuses)
    {
        $questionsIdHash = [];
        $newQuestionList = [];
        foreach ($oldQuestions as $q) {
            $q->questionnaire_id = $newQuestionnaireId;
            $questionValues = $q->toArray();
            $questionValues['questionnaire_id'] = $newQuestionnaireId;
            $questionValues['id'] = null;
            $newQuestion = Question::create($questionValues);
            $questionsIdHash[$q->id] = $newQuestion->id;
            $newQuestionList[] = $newQuestion;
        }
        foreach ($newQuestionList as $newQuestion) {
            $oldNextQuestionId = !empty($newQuestion->next_question_id) ? $newQuestion->next_question_id : null;
            if ($oldNextQuestionId && $oldNextQuestionId != -1) { //Update next question id
                $newQuestion->next_question_id = $questionsIdHash[$oldNextQuestionId];
            }
            foreach ($newQuestion->possible_answers as $possible_answer) { // update possible answers "jump to question id"
                $oldJumpToQuestionId = !empty($possible_answer->jump_to_question_id) ? $possible_answer->jump_to_question_id : null;
                if ($oldJumpToQuestionId && $oldJumpToQuestionId != -1) {
                    $possible_answer->jump_to_question_id = $questionsIdHash[$oldJumpToQuestionId];
                    //only copy support status if in the current election campaign
                    if ($possible_answer->support_status_id != null && !in_array($possible_answer->support_status_id, $currentSupportStatuses)) {
                        $possible_answer->support_status_id = null;
                    }
                    $possible_answer->save();
                }
            }
            $newQuestion->save();
        }
    }
}
