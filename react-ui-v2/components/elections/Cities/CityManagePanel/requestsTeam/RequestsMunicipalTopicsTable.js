import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import store from '../../../../../store';

import {updateCityRequestSubTopicUser} from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import RequestsMunicipalTopicRow from './RequestsMunicipalTopicRow';
import {requests_system_name} from 'libs/constants';



class RequestsMunicipalTopicsTable extends React.Component {

	constructor(props) {
        super(props);
        this.state = {
			currentEditRowId: null,
		}

	}
	componentWillMount(){
		let crmTeamKey = this.props.topScreen.crmTeamKey;
		if(crmTeamKey){
			SystemActions.loadRequestTopics(this.props.dispatch, null,  {'topic_system_name': requests_system_name.municipally, 'city_key': this.props.params.cityKey});
			SystemActions.loadRequestModuleUsers(this.props.dispatch, crmTeamKey);
		}
	}
    componentWillReceiveProps(nextProps){
        if(nextProps.topScreen.crmTeamKey && this.props.topScreen.crmTeamKey != nextProps.topScreen.crmTeamKey){
            SystemActions.loadRequestModuleUsers(this.props.dispatch, nextProps.topScreen.crmTeamKey);
		}

    }
	onEditItem(itemId){
		this.setState({currentEditRowId: itemId})
	}
	onSaveItem(itemKey, userHandlerId){
		this.onEditItem(null)
		updateCityRequestSubTopicUser(this.props.dispatch, this.props.params.cityKey, itemKey, userHandlerId);
	}
    renderMunicipalRequestSubTopics(){
        const hasEditPermission =  (this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.cities.teams.edit']);

        let rows = this.props.municipalSubTopicsList.map(item => {
            return (
				<RequestsMunicipalTopicRow 
					key={item.id}
					item={item}
					hasEditPermission={hasEditPermission}
					requestModuleTeamUsers={this.props.requestModuleTeamUsers}
					itemInEditMode={this.state.currentEditRowId == item.id}
					onEditItem={this.onEditItem.bind(this)}
					onSaveItem={this.onSaveItem.bind(this, item.key)}
				/>
            );
        });
        return rows;
    }
	render() {
		if(!this.props.topScreen.crmTeamKey){
			return <h1>לא נבחר צוות פניות הציבור לעיר!</h1>
		}
		return (
			<div className="containerStrip">
				<div className="row panelContent">
					<div className="col-md-8">
						<table className="table table-striped tableNoMarginB tableTight table-scroll">
							<thead>
								<tr>
									<th>תת נושא</th>
									<th>משתמש מטפל</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
                                {this.renderMunicipalRequestSubTopics()}
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


function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
        requestModuleTeamUsers: state.system.requestModuleUsers,
        topScreen: state.elections.citiesScreen.cityPanelScreen.topScreen,
        municipalSubTopicsList: state.elections.citiesScreen.cityPanelScreen.municipalSubTopicsList,
	}
}

export default connect(mapStateToProps)(withRouter(RequestsMunicipalTopicsTable));