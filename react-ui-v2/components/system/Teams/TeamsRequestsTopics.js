
import React from 'react';
import { connect } from 'react-redux';

import {updateTeamRequestSubTopicUser} from '../../../actions/ElectionsActions';

import TeamRequestsTopicRow from './TeamRequestsTopicRow';
class TeamsRequestsTopics extends React.Component {

	constructor(props) {
        super(props);
        this.state ={
            currentEditRowId: null,
            requestModuleTeamUsersHash: {}
        }
        this.newEmptyUserRequestTopic = {
            id: null,
            key: null,
            parent_id: null,
            user_handler_id: null,
            request_topic_user_id: null,
        };
    }
    componentWillReceiveProps(nextProps){
        if(JSON.stringify(nextProps.requestModuleTeamUsers) != JSON.stringify(this.props.requestModuleTeamUsers)){
            let requestModuleTeamUsersHash = {};
			nextProps.requestModuleTeamUsers.forEach(item => { requestModuleTeamUsersHash[item.id] = item; });
            this.setState({requestModuleTeamUsersHash})
		}
    }
	onEditItem(itemId){
		this.setState({currentEditRowId: itemId, inAddNewRow: false})
	}
	onSaveItem(subTopicKey, userHandlerId, userRequestTopicId){
		this.onEditItem(null)
		updateTeamRequestSubTopicUser(this.props.dispatch, this.props.teamKey, subTopicKey, userHandlerId, userRequestTopicId);
	}
	renderRequestSubTopics(){
        let topicsRows = [];
        this.props.requestsMunicipallyTopics.forEach(item => {
            let row = this.getRequestsTopicRow(item, true);
            topicsRows.push(row) 
        });
        this.props.requestsUsersTopics.forEach(item => {
            let row =this.getRequestsTopicRow(item, false);
            topicsRows.push(row)
        });
        
        return topicsRows;
    }
    displayAddNewRow(){
        this.setState({currentEditRowId: null, inAddNewRow: !this.state.inAddNewRow})
    }
    renderNewRowButton(){
        return (
            <tr>
                    <td></td><td></td><td></td>
                    <td style={{textAlign: 'left', paddingLeft:'15px'}}>
                        <span className={"edit-buttons"}><button type="button" className="btn btn-success btn-xs" onClick={this.displayAddNewRow.bind(this)}><i className="fa fa-plus "></i></button></span>
                    </td>
            </tr>
        )
    }
    renderAddNewRow(){
        if(this.state.inAddNewRow){
            return this.getRequestsTopicRow(this.newEmptyUserRequestTopic, false);
        } else {
            return this.renderNewRowButton();
        }
    }
    getRequestsTopicRow(item, isMunicipalRow){
        return(<TeamRequestsTopicRow 
            key= { (isMunicipalRow ? 'municipal': 'requests') + item.request_topic_user_id + item.id }
            allTopicsHash= {this.props.allTopicsHash}
            mainTopicsHash= {this.props.mainTopicsHash}
            requestModuleTeamUsers={this.props.requestModuleTeamUsers}
            requestModuleTeamUsersHash={this.state.requestModuleTeamUsersHash}
            isMunicipalRow={isMunicipalRow}
            item={item}
            itemInEditMode={this.state.currentEditRowId == item.id}
            onEditItem={this.onEditItem.bind(this)}
            onSaveItem={this.onSaveItem.bind(this)}
        />)
    }
    render() {
        if(!this.props.display){
            return (<div></div>);
        }
        return (
			<div className="containerStrip">
				<div className="row panelContent">
					<div className="col-md-10">
						<table className="table table-striped tableNoMarginB tableTight table-scroll">
							<thead>
								<tr>
									<th>נושא</th>
									<th>תת נושא</th>
									<th>משתמש מטפל</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
                                {this.renderRequestSubTopics()}
                                {this.renderAddNewRow()}
							</tbody>
						</table>
						<div className="add-item-line">
						</div>
					</div>
				</div>
			</div>
		);
    }
}
;

function mapStateToProps(state) {
    return {
        requestModuleTeamUsers: state.system.requestModuleUsers,
        requestsUsersTopics: state.system.teamsScreen.requestsTopics.all,
        requestsMunicipallyTopics: state.system.teamsScreen.requestsTopics.municipally,
        allTopicsHash: state.system.lists.allTopicsHash,
        mainTopicsHash: state.system.lists.mainTopicsHash,
    };
}

export default connect(mapStateToProps)(TeamsRequestsTopics);
