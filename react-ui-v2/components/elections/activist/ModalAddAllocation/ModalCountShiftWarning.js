import React from 'react'
import ModalWindow from 'components/global/ModalWindow';

const ModalCountShiftWarning = ({buttonOk, buttonCancel, modalCountShiftAllocatedRole, modalCountShiftToAllocateRole}) => {

	let buttons = [
            {
                class: 'btn btn-warning',
                text: 'בטל',
                action: buttonCancel,
                disabled: false
            },
            {
                class: 'btn btn-primary',
                text: 'המשך',
                action: buttonOk,
                disabled: false
            }
        ]
	return (
		<ModalWindow show={true} buttons={buttons} buttonX={buttonCancel}
                     title={"הערה"}>
            <div>פעיל זה משובץ כבר לתפקיד  {modalCountShiftAllocatedRole}</div>
            <div>ולכן אינו יכול לשמש במקביל גם  כ{modalCountShiftToAllocateRole},</div>
            <div>אלא רק כסופר במשמרת ספירה בלבד.</div>
            <div>אם ברצונך לשבץ את הפעיל כסופר במשמרת ספירה לחץ המשך.</div>
            <div>לכל שיבוץ אחר, לחץ ביטול והסר את התפקיד הקיים בטרם השיבוץ.</div>
        </ModalWindow>
	)
}

export default ModalCountShiftWarning;

