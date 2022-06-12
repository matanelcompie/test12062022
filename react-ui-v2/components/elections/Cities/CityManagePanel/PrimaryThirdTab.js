import React from 'react';
import { connect } from 'react-redux';
import { withRouter , Link } from 'react-router';

import * as ElectionsActions from '../../../../actions/ElectionsActions';
import ModalWindow from '../../../global/ModalWindow';
import KnessetDataRow from './PrimaryThirdTabSubTabs/KnessetDataRow';
import MunicipalDataRow from './PrimaryThirdTabSubTabs/MunicipalDataRow';

class PrimaryThirdTab extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
    }
	

	/*
	function that initializes constant variables 
	*/
    initConstants() {
          this.greyBorderStyle={borderLeft:'1px solid #cccccc'};
		  this.paddedContent = {paddingRight:'10px'};
	}
	 
	 
 
	 /*
	function that sets dynamic items in render() function : 
	*/
    initDynamicVariables() {
 
       if(this.props.historicalElectionCampaigns.length > 0){
         let self = this;
		 this.globalElectionCampaignsListRows = this.props.historicalElectionCampaigns.map(function (item , index){
              if(item.type == 0){
                   return <KnessetDataRow index={index} key={index} item={item} 
                                          historicalElectionCampaignsVotesData={self.props.historicalElectionCampaignsVotesData}
                                          greyBorderStyle = {self.greyBorderStyle}
                                          paddedContent = {self.paddedContent}
                                        />
              }
              else {return null;}
         });


         this.municipalElectionCampaignsListRows = this.props.historicalElectionCampaigns.map(function (item , index){
              if(item.type == 1){
                   return <MunicipalDataRow index={index} key={index} item={item} historicalElectionCampaignsVotesData={self.props.historicalElectionCampaignsVotesData} />
              }
              else {return null;}
         });
		}

        else{
                  this.globalElectionCampaignsListRows = <i className="fa fa-spinner fa-spin"></i>;
                  this.municipalElectionCampaignsListRows = <i className="fa fa-spinner fa-spin"></i>;

         }

       this.nationalDataItem= null;
       this.municipalDataItem=null;
       if( this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.vote_results.national'] == true ){
			this.nationalDataItem = <div className="collapse-all-content dividing-line">
                                    <a title="נתוני בחירות לכנסת" data-toggle="collapse" href="#Main-Tab4-collapse-tabs-1" aria-expanded="true">
                                        <div className="panelCollapse">
                                            <div className="collapseArrow closed" style={{marginRight:'0'}}></div>
                                            <div className="collapseArrow open" style={{marginRight:'0'}}></div>
                                            <div className="collapseTitle">
                                                <span>נתוני בחירות לכנסת</span>
                                            </div>
                                        </div>
                                    </a>
                                   
                                    <div id="Main-Tab4-collapse-tabs-1" className="collapse in" aria-expanded="true">
                                        <div className="panelContent">
                                            {this.globalElectionCampaignsListRows}
                                           
                                        </div>
                                    </div>
                                </div>;
       }
       if( this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.cities.vote_results.municipal'] == true ){        
			this.municipalDataItem=<div><a title="מועמדים למועצת העיר" data-toggle="collapse" href="#Main-Tab4-collapse-tabs-2" aria-expanded="true">
                                    <div className="panelCollapse">
                                        <div className="collapseArrow closed" style={{marginRight:'0'}}></div>
                                        <div className="collapseArrow open" style={{marginRight:'0'}}></div>
                                        <div className="collapseTitle">
                                            <span>נתוני בחירות מוניציפליות</span>
                                        </div>
                                    </div>
                                </a>
                                 
                                <div id="Main-Tab4-collapse-tabs-2" className="collapse in" aria-expanded="false">
                                    <div className="panelContent">
                                        {this.municipalElectionCampaignsListRows}  
                                    </div>
                                </div></div>;
     }
    }
	
 
    render() {
       
        this.initDynamicVariables();
        return (
		
           
                        <div className="containerStrip tabContnt"  style={{borderTopColor:'transparent'}}>
                            <div className="row panelContent">
                                {this.nationalDataItem}
                                
                                {this.municipalDataItem}
                            </div>
                        </div>
          
 	   
     
        );
    }
}


function mapStateToProps(state) {
    return {
	   currentUser: state.system.currentUser,
	   historicalElectionCampaigns:state.elections.citiesScreen.cityPanelScreen.historicalElectionCampaigns,
       historicalElectionCampaignsVotesData:state.elections.citiesScreen.cityPanelScreen.historicalElectionCampaignsVotesData,
    }
}

export default connect(mapStateToProps)(withRouter(PrimaryThirdTab));