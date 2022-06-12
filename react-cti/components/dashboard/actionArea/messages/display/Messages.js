import React from 'react';
import { connect } from 'react-redux';

import { isMobilePhone, checkKosherPhone, validateEmail } from '../../../../../libs/globalFunctions';

import ComboSelect from '../../../../common/ComboSelect';

import * as uiActions from '../../../../../actions/uiActions';


class Messages extends React.Component {
    constructor(props) {
        super(props);

        this.actions = {
            link: 'link',
            sms: 'sms',
            email: 'email'
        };

        this.actionOverStyle = {
            color: '#eee',
            backgroundColor: '#9ea9b7'
        };

        this.state = {
            iframeSrc: null,
            iframeTitle: null,

            selectedFile: {
                sharable: false,
                url: null
            },

            actionOver: null
        };

        this.initConstants();
    }

    initConstants() {
        this.buttonsTitles = {
            sms: 'שלח קישור sms',
            email: 'שלח קישור בדוא"ל',
            link: 'הורד את הקובץ'
        };

        this.previewableFiles = require('../../../../../libs/constants').previewableFiles;
    }

    componentWillMount() {
        this.files = this.props.campaignFiles.map( function(item, index) {
            return {value: item.id, label: item.name};
        });

        if (this.props.campaignFiles.length > 0) {
            let fileType = this.props.campaignFiles[0].file_type;
            let fileSharable = (this.props.campaignFiles[0].shareable == 1) ? true : false;
            let fileUrl = '';

            if (this.props.campaignFiles[0].link != null) {
                fileUrl = this.props.campaignFiles[0].link;
            } else {
                fileUrl = window.Laravel.baseURL + 'campaigns/files/' + this.props.campaignFiles[0].key;
            }

            this.setState({selectedFile: {sharable: fileSharable, url: fileUrl}});

            if ( this.previewableFiles[fileType] ) {
                this.setState({iframeSrc: fileUrl});
                this.setState({iframeTitle: this.props.campaignFiles[0].name});
            }

            uiActions.changeCampaignFile(this.props.dispatch, this.props.campaignFiles[0].id);
        }
    }

    /**
     * This function resets the pointer
     * when mouse is out of the action button.
     */
    mouseOutAction() {
        this.setState({actionOver: null});
    }

    /**
     * This function updates the pointer
     * of the action button that the mouse
     * is over it.
     *
     * @param actionName
     */
    mouseOverAction(actionName) {
        this.setState({actionOver: actionName});
    }

    /**
     *  This function gets all the non-kosher
     *  mobile phones of a voter.
     *
     * @returns {Array}
     */
    getPhones() {
        let currentPhoneIndex = -1;
        let phones = [];
        let phoneToCheck = '';

        currentPhoneIndex = this.props.phones.findIndex(phoneItem => phoneItem.id == this.props.current_phone.id);

        phoneToCheck = this.props.current_phone.phone_number.split('-').join('');
        if ( isMobilePhone(phoneToCheck) && !checkKosherPhone(phoneToCheck)
            && this.props.phones[currentPhoneIndex].sms == 1 ) {
            phones.push(this.props.current_phone.phone_number);
        }

        for ( let phoneIndex = 0; phoneIndex < this.props.phones.length; phoneIndex++ ) {
            if ( phoneIndex != currentPhoneIndex ) {

                phoneToCheck = this.props.phones[phoneIndex].phone_number.split('-').join('');
                if ( isMobilePhone(phoneToCheck) && !checkKosherPhone(phoneToCheck) && this.props.phones[phoneIndex].sms == 1 ) {
                    phones.push(this.props.phones[phoneIndex].phone_number);
                }
            }
        }

        return phones;
    }

    /**
     * Sending a sharble file by email
     *
     */
    sendLinkByEmail() {
        let fileIndex = this.getFileIndex(this.props.selectedFile);
        let subject = "קישור לקובץ: ";
        let fileUrl = window.Laravel.baseURL + 'files/' + this.props.campaignFiles[fileIndex].share_key + '/download';

        subject += this.props.campaignFiles[fileIndex].name;

        if ( this.props.voterEmail.length > 0 && validateEmail(this.props.voterEmail) ) {
            uiActions.changeSendEmailInputField(this.props.dispatch, 'email', this.props.voterEmail);
        }

        uiActions.changeSendEmailInputField(this.props.dispatch, 'subject', subject);
        uiActions.changeSendEmailInputField(this.props.dispatch, 'message', fileUrl);

        uiActions.showSendEmailModal(this.props.dispatch);
    }

    /**
     * Sending a sharble file by sms
     *
     */
    sendLinkBySms() {
        let phones = this.getPhones();
        let fileIndex = this.getFileIndex(this.props.selectedFile);
        let message = "קישור לקובץ: ";
        let fileUrl = window.Laravel.baseURL + 'files/' + this.props.campaignFiles[fileIndex].share_key + '/download';

        message += this.props.campaignFiles[fileIndex].name + ' ' + fileUrl;

        uiActions.changeSmsInputField(this.props.dispatch, 'phones', phones);
        uiActions.changeSmsInputField(this.props.dispatch, 'message', message);

        uiActions.showSendSmsModal(this.props.dispatch);
    }

    downloadFile() {
        window.open(this.state.selectedFile.url, '_blank');
    }

    getFileIndex(fileId) {
        let fileIndex = -1;

        fileIndex = this.props.campaignFiles.findIndex(fileItem => fileItem.id == fileId);

        return fileIndex;
    }

    fileChange(event) {
        let fileId = event.target.value;
        let fileIndex = -1;
        let fileType = '';
        let fileUrl = '';
        let fileSharable = false;

        this.setState({iframeSrc: null});
        this.setState({iframeTitle: null});
        this.setState({selectedFile: {sharable: false, url: null}});

        uiActions.changeCampaignFile(this.props.dispatch, fileId);

        if ( fileId != null ) {
            fileIndex = this.getFileIndex(fileId);
            fileSharable = (this.props.campaignFiles[fileIndex].shareable == 1) ? true : false;
            fileType = this.props.campaignFiles[fileIndex].file_type;

            if (this.props.campaignFiles[fileIndex].link != null) {
                // external file.
                fileUrl = this.props.campaignFiles[fileIndex].link;
            } else {
                fileUrl = window.Laravel.baseURL + 'campaigns/files/' + this.props.campaignFiles[fileIndex].key;
            }

            this.setState({selectedFile: {sharable: fileSharable, url: fileUrl}});

            // Checking if a file can be viewed in iframe
            // such as: pdf, txt, png.
            if ( this.previewableFiles[fileType] ) {
                this.setState({iframeSrc: fileUrl});
                this.setState({iframeTitle: this.props.campaignFiles[fileIndex].name});
            }
        }
    }

    /**
     * This function renders the preview block;
     *
     * @returns {*}
     */
    renderPreviewBlock() {
        if ( this.state.iframeSrc != null ) {
            return (
                <iframe title={this.state.iframeTitle}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        src={this.state.iframeSrc}/>
            );
        } else {
            return [
                <i key="preview0" className="fa fa-eye" aria-hidden="true"/>,
                <div key="preview1" className="messages__preview-text">PREVIEW</div>
            ];
        }
    }

    render() {
        let sharable = false;
        let shareButtonClass = "call-actions__btn messages__actions-btn";
        let linkButtonClass = "call-actions__btn messages__actions-btn";
        let previewStyle = {marginTop: '0'};

        let smsButtonStyle = {};
        let emailButtonStyle = {};
        let linkButtonStyle = {};

        if ( this.state.iframeSrc != null ) {
            previewStyle.marginTop = '15px';
        } else {
            previewStyle.marginTop = '132px';
        }

        if ( !this.state.selectedFile.sharable ) {
            shareButtonClass = "call-actions__btn messages__actions-btn messages__non-sharable-button";
        } else {
            if (this.state.actionOver == this.actions.sms ) {
                smsButtonStyle = this.actionOverStyle;
            } else if (this.state.actionOver == this.actions.email) {
                emailButtonStyle = this.actionOverStyle;
            }
        }

        if ( this.props.selectedFile == "" || this.props.selectedFile == null ) {
            linkButtonClass = "call-actions__btn messages__actions-btn messages__non-sharable-button";
        } else {
            if (this.state.actionOver == this.actions.link ) {
                linkButtonStyle = this.actionOverStyle;
            }
        }

        return (
            <div className="messages">
                <div className="messages__files-names">
                    <ComboSelect
                        value={this.props.selectedFile}
                        name="campaignFile"
                        options={this.files}
                        itemDisplayProperty="label"
                        itemIdProperty="value"
                        onChange={this.fileChange.bind(this)}
                    />
                </div>

                <div className="action-content">
                    <div className="messages__actions">
                        <div className="messages__actions-buttons">
                            <div className={linkButtonClass} style={linkButtonStyle}
                                 onMouseOver={this.mouseOverAction.bind(this, this.actions.link)}
                                 onMouseOut={this.mouseOutAction.bind(this)}>
                                <i className="fa fa-link" title={this.buttonsTitles.link}
                                   onClick={this.downloadFile.bind(this)} aria-hidden="true"/>
                            </div>

                            <div className={shareButtonClass} style={emailButtonStyle}
                                 onMouseOver={this.mouseOverAction.bind(this, this.actions.email)}
                                 onMouseOut={this.mouseOutAction.bind(this)}>
                                <i className="fa fa-envelope" title={this.buttonsTitles.email}
                                   onClick={this.sendLinkByEmail.bind(this)} aria-hidden="true"/>
                            </div>

                            <div className={shareButtonClass} style={smsButtonStyle}
                                 onMouseOver={this.mouseOverAction.bind(this, this.actions.sms)}
                                 onMouseOut={this.mouseOutAction.bind(this)}>
                                <i className="fa fa-commenting fa-flip-horizontal" title={this.buttonsTitles.sms}
                                   onClick={this.sendLinkBySms.bind(this)} aria-hidden="true"/>
                            </div>
                        </div>
                    </div>

                    <div className="messages__preview" style={previewStyle}>
                        {this.renderPreviewBlock()}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        campaignFiles: state.campaign.files,
        selectedFile: state.ui.campaignMessages.selectedFile,
        current_phone: state.call.activeCall.voter.current_phone,
        phones: state.call.activeCall.voter.phones,
        voterEmail: state.call.activeCall.voter.email
    }
}

export default connect(mapStateToProps) (Messages);