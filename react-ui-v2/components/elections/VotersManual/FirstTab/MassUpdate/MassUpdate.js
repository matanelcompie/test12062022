import React from 'react';

import constants from 'libs/constants';

import StatusUpdate from './StatusUpdate';
import InstituteUpdate from './InstituteUpdate';
import GroupUpdate from './GroupUpdate';
import MoreInfoUpdate from './MoreInfoUpdate';
import BottomButtons from '../../BottomButtons'


class MassUpdate extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();

        this.state = {
            massUpdateType: this.massUpdateType.immediate
        };
    }

    initConstants() {
        this.massUpdateType = constants.massUpdateType;

        this.radioLabels = {
            manual: 'בצע עדכון פרטני עבור כל תושב חדש ברשימה',
            immediate: 'עדכון מיידי'
        };
    }

    massUpdateTypeChange(massUpdateType) {
        this.setState({massUpdateType});

        this.props.massUpdateTypeChange(massUpdateType);
    }

    validateVariables() {
        this.validInput = true;

        if ( !this.props.validateMassUpdate() ) {
            this.validInput = false;
        } else if (this.state.massUpdateType == this.massUpdateType.immediate && this.props.isMassUpdateEmptyFields() ) {
            this.validInput = false;
        }
    }

    render() {
        this.validateVariables();

        return (
            <div className={"row wizardTabs" + (this.props.display ? '' : ' hidden')}>
                <div className="tab-content tabContnt" id="tabMoreInfo">
                    <div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">
                        <StatusUpdate updateMassUpdateData={this.props.updateMassUpdateData.bind(this)}
                                      cleanData={this.props.cleanData.statusData}
                                      resetMassUpdateClean={this.props.resetMassUpdateClean.bind(this)}/>
                        <InstituteUpdate updateMassUpdateData={this.props.updateMassUpdateData.bind(this)}
                                         cleanData={this.props.cleanData.instituteData}
                                         resetMassUpdateClean={this.props.resetMassUpdateClean.bind(this)}/>
                        <GroupUpdate updateMassUpdateData={this.props.updateMassUpdateData.bind(this)}
                                     cleanData={this.props.cleanData.voterGroupData}
                                     resetMassUpdateClean={this.props.resetMassUpdateClean.bind(this)}/>
                        <MoreInfoUpdate updateMassUpdateData={this.props.updateMassUpdateData.bind(this)}
                                        cleanData={this.props.cleanData.moreInfoData}
                                        resetMassUpdateClean={this.props.resetMassUpdateClean.bind(this)}/>

                        <div className="row form-group nomargin">
                            <div className="col-lg-12 devider-line">
                                <div className="radio">
                                    <label>
                                        <input type="radio" checked={this.state.massUpdateType == this.massUpdateType.immediate}
                                               onChange={this.massUpdateTypeChange.bind(this, this.massUpdateType.immediate)}/>
                                        {this.radioLabels.immediate}
                                    </label>
                                </div>

                                <div className="radio">
                                    <label>
                                        <input type="radio" checked={this.state.massUpdateType == this.massUpdateType.manual}
                                               onChange={this.massUpdateTypeChange.bind(this, this.massUpdateType.manual)}/>
                                        {this.radioLabels.manual}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <BottomButtons isDisabled={!this.validInput} continueClick={this.props.continuteToNextStep.bind(this)}
                               backClick={this.props.cleanStepData.bind(this)} continueText="המשך"/>
            </div>
        );
    }
}

export default MassUpdate;