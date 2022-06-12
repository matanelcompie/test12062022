import React from 'react';
import PropTypes from 'prop-types';

import ComboSelect from 'tm/components/common/ComboSelect';
import TextInput from 'tm/components/common/TextInput';


const GeographicItemValues = ({onChange, selectedPath, fieldOptions}) => {
 
    let fields = [
        // {label: 'שם', name: 'name'},
        {label: 'אזור', name: 'area', list: fieldOptions.area, className:'col-md-2'},
        {label: 'תת אזור', name: 'sub_area', list: fieldOptions.sub_area, className:'col-md-2'},
        {label: 'עיר', name: 'city', list: fieldOptions.city, className:'col-md-2'},
        {label: 'שכונה', name: 'neighborhood', list: fieldOptions.neighborhood, className:'col-md-2'},
        {label: 'אשכול', name: 'cluster', list: fieldOptions.cluster, className:'col-md-3'},
        {label: 'קלפי', name: 'ballot_box', list: fieldOptions.ballot_box, className:'col-md-1'},
    ];
	
    return (
		<div className="geographic-item-values row" style={{padding:'10px'}}>
            {fields.map(function(item , index){
				
				let field = item;
				 
				return ( <div key={field.name} className={field.className}>
                    <span>{field.label}:</span>
                    <ComboSelect
        				name={field.name}
        				options={field.list}
        				onChange={onChange}
                        maxDisplayItems={6}
        				itemDisplayProperty={field.name=="ballot_box"?"mi_id":"name"}
        				itemIdProperty="id"
        				value={selectedPath[field.name]}
        				defaultValue={selectedPath[field.name]}
        			/>
                </div>);
			})}
			 
    	</div>
    );
};

GeographicItemValues.propTypes = {
    onChange: PropTypes.func,
    fieldOptions: PropTypes.shape({
        area: PropTypes.array.isRequired,
        sub_area: PropTypes.array.isRequired,
        city: PropTypes.array.isRequired,
        neighborhood: PropTypes.array,
        cluster: PropTypes.array,
        ballot_box: PropTypes.array
    })
};

GeographicItemValues.defaultProps = {
    fieldOptions: {
        area: [],
        sub_area: [],
        city: [],
        neighborhood: [],
        cluster: [],
        ballot_box: [],
    }
};

export default GeographicItemValues;
