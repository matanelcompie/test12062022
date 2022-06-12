import React from 'react';

const WizardItem = ({item, isActive, disabled, goToTab}) => {
    if ( disabled || isActive) {
        return (
            <li className={"step" + (isActive ? " active" : "")}>
                <span className="WizNumber1">{item.num}.</span>
                <span className="WizText">{item.name}</span>
            </li>
        );
    } else {
        return (
            <li className={"step" + (isActive ? " active" : "")} style={{cursor: 'pointer'}} onClick={goToTab.bind(this, item.num)}>
                <span className="WizNumber1">{item.num}.</span>
                <span className="WizText">{item.name}</span>
            </li>
        );
    }
};

export default WizardItem;