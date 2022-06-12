import React from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router';
/**/
import Combo from '../../global/Combo';
import RequestDetailsTab from './RequestDetailsTab';
import RequestDetailsActions from './RequestDetailsActions';
import RequestDetailsCallbiz from './RequestDetailsCallbiz';
import RequestDetailsHistory from './RequestDetailsHistory';
import * as CrmActions from '../../../actions/CrmActions';

class RequestDetails extends React.Component {

    constructor(props) {
        super(props);
        this.styleIgniter();
    }

    componentWillMount() {
        if (this.actionsCounter == undefined) {
            CrmActions.getAllRequestsActionsTypes(this.props.dispatch, this.props.router, 1);
            this.actionsCounter = 1;
        }
    }

    /**
     * Let's set here the large and frequently used styles.
     * Kind of CSS.
     */
    styleIgniter() {

        this.tdStyle = {padding: '2px 5px', height: '22px', fontSize: '12px'};
        this.tabsStyle = {marginRight: '0', marginBottom: '0', };
        this.tabContentVisible = {display: 'block', };
        this.tabContentHidden = {display: 'none', };
        this.searchSpacerStyle = { marginBottom: '4px', padding:0};
        this.countBarStyle = {padding: '2px 5px', fontSize: '14px', backgroundColor: 'lime'};
        this.countBarPointerStyle = {padding: '2px 5px', fontSize: '14px', cursor: 'pointer' };
        this.width20={width: '20%'};
    }

    toggleDetailPanel(panelName, e) {
        CrmActions.setActiveDetailTabPanel(this.props.dispatch, panelName);
    }

    render() {
        let actionsTabItem = '';
        let historyTabItem = '';
        let callbizTabItem = '';
        let messageTabItem = '';
        let documentTabItem = '';

        if(this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.actions']){
            actionsTabItem = <li className={(true == this.props.activeRequestDetailTab.operation) ? 'active' : ''} onClick={this.toggleDetailPanel.bind(this, 'operation')} style={this.width20}>פעולות</li>;
        }

        if(this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.callbiz']){
            callbizTabItem = <li className={(true == this.props.activeRequestDetailTab.callBiz) ? 'active' : ''} onClick={this.toggleDetailPanel.bind(this, 'callBiz')} style={this.width20}>CallBIZ</li>;
        }

        if(this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.messages']){
            messageTabItem = <li className={(true == this.props.activeRequestDetailTab.message) ? 'active' : ''} onClick={this.toggleDetailPanel.bind(this, 'message')} style={this.width20}>הודעות</li>;
        }

        if(this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.documents']){
            documentTabItem = <li className={(true == this.props.activeRequestDetailTab.document) ? 'active' : ''} onClick={this.toggleDetailPanel.bind(this, 'document')} style={this.width20}>מסמכים</li>;
        }

        if(this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.history']){
            historyTabItem = <li className={(true == this.props.activeRequestDetailTab.history) ? 'active' : ''} onClick={this.toggleDetailPanel.bind(this, 'history')} style={this.width20}>היסטוריה</li>;
        }
        
        return (
            <div className="row" style={this.searchSpacerStyle}>
                <div className="col-md-12" >
                    <ul className="list-inline tabs" style={this.tabsStyle}>
                        {actionsTabItem}
                        {callbizTabItem}
                        {messageTabItem}
                        {documentTabItem}
                        {historyTabItem}
                    </ul>
					 <div className="row" style={(this.props.activeRequestDetailTab.operation== true && (this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.actions'])) ? this.tabContentVisible : this.tabContentHidden}>
                      <div className="col-md-12"><RequestDetailsActions hasRequestEditingPermissions={this.props.hasRequestEditingPermissions}
                                                                        statusNotForEdit={this.props.statusNotForEdit}
                                                                        hasAdminEdit={this.props.hasAdminEdit}/>
                      </div>
                    </div>
					 <div className="row" style={(this.props.activeRequestDetailTab.callBiz== true && (this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.callbiz'] )) ? this.tabContentVisible : this.tabContentHidden}>
                      <div className="col-md-12"><RequestDetailsCallbiz hasRequestEditingPermissions={this.props.hasRequestEditingPermissions}
                                                                        statusNotForEdit={this.props.statusNotForEdit}
                                                                        hasAdminEdit={this.props.hasAdminEdit}/>
                      </div>
                    </div>
                    <div className="row" style={(this.props.activeRequestDetailTab.history== true && (this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.history'] )) ? this.tabContentVisible : this.tabContentHidden}>
                      <div className="col-md-12"><RequestDetailsHistory/></div>
                    </div>
                      
                    <div className="row" style={((this.props.activeRequestDetailTab.document == true || this.props.activeRequestDetailTab.message == true) && (this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.documents'])) ? this.tabContentVisible : this.tabContentHidden}>
                      <div className="col-md-12"><RequestDetailsTab hasRequestEditingPermissions={this.props.hasRequestEditingPermissions}
                                                                    statusNotForEdit={this.props.statusNotForEdit}
                                                                    hasAdminEdit={this.props.hasAdminEdit}/></div>
                    </div>
                     
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {

    return {
        activeRequestDetailTab: state.crm.searchRequestsScreen.activeRequestDetailTab,
        currentUser: state.system.currentUser,
    }
}

export default connect(mapStateToProps)(withRouter(RequestDetails));
