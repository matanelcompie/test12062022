import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';


import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import {findElementByAttr,formatPhone} from 'libs/globalFunctions';
import Combo from '../../../../global/Combo';

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

class MunicipalCouncilCandidateRow extends React.Component {

    constructor(props) {
        super(props);
        this.initStyles();
    }
	
	/*
	Function that initializes styles
	*/
	initStyles() {
        this.textValues = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };

        this.draggingStyle = {
            opacity: this.props.isDragging ? 0 : 1
        };
        this.dragHandleStyle = {
            cursor: "move",
            paddingLeft: "10px"
        };
    }

	
	//ref of element for height claculation
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
            //console.log(this.self);
           //console.log(offsetTop + " ** " + height + " ** " + mouseY + " ** " + over);

            if (over <= 0.5)
                this.props.move(this.props.dragItem.item, this.props.item, true);
            else
                this.props.move(this.props.dragItem.item, this.props.item, false);
        }
    }
	
 
    renderRegularMode(){
		           let item = this.props.item;
				   let index = this.props.index;
				   let editingCount = this.props.editingCount;
				   if(this.props.item.editing){
					        this.currentParties = [];
                            if(this.props.cityMunicipalElectionsCampaignsData){
							    this.currentParties = this.props.cityMunicipalElectionsCampaignsData.municipal_election_parties;
                            }
						    let isValidatedPhone = this.props.isValidComboValue(item.phones , item.voter_phone_number , 'phone_number' , true);
							let isValidatedParty = this.props.isValidComboValue(this.currentParties , item.party_letters , 'letters') ;
							
							return(<tr>
                                                            <td><span className="num-utem">{index + 1}</span>.</td>
                                                            <td>{item.personal_identity}</td>
                                                            <td>
                                                                <a title={item.first_name + ' '+ item.last_name} >
                                                                    {item.first_name + ' '+ item.last_name}
                                                                </a>
                                                            </td>
                                                            <td><Combo items={item.phones}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='phone_number'    value={item.voter_phone_number}    onChange={this.props.editCandidateRowItemChange.bind(this , 'council_candidates' , index , 'voter_phone_number')}  inputStyle={{borderColor:(isValidatedPhone ?'#ccc':'#ff0000') }}    /> </td>
                                                            <td><Combo items={this.currentParties}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='letters'    value={item.party_letters}    onChange={this.props.editCandidateRowItemChange.bind(this , 'council_candidates' , index , 'party_letters')}  inputStyle={{borderColor:(isValidatedParty ?'#ccc':'#ff0000') }}    /> </td>
                                                            <td><input type="checkbox" checked={item.shas == '1'} onChange={this.props.editCandidateRowItemChange.bind(this , 'council_candidates' , index , 'shas')}/> </td>
                                                            <td>{item.voter_city}</td>
                                                           
                                                            <td className="status-data" colSpan="2">
																<button type="button" className="btn btn-success  btn-xs" disabled={!(isValidatedPhone && isValidatedParty)}  onClick={this.props.doRealEditRow.bind(this,'council_candidates',index , (isValidatedPhone && isValidatedParty))}  >
                                                                    <i className="fa fa-pencil-square-o" ></i>
																</button>
															   &nbsp;&nbsp;
                                                             
                                                                <button type="button" className="btn btn-danger btn-xs" title="ביטול" onClick={this.props.setCandidateRowEditing.bind(this,'council_candidates' , index , false)}>
                                                                <i className="fa fa-times"></i>
                                                                </button>
                                                            </td>
                                                        </tr>)
						}
						else{
						
						let editItem = null;
						let deleteItem = null ; 
						
						if(!this.props.isAddingMayorCandidate && !this.props.isAddingCouncilCandidate && editingCount == 0){
							if(this.props.isAuthorizedEdit){
                               editItem = <a title="ערוך" style={{cursor:'pointer'}} onClick={this.props.setCandidateRowEditing.bind(this,'council_candidates' , index , true)}>
                                                                    <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                                                </a>;
                            }
                            if(this.props.isAuthorizedDelete){
							   deleteItem = <a title="מחק" style={{cursor:'pointer' , color:'#2AB4C0'}} onClick={this.props.confirmDeleteMayorRow.bind(this,'deleteCouncilCandidateIndex' , index)}>
                                                                    <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                                                                </a>;
                            }									
						}
                        return  (<tr>
                                    
                                    <td><span className="num-utem">{index+1}</span>.</td>
                                    
                                    <td>{item.personal_identity}</td>
                                    
                                        <td>
                                    <Link title={item.first_name + ' '+ item.last_name}  to={'elections/voters/'+item.voter_key} target="_blank" >{item.first_name + ' '+ item.last_name}</Link>
                                    </td>
                                    <td>{formatPhone(item.voter_phone_number)}</td>
                                    <td>{item.party_letters}</td>
                                    <td>{item.shas == '1' ?'כן':'לא'}</td>
                                    <td>{item.voter_city}</td>
                                    <td className="status-data">
                                    {editItem}
                                    </td>
                                    <td className="status-data">
                                    {deleteItem}
                                    </td>
                                </tr>)
						}

                
		
	}
	
	renderDNDMode(){
 
		return (
            this.props.connectDropTarget(this.props.connectDragPreview(
			       
                    <tr ref={this.getRef.bind(this)} style={{...this.draggingStyle,opacity:(this.props.isDragging ? 0 : 1)}} onDragOver={this.onDragOver.bind(this)}>
                        <td>
                            {this.props.connectDragSource(<i className="fa fa-drag-handle" style={this.dragHandleStyle}></i>)}
                             
                        </td>
						 
                                                           
                    <td>{this.props.item.personal_identity}</td>
                        <td>
                        <a title={this.props.item.first_name + ' '+ this.props.item.last_name}>
                            {this.props.item.first_name + ' '+ this.props.item.last_name}
                        </a>
                    </td>
                    <td>{this.props.item.voter_phone_number}</td>
                    <td>{this.props.item.party_letters}</td>
                    <td>{this.props.item.shas == '1' ?'כן':'לא'}</td>
                    <td>{this.props.item.voter_city}</td>
                    <td className="status-data">
                        
                    </td>
                    <td className="status-data">
                        
                    </td>
                    </tr>
                    ))
        );
	}
	
 
    render() {
        let item= this.props.item;
        if(!item.voter_phone_number&&item.voter_phone_number!=''){
            let phone=findElementByAttr(item.phones,'id',item.voter_phone_id);
            item.voter_phone_number = phone ? phone.phone_number:'';
        }
        if(this.props.isCouncilCandidateRowInDnDSort){
			return this.renderDNDMode();
		}
		else{
			return this.renderRegularMode();
		}
    }
}


function mapStateToProps(state) {
    return {
		 cityMunicipalElectionsCampaignsData : state.elections.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData,
		 isAddingMayorCandidate : state.elections.citiesScreen.cityPanelScreen.isAddingMayorCandidate ,
         isAddingCouncilCandidate : state.elections.citiesScreen.cityPanelScreen.isAddingCouncilCandidate ,
	     isCouncilCandidateRowInDnDSort:state.elections.citiesScreen.cityPanelScreen.isCouncilCandidateRowInDnDSort,
    }
}

//using flow to combing two HOC on our DndSortItem class
export default connect(mapStateToProps)(withRouter(flow(
        DragSource(ElectionsActions.DragTypes.CANDIDATE_ROW_DND_ROW, ItemSource, dragCollect),
        DropTarget(ElectionsActions.DragTypes.CANDIDATE_ROW_DND_ROW, ItemTarget, dropCollect)
        )(withRouter(MunicipalCouncilCandidateRow))));