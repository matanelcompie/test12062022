import React from 'react';
import ModalWindow from '../../global/ModalWindow';


class UserRequestTopicsModal extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            userRequestTopics: [],
            showDeleteModal: false,
            rowToDelete: null,
		}
    }
    componentDidUpdate(nextProps){

		if(JSON.stringify(this.props.userRequestTopics) != JSON.stringify(nextProps.userRequestTopics)){
			this.setState({userRequestTopics: this.props.userRequestTopics})
		}
    }
    removeTopicFormUser(){
        this.props.removeTopicFormUser(this.state.rowToDelete.request_topic_user_id)
        this.displayDeleteModal(false)
    }
    displayDeleteModal(bool, row = null){
        this.setState({showDeleteModal: bool, rowToDelete: row})
    }
	render(){
		let userRequestTopicsRows = this.state.userRequestTopics.map((userTopic) => {
			return (
				<tr key={userTopic.request_topic_id}>
					<td>{userTopic.topic_name}</td>
					<td>{userTopic.sub_topic_name}</td>
					<td><button type="button" className="btn btn-danger btn-md" onClick={this.displayDeleteModal.bind(this, true, userTopic)}><i className="fa fa-trash-o"></i></button></td>
				</tr>
			)
        })
        let rowToDelete = this.state.rowToDelete;
		return (
            <div>
                <ModalWindow
                    show={this.props.showUserTopicsModal}
                    title='נושאים המשוייכים למשתמש'
                    buttonOk={this.props.displayUserTopicsModal.bind(this, false)}
                    buttonCancel={this.props.displayUserTopicsModal.bind(this, false)}
                    buttonX={this.props.displayUserTopicsModal.bind(this, false)}
                >
                <table className="table table-bordered table-striped table-hover" style={{minWidth: '600px'}}>
                    <thead>
                        <tr>
                            <th>נושא</th>
                            <th>תת נושא</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {userRequestTopicsRows}
                    </tbody>
                </table>
                </ModalWindow>
                <ModalWindow
                    show={this.state.showDeleteModal}
                    title='האם את בטוח?'
                    buttonOk={this.removeTopicFormUser.bind(this)}
                    buttonCancel={this.displayDeleteModal.bind(this, false)}
                    buttonX={this.displayDeleteModal.bind(this, false)}
                >
                    { rowToDelete &&
                        <h3 className="text-warning">
                            נושא: <b>{rowToDelete.sub_topic_name}</b> ב <b>{rowToDelete.topic_name}</b> הולך להישאר ללא משתשמש מטפל!
                    </h3>
                    }
                </ModalWindow>
            </div>

            
    	);
	}
}
export default UserRequestTopicsModal;