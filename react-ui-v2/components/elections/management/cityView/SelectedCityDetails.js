import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {thousandsSeparatesForInteger} from 'libs/globalFunctions';

class SelectedCityDetails extends React.Component {

    constructor(props) {
        super(props);
    }
	
	/*
	   calculate  some things - total number of ballot boxes , total number of voters
	*/
	performDataCalculations(){
		let ballotBoxesCount = 0;
		let ballotVotersCount = 0;
		this.activatedBallotBoxesCount = 0;
		this.allocatedBallotsBoxesCount = 0;
		this.allocateBallotsBoxesPercentage = 0;
		for(let i = 0 ; i < this.props.clusters.length;i++){
			
			ballotBoxesCount += parseInt(this.props.clusters[i].ballot_boxes_count);
			ballotVotersCount  += parseInt(this.props.clusters[i].total_voters_count);
			
		}
		for(let i = 0 ; i <this.props.clusters_activated_ballots_countings.length ; i++){
			this.activatedBallotBoxesCount += parseInt(this.props.clusters_activated_ballots_countings[i].activated_ballots_count);
			this.allocatedBallotsBoxesCount += parseInt(this.props.clusters_activated_ballots_countings[i].allocated_ballots_count);
		}
		if(this.activatedBallotBoxesCount > 0  && this.allocatedBallotsBoxesCount > 0){
			this.allocateBallotsBoxesPercentage  = (this.allocatedBallotsBoxesCount * 100)/ this.activatedBallotBoxesCount;
        }
        this.ballotBoxesCount = ballotBoxesCount;
        this.ballotVotersCount = thousandsSeparatesForInteger(ballotVotersCount);
    }
	
	/*
	Handles exporting all ballots to excel
	*/
	exportToExcel() {
		let url = (window.Laravel.baseURL + 'api/elections/management/city_view/' + this.props.searchScreen.selectedCity.selectedItem.key + '/export?type=excel');
		window.open(url, '_blank');
	}


    render() {
        console.log(this.props.electionsActivistsSummary)
		this.performDataCalculations();
        return (
            <div className="dtlsBox electorDtlsStrip clearfix">
            <div className="flexed flexed-space-between electorDtlsData">
                <div className="city-name-content">
                    <div className="city-name">{this.props.searchScreen.selectedCity.selectedItem?this.props.searchScreen.selectedCity.selectedItem.name:''}</div>
                </div>
                <div className="info-items">
                    <dl className="flexed item-space">
                        <dt className="narrow-profit">אשכולות</dt>
                        <dd>{this.props.clusters.length}</dd>
                    </dl>
                    <dl className="flexed item-space">
                        <dt className="narrow-profit">קלפיות</dt>
                        <dd>{this.ballotBoxesCount}</dd>
                    </dl>
                </div>
                <div className="info-items">
                    <dl className="flexed item-space">
                        <dt className="narrow-profit">תושבים</dt>
                        <dd>{this.ballotVotersCount}</dd>
                    </dl>
                    <dl className="flexed item-space">
                        <dt className="narrow-profit">בוחרי ש"ס</dt>
                        <dd>{thousandsSeparatesForInteger(this.props.numOfShasVotersThisCampaign)}</dd>
                    </dl>
                </div>
                <div className="progress-item">
                    <dl className="flexed-center">
                        <dt>קלפיות ששובצו</dt>
                        <dd className="progressBarData flexed-center clearfix">
                            <div className="progress item-space">
                                <div className="progress-bar progress-bar-striped active" role="progressbar"
                                     aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{width: (this.allocateBallotsBoxesPercentage+'%')}}></div>
                            </div>
                            <div className="householdCounterStatus">{this.allocatedBallotsBoxesCount}/{this.activatedBallotBoxesCount}</div>
                        </dd>
                    </dl>
                </div>
				<div style={{paddingTop:'10px' , marginLeft:'10px'}}>
					<a onClick={this.exportToExcel.bind(this)} title="יצוא ל-אקסל" className={"icon-box excel cursor-pointer" }></a>
				</div>
            </div>
        </div>
        );
    }
}

function mapStateToProps(state) {
    return {
		    clusters:state.elections.managementCityViewScreen.clusters,
            searchScreen:state.elections.managementCityViewScreen.searchScreen,
            electionsActivistsSummary:state.elections.managementCityViewScreen.electionsActivistsSummary,
			numOfShasVotersThisCampaign:state.elections.managementCityViewScreen.numOfShasVotersThisCampaign,
			clusters_activated_ballots_countings : state.elections.managementCityViewScreen.clusters_activated_ballots_countings,
    }
}

export default connect(mapStateToProps)(withRouter(SelectedCityDetails));