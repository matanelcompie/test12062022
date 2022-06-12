import React from 'react'
import ModalWindow from 'components/common/ModalWindow'

/**
 * Duplicate user modal function
 *
 */
const DuplicateUserModal = function({show, disabledOkStatus}) {

	return (
		<ModalWindow 
			title="משתמש מחובר"
			show={show}
			disabledOkStatus={disabledOkStatus} >
			<div>המשתמש הנוכחי כבר מחובר למערכת</div>
			<div>אנא סגור חלון זה או החלון השני</div>
		</ModalWindow>
	)
}

export default DuplicateUserModal