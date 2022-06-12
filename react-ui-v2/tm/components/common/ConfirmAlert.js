import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as systemActions from 'tm/actions/systemActions';
import * as portionActions from 'tm/actions/portionActions';
import * as questionnaireActions from 'tm/actions/questionnaireActions';
import * as voterFilterActions from 'actions/VoterFilterActions';
import * as employeeActions from 'tm/actions/employeeActions';

import ModalWindow from 'tm/components/common/ModalWindow';

class ConfirmAlert extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onButtonOkClick = this.onButtonOkClick.bind(this);
        this.onButtonCancelClick = this.onButtonCancelClick.bind(this);
    }

    onButtonOkClick() {
        if(this.props.actionFile)
            this.props[this.props.actionFile][this.props.confirmFuncName](...this.props.params);
        this.props.systemActions.closeConfirmAlert();
    }

    onButtonCancelClick() {
        this.props.systemActions.closeConfirmAlert();
    }

    render() {
        return (
            <ModalWindow
                show={this.props.show}
                title={this.props.messageTitle}
                buttonOk={this.onButtonOkClick}
                buttonCancel={this.props.actionFile ? this.onButtonCancelClick : null}
                buttonX={this.onButtonCancelClick}>
                {this.props.messageText}
            </ModalWindow>
        );
    }
}

ConfirmAlert.propTypes = {
    show: PropTypes.bool.isRequired,
    actionFile: PropTypes.string,
    confirmFuncName: PropTypes.string,
    params: PropTypes.array,
    messageText: PropTypes.string,
    messageTitle: PropTypes.string
};

ConfirmAlert.defaultProps = {
    params: [],
    messageText: 'האם אתה בטוח שברצונך לבצע פעולה זו?',
    messageTitle: 'אזהרה'
};

function mapStateToProps(state, ownProps) {
    return {
        ...state.tm.system.confirmAlert
    };
}

function mapDispatchToProps(dispatch) {
    return {
        systemActions: bindActionCreators(systemActions, dispatch),
        portionActions: bindActionCreators(portionActions, dispatch),
        questionnaireActions : bindActionCreators(questionnaireActions, dispatch),
        voterFilterActions : bindActionCreators(voterFilterActions, dispatch),
        employeeActions : bindActionCreators(employeeActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmAlert);
