import React from 'react';

import ModalWindow from '../../../../global/ModalWindow';

class UpdateMultiSubTopicsModal extends React.Component {

    componentWillMount(){
        this.state = {
            selectedTopics: {}
        }
    }

    updateMultiSubTopics(){
        let selectedTopicsKeys = Object.keys(this.state.selectedTopics);
        selectedTopicsKeys.push(this.props.currentTopicKey);
        this.props.updateMultiSubTopics(selectedTopicsKeys);
        this.setState({selectedTopics: {}})
    }
    inputCheckboxChange(itemKey){
        let selectedTopics = {...this.state.selectedTopics}
        if(selectedTopics[itemKey]) {
           delete(selectedTopics[itemKey]); 
        }else {
            selectedTopics[itemKey] = true;
        }
        this.setState({selectedTopics})
    }
    requestSubTopicRows(){
        let requestSubTopics = this.props.requestSubTopics.filter(item => {return item.key != this.props.currentTopicKey})
        let rows = requestSubTopics.map(item => {
            return (
                <tr key={item.key}> 
                    <td>
                        <label><input type="checkbox" checked={this.state.selectedTopics[item.key] || false} onChange={this.inputCheckboxChange.bind(this, item.key)} /></label>
                    </td>
                    <td>{item.name}</td>
                    <td>{item.user_handler_name}</td>
                </tr>
            );
        });
        return rows;
    }
    renderSubTopicsTable(){
        return (
          <div className="row">
            <div className="col-md-12">
              <table className="table table-bordered table-striped table-hover" style={{minWidth: '600px'}}>
                <thead>
                    <tr>
                        <th></th>
                        <th>שם</th>
                        <th>משתמש מטפל</th>
                    </tr>
                </thead>
                <tbody>
                  {this.requestSubTopicRows()}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
    componentWillUnmount(){
        this.setState({selectedTopics: {}})
    }
    render(){
        return (
            <ModalWindow show={this.props.show} buttonOk={this.updateMultiSubTopics.bind(this)} title={'האם תהיה מעוניין לשייך גם את הנושאים האלו למשתמש?'}
                buttonCancel={this.props.displayUpdateSubTopicsModal.bind(this, false)}  buttonX={this.props.displayUpdateSubTopicsModal.bind(this, false)}>
                <div>
                    {this.renderSubTopicsTable()}
                </div>
            </ModalWindow>
        )
    }
}

export default UpdateMultiSubTopicsModal;
