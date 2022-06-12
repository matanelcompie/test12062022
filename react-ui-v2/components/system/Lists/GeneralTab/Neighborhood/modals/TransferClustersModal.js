import React from 'react';
import ModalWindow from 'components/global/ModalWindow';
import Combo from 'components/global/Combo';

class TransferClustersModal extends React.Component {
    initState = { radioButtonChecked: 0, inputValue: '', neighborhoodSelected: { name: '', key: null } }
    constructor(props) {
        super(props);
        this.modalName = 'transferClusters';
        this.modalTitle = 'העברת אשכולות בין שכונות';
        this.modalTextsOptions = {
            'removeClusters': { label: 'הסר אשכולות מהשכונה', value: 0 },
            'transferClusters': { label: 'העבר לשכונה', value: 1 },
        }
        this.actionList = ['removeClusters', 'transferClusters'];
        this.state = { ...this.initState };
        this.neighborhoodsList = [];
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal && !this.props.showModal) {
            this.setState({ ...this.initState });
        }
        if (this.props.neighborhoodsList.length > 0) {
            let neighborhoodsList = [...this.props.neighborhoodsList];
            if (!nextProps.selectedNeighborhoodKey) {
                this.neighborhoodsList = neighborhoodsList;
            }else if (this.props.selectedNeighborhoodKey != nextProps.selectedNeighborhoodKey) {
                neighborhoodsList.forEach(function (item, index) {
                    if (item.key == nextProps.selectedNeighborhoodKey) { neighborhoodsList.splice(index, 1) }
                });
                this.neighborhoodsList = neighborhoodsList;
            }


        }
    }
    radioButtonChanged(radioValue) {
        this.setState({ radioButtonChecked: radioValue });
    }
    neighborhoodChanged(e) {
        let selectedItem = e.target.selectedItem ? e.target.selectedItem : { name: '', key: null };
        let inputValue = selectedItem ? selectedItem.name : e.target.value;

        this.setState({ inputValue, neighborhoodSelected: selectedItem });
    }
    render() {
        let transferClustersSelected = this.state.radioButtonChecked == 1 ? true : false;
        this.notVaildForm = (this.state.neighborhoodSelected.key == null && transferClustersSelected);
        return (
            <ModalWindow show={this.props.showModal}
                buttonOk={this.props.onSubmit.bind(this, this.modalName, this.actionList[this.state.radioButtonChecked], { neighborhoodSelected: this.state.neighborhoodSelected.key })}
                buttonCancel={this.props.onClose.bind(this, this.modalName)}
                buttonX={this.props.onClose.bind(this, this.modalName)}
                disabledOkStatus={this.notVaildForm}
                style={{ zIndex: '9001' }}
                title={this.modalTitle}
            >
                <div className="modal-body">
                    <div className="row">
                        <div className="col-md-12">
                            {this.props.selectedNeighborhoodKey && <div className="radio">
                                <label><input type="radio" name="transferClustersOptions" checked={this.state.radioButtonChecked == 0}
                                    onChange={this.radioButtonChanged.bind(this, 0)} /> {this.modalTextsOptions.removeClusters.label}</label>
                            </div>}
                            <div className="radio">
                                <label><input type="radio" name="transferClustersOptions" checked={this.state.radioButtonChecked == 1}
                                    onChange={this.radioButtonChanged.bind(this, 1)} /> {this.modalTextsOptions.transferClusters.label}</label>

                                {this.props.neighborhoodsList && <Combo items={this.neighborhoodsList} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name'
                                    defaultValue='' value={this.state.inputValue} onChange={this.neighborhoodChanged.bind(this)} placeholder="בחר שכונה"
                                    disabled={!transferClustersSelected}
                                    inputStyle={this.notVaildForm ? { borderColor: 'red' } : {}}
                                />}
                            </div>
                        </div>
                    </div>
                </div>
            </ModalWindow>
        )
    }



}

export default TransferClustersModal;