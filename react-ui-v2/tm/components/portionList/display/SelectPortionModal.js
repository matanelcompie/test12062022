import React from 'react';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';

import ModalWindow from 'tm/components/common/ModalWindow';
import SelectPortionCombo from '../display/SelectPortionCombo';

import * as portionActions from 'tm/actions/portionActions';

class SelectPortionModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { choosenPortionKey: '' }
    }
    onChoosePortion(event) {
        this.setState({ choosenPortionKey: event.target.value })

    }
    onSavePortion() {
        this.props.savePortionCopy(this.state.choosenPortionKey);
    }
    render() {
        return (
            <ModalWindow
                show={this.props.show}
                title={"בחר מנה קיימת"}
                label={"בחר מנה"}
                buttonX={this.props.onCloseModal}
                buttonCancel={this.props.onCloseModal}
                buttonOk={this.onSavePortion.bind(this)}
                disabledOkStatus={this.state.choosenPortionKey ? '' : 'disabled'}
                children={
                    <div>
                        <SelectPortionCombo
                            portionList={this.props.portionList}
                            onChoosePortion={this.onChoosePortion.bind(this)}
                        />
                    </div>
                }
            />
        );
    }
}


function mapStateToProps(state) {
    return {
        portionList: state.tm.portion.portionGampaignList
    };
}
// function mapDispatchToProps(dispatch) {
//     return {
//         portionActions: bindActionCreators(portionActions, dispatch),
//     };
// }

// export default connect(mapStateToProps, mapDispatchToProps)(SelectPortionModal);
export default SelectPortionModal;
