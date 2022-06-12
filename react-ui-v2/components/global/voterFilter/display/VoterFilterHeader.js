import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import TextInput from 'tm/components/common/TextInput';


const VoterFilterHeader = ({ name, id, countVoters, onNameChange, onRefreshCountVotersClick, isCalculatingCount }) => {
    let textValues = {
        id: 'מספר',
        countVoters: 'כמות תושבים בקבוצה',
    }
    return (
        <div className="voter-filter-header">
            <div className="voter-filter-header__part">
                <TextInput className="voter-filter-header__name"
                    name='name'
                    label="שם הפילטר"
                    value={name}
                    onChange={onNameChange}
                />
                {id && <span className="voter-filter-header__id">{textValues.id}: {id}</span>}
            </div>
            <div className="voter-filter-header__part">
                <span className="voter-filter-header__count-icon" />
                <span className="voter-filter-header__count-label">{textValues.countVoters}</span>
                <span className="voter-filter-header__count-number">{(countVoters ? countVoters.toLocaleString() : 0)}</span>
                <div className="voter-filter-header__btns">
                    <div className="voter-filter-header__btn" onClick={onRefreshCountVotersClick}><i className={"fa fa-repeat" + (isCalculatingCount ? " fa-spin" : "")} aria-hidden="true" /></div>
                    <div className="voter-filter-header__btn"><i className="fa fa-file-excel-o" aria-hidden="true" /></div>
                </div>
            </div>
        </div>
    );
};

VoterFilterHeader.propTypes = {
    name: PropTypes.string,
    id: PropTypes.number,
    countVoters: PropTypes.number,
    onNameChange: PropTypes.func,
    onRefreshCountVotersClick: PropTypes.func,
};

VoterFilterHeader.defaultProps = {
    countVoters: 0,
};

export default VoterFilterHeader;
