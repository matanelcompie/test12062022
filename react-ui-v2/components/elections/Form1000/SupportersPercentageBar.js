import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../global/Combo';
import * as ElectionsActions from '../../../actions/ElectionsActions';

class SupportersPercentageBar extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
    }
	
	initConstants(){
		this.styles={
			marginTop :{
				marginTop:'15px'
			} ,
			 rightGeneralInfo:{
				 width:'20%' ,
				 fontSize:'20px' ,
				 borderLeft:'1px solid #DCE2E0' 
			 },
			 bluePercentStyle : {
				 color:'#2AB4C0' , 
				 paddingRight:'3px'
			 } , 
			 progressBarGeneralStyle:{
				 width:'80%' , 
				 marginTop:'2px'
			 },
			 progressBarSideStyle:{ width:'5%'},
			 progressBarContentStyle:{ width:'90%'},
		}
	}
 
    render() {
        return (<div className="dtlsBox srchPanel first-box-on-page clearfix" style={this.styles.marginTop}>
		            <div className="row">
						<div className="col-md-2 no-padding" style={this.styles.rightGeneralInfo}>
							<span className="item-space large-title"><strong>אחוזי הצבעה תומכים</strong></span>
							<span className="green-text large-title" style={this.styles.bluePercentStyle}><strong>{this.props.searchResults.voted_support_status_percentage}%</strong></span>
						</div>
						<div className="col-sm-10" style={this.styles.progressBarGeneralStyle}>
						    <div>
								<div className="col-xs-1 no-padding text-left" style={this.styles.progressBarSideStyle}>0%</div>
								<div className="col-sm-10 no-padding" style={this.styles.progressBarContentStyle}>
									<div className="timeTprogress">                       
										<div className="progress">
											<div className="progress-bar" role="progressbar"  style={{width: (100-this.props.searchResults.voted_support_status_percentage) + '%'}}></div>
										</div>
									</div>
							    </div>
								<div className="col-sm-1 no-padding text-align" style={this.styles.progressBarSideStyle}>100%</div>
							</div>
				        </div>
					</div>
                </div>
        );
    }
}

function mapStateToProps(state) {
    return {
			   searchScreen:state.elections.form1000Screen.searchScreen,
			   searchResults:state.elections.form1000Screen.searchResults,
         
    }
}

export default connect(mapStateToProps)(withRouter(SupportersPercentageBar));