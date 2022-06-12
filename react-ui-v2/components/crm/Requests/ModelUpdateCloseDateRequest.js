import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import ModalWindow from "../../global/ModalWindow";
import * as VoterActions from "../../../actions/VoterActions";
import * as CrmActions from "../../../actions/CrmActions";
import * as DateActionHelper from '../../../helper/DateActionHelper'


class ModelUpdateCloseDateRequest extends React.Component {
 
    constructor(props) {
        super(props);
        this.state={
            'addDayTargetCloseDate':null,
            'openModalUpdateEndDate':this.props.open
        }
    }

 

    updateEndDateRequest=()=> {
      debugger
        let numberAdd=+this.state.addDayTargetCloseDate;
        if(numberAdd>0){
            let target_close_date=DateActionHelper.convertDD_MM_YYYYTo_YYYY_MM_DD(this.props.dataRequest.target_close_date);
            target_close_date=DateActionHelper.addDays(target_close_date,numberAdd);
            CrmActions.updateRequest(this.props.dispatch,this.props.dataRequest.reqKey,{
                target_close_date:DateActionHelper.myStringDate(target_close_date,false)
            }).then((res)=>{
                if(res){
                    CrmActions.getRequestByKey(this.props.dispatch, this.props.router, this.props.dataRequest.reqKey);
                    this.openAndCloseModelUpdateEndDateRequest(false);
                }
            })
        }
        else
        this.openAndCloseModelUpdateEndDateRequest(false);
    }

    openAndCloseModelUpdateEndDateRequest=(flag=true)=>{
        this.props.openAndCloseModelUpdateEndDateRequest(flag);
     }

    render() {
    return (
      <ModalWindow
        show={this.props.open}
        buttonOk={this.updateEndDateRequest.bind(this)}
        buttonX={this.openAndCloseModelUpdateEndDateRequest.bind(this, false)}
        title={"עדכון תאריך סגירת פניה"}
        style={{ zIndex: "9001" }}
      >
        <strong>האם ברצונך להאריך את תאריך סגירת פניה ?</strong>
        <div
          onChange={(event) => {
            this.setState({ addDayTargetCloseDate: event.target.value });
          }}
          className="row"
          style={{ margin: "10px" }}
        >
          <div className="form-check">
            <input
              value="2"
              style={{ marginLeft: "5px" }}
              className="form-check-input"
              type="radio"
              name="addDay"
              id="2Day"
            />
            <label
              style={{ fontWeight: "normal" }}
              className="form-check-label"
              htmlFor="2Day"
            >
              כן בעוד יומיים
            </label>
          </div>
          <div className="form-check">
            <input
              value="5"
              style={{ marginLeft: "5px" }}
              className="form-check-input"
              type="radio"
              name="addDay"
              id="5day"
            />
            <label
              style={{ fontWeight: "normal" }}
              className="form-check-label"
              htmlFor="5day"
            >
              כן בעוד 5 ימים
            </label>
          </div>

          <div className="form-check">
            <input
              value="10"
              style={{ marginLeft: "5px" }}
              className="form-check-input"
              type="radio"
              name="addDay"
              id="10day"
            />
            <label
              style={{ fontWeight: "normal" }}
              className="form-check-label"
              htmlFor="10day"
            >
              כן בעוד 10 ימים
            </label>
          </div>

          <div className="form-check">
            <input
              value="0"
              style={{ marginLeft: "5px" }}
              type="radio"
              name="addDay"
              id="noDay"
            />
            <label style={{ fontWeight: "normal" }} htmlFor="noDay">
              לא איני רוצה לשנות, תאריך היעד ישאר ל{" "}
              {this.props.dataRequest.target_close_date}
            </label>
          </div>
        </div>
      </ModalWindow>
    );
  }

}

function mapStateToProps(state) {

    return {}
}


export default connect(mapStateToProps) (withRouter(ModelUpdateCloseDateRequest));
