import React from 'react';

import ModalWindow from 'components/global/ModalWindow';


class AlertUpdateMotivatorModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            buttons: [
                {
                    class: 'btn btn-default btn-secondary pull-right',
                    text: 'סגור',
                    action: this.props.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text: 'המשך',
                    action: this.updateActivistRoleCluster.bind(this),
                    disabled: false
                }
            ]
        };
    }

    updateActivistRoleCluster() {
        this.props.updateActivistRoleCluster(this.props.clusterKey);
    }

    getActivistName() {
        let name = ' ל';

        name += this.props.activistDetails.first_name + ' ' + this.props.activistDetails.last_name;

        return name;
    }

    getClusterText() {
        let clusterText = 'אשכול ';

        clusterText += this.props.clusterName + ' שובץ';
    }

    getPersonalIdentity() {
        return 'ת.ז ' + this.props.activistDetails.personal_identity;
    }

    render() {
        return (
            <ModalWindow show={this.props.show} buttonX={this.props.hideModal.bind(this)}
                         title="אישור שיבוץ" style={{zIndex: '9001'}} buttons={this.state.buttons}>
                <div className="TitleRow">
                    <p>{this.getClusterText()} <strong>{this.getActivistName()}</strong></p>
                    <p>
                        <strong>{this.getPersonalIdentity()}</strong>
                    </p>
                </div>
            </ModalWindow>
        );
    }
}

export default AlertUpdateMotivatorModal;