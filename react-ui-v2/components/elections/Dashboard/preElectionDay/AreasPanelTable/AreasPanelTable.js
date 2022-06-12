import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import store from '../../../../../store';
import Pagination from '../../../../global/Pagination';
import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';


class AreasPanelTable extends React.Component {
    constructor(props) {
		super(props);
		this.screenPermission = 'elections.dashboards.pre_election_day';
    }
	
	componentWillMount(){
		ElectionsActions.loadAreasPanel(this.props.dispatch);
		ElectionsActions.loadGlobalStatsAreasPanel(this.props.dispatch);
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin == false && nextProps.currentUser.permissions[this.screenPermission] != true && this.props.currentUser.permissions[this.screenPermission] != true && this.props.currentUser.first_name.length > 1) {
			this.props.router.replace('/unauthorized');
		}
	}

	/*
	Go back to dashboard pre-election screen :
	*/
    goBack()
	{
		this.props.router.push('elections/dashboards/pre_elections_day');
	}
	
	/*
		Function that loads the selected page : 
	*/
	navigateToPage(pageIndex){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'areasPanel' ,  fieldName:'currentPage' , fieldValue : pageIndex });
	}
	
	/*
		This function returns rows with data of item (area/city/etc) by params
	*/
	getRowsByParam(index ,item , name , backgroundColor , fontClassName , onClick){
		return [
		                 <tr key="global_row1">
                            <td rowSpan="5" className={fontClassName} style={{cursor:'pointer' , backgroundColor}} onClick={onClick}>{name}</td>
                            <td rowSpan="3">כללי </td>
                            <td>הכל</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.total_final_supporters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.total_sure_support_voters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.total_support_voters}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.previous_votes_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.previous_supporters_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.total_potential_voters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.total_hesitate_voters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.total_not_support_voters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.total_together_voters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.total_voters_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.total_households_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                        </tr>,
                        <tr key="global_row2">
                            <td>סניף </td>
                            <td></td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_sure_supporters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_supporters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td></td>
                            <td></td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_potential.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_hesitate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_not_support.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_together.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td></td>
                            <td></td>
                        </tr>,
                        <tr key="global_row3">
                            <td> TM</td>
                            <td></td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_sure_supporters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_supporters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td></td>
                            <td></td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_potential.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_hesitate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_not_support.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_together.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td></td>
                            <td></td>
                        </tr>,
                        <tr key="global_row4">
                            <td rowSpan="2">היום </td>
                            <td>סניף</td>
                            <td></td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_sure_supporters_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_supporters_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td></td>
                            <td></td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_potential_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_hesitate_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_not_support_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.el_together_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td></td>
                            <td></td>
                        </tr>,
                        <tr key="global_row5">
                            <td>TM </td>
                            <td></td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_sure_supporters_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_supporters_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td></td>
                            <td></td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_potential_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_hesitate_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_not_support_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>{!item ? <i className="fa fa-spinner fa-spin"></i> : item.tm_together_today.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td></td>
                            <td></td>
                        </tr>];
	}
	
	/*
		Filter results by all country / area / city
	*/
	filterByGeoEntity(areaId , subAreaID , cityID){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'areasPanel' ,  fieldName:'selectedAreaID' , fieldValue : areaId });
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'areasPanel' ,  fieldName:'selectedSubAreaID' , fieldValue : subAreaID });
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'areasPanel' ,  fieldName:'selectedCityID' , fieldValue : cityID });
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'areasPanel' ,  fieldName:'currentPage' , fieldValue : 1 });
		this.resetBreadcrumbsToBase();
		if(areaId != -1){
			for(let i = 0 ; i < this.props.currentUserGeographicalFilteredLists.areas.length ; i++){
				if(this.props.currentUserGeographicalFilteredLists.areas[i].id == areaId){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day/areas_panel', title:this.props.currentUserGeographicalFilteredLists.areas[i].name, elmentType:'preElectionsAreasPanel' , onClick:this.filterByGeoEntity.bind(this , areaId , -1 , -1) } });
					break;
				}
			}
		}
		if(cityID != -1){
			for(let i = 0 ; i < this.props.currentUserGeographicalFilteredLists.cities.length ; i++){
				if(this.props.currentUserGeographicalFilteredLists.cities[i].id == cityID){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day/areas_panel', title:this.props.currentUserGeographicalFilteredLists.cities[i].name, elmentType:'preElectionsAreasPanel' , onClick:this.filterByGeoEntity.bind(this , areaId , -1 , cityID) } });
					break;
				}
			}
		}
	}
	
	/*
		Helpful function that reset basic breadcrumbs
	*/
	resetBreadcrumbsToBase(){
		this.props.dispatch({ type: SystemActions.ActionTypes.RESET_BREADCRUMBS });
	    this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day/areas_panel', title:'פאנל אזורים - כל הארץ', elmentType:'preElectionsAreasPanel' , onClick:this.filterByGeoEntity.bind(this , -1 , -1 , -1) } });
	}
  
    render() {
	 
		 
		this.resultSetLength = 0;
		let self = this;
        return (<div style={{marginTop:'-40px'}}>
						<div className="pull-left back-to-main" style={{cursor:'pointer'}} onClick={this.goBack.bind(this)}>חזור לדף ראשי &nbsp;<img src={window.Laravel.baseURL+"Images/arrow-back.png"} alt="חזור לדף ראשי" /></div>
						<div style={{paddingTop:'50px'}}>
							<div className="dtlsBox srchRsltsBox box-content">
								<table className="table-summary-dashboard">
									<thead>
										<tr>
											<th colSpan="3"></th>
											<th colSpan="9">סטטוסים</th>
											<th colSpan="2">בעלי זכות בחירה</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td rowSpan="2" colSpan="3" className="table-title"> איזור</td>
											<td rowSpan="2" className="table-title">תומכים סופי</td>
											<td rowSpan="2" className="table-title">תומך בטוח</td>
											<td rowSpan="2" className="table-title">תומך</td>
											<td colSpan="2" className="table-title">תומכי כנסת 2015</td>
											<td rowSpan="2" className="table-title">פוטנציאל</td>
											<td rowSpan="2" className="table-title">מהסס</td>
											<td rowSpan="2" className="table-title">לא תומך</td>
											<td rowSpan="2" className="table-title">יחד </td>
											<td rowSpan="2" className="table-title">תושבים </td>
											<td rowSpan="2" className="table-title">בתי אב </td>
										</tr>
										<tr>
											<td>מצביעים</td>
											<td>תומכים</td>
										</tr>
						 
										{ ((!this.props.areasPanel.globalCountryStats) ?<tr><td   className="table-title-20" style={{cursor:'pointer', backgroundColor:'#e4e4e4'  }} onClick={this.filterByGeoEntity.bind(this,-1,-1,-1)} >כל הארץ</td><td colSpan="14" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i></td></tr> : 
											this.getRowsByParam(0 , this.props.areasPanel.globalCountryStats , "כל הארץ" , '#e4e4e4' , "table-title-20" , this.filterByGeoEntity.bind(this,-1,-1,-1) ) 
											)
										}

										{/*area*/}
										{!this.props.areasPanel.areasCitiesStats ?
											<tr><td colSpan="15" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i></td></tr>
											:  
											this.props.areasPanel.areasCitiesStats.map(function(item,index){
												if(self.props.areasPanel.selectedAreaID > 0){
													if(   self.props.areasPanel.selectedAreaID != item.id){
														return;
													}
												}
												 
												if(item.cities.length > 0){
														self.resultSetLength += item.cities.length;
												}
												let firstIndex = self.resultSetLength - item.cities.length;
												if (self.props.areasPanel.selectedCityID == -1) {
													if ((self.props.areasPanel.currentPage * (self.props.areasPanel.citiesAndAreasPerPage - 1)) <= firstIndex) {
														return;
													}
													if (((self.props.areasPanel.currentPage) * (self.props.areasPanel.citiesAndAreasPerPage - 1)) > (item.cities.length + firstIndex)) {
														return;
													}
												}

												return (item.cities.length >0 && [
														(self.props.areasPanel.selectedCityID == -1  && self.getRowsByParam(1 , item.stats , item.name , '#ebebeb' , "table-title-18" , self.filterByGeoEntity.bind(self,item.id,-1,-1) ))
														,
															item.cities.map(function(innerItem , innerIndex){
																
																if(self.props.areasPanel.selectedCityID > 0){
																	if(self.props.areasPanel.selectedCityID != innerItem.id){
																		return;
																	}
																}
																
																if(self.props.areasPanel.selectedCityID == -1){
																	if(firstIndex + innerIndex >= (self.props.areasPanel.currentPage*(self.props.areasPanel.citiesAndAreasPerPage-1))){
																		return;
																	}
																	
																	if(firstIndex + innerIndex < ((self.props.areasPanel.currentPage-1)*(self.props.areasPanel.citiesAndAreasPerPage-1))){
																		return;
																	}
																}
																return (self.getRowsByParam(2 , innerItem.stats , innerItem.name , '#f8f8f8' , "table-title-center", self.filterByGeoEntity.bind(self,item.id,-1,innerItem.id) ))
															})
														]
													);
											})
										}
									</tbody>
								</table>
								{this.props.areasPanel.selectedCityID == -1 &&  <Pagination resultsCount={this.resultSetLength}
									displayItemsPerPage={this.props.areasPanel.citiesAndAreasPerPage}
									currentPage={this.props.areasPanel.currentPage}
								navigateToPage={this.navigateToPage.bind(this)} />}
							</div>
						</div>	
			        </div>
					);
    }
	
	componentDidUpdate(){
		if(this.props.areasPanel.areasCitiesStats){
			 let resultSetLength = 0;
			for(let index = 0 ; index < this.props.areasPanel.areasCitiesStats.length ; index++){
				
				let item = this.props.areasPanel.areasCitiesStats[index];
				
				if(item.cities.length > 0){
								resultSetLength += item.cities.length;
				}
				let firstIndex = resultSetLength - item.cities.length;
				if(this.props.areasPanel.selectedCityID == -1){ //Check Pagination only  when no city selected
					if((this.props.areasPanel.currentPage*(this.props.areasPanel.citiesAndAreasPerPage-1)) <= firstIndex){
						continue;
					}
					if(((this.props.areasPanel.currentPage)*(this.props.areasPanel.citiesAndAreasPerPage-1)) > (item.cities.length+firstIndex)){				 
							continue;
					}
				}

				if(this.props.areasPanel.selectedAreaID > 0){
					if(this.props.areasPanel.selectedAreaID != item.id){
						continue;
					}
			    }
				if(!item.stats){
					if(item.isLoadingAreaStats == undefined){
						ElectionsActions.loadStatsByAreaOrCity(this.props.dispatch , item.key , index , null , false);					 
					}
				}
				
				for(let innerIndex = 0 ; innerIndex < item.cities.length ; innerIndex++){
					let innerItem = item.cities[innerIndex];
					if(this.props.areasPanel.selectedCityID > 0){
						if(this.props.areasPanel.selectedCityID != innerItem.id){
							continue;
						}
					}
					if (this.props.areasPanel.selectedCityID == -1) { //Check Pagination only  when no city selected
						if (firstIndex + innerIndex >= (this.props.areasPanel.currentPage * (this.props.areasPanel.citiesAndAreasPerPage - 1))) {
							continue;
						}
						if (firstIndex + innerIndex < ((this.props.areasPanel.currentPage - 1) * (this.props.areasPanel.citiesAndAreasPerPage - 1))) {
							continue;
						}
					}
					 
					if(!innerItem.stats){
					if(innerItem.isLoadingAreaStats == undefined){
                     	ElectionsActions.loadStatsByAreaOrCity(this.props.dispatch , innerItem.key , index , innerIndex , true);					 
					}
				} 
				}
			}
			
		} 
	}
}

function mapStateToProps(state) {
    return {
		areasPanel:state.elections.preElectionsDashboard.areasPanel,
		currentUser: state.system.currentUser,
		currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
    }
}

export default connect(mapStateToProps) (withRouter(AreasPanelTable));