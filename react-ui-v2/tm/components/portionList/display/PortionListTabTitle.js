import React from 'react';
import PropTypes from 'prop-types';


const PortionListTabTitle = ({ onNewPortionClick, onEditOrderClick, onEditOrderSave, onEditOrderCancel, isEditOrderMode,
    isCalculatingCount, cancelCountVoters, calculateAllPorionsVotersCount, allowAddNewPortion, onChooseExistPortionClick }) => {
    let textValues = {
        title: 'רשימת מנות בקמפיין',
        newPortion: 'הוסף מנה',
        chooseExistPortion: 'בחר מנה קיימת',
        editPortionsOrder: 'ערוך סדר מנות',
        save: 'שמור',
        cancel: 'בטל'
    };
    return (
        <div className="tab-title portion-list-tab-title">
            <div className="tab-title__title">{textValues.title}</div>
            <div className="tab-title__btns">
                {isEditOrderMode ?
                    <div>
                        <button className="btn portion-list-tab-title__choose-portion-btn" onClick={onEditOrderSave}>{textValues.save}</button>
                        <button className="btn portion-list-tab-title__choose-portion-btn" onClick={onEditOrderCancel}>{textValues.cancel}</button>
                    </div>
                    :
                    <div>
                        {isCalculatingCount &&
                            <button className="btn portion-list-tab-title__calculate-portion-voters-count-btn_cancel" onClick={cancelCountVoters}>
                                <i className="fa fa-repeat fa-spin" aria-hidden="true"></i>
                            </button>}
                        {!isCalculatingCount &&
                            <button className="btn portion-list-tab-title__calculate-portion-voters-count-btn" onClick={calculateAllPorionsVotersCount}>
                                <i className="fa fa-calculator" aria-hidden="true"></i>
                            </button>}
                        <button className="btn portion-list-tab-title__choose-portion-btn" onClick={onEditOrderClick}>{textValues.editPortionsOrder}</button>
                        <button className="btn portion-list-tab-title__choose-portion-btn" onClick={onChooseExistPortionClick}>{textValues.chooseExistPortion}</button>
                        {allowAddNewPortion && <button className="btn portion-list-tab-title__btn portion-list-tab-title__new-portion-btn" onClick={onNewPortionClick}>
                            <i className="fa fa-plus" aria-hidden="true" />
                            {textValues.newPortion}
                        </button>}
                    </div>
                }
            </div>
        </div>
    );
}

PortionListTabTitle.propTypes = {
    onNewPortionClick: PropTypes.func,
    onEditOrderClick: PropTypes.func,
    onEditOrderSave: PropTypes.func,
    onEditOrderCancel: PropTypes.func,
    isEditOrderMode: PropTypes.bool
}

export default PortionListTabTitle;
