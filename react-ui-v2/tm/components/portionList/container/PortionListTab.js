import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
//import store from 'store';

import * as portionActions from 'tm/actions/portionActions';

import PortionListTabTitle from '../display/PortionListTabTitle';
import PortionList from './PortionList';
import PortionModal from '../display/PortionModal';
import SelectPortionModal from '../display/SelectPortionModal';
import NoData from 'tm/components/common/NoData';

class PortionListTab extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.onOpenPortionModalClick = this.onOpenPortionModalClick.bind(this);
        this.onPortionModalCloseClick = this.onPortionModalCloseClick.bind(this);
        this.onNewPortionClick = this.onNewPortionClick.bind(this);
        this.onEditOrderClick = this.onEditOrderClick.bind(this);
        this.onEditOrderCancel = this.onEditOrderCancel.bind(this);
        this.onEditOrderSave = this.onEditOrderSave.bind(this);
        this.cancelCountVoters = this.cancelCountVoters.bind(this);
        this.onChooseExistPortionClick = this.onChooseExistPortionClick.bind(this);
        this.calculateAllPorionsVotersCount = this.calculateAllPorionsVotersCount.bind(this);
        this.hideSelectportionModal = this.hideSelectportionModal.bind(this);
        this.savePortionCopy = this.savePortionCopy.bind(this);
        this.state = { dispalySelectPortionModal: false , loadedPortions:this.props.loadedPortions};
    }

    componentDidUpdate() {
        if (this.props.portionsListForCaculation.length > 0 && !this.props.isCalculatingCount) {
            let { voterFilterKey, calculate, unique, moduleType } = { ...this.props.portionsListForCaculation[0] };
            this.props.portionActions.getCountVoters(voterFilterKey, calculate, unique, moduleType);
        }
    }
	
	componentWillReceiveProps(nextProps){
		 
		if( this.props.portions.length == 0 && nextProps.portions.length > 0 ){
			//this.setState({loadedPortions:true});
		}
		if(!this.props.loadedPortions && nextProps.loadedPortions){
		    this.setState({loadedPortions:true});
		}

	}
	
	componentWillUnmount(){
		//store.dispatch({type:portionActions.types.SET_CAMPAIGN_PORTIONS_FIELD , fieldName:'loadedPortions' , fieldValue:false});
	}
	
	
    /*
    let portionsList= this.props.portionsListForCaculation
    if (portionsList.length > 0 && !this.props.isCalculatingCount) {
        for(let i = 0; i< portionsList.length; i++){
            portionsList[i];
            let { voterFilterKey, calculate, unique, moduleType } = { ...this.props.portionsListForCaculation[i] };
            console.log(voterFilterKey, calculate, unique, moduleType);
            this.props.portionActions.getCountVoters(voterFilterKey, calculate, unique, moduleType);
        }
    }
    */
    onPortionModalCloseClick() {
        if (this.props.isEditedPortionChanged && !this.props.isOpenNewPortionModal) {
            
            //when finish editing portion (if there is change): recalculate unique, not nuique voters count for the portion and all the portions after it.
            let affectedPortions = [];
            let isAffected = false;

            this.props.portions.map(portion => {
                if (portion.key == this.props.openPortionModalKey) {
                    isAffected = true;
                    affectedPortions.push({ voterFilterKey: portion.key, unique: true, calculate: true, moduleType: "portion" });
                    affectedPortions.push({ voterFilterKey: portion.key, unique: false, calculate: true, moduleType: "portion" });
                }

                if (isAffected) {
                    affectedPortions.push({ voterFilterKey: portion.key, unique: true, calculate: true, moduleType: "portion" });
                }
            });

            this.props.portionActions.setUpdatedPortions(affectedPortions);
        }

        this.props.portionActions.onClosePortionModalClick();
    }

    onOpenPortionModalClick(portionKey, isNew) {
        this.props.portionActions.onOpenPortionModalClick(portionKey, isNew);
        this.props.portionActions.setVoterFilterChangeStatus(isNew);
    }

    onNewPortionClick() {
        this.props.portionActions.onOpenPortionModalClick(null, true);
        this.props.portionActions.setVoterFilterChangeStatus(true);
    }
    onChooseExistPortionClick() {
        this.setState({ dispalySelectPortionModal: true });
        this.props.portionActions.getCampaignPortions(this.props.campaign.currentCampaignKey);
    }
    hideSelectportionModal() {
        this.setState({ dispalySelectPortionModal: false });
    }
    savePortionCopy(choosenPortionKey) {
        this.props.portionActions.copyPortionByKey(this.props.campaign.currentCampaignKey, choosenPortionKey)
        this.setState({ dispalySelectPortionModal: false });
    }

    getActivePortion() {
        let portion = this.props.portions.filter(portion => {
            return portion.key == this.props.openPortionModalKey;
        })[0] || {};
        if (this.props.isOpenNewPortionModal) {
            let order = !_.isEmpty(this.props.portions) ? this.props.portions.length + 1 : 1;
            portion = { ...portion, order };
        }
        return portion;
    }

    getPortionByKey(portionKey) {
        return this.props.portions.filter(portion => portion.key == portionKey)[0] || {};
    }

    onEditOrderClick() {
        this.props.portionActions.onEditPortionsOrderClick();
    }

    onEditOrderCancel() {
        this.props.portionActions.onEditPortionsOrderCancel();
    }

    onEditOrderSave() {
        let current_portion_id = this.props.current_portion_id;
        let allowForEdit = current_portion_id ? false : true;
        let portions = [];
         this.props.editedPortions.forEach((portion, i) => {
            if (allowForEdit) {
                portions.push( { key: portion.key, id: portion.id, order: i + 1 });
            }
            if (!allowForEdit && portion.id == current_portion_id) { allowForEdit = true; }
        });
        if (current_portion_id && portions.length == 0) { return } // if no portions to edit

        // Check if order had changed
        let affectedPortions = [];
        portions.map(portion => {
            let corePortion = this.getPortionByKey(portion.key);

            if (corePortion.order != portion.order) {
                affectedPortions.push({ voterFilterKey: portion.key, unique: true, calculate: true, moduleType: "portion" });
            }
        });

        if (affectedPortions.length) {
            this.props.portionActions.setUpdatedPortions(affectedPortions);
        }

        this.props.portionActions.savePortionList(portions, this.props.campaign.currentCampaignKey);
    }

    cancelCountVoters() {
        this.props.portionActions.resetPortionsCalculationList();
        this.props.portionActions.cancelGetCountVoters();
    }

    calculateAllPorionsVotersCount() {
        if (this.props.isCalculatingCount) {
            this.props.portionActions.cancelGetCountVoters();
        }

        this.props.portionActions.resetPortionsCalculationList();
        let affectedPortions = [];

        //when calculateAll, calculate all portions in campaign.
        this.props.portions.map(portion => {
            affectedPortions.push({ voterFilterKey: portion.key, unique: true, calculate: true, moduleType: "portion" });
            affectedPortions.push({ voterFilterKey: portion.key, unique: false, calculate: true, moduleType: "portion" });
        });

        this.props.portionActions.setUpdatedPortions(affectedPortions);
    }
    canAddPortions(type) {
        if (this.props.currentUser.first_name.length > 0) {
            if (this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.portions.add']) return true;
        } else {
            return false;
        }
    }
    renderPortionListTabTitle(noDataProps, canAddPortions, currentPortionId) {
        if (this.props.portions.length == 0) {
			if(this.state.loadedPortions){
				return <NoData {...noDataProps} />;
			}
			else{
				return <div style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים...</div>
			}
        } else {
            return <div>
                <PortionListTabTitle
                    onNewPortionClick={this.onNewPortionClick}
                    onChooseExistPortionClick={this.onChooseExistPortionClick}
                    onEditOrderClick={this.onEditOrderClick}
                    onEditOrderSave={this.onEditOrderSave}
                    onEditOrderCancel={this.onEditOrderCancel}
                    isEditOrderMode={this.props.isEditOrderMode}
                    isCalculatingCount={this.props.isCalculatingCount}
                    cancelCountVoters={this.cancelCountVoters}
                    calculateAllPorionsVotersCount={this.calculateAllPorionsVotersCount}
                    allowAddNewPortion={canAddPortions}
                />
                <PortionList onOpenPortionModalClick={this.onOpenPortionModalClick} currentPortionId={currentPortionId} />
            </div>
        }
    }
    render() {
        let currentPortionId = this.props.current_portion_id;
        let canAddPortions = this.canAddPortions();
        let noDataProps = {
            noDataText: 'לא קיימות מנות',
            rightButtonText: 'בחר מנה קיימת',
            leftButtonText: 'צור מנה חדשה',
            isPermittedAdding: canAddPortions,
            onLeftButtonClick: this.onNewPortionClick,
            onRightButtonClick: this.onChooseExistPortionClick
        }
        return (
            <div className="portion-list-tab tabContnt containerStrip">
                {this.renderPortionListTabTitle(noDataProps, canAddPortions, currentPortionId)}
                {(this.props.openPortionModalKey || this.props.isOpenNewPortionModal) &&
                    <PortionModal
                        portion={this.getActivePortion()}
                        newVoterFilterParentKey={this.props.isOpenNewPortionModal ? this.props.campaign.currentCampaignKey : null}
                        onPortionModalCloseClick={this.onPortionModalCloseClick}
                        currentCampaignKey={this.props.campaign.currentCampaignKey}
                    />
                }
                <SelectPortionModal
                    show={this.state.dispalySelectPortionModal}
                    onCloseModal={this.hideSelectportionModal}
                    savePortionCopy={this.savePortionCopy}
                    portionList={this.props.portionList}
                    currentCampaignKey={this.props.campaign.currentCampaignKey}
                />
            </div>
        );
    }
}

PortionListTab.propTypes = {
    campaign: PropTypes.object,
    portions: PropTypes.array,
    editedPortions: PropTypes.array,
    isEditOrderMode: PropTypes.bool,
    openPortionModalKey: PropTypes.string,
    isOpenNewPortionModal: PropTypes.bool
};

PortionListTab.defaultProps = {
    //
};

function mapStateToProps(state, ownProps) {
    return {
        portions: state.tm.portion.list,
        loadedPortions: state.tm.portion.loadedPortions,
        editedPortions: state.tm.portion.editedPortions,
        isEditOrderMode: state.tm.portion.isEditPortionsOrderMode,
        openPortionModalKey: state.tm.portion.openPortionModalKey,
        isOpenNewPortionModal: state.tm.portion.isOpenNewPortionModal,
        campaign: state.tm.campaign,
        isCalculatingCount: state.tm.portion.isCalculatingCount,
        isEditedPortionChanged: state.tm.portion.isEditedPortionChanged,
        portionsListForCaculation: state.tm.portion.portionsListForCaculation,
        currentUser: state.system.currentUser,
        current_portion_id: state.tm.campaign.campaignScreen.currentCampaign.current_portion_id,
        portionList: state.tm.portion.portionGampaignList
    };
}

function mapDispatchToProps(dispatch) {
    return {
        portionActions: bindActionCreators(portionActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PortionListTab);
