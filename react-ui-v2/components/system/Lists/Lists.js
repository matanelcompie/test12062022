import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as SystemActions from '../../../actions/SystemActions';
import store from '../../../store';
import ModalWindow from '../../global/ModalWindow';
/**  Tabs **/
import RequestTab from './RequestTab/RequestTab';
import GeneralTab from './GeneralTab/GeneralTab';
import VoterTab from './VoterTab/VoterTab';
import SystemTab from './SystemTab/SystemTab';
import globalSaving from '../../hoc/globalSaving';

class Lists extends React.Component {
    constructor(props) {
        super(props);
        this.isPermissionsLoaded = false;
    }

    componentWillMount() {
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'תשתיות' });
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        this.loadLists();
    }

    componentDidUpdate() {
        this.loadLists();
    }

    /**
     * This function is triggered by event
     * of clicking tab in the top lists screen.
     *
     * @param string tabName - The clicked tab's name
     */
    tabClick(tabName) {
        if (false == this.props.dirty) {
            this.props.dispatch({
                type: SystemActions.ActionTypes.LISTS.LIST_TAB_CHANGE,
                tabName: tabName
            });
        } else {
            this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY });
        }
    }

    /**
     *  This function determines which tab is active
     *  according to the field tab in object listsScreen
     *  and returns the active tab component.
     *
     * @returns {XML}
     */
    getTabComponent() {
        switch (this.props.tab) {
            case this.tabRequest.name:
                this.tabRequest.className = 'active';
                this.tabRequest.display = true;
                break;
            case this.tabVoter.name:
                this.tabVoter.className = 'active';
                this.tabVoter.display = true;
                break;
            case this.tabSystem.name:
                this.tabSystem.className = 'active';
                this.tabSystem.display = true;
                break;
            case this.tabGeneral.name:
            default:
                this.tabGeneral.className = 'active';
                this.tabGeneral.display = true;
                break;
        }
    }

    initVariables() {

        this.tabGeneral = {
            name: 'general',
            className: '' + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general']) ? '' : ' hidden'),
            title: 'כללי',
            display: false
        }

        this.tabRequest = {
            name: 'requests',
            className: '' + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests']) ? '' : ' hidden'),
            title: 'פניות',
            display: false
        }

        this.tabVoter = {
            name: 'voter',
            className: '' + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections']) ? '' : ' hidden'),
            title: 'תושב',
            display: false
        }

        this.tabSystem = {
            name: 'system',
            className: '' + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system']) ? '' : ' hidden'),
            title: 'מערכת',
            display: false
        }

        this.textValues = {
            modalDialogErrorTitle: 'הודעה',
            itemInEditModeModalWindowBody: 'לא ניתן לעבור, נא לשמור את השינויים לפני.',
        };
    }

    loadLists() {
        if (this.props.currentUser.first_name.length && !this.isPermissionsLoaded) {
            this.isPermissionsLoaded = true;
            if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists'])) {
                /**
                 * 
                 */
            } else {
                this.props.router.replace('/unauthorized');
            }
        }
    }

    closeItemInEditModeModalDialog() {
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY });
    }

    render() {
        this.initVariables();
        this.getTabComponent();

        return (
            <div className={((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists']) ? '' : 'hidden')}>
                <h1>תשתיות</h1>
				<section className="section-block">
                    <ul className="tabs">
                        <li className={this.tabGeneral.className + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general']) ? '' : ' hidden')}
                            onClick={this.tabClick.bind(this, this.tabGeneral.name)}>
                            {this.tabGeneral.title}
                        </li>
                        <li className={this.tabRequest.className + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests']) ? '' : ' hidden')}
                            onClick={this.tabClick.bind(this, this.tabRequest.name)}>
                            {this.tabRequest.title}
                        </li>
                        <li className={this.tabVoter.className + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections']) ? '' : ' hidden')}
                            onClick={this.tabClick.bind(this, this.tabVoter.name)}>
                            {this.tabVoter.title}
                        </li>
                        <li className={this.tabSystem.className + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system']) ? '' : ' hidden')}
                            onClick={this.tabClick.bind(this, this.tabSystem.name)}>
                            {this.tabSystem.title}
                        </li>
                    </ul>

                    {((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general'])) &&
                        <GeneralTab display={this.tabGeneral.display} />
                    }
                    {((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests'])) &&
                        <RequestTab display={this.tabRequest.display} />
                    }
                    {((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections'])) &&
                        <VoterTab display={this.tabVoter.display} />
                    }
                    {((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system'])) &&
                        <SystemTab display={this.tabSystem.display} />
                    }
                </section>

                <ModalWindow show={this.props.showItemInEditModeModalDialog} buttonX={this.closeItemInEditModeModalDialog.bind(this)}
                    buttonOk={this.closeItemInEditModeModalDialog.bind(this)} title={this.textValues.modalDialogErrorTitle}>
                    <div>{this.textValues.itemInEditModeModalWindowBody}</div>
                </ModalWindow>
            </div>
        );
    }
}
;

function mapStateToProps(state) {
    return {
        tab: state.system.listsScreen.tab,
        currentUser: state.system.currentUser,
        dirty: state.system.listsScreen.dirty,
        showItemInEditModeModalDialog: state.system.listsScreen.showItemInEditModeModalDialog,
    };
}

export default globalSaving(connect(mapStateToProps)(withRouter(Lists)));
