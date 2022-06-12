import React from 'react';
import { connect } from 'react-redux';

import ModalWindow from 'components/global/ModalWindow';
import VoterGroupItem from './VoterGroupItem';
import AddNewGroup from './AddNewGroup';

import * as GlobalActions from 'actions/GlobalActions';


class VoterGroupModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
			tempNewGroupName:'',
            buttons: [
                {
                    class: 'btn new-btn-primary btn-secondary',
                    text: 'סגור',
                    action: this.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text: 'המשך',
                    action: this.updateGroupDetails.bind(this),
                    disabled: true
                }
            ],

            selectedGroups: []
        };

        this.initConstants();
    }

    initConstants() {
        this.modalTitle = 'עדכון בחירת קבוצת תושבים לשיבוץ';
    }

    componentWillMount() {
        this.props.dispatch({type: GlobalActions.ActionTypes.VOTER_GROUP_MODAL.CLEAN_DATA, deleteCombos: true});

        GlobalActions.loadVoterGroupsForVoterGroupModal(this.props.dispatch);
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.newGroup && !this.props.newGroup) {
            let selectedGroups = this.state.selectedGroups;
            selectedGroups.push(nextProps.newGroup);
            this.setState({selectedGroups});
            this.props.dispatch({ type: GlobalActions.ActionTypes.VOTER_GROUP_MODAL.ADDED_NEW_GROUP_DATA, newGroup: null });
        }
    }

    addNewGroup(paramsObject) {
        let parentKey = null;

        if ( this.state.selectedGroups.length > 0 ) {
            parentKey = this.state.selectedGroups[this.state.selectedGroups.length - 1].key;
        }

        let datObj = {
            parent_key: parentKey,
            name: paramsObject.name , 
			permission_type:paramsObject.permission_type,
			voter_groups_permissions:paramsObject.voter_groups_permissions
        };
        GlobalActions.addNewGroupForVoterGroupModal(this.props.dispatch, datObj);
    }

    resetModalData() {
        let buttons = this.state.buttons;

        buttons[1].disabled = true;

        this.setState({buttons, selectedGroups: []});
        this.props.dispatch({type: GlobalActions.ActionTypes.VOTER_GROUP_MODAL.CLEAN_DATA, deleteCombos: false});
    }

    hideModal() {
        this.resetModalData();

        this.props.hideModal();
    }

    updateGroupDetails() {
        let voterObj = {...this.state.selectedGroups[this.state.selectedGroups.length - 1]};
		 
        this.resetModalData();

        let fullGroupPath = "";
		for(let i = 0 ; i < this.state.selectedGroups.length ; i++){
			fullGroupPath += this.state.selectedGroups[i].name + ">";
		}
		fullGroupPath = fullGroupPath.slice(0,-1);
        voterObj.fullGroupPath = fullGroupPath;

        this.props.updateGroupDetails(voterObj);
    }

    loadParentGroups(parentId) {
        return this.props.voterGroups.filter(voterGroupItem => voterGroupItem.parent_id == parentId);
    }

    groupChange(groupIndex, groupItem) {
        let selectedGroups = this.state.selectedGroups;
        let buttons = this.state.buttons;

        selectedGroups.splice(groupIndex);
        if ( groupItem.id != null ) {
            selectedGroups.push(groupItem);
        }

        if ( selectedGroups.length > 0  && this.state.tempNewGroupName.trim() == '') {
            buttons[1].disabled = false;
        } else {
            buttons[1].disabled = true;
        }

        this.setState({selectedGroups, buttons});
    }
	
	newGroupNameChange(tempNewGroupName){
		
		let selectedGroups = this.state.selectedGroups;
        let buttons = this.state.buttons;
        if ( selectedGroups.length > 0  && tempNewGroupName.trim() == '') {
            buttons[1].disabled = false;
        } else {
            buttons[1].disabled = true;
        }
		this.setState({tempNewGroupName,buttons});
	}


    renderSelectedGroups() {
        let that = this;
        let lastGroupChildren = [];

        let selectedItems = this.state.selectedGroups.map( function (item, index) {
            let parentId = (0 == index) ? 0 : that.state.selectedGroups[index - 1].id;
            let currentGroups = that.loadParentGroups(parentId);

            return <VoterGroupItem key={index} currentIndex={index} show={that.props.show} currentGroups={currentGroups}
                                   selectedGroups={that.state.selectedGroups} groupChange={that.groupChange.bind(that)}/>
        });

        if ( selectedItems.length > 0 ) {
            lastGroupChildren = this.loadParentGroups( this.state.selectedGroups[this.state.selectedGroups.length - 1].id );

            if ( lastGroupChildren.length > 0 ) {
                selectedItems.push(<VoterGroupItem key={this.state.selectedGroups.length} currentIndex={this.state.selectedGroups.length}
                                                   show={this.props.show} currentGroups={lastGroupChildren}
                                                   selectedGroups={that.state.selectedGroups} groupChange={this.groupChange.bind(this)}/>);
            }

            return selectedItems;
        } else {
            lastGroupChildren = this.loadParentGroups(0);

            return <VoterGroupItem key={0} currentIndex={0} show={this.props.show} currentGroups={lastGroupChildren}
                                   selectedGroups={this.state.selectedGroups} groupChange={this.groupChange.bind(this)}/>;
        }
    }
	
	
    render() {
        return (
            <ModalWindow show={this.props.show} title={this.modalTitle} buttons={this.state.buttons} buttonX={this.hideModal.bind(this)}>
                {this.renderSelectedGroups()}

                {this.props.allowAddNewGroup && <div>
					<hr/>
					<div className="row">
						<div className="col-md-12">הוספת תת קבוצה חדשה בהיררכיה האחרונה : </div>
						<AddNewGroup addNewGroup={this.addNewGroup.bind(this)} newGroupNameChange={this.newGroupNameChange.bind(this)}/>
					</div>
				</div>}
            </ModalWindow>
        );
    }
}

function mapStateToProps(state) {
    return {
        voterGroups: state.global.voterGroupModal.combos.voterGroups,
        newGroup: state.global.voterGroupModal.newGroup
    }
}

export default connect(mapStateToProps) (VoterGroupModal);