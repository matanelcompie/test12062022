// //class for object search details
// module.exports = {
//     areaId:{id:null,name:''},
//     subAreaId:{id:null,name:''},
//     cityId:{id:null,name:''},
//     street:{id:null,name:''},
//     personal_identity:{id:'',name:''},
//     first_name:{id:'',name:''},
//     last_name:{id:'',name:''},
//     phone_number:{id:'',name:''},
//     assignmentStatus:{id:null,name:''},
//     verifyStatus:{id:null,name:''},
//     verifyBankStatus:{id:null,name:''},
//     electionRoleId:{id:null,name:''},
//     assigned_city_id:{id:null,name:''},
//     activistLocked:{id:null,name:''}
// }

export class searchObject {
    
            constructor() {
            this.election_campaign_id={id:null,name:''},
            this.assigned_area_id={id:null,name:''},
            this.assigned_subarea_id={id:null,name:''},
            this.assigned_city_id={id:null,name:''},
            // this.cityId={id:null,name:''},
            // this.street={id:null,name:''},
            this.personal_identity={id:'',name:''},
            this.first_name={id:'',name:''},
            this.last_name={id:'',name:''},
            this.phone_number={id:'',name:''},
            this.assignment_status={id:null,name:''},
            this.verify_status={id:null,name:''},
            this.verify_bank_status={id:null,name:''},
            this.election_role_id={id:null,name:''},
            this.reference_id={id:'',name:''},
            this.activistLocked={id:null,name:''}
            this.paid={id:null,name:''},
            this.payment_type_additional={id:null,name:''}
            
            }
  }