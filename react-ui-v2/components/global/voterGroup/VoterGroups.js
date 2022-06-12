import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
 
import Combo from '../Combo';

 
import * as SystemActions from '../../../actions/SystemActions';


class VoterGroups extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
      
    }
	
	getItemsByParentId(parentId , items){
		return items.filter(item=>item.parent_id == parentId);
	}
	
	constructDynamicComboesList(){
		this.dynamicComboList = [];
		
		this.dynamicComboList.push( <div className="row" key={0}>
				    <div className="col-md-4">קבוצה : </div>
					<div className="col-md-8"><Combo items={this.getItemsByParentId(0,this.props.items)} maxDisplayItems={10} itemIdProperty="id" itemDisplayProperty='name' onChange={this.props.selectAnotherValueInGroupsCombo.bind(this,0)} value={this.props.selectedVotersGroupsHierarchy.length > 0 ? this.props.selectedVotersGroupsHierarchy[0].value : ''}  /></div>
				</div>);
		for(let i = 0 ; i < this.props.selectedVotersGroupsHierarchy.length ; i++){
			 
			 if(this.props.selectedVotersGroupsHierarchy[i].item){
			   this.dynamicComboList.push( <div className="row" key={i+1}>
				    <div className="col-md-4">תת קבוצה : </div>
					<div className="col-md-8"><Combo items={this.getItemsByParentId(this.props.selectedVotersGroupsHierarchy[i].item.id,this.props.items)} maxDisplayItems={10} itemIdProperty="id" itemDisplayProperty='name' onChange={this.props.selectAnotherValueInGroupsCombo.bind(this,(i+1))} value={this.props.selectedVotersGroupsHierarchy[i+1] ? this.props.selectedVotersGroupsHierarchy[i+1].value : (i== (this.props.selectedVotersGroupsHierarchy.length-1) ? this.props.insertedNewGroupName:'')}  /></div>
				</div>);
			 }
		}
	}

    render() {
		this.constructDynamicComboesList();
        return (
           <div>
		        {this.dynamicComboList}
		        <hr/>
				 
				<div className="row">
				     <div className="col-md-12">הוספת תת קבוצה חדשה בהיררכיה האחרונה : </div>
				</div>
				<div className="row">
				     <div className="col-md-3">שם קבוצה : </div>
					 <div className="col-md-6"><input type="text" className="form-control" value={this.props.newVoterGroupName} onChange={this.props.newGroupNameChange.bind(this)} /> </div>
					 <div className="col-md-2"><button className="btn btn-primary" disabled={this.props.newVoterGroupName.length < 2} onClick={this.props.addNewGroupNameViaAPI.bind(this)}>הוסף</button></div>
				</div>
		   </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        
    }
}

export default connect(mapStateToProps)(withRouter(VoterGroups));