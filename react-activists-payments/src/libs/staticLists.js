import constants from '../libs/constants';
const verifyStatus = constants.activists.verifyStatus;
const verifyBankStatuses = constants.activists.verifyBankStatuses;
const electionRolesAdditions = require('../libs/constants').activists.electionRolesAdditions;

export function assignmentStatusArr() {
   
    return [
        { id: null, name: 'הכל' },
        { id: 0, name: 'לא כולל הקצאה' },
        { id: 1, name: 'כולל הקצאה' }
    ]
  }

  export function verifyStatusArr() {
   
    return [
        { id: null, name: 'הכל' },
        { id: verifyStatus.noMessageSent, name: 'טרם נשלחה הודעה' },
        { id: verifyStatus.messageSent, name: 'נשלחה הודעה' },
        { id: verifyStatus.verified, name: 'מאומת' },
        { id: verifyStatus.refused, name: 'מסרב' },
        { id: verifyStatus.moreInfo, name: 'לבירור נוסף' }
    ]
    
}

export function paymentStatus() {
  return [
    { id: null, name: "הכל" },
    { id: 3, name: "שולם" },
    { id: 1, name: "לא שולם" },
    // { id: 2, name: "ממתין לאימות תשלום" },
    { id: 4, name: "חוזרים" },
  ];
}

export function bankVerifyStatusArr() {
  return [
    { id: null, name: "הכל" },
    { id: verifyBankStatuses.allDetailsCompleted, name: "תקין" },
    { id: verifyBankStatuses.notAllDetailsCompleted, name: "חסר" },
    { id: verifyBankStatuses.bankDetailsMissing, name: "לא קיימים פרטי חשבון" },
    {
      id: verifyBankStatuses.VerifyDocumentMissing,
      name: "לא קיים מסמך אימות",
    },
    { id: verifyBankStatuses.bankNotVerified, name: "חשבון לא אומת" },
    { id: verifyBankStatuses.bankNotUpdated, name: "חשבון לא עדכני" },
  ];
}
export function closeActivistRoleArr() {
   return [
    { id: null, name: 'הכל' },
    { id: 2, name: 'נעול' },
    { id: 1, name: 'לא נעול' }
   ]
    
}
export function initialElectionRoles() {
   
    return [
        { id: this.electionRolesAdditions.none, key: null, name: 'ללא תפקיד' },
        { id: this.electionRolesAdditions.all, key: null, name: 'כל תפקיד' }
    ]
}

export function electionRolesAdditionsList() {
  var typeAddition = electionRolesAdditions;
  var arr = [
    { id: -1, name: "ללא תפקיד" },
    { id: 0, name: "כל תפקיד" },
    { id: -2, name: "מרובה תפקידים" },
    { id: -3, name: 'פעיל ש"ס' },
    { id: -4, name: 'פעיל ועדת בחירות' }
  ];

  return arr;
}





// this.invalidColor = '#cc0000';
// if (props.userFilteredCities.length > 0) {
//     this.state.combos.cities = props.userFilteredCities;
// }
