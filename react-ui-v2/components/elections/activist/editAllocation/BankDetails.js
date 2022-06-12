import React from 'react';
import { connect } from 'react-redux';

// import bankBranchesTable from 'libs/bankBranchesTable';

import Combo from '../../../../components/global/Combo';


// Actions
import * as ElectionsActions from '../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../actions/SystemActions';
import * as GlobalActions from '../../../../actions/GlobalActions';
import BankUpdateValidationModal from './BankUpdateValidationModal';


class BankDetails extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            bankDetailsLoaded: false,
            bankList: [],
            bank_number:'',
            bank_name:'',
            bank_branch_id:'',
            bank_branch_name:'',
            bank_account_number:'',
            bank_owner_name:'',
            other_owner_type:'',
            bank_branches_list: [],
            is_activist_bank_owner: 0,
            is_bank_verified: 0,
            verify_bank_document_key: null,
            verifyBankFileDetails:{
                file : null,
                fileName : '',
                documentName : '',
            },
            disable_bank_validation: null,
            displayBankValidationModal :false,
            bankValidationCampaign: {name: null, id:null, isCurrent: false},
        };
        this.invalidColor = '#cc0000';
        this.otherOptionalBankOwners = [
            {id: 0, name: 'אב'},
            {id: 1, name: 'אם'},
            {id: 2, name: 'אח'},
            {id: 3, name: 'בעל/אישה'},
        ]
        this.postBankNumber = '9';
        this.componentDirtyName = 'voter_bank_details';

    }
    componentWillMount(){
        GlobalActions.loadBankBranches(this.props.dispatch)
        
        if(this.props.voterDetails.personal_identity){
            this.initVariables(this.props.voterDetails);
        }
    }
    componentWillUpdate(nextProps){
        let voterDetailsChanged = (this.props.voterDetails.personal_identity != nextProps.voterDetails.personal_identity);
        if( voterDetailsChanged){
            this.initVariables(nextProps.voterDetails);
        }

        if(!this.state.bankDetailsLoaded && nextProps.bankList.length > 0 && nextProps.allCampaignsList.length > 0 && nextProps.voterDetails.personal_identity){
            this.getVoterBankDetails( nextProps.voterDetails, nextProps.bankList, nextProps.allCampaignsList);
            this.setState({bankDetailsLoaded : true})
        }
        
    }
    /**
     * @method getVoterBankDetails
     * Load voter bank details to state.
     * @param {Obj} voterDetails - Current voter details
     */
     getVoterBankDetails( voterDetails, bankList, allCampaignsList){
         let currentVoterBank = this.getCurrentVoterBankDetails(bankList, voterDetails.bank_number); 

        let newState = {
            bankList: bankList,
            bank_number: currentVoterBank.bank_number,
            bank_name: currentVoterBank.bank_name,
            bank_branch_id: voterDetails.bank_branch_id,
            bank_branch_name: voterDetails.bank_branch_name,
            bank_account_number: voterDetails.bank_account_number || '',

            bank_owner_name: voterDetails.bank_owner_name|| '',
            other_owner_type: voterDetails.other_owner_type|| '',
            verify_bank_document_key: voterDetails.verify_bank_document_key || null,
            is_activist_bank_owner: voterDetails.is_activist_bank_owner || 0,
            is_bank_verified: voterDetails.is_bank_verified || 0,
            is_bank_wrong:voterDetails.is_bank_wrong
        }
        this.updateBankBranches(newState, currentVoterBank, false)
        let validationElectionCampaignId = voterDetails.validation_election_campaign_id;
        this.loadBankValidationCampaign(allCampaignsList, validationElectionCampaignId);

        this.setState(newState)
    }
    /** @method getCurrentVoterBankDetails
     * Get voter current bank details 
     */
    getCurrentVoterBankDetails(bankList, bankNumber){
        let currentVoterBank = {bank_name: '', bank_number: null, bank_branch_name:'', bank_branch_id: null}
        if(bankList.length > 0 && bankNumber){
            // Find bank in bank lists
            let bank = bankList.find((item) => {return item.id == bankNumber;});
            if(bank){ 
                currentVoterBank.bank_number = bank.id;
                currentVoterBank.branches = bank.branches;
                currentVoterBank.bank_name = bank.name;
                // currentVoterBank.bank_name = `${bank.name} (${bank.id})`;
                // Find bank Branch in branches lists
                // let bankBranch = bank.branches.find((item) => {return item.id == bankBranchId;});
                // if(bankBranch){
                //     currentVoterBank.bank_branch_id = bankBranch.branch_number;
                //     // currentVoterBank.bank_branch_name = `${bankBranch.name} (${bankBranch.branch_number})`;
                //     currentVoterBank.bank_branch_name = bankBranch.name;
                // }
            }
        }
        return currentVoterBank
    }
    loadBankValidationCampaign(allCampaignsList, validationElectionCampaignId) {
        let bankValidationCampaign = {name: null, id:null, isCurrent: false};
        //Check bank validation election campaign:
        // console.log('loadBankValidationCampaign', allCampaignsList , validationElectionCampaignId)
        if(allCampaignsList && validationElectionCampaignId){
        
            bankValidationCampaign = allCampaignsList.find((item) => {
               return item.id == validationElectionCampaignId;
            })
            bankValidationCampaign = bankValidationCampaign;
            this.setState({bankValidationCampaign})
        }
    }
    /**
     * @method updateBankBranches
     *  Get all branches of current bank.
     * @param {Object} newState store.state
     * @param {int} selectedBank - Selected bank
     * @param {bool} resetBranch - If Need to reset bank branch input.
     * 
     */
    updateBankBranches(newState, selectedBank, resetBranch = true){
        let bank_branches_list = (selectedBank ?selectedBank.branches : []);
        if(resetBranch){
            newState.bank_branch_name = '';
            newState.bank_branch_id = '';
        }
        newState.bank_branches_list = bank_branches_list;
    }
    inputFieldChange(fieldName, event) {
        this.setFormDirty();
        let fieldObj = {};
        fieldObj[fieldName] = event.target.value;
        this.setState(fieldObj);
    }

    comboChange(fieldName, fieldIdName, event){
        this.setFormDirty();
        let newState = {... this.state};
        let fieldValue = event.target.value 
        
        let selectedItem = event.target.selectedItem

        if(selectedItem){
            if(fieldIdName){ 
                newState[fieldIdName] = selectedItem.id; 
            }
            if(fieldIdName == 'bank_number'){
                this.updateBankBranches(newState, selectedItem);
            }
        }else{
            if(fieldName == 'other_owner_type'){ fieldValue =''; }
            newState[fieldIdName] = '';
            
            switch(fieldIdName){
                case 'bank_number':
                    this.updateBankBranches(newState, null);
                    break;
                case 'bank_branch_id':
                    if(this.state.bank_number == this.postBankNumber){
                        newState[fieldIdName] = fieldValue
                    }
                    break;
                default:
                    break;

            }
        }
        newState[fieldName] = fieldValue;
        this.setState(newState);
    }
    inputCheckboxChange(fieldName, event) {
        this.setFormDirty();
        let fieldObj = {};
        let isChecked = event.target.checked;
        fieldObj[fieldName] = isChecked ? 1 : 0;
        if(fieldName == 'is_activist_bank_owner' && isChecked){
            this.updateBankOwnerName();
        }
        this.setState(fieldObj);
    }
    /**
     * @method uploadFile
     * - Upload bank verify document
     * @param {event} e - Upload bank verify doc event 
     */
    uploadFile(e) {
        var file = null;
        if (e.target.files != undefined ) {
            file = e.target.files[0]; 
        }

        let fileName = "";
        let documentName = "";
        let arrOfFileElements = [];
        let verifyBankFileDetails = {};

        if (file) {
            fileName = file.name;
            arrOfFileElements = fileName.split('.');
            documentName = arrOfFileElements[0];
        } 
        verifyBankFileDetails.file = file;
        verifyBankFileDetails.document_name = documentName;
        verifyBankFileDetails.fileName = fileName;
        this.setFormDirty()
        this.setState({verifyBankFileDetails})
    }
 
    updateBankOwnerName(){
        let activistItem = this.props.voterDetails;
         let ownerName = activistItem.first_name + ' ' + activistItem.last_name 
         this.setState({bank_owner_name: ownerName})
     }
    /**
     * @method validateVariables
     * Set bank inputs validation styles.
     */
    validateVariables(){
        let validInput = true;
        if ( !this.validateBankDetails() ) {
            validInput = false;
            this.bankDetailsInputStyle = {borderColor: this.invalidColor};
        } else {
            this.bankDetailsInputStyle = {};
        }
        if ( !this.bankOwnerIsValid ) {
            validInput = false;
            this.bankOwnerStyle = {borderColor: this.invalidColor};
        } else {
            this.bankOwnerStyle = {};
        }
        return validInput;
    }
    /**
     * @method validateBankDetails
     * 1. Check bank required details.
     * -> Or all details are empty or all details are filled.
     * 2. Check bank owner field
     * @returns {isValid} - if bank details are valid.
     */
    validateBankDetails(){
        let bankDetails = ['bank_number', 'bank_branch_id', 'bank_account_number'];
        let singleDetailsExist, singleDetailsEmpty = false;
        this.bankOwnerIsValid = true;

        let isValid = true;
        
        bankDetails.forEach((item) => {
            let itemValue = this.state[item];
            if(itemValue && itemValue.toString().length > 0){
                singleDetailsExist = true;
            } else {
                singleDetailsEmpty = true;
            }
        })
        if(singleDetailsExist && singleDetailsEmpty){ isValid = false; }

        if(singleDetailsExist){
            if(this.state.is_activist_bank_owner == 0 && this.state.other_owner_type == ''){
                this.bankOwnerIsValid = false;
            }
        }
        return isValid;
    }
  
    initVariables() {
        this.bankDetailsInputStyle = {};
        this.bankOwnerStyle = {};
    }
    getVoterKey(){
        let voterDetails = this.props.voterDetails;
        return voterDetails.key;
    }
    displayValidateBankModal(bool){
        this.setState({displayBankValidationModal: bool})
    }
    verifyBankValidation(){
        let voterKey = this.getVoterKey();
        ElectionsActions.verifyBankValidation(this.props.dispatch, voterKey, true, this.props.parent, this.props.voterDetails).then(() => {
            this.props.voterDetails.validation_election_campaign_id = this.props.currentCampaign.id
            this.setState({bankValidationCampaign: this.props.currentCampaign})
        })
        this.displayValidateBankModal(false);
    }
    cancelBankValidation(){
        let voterKey = this.getVoterKey();
        ElectionsActions.verifyBankValidation(this.props.dispatch, voterKey, false, this.props.parent, this.props.voterDetails).then(() => {
            this.setState({is_bank_verified: 0})
        })

        this.displayValidateBankModal(false);

    }

    /**
     * @method onSubmit
     * Save bank details.
     * 
     */
	onSubmit(){

        let verifyBankFileDetails = this.state.verifyBankFileDetails;
        if(verifyBankFileDetails.file){ // Upload new file
            let voterKey = this.getVoterKey();
            GlobalActions.addEntityDocument(this.props.dispatch, 2, voterKey, verifyBankFileDetails).then(() => {
                this.saveBankDetails();
            });
        } else{
            this.saveBankDetails();
        }
        
    }
    saveBankDetails(){
        let editStateObj = {
            disable_bank_validation: this.state.disable_bank_validation
        };
        let bankDetails = ['bank_number','bank_branch_id', 'bank_branch_name', 'bank_account_number','bank_owner_name', 'other_owner_type', 'is_activist_bank_owner', 'is_bank_verified','is_bank_wrong'];
       console.log(this.state);
        bankDetails.forEach((item) => {
            let val = this.state[item];
            if(val)
            val=val.toString().trim();
            let itemValue = (val == '') ? null : val;
            editStateObj[item] = itemValue;
        })
        ElectionsActions.editVoterBankDetails(this.props.dispatch, this.props.voterDetails.key, editStateObj, this.props.parent, bankDetails).then((bankDetailsSave) => {
            let currentCampaign = this.props.currentCampaign;
            if(this.props.voterDetails.validation_election_campaign_id  != currentCampaign.id){
                setTimeout(() => {
                    this.props.voterDetails.validation_election_campaign_id = currentCampaign.id
                    this.setState({bankValidationCampaign: currentCampaign})
               
                }, 1000)

            }

            if(bankDetailsSave){
                this.setState({is_bank_wrong: bankDetailsSave.is_bank_wrong})
            }
        });
    }
    setFormDirty(){
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.componentDirtyName });
     }
    renderBankValidationButton(){
        if(this.props.currentCampaign.id != this.state.bankValidationCampaign.id &&  this.props.voterDetails.is_bank_verified && this.state.is_bank_verified)
            return (
                <button className="btn btn-warning" onClick={this.displayValidateBankModal.bind(this, true)} style={{marginRight: '15px'}}>אישור חשבון קיים</button>
            )
        }
    render () {
        const baseUrl = window.Laravel.baseURL;
        let parent_screen =  this.props.parent;
        let isEditAllocationChild = (parent_screen != "activists");
        let hasActivistVerifyBankPermissions = this.props.currentUser.admin || this.props.currentUser.permissions[`elections.${parent_screen}.bank_details.verify`] == true;
        let hasActivistViewBankPermissions = this.props.currentUser.admin || this.props.currentUser.permissions[`elections.${parent_screen}.bank_details.view`] == true;
        let hasDisabledBankValidationPermissions = this.props.currentUser.admin || this.props.currentUser.permissions[`elections.${parent_screen}.bank_details.disabled_validation`] == true;
    
        let isFormDirty = this.props.dirtyComponents.indexOf(this.componentDirtyName) != -1;
        let isFormValid = this.validateVariables()
        let buttonDisabled =  !isFormDirty || !isFormValid || this.props.savingChanges;
        // let buttonDisabled = !isFormDirty || !this.validateVariables() || this.props.savingChanges;

        let is_bank_verified = this.state.is_bank_verified;

        let verifyBankDocKey =  this.state.verify_bank_document_key;       
        let viewBankDocEnabled = verifyBankDocKey && hasActivistViewBankPermissions; // Can view bank verify doc.
        let verifyBankDocEnabled = verifyBankDocKey && hasActivistVerifyBankPermissions; // Can export bank verify doc.

        return (

                <div id="bankDetails" className="col-sm-12 border-top-divider">
                    {this.state.is_bank_wrong?
                       <div className="subHeader"> <h4 className="error-tit"><i className="fa fa-exclamation-circle" aria-hidden="true"></i>  פרטי חשבון בנק שגויים</h4></div>:
                       <div className="subHeader"><h4>פרטי חשבון בנק</h4>
                    </div>}

                        <div className="form-group row">

                            <div className="col-md-4">
                                    <label htmlFor="verification-status" className="col-sm-4 control-label" style={this.bankDetailsInputStyle}>בחר בנק</label>
                                    <div className="col-sm-8">
                                        <Combo items={this.state.bankList}
                                            id="verification-status"
                                            maxDisplayItems={10}
                                            itemIdProperty="id"
                                            itemDisplayProperty="name"
                                            className="form-combo-table"
                                            value={this.state.bank_name}
                                            inputStyle={this.bankDetailsInputStyle}
                                            disabled={is_bank_verified}
                                            onChange={!is_bank_verified ? this.comboChange.bind(this, 'bank_name', 'bank_number') : null}
                                        />
                                    </div>
                            </div>

                            <div className="col-md-4">
                                    <label htmlFor="branch-combo" className="col-sm-4 control-label" style={this.bankDetailsInputStyle}>בחר סניף</label>
                                    <div className="col-sm-8">
                                        <Combo items={!this.state.bank_branches_list?[]:this.state.bank_branches_list}
                                            id="branch-combo"
                                            maxDisplayItems={10}
                                            itemIdProperty="id"
                                            itemDisplayProperty="name"
                                            className="form-combo-table"
                                            value={this.state.bank_branch_name}
                                            inputStyle={this.bankDetailsInputStyle}
                                            disabled={is_bank_verified}
                                            onChange={!is_bank_verified ? this.comboChange.bind(this, 'bank_branch_name', 'bank_branch_id') : null}
                                        />
                                    </div>
                            </div>

                            <div className="col-md-4">
                                <label htmlFor="inputModalBankAccountNumber-role-details" className="col-sm-4 control-label" style={this.bankDetailsInputStyle}>מספר חשבון</label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control" style={this.bankDetailsInputStyle} id="inputModalBankAccountNumber-role-details"
                                        value={this.state.bank_account_number} 
                                        disabled={is_bank_verified}
                                        onChange={!is_bank_verified ? this.inputFieldChange.bind(this, 'bank_account_number') : null}/>
                                </div>
                            </div>
                        </div>

                        <div className="form-group row">
                                <div className="col-md-4">
                                    <label htmlFor="inputModalBankOwnerName-role-details" className="col-sm-4 control-label">שם בעל החשבון</label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control" id="inputModalBankOwnerName-role-details" disabled={is_bank_verified}
                                            value={this.state.bank_owner_name} onChange={this.inputFieldChange.bind(this, 'bank_owner_name')}/>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="col-md-4 control-label ">על שמי</label>

                                    <div className="col-md-3">
                                              <label htmlFor="inputModalActivistBankOwner" className="checkbox" style={{display:'inline'}}>כן</label>
                                             <input type="checkbox" disabled={is_bank_verified} checked={this.state.is_activist_bank_owner == 1} onChange={this.inputCheckboxChange.bind(this, 'is_activist_bank_owner')} />

                                    </div>
                                    {this.state.is_activist_bank_owner == 0 && 
                                        <div className="col-md-5">

                                            <div className="col-md-3">
                                                <label htmlFor="inputOtherBankOwner-role-details" className="col-md-3 nopaddingR control-label">אחר</label>
                                            </div>
                                                <div className="col-md-9">
                                                    <Combo items={this.otherOptionalBankOwners}
                                                        id="another"
                                                        maxDisplayItems={10}
                                                        itemIdProperty="id"
                                                        itemDisplayProperty="name"
                                                        className="form-combo-table"
                                                        value={this.state.other_owner_type}
                                                        inputStyle={this.bankOwnerStyle}
                                                        disabled={is_bank_verified}
                                                        onChange={this.comboChange.bind(this, 'other_owner_type', null)}
                                                    />
                                                </div>

                                        </div>
                                    }

                                </div>
                                { this.state.bankValidationCampaign.name && <div className="col-md-4">
                                        <label className="control-label" style={{ paddingLeft: '20px'}}> שלב הגדרת החשבון: </label>
                                        {this.state.bankValidationCampaign.name}
                                        {this.renderBankValidationButton()}
                                </div>}
                            </div>
                            <div className="form-group row">
                                <div className="col-md-4">

                                    <label  className="col-md-4 control-label" style={{paddingLeft: '0'}}>אימות פרטי חשבון</label>
                                    <div className="col-md-8">
                                        <div className="pull-right">
                                            <button type="button" className="btn btn-primary btn-xs">
                                                <label htmlFor="file" id="label" style={{margin:0}}>בחירת קובץ </label> 
                                            </button>

                                            <span style={{display: 'none'}}>
                                                <input type="file" id="file" onChange={this.uploadFile.bind(this)} disabled={is_bank_verified}/>
                                            </span>
                                            <div>{this.state.verifyBankFileDetails.fileName}</div>
                                        </div>
                                        <span className="text-center" style={{paddingRight:'10px'}}>{verifyBankDocKey ? <b>קיים מסמך אימות</b> : <b>חסר מסמך אימות</b>}</span>
                                        <div className="pull-left">
                                            {viewBankDocEnabled ?
                                            <a href={`${baseUrl}elections/activists/documents/${verifyBankDocKey}`  }  target="_blank"  >
                                                <button type="button" className='btn btn-info btn-xs' title="הדפסת קובץ אימות בנק"><i className="fa fa-eye"></i></button>
                                            </a>
                                            : 
                                                <button type="button" className='btn btn-default active btn-xs' title="הדפסת קובץ אימות בנק" disabled><i className="fa fa-eye"></i></button>
                                            }
                                        </div>
                                    </div> 
                                </div>


                                { verifyBankDocEnabled &&
                                    <div className="col-md-3 text-center">
                                        <label htmlFor="inputIsBankVerified-role-details" className="control-label" >חשבון אומת</label>
                                        <input disabled={this.state.is_bank_wrong} type="checkbox" id="inputIsBankVerified-role-details" className="checkbox-inline" style={{ marginRight: '10px' }}
                                            checked={this.state.is_bank_verified} onChange={this.inputCheckboxChange.bind(this, 'is_bank_verified')} />
                                    </div> 
                                }

                                {( hasDisabledBankValidationPermissions) && 
                                        <div className="col-md-3">
                                                <label htmlFor="inputInstructed-role-details" className="control-label" >ביטול בדיקת חשבון</label>
                                                <input type="checkbox" id="inputInstructed-role-details" className="checkbox-inline" style={{ marginRight: '10px' }}
                                                    checked={this.state.disable_bank_validation} onChange={this.inputCheckboxChange.bind(this, 'disable_bank_validation')} />
                                        </div>
                                }
                                {/* {( hasDisabledBankValidationPermissions) && 
                                        <div className="col-md-3">
                                                <label htmlFor="inputInstructed-role-details" className="control-label" >חשבון שגוי</label>
                                                <input type="checkbox" id="inputInstructed-role-details" className="checkbox-inline" style={{ marginRight: '10px' }}
                                                    checked={this.state.is_bank_wrong} onChange={this.inputCheckboxChange.bind(this, 'is_bank_wrong')} />
                                        </div>
                                } */}
                                <div className="col-md-1 pull-left">
                                    <div className="btnRow text-center">
                                        <button title="שמור" type="submit" className="btn btn-success btn-xs" disabled={buttonDisabled} onClick={this.onSubmit.bind(this)}>שמור</button>
                                    </div>
                                </div>
                            </div>
                            <BankUpdateValidationModal
                                show={this.state.displayBankValidationModal}
                                verifyBankValidation={this.verifyBankValidation.bind(this)}
                                cancelBankValidation={this.cancelBankValidation.bind(this)}
                                closeModal={this.displayValidateBankModal.bind(this, false)}
                            />
                    </div>
        );
    }
}
function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        currentCampaign: state.system.currentCampaign,
        dirtyComponents: state.system.dirtyComponents,
        bankList: state.global.banksBranches,
    }
}

export default connect(mapStateToProps) (BankDetails);