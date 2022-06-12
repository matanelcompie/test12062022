import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../global/Combo';
import * as ElectionsActions from '../../../actions/ElectionsActions';

class BallotboxInfoPanel extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
    }
	
	initConstants(){
		this.styles={
			greenTitle:{
				  fontSize: '30px',
                  fontWeight: '600',
                  color: '#2AB4C0',
				  marginBottom:'15px',
				  
			},
			splittedBorderStyle:{
				borderLeft:'1px solid #DCE2E0' ,
				marginLeft:'30px' ,
				paddingLeft:'20px'
			},
			mediumFont:{
				fontSize:'18px'
			},
			scrollTableStyle : {
				overflowY:'scroll' , 
				paddingLeft:'0' ,
				height:'120px'				
			}
		}
	}
 
    /*
	Handles clicking on voter - transferring to voter page
	*/
    gotoVoter(voterKey){
		this.props.router.push('elections/voters/' + voterKey);
	}
 
    render() {
		let self = this;
        return (<div className="dtlsBox srchPanel first-box-on-page clearfix" style={{marginTop:'15px'}}>
            <div>
				<div className="row">
					<div className="col-lg-6">
						<div className="row flexed">
							<div className="col-lg-4 title-content" style={this.styles.splittedBorderStyle}>
								<div style={this.styles.greenTitle}>קלפי {this.props.searchScreen.selectedBallotbox.selectedValue}</div>
									<div className="info-items">
										<div className="flexed flexed-space-between">
											<span className="item-space">שעת דיווח אחרונה</span>
											<strong>{(this.props.searchResultsScreen.last_vote_date ? this.props.searchResultsScreen.last_vote_date.split(' ')[1] : '')}</strong>
										</div>
									<div className="flexed flexed-space-between">
										<span className="item-space">שם מדווח</span>
										<strong>{this.props.searchResultsScreen.last_vote_voter}</strong>
									</div>
								</div>
							</div>
							<div className="info-items col-lg-6">
								<div className="flexed flexed-space-between" style={this.styles.mediumFont}>
									<div>
										<p>עיר</p>
										<p>אשכול</p>
										<p>כתובת</p>
									</div>
									<div>
										<p><strong>{this.props.searchResultsScreen.city_name}</strong></p>
										<p><strong>{this.props.searchResultsScreen.cluster_name}</strong></p>
										<p><strong>{this.props.searchResultsScreen.cluster_address}</strong></p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-6 table-minimum-height" style={this.styles.scrollTableStyle}>
						<table className="table table-striped line-around tableNoMarginB">
							<thead>
								<tr>
									<th>שם התפקיד</th>
									<th>משמרת</th>
									<th>שם פעיל</th>
									<th>נייד</th>
								</tr>
							</thead>
							<tbody>
							{this.props.searchResultsScreen.role_shifts.length == 0 ? <tr><td colSpan="4" style={{textAlign:'center'}}>לא הוגדרו תפקידים</td></tr> : null}
							{this.props.searchResultsScreen.role_shifts.map(function(item,index){
								return <tr key={index}>
											<td>{item.role_name}</td>
											<td>{item.role_shift_name}</td>
											<td><a style={{cursor:'pointer'}} onClick={self.gotoVoter.bind(self , item.voter_key)}>
											{item.first_name + ' ' + item.last_name}</a></td>
											<td><a>{item.phone_number}</a></td>
										</tr>
							})}	 
							</tbody>
						</table>
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
			   searchResultsScreen:state.elections.form1000Screen.searchResults,
         
    }
}

export default connect(mapStateToProps)(withRouter(BallotboxInfoPanel));