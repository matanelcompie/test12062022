import React from 'react';

const PhoneItem = ({rolePhoneNumber, phoneIndex, item, setRolePhoneNumber,showWarningPhoneDeletionModal}) => {
    const icons = {
        exists: {class: 'phone-exists phone-icon', title: 'מספר קיים'},
        new: {class: 'add-phone phone-icon', title: 'מספר חדש'}
    };

    let blockClass = '';

    if ( phoneIndex == 0 ) {
        blockClass = "col-lg-offset-3 col-lg-9 flexed-center row-spacing flexed-space-between";
    } else {
        blockClass = "col-lg-offset-3 col-lg-9 flexed-center flexed-space-between";
    }

    let title = '';
    let className = '';

    if ( item.key != null ) {
        title = icons.exists.title;
        className = icons.exists.class;
    } else {
        title = icons.new.title;
        className = icons.new.class;
    }

    let buttonDisabled = false;

    let phoneToCheck = item.phone_number.split('-').join('');
    let rolePhoneNumberToCheck = '';
    if ( rolePhoneNumber.length > 0 ) {
        rolePhoneNumberToCheck = rolePhoneNumber.split('-').join('');

        if ( phoneToCheck == rolePhoneNumberToCheck ) {
            buttonDisabled = true;
        }
    }
    return (
        <div className={blockClass} style={{marginBottom: '13px'}}>
            <div>
                <span className={className} title={title}/>
                <span className="phone-num item-space">{item.phone_number}</span>
            </div>
            <button disabled={buttonDisabled} title="השתמש במספר זה" type="button"
                    className="btn srch-btn-mini pull-left"
                    onClick={setRolePhoneNumber.bind(this, phoneIndex)}>השתמש במספר זה
            </button>
            <span className="glyphicon glyphicon-erase" title='מחק מספר זה'
                onClick={showWarningPhoneDeletionModal.bind(this, phoneIndex)}
                aria-hidden="true">
            </span>

        </div>
    );
};

export default PhoneItem;