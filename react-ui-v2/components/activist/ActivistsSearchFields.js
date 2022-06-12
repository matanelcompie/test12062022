import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import Combo from '../global/Combo';
 


import * as VoterActions from '../../actions/VoterActions';
import * as CrmActions from '../../actions/CrmActions';
import * as GlobalActions from '../../actions/GlobalActions';
import * as SystemActions from '../../actions/SystemActions';

class ActivistsSearchFields extends React.Component {

    /*handle key press "enter" at any of search fields */
    handleKeyPress(event) {
     if (event.charCode == 13) { /*if user pressed enter*/
           this.searchButtonClick();
        }
    }

    getCityDataByName(cityName){
		let returnedValue = null;
		for(let i=0,len=this.props.cities.length;i<len;i++){
			if(this.props.cities[i].city_name == cityName){
				returnedValue = this.props.cities[i];
				break;
			}
		}
		return returnedValue;
	}
	
	getElectionRoleDataByName(roleName){
		let returnedValue = null;
		for(let i=0,len=this.props.electionRoles.length;i<len;i++){
			if(this.props.electionRoles[i].name == roleName){
				returnedValue = this.props.electionRoles[i];
				break;
			}
		}
		return returnedValue;
	}

    searchButtonClick(){
		let seacrhCounter = 0;
		let searchObj = {};
		if(this.props.searchActivistScreen.personal_identity.trim() != ''){
			searchObj.personal_identity = this.props.searchActivistScreen.personal_identity.trim();
			seacrhCounter++;
		}
		if(this.props.searchActivistScreen.first_name.trim() != ''){
			searchObj.first_name = this.props.searchActivistScreen.first_name.trim();
			seacrhCounter++;
		}
		if(this.props.searchActivistScreen.last_name.trim() != ''){
			searchObj.last_name = this.props.searchActivistScreen.last_name.trim();
			seacrhCounter++;
		}
		if(this.props.searchActivistScreen.street.trim() != ''){
			searchObj.street = this.props.searchActivistScreen.street.trim();
			seacrhCounter++;
		}
		if(this.props.searchActivistScreen.phone_number.trim() != ''){
			searchObj.phone_number = this.props.searchActivistScreen.phone_number.trim();
			seacrhCounter++;
		}
		if(this.props.searchActivistScreen.city.trim() != ''){

			let cityData = this.getCityDataByName(this.props.searchActivistScreen.city.trim());
			if(cityData != null){
			   searchObj.city_key = cityData.city_key;
			   seacrhCounter ++;
			}
		}
		if(this.props.searchActivistScreen.activist_type.trim() != ''){

			let roleData = this.getElectionRoleDataByName(this.props.searchActivistScreen.activist_type.trim());
			if(roleData != null){
			   searchObj.activist_key = roleData.key;
			   seacrhCounter ++;
			}
		}
		if(seacrhCounter == 0){
			 this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SET_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE , errorTitle:'שגיאה' , errorContent:'יש למלא לפחות פרמטר חיפוש אחד'});
			
		}
		else{
		    this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SET_SEARCHING_VOTER_ACTIVIST , data:true});
		
		    VoterActions.searchVoterElectionActivist(this.props.dispatch , searchObj);
		}
	}
	
	searchParamChange(fieldName , e){
		 this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SEARCH_ACTIVIST_FIELD_CHANGE , fieldName , fieldValue:e.target.value});
		
	}
	
	clearSearchFieldsAndResults(){
		 this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CLEAR_ALL_SEARCH_FIELDS_AND_RESULTS  });
		
	}

    render() {
	    let loadingItem = '';
		if(this.props.searchActivistScreen.isSearching){
		   loadingItem = <i className="fa fa-spinner fa-spin" style={{ fontSize: '2em', color: 'red'}}/>;
        }
		return <div style={{marginRight:'30px' , paddingTop:'37px' }}>
		    <div className='row'>
			   <div className="col-md-1">
			       ת"ז
			   </div>
			   <div className="col-md-2">
			       <input type="text" className="form-control form-control-sm" onKeyPress={this.handleKeyPress.bind(this)} value={this.props.searchActivistScreen.personal_identity} onChange={this.searchParamChange.bind(this , 'personal_identity' )} />
			   </div>
			   <div className="col-md-2">
			       שם משפחה
			   </div>
			   <div className="col-md-2">
			       <input type="text" className="form-control form-control-sm" onKeyPress={this.handleKeyPress.bind(this)} value={this.props.searchActivistScreen.last_name} onChange={this.searchParamChange.bind(this , 'last_name' )} />
			   </div>
			   <div className="col-md-1">
			       עיר
			   </div>
			   <div className="col-md-3">
			      <Combo items={this.props.cities}  maxDisplayItems={5} onKeyPress={this.handleKeyPress.bind(this)} itemIdProperty="city_id" itemDisplayProperty='city_name' value={this.props.searchActivistScreen.city} onChange={this.searchParamChange.bind(this , 'city' )} />
			   </div>
			</div>
			<br/>
			<div className='row'>
			   <div className="col-md-1">
			       מס' טלפון
			   </div>
			   <div className="col-md-2">
			       <input type="text" className="form-control form-control-sm" onKeyPress={this.handleKeyPress.bind(this)} value={this.props.searchActivistScreen.phone_number} onChange={this.searchParamChange.bind(this , 'phone_number' )} />
			   </div>
			   <div className="col-md-2">
			       שם פרטי
			   </div>
			   <div className="col-md-2">
			       <input type="text" className="form-control form-control-sm" onKeyPress={this.handleKeyPress.bind(this)} value={this.props.searchActivistScreen.first_name} onChange={this.searchParamChange.bind(this , 'first_name' )} />
			   </div>
			   <div className="col-md-1">
			       רחוב
			   </div>
			   <div className="col-md-3">
			       <input type="text" className="form-control form-control-sm" onKeyPress={this.handleKeyPress.bind(this)} value={this.props.searchActivistScreen.street} onChange={this.searchParamChange.bind(this , 'street' )} />
			   </div>
			</div>
			<br/>
			<div className='row'>
			   <div className="col-md-1">
			      סוג פעיל
			   </div>
			   <div className="col-md-2">
			       <Combo items={this.props.electionRoles}  maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchActivistScreen.activist_type} onChange={this.searchParamChange.bind(this , 'activist_type' )} />
			   </div>
			   <div className="col-md-2">
			       מידת שיבוץ
			   </div>
			   <div className="col-md-2">
			       <Combo items={[{id:'1' , name:'הכל'} , {id:'2' , name:'חלקי'}, {id:'3' , name:'מלא'}]}  maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' />
			   </div>
			   <div className="col-md-1">
			       סטטוס אימות
			   </div>
			   <div className="col-md-3">
			       <Combo items={[{id:'1' , name:'הכל'} , {id:'2' , name:'טיוטא - ממתין להשלמת נתונים'}, {id:'3' , name:'ממתין לאימות טלפון'}, {id:'4' , name:'מאומת'}]}  maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' />
			   </div>
			</div>
			<br/>
			<div className='row'>
			   <div className="col-md-2">
			     <div style={{paddingTop:'13px' , paddingRight:'20px' , fontSize:'14px'}}>
			      <Link to='elections/activists' onClick={this.clearSearchFieldsAndResults.bind(this)}>נקה שדות</Link>
				 </div>
			   </div>
			   <div className="col-md-6">
			       
			   </div>
			   <div className="col-md-1">
			   {loadingItem}
			   </div>
			   <div className="col-md-2">
			      <button className="btn btn-primary srchBtn pull-left" disabled={this.props.searchActivistScreen.isSearching} onClick={this.searchButtonClick.bind(this)} >{this.props.searchActivistScreen.isSearching?'טוען':'חפש'}</button>
			   </div>
			</div>
			<br/><br/>
        </div>;
            }
        }

        function mapStateToProps(state) {
            return {
                   cities: state.system.lists.cities,
                   electionRoles : state.voters.activistScreen.election_roles,
				   searchActivistScreen: state.voters.searchActivistScreen ,
				    
            };
        }

        export default connect(mapStateToProps)(withRouter(ActivistsSearchFields));
