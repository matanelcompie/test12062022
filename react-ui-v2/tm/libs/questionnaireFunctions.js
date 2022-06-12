export function serachForNextQuestions(questions, questionId) {
	let questionsAndimOrder = [];
	questions.map(q => {
		q.possible_answers.map(pa => {
			if (pa.jump_to_question_id == questionId)
				if (questionsAndimOrder.indexOf(q.admin_order) === -1)
					questionsAndimOrder.push(q.admin_order)
		})
		if (q.next_question_id == questionId)
			if (questionsAndimOrder.indexOf(q.admin_order) === -1)
				questionsAndimOrder.push(q.admin_order)
	});
	return questionsAndimOrder;
}
/**
 * @function isEditQuestionsMode
 * -> check if the questionnaire is valid
 * 
 * @param questionnaire - current questionnaire
 * -> questionnaire.questions - questions list
 * @param questionTypeConstOptions - types of the questions.
 * 
 * 1. if no questions ,is not vaild!
 * 2. if not define next question
 * 3. if not define answers in questions that must 2 answers
 * (-> that you must select answers from multiple answers)
 * @returns {object} validData
 * validData.valid {bool} -> is the Questionnaire valid.
 * validData.invalidQuestion {int} -> the invalid question id 
 */
export function isQuestionnaireValid(questionnaire, questionTypeConstOptions) {
	let questionObj = {};
	let validData = { valid: false, invalidQuestion: -1 };

	if (!_.isEmpty(questionnaire) && questionnaire.questions.length > 0) {
		validData.valid = true;
		questionnaire.questions.forEach(q => {
			// console.log(q);
			let nextQuestions = getNextQuestionsHash(q);
			/**Check questions that required more then one answer.*/
			if ([1, 2].includes(q.type) && q.possible_answers.length < 2) {
				validData.valid = false;
				validData.invalidQuestion = q.id;
				return;
			}
			/**Check their is enough answers.*/

			if (!q.next_question_id && checkPossibleAnswers(q, nextQuestions)) {
				validData.valid = false;
				validData.invalidQuestion = q.id;
				return;
			}
			questionObj[q.id] = _.uniq(nextQuestions);
		});
	}
	if (validData.valid) {
		checkQuestionsTreeFlow(questionObj, validData);
	}
	return validData;

}
/**
 * @function getNextQuextionsHash
 * Get next questions for single question
 * @param {object} question 
 * @param {array} question.possible_answers - possible answers list for question
 * @returns {array} list of the next possible questions id.
 */
function getNextQuestionsHash(question) {
	let nextQuestions = [];
	nextQuestions = question.possible_answers
		.filter(function (possible_answer) {
			return possible_answer.jump_to_question_id ? true : false;
		}).map(function (possible_answer) {
			return possible_answer.jump_to_question_id;
		});
	// Check if no need to ignore from the defult question.
	if (question.next_question_id && question.next_question_id != -1 && checkPossibleAnswers(question, nextQuestions)) {
		nextQuestions.push(question.next_question_id);
	}
	return nextQuestions;
}
/**
 * @function checkPossibleAnswers
 * Check if their is not enough possible answers
 * -> if their is no possible answers
 * -> or the possible answers number not Suitable for number of questions
 * @returns bool 
 */
function checkPossibleAnswers(q, nextQuestions) {
	return (q.possible_answers.length == 0 || nextQuestions.length != q.possible_answers.length);
}
/**
 * 
 *  @param {object} questionObj - hash of the, next possible questions list, for every question.
 * -> The prop name is the question id.
 * -> The prop value the list of the possible answers id.
 * @param {object} validData -> see isQuestionnaireValid() below
 */
function checkQuestionsTreeFlow(questionObj, validData) {
	let hashObj = {};
	var questionsIds = Object.keys(questionObj);
	let questionId = questionsIds[0];
	checkInQuestionTreeRec(validData, questionObj, hashObj, questionId);
}
/**
 * @function checkInQuestionTreeRec
 * Recursive function for check if question tree is valid
 * -> If their is no endless loop in the questions flow.
 * (Alway begin in the first question)
 * @param {object} validData -> see isQuestionnaireValid() below
 * @param {object} questionObj -> see checkQuestionsTreeFlow() below. (not changes in the recursion)
 * @param {object} hashObj -> object of the all parents nodes, for every node.
 * -> used for check if the current node alredy apper before 
 * -> if so ,that mean that we have "endless loop", and the Questionnaire not vaild!
 * @param {int} questionId - current node question id
 */
function checkInQuestionTreeRec(validData, questionObj, hashObj, questionId) {
	// console.log(validData.valid, questionObj, questionObj[questionId], hashObj, questionId);
	let possible_answers = questionObj[questionId];

	if (!validData.valid) { //If the Questionnaire not vaild - stop the recursion
		return;
	}

	if (hashObj.hasOwnProperty(questionId)) {
		validData.valid = false;
		validData.invalidQuestion = validData.parentId;
		return;
	}
	hashObj[questionId] = questionId;
	validData.parentId = questionId;
	// If node has childrens, check in all the node childrens in recursion.
	if (!_.isEmpty(possible_answers)) {
		possible_answers.forEach(function (answerId) {
			return checkInQuestionTreeRec(validData, questionObj, hashObj, answerId);
		});
	}
	// delete the node from hash object, after wee check all is childrens.
	delete hashObj[questionId];
}