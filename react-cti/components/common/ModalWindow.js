import React from 'react';

/**
 / ModalWindow is a React component for showing a dialog box on the screen.
 / This dialog box will be shown on top of all the other dom elements, and will be centeralized in the screen.
 / It has the following props configuration:
 / show: show or hide the window
 / title: sets the title of the modal. if not exist the default is "הודעה"
 / buttonOk: callback function for OK button click
 / buttonOkText: OK button text to display
 / buttonCancelText: Cancel button text to display
 / buttonCancel: callback function for Cancel button click
 / buttonX: callback function for x button on modal header
 / overlayClick: callback function for clicking outside of the window
 / disabledOkStatus: enables or disables the Ok button
 **/

class ModalWindow extends React.Component {

    setDisplay() {
        if (this.props.show) {
            this.displayStyle = {
                display: "block"
            }
        } else {
            this.displayStyle = {
                display: "none"
            }
        }
    }
    setTitle() {
        if (this.props.title != undefined) {
            this.title = this.props.title;
        } else {
            this.title = "הודעה";
        }
    }
    setDisplayCancel() {
        if ((this.props.showCancel) || (this.props.buttonCancel != undefined)) {
            this.buttonCancelStyle = {
                marginRight: "5px",
                display: "inline"
            }
        } else {
            this.buttonCancelStyle = {
                marginRight: "5px",
                display: "none"
            }
        }
    }

    /*Quick hack to change render of elements outside of react*/
    setOverflow() {
        if (this.props.show) {
            if (!document.body.className.includes("no-overflow")) {
                document.body.className += "no-overflow";
            }
        } else {
            if (document.body.className.includes("no-overflow")) {
                document.body.className = document.body.className.replace("no-overflow", "");
            }
        }
    }

    setButtonText() {
        this.buttonOkText = (this.props.buttonOkText != undefined)? this.props.buttonOkText : 'אישור';
        this.buttonCancelText  = (this.props.buttonCancelText != undefined)? this.props.buttonCancelText : 'ביטול';
    }

    render() {
        this.setOverflow();
        this.setDisplay();
        this.setTitle();
        this.setDisplayCancel();
        this.setButtonText();
        return (
            <div className="mwindow" style={this.displayStyle}>
                <div className="mwindow-overlay" onClick={this.props.overlayClick}>
                </div>
                <div className="mwindow-container">
                    <div className="mwindow-header">
                        <div className="mwindow-header-title">
                            {this.title}
                        </div>
                        <button type="button" className="close" onClick={this.props.buttonX}>
                            <span>×</span>
                        </button>
                    </div>
                    <div className="mwindow-body">
                        <div className="mwindow-content">
                            {this.props.children}
                        </div>
                        <div className="mwindow-buttons">
                            <button disabled={this.props.disabledOkStatus} className={"btn btn-success"+(this.props.disabledOkStatus?" disabled":"")} onClick={this.props.buttonOk}><i className="fa fa-check"></i> {this.buttonOkText}</button>
                            <button className="btn btn-danger" onClick={this.props.buttonCancel} style={this.buttonCancelStyle}><i className="fa fa-times"></i> {this.buttonCancelText}</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ModalWindow;