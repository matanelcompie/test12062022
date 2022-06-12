import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../../global/Combo';
import * as ElectionsActions from '../../../../actions/ElectionsActions';

class DriversAndTransportations extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
            return (<div>
						<div className="dtlsBox-vote-dashboard transportation-box" style={{height:'226px'}}>
							<div className="top-panel-vote-dashboard row">
								<div className="panelTitle col-lg-12 no-padding text-right">הסעות ונהגים</div>
							</div>
							{!this.props.transportationsScreenScreen.resultDataObject ? <div style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i></div> : <div>
								<div className="col-lg-3 text-center transportation-info no-padding">
									<div><img src={window.Laravel.baseURL+"Images/car-icon.png"} alt="הסעות" /></div>
									<div className="title-transportation-panel">הסעות</div>
									<div className="number-transportation-panel">{this.props.transportationsScreenScreen.resultDataObject.voter_transportations_count}</div>
								</div>
								<div className="col-lg-6 text-center transportation-info no-padding">
									<div><img src={window.Laravel.baseURL+"Images/steering-wheel-icon.png"} alt="הסעות" /></div>
									<div className="title-transportation-panel">נהגים / נהגים מתוקצבים</div>
									<div className="number-transportation-panel">{this.props.transportationsScreenScreen.resultDataObject.budgeted_drivers_count}/{this.props.transportationsScreenScreen.resultDataObject.drivers_count}</div>
								</div>
								<div className="col-lg-3 text-center transportation-info nopadding">
									<div><img src={window.Laravel.baseURL+"Images/driver-icon.png"} alt="הסעות" /></div>
									<div className="title-transportation-panel">הסעה לנהג</div>
									<div className="number-transportation-panel">{this.props.transportationsScreenScreen.resultDataObject.transportations_per_driver}</div>
								</div>
							</div>
							}
                        </div> 
			        </div>
					);
    }
}

function mapStateToProps(state) {
    return {
		transportationsScreenScreen:state.elections.preElectionsDashboard.transportationsScreenScreen,
    }
}

export default connect(mapStateToProps) (withRouter(DriversAndTransportations));