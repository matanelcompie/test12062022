import React from 'react';
import Combo from '../../../../global/Combo';



class RequestsMunicipalTopicsRow extends React.Component {

	constructor(props) {
        super(props);
        this.state ={
            currentEditRowId: null,
            UserHandler: {
                id: null,
                name: '',
            },
        }
        this.state.userHandler = {...this.state.originalUserHandler};
    }
    componentWillMount(){
        if(this.props.item.user_handler_id){
            let userHandler = {id: this.props.item.user_handler_id, name: this.props.item.user_handler_name}
            this.setState({userHandler: {...userHandler}, originalUserHandler: {...userHandler}})
        }
    }
    componentWillReceiveProps(nextProps){
        if(this.props.itemInEditMode != nextProps.itemInEditMode){
            this.setState({userHandler: { ...this.state.originalUserHandler }})
        }
        if(this.props.item.user_handler_id != nextProps.item.user_handler_id){
            let userHandler = {id: nextProps.item.user_handler_id, name: nextProps.item.user_handler_name}
            this.setState({userHandler: {...userHandler}, originalUserHandler: {...userHandler}})
        }
    }
    comboItemChange(e){
        let selectedItem = e.target.selectedItem;

        let userHandler = { name: e.target.value, id:null }
        if(selectedItem){
            userHandler = selectedItem;
        } 
        this.setState({userHandler})
    }
    saveRow(){
        this.setState({ originalUserHandler: {...this.state.userHandler}})

        this.props.onSaveItem(this.state.userHandler.id);
    }
    editRow(itemId){
        this.props.onEditItem(itemId);
    }
    renderEditMode(){
        const item = this.props.item;
        return (
            <tr>
                <td>{item.name}</td>

                <td><Combo items={this.props.requestModuleTeamUsers} defaultValue={this.state.userHandler.name} 
                    onChange={this.comboItemChange.bind(this)}  className="form-combo-table" itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} /> 
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

		return (
            <tr>
                <td>{item.name}</td>
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
        if(this.props.itemInEditMode && this.props.hasEditPermission){
            return this.renderEditMode()
        }else{
            return this.renderDisplayMode();
        }

	}
}



export default RequestsMunicipalTopicsRow;