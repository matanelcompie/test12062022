import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../../global/Combo';
import SupportStatusesComparisonGraph from './SupportStatusesComparisonGraph';
import * as ElectionsActions from '../../../../actions/ElectionsActions';

class SupportsComparison extends React.Component {
    constructor(props) {
        super(props);
        this.initConstants();
    }

    initConstants() {
        this.lineStyle={borderBottom:'#CCCCCC solid 1px' ,   padding:'0 10px' , margin:'0 -20px'};
    }

	/*
		Handles change of election campaign combo value
	*/
	electionCampaignChange(e){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'supportsComparisonScreen' ,  fieldName:'selectedCampaign' , fieldValue : {selectedValue:e.target.value , selectedItem:e.target.selectedItem} });
	}

	/*
		If total number is bigger that 1000 - it will convert it into number + K suffix format
	*/
	getTotalWithoutStatus(){
		let number = parseInt(this.props.supportsComparisonScreen.resultDataObject.without_status_count);
		if(number < 1000){
			return number.toString();
		}
		else{
			number = number / 1000;
			number = Math.round( number * 10 ) / 10;
			number = number + 'K';
			return number;
		}
	}
	
	/*
			Handles clicking "show" button
	*/
	loadDataPerElectionCampaign(){
		if(this.props.supportsComparisonScreen.selectedCampaign.selectedItem){
				let entityType = null;
				let entityKey = null;
				if(this.props.searchScreen.selectedArea.selectedItem){
					this.dataHeader = this.props.searchScreen.selectedArea.selectedItem.name;
					entityType = 0;
			
					entityKey = this.props.searchScreen.selectedArea.selectedItem.key;
				}
				if(this.props.searchScreen.selectedSubArea.selectedItem){}
				if(this.props.searchScreen.selectedCity.selectedItem){
					this.dataHeader = this.props.searchScreen.selectedCity.selectedItem.name;
					entityType = 1;
			
				entityKey = this.props.searchScreen.selectedCity.selectedItem.key;
				}
				if(this.props.searchScreen.selectedNeighborhood.selectedItem){
					this.dataHeader = this.props.searchScreen.selectedNeighborhood.selectedItem.name;
					entityType = 2;
			
					entityKey = this.props.searchScreen.selectedNeighborhood.selectedItem.key;
				}
				if(this.props.searchScreen.selectedCluster.selectedItem){
					this.dataHeader = this.props.searchScreen.selectedCluster.selectedItem.name;
					entityType = 3;
			
					entityKey = this.props.searchScreen.selectedCluster.selectedItem.key;
				}
				if(this.props.searchScreen.selectedBallotBox.selectedItem){
					this.dataHeader = this.props.searchScreen.selectedBallotBox.selectedItem.id;
					entityType = 4;
			
					entityKey = this.props.searchScreen.selectedBallotBox.selectedItem.key;
				}
				this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'supportsComparisonScreen' ,  fieldName:'resultDataObject' , fieldValue:null});
				ElectionsActions.loadSupportStatusesComparison( this.props.dispatch , entityType , entityKey , this.props.supportsComparisonScreen.selectedCampaign.selectedItem.key);
		}
	}
	
  
    render() {
			let resultDataObject = this.props.supportsComparisonScreen.resultDataObject;
            return (<div>
						<div className="dtlsBox-vote-dashboard support-box">
                        <div className="row" style={this.lineStyle}>
                            <div className="panelTitle col-lg-7 no-padding text-right">השוואת תמיכה</div>
                            <div className="left-panet-title col-lg-5 no-padding text-left">
                                <div>
									<Combo items={this.props.electionCampaigns.filter(function(item,index){return index > 0;})} placeholder="קמפיין בחירות" className="select-medium"   maxDisplayItems={5}  value={this.props.supportsComparisonScreen.selectedCampaign.selectedValue}  
												itemIdProperty="id" itemDisplayProperty='name' onChange={this.electionCampaignChange.bind(this)}  />
								</div>
                                <div>
                                    <button title="הצג" type="button" className="btn btn-primary btn-xs" disabled={!this.props.supportsComparisonScreen.selectedCampaign.selectedItem} onClick={this.loadDataPerElectionCampaign.bind(this)}>הצג</button>
                                </div>
                            </div>
                        </div>
						{!this.props.supportsComparisonScreen.resultDataObject ? <div style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i></div> : <div>
                        <div className="support-graph">
							<div className="row">
								<div className="col-lg-12" >
									<div style={{width:'15px' , height:'15px' , backgroundColor:'#f2b6bb' , display:'inline-block' , float:'right'}} > </div>
								 
									<div style={{display:'inline-block' , float:'right' , color:'#717171' , fontWeight:'600' , fontSize:'14px' , paddingRight:'7px' , marginTop:'-2px'}}>{this.props.supportsComparisonScreen.resultDataObject.previous_camp_name}</div>
										 
									<div style={{  display:'inline-block' , float:'right' , paddingRight:'10px'}} > <div style={{width:'15px' , height:'15px' , backgroundColor:'#b6ccef'}}></div></div>
								 
									<div style={{display:'inline-block' , float:'right' , color:'#717171' , fontWeight:'600' , fontSize:'14px' , paddingRight:'7px' , marginTop:'-2px'}}>מערכת בחירות נוכחית</div>
									
									<div style={{display:'inline-block' , float:'left' , marginLeft:'13px' , marginTop:'-4px'}}>
										<div style={{width:'138px',height:'25px' , border:'1px solid #d2d2d2' , color:'#717171' , paddingRight:'5px' , fontSize:'16px' , fontWeight:'600' , textAlign:'right'}}>
											{this.getTotalWithoutStatus()}
										&nbsp;
										ללא סטטוס
										</div>
									</div> 
								</div>
							</div>
							<SupportStatusesComparisonGraph
								data={[
									{ label: 'לא תומך', value: { current: resultDataObject.current_not_supporting_count, previous: resultDataObject.previous_not_supporting_count } },
									{ label: 'מהסס', value: { current: resultDataObject.current_hesitating_count, previous: resultDataObject.previous_hesitating_count } },
									{ label: 'פוטנציאל', value: { current: resultDataObject.current_potential_count, previous: resultDataObject.previous_potential_count } },
									{ label: 'תומך', value: { current: resultDataObject.current_support_count, previous: resultDataObject.previous_support_count } },
									{ label: 'תומך בטוח', value: { current: resultDataObject.current_sure_support_count, previous: resultDataObject.previous_sure_support_count } },
								]}
								style={{ clear: 'both' }}
								width={450}
								barWidth={30}
							/>
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
		electionCampaigns:state.elections.preElectionsDashboard.generalLists.electionCampaigns,
		supportsComparisonScreen:state.elections.preElectionsDashboard.supportsComparisonScreen,
		searchScreen:state.elections.preElectionsDashboard.searchScreen,
    }
}

export default connect(mapStateToProps) (withRouter(SupportsComparison));