import React from 'react';
import ComboSelect from 'tm/components/common/ComboSelect';

const SelectPortionCombo = function ({ onChoosePortion, portionList }) {
    let portionListMaped = portionList.map(function (portionObj) {
        portionObj.value = portionObj.portionKey;
        portionObj.label = portionObj.campaign_name + ' -> ' + portionObj.name;
    })
    return (
        <div className="choose-inactive-questionnaire">
            {
                portionList.length > 0 ?
                    <ComboSelect
                        multiSelect={false}
                        name={'portions'}
                        placeholder={'בחר מנה'}
                        options={portionList}
                        onChange={onChoosePortion}
                        itemDisplayProperty="label"
                        itemIdProperty="value"
                        // value={portionList[0].portionKey}
                    />
                    : ''
            }
        </div>
    )
}


export default SelectPortionCombo;            