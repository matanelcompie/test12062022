import React from 'react';

import VoterGroupModal from 'components/global/voterGroupModal/VoterGroupModal';


class GroupUpdate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: false,

            voterGroupModal: {
                show: false
            },

            voterGroup: {
                id: null,
                key: null,
                name: null
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.texts = {
            button: 'בחירת קבוצה לשיוך תושבים',
            noGroup: 'לא נבחרה קבוצה'
        };
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.cleanData && nextProps.cleanData ) {
            let voterGroup = {
                id: null,
                key: null,
                name: null
            };
            this.setState({voterGroup});

            this.props.resetMassUpdateClean('voterGroupData');
        }
    }

    updateCollapseStatus() {
        let collapsed = !this.state.collapsed;

        this.setState({collapsed});
    }

    updateGroupDetails(voterGroupObj) {
        let voterGroup = {...voterGroupObj};
        this.setState({voterGroup});

        this.hideVoterGroupModal();

        let dataObj = {
            voter_group_id: voterGroupObj.id
        };
        this.props.updateMassUpdateData('voterGroupData', dataObj);
    }

    hideVoterGroupModal() {
        let voterGroupModal = this.state.voterGroupModal;

        voterGroupModal.show = false;
        this.setState({voterGroupModal});
    }

    showVoterGroupModal() {
        let voterGroupModal = this.state.voterGroupModal;

        voterGroupModal.show = true;
        this.setState({voterGroupModal});
    }

    getBlockGroupNameText() {
        if ( this.state.voterGroup.id != null ) {
            return this.state.voterGroup.name;
        } else {
            return this.texts.noGroup;
        }
    }

    render() {
        return (
            <div className="ContainerCollapse voter-group-update">
                <a data-toggle="collapse" onClick={this.updateCollapseStatus.bind(this)} aria-expanded={this.state.collapsed}
                   aria-controls="collapseExample">
                    <div className="row panelCollapse">
                        <div className="collapseArrow closed"/>
                        <div className="collapseArrow open"/>
                        <div className="collapseTitle">עדכון קבוצה</div>
                    </div>
                </a>

                <div className={"voter-group-mass-update" + (this.state.collapsed ? "" : " hidden")}>
                    <div className="row CollapseContent padding-right-35">
                        <div className="col-lg-3">
                            <button type="submit" className="btn btn-primary" onClick={this.showVoterGroupModal.bind(this)}>
                                {this.texts.button}
                            </button>
                        </div>
                        <div className="col-lg-3">{this.getBlockGroupNameText()}</div>
                    </div>
                </div>

                <VoterGroupModal show={this.state.voterGroupModal.show} hideModal={this.hideVoterGroupModal.bind(this)}
                                 updateGroupDetails={this.updateGroupDetails.bind(this)} allowAddNewGroup={true} />
            </div>
        );
    }
}

export default GroupUpdate;