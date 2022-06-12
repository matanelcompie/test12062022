import React from 'react';

import ModalWindow from 'components/global/ModalWindow';


class UpdateCityClustersPrefixModal extends React.Component {
    initState = { radioButtonChecked: 0 };
    constructor(props) {
        super(props);
        this.modalName = 'cityClusters';
        this.modalTitle = 'עדכון רוחבי לשמות אשכול לכל אשכולות העיר';
        this.modalTextsOptions = {
            'prefixByNeighborhood': { label: 'תחילית לפי שם השכונה, אשכולות ללא שכונה יקבלו את שם העיר', value: 0 },
            'prefixByNeighborhoodOnly': { label: 'תחילית לפי שם השכונה, אשכולות ללא שכונה יישארו ללא שינוי', value: 1 },
            'clearAllPrefix': { label: 'איפוס שמות כל האשכולות', value: 2 },
        }
        this.actionList=['update_by_neighborhood_and_city','update_by_neighborhood_only','reset_all_city_prefix'];
        this.state = { ...this.initState };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal && !this.props.showModal) {
            this.setState({ ...this.initState });
        }
    }
    radioButtonChanged(radioValue) {
        this.setState({ radioButtonChecked: radioValue });
    }
    render() {
        return (
            <ModalWindow show={this.props.showModal}
                buttonOk={this.props.onSubmit.bind(this, this.modalName, this.actionList[this.state.radioButtonChecked])}
                buttonCancel={this.props.onClose.bind(this, this.modalName)}
                buttonX={this.props.onClose.bind(this, this.modalName)}
                disabledOkStatus={false}
                style={{ zIndex: '9001' }}
                title={this.modalTitle}
            >
                <div className="modal-body">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="radio">
                                <label><input type="radio" name="cityClustersOptions" checked={this.state.radioButtonChecked == 0}
                                    onChange={this.radioButtonChanged.bind(this, 0)} /> {this.modalTextsOptions.prefixByNeighborhood.label}</label>
                            </div>
                            <div className="radio">
                                <label><input type="radio" name="cityClustersOptions" checked={this.state.radioButtonChecked == 1}
                                    onChange={this.radioButtonChanged.bind(this, 1)} /> {this.modalTextsOptions.prefixByNeighborhoodOnly.label}</label>
                            </div>
                            <div className="radio">
                                <label><input type="radio" name="cityClustersOptions" checked={this.state.radioButtonChecked == 2}
                                    onChange={this.radioButtonChanged.bind(this, 2)} />
                                    <span style={{ padding: '5px 10px', 'backgroundColor': '#FFE0B2' }}>
                                        {this.modalTextsOptions.clearAllPrefix.label}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalWindow>
        )
    }



}

export default UpdateCityClustersPrefixModal;