import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link} from 'react-router';

import * as ElectionsActions from '../../../actions/ElectionsActions';
import * as SystemActions from '../../../actions/SystemActions';
import ModalWindow from '../../global/ModalWindow';
import Combo from '../../global/Combo';
import TopCityData from './CityManagePanel/TopCityData';
import PrimaryFirstTab from './CityManagePanel/PrimaryFirstTab';
import PrimarySecondTab from './CityManagePanel/PrimarySecondTab';
import PrimaryThirdTab from './CityManagePanel/PrimaryThirdTab';
import PrimaryFourthTab from './CityManagePanel/PrimaryFourthTab';
import RequestsMunicipalTopicsTable from './CityManagePanel/requestsTeam/RequestsMunicipalTopicsTable';
import store from '../../../store';
import globalSaving from '../../hoc/globalSaving';

class CityManagePanel extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();   
    }

	/*
	function that initializes constant variables 
	*/
    initConstants() {
          this.topPaddedColumn={paddingRight:'30px'};
		  this.topLineHeight={lineHeight:'18px'};
		  this.tabActive = {cursor:'pointer',backgroundColor:'#323A6B' , color:'#ffffff' , fontSize:'21px' , fontWeight:'600'};
	      this.tabRegular={cursor:'pointer', backgroundColor:'transparent' , border:'0', color:'#323A6B' , fontWeight:'600' , fontSize:'21px' };
	}
	/*
	    This function checks if user can see this city by key - it
		checks if the city is in his geographical permissions
	*/
	checkCityGeographicalPermissions(nextProps){
		let user_allowed_cities = nextProps.user_allowed_cities
    	this.setState({checkedPermissions: true});
		let isAllowedInThisCity = false;
		for(let i = 0; i < user_allowed_cities.length ; i++){
			if(this.props.router.params.cityKey == user_allowed_cities[i].key){
				isAllowedInThisCity = true;break
			}
		}

		if(!isAllowedInThisCity){
			this.props.dispatch({
            type: ElectionsActions.ActionTypes.SET_MODAL_DIALOG_DATA , visible:true , headerText:'שגיאה' , modalText :'למשתמש אין גישה לעיר הזאת , או עיר לא קיימת'
         });
		 this.props.router.push('elections/cities');
		}
		else{
            ElectionsActions.loadMunicipalElectionsCampaigns(this.props.dispatch , this.props.router.params.cityKey);
			ElectionsActions.loadCityData(this.props.dispatch , this.props.router.params.cityKey);
			ElectionsActions.loadCityRolesData(this.props.dispatch , this.props.router.params.cityKey);
            ElectionsActions.loadHistoricalElectionCampaigns(this.props.dispatch , this.props.router.params.cityKey);
		}
	}

    componentWillMount() {
		SystemActions.loadUserGeographicFilteredLists(store, 'elections.cities', { areas: true, cities: true });

    	this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'ניהול עיר'});

   		//set base state
    	let baseState = {};
    	if (this.props.currentUser.first_name.length == 0) {
    		baseState.loadedCurrentUser = false;
    	} else {
    		baseState.loadedCurrentUser = true;
    	}
    	if (this.props.user_allowed_cities.length == 0) {
    		baseState.loadedCities = false;
    	} else {
    		baseState.loadedCities = true;
		}
    	if (baseState.loadedCurrentUser && baseState.loadedCities) {
    		this.checkCityGeographicalPermissions(this.props);
    	} else {
    		baseState.checkedPermissions = false;
    	}

      	this.setState(baseState);
	  	if(this.props.teams.length == 0){
	    	ElectionsActions.loadTeamsList(store);
		  }	 
		  ElectionsActions.loadElectionRoles(store.dispatch);
    }

    componentWillReceiveProps(nextProps) {
		
    	if (this.props.currentUser.admin==false && nextProps.currentUser.permissions['elections.cities']!=true && this.props.currentUser.permissions['elections.cities']!=true && this.props.currentUser.first_name.length>1){          
		   this.props.router.replace('/unauthorized');
        }  

        if ((this.props.topScreen.cityName.length == 0) && (nextProps.topScreen.cityName.length > 0)) {
        	this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'ניהול העיר' +  ' ' +  nextProps.topScreen.cityName});
        }

        if ((this.props.currentUser.first_name.length == 0) && (nextProps.currentUser.first_name.length > 0)) {
        	this.setState({loadedCurrentUser: true});
        }

        if ((this.props.user_allowed_cities.length == 0) && (nextProps.user_allowed_cities.length > 0)) {
        	this.setState({loadedCities: true});
        }
		if (!this.state.checkedPermissions) {
			if (this.state.loadedCurrentUser && this.state.loadedCities) {
			   this.checkCityGeographicalPermissions(nextProps);
		   }
		}
 
		if(!this.props.campaignsList.length && nextProps.campaignsList.length){ // if loaded election campaigns - load fourth's tab default values
			 this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.CHANGE_SELECTED_CAMPAIGN , item:{ selectedValue:nextProps.campaignsList[0].name , selectedItem:nextProps.campaignsList[0]}});
			 ElectionsActions.loadCityBudgetByCampaign(this.props.dispatch , this.props.router.params.cityKey , nextProps.campaignsList[0].key);
             ElectionsActions.loadCityRolesDataCounting(this.props.dispatch , this.props.router.params.cityKey , nextProps.campaignsList[0].key);
		}
		//campaignsList
	 
    }
	
	 
	
	// componentDidUpdate(nextProps) {
	// 	console.log(this.state.loadedCurrentUser , this.state.loadedCitiesת)
	//  	if (!this.state.checkedPermissions) {
	//  		if (this.state.loadedCurrentUser && this.state.loadedCities) {
	//     		this.checkCityGeographicalPermissions(nextProps);
	//     	}
	//  	}
	// }
	
	 
	 
	 /*
	function that sets dynamic items in render() function : 
	*/
    initDynamicVariables() {
		switch(this.props.mainTabsActiveTabNumber){
             case 1 : 
                 if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates'] == true ){
			        this.primaryTabContentItem = <PrimaryFirstTab/>;
                 }
                 else{
                      if ( this.props.currentUser.permissions['elections.cities.roles'] == true ){
                             this.primaryTabContentItem = <PrimarySecondTab/>;
                      }
                      else if( this.props.currentUser.permissions['elections.cities.vote_results'] == true ){
                             this.primaryTabContentItem = <PrimaryThirdTab/>;

                      }
                      else if( this.props.currentUser.permissions['elections.cities.budget'] == true ){
                             this.primaryTabContentItem = <PrimaryFourthTab/>;
                      }
                      else if( this.props.currentUser.permissions['elections.cities.teams'] == true ){
                             this.primaryTabContentItem = <PrimaryFourthTab/>;
                      }
                 }
				 break;
		     case 2 : 
                 if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.roles'] == true ){
			        this.primaryTabContentItem = <PrimarySecondTab/>;
                 }
				 break;
			 case 3 : 
                 if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.vote_results'] == true ){
			        this.primaryTabContentItem = <PrimaryThirdTab/>;
                 }
				 break;
			 case 4 : 
                 if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.budget'] == true ){
			        this.primaryTabContentItem = <PrimaryFourthTab/>;
				 }
				break;
			 case 5 : 
                 if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.teams'] == true ){
			        this.primaryTabContentItem = <RequestsMunicipalTopicsTable/>;
                 }
				 break;
			 default : 
			     this.primaryTabContentItem = '';
				 break;
			    
		}		
		
    }
	
 
	
    /*
	   general function that closes all types of dialogues 
	 */
    closeModalDialog() {
        this.props.dispatch({
            type: ElectionsActions.ActionTypes.SET_MODAL_DIALOG_DATA , visible:false , headerText:'' , modalText :''
        });
    }
	
	/*
	This function changes the current active main tab 
	
	@param mainTabIndex - from 1 to 4 (right to left) :
	
	*/
	setMainActiveTab(mainTabIndex){
		 this.props.dispatch({
            type: ElectionsActions.ActionTypes.CITIES.CHANGE_MAIN_TAB_NUMBER , mainTabNumber:mainTabIndex
        });
		
	}
	 
	 /*
	    Dynamicly construct primary tabs : 
	 */
	constructMainTabsMenu(){
      
        let tabsCount = 0;
        let firstTab = null;
        let secondTab = null;
        let thirdTab = null;
        let fourthTab = null;
		let FifthTab = null;
		
		let mainTabsActiveTabNumber = this.props.mainTabsActiveTabNumber;
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.parameters_candidates'] == true ){
             firstTab = <li className="active" >
                        <a title="פרמטרים ומועמדים לבחירות לרשויות" style={mainTabsActiveTabNumber == 1 ? this.tabActive : this.tabRegular} onClick={this.setMainActiveTab.bind(this,1)} >פרמטרים ומועמדים לבחירות לרשויות</a>
                    </li>;
             tabsCount++;
        }
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.roles'] == true ){
            secondTab = <li>
                        	<a title="בעלי תפקידים בעיר" style={mainTabsActiveTabNumber == 2 || (mainTabsActiveTabNumber ==1 && tabsCount==0) ? this.tabActive : this.tabRegular} onClick={this.setMainActiveTab.bind(this,2)}>בעלי תפקידים בעיר</a>
                        </li>;
            tabsCount++;
        }
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.vote_results'] == true ){
            thirdTab = <li>
                        	<a title="תוצאות בחירות היסטוריות" style={mainTabsActiveTabNumber == 3 || (mainTabsActiveTabNumber ==1 && tabsCount==0) ? this.tabActive : this.tabRegular}  onClick={this.setMainActiveTab.bind(this,3)}>תוצאות בחירות היסטוריות</a>
                       </li>;
            tabsCount++;
        }
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.budget'] == true ){
            fourthTab = <li>
                        	<a title="תקציב עיר" style={mainTabsActiveTabNumber == 4 || (mainTabsActiveTabNumber ==1 && tabsCount==0)  ? this.tabActive : this.tabRegular}  onClick={this.setMainActiveTab.bind(this,4)}>תקציב עיר</a>
                        </li>;
            tabsCount++;
        }
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.teams'] == true ){
            FifthTab = <li>
                        	<a title="פניות ציבור" style={mainTabsActiveTabNumber == 5 || (mainTabsActiveTabNumber ==1 && tabsCount==0)  ? this.tabActive : this.tabRegular}  onClick={this.setMainActiveTab.bind(this,5)}>פניות ציבור</a>
                        </li>;
            tabsCount++;
        }
		this.primaryTabsItem =  <ul className="nav nav-tabs main-tabs" role="tablist" style={{borderBottom:'2px solid #9DA2B7'}}>
                    {firstTab}
                    {secondTab}
                    {thirdTab}
                    {fourthTab}
                    {FifthTab}
          </ul>;
		
	} 
 
    render() {
   
        this.initDynamicVariables();
		this.constructMainTabsMenu();
        return (
		  <div className="stripMain">
                <div className="row">
                     <div className="col-md-6 text-right" >
                         <h1> ניהול עיר  </h1>
                     </div>
               </div>
                <div className="container">
                    <br/>
					<TopCityData/>
					{this.primaryTabsItem}
					<div className="tab-content main-tab-content">
					     <br/>
						{this.primaryTabContentItem}
					</div>
                </div>
                <ModalWindow show={this.props.showModalDialog} buttonX={this.closeModalDialog.bind(this)} buttonOk={this.closeModalDialog.bind(this)} title={this.props.modalHeaderText} style={{zIndex: '9001'}}>
                        <div>{this.props.modalContentText}</div>
                </ModalWindow> 
		   </div>
        );
    }
}


function mapStateToProps(state) {
    return {
	   currentUser: state.system.currentUser,
	   showModalDialog: state.elections.showModalDialog,
       modalHeaderText: state.elections.modalHeaderText,
       modalContentText: state.elections.modalContentText,
	   cities: state.system.cities,
	   user_allowed_cities: state.system.currentUserGeographicalFilteredLists.cities,
	   topScreen:state.elections.citiesScreen.cityPanelScreen.topScreen,
	   teams:state.elections.citiesScreen.cityPanelScreen.teamsList,
	   mainTabsActiveTabNumber:state.elections.citiesScreen.cityPanelScreen.mainTabsActiveTabNumber,
       currentUser: state.system.currentUser,
	   campaignsList : state.elections.citiesScreen.cityPanelScreen.campaignsList,
	}
}

export default globalSaving(connect(mapStateToProps)(withRouter(CityManagePanel)));