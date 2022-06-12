import React from 'react';

import ModalWindow from 'components/global/ModalWindow';


class UpdateNeighborhoodClustersPrefixModal extends React.Component {
    initState = { radioButtonChecked: 0, prefixValue: '' };
    constructor(props) {
        super(props);
        this.modalName = 'neighborhoodClusters';
        this.modalTitle = 'עדכן תחילית לאשכולות נבחרים';
        this.modalTextsOptions = {
            'addPrefix': { label: 'התחילית תתווסף לפני שם האשכול וביניהם תו רווח אחד', value: 0 },
            'resetPrefix': { label: 'איפוס שמות כל האשכולות', value: 1 },
        }
        this.actionList=['addPrefix','resetPrefix'];
        this.state = { ...this.initState };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal && !this.props.showModal) {
            this.setState({ ...this.initState });
        }
    }
    radioButtonChanged(radioValue) {
        let prefixValue = radioValue == 0 ? this.state.prefixValue : ''
        this.setState({ radioButtonChecked: radioValue, prefixValue: prefixValue });
    }
    onPrefixChanged(e) {
        this.setState({ prefixValue: e.target.value });
    }
    render() {
        let addPrefixMode = this.state.radioButtonChecked == 0;
        let resetPrefixMode = this.state.radioButtonChecked == 1;
        let prefixLen = this.state.prefixValue.length;
        let prefixValid = (prefixLen > 1 ) ? true : false;
        return (
            <ModalWindow show={this.props.showModal}
                buttonOk={this.props.onSubmit.bind(this, this.modalName, this.actionList[this.state.radioButtonChecked], { newPrefix: this.state.prefixValue })}
                buttonCancel={this.props.onClose.bind(this, this.modalName)}
                buttonX={this.props.onClose.bind(this, this.modalName)}
                disabledOkStatus={addPrefixMode && !prefixValid}
                style={{ zIndex: '9001', width: '700px' }}
                title={this.modalTitle}
            >
                <div className="modal-body">
                    <div className="row">
                        <div className="col-md-12">
                            <form>
                                <div className="form-inline">
                                    <div className="radio">
                                        <label><input type="radio" name="neighborhoodClustersOptions" checked={addPrefixMode}
                                            onChange={this.radioButtonChanged.bind(this, 0)} /> תחילית</label>
                                    </div>
                                    <input type="text" className="form-control" value={this.state.prefixValue} onChange={this.onPrefixChanged.bind(this)}
                                        disabled={!addPrefixMode}
                                    style={{ width: '60%', 'marginRight': '10px' }} />
                                    <p style={{ padding: '10px 76px 0 0' }} >{this.modalTextsOptions.addPrefix.label}</p>
                                </div>
                                <div className="radio">
                                    <label><input type="radio" name="neighborhoodClustersOptions" checked={resetPrefixMode}
                                        onChange={this.radioButtonChanged.bind(this, 1)} />
                                        <span style={{ padding: '5px 10px', 'backgroundColor': '#FFE0B2' }}>
                                        {this.modalTextsOptions.resetPrefix.label}</span>
                                    </label>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </ModalWindow>
        )
    }



}

export default UpdateNeighborhoodClustersPrefixModal;