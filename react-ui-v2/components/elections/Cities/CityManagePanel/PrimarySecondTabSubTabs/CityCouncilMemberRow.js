import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import Combo from '../../../../global/Combo';
import ReactWidgets from 'react-widgets';

import {findElementByAttr, parseDateToPicker, parseDateFromPicker , isValidComboValue,formatPhone} from 'libs/globalFunctions';

//Source item events
const ItemSource = {
    beginDrag(props) {
        return {item: props.item};
    },
    endDrag(props, monitor) {
        if (monitor.didDrop()) {
            props.drop();
        } else {
            props.revertToOriginal();
        }
    }
};

//collection for drag
function dragCollect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    };
}

//target item events
const ItemTarget = {};

//collection for drop
function dropCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        dragItem: monitor.getItem()
    };
}

class CityCouncilMemberRow extends React.Component {
	
	getRef(ref) {
        this.self = ref;
    }

    //drag over callback for calculating height ration of mouse over element and moving items accordingly
    onDragOver(e) {
		 if (this.props.isOver) {
            var offsetTop = this.self.offsetTop;
            var height = this.self.offsetHeight;
            var mouseY = e.clientY;
            var over = (mouseY - offsetTop) / height;

            if (over <= 0.5)
                this.props.move(this.props.dragItem.item, this.props.item, true);
            else
                this.props.move(this.props.dragItem.item, this.props.item, false);
        }
    }

    constructor(props) {
        super(props);
        this.initStyles();
    }

    /*
       Init constant styles for DND sorting
    */
    initStyles(){
          this.draggingStyle = {
            opacity: this.props.isDragging ? 0 : 1
          };
          this.dragHandleStyle = {
            cursor: "move",
            paddingLeft: "10px"
          };

    }
	
	 /*
	function that sets dynamic items in render() function : 
	*/
    initDynamicVariables() {
			  let item = this.props.item;
			  let phone = findElementByAttr(item.phones,'id',item.voter_phone_id);
			  item.phone_number = phone?phone.phone_number:'';
			  let index = this.props.index;
				  if(item.editing == true){
					  let editPartiesItem = [];
		              let selectedCampID = -1;
					  for(let i = 0 ; i <  this.props.campaignsList.length ; i++){
						  if(this.props.campaignsList[i].name == item.election_campaign_name){
							  selectedCampID  = this.props.campaignsList[i].id;
							  break;
						  }
						  
					  }
					  if(selectedCampID  >= 0){
			          editPartiesItem = this.props.allCityParties.filter(function(party){              
			             return party.election_campaign_id == selectedCampID
                      });
					  }
		                let isValidatedRow= true;
                      isValidatedRow = isValidatedRow && isValidComboValue(this.props.allCityDepartments,item.city_department_name , 'name' , true);
                      isValidatedRow = isValidatedRow && isValidComboValue(this.props.campaignsList,item.election_campaign_name , 'name' , true);
                      isValidatedRow = isValidatedRow && isValidComboValue(editPartiesItem,item.letters , 'letters' , true);
                      isValidatedRow = isValidatedRow && (item.council_number!='');
                      isValidatedRow = isValidatedRow && (parseDateToPicker(item.role_start) != null);
					  isValidatedRow = isValidatedRow && (!(item.role_end &&  parseDateToPicker(item.role_start) > parseDateToPicker(item.role_end)));
					    return <tr key={index}>
								<td><span className="num-item">{this.props.rowsCounter}</span>.</td>
								<td>
									<a title={item.first_name + ' '+ item.last_name}>{item.first_name + ' '+ item.last_name}</a>
								</td>
								<td>
								<Combo items={item.phones}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='phone_number' value={item.phone_number}
								 onChange={this.editCityRoleItemChange.bind(this , index , 'selectedPhone')}
									inputStyle={{borderColor:(isValidComboValue(item.phones,item.phone_number , 'phone_number' , true)?'#ccc' :'#ff0000')}} 
									 />
								</td>
								<td>
									<Combo items={this.props.allCityDepartments}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' value={item.city_department_name}
									 onChange={this.editCityRoleItemChange.bind(this , index , 'city_department_name')}
									    inputStyle={{borderColor:(isValidComboValue(this.props.allCityDepartments,item.city_department_name , 'name' , true)?'#ccc' :'#ff0000')}}  />
								</td>
								<td>
								<div className="row">
									<div className="col-md-11">
												<Combo  placeholder="בחר קמפיין בחירות"  items={this.props.campaignsList}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'  value={item.election_campaign_name} onChange={this.editCityRoleItemChange.bind(this , index , 'election_campaign_name')}    inputStyle={{borderColor:(isValidComboValue(this.props.campaignsList,item.election_campaign_name , 'name' , true)?'#ccc' :'#ff0000')}}  />
										</div>
									</div>
									<div className="row">
										<div className="col-md-11">
												<Combo  placeholder="בחר מפלגה"  items={editPartiesItem}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='letters' value={item.letters} onChange={this.editCityRoleItemChange.bind(this , index , 'letters')}  inputStyle={{borderColor:(isValidComboValue(editPartiesItem,item.letters , 'letters' , true)?'#ccc' :'#ff0000')}}  />
										</div>
									</div>
								</td>
								<td><input type="checkbox" checked={item.shas == '1'} onChange={this.editCityRoleItemChange.bind(this , index , 'shas')}  /></td>
								<td><input type="text" className="form-control"  value={item.council_number} onChange={this.editCityRoleItemChange.bind(this , index , 'council_number')} style={{borderColor:((item.council_number=='')?'#ff0000':'#ccc')}} /></td>
									<td>
								<ReactWidgets.DateTimePicker
										isRtl={true} time={false}
										value={parseDateToPicker(item.role_start)}
											onChange={parseDateFromPicker.bind(this, {
											callback: this.editFromDateChange,
											format: "YYYY-MM-DD",
											functionParams: index
											})
										}
											
											style={{borderColor:((parseDateToPicker(item.role_start) == null ) ? '#ff0000' :'#ccc')}} 
											format="DD/MM/YYYY"
									/>
								</td>
								<td>
								<ReactWidgets.DateTimePicker
										isRtl={true} time={false}
										value={parseDateToPicker(item.role_end)}
											onChange={parseDateFromPicker.bind(this, {
											callback: this.editToDateChange,
											format: "YYYY-MM-DD",
											functionParams: index
											})
										}
											style={{borderColor:((item.role_end &&  parseDateToPicker(item.role_start) > parseDateToPicker(item.role_end)) ? '#ff0000' :'#ccc')}} 
											
											format="DD/MM/YYYY"
									/>
								</td>
								<td className="status-data" colSpan="2">
									<button type="button" className="btn btn-success  btn-xs" disabled={!isValidatedRow}  onClick={this.saveRowData.bind(this,index)}  >
											<i className="fa fa-pencil-square-o" ></i>
									</button>
								&nbsp; &nbsp;
									<button type="button" className="btn btn-danger btn-xs" title="ביטול" onClick={this.setRowEdiding.bind(this,false,index)}>
										<i className="fa fa-times"></i>
									</button>
								</td>
							</tr>; 
					  
				  }
				  else{
					  let editItem = null;
					  let deleteItem = null;
					  if(!this.props.secondGeneralTabScreen.newCouncilMebmerScreen.visible && this.props.editsCount == 0){
						 if(this.props.isAuthorizedEdit){ 
                            editItem = <a title="ערוך" style={{cursor:'pointer'}} onClick={this.setRowEdiding.bind(this,true,index)}>
                                                                <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                                            </a>;
                         }
                         if(this.props.isAuthorizedDelete){
						  deleteItem = <a title="מחק" style={{cursor:'pointer'}} onClick={this.props.confirmDeleteCityRole.bind(this,index)}>
                                                                <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                                                            </a>;
                         }
					  }
			       return <tr key={index}>
							<td><span className="num-item">{this.props.rowsCounter}</span>.</td>
							<td>
							<Link title={item.first_name + ' '+ item.last_name}  to={'elections/voters/'+item.voter_key} target="_blank" >{item.first_name + ' '+ item.last_name}</Link>
							</td>
							<td>{formatPhone(item.phone_number)}</td>
							
							<td>{item.city_department_name}</td>
							<td>{item.letters}</td>
							<td>{item.shas == '1' ? 'כן' : 'לא'}</td>
							<td>{item.council_number}</td>
							<td>{item.role_start.split('-').reverse().join('/')}</td>
							<td>{item.role_end?item.role_end.split('-').reverse().join('/'):''}</td>
							<td className="status-data">
								{editItem}
							</td>
							<td className="status-data">
								{deleteItem}
							</td>
						</tr>; 
				  }
			  
		
    }
	
	
	/*
	do real save of row data via api
	
	@param rowIndex
	*/
	saveRowData(index){
		let rowScreen = this.props.secondGeneralTabScreen[this.props.collectionName][index];
		let dataRequest = {};
		let validatedDepartment = false;
		let validatedParty = false;
		 
		for(let i = 0 ; i<this.props.allCityDepartments.length ; i++){
				if(this.props.allCityDepartments[i].name == rowScreen.city_department_name){
					dataRequest.department_key = this.props.allCityDepartments[i].key;
				    validatedDepartment = true
                    break;				
				}
		}	
		 
		if(!validatedDepartment && rowScreen.city_department_name &&  rowScreen.city_department_name.split(' ').join('') != '' &&
		 this.city_department_name != rowScreen.city_department_name){ // wrong department validation
			return;
		}
		 
		for(let i = 0 ; i<this.props.allCityParties.length ; i++){
				if(this.props.allCityParties[i].letters == rowScreen.letters){
					dataRequest.party_key = this.props.allCityParties[i].key;
					validatedParty = true;
                    break;				
				}
		}
          
		if(!validatedParty && rowScreen.letters && rowScreen.letters.split(' ').join('') != '' && this.letters != rowScreen.letters){ // wrong party validation
			return;
		}
		
		if(rowScreen.council_number == ''){ // wrong council_number validation
			return;
		}
		
		if(rowScreen.term_of_office == ''){ // wrong term_of_office validation
			return;
		}
		
		if(rowScreen.role_start == null || rowScreen.role_start == '' ){ // wrong role_start validation
			return;
		}
		
		if(this.shas != rowScreen.shas){
			dataRequest.shas = rowScreen.shas;
		}
		
		if(this.council_number != rowScreen.council_number){
			dataRequest.council_number = rowScreen.council_number;
		}
		
		if(this.term_of_office != rowScreen.term_of_office){
			dataRequest.term_of_office = rowScreen.term_of_office;
		}
		
		if(this.role_start != rowScreen.role_start){
			dataRequest.role_start = rowScreen.role_start;
		}

		dataRequest.voter_phone_id = rowScreen.voter_phone_id;
		
	    dataRequest.role_end = rowScreen.role_end;
		 
		
		
		ElectionsActions.updateCouncilMember(this.props.dispatch , this.props.router.params.cityKey ,  rowScreen.key , dataRequest , index , this.props.collectionName);
		this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:('elections.cities.roles.council.edit')});		
	}
 
   
	 

	/*
	Set specific row editing
	
	@param show
	@param index
	*/
	setRowEdiding(show , index){
		if(show){ //save original
            this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:('elections.cities.roles.council.edit')});
		    let rowScreen = this.props.secondGeneralTabScreen[this.props.collectionName][index];
			this.setState({city_department_name : rowScreen.city_department_name});
			this.setState({election_campaign_name : rowScreen.election_campaign_name});
			this.setState({letters :rowScreen.letters});
			this.setState({shas : rowScreen.shas});
			this.setState({council_number : rowScreen.council_number});
			this.setState({term_of_office : rowScreen.term_of_office});
			this.setState({role_start : rowScreen.role_start});
			this.setState({role_end : rowScreen.role_end});
			this.setState({phone_number : rowScreen.phone_number});
		}
		else{ //in case of cancel - restore value
            this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:('elections.cities.roles.council.edit')});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'city_department_name' ,
				fieldValue:this.state.city_department_name
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'election_campaign_name' ,
				fieldValue:this.state.election_campaign_name
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'letters' ,
				fieldValue:this.state.letters
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'shas' ,
				fieldValue:this.state.shas
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'council_number' ,
				fieldValue:this.state.council_number
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'term_of_office' ,
				fieldValue:this.state.term_of_office
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'role_start' ,
				fieldValue:this.state.role_start
			});
			this.props.dispatch({type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,collectionName:this.props.collectionName,rowIndex : index , 
				fieldName:'role_end' ,
				fieldValue:this.state.role_end
			});
		}
		this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				rowIndex : index , 
				fieldName:'editing' ,
				fieldValue:show
			});
		
	}
	
	/*
	Handle edit row screen - item value change : 
	*/
	editCityRoleItemChange(index , fieldName , e){
		if(fieldName == 'shas'){
			
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				rowIndex : index , 
				fieldName ,
				fieldValue:(e.target.checked ?'1':'0')
			});
		}
		else if(fieldName=='selectedPhone'){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				rowIndex : index , 
				fieldName:'voter_phone_id' ,
				fieldValue:e.target.selectedItem?e.target.selectedItem.id:''
			});
		}
		else if(fieldName == 'council_number' ){
			if(e.target.value == '0' || !new RegExp('^[0-9]*$').test(e.target.value)){ // allow only numbers in personal-identity field
				return;
			}
			if(parseInt(e.target.value) > 999){
				return;
			}

		}else{
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				rowIndex : index , 
				fieldName ,
				fieldValue:e.target.value
			});
		}
	}
	
		/*
	Handles change in edit from_date field : 
	*/
	editFromDateChange(value,format, index) {
		if(value == null){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				fieldName:'role_start' ,
				fieldValue:'' , 
				rowIndex:index
			});
			
		}
		else{
		this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				fieldName:'role_start' ,
				fieldValue:value , 
				rowIndex:index
			});
		}
    }
	
	/*
	Handles change in edit to_date field : 
	*/
	editToDateChange(value,format, index) {
		if(value == null){
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				fieldName:'role_end' ,
				fieldValue:'' , 
				rowIndex:index
			});
			
		}
		else{
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE,
				collectionName:this.props.collectionName,
				fieldName:'role_end' ,
				fieldValue:value , 
				rowIndex:index
			});
		}

         
    }
	

      /*
	function that sets dynamic items in DND sort mode in render() function : 
	*/
    initDynamicVariablesDNDMode(){
		let item = this.props.item;
		let phone = findElementByAttr(item.phones,'id',item.voter_phone_id);
		item.phone_number = phone?phone.phone_number:'';
		let index = this.props.index;
		if(this.props.hideHistoricalRows){
					  if(item.role_end != null && item.role_end != ''){
						  let endDatePartsArray = item.role_end.split("-");
						  let itemDateObject = (new Date(endDatePartsArray[1]+'/'+endDatePartsArray[2]+'/'+endDatePartsArray[0])).getTime();
						  let nowDateObject = (new Date()).getTime();
						  
						  if(itemDateObject-nowDateObject < 0){return null;}
					  }
		}
		return (
            this.props.connectDropTarget(
				this.props.connectDragPreview(
					<tr ref={this.getRef.bind(this)} style={{...this.draggingStyle , opacity:(this.props.isDragging ? 0 : 1)}} onDragOver={this.onDragOver.bind(this)}>
						<td>
						{this.props.connectDragSource(<i className="fa fa-drag-handle" style={this.dragHandleStyle}></i>)}
						</td>
						<td>
							<a title={item.first_name + ' '+ item.last_name}>{item.first_name + ' '+ item.last_name}</a>
						</td>
						<td>{formatPhone(item.phone_number)}</td>
						<td>{item.city_department_name}</td>
						<td>{item.letters}</td>
						<td>{item.shas == '1' ? 'כן' : 'לא'}</td>
						<td>{item.council_number}</td>
						<td>{item.term_of_office}</td>
						<td>{item.role_start.split('-').reverse().join('/')}</td>
						<td>{item.role_end?item.role_end.split('-').reverse().join('/'):''}</td>
						<td className="status-data"></td>
						<td className="status-data"></td>
                    </tr>
                    ))
        );
	}
 
    render() {
		
		if(this.props.isCityConcilMemberRowInDnDSort){
			return this.initDynamicVariablesDNDMode()
		   
		}
		else{
			return this.initDynamicVariables()
		}
			
         
    }
}


function mapStateToProps(state) {
    return {
            allCityDepartments:state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen.allCityDepartments,
	        allCityParties:state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen.allCityParties,
			secondGeneralTabScreen:state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen,
            campaignsList : state.elections.citiesScreen.cityPanelScreen.campaignsList,
			isCityConcilMemberRowInDnDSort : state.elections.citiesScreen.cityPanelScreen.secondGeneralTabScreen.isCityConcilMemberRowInDnDSort,
    }
}

//using flow to combing two HOC on our DndSortItem class
export default connect(mapStateToProps)(withRouter(flow(
        DragSource(ElectionsActions.DragTypes.COUNCIL_MEMBER_ROW_DND_ROW, ItemSource, dragCollect),
        DropTarget(ElectionsActions.DragTypes.COUNCIL_MEMBER_ROW_DND_ROW, ItemTarget, dropCollect)
        )(withRouter(CityCouncilMemberRow))));
 