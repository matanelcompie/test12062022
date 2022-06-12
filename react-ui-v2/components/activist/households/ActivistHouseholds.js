import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ModalWindow from '../../global/ModalWindow';
import Combo from '../../global/Combo';
import store from '../../../store';
import AddHouseholdScreen from './AddHouseholdScreen';
import CurrentHouseholds from './CurrentHouseholds';
import ExtraDetails from './ExtraDetails';


import * as VoterActions from '../../../actions/VoterActions';
import * as CrmActions from '../../../actions/CrmActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import * as SystemActions from '../../../actions/SystemActions';
import globalSaving from '../../hoc/globalSaving';

class ActivistHouseholds extends React.Component {

    componentWillMount()
	{ 
		 VoterActions.loadVoterDataByRecordKey(this.props.dispatch , this.props.router.params.recordKey);
		 VoterActions.loadVoterActivistHouseholdsByKey(this.props.dispatch , this.props.router.params.recordKey);
	}
	
	tabClick(tabName) {
		 
         this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.ACTIVIST_HOUSEHOLDS_SCREEN_TAB_CHANGE,
            activistTab: tabName
        }); 
    } 
	initVariables() {
        this.tabAddHousehold = {
            name: 'addHousehold',
            className: '',
            title: 'שיוך בתי אב',
            display: false
        };
		this.tabCurrentHouseholds = {
            name: 'currentHouseholds',
            className: '',
            title: 'בתי אב משויכים',
            display: false
        };
		this.tabExtraDetails = {
            name: 'extraDetails',
            className: '',
            title: 'פרטים נוספים',
            display: false
        };
	}
	
	setActiveTabComponent() {
        switch (this.props.activistHouseholdTab) {
            case this.tabCurrentHouseholds.name:
                this.tabCurrentHouseholds.className = 'active';
                this.tabCurrentHouseholds.display = true;
                break;
				
			case this.tabExtraDetails.name:
                this.tabExtraDetails.className = 'active';
                this.tabExtraDetails.display = true;
                break;

            case this.tabAddHousehold.name:
            default:
                this.tabAddHousehold.className = 'active';
                this.tabAddHousehold.display = true;
                break;
        }
    }
	
	HideErrorModalDialog(){
		 this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CLEAR_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE});
		
	}

    render() {
	   if(!this.props.voterActivistHouseholdsScreen.is_minister_of_fifty){
			this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SET_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE , errorTitle:'שגיאה' , errorContent:'הרשומה איננה משויכת לשר מאה'});
            this.props.router.push('/elections/activists');	 
	 }
	 
	   this.initVariables();
	   this.setActiveTabComponent();
	   let totalVotersInHouseholdsCount =0 ;
	   for(let i = 0 , len = this.props.voterActivistHouseholdsScreen.households.length;i<len;i++)
	   {
              totalVotersInHouseholdsCount+= parseInt(this.props.voterActivistHouseholdsScreen.households[i].household_members_count) ;
	   }
       return  <div style={{marginTop:'-20px' }}>
		    <div style={{marginRight:'-16px'}}>
			<h1>שיוך בתי אב לשר מאה</h1></div>
            <section className="main-section-block" style={{border: 'none' , paddingTop:'20px' , paddingRight:'20px'}}>
               <div className='row'>
			        <div className='col-md-3'>
					     <div style={{color:'#2AB4C0' , fontSize:'35px' , fontWeight:'600' , lineHeight:'50px' , borderLeft:'1px solid #DCE2E0'}}>{this.props.voterActivistHouseholdsScreen.first_name + ' ' + this.props.voterActivistHouseholdsScreen.last_name}</div>
					</div>
					<div className='col-md-9' style={{fontSize:'18px'}}>
					     <div className='row'>
						     <div className='col-md-2'>
							    <span>ת"ז</span>
							 </div>
							 <div className='col-md-2'>
							    <strong>{this.props.voterActivistHouseholdsScreen.personal_identity}</strong>
							 </div>
							 <div className='col-md-2'>
							    <span>מספר בתי אב</span>
							 </div>
							 <div className='col-md-3'>
							    <div className="progress householdCounter">
                                    <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{width: (this.props.voterActivistHouseholdsScreen.households.length*2)+"%"}}> </div>
                                </div>
							 </div>
							  <div className='col-md-1'>
							      <strong>{this.props.voterActivistHouseholdsScreen.households.length}/50</strong>
							  </div>
						 </div>
						 <div className='row'>
						     <div className='col-md-2'>
							    <span>כתובת</span>
							 </div>
							 <div className='col-md-2'>
							    <strong>{this.props.voterActivistHouseholdsScreen.address}</strong>
							 </div>
							 <div className='col-md-2'>
							    <span>מספר תושבים</span>
							 </div>
							 
							  <div className='col-md-1'>
							      <strong>
								  {totalVotersInHouseholdsCount}</strong>
							  </div>
						 </div>
					</div>
			   </div>
            </section><br/>
			
			 
			 <section className="section-block">
                 <ul className="tabs">
                            <li className={this.tabAddHousehold.className}
                                style={this.tabAddHouseholdStyle}
                                onClick={this.tabClick.bind(this, this.tabAddHousehold.name)}>
                                {this.tabAddHousehold.title}
                            </li>
                            <li className={this.tabCurrentHouseholds.className}
                                style={this.tabCurrentHouseholdsStyle}
                                onClick={this.tabClick.bind(this, this.tabCurrentHouseholds.name)}>
                                {this.tabCurrentHouseholds.title} <span className="badge">{this.props.voterActivistHouseholdsScreen.households.length}</span>
                            </li>
							<li className={this.tabExtraDetails.className}
                                style={this.tabExtraDetailsStyle}
                                onClick={this.tabClick.bind(this, this.tabExtraDetails.name)}>
                                {this.tabExtraDetails.title}
                            </li>
					</ul>
					<AddHouseholdScreen display={this.tabAddHousehold.display}/>
					<CurrentHouseholds display={this.tabCurrentHouseholds.display}/>
					<ExtraDetails display={this.tabExtraDetails.display}/>
             </section>
			 <ModalWindow show={this.props.searchActivistScreen.showErrorModal}
                                 buttonOk={this.HideErrorModalDialog.bind(this)} buttonX={this.HideErrorModalDialog.bind(this)}
                                 title={this.props.searchActivistScreen.showErrorModalTitle}>
                        <div>{this.props.searchActivistScreen.showErrorModalContent}</div>
             </ModalWindow>
			 <br/><br/>

        </div>;
            }
        }

        function mapStateToProps(state) {
            return {
				 searchActivistScreen: state.voters.searchActivistScreen ,
				 voterActivistHouseholdsScreen: state.voters.voterActivistHouseholdsScreen ,
				 activistHouseholdTab: state.voters.voterActivistHouseholdsScreen.activistHouseholdTab,
            };
        }

        export default globalSaving(connect(mapStateToProps)(withRouter(ActivistHouseholds)));
