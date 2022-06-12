import React from 'react';
import ComboSelect from 'tm/components/common/ComboSelect';

const TmCampaign = ({ field, onChangeField, currentSelectedCampaigns, deleteSection }) => {
    let label = "קמפיין טלמרקטינג";
    let removeCampaignLabel = "הסר קמפיין";
    let marginR10 = { marginRight: 10 };

    let options = field.options.filter(item => {
        return ((currentSelectedCampaigns.indexOf(item.id) == -1) || (item.id == field.value));
    });

    function handleNumeric(event) {
        let value = event.target.selectedItem ? Number(event.target.selectedItem.id) : null;
        onChangeField(value);
    }

    return (
        <div className="row">
            <div className="col-md-4" style={marginR10}>
                <label>{label}</label>
                <ComboSelect
                    name={`${field.id}`}
                    options={options}
                    onChange={handleNumeric}
                    itemDisplayProperty="name"
                    itemIdProperty="id"
                    value={field.value}
                    //defaultValue={field.value}
                    maxDisplayItems={6}
                />
            </div>
            {(field.id > 0) &&
                <div className="col-md-2 no-padding">
                    <div className="remove-campaign" onClick={deleteSection}>
                        <i className="fa fa-minus-square" aria-hidden="true">&nbsp;&nbsp;{removeCampaignLabel}</i>
                    </div>
                </div>
            }
        </div>
    );
};

export default TmCampaign;
