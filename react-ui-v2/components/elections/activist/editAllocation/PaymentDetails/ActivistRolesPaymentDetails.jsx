
import React from 'react';

import   './ActivistRolesPaymentDetails.scss'
import * as PaymentAction from 'actions/PaymentAction';
import LoadingTable from '../../../../global/LoadingTable/LoadingTable'
import PaymentType from '../../../../../Enums/PaymentType';
import PaymentStatus from '../../../../../Enums/PaymentStatus';
import ModalWindow from 'components/global/ModalWindow'
import { connect } from 'react-redux';
 class ActivistRolesPaymentDetails extends React.Component{

  constructor(props) {
    super(props);
    this.state = {arrayPaymentDetails: [],loadingTable:false,showChangeCommentsModal:false,paymentSelected:false,showModelSum:false};
  } 

  componentDidMount() {
    this.loadPaymentDetails()
  }

  loadPaymentDetails(){
    
    this.setState({loadingTable:true});
    PaymentAction.getPaymentByElectionRoleKey(this.props.electionRoleVoter.id).then(paymentsDetails => {
   console.log(paymentsDetails.data.data);
      this.setState({arrayPaymentDetails:paymentsDetails.data.data});
    this.setState({loadingTable:false});
  });
  }


  getDetailsPaymentTransfer(payment){
    if(payment.payment_type_system_name==PaymentType.BANK_TRANSFER){
      return <div><b>בנק: </b>{payment.bank_name}<b> סניף:</b> {payment.bank_branch_name}<b> - </b>{payment.bank_account_number}</div>
    }
  }

  getBallotMiId(ballotMiId) {
    if (ballotMiId == undefined) return "";
    var miIdStr = ballotMiId.toString();
    var lastDigit = miIdStr.charAt(miIdStr.length - 1);

    return miIdStr.substring(0, miIdStr.length - 1) + "." + lastDigit;
  }



  handleChange(field,event) {
    var payment=this.state.paymentSelected;
    payment[field]=event.target.value;
    this.setState({paymentSelected:{...payment}});
  }

  updateCommentsRole() {
    var payment=this.state.paymentSelected;
    var index=this.state.arrayPaymentDetails.findIndex(a=>a.activist_roles_payments_id==payment.activist_roles_payments_id);
    this.updatePaymentField(index,'comment',payment.comment);
    this.closeModelComment();
  }

  updateSum() {
    var payment=this.state.paymentSelected;
    var index=this.state.arrayPaymentDetails.findIndex(a=>a.activist_roles_payments_id==payment.activist_roles_payments_id);
    this.updatePaymentField(index,'sum',payment.sum);
    this.closeModelSum();
  }


  closeModelComment(){
    this.setState({showChangeCommentsModal:false});
  }

  closeModelSum(){
    this.setState({showModelSum:false});
  }

  updateNotForPay(index,e) {
    let value = e.target.checked?1:0;
    this.updatePaymentField(index,'not_for_payment',value);
  }

  updatePaymentField(index,field,value){
    var payment=this.state.arrayPaymentDetails[index];
    payment[field]=value;
    this.state.arrayPaymentDetails[index]=payment;
    this.setState({arrayPaymentDetails:[...this.state.arrayPaymentDetails]});
    
    PaymentAction.updateActivistPaymentRole(
      this.props.dispatch,
      payment
    );
  }

  EventChangeComments(e) {
    let value = e.target.value;
    let electionRole = { ...this.state.changeActivistPaymentItem };
    electionRole.comment = value;
    this.setState({ changeActivistPaymentItem: electionRole });
  }

render() {
  return <div role="tabpanel" className={(this.props.display) ? "tab-pane active" : "tab-pane"}>
  {this.state.loadingTable?<LoadingTable></LoadingTable>: <div className="containerTable">

             <table className="table table-condensed table-striped">
       <thead>
           <tr>
              <th></th>
             <th>תפקיד</th>
             <th>פרטי שיבוץ</th>
             <th>סוג תשלום</th>
             <th>סכום</th>
             <th>נעול</th>
             <th>לא לתשלום</th>
             <th>הערה</th>
             <th>סטטוס תשלום</th>
             <th>תאריך העברה</th>
             {/* <th>מבצע העברה</th> */}
             <th>מספר אסמכתא</th>
             <th>מספר אסמכתא מקור</th>
             <th>פרטי העברה</th>
             {/* <th></th> */}
           </tr>
       </thead>

       <tbody>
            {this.state.arrayPaymentDetails.map((payment,index)=>(
              <tr  key={index} data-toggle="collapse" data-target={'#row'+payment.id} className="accordion-toggle">
                 <td> {!payment.payment_status_system_name || payment.payment_status_system_name==PaymentStatus.WAITE_FOR_PAYMENT? <i style={{color:'#aba5a5'}} className="fa fa-times" aria-hidden="true"></i>:null}
                        {payment.payment_status_system_name==PaymentStatus.INCORRECT_PAYMENT? <i style={{color:'red'}} className="fa fa-exclamation-circle fa-in-table" aria-hidden="true"></i>:null}
                        {payment.payment_status_system_name==PaymentStatus.WAITE_FOR_CONFIRM_PAYMENT? <i style={{color:'#aba5a5'}} className="fa fa-check fa-in-table" aria-hidden="true"></i>:null}
                        {payment.payment_status_system_name==PaymentStatus.PAYMENT_PAID? <i style={{color:'rgb(54 222 98)'}} className="fa fa-check fa-in-table" aria-hidden="true"></i>:null}
                        </td>
                <td>{payment.election_roles_name}</td>
                <td>{payment.cluster_name?<div><b>אשכל: </b>{payment.cluster_name} {payment.ballot_box_mi_id?<b>קלפי : {this.getBallotMiId(payment.ballot_box_mi_id)}</b>:''}</div>:'---'}</td>
                <td>{!payment.payment_type_additional_name?'בסיס':payment.payment_type_additional_name}</td>
                <td onClick={()=>{this.setState({paymentSelected:{...payment},showModelSum:true})}}>{payment.sum} &#8362;</td>
                <td>{payment.user_lock_id && payment.user_lock_id!=0? 
                <i onClick={()=>this.updatePaymentField(index,'user_lock_id',0)} style={{ cursor: "pointer", fontSize: "22px", color: "#1d68a9" }} className="fa fa-lock"aria-hidden="true"></i>
                :<i onClick={()=>this.updatePaymentField(index,'user_lock_id',1)} style={{ cursor: "pointer", fontSize: "22px" }} className="fa fa-key"aria-hidden="true"></i>
                }
                </td>
                <td>
                <input
                      type="checkbox"
                      checked={payment.not_for_payment}
                      onChange={(event)=>{this.updateNotForPay(index,event)}}
                    />
                </td>
                <td onClick={()=>{this.setState({paymentSelected:{...payment},showChangeCommentsModal:true})}}>
                  {payment.comment && payment.comment!=''?payment.comment:<img  src={window.Laravel.baseURL + "Images/no-comment.png"} style={{ cursor: "pointer" }} title={payment.comment}/>}
                  </td>
                <td>{payment.payment_status_name?payment.payment_status_name:'ממתין לתשלום'}</td>
                <td>{payment.transfer_date}</td>
                {/* <td>{payment.masav_user_create}</td> */}
                <td>{payment.reference_id}</td>
                <td>{payment.first_reference_id?payment.first_reference_id:payment.reference_id}</td>
                <td>{this.getDetailsPaymentTransfer(payment)}</td>
                  {/* <td><button className="btn btn-default btn-xs"><span className="glyphicon glyphicon-eye-open"></span></button></td> */}
              </tr>
                      ))}

       </tbody>
   </table>
   {this.state.showChangeCommentsModal && (
            <div className="modal-md">
              <ModalWindow
                disabledOkStatus={
                  this.state.paymentSelected.user_lock_id &&
                  this.state.paymentSelected.user_lock_id != ""
                }
                show={true}
                title="עדכון הערת תשלום"
                buttonOk={this.updateCommentsRole.bind(this)}
                showCancel={true}
                buttonCancel={this.closeModelComment.bind(this)}
                buttonX={this.closeModelComment.bind(this)}
              >
                <div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label
                          htmlFor="input-change-sum"
                          className="col-lg-2 control-label"
                        >
                          הערה
                        </label>
                        <div className="col-lg-10">
                          <input 
                            type="text"
                            className="form-control"
                            id="input-change-sum"
                            value={this.state.paymentSelected.comment}
                            onChange={this.handleChange.bind(this,'comment')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {this.state.paymentSelected.user_lock_id &&
                  this.state.paymentSelected.user_lock_id != "" ? (
                    <div className="row">
                      {" "}
                      <div className="errorEditField">
                        פעיל נעול , אין אפשרות לערוך
                      </div>
                    </div>
                  ) : null}
                </div>
              </ModalWindow>{" "}
            </div>
          )}
   </div>}
<div>
{this.state.showModelSum && (
            <div className="modal-md">
              <ModalWindow
                disabledOkStatus={
                  this.state.paymentSelected.user_lock_id &&
                  this.state.paymentSelected.user_lock_id != ""
                }
                show={true}
                title="עדכון הערת תשלום"
                buttonOk={this.updateSum.bind(this)}
                showCancel={true}
                buttonCancel={this.closeModelSum.bind(this)}
                buttonX={this.closeModelSum.bind(this)}
              >
                <div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label
                          htmlFor="input-change-sum"
                          className="col-lg-2 control-label"
                        >
                          סכום לתשלום
                        </label>
                        <div className="col-lg-10">
                          <input 
                            type="text"
                            className="form-control"
                            id="input-change-sum"
                            value={this.state.paymentSelected.sum}
                            onChange={this.handleChange.bind(this,'sum')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {this.state.paymentSelected.user_lock_id &&
                  this.state.paymentSelected.user_lock_id != "" ? (
                    <div className="row">
                      {" "}
                      <div className="errorEditField">
                        פעיל נעול , אין אפשרות לערוך
                      </div>
                    </div>
                  ) : null}
                </div>
              </ModalWindow>{" "}
            </div>
          )}
   </div>

</div>
}


}

function mapStateToProps(state) {
  return {
     
  }
}


export default connect(mapStateToProps)(ActivistRolesPaymentDetails);