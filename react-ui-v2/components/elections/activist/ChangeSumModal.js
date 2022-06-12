import React from 'react'

import ModalWindow from 'components/global/ModalWindow'

class ChangeSumModal extends React.Component {

	constructor(props) {
		super(props);
		let initSum = 0
		console.log(this.props.electionRoleGeo ,this.props.electionRole)
		if(this.props.electionRole && !this.props.electionRoleGeo){
			initSum = this.props.electionRole.sum;
		} else if(this.props.electionRoleGeo){
			initSum = this.props.electionRoleGeo.sum;
		}
		this.state = {sum: initSum};
	}

	/**
	 * Change sum
	 *
	 * @param event e
	 * @return void
	 */
	changeSum(e) {
		this.setState({
			sum: e.target.value
		});
	}

	/**
	 * Set render variables
	 * 
	 * @return void
	 */
	setVariables() {
		this.titleText = "שינוי סכום לפעיל " + this.props.fullName
	}

	/**
	 * Update activist sum
	 *
	 * @return void
	 */
	updateSum() {
		this.props.updateSum(this.state.sum);
		this.props.closeChangeSumModal();
	}

	/**
	 * Check if sum is integer > 0
	 *
	 * @return void
	 */
	isSumOk() {
		if (typeof this.state.sum == "string" && this.state.sum.trim() == "") {
			this.validSum = false;
			return;
		}
		let sumNumber = Number(this.state.sum);
		if (Number.isInteger(sumNumber) && sumNumber >= 0) {
			this.validSum = true;
		} else {
			this.validSum = false;
		}
	}
	
	render() {
		this.setVariables();
		this.isSumOk();
		return (
			<ModalWindow
				show={true}
				title={this.titleText}
				buttonOk={this.updateSum.bind(this)}
				disabledOkStatus={!this.validSum}
				showCancel={true}
				buttonCancel={this.props.closeChangeSumModal}
				buttonX={this.props.closeChangeSumModal}>
				<div className="containerStrip">
					<div className="row">
						<div className="col-md-12">
							<div className="form-group">
								<label htmlFor="input-change-sum" className="col-lg-2 control-label">סכום</label>
								<div className="col-lg-10">
									<input type="text" 
											className="form-control"
											id="input-change-sum"
											value={this.state.sum}
											onChange={this.changeSum.bind(this)}/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ModalWindow>
		)
	}
}

export default ChangeSumModal