import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../actions/SystemActions';
import ModalWindow from '../../../global/ModalWindow';
import Combo from '../../../global/Combo';


class SearchActivistModal extends React.Component {

    constructor(props) {
        super(props);
    }

	/*
	   Init dynamic variables and components for render() function
	*/
    initDynamicVariables() {
        let self = this;
        this.notValidatedCity = (this.props.activistSearchModal.selectedCity.selectedItem == null && this.props.activistSearchModal.selectedCity.selectedValue.trim() != '');
        this.notValidatedCluster = (this.props.activistSearchModal.selectedCluster.selectedItem == null && this.props.activistSearchModal.selectedCluster.selectedValue.trim() != '');
        this.searchButtonDisabled = (this.props.activistSearchModal.ministerID == '' && this.props.activistSearchModal.selectedCity.selectedItem == null && this.props.activistSearchModal.selectedCluster.selectedItem == null) || this.notValidatedCity || this.notValidatedCluster;

        this.resultRowsItem = this.props.activistSearchModal.foundVoters.map(function (item, index) {
            let className = '';
            if (item.isSelected) {
                className = "success request-select-row";
            }
            return (
                <tr key={index} className={className} onClick={self.props.setRowSelected.bind(self, index)} onDoubleClick={self.props.setParentScreenActivistData.bind(self, index)}>
                    <td>{item.personal_identity}</td>
					<td>{item.last_name}</td>
                    <td>{item.first_name}</td>
                    <td>{item.city_name}</td>
                    <td>{item.captains_50_count > 0 ? 'שובץ' : '-'}</td>
                    <td>{item.captains_50_count}</td>
                </tr>);
        });
    }


	/*
	function that checks if row selected , and if so then it will call function 'function that passes selected found activist into parent screen and closes this modal window' 
	*/
    setFoundVoterResult() {
        if (this.props.activistSearchModal.selectedRowIndex > -1) {
            this.props.setParentScreenActivistData(this.props.activistSearchModal.selectedRowIndex);
        }
    }


    componentWillUnmount() {
        this.props.searchActivistModalUnmount();
    }


    render() {
        this.initDynamicVariables();
        return (
            <ModalWindow show={true} title={this.props.windowTitle} buttonOk={this.setFoundVoterResult.bind(this)} buttonX={this.props.closeSearchCaptainModalDialog.bind(this)} buttonCancel={this.props.closeSearchCaptainModalDialog.bind(this)}>
                <div className="modal-body">
                    <div className="containerStrip">
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label className="control-label">עיר</label>
                                    <Combo items={this.props.currentUserGeographicalFilteredLists.cities} placeholder="בחר עיר" maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.activistSearchModal.selectedCity.selectedValue} onChange={this.props.searchActivistModalFieldComboValueChange.bind(this, 'selectedCity')} inputStyle={{ borderColor: (this.notValidatedCity ? '#ff0000' : '#ccc') }} />
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label className="control-label">אשכול</label>
                                    <Combo items={this.props.activistSearchModal.clusters} placeholder="בחר אשכול" maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.activistSearchModal.selectedCluster.selectedValue} onChange={this.props.searchActivistModalFieldComboValueChange.bind(this, 'selectedCluster')} inputStyle={{ borderColor: (this.notValidatedCluster ? '#ff0000' : '#ccc') }} />
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label className="control-label">ת.ז.</label>
                                    <input type="text" className="form-control" value={this.props.activistSearchModal.ministerID} onChange={this.props.searchActivistModalFieldTextValueChange.bind(this, 'ministerID')} maxLength='9' />
                                </div>
                            </div>
                        </div>
                        <div className="row flexed-end">
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label className="control-label">שם פרטי</label>
                                    <input type="text" className="form-control" value={this.props.activistSearchModal.ministerFirstName} onChange={this.props.searchActivistModalFieldTextValueChange.bind(this, 'ministerFirstName')} />
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group">
                                    <label className="control-label">שם משפחה</label>
                                    <input type="text" className="form-control" value={this.props.activistSearchModal.ministerLastName} onChange={this.props.searchActivistModalFieldTextValueChange.bind(this, 'ministerLastName')} />
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="form-group text-left">
                                    <button title="חפש" type="submit" className="btn btn-primary srchBtn" disabled={this.searchButtonDisabled} onClick={this.props.doSearchActivist.bind(this)}>חפש</button>
                                </div>
                            </div>
                        </div>
                        <div style={{ color: '#0000ff', fontWeight: '600' }}>* מינימום חיפוש לפי עיר או אשכול או ת"ז</div>
                    </div>
                    <div className="containerStrip" style={{ borderBottomColor: 'transparent' }}>
                        <div className="row">
                            <div className="col-lg-8 rsltsTitle">
                                <h3 className="noBgTitle">נמצאו <span className="rsltsCounter">{this.props.activistSearchModal.foundVoters.length}</span> רשומות</h3>
                                {this.props.activistSearchModal.foundVoters.length > 0 ? <div className="showingCounter">מציג תוצאות 1-{this.props.activistSearchModal.foundVoters.length}</div> : ''}
                            </div>
                            <div className="col-lg-12 tableList dataConf">
                                <div className="table-responsive">
                                    <table className="table table-striped tableNoMarginB table-hover tableTight csvTable table-scrollable">
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'right' }}>ת.ז.</th>
                                                <th style={{ textAlign: 'right' }}>שם משפחה</th>
                                                <th style={{ textAlign: 'right' }}>שם פרטי</th>
                                                <th style={{ textAlign: 'right' }}>עיר</th>
                                                <th style={{ textAlign: 'right' }}>סטטוס שיבוץ</th>
                                                <th style={{ textAlign: 'right' }}>מס' בתי אב</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.resultRowsItem}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ color: '#0000ff', fontWeight: '600' }}>* יש לבחור תושב אחד בלבד מהרשימה ואז ללחוץ אישור</div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalWindow>
        );
    }





}


function mapStateToProps(state, ownProps) {
    let modalScreen = null;
    switch (ownProps.modalName) {
        case "captainFifty":
            modalScreen = state.elections.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal;
            break;
        case "electionDay":
            modalScreen = state.elections.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal;
            break;
    }
    return {
        activistSearchModal: modalScreen,
        currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
    }
}

export default connect(mapStateToProps)(withRouter(SearchActivistModal));