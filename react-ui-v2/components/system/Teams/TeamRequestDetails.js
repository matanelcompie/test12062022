import React from "react";
import { TeamRequestDetailsDto } from "../../../DTO/TeamRequestDetailsDto";
import * as SystemActions from '../../../actions/SystemActions';
import { connect } from 'react-redux';

class TeamRequestDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      teamDetails: this.props.teamDetails,
      isDirty:false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ teamDetails: nextProps.teamDetails });
  }

  handlerChange=(event)=>{
    let field=event.currentTarget.name;
    let teamDetails={...this.state.teamDetails};
    teamDetails[field]=event.currentTarget.value;
    this.setState(
     {'teamDetails':teamDetails,isDirty:true} 
    );
  }

  saveDetails=(event)=>{
    event.preventDefault();
    let teamRequestDetails=new TeamRequestDetailsDto();
    teamRequestDetails.team_key=this.props.teamKey;
    teamRequestDetails.title=this.state.teamDetails.title;
    teamRequestDetails.signature=this.state.teamDetails.signature;
    teamRequestDetails.phone_number=this.state.teamDetails.phone_number;
    let that=this;
    SystemActions.updateTeamRequestDetails( this.props.dispatch,teamRequestDetails).then((function(res){
      if(res)
        that.setState({'isDirty':false})
    }));
   
  }

  render() {
    return (
      <div className="containerStrip">
        <form style={{ width: "30%", minWidth: "350px" }}>
          <div className="form-group">
            <label>פרטי צוות עבור שליחת הודעות לתושב</label>
          </div>

          <div className="form-group">
            <span>שם צוות פניות</span>
            <input onChange={this.handlerChange} name="title" defaultValue={this.state.teamDetails.title} className="form-control"></input>
          </div>

          <div className="form-group">
            <span>חתימה</span>
            <input onChange={this.handlerChange} name="signature" defaultValue={this.state.teamDetails.signature} className="form-control"></input>
          </div>

          <div className="form-group">
            <span>טלפון</span>
            <input onChange={this.handlerChange} name="phone_number" defaultValue={this.state.teamDetails.phone_number} className="form-control"></input>
          </div>
          <button disabled={!this.state.isDirty} onClick={this.saveDetails} className="btn btn-primary">שמור פרטים</button>
        </form>
      </div>
    );
  }
}

export default connect()(TeamRequestDetails) ;
