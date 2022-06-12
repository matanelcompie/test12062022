import React from 'react';
import * as GlobalActions from '../../actions/GlobalActions';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {dateTimeReversePrint} from '../../libs/globalFunctions';
import { Link } from 'react-router';
import MessageType from '../../Enums/MessageType';
import MessageDirection from '../../Enums/MessageDirection';


/**
 / ModalWindow is a React component for showing a dialog box on the screen.
 / This dialog box will be shown on top of all the other dom elements, and will be centeralized in the screen.
 / It has the following props configuration:
 / show: show or hide the window
 / title: sets the title of the modal. if not exist the default is "הודעה"
 / buttonOk: callback function for OK button click
 / buttonCancel: callback function for Cancel button click
 / overlayClick: callback function for clicking outside of the window
 / disabledOkStatus: enables or disables the Ok button
 **/

class Messages extends React.Component {

    initVariables() {
        this.tableHeaders = {
            displayMessageTitle: 'פרטי ההודעה',
            messageHeaderTitle: 'תוכן ההודעה',
        }
    }

    showDetailsClick(index, e) {
        this.props.dispatch({type: GlobalActions.ActionTypes.MESSAGES.OPEN_GLOBAL_DIALOG, header: this.tableHeaders.messageHeaderTitle, content: this.props.list[index].body ,
		messageDateTime: dateTimeReversePrint(this.props.list[index].date, true),
		title:this.props.list[index].subject});
    }

    render() {
        this.initVariables();
        let messageTRlist = null;
        if(Array.isArray(this.props.list)){
            messageTRlist = this.props.list.map(function (reqMessage, i) {
               // if(this.props.showRequestLink){
                    return <tr id={i} key={i}>
                    <td style={{width:'100px'}}>
                        {reqMessage.type==MessageType.MESSAGE_TYPE_SMS?<div><i className="fa fa-phone" aria-hidden="true"></i> {'\u00A0'}<b>SMS</b></div>:''}
                        {reqMessage.type==MessageType.MESSAGE_TYPE_IVR?<div><i className="fa fa-phone" aria-hidden="true"></i> {'\u00A0'}<b>IVR</b></div>:''}
                        {reqMessage.type==MessageType.MESSAGE_TYPE_EMAIL?<div><i className="fa fa-envelope-o" aria-hidden="true">{'\u00A0'}</i><b>EMAIL</b></div>:''}
                    </td>
                    <td>{dateTimeReversePrint(reqMessage.date, true)}</td>
                    <td>
                    {reqMessage.direction==MessageDirection.MESSAGE_DIRECTION_OUT?<div style={{display:'flex'}}><div className="imageCallOut" aria-hidden="true"></div> {'\u00A0'}<b style={{color:'#5098c6'}}>יוצא</b></div>:''}
                    {reqMessage.direction==MessageDirection.MESSAGE_DIRECTION_IN?<div style={{display:'flex'}}><div className="imageCallIn" aria-hidden="true"></div> {'\u00A0'}<b style={{color:'rgb(107 186 46)'}}>נכנס</b></div>:''}
                    </td>
                    <td>{reqMessage.voter_communication_details}</td>
                    {this.props.showRequestLink?<td><Link to={"/crm/requests/" + reqMessage.reqKey}>{reqMessage.entity_type == 1 ? reqMessage.reqKey:''}</Link></td>:''}
                    <td>{reqMessage.type==MessageType.MESSAGE_TYPE_SMS || reqMessage.type==MessageType.MESSAGE_TYPE_IVR?
                    <i style={{opacity:'0.5'}}>לא מוגדר כותרת לסוג הודעה זו</i>
                    :reqMessage.subject}
                    </td>
                    <td>
                        <button className={'btn btn-primary'+(true == this.props.messageContentShow?'':' hidden')} onClick={this.showDetailsClick.bind(this, i)}>{this.tableHeaders.displayMessageTitle}</button>
                    </td>
                </tr>
            }, this);
        }
        
        return (<tbody ref="scrollTableBody" style={{height: '400px'}}>{messageTRlist}</tbody>)
        }
    }

    function mapStateToProps(state) {
        return {
            loaded_messages_of_entity: state.global.messages_screen.loaded_messages_of_entity,
            loading_messages_of_entity: state.global.messages_screen.loading_messages_of_entity
        }
    }

    export default connect(mapStateToProps)(withRouter(Messages));