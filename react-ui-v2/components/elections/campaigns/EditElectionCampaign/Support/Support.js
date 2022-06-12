import React from 'react';
import { connect } from 'react-redux';

import SupportStatusItem from './SupportStatusItem';
import AddSupportStatusModal from './AddSupportStatusModal'
import ModalWindow from 'components/global/ModalWindow';

import * as ElectionsActions from 'actions/ElectionsActions';


class Support extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editItemKey: null,
            showAddModal: false,
            selectedDeleteItem: {name: ""},
            showDeleteModal: false
        }
        this.tableStyle = {
            trHeight: {
                height: "54px"
            },
            columnWidth: {
                number: {width: '5%'},
                name: {width: '20%'},
                active: {width: '10%'},
                level: {width: '10%'},
                connectedStatus: {width: '20%'},
                date: {width: '15%'},
                buttons: {width: '10%'}
            }
        }
        this.setEditKey = this.setEditKey.bind(this);
        this.showDeleteModal = this.showDeleteModal.bind(this);
        this.hideAddSupportStatusModal = this.hideAddSupportStatusModal.bind(this);
    }

    /**
     * Set edit key
     *
     * @param string editItemKey
     * @return void
     */
    setEditKey(editItemKey) {
        this.setState({
            editItemKey: editItemKey
        });
    }

    /**
     * Render add button
     *
     * @return void
     */
    renderAddButton() {
        if ((!this.state.editItemKey) && 
            (this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.support_status.add'] == true)) {
            return (
                <button className="btn new-btn-default"
                        onClick={this.showAddStatusModal.bind(this)}
                        >+הוסף</button>
            );
        } else {
            return "";
        }
    }

    /**
     * Load previous support status list
     *
     * @param object props
     * @return void
     */
    loadPreviousSupportStatus(props) {
        let self = this;
        let currentCampaignKeyIndex = null;
        props.electionCampaigns.forEach(function(campaign,index) {
            if (campaign.key == props.campaignKey) {
                currentCampaignKeyIndex = index;
            }
            if (currentCampaignKeyIndex != null && index == currentCampaignKeyIndex + 1) {
                ElectionsActions.loadSupportStatusesForSupportStatusEdit(props.dispatch, campaign.key);
                return;
            }
        });
    }

    /**
     * Show modal for adding status
     * 
     * @return void
     */
    showAddStatusModal() {
        this.setState({
            showAddModal: true
        });
    }

    /**
     * Hide modal for adding status
     * 
     * @return void
     */    
    hideAddSupportStatusModal() {
        this.setState({
            showAddModal: false
        });        
    }

    /**
     * Show modal for deleting status
     * 
     * @param object item
     * @return void
     */    
    showDeleteModal(item) {
        this.setState({
            selectedDeleteItem: item,
            showDeleteModal: true
        })
    }

    /**
     * hide modal for deleting status
     * 
     * @return void
     */
    hideDeleteModal() {
        this.setState({
            showDeleteModal: false
        })
    }

    /**
     * Delete support status
     * 
     * @return void
     */
    deleteStatus() {
        ElectionsActions.deleteElectionCampaignSupportStatus(this.props.dispatch,
                                                            this.props.campaignKey,
                                                            this.state.selectedDeleteItem.key);
        this.hideDeleteModal();
    }

    componentWillMount() {
        ElectionsActions.loadSupportStatusesForElectionsCampaigns(this.props.dispatch, this.props.campaignKey);
        if (this.props.electionCampaigns.length > 0) this.loadPreviousSupportStatus(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.electionCampaigns.length != nextProps.electionCampaigns.length) {
            this.loadPreviousSupportStatus(nextProps);
        }
    }

    /**
     * Render support status list
     * 
     * $return void
     */
    renderSupportStatuses() {
        let _this = this;
        let supportStatuses = this.props.supportStatuses.map( function (item, index) {
            return <SupportStatusItem
                        key={item.key} 
                        campaignKey={_this.props.campaignKey}
                        items={_this.props.supportStatuses}
                        supportIndex={index}
                        item={item}
                        editItemKey={_this.state.editItemKey}
                        setEditKey={_this.setEditKey}
                        showDeleteModal={_this.showDeleteModal}
                        previousSupportStatus={_this.props.previousSupportStatus}/>
        });

        return <tbody>{supportStatuses}</tbody>;
    }

    /**
     * Render add support status modal
     *
     * @return JSX
     */
    renderAddSupportStatusModal() {
        if (this.state.showAddModal) {
            return <AddSupportStatusModal
                    items={this.props.supportStatuses}
                    hideModal={this.hideAddSupportStatusModal}
                    campaignKey={this.props.campaignKey}
                    dispatch={this.props.dispatch}/>
        } else {
            return '';
        }
    }

    render() {
        return (
            <div role="tabpanel" className={"tab-pane" + (this.props.display ? " active" : "")} id={"Tab-" + this.props.tabKey}>
                <div className="container-tab">
                    <div className="table-container">
                        <table className="table line-around table-striped table-status">
                            <thead>
                            <tr style={this.tableStyle.trHeight}>
                                <th style={this.tableStyle.columnWidth.number}>מס"ד</th>
                                <th style={this.tableStyle.columnWidth.name}>שם סטטוס </th>
                                <th style={this.tableStyle.columnWidth.active}>פעיל </th>
                                <th style={this.tableStyle.columnWidth.level}>רמה</th>
                                <th style={this.tableStyle.columnWidth.connectedStatus}>סטטוס תמיכה קודם</th>
                                <th style={this.tableStyle.columnWidth.date}>תאריך עדכון</th>
                                <th style={this.tableStyle.columnWidth.buttons}>{this.renderAddButton()}</th>
                            </tr>
                            </thead>

                            {this.renderSupportStatuses()}
                        </table>
                    </div>
                </div>
                <ModalWindow
                    show={this.state.showDeleteModal}
                    title="מחיקת סטטוס"
                    buttonOk={this.deleteStatus.bind(this)}
                    buttonCancel={this.hideDeleteModal.bind(this)}>
                    <div>
                        ה<span>אם אתה בטוח שאתה רוצה למחוק את הסטטוס: </span>
                        <span>{this.state.selectedDeleteItem.name}</span>
                    </div>
                </ModalWindow>
                {this.renderAddSupportStatusModal()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        supportStatuses: state.elections.electionsCampaignsScreen.combos.supportStatuses,
        currentUser: state.system.currentUser,
        previousSupportStatus: state.elections.electionsCampaignsScreen.supportStatus.previousSupportStatus,
        electionCampaigns: state.elections.electionsCampaignsScreen.combos.electionsCampaigns,
    };
}

export default connect(mapStateToProps) (Support);