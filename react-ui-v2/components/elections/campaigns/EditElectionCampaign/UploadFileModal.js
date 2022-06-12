import React from 'react';
import { connect } from 'react-redux';

import ModalWindow from 'components/global/ModalWindow';

import * as ElectionsActions from 'actions/ElectionsActions';


class UploadFileModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            formFields: {
                file: null
            },

            buttons: [
                {
                    class: 'btn new-btn-default btn-secondary pull-right',
                    text: 'ביטול',
                    action: this.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text:  'שמירה',
                    action: this.uploadFileToServer.bind(this),
                    disabled: true
                }
            ]
        };

        this.initConstants();
    }

    initConstants() {
        this.style = {position: 'absolute', clip: 'rect(0px, 0px, 0px, 0px)'};

        this.invalidColor = '#cc0000';
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.progressBar.loaded && nextProps.progressBar.loaded ) {
            this.hideModal();
        }
    }

    resetState() {
        let formFields = this.state.formFields;
        let buttons = this.state.buttons;

        formFields.file = null;
        buttons[1].disabled = true;
        this.setState({formFields, buttons});

        this.props.dispatch({type: ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.PROGRESS_BAR.RESET_PROGRESS_BAR});
    }

    uploadFileToServer() {
        let buttons = this.state.buttons;
        buttons[1].disabled = true;
        this.setState({buttons});

        this.props.uploadFileToServer(this.state.formFields);
    }

    hideModal() {
        this.resetState();
        this.props.hideUploadModal();
    }

    getFileExtention(fileName) {
        let fileArr = fileName.split('.');

        return fileArr[1];
    }

    getFileName() {
        if ( this.state.formFields.file == null ) {
            return '\u00A0';
        } else {
            return this.state.formFields.file.name;
        }
    }

    fileChange(event) {
        var file = null;
        let formFields = this.state.formFields;
        let buttons = this.state.buttons;

        if (event.target.files != undefined ) {
            file = event.target.files[0];
        }

        if ( file != undefined ) {
            formFields.file = file;

            if ( this.getFileExtention(file.name) == this.props.fileType ) {
                buttons[1].disabled = false;
            } else {
                buttons[1].disabled = true;
            }
        } else {
            formFields.file = null;
            buttons[1].disabled = true;
        }
        this.setState({formFields, buttons});
    }

    validateVariables() {
        if ( this.state.formFields.file == null || this.getFileExtention(this.state.formFields.file.name) != this.props.fileType ) {
            this.fileInputStyle = { borderColor: this.invalidColor };
        }
    }

    initVariables() {
        this.fileInputStyle = {};
    }

    render() {
        this.initVariables();
        this.validateVariables();

        return (
            <ModalWindow show={this.props.show} buttonX={this.hideModal.bind(this)}
                         title="העלאת קובץ" style={{zIndex: '9001'}} buttons={this.state.buttons}>
                <form>
                    <div className="row containerStrip" style={{borderBottom: 'none'}}>
                        <div className="form-group">
                            <label htmlFor="fileA" className="col-xs-2 control-label nopadding include-files">צרף קובץ</label>
                            <div className="FileUploaderRow col-xs-10 nopadding">
                                <input title="עיון" type="file" id="fileA" className="filestyle " data-buttonbefore="true" 
                                       onChange={this.fileChange.bind(this)} multiple="" tabIndex="-1"
                                       style={this.style}/>
                                <div className="bootstrap-filestyle input-group">
                                    <span className="group-span-filestyle input-group-btn" tabIndex="0">
                                        <label htmlFor="fileA" className="btn new-btn-default ">
                                            <span className="icon-span-filestyle glyphicon glyphicon-folder-open"/>
                                            <span className="buttonText">עיון...</span>
                                        </label>
                                    </span>
                                    <input type="text" className="form-control" style={this.fileInputStyle} value={this.getFileName()}
                                           disabled={true}/>
                                </div>
                                <div className="BoxButtonClose "/>
                            </div>
                        </div>
                    </div>
                </form>

                { this.props.progressBar.loading &&
                <div className="row contentContainer loadingStatus">
                    <div className="col-lg-3">
                        <h3>סטטוס טעינה
                            <span className="loadingStatusCounter">
                                {(this.props.progressBar.percents > 0) ? (this.props.progressBar.percents + "%") : "טוען"}
                            </span>
                        </h3>
                    </div>
                    <div className="col-lg-9">
                        {(this.props.progressBar.percents > 0) &&
                        <div className="progress">
                            <div className="progress-bar progress-bar-info progress-bar-striped active" role="progressbar"
                                 aria-valuenow="54" aria-valuemin="0" aria-valuemax="100"
                                 style={{ width: this.props.progressBar.percents + "%" }}/>
                        </div>
                        }
                    </div>
                </div>
                }
            </ModalWindow>
        );
    }
}

function mapStateToProps(state) {
    return {
        progressBar: state.elections.electionsCampaignsScreen.progressBar
    };
}

export default connect(mapStateToProps) (UploadFileModal);