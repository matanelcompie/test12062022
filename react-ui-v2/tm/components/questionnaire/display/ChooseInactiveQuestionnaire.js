import React from 'react';
import PropTypes from 'prop-types';

import ComboSelect from 'tm/components/common/ComboSelect';

const ChooseInactiveQuestionnaire = ({ inactiveQuestionnaires, onChooseQuestionnaireToActive, otherQuestionnsires, copyQuestionnaire, questionnaireToActivate }) => {
    let textValues = {
        campaginQuestionnaires: 'רשימת שאלונים מקמפיין נוכחי',
        otherQuestionnaires: 'רשימת שאלונים מקפמיינים אחרים',
        noCampaignQuestionnaires: 'לא קיימים שאלונים בקמפיין נוכחי',
        noOtherQuestionnaires: 'לא קיימים שאלונים בקמפיינים אחרים'
    }
    let values = { copy: '', active: '' };
    
    let questionnairesArr = getVauesArr(inactiveQuestionnaires, 'active');
    let otherQuestionnairesArr = getVauesArr(otherQuestionnsires, 'copy');

    function getVauesArr(valuesArr, type) {
        let dispalyArr = [];
        let itemToActivate = (type === 'active') ? questionnaireToActivate : copyQuestionnaire;
        valuesArr.map((item, i) => {
            if (item.key == itemToActivate) {
                values[type] = item.key
            }
            dispalyArr.push({ value: item.key, label: `${item.name} - ${item.id}#` })
        });
        return dispalyArr;
    }
    return (
        <div className="choose-inactive-questionnaire">
            <div>
                {questionnairesArr.length > 0 ?
                    <ComboSelect
                        label={textValues.campaginQuestionnaires}
                        name="questionnaire"
                        options={questionnairesArr}
                        onChange={onChooseQuestionnaireToActive}
                        itemDisplayProperty="label"
                        itemIdProperty="value"
                        multiSelect={false}
                        value={values.active}
                    />
                    :
                    <span>{textValues.noCampaignQuestionnaires}</span>
                }
            </div>
            <div>
                {otherQuestionnairesArr.length > 0 ?
                    <ComboSelect
                        label={textValues.otherQuestionnaires}
                        name="otherQuestionnaire"
                        options={otherQuestionnairesArr}
                        onChange={onChooseQuestionnaireToActive}
                        itemDisplayProperty="label"
                        itemIdProperty="value"
                        multiSelect={false}
                        value={values.copy}
                    />
                    :
                    <span>{textValues.noOtherQuestionnaires}</span>
                }
            </div>

        </div>
    )
}

ChooseInactiveQuestionnaire.propTypes = {
    inactiveQuestionnaires: PropTypes.array,
    otherQuestionnsires: PropTypes.array,
    onChooseQuestionnaireToActive: PropTypes.func
}

export default ChooseInactiveQuestionnaire;            