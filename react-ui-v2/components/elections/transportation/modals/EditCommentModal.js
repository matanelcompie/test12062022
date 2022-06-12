import React from 'react';
import ModalWindow from 'components/global/ModalWindow';

class EditCommentModal extends React.Component {
    initState = { commentText: '' }
    constructor(props) {
        super(props);
        this.modalTitle = 'עריכת הערה לתושב';

        this.state = { ...this.initState };
    }
    onModalClose(){
        this.setState({ commentText: '' });
        this.props.onModalClose();
    }
    onCommentChange(e){
        this.setState({ commentText: e.target.value })
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.commentText && this.state.commentText != nextProps.commentText) {
            this.initalCommentText = nextProps.commentText;
            this.setState({ commentText: nextProps.commentText })
        }
    }

    render() {
        this.notVaildForm = this.state.commentText.length == 1  || this.initalCommentText == this.state.commentText;
        return (
            <ModalWindow show={this.props.showModal}
                buttonOk={this.props.saveNewComment.bind(this, this.state.commentText)}
                buttonCancel={this.onModalClose.bind(this)}
                buttonX={this.onModalClose.bind(this)}
                disabledOkStatus={this.notVaildForm}
                style={{ zIndex: '9001' }}
                title={this.modalTitle}
            >
                <div className="modal-body" style={{ padding: '35px', width: '450px' }}>
                    <input type="text" className="form-control" value={this.state.commentText} onChange={this.onCommentChange.bind(this)} />
                </div>
            </ModalWindow>
        )
    }
}

export default EditCommentModal;