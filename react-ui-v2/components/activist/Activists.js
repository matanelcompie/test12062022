import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ModalWindow from '../global/ModalWindow';
import ActivistsSearchFields from './ActivistsSearchFields';
import ActivistsSearchResults from './ActivistsSearchResults';
import Combo from '../global/Combo';
import store from '../../store';


import * as VoterActions from '../../actions/VoterActions';
import * as CrmActions from '../../actions/CrmActions';
import * as GlobalActions from '../../actions/GlobalActions';
import * as SystemActions from '../../actions/SystemActions';
import globalSaving from '../hoc/globalSaving';

class Activists extends React.Component {

    componentWillMount(){
		VoterActions.getLastCampaign(this.props.dispatch);
		SystemActions.loadCities(store);
		SystemActions.loadElectionRolesShifts(this.props.dispatch);
		VoterActions.loadVoterElectionRoles(this.props.dispatch);
	}
	
	HideErrorModalDialog(){
		 this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CLEAR_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE});
		
	}

    render() {
        return <div style={{marginTop:'-20px' }}>
		    <div style={{marginRight:'-16px'}}>
			<h1>ניהול פעילים | <span style={{fontSize:'30px' , fontWeight:'normal'}}>{this.props.lastCampaignName}</span></h1></div>
            <section className="main-section-block" style={{border: 'none'}}>
               <ActivistsSearchFields />
            </section><br/>
			
			 <div style={{paddingTop:'10px'}}>
			 <div className='row' >
			 <div className='col-md-4'>
			<h2 style={{color:'#323A6B' , fontWeight:'600' , fontSize:'24px'}}>נמצאו
				&nbsp;{this.props.searchActivistScreen.results_obj.total_records}&nbsp;
			פעילים
			</h2>
			</div>
			<div className='col-md-4'></div>
			<div className='col-md-4' style={{fontSize:'16px'}}>
			 <div className='row' >
			 <div className='col-md-2' style={{marginTop:'4px'}}>
			 פעולות
			 </div>
			 <div className='col-md-6'>
			   <Combo items={[{id:'1' , name:'1'} , {id:'2' , name:'2'}, {id:'3' , name:'3'}, {id:'4' , name:'4'}]}  maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={'בחר פעולה'} />
			 </div>
			 <div className='col-md-1' >
			      <button type='submit' className="btn btn-primary btn-sm">בחר</button>
			 </div>
			 </div>
			</div>
			</div>
			</div>
			<div style={{marginTop:'-30px'}}><section className="section-block" style={{border: 'none'}}>
              <ActivistsSearchResults />
            </section><br/><br/></div>
         
		 <ModalWindow show={this.props.searchActivistScreen.showErrorModal}
                                 buttonOk={this.HideErrorModalDialog.bind(this)} buttonX={this.HideErrorModalDialog.bind(this)}
                                 title={this.props.searchActivistScreen.showErrorModalTitle}>
                        <div>{this.props.searchActivistScreen.showErrorModalContent}</div>
         </ModalWindow>
         
        
        </div>;
            }
        }

        function mapStateToProps(state) {
            return {
                 lastCampaignName: state.voters.voterScreen.lastCampaignName,
                 cities: state.system.cities,
				 searchActivistScreen: state.voters.searchActivistScreen ,
            };
        }

        export default globalSaving(connect(mapStateToProps)(withRouter(Activists)));
