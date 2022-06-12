import React from 'react';
import { connect } from 'react-redux';

import FileItem from './FileItem';
import ElectionRoleItem from './ElectionRoleItem';
import EditRoleModal from './EditRoleModal';

import * as ElectionsActions from 'actions/ElectionsActions';


class Budget extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editRoleModal: {
                show: false,
                electionRoleItem: null
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.uploadButtonText = "העלאת קובץ";
    }

    componentWillMount() {
        ElectionsActions.loadCampaignBudgetFiles(this.props.dispatch, this.props.campaignKey);
        ElectionsActions.loadElectionRolesForElectionsCampaigns(this.props.dispatch);
        ElectionsActions.loadElectionRolesCampaignBudget(this.props.dispatch, this.props.campaignKey);
    }

    editRole(electionRoleShiftKey, formFields) {
        let electionRoleId = this.state.editRoleModal.electionRoleItem.election_role_id;
        ElectionsActions.editCampaignElectionRoleBudget(this.props.dispatch, this.props.campaignKey, electionRoleShiftKey, electionRoleId, formFields);
    }

    hideEditRoleModal() {
        let editRoleModal = this.state.editRoleModal;

        editRoleModal.show = false;
        editRoleModal.electionRoleItem = null;
        this.setState({editRoleModal});


    }

    showEditRoleModal(editItem) {
        let editRoleModal = { ...this.state.editRoleModal};

        if ( editItem.key ) {
            editRoleModal.show = true;
            editRoleModal.electionRoleItem = editItem;
            this.setState({editRoleModal});
        }
    }

    renderFiles() {
        let that = this;
        let downloadPermission = (this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.budget.files.download'] == true);

        let budgetFiles = this.props.budgetFiles.map( function(item, index) {
            return <FileItem key={item.key} campaignKey={that.props.campaignKey} item={item} fileIndex={index}
                             downloadPermission={downloadPermission}/>;
        });

        return <tbody>{budgetFiles}</tbody>;
    }

    renderElectionRoles() {
        let that = this;
        let editPermission = (this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.budget.salary.edit'] == true);
        let electionRolesRows = [];
        let electionRolesShiftsHash = this.props.electionRolesShiftsHash
        let roleIndex = 0;
        for(let electionRoleId in electionRolesShiftsHash){
            let electionsRoleShifts = electionRolesShiftsHash[electionRoleId];
            electionsRoleShifts.forEach( function (item, index) {
                electionRolesRows.push(
                  <ElectionRoleItem
                    key={item.key}
                    item={item}
                    roleIndex={roleIndex}
                    shiftIndex={index}
                    editPermission={editPermission}
                    showEditRoleModal={that.showEditRoleModal.bind(that)}
                  />,
                );
            });
            roleIndex ++ ;
        }


        return <tbody>{electionRolesRows}</tbody>;
    }

    renderUploadButton() {
        if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.budget.files.add'] == true ) {
            return (
                <button className="btn new-btn-default btn-sm upload-file" data-target="#upload-file" data-toggle="modal"
                        onClick={this.props.showUploadModal.bind(this, this.props.tabKey)}>
                    {this.uploadButtonText}
                </button>
            );
        } else {
            return '\u00A0';
        }
    }

    checkBlockPermissions(blockName) {
        let permission = 'elections.campaigns.budget.' + blockName;

        return (this.props.currentUser.admin || this.props.currentUser.permissions[permission] == true);
    }

    render() {
        return (
            <div role="tabpanel" className={"budget tab-pane" + (this.props.display ? " active" : "")} id={"Tab-" + this.props.tabKey}>
                <div className="container-tab">
                    <div className={"row" + (this.checkBlockPermissions('files') ? '' : ' hidden')}>
                        <div className="col-md-8 pull-right text-right blue-title ">טעינת קובץ תקציב</div>
                        <div className="col-md-3 pull-left text-left ">
                            <div className="pull-left">{this.renderUploadButton()}</div>
                        </div>
                    </div>

                    <div className={"table-elections-low" + (this.checkBlockPermissions('files') ? '' : ' hidden')}>
                        <div className="table-responsive">
                            <table className="table table-frame2 table-striped">
                                <thead>
                                <tr>
                                    <th>מס"ד</th>
                                    <th>שם הקובץ</th>
                                    <th>גודל קובץ</th>
                                    <th>משתמש מבצע</th>
                                    <th>מועד ביצוע</th>
                                    <th>הורדת קובץ</th>
                                </tr>
                                </thead>

                                {this.renderFiles()}
                            </table>
                        </div>
                    </div>

                    <div className={"row nomargin" + (this.checkBlockPermissions('files') && this.checkBlockPermissions('salary')
                                    ? '' : ' hidden')}>
                        <div className="col-md-12 devider-elections"/>
                    </div>

                    <div className={"row" + (this.checkBlockPermissions('salary') ? '' : ' hidden')}>
                        <div className="col-md-4 pull-right text-right blue-title ">טבלת תשתית לשכר פעילים</div>
                    </div>

                    <div className={"table-container" + (this.checkBlockPermissions('salary') ? '' : ' hidden')}>
                        <table className="table line-around table-striped table-status table-salary">
                            <thead>
                            <tr>
                                <th>מס"ד</th>
                                <th>תפקיד</th>
                                <th>שיבוץ</th>
                                <th width="30%">ערך</th>
                                <th width="50px">{'\u00A0'}</th>
                            </tr>
                            </thead>

                            {this.renderElectionRoles()}
                        </table>
                    </div>
                </div>

                <EditRoleModal show={this.state.editRoleModal.show} hideEditRoleModal={this.hideEditRoleModal.bind(this)}
                               editRole={this.editRole.bind(this)} electionRoleItem={this.state.editRoleModal.electionRoleItem}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        budgetFiles: state.elections.electionsCampaignsScreen.budget.files,
        electionRoles: state.elections.electionsCampaignsScreen.budget.electionRoles,
        electionRolesShiftsHash: state.elections.electionsCampaignsScreen.budget.electionRolesShiftsHash
    };
}

export default connect(mapStateToProps) (Budget);