import React from 'react';
import { connect } from 'react-redux';
import * as ElectionsActions from '../../../../../actions/ElectionsActions';




class SearchActivistVoter extends React.Component {

   

    constructor(props){
        super(props);
        this.state = {
            phone_number: '',
            personal_identity: '',
         }
    }

    componentDidUpdate(prevProps){
        let voterHadChanged = JSON.stringify(this.props.activistVoterItem ) != JSON.stringify(prevProps.activistVoterItem);
        if(voterHadChanged ){
            this.getVoterPhoneNumber();
        }
    }
	searchForVoter(){

		let searchObj = {
			personal_identity: this.state.personal_identity,
			election_role_system_name: this.props.electionRoleSystemName
		}
		let cityKey = this.props.currentCity.key;
		ElectionsActions.searchForVoterActivist(this.props.dispatch, searchObj, cityKey, 'city_view');
	}
    onInputChange(fieldName, e){
        let obj = new Object;
        obj[fieldName] = e.target.value;
        this.setState(obj)
    }
    getVoterPhoneNumber(){
        let activistVoterItem = this.props.activistVoterItem
        let phone_number = '';
        let personal_identity = '';
        if(activistVoterItem.id) {
        personal_identity = activistVoterItem.personal_identity;
        if(activistVoterItem.election_roles_by_voter && activistVoterItem.election_roles_by_voter.length > 0){ // Voter has other election roles.
            phone_number = activistVoterItem.election_roles_by_voter[0].phone_number;
        } else if(activistVoterItem.voter_phones && activistVoterItem.voter_phones.length){ // Get voter Phone number
            phone_number = activistVoterItem.voter_phones[0].phone_number;
        }
        }

        this.setState({phone_number, personal_identity})
    }
    renderVoterResult(){

        return (
          <div className="search-results show">
              <dl className='flexed flexed-center' style={{margin: '0 20px 0 0'}}>
                  <div className="dl-item flexed">
                      <dt>שם פעיל</dt>
                      <dd>{this.props.activistVoterItem.first_name}  {this.props.activistVoterItem.last_name}</dd>
                  </div>
                  <div className="dl-item flexed">
                      <dt>נייד</dt>
                      <dd><input className='form-control' value={this.state.phone_number} onChange={this.onInputChange.bind(this, 'phone_number')}></input></dd>
                  </div>
                  <div className="dl-item flexed">
                      <button className="btn btn-primary" style={{width:'80px'}} onClick={this.props.onAddActivist.bind(this, this.state.phone_number, this.props.activistVoterItem.key)}>בחר פעיל</button>
                  </div>
              </dl>
          </div>
        )
      }
      renderActivistDetails(){
        return (
                <div className='flexed-column' style={{marginBottom: '10px'}}>
                    <label htmlFor="findCluster">הכנס תז של פעיל</label>
                    <div className='flexed flexed-center'>
                        <div className="input-search" style={{width: '245px',marginLeft: '15px'}}>
                            <div>
                                <input onKeyUp={(event)=>{
                                       if (event.key === "Enter") {
                                        this.searchForVoter();
                                      }    
                                }} onChange={this.onInputChange.bind(this, 'personal_identity')} value={this.state.personal_identity} id='findCluster' type="text" className="form-control"/>
                                <span title="" className="icon-search" onClick={this.searchForVoter.bind(this)}></span>
                            </div>
                        </div>
                       { this.props.activistVoterItem.personal_identity && this.renderVoterResult()}
                    </div>
                </div>
            )
        }
        render(){
            return (
                <div>
                    {this.renderActivistDetails()}
                </div>
            );
        }

}

function mapStateToProps(state) {
	return {
        activistVoterItem: state.elections.managementCityViewScreen.addAllocationModal.activistItem,

	}
}
export default connect(mapStateToProps)(SearchActivistVoter);
