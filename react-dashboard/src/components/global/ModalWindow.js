import React from 'react';

/**
 / ModalWindow is a React component for showing a dialog box on the screen.
 / This dialog box will be shown on top of all the other dom elements, and will be centeralized in the screen.
 / It has the following props configuration:
 / show: show or hide the window
 / title: sets the title of the modal. if not exist the default is "הודעה"
 / buttonOk: callback function for OK button click
 / buttonOkText: OK button text to display
 / showCancel: show button cancel
 / buttonCancelText: Cancel button text to display
 / buttonCancel: callback function for Cancel button click
 / buttonX: callback function for x button on modal header
 / overlayClick: callback function for clicking outside of the window
 / disabledOkStatus: enables or disables the Ok button
 / disabledCancelStatus: enables or disables the cancel button
 / buttons: array of objects that represents buttons to show with properties:
 /  {
        class: string - button class,
        iconClass: string - font awesome icon class,
        text: string - button text,
        action: function - callback for button click,
        disabled: boolean - is button diabled
 /  }
 **/

class ModalWindow extends React.Component {

    componentWillUnmount() {
        //return overflow to normal if set to no-overflow
        if (this.props.show) {
            if (document.body.className.includes("no-overflow")) {
                document.body.className = document.body.className.replace("no-overflow", "");
            }
        }
    }

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

    /**
     * Render buttons
     *
     * @return void
     */
    renderButtons() {

        //if buttons props is missing use regular buttons props
        if (this.props.buttons == undefined) {
            this.setDisplayCancel();
            this.setButtonText();
            this.buttons = (
                <div className="modal-footer">
                    <button disabled={this.props.disabledOkStatus} className="btn btn-success" onClick={this.props.buttonOk}><i className="fa fa-check"></i> {this.buttonOkText}</button>
                    <button disabled={this.props.disabledCancelStatus}  className="btn btn-danger" onClick={this.props.buttonCancel} style={this.buttonCancelStyle}><i className="fa fa-times"></i> {this.buttonCancelText}</button>                
                </div>
            );

        //else render buttons according to buttons props
        } else {
            if (Array.isArray(this.props.buttons)) {
                let _this = this;
                let buttonsCount = this.props.buttons.length;
                let renderedButtons = this.props.buttons.map(function(button, i) {
                    return _this.renderSingleButton(button, i, (i == 0));
                })
                this.buttons = (
                     <div className="modal-footer">
                        {renderedButtons}
                     </div>
                )
            } else {
                this.buttons = undefined;
                console.error('buttons props in ModalWindow is not an array of button objects');
            }
        }
    }

    /**
     * Render a single button from buttons array prop
     *
     * @param object button
     * @param integer key
     * @param boolean first
     * @return jsx
     */
    renderSingleButton(button, key, first) {
        //set variables
        let className = (button.class != undefined)? "btn " + button.class : "btn btn-success";
        let icon = "";
        if (button.iconClass != undefined) {
            icon = (
                <i className={"fa " + button.iconClass}></i>
            )
        }
        let buttonText = (button.text != undefined)? " " + button.text : '\u00A0';
        let buttonStyle = (first)? {} : {marginRight: "5px"};

        //return button
        return (
            <button key={key} 
                    disabled={button.disabled} 
                    className={className} 
                    onClick={button.action}
                    style={buttonStyle}>
                    {icon}{buttonText}
            </button>
        );
    }

    render() {
        this.setOverflow();
        this.setDisplay();
        this.setTitle();
        this.renderButtons();
    //    let showModalBody = !this.props.hideModalBody;
        let showClass = (this.props.show ? 'show' : '')
        let modalClass = (this.props.modalClass || '')
        let modalId = (this.props.modalId || '')
        return (
                <div 
                    className={`modal fade ${showClass} ${modalClass}` }
                    id={modalId}
                    tabIndex="-1"
                    aria-hidden="true"
                    style={{display: this.props.show ? 'block' : 'none'}}
                > 
                    <div className="modal-overlay" onClick={this.props.overlayClick}></div>
                    <div className="modal-dialog" style={this.displayStyle}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title">
                                    {this.title}
                                </div>
                                <button
                                    onClick={this.props.buttonX}
                                    type="button"
                                    className="close"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    >
                                    <img src={window.Laravel.baseURL + "Images/polls/close.svg"} aria-hidden="true" />
                                </button>
                            </div>
                            <div className="modal-body">
                                {this.props.children}
                            </div>
                                {this.buttons}
                            </div>
                    </div>
                </div>
                )
    }
}

export default ModalWindow