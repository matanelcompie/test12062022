import React from 'react';
import * as SystemActions from '../../../../../actions/SystemActions';
//import { withRouter } from 'react-router';
import { connect } from 'react-redux';

class NewPartyList extends React.Component {
    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            nameTitle: 'שם מפלגה',
            lettersTitle: 'אותיות',
            isShasTitle: 'מפלגת שס?',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.PARTY_LIST_EDIT_VALUE_CHANGED, key, value});
    }

    cancelAddMode() {
        const event = 'cancel';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ADD_PARTY_LIST_MODE_UPDATED, event});
    }

    saveNewItem() {
        if (this.isAddValid()) {
            let partyList = {
                name: this.props.partyListInEditMode.name,
                letters: this.props.partyListInEditMode.letters,
                shas: this.props.partyListInEditMode.shas
            };
            SystemActions.addPartyList(this.props.dispatch, partyList);
            this.cancelAddMode();
        }
    }

    isAddValid() {
        return ((this.props.partyListInEditMode.name.length >= 2) && this.props.partyListInEditMode.letters.length > 1) ? true : false;
    }

    loadPartyListTypes(key) {
        SystemActions.loadPartyListTypes(this.props.dispatch, key);
    }

    render() {
        return (
                <div className={'well' + (this.props.isPartyListInAddMode ? '' : ' hidden')}>
                    <div className="row form-horizontal">
                        <div className="col-md-5">
                            <div className="row form-group">
                                <label htmlFor="roleName" className="col-sm-4 control-label">{this.textValues.nameTitle}</label>
                                <div className="col-sm-8">
                                    <input type="input" className="form-control" id="roleName" value={this.props.partyListInEditMode.name} 
                                           onChange={this.updateRowText.bind(this, 'name')}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="row form-group">
                                <label className="col-md-4 control-label">{this.textValues.lettersTitle}</label>
                                <div className='col-md-8'>
                                    <input type="input" className="form-control" id="roleName" value={this.props.partyListInEditMode.letters} 
                                           onChange={this.updateRowText.bind(this, 'letters')}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="row checkbox">
                                <label>
                                    <input type="checkbox" value={this.props.partyListInEditMode.shas}
                                           onChange={this.updateRowText.bind(this, 'shas')}
                                           checked={this.props.partyListInEditMode.shas == 1 ? 'checked' : ''}/>
                                    {this.textValues.isShasTitle}
                                </label>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <span className="edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveNewItem.bind(this)} 
                                        disabled={this.isAddValid() ? '' : 'disabled'} title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelAddMode.bind(this)} 
                                        title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                            </span>
                        </div>
                    </div>
                </div>)
    }
}

export default connect()(NewPartyList);