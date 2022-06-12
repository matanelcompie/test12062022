import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import ReligiousOrShasRoles from './ReligiousOrShasRoles';
import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import { parseDateToPicker, parseDateFromPicker , isValidComboValue} from '../../../../../libs/globalFunctions';
import { validatePhoneNumber } from '../../../../../libs/globalFunctions';

class ReligeousCouncilOrCityShasMembers extends React.Component {

    constructor(props) {
        super(props);
		momentLocalizer(moment); 
        this.initConstants();
    }


    /*
         Handles change in headquarters-telephone text field
    */
	headquartersTelefonChange(e){
         if(!new RegExp('^[0-9]*$').test(e.target.value)){return;} // allow only numbers in the field
         this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_SECOND_TAB_ITEM_VALUE_BY_NAME , itemName:'headquarters_phone_number' , itemValue:e.target.value });
         this.props.dispatch ({type:SystemActions.ActionTypes.SET_DIRTY, target:'elections.cities.roles.shas.headquarter_phone.edit'});
    }

    /*
      Do real save of headquarters via api
    */
    saveHeadquartersPhone(){
         let dataRequest = {};
	     dataRequest.is_headquarters_phone_number = '1';
         dataRequest.headquarters_phone_number = this.props.headquarters_phone_number;
         ElectionsActions.updateCityHeadquartersPhoneNumber(this.props.dispatch , this.props.router.params.cityKey , dataRequest);
         this.props.dispatch ({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'elections.cities.roles.shas.headquarter_phone.edit'});
    }
   

	/*
	function that initializes constant variables 
	*/
    initConstants() {
       
	}
	
	initDynamicVariables(){
         this.editPhoneItem = null;
         if(this.props.collectionName=='cityShasRolesByVoters'){
            if(this.props.currentUser.admin == true ||  this.props.currentUser.permissions['elections.cities.roles.shas.headquarter_phone'] == true){
                if(this.props.currentUser.admin == true ||  this.props.currentUser.permissions['elections.cities.roles.shas.headquarter_phone.edit'] == true){
                  this.editPhoneItem = <div><br/><div className="row">
                                         <div className="col-md-1"><strong>טלפון מטה : </strong></div>
                                         <div className="col-md-2"><input type="text" className="form-control" maxLength="10" value={this.props.headquarters_phone_number?this.props.headquarters_phone_number:''} onChange={this.headquartersTelefonChange.bind(this)} style={{borderColor:(this.props.headquarters_phone_number != null && this.props.headquarters_phone_number != '' && !validatePhoneNumber(this.props.headquarters_phone_number)? '#ff0000' :'#ccc')}} /></div>
                                         <div className="col-md-1"><button title="שמור" type="submit" className="btn btn-primary btn-save pull-right" disabled={(this.props.headquarters_phone_number != null && this.props.headquarters_phone_number != '' && !validatePhoneNumber(this.props.headquarters_phone_number))} onClick={this.saveHeadquartersPhone.bind(this)}>שמור</button></div>
                                     </div>
                                     </div>;
                }
                else{
                   this.editPhoneItem = <div><br/><div className="row">
                                         <div className="col-md-1"><strong>טלפון מטה : </strong></div>
                                         <div className="col-md-2">{this.props.headquarters_phone_number?this.props.headquarters_phone_number : "אין"}</div>
                                     </div>
                                     </div>;
                }

			}
         }
		
	}
 
    render() {
		 

        this.initDynamicVariables();
        return (
             <div>
			      <div className="row panelContent">
                    <div className="collapse-all-content dividing-line" style={{borderBottom:'1px solid #E5E5E5' , paddingBottom:'25px' , marginBottom:'15px'}}>
                        <a title={this.props.regularHeader} data-toggle="collapse" href={"#Tab4-collapse-tabs-1" + this.props.newScreenName} aria-expanded="true">
                            <div className="panelCollapse">
                                <div className="collapseArrow closed" style={{marginRight:'0'}}></div>
                                <div className="collapseArrow open" style={{marginRight:'0'}}></div>
                                <div className="collapseTitle">
                                    <span>{this.props.regularHeader}</span>
                                </div>
                            </div>
                        </a>
                        
                        <div id={"Tab4-collapse-tabs-1" + this.props.newScreenName}  className="collapse in" aria-expanded="true" >
                            
                            {this.editPhoneItem}
                            <br/>
                            <ReligiousOrShasRoles newScreenName={this.props.newScreenName} collectionName={this.props.collectionName}
                                                    btnAddText={this.props.btnAddText} displayMode={'ACTUAL_ROLES_ONLY'}
                                                    rolesCollectionName = {this.props.rolesCollectionName}
                            />
                            
                        </div>
                    </div>
                        <a title={this.props.historyHeader} data-toggle="collapse" href={"#Tab4-collapse-tabs-2"+  this.props.newScreenName}  aria-expanded="true">
                        <div className="panelCollapse">
                            <div className="collapseArrow closed"  style={{marginRight:'0'}}></div>
                            <div className="collapseArrow open"  style={{marginRight:'0'}}></div>
                            <div className="collapseTitle">
                                <span>{this.props.historyHeader}</span>
                            </div>
                        </div>
                    </a>
                    
                    <div id={"Tab4-collapse-tabs-2"+ this.props.newScreenName} className="collapse in" aria-expanded="false">
                        <div className="panelContent">
                            <br/>
                            <ReligiousOrShasRoles newScreenName={this.props.newScreenName} collectionName={this.props.collectionName}
                                                    btnAddText={this.props.btnAddText}  displayMode={'HISTORY_ROLES_ONLY'}
                                                    rolesCollectionName = {this.props.rolesCollectionName}
                            />
                            
                        </div>
                    </div>
                </div>
                                           
             </div>
        );
    }
}


function mapStateToProps(state) {
    return {
	      currentUser: state.system.currentUser,
          headquarters_phone_number : state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen.headquarters_phone_number,
	}
}

export default connect(mapStateToProps)(withRouter(ReligeousCouncilOrCityShasMembers));