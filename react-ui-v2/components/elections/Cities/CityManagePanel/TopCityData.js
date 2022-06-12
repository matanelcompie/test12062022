import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';

import * as ElectionsActions from '../../../../actions/ElectionsActions';
import ModalWindow from '../../../global/ModalWindow';
import Combo from '../../../global/Combo';
import {formatPhone,validatePhoneNumber, validateEmail} from 'libs/globalFunctions';

class TopCityData extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
		this.state={
			editPhoneNumberMode:false,
			editCityEmailMode:false,
			editPhoneNumberText:'',
			editCityEmailText:'',
			isSavingPhoneData:false
		};
    }
	

	/*
	function that initializes constant variables 
	*/
    initConstants() {
          this.topPaddedColumn={paddingRight:'30px'};
		  this.topLineHeight={lineHeight:'18px'};
		
	}
	
	componentWillReceiveProps(nextProps){
		if(!this.props.topScreen.assignLeaderPhoneNumber && this.props.topScreen.assignLeaderPhoneNumber != nextProps.topScreen.assignLeaderPhoneNumber){
			this.setState({editPhoneNumberText:nextProps.topScreen.assignLeaderPhoneNumber});
		}
		if(!this.props.topScreen.assign_leader_email && this.props.topScreen.assign_leader_email != nextProps.topScreen.assign_leader_email){
			this.setState({editCityEmailText:nextProps.topScreen.assign_leader_email});
		}
		// if(this.state.editPhoneNumberMode && this.props.topScreen.assignLeaderPhoneNumber != nextProps.topScreen.assignLeaderPhoneNumber){
		// 	this.setState({editPhoneNumberMode:false , isSavingPhoneData:false});
		// }
		// if(this.state.editPhoneNumberMode && this.props.topScreen.assignLeaderPhoneNumber == nextProps.topScreen.assignLeaderPhoneNumber){
		// 	this.setState({editPhoneNumberMode:false , isSavingPhoneData:false});
		// }
			//editPhoneNumberText
	}
	 
	 /*
	 function that handles change-team button click :
	 */
	changeTeamForCity(isRequestTeam = false){
		this.setState({changeCrmTeam: isRequestTeam})
		let teamKeyName = !isRequestTeam ? 'teamKey' : 'crmTeamKey';
		if(this.props.topScreen[teamKeyName] != ''){
			for(let i = 0 ; i<this.props.teams.length ; i++){
				if(this.props.teams[i].key == this.props.topScreen[teamKeyName] ){
					this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.CHANGE_ITEM_TOP_CITY_DATA_SCREEN , fieldName:'selectedTeam' , fieldValue:{selectedValue : this.props.teams[i].name , selectedItem:this.props.teams[i]}});
					break;
				}
			}
		}
         this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.SHOW_HIDE_CHOOSE_TEAM_MODAL_DIALOG , show:true});
	}

	/*
	handles closing teams modal window : 
	*/
    closeChooseTeamForCityModal(){
		this.setState({changeCrmTeam: null})
		this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.CHANGE_ITEM_TOP_CITY_DATA_SCREEN , fieldName:'selectedTeam' , fieldValue:{selectedValue : '' , selectedItem:null}});
         this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.SHOW_HIDE_CHOOSE_TEAM_MODAL_DIALOG , show:false});
	}	
	
    /*
	handles changing in combo of teams is the modal window : 
	*/
    teamsComboItemChange(e){
         this.props.dispatch({ type: ElectionsActions.ActionTypes.CITIES.CHANGE_ITEM_TOP_CITY_DATA_SCREEN , fieldName:'selectedTeam' , fieldValue:{selectedValue : e.target.value , selectedItem:e.target.selectedItem}});
	}		
 
	 /*
	function that sets dynamic items in render() function : 
	*/
    initDynamicVariables() {
		this.districtItem = '';
		if(this.props.topScreen.district == 1){
		this.districtItem = <a title="עיר מחוז" style={{cursor:'pointer'}} >
                                          עיר מחוז
                                          <img src={ window.Laravel.baseURL + "Images/city-district.png"} />
                                       </a>;
		}
		this.chooseTeamItem = '';
		this.chooseRequestTeamItem = '';
		if(this.props.currentUser.admin == true){
			this.chooseTeamItem = <a title="בחר צוות"  onClick={this.changeTeamForCity.bind(this, false)} style={{textDecoration:'underline' , cursor:'pointer'}}>בחר צוות</a>;
			this.chooseRequestTeamItem = <a title="בחר צוות"  onClick={this.changeTeamForCity.bind(this, true)} style={{textDecoration:'underline' , cursor:'pointer'}}>בחר צוות</a>;
		}
		
		this.choosePhoneNumber = '';
		if(this.props.currentUser.admin == true || (this.props.currentUser && this.props.currentUser.permissions && this.props.currentUser.permissions['elections.cities.edit'])){
			this.choosePhoneNumber = <a title="ערוך מספר"  onClick={this.showHideChangeGlobalPhoneNumber4City.bind(this,true)} style={{textDecoration:'underline' , cursor:'pointer'}}>ערוך מספר</a>;
		}
		this.editCityEmail = '';
		if(this.props.currentUser.admin == true || (this.props.currentUser && this.props.currentUser.permissions && this.props.currentUser.permissions['elections.cities.edit'])){
			this.editCityEmail = <a title='ערוך דוא"ל'  onClick={this.showHideChangeGlobalEmailCity.bind(this,true)} style={{textDecoration:'underline' , cursor:'pointer'}}>ערוך דוא"ל</a>;
		}
		
    }
	
	/*
		Function that shows/ hide text box of changing global phone number of city
	*/
	showHideChangeGlobalPhoneNumber4City(isShow){
		this.setState({editPhoneNumberMode:isShow});
		if(!isShow){
			this.setState({editPhoneNumberText:(this.props.topScreen.assign_leader_email ?this.props.topScreen.assign_leader_email : '')});
		}

	}
	/*
		Function that shows/ hide text box of changing global phone number of city
	*/
	showHideChangeGlobalEmailCity(isShow){
		this.setState({editCityEmailMode:isShow});
		if(!isShow){
			this.setState({editCityEmailText:(this.props.topScreen.assignEmailNumber ?this.props.topScreen.assignEmailNumber : '')});
		}
	}
	/*
	validation of search fields : 
	*/
	validateFields(){
		this.bottomErrorText = '';
		this.teamsComboStyle = {};
		if(this.props.topScreen.selectedTeam.selectedItem == null && this.props.topScreen.selectedTeam.selectedValue != ''){
			this.bottomErrorText = 'יש לבחור עיר תקינה מהרשימה או להשאיר את השדה ריק';
		    this.teamsComboStyle = {border:'1px solid #ff0000'};
		}
		
	}
	
	/*
	function that handles 'ok' button in modal window - setting team of city : 
	*/
	setTeamCity(){
		if(this.props.topScreen.selectedTeam.selectedItem){
		   let teamName = this.props.topScreen.selectedTeam.selectedItem.name;
		   let leaderName = this.props.topScreen.selectedTeam.selectedItem.leader_first_name + ' ' + this.props.topScreen.selectedTeam.selectedItem.leader_last_name;;
		   let leaderPhone = '' ;
		   if(this.props.topScreen.selectedTeam.selectedItem.leader_user_phones.length > 0){
			  leaderPhone = this.props.topScreen.selectedTeam.selectedItem.leader_user_phones[0].phone_number;
		   }
		   ElectionsActions.updateCityTeam(this.props.dispatch , this.props.router.params.cityKey ,this.state.changeCrmTeam, this.props.topScreen.selectedTeam.selectedItem.key , teamName , leaderName , leaderPhone);
		}
		else{
			if(this.props.topScreen.selectedTeam.selectedValue == ''){
				ElectionsActions.updateCityTeam(this.props.dispatch , this.props.router.params.cityKey, this.state.changeCrmTeam , null , '-' , '-' , '-');
			}
			else{
				//error - do nothing
			} 
			
		}
		
	}
	
	cleanCityData(){
		this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CLEAN_CITY_DATA });
	}
	
	changeField(fieldName, e){
			let obj = {}
			obj[fieldName] = e.target.value;
			this.setState(obj);
	}
	
	saveGlobalPhoneData(){
		let formattedPhoneData = this.state.editPhoneNumberText.replace("-","");
		this.setState({isSavingPhoneData:true});
		let dataRequest = {};
	     dataRequest.is_assign_leader_phone_number = '1';
         dataRequest.assign_leader_phone_number = formattedPhoneData;
         ElectionsActions.updateCityAssignField(this.props.dispatch , this.props.router.params.cityKey , dataRequest).then(() => {
			this.setState({isSavingPhoneData: false, editPhoneNumberMode: false})
		});;
         
	}
	saveGlobalEmailData(){
		this.setState({isSavingEmailData:true});
		let dataRequest = {};
	     dataRequest.is_assign_leader_email = '1';
         dataRequest.assign_leader_email = this.state.editCityEmailText
         ElectionsActions.updateCityAssignField(this.props.dispatch , this.props.router.params.cityKey , dataRequest).then(() => {
			 this.setState({isSavingEmailData: false, editCityEmailMode: false})
		 });
	}
	renderUpdateEmail(){
		return (<div className="row flexed item-space" style={this.topLineHeight}>
				<div className="col-md-5 narrow-profit"><br/>דוא"ל אחראי שיבוץ : </div>
				<div className="col-md-7" style={{display:'inline'}}><br/><b>
				{this.state.editCityEmailMode ? // Edit mode
					(<div className="row">
						<div className="col-sm-8"><input type="text" value={this.state.editCityEmailText} className="form-control" 
							style={{borderColor:((this.state.editCityEmailText == null || this.state.editCityEmailText == undefined || this.state.editCityEmailText =='' || 
							validateEmail(this.state.editCityEmailText)) ? '#ccc':'#ff0000')}} onChange={this.changeField.bind(this, 'editCityEmailText')} /></div>

							{!this.state.isSavingEmailData && <div className="col-sm-2"><button type="button" className="btn btn-success  btn-xs" 
							onClick={this.saveGlobalEmailData.bind(this)} disabled={(this.state.editCityEmailText != null && this.state.editCityEmailText != undefined && this.state.editCityEmailText !=''  && !validateEmail(this.state.editCityEmailText))}><i className="fa fa-pencil-square-o"></i></button></div>}
							{!this.state.isSavingEmailData && <div className="col-sm-2"><button type="button" className="btn btn-danger btn-xs" title="ביטול" 
							onClick={this.showHideChangeGlobalEmailCity.bind(this,false)}><i className="fa fa-times"></i></button></div>}
							{this.state.isSavingEmailData && <div className="col-sm-4"><i className="fa fa-spinner fa-spin"></i> שומר נתונים....</div>}
						</div>
					): // Display mode:
					this.props.topScreen.assign_leader_email}</b> &nbsp;&nbsp;&nbsp; {!this.state.editCityEmailMode && this.editCityEmail}
							
				</div> 
			</div>
		)
	}
	renderUpdatePhoneNumber(){
		return (
				<div className="row flexed item-space" style={this.topLineHeight}>
					<div className="col-md-5 narrow-profit"><br/>טל' אחראי שיבוץ : </div>
					<div className="col-md-7" style={{display:'inline'}}><br/><b>
					{this.state.editPhoneNumberMode ? (<div className="row">
					<div className="col-sm-8"><input type="text" value={this.state.editPhoneNumberText} className="form-control" 
						style={{borderColor:((this.state.editPhoneNumberText == null || this.state.editPhoneNumberText == undefined || this.state.editPhoneNumberText =='' || 
						validatePhoneNumber(this.state.editPhoneNumberText)) ? '#ccc':'#ff0000')}} onChange={this.changeField.bind(this, 'editPhoneNumberText')} /></div>

						{!this.state.isSavingPhoneData && <div className="col-sm-2"><button type="button" className="btn btn-success  btn-xs" 
						onClick={this.saveGlobalPhoneData.bind(this)} disabled={(this.state.editPhoneNumberText != null && this.state.editPhoneNumberText != undefined && this.state.editPhoneNumberText !=''  && !validatePhoneNumber(this.state.editPhoneNumberText))}><i className="fa fa-pencil-square-o"></i></button></div>}
						{!this.state.isSavingPhoneData && <div className="col-sm-2"><button type="button" className="btn btn-danger btn-xs" title="ביטול" 
						onClick={this.showHideChangeGlobalPhoneNumber4City.bind(this,false)}><i className="fa fa-times"></i></button></div>}
						{this.state.isSavingPhoneData && <div className="col-sm-4"><i className="fa fa-spinner fa-spin"></i> שומר נתונים....</div>}
						</div>)
						
						:(this.props.topScreen.assignLeaderPhoneNumber ? formatPhone(this.props.topScreen.assignLeaderPhoneNumber): '-')}</b> &nbsp;&nbsp;&nbsp;
								{!this.state.editPhoneNumberMode && this.choosePhoneNumber}
								
					</div>
			</div>
		)
	}
    render() {
	 
		this.validateFields();
		this.initDynamicVariables();

		let hasViewTeamPermissions = (this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.cities.teams']);
        return (
		
                <div className="dtlsBox electorDtlsStrip clearfix first-box-on-page"  style={{marginTop:'-5px'}}> 
					<div className="row flexed electorDtlsData" style={{fontSize:'18px'}}>
						    <div className="col-md-2 city-name-content" style={{borderLeft:'1px solid #DCE2E0' }}>
								<div className="electorName">{this.props.topScreen.cityName}</div>
								<div>
									<Link title="החלף עיר" to="elections/cities" style={{textDecoration:'underline'}} onClick={this.cleanCityData.bind(this)}>
										<img src={ window.Laravel.baseURL + "Images/exchange-icon.png"} />
										החלף עיר
									</Link>
								</div>
                            </div>
                            <div className="col-md-4"  >
                                <div className="row" style={this.topPaddedColumn}>
                                    <div className="col-md-5 narrow-profit">קוד עיר</div>
                                    <div className='col-md-7'><b>{this.props.topScreen.cityCode}</b></div>
                                </div>
                                <div className="row flexed item-space" style={{...this.topPaddedColumn, ...this.topLineHeight}}>
                                    <div className="col-md-5 narrow-profit"><br/>איזור</div>
                                    <div className="col-md-7"><br/><b>{this.props.topScreen.areaName}</b></div>
                                </div>
								<div className="row flexed item-space">
                                    <div className="col-md-5 narrow-profit">מטה פניות ציבור</div>
									<div className="col-md-7 no-padding">
										{hasViewTeamPermissions ? 
										<Link to={"system/teams/" + this.props.topScreen.crmTeamKey}><b>{this.props.topScreen.crmTeamName}</b></Link>:
										<b>{this.props.topScreen.crmTeamName}</b>}
                                        &nbsp;&nbsp;&nbsp;{this.chooseRequestTeamItem}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 info-items">
                                <div className="row flexed item-space">
                                    <div className="col-md-5 narrow-profit">מטה בחירות</div>
									<div className="col-md-7 no-padding">
										{hasViewTeamPermissions? 
										<Link to={"system/teams/" + this.props.topScreen.teamKey}><b>{this.props.topScreen.teamName}</b></Link>:
										<b>{this.props.topScreen.teamName}</b>}
                                        &nbsp;&nbsp;&nbsp;{this.chooseTeamItem}
                                    </div>
                                </div>
                                <div className="row flexed item-space" style={this.topLineHeight}>
                                    <div className="col-md-5 narrow-profit"><br/>תת איזור</div>
                                    <div className="col-md-7"><br/><b>{this.props.topScreen.subAreaName}</b></div>
                                </div>

								{this.renderUpdatePhoneNumber()}
								{this.renderUpdateEmail()}
                            </div>
                            <div className="col-md-2 info-items">
                                <div className="row flexed item-space">
                                    <div className="col-md-5 narrow-profit">ראש מטה</div>
                                    <div className="col-md-7 no-padding"><b>{this.props.topScreen.teamLeaderName}</b></div>
                                </div>
                                <div className="row flexed item-space"  style={this.topLineHeight}>
                                    <div className="col-md-5 narrow-profit"><br/>נייד</div>
                                    <div className="col-md-7"><br/><b>{(this.props.topScreen.teamLeaderPhone ? formatPhone(this.props.topScreen.teamLeaderPhone) : '')}</b></div>
                                </div> 
                            </div>
							 
                    </div>
					<ModalWindow show={this.props.topScreen.displayChooseTeamModal} buttonCancel={this.closeChooseTeamForCityModal.bind(this)} buttonX={this.closeChooseTeamForCityModal.bind(this)} buttonOk={this.setTeamCity.bind(this)} title='בחירת צוות' style={{zIndex: '9001'}}>
                        <div className="row">
                           <div className="col-md-4">שם צוות : </div>
						   <div className="col-md-8"><Combo items={this.props.teams} inputStyle={this.teamsComboStyle} value={this.props.topScreen.selectedTeam.selectedValue}  onChange={this.teamsComboItemChange.bind(this)}  className="form-combo-table" itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} /> </div>
						</div>
						<div className="row">
						    <div className="col-md-12">
							<span style={{color:'#ff0000'}}>{this.bottomErrorText}</span>
							</div>
						</div>
                    </ModalWindow>
                </div>
     
        );
    }
}


function mapStateToProps(state) {
    return {
	   cities: state.system.cities,
	   topScreen:state.elections.citiesScreen.cityPanelScreen.topScreen,
	   teams:state.elections.citiesScreen.cityPanelScreen.teamsList,
	   currentUser:state.system.currentUser,
    }
}

export default connect(mapStateToProps)(withRouter(TopCityData));