import React from 'react';
import Combo from '../../../components/global/Combo';



class TeamRequestsTopicRow extends React.Component {

	constructor(props) {
        super(props);
        this.state = {
            currentEditRowId: null,
            userHandler: {id: null,name: ''},
            topic: {id: null,name: ''},
            subTopic: {id: null,name: '', key: null},
            subTopicsList:[]
        }
    }

    componentWillMount(){
        this.setStateFromProps(this.props);
    }
    componentWillReceiveProps(nextProps){
        if(this.props.itemInEditMode != nextProps.itemInEditMode){
            this.setStateFromProps(nextProps)
        }
        if(JSON.stringify(this.props.item) != JSON.stringify(nextProps.item.user_handler_id)){
            this.setStateFromProps(nextProps)
        }
    }
    setStateFromProps(nextProps){
        let mainTopicsHash = nextProps.mainTopicsHash;
        let item = nextProps.item; 

        let mainTopic =  mainTopicsHash[item.parent_id];
        let userHandler = {id: item.user_handler_id, name: item.user_handler_name}
        let subTopic = {id: item.id, name: item.name, key: item.key}
        let topic = mainTopic ? {id: mainTopic.id, name: mainTopic.name} : {id: null, name:''}

        let newState = {...this.state};
        newState.userHandler = userHandler;
        newState.topic = topic;
        newState.subTopic = subTopic;

        this.setSubTopicsList(newState, nextProps, topic.id);
        this.setState(newState)
    }
    setSubTopicsList(newState, nextProps, topicId){
        let allTopicsHash = nextProps.allTopicsHash;
        let subTopicsList = (topicId && allTopicsHash[topicId]) ? allTopicsHash[topicId] : [];
        newState.subTopicsList = subTopicsList;
    }
    comboItemChange(fieldName, e ){
        let selectedItem = e.target.selectedItem;

        let newObj = { name: e.target.value, id: null }

        if(selectedItem){ newObj = selectedItem; } 

        let newState = { ...this.state}
        newState[fieldName] = newObj

        if(fieldName == 'topic'){
            this.setSubTopicsList(newState, this.props, newObj.id);
            newState.subTopic = {id: null, name:'', key: null};
        }
   
        this.setState(newState)
    }
    saveRow(){
        this.props.onSaveItem(this.state.subTopic.key, this.state.userHandler.id, this.props.item.request_topic_user_id);
    }
    editRow(itemId){
        this.props.onEditItem(itemId);
    }
    renderEditMode(){
        const mainTopicsList = this.props.allTopicsHash[0];
        let mainTopicName = this.state.topic.name;
        let subTopicName = this.state.subTopic.name;
        return (
            <tr>
                {/* For municipal topic */}
                {this.props.isMunicipalRow && <td>{mainTopicName}</td>}
                {this.props.isMunicipalRow && <td>{subTopicName}</td>}

                {/* For non municipal topic */}
                {!this.props.isMunicipalRow && <td><Combo items={mainTopicsList}  defaultValue={mainTopicName} value={mainTopicName}
                    onChange={this.comboItemChange.bind(this, 'topic')}  className="form-combo-table" itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} /> 
                </td> }
                {!this.props.isMunicipalRow && <td><Combo items={this.state.subTopicsList}  defaultValue={subTopicName} value={subTopicName}
                    onChange={this.comboItemChange.bind(this, 'subTopic')}  className="form-combo-table" itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} /> 
                </td> }

                <td><Combo items={this.props.requestModuleTeamUsers} defaultValue={this.state.userHandler.name} value={this.state.userHandler.name} 
                    onChange={this.comboItemChange.bind(this, 'userHandler')}  className="form-combo-table" itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} /> 
                </td>
                <td style={{textAlign: 'left', paddingLeft:'15px'}}>
                    <span className="edit-buttons">
                        <button type="button" className="btn btn-success btn-xs" onClick={this.saveRow.bind(this)}><i className="fa fa-floppy-o"></i></button>
                        {'\u00A0'}
                        <button className="btn btn-danger btn-xs"onClick={this.editRow.bind(this, null)}><i className="fa fa-times"/></button>
                    </span>
                </td>
            </tr>
        )
    }
    renderDisplayMode(){
        const item = this.props.item;
        let mainTopicName = this.state.topic.name;
        let subTopicName = this.state.subTopic.name;
		return (
            <tr>
                <td>{mainTopicName}</td>
                <td>{subTopicName}</td>
                <td>{this.state.userHandler.name}</td>
                <td style={{textAlign: 'left', paddingLeft:'15px'}}>
                    <span className={"edit-buttons"}>
                        <button type="button" className={"btn btn-success btn-xs"} onClick={this.editRow.bind(this, item.id)} >
                            <i className="fa fa-pencil-square-o"></i>
                        </button>
                    </span>
                </td>
            </tr>
		);
    }
	render() {
        if(this.props.itemInEditMode ){
            return this.renderEditMode()
        }else{
            return this.renderDisplayMode();
        }

	}
}



export default TeamRequestsTopicRow;