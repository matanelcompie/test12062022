import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ReactSpeedometer from "react-d3-speedometer";
import Gauge from "components/global/D3/Gague/Gauge";
import Combo from '../../../global/Combo';
import * as ElectionsActions from '../../../../actions/ElectionsActions';

class SupportStatusesSpeedGraph extends React.Component {
    constructor(props) {
        super(props);
        this.initConstants();
    }

	/*
		Init constant variables : 
	*/
    initConstants() {
        this.blueArcColor = "#165e91";
        this.greenArcColor = "#005812";
        this.greyArcBG = "#eceeef";
    }
	
	/*
		Get ratio between current campaign's supporters and potentials
	*/
	getCurrentSupportersPercentage(){
		let value = 0;
		if(this.props.speedometerScreen.totalSupporters > 0 && this.props.speedometerScreen.totalPotential > 0){
			value = parseInt(this.props.speedometerScreen.totalSupporters)/parseInt(this.props.speedometerScreen.totalPotential);
			value = Math.round(value * 100) / 100;
			value -= 0.01;
		}
		if(value > 1){
			value = 1;
		}
		return value;
	}

	/*
		Get ratio between previous campaign's supporters and voters
	*/
	getPreviousVotesPercentage(){
		let value = 0;
		if(this.props.speedometerScreen.totalSupporters > 0 && this.props.speedometerScreen.previousVotesCount > 0){
			value = parseInt(this.props.speedometerScreen.totalSupporters)/parseInt(this.props.speedometerScreen.previousVotesCount);
			value = Math.round(value * 100) / 100;
			value -= 0.01;
		}
		if(value > 1){
			value = 1;
		}

		return value;
	}
  
  
	/*
		Get ratio between previous campaign's supporters and voters - AS ARRAY
	*/
	getPreviousVotesArray(){
		let value = 0;
		let returnedArray = [];
		if(this.props.speedometerScreen.totalSupporters > 0 && this.props.speedometerScreen.previousVotesCount > 0){
			value = this.props.speedometerScreen.totalSupporters/this.props.speedometerScreen.previousVotesCount;
			value = Math.round(value * 100) / 100;
		}
		value = value * 100;
		for(let i = 0 ; i < value ; i++ ){
			returnedArray.push(this.greenArcColor);
		}
		for(let i = value ; i < 100 ; i++ ){
			returnedArray.push(this.greyArcBG);
		}
		return returnedArray;
	}
	
	/*
		Get ratio between current campaign's supporters and potentials - AS ARRAY
	*/
	getCurrentSupportersArray(){
		let value = 0;
		let returnedArray = [];
		if(this.props.speedometerScreen.totalSupporters > 0 && this.props.speedometerScreen.totalPotential > 0){
			value = this.props.speedometerScreen.totalSupporters/this.props.speedometerScreen.totalPotential;
			value = Math.round(value * 100) / 100;
		}
		value = value * 100;
		for(let i = 0 ; i < value ; i++ ){
			returnedArray.push(this.blueArcColor);
		}
		for(let i = value ; i < 100 ; i++ ){
			returnedArray.push(this.greyArcBG);
		}
		return returnedArray;
	}
  
    render() {
		let notLoadedYet = (this.props.speedometerScreen.totalSupporters == -1 || this.props.speedometerScreen.totalPotential == -1 || this.props.speedometerScreen.previousVotesCount == -1 || this.props.speedometerScreen.previousSupportersCount == -1 || this.props.speedometerScreen.previousVotesCount == -1 || this.props.speedometerScreen.previousSupportersCount == -1);
            return (<div>
						<div className="dtlsBox sum-box">
					       {notLoadedYet &&  <div className="row" style={{textAlign:'center' ,fontSize:'40px' ,   width:'100%'}}><div className="col-lg-12" ><i className="fa fa-spinner fa-spin"></i></div></div> }
						
						   {!notLoadedYet && <div className="potential-box">
								<div className="img-sum-box"><img src={window.Laravel.baseURL+"Images/electors-icon.png"} alt="בוחרים פוטנציאליים" /></div>
								<div className="numbers-potential">{this.props.speedometerScreen.totalPotential == -1 ? <i className="fa fa-spinner fa-spin"></i> : this.props.speedometerScreen.totalPotential.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")  }</div>
								<div className="text-potential ">בוחרים פוטנציאליים</div>
						   </div>}
							{!notLoadedYet && <div className="potential-graph">
								<div className="box">
									{(this.props.speedometerScreen.totalSupporters == -1 || this.props.speedometerScreen.totalPotential == -1) ?<i className="fa fa-spinner fa-spin" style={{fontSize:'40px'}}></i> :<Gauge value={this.getCurrentSupportersPercentage()}
											size={23}
											radius={77}
											sections={this.getCurrentSupportersArray()}
											arrow={{height: 60, width: 6, color: "#000"}}
											legend={[]}
											label="15%"
									/>}
								</div>
							</div>}
							{!notLoadedYet && <div className="row" style={{width:'230px'}}>
								<div className="col-lg-1 text-right no-padding" style={{paddingTop:'40px' }} ><img src={window.Laravel.baseURL+"Images/arrow-r.png"} alt="תומכים" /></div>
								<div className="col-lg-10 no-padding" style={{textAlign:'center' }}>
										<div className="img-sum-box"><img src={window.Laravel.baseURL+"Images/up-icon.png"} alt="תומכים" /></div>
										<div className="numbers-supporters">{this.props.speedometerScreen.totalSupporters == -1 ? <i className="fa fa-spinner fa-spin"></i> : this.props.speedometerScreen.totalSupporters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")  }</div>
										<div className="text-supporters">תומכים</div>
								</div>
								<div className="col-lg-1 text-left no-padding" style={{paddingTop:'40px'}} ><img src={window.Laravel.baseURL+"Images/arrow-l.png"} alt="תומכים" /></div>
							</div>}
							{!notLoadedYet && <div className="potential-graph">
								<div className="box">
									{(this.props.speedometerScreen.previousVotesCount == -1 || this.props.speedometerScreen.previousSupportersCount == -1) ? <i className="fa fa-spinner fa-spin"  style={{fontSize:'40px'}}></i> : <Gauge value={this.getPreviousVotesPercentage()}
											size={23}
											radius={77}
											sections={this.getPreviousVotesArray()}
											arrow={{height: 60, width: 6, color: "#000"}}
											legend={[]}
											label="15%"
									/>}
								</div>
							</div>}
							{!notLoadedYet && <div className="potential-box">
								<div className="img-sum-box"><img src={window.Laravel.baseURL+"Images/shas-icon.png"} alt="תושבים פוטנציאליים" /></div>
								<div className="numbers-previous">{this.props.speedometerScreen.previousVotesCount == -1 ? <i className="fa fa-spinner fa-spin"></i> : this.props.speedometerScreen.previousVotesCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
								<div className="text-previous">מצביעי בחירות קודמות</div>
							</div>}
							
						 
                        </div>
			        </div>
					);
         
    }
}

function mapStateToProps(state) {
    return {
		speedometerScreen:state.elections.preElectionsDashboard.speedometerScreen,
    }
}

export default connect(mapStateToProps) (withRouter(SupportStatusesSpeedGraph));