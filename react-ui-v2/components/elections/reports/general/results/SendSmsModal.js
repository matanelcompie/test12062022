import React from 'react';
import { connect } from 'react-redux';

import ModalWindow from 'components/global/ModalWindow';

class SendSmsModal extends React.Component {
    constructor(props) {
        super(props);
        this.initState = {
            message: '',
            disableSendBtn: false,
            loading: false,
        }
        this.initConstants();
        this.spinner=<i className="fa fa-spinner fa-pulse fa-fw"></i>;
    }
    componentWillMount(){
        this.state = { ...this.initState };
    }
    initConstants() {
        this.modalTexts = {
            title: 'שליחת הודעה לתושבים',
            buttonOkText: 'שלח',
            buttonCancelText: 'בטל',
            message: 'הכנס טקסט הודעה:',
            votersCounter: 'מספר תושבים:'
        };
    }

    hideModalDialog() {
        if(this.state.disableSendBtn){return;}
        this.props.displaySendSmsModal(false)
    }
    changeMessage(e) {
        let value = e.target.value || ''
        this.setState({ message: value })
    }
    sendSms(){
        this.setState({ disableSendBtn: true, loading:true })
        this.props.sendSms(this.state.message);
    }
    renderVotersCounter() {
        let el = this.spinner;
        if (this.props.votersCounter != null) {
            el = <b> {this.props.votersCounter} </b>;
        }
        return el;
    }
    render() {
        let votersCounterLimited = this.props.votersCounter > 5000
        let disableSendBtn = this.state.disableSendBtn || this.state.message.length < 2 || votersCounterLimited;
        return (
            <ModalWindow show={true}
                buttonX={this.hideModalDialog.bind(this)}
                buttonOk={this.sendSms.bind(this)}
                buttonOkText={this.modalTexts.buttonOkText}
                buttonCancel={this.hideModalDialog.bind(this)}
                buttonCancelText={this.modalTexts.buttonCancelText}
                disabledOkStatus={disableSendBtn}
                disabledCancelStatus={this.state.disableSendBtn}
                title={this.modalTexts.title}>
                <div className="form-group">
                    <label>{this.modalTexts.message}</label><br/>
                    <div>
                        <textarea value={this.state.message} className='form-control' onChange={this.changeMessage.bind(this)} style={{resize:'vertical'}}></textarea>
                    </div>
                    <h2 className="text-primary text-center" style={{ paddingTop: '10px' }}>{this.state.loading ? this.spinner : ''}</h2>
                </div>
                <div className="form-group" >
                    <label>{this.modalTexts.votersCounter} </label> 
                    <span className="text-primary">{this.renderVotersCounter()}</span>
                    { !disableSendBtn  && <h4 className="text-warning"><span>המערכת לא שולחת </span> <b> SMS </b> <span> למספרים שאינם מאופשרים.</span></h4>}
                     {votersCounterLimited && <h4 className="text-danger">הגבלת מערכת! לא ניתן לשלוח ליותר מ <b>5000</b> תושבים!</h4>}
                </div>
            </ModalWindow>
        );
    }
}

function mapStateToProps(state) {
    return {
        votersCounter : state.elections.reportsScreen.generalReport.sendSms.votersCounter,
        // disableSendBtn : state.elections.reportsScreen.generalReport.sendSms.disableSendBtn,
    }
}

export default connect(mapStateToProps)(SendSmsModal);