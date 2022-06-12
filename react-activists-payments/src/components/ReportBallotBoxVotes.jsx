import React, { useContext, useEffect, useState, useRef } from 'react';
import { CircularProgress, LinearProgress } from '@material-ui/core';
import { getListOfPlaces, useGetSummaryData } from '../hooks/useCall.jsx';
import { getBallotBoxVotesDetails } from '../hooks/reportVotesAction.jsx';
import { objectIsNotEmpty, numberWithCommas, formatNumberAfterPoint } from '../helpers/variousHelpers.js';
import Combo from '../components/global/Combo';
import ListPartyVotes from './ListPartyVotes.jsx';
import DetailsBallotVotes from './DetailsBallotVotes.jsx';



const ReportBallotBoxVotes = () => {
  const { summaryData, loadingSummary } = useGetSummaryData(); 
  const [loadingSummaryDelayed, setLoadingSummaryDelayed] = useState(true)
  const [area, setArea] = useState([]);
  const [subArea, setSubArea] = useState([]);
  const [cities, setCity] = useState([])
  const [clusters, setCluster] = useState([])
  const [ballotBoxes, setBallotBoxes] = useState([])

  const [selectedBallotBox, setBallot] = useState({name:'',id:''})
  const [selectedCluster, setSelectedCluster] = useState({name:'',id:''})
  const [selectedCity, setSelectedCity] = useState({name:'',id:''})
  const [selectedSubArea, setSelectedSubArea] = useState({name:'',id:''})
  const [selectedArea, setSelectedArea] = useState({name:'',id:''})
  const [BallotBoxDetails, setBallotVotesDetails] = useState(false)

  const [update, setUpdate] = useState(false);


  useEffect(() => {
    getCities();
    getArea();
  }, [])

  useEffect(() => {
    if (!loadingSummary) {
      setTimeout(() => {
        setLoadingSummaryDelayed(false);
      }, 1000);
    }
  }, [loadingSummary])




  const getArea=() =>{
    getListOfPlaces('getArea', null, null, true).then((allArea)=>{setArea(allArea.data.data)})
  }
  const selectArea= (e) =>{
    // debugger;
    let select=getSearchItem(e);
    setSelectedArea(select);
    
    setSubArea([]);
    setCluster([]);
    setBallotBoxes([]);

    setSelectedSubArea({name:'',id:''});
    setSelectedCity({name:'',id:''});
    setBallot({name:'',id:''});
    setSelectedCluster({name:'',id:''});

    if(select.key){
      // debugger
      getSubArea(select.key);
      getCities(select.id);
    }
  }

  const getSubArea= (areaKey) =>{
    getListOfPlaces('getSubArea',areaKey, null, true).then((subArea)=>{setSubArea(subArea.data.data)})
  }

  const selectSubArea=(e)=>{
  
   
    setCluster([]);
    setBallotBoxes([]);
   
    setSelectedCity({name:'',id:''});
    setBallot({name:'',id:''});
    setSelectedCluster({name:'',id:''});

    resetSearch();

    let select=getSearchItem(e);
    if(select.key)
    getCities(selectedArea.id,select.key);
    setSelectedSubArea(select);
  }


  const getCities= (areaId=null,subAreaKey=null) =>{
    // debugger
    if(subAreaKey)
    getListOfPlaces('getCitySubArea',areaId, subAreaKey, true).then((allCity)=>{setCity(allCity.data.data)})
    else if(areaId)
    getListOfPlaces('getCityArea',areaId, null, true).then((allCity)=>{setCity(allCity.data.data)})
    else
    getListOfPlaces('getCity', null, null, true).then((allCity)=>{setCity(allCity.data.data)})
  }

  const selectCity= (e) =>{
   
    setCluster([]);
    setBallotBoxes([]);
  
    setBallot({name:'',id:''});
    setSelectedCluster({name:'',id:''});

    resetSearch();

    let select =getSearchItem(e);
    setSelectedCity(select);
    if(select.key)
    getCluster(select.key);
  }

  const getCluster= (cityKey) =>{
    getListOfPlaces('getCluster',cityKey).then((AllCluster)=>{setCluster(AllCluster.data.data)})
  }

  const selectCluster= (e) =>{
  
    setBallotBoxes([]);
    setBallot({name:'',id:''});
    resetSearch();

    let select =getSearchItem(e);
    setSelectedCluster(select);
    if(select.key)
    getBallot(select.key);
  }

  const getBallot= (clusterKey) =>{
    getListOfPlaces('getBallotCluster',clusterKey).then((ballotBoxes)=>{setBallotBoxes(ballotBoxes.data.data)})
  }

  const selectBallot= (e) =>{
    resetSearch();

    let select =getSearchItem(e);
    setBallot(select);
    if(select.key)
    getBallot(select.key);
  }


 const getSearchItem = (e) =>{
  //  debugger
   var value=e.target.selectedItem?e.target.selectedItem:{name:e.target.value,id:''};
   return value;
 }

 const getDetailsBallotBox=()=>{
  //  debugger
   let ballot_box_id=selectedBallotBox.id;
   getBallotBoxVotesDetails(ballot_box_id).then((details)=>{
      setBallotVotesDetails(details.data.data);
   },function(err){
    //  debugger
   })
 }

 const resetSearch=()=>{
  setBallotVotesDetails(false);
 }



  return (
    <div style={{display:'flex',flexDirection:'column'}} className="con-report-ballot">
      
      <div className="container-search">
        <div style={{display:'flex'}}>
      
        <div className="conTitle">
          <label>אזור</label>
          <Combo  items={area} placeholder="בחר אזור"  value={selectedArea.name} onChange={selectArea.bind(this)}   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'/> 		
        </div>
        <div className="conTitle">
        <label>תת אזור</label>
        <Combo  items={subArea} placeholder="בחר תת אזור" value={selectedSubArea.name}  onChange={selectSubArea.bind(this)}   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'/>
        </div>
        <div className="conTitle">
        <label>עיר</label>	
        <Combo  items={cities} placeholder="בחר עיר"  value={selectedCity.name} onChange={selectCity.bind(this)}   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'/> 						   
        </div>
        <div className="conTitle">
        <label>אשכל</label>
        <Combo  items={clusters} placeholder="בחר אשכול"  value={selectedCluster.name} onChange={selectCluster.bind(this)}   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'/> 
        </div>
        <div style={{margin:'0px'}} className="conTitle">
        <label>קלפי</label>
        <Combo  items={ballotBoxes} placeholder="בחר קלפי"  value={selectedBallotBox.name} onChange={selectBallot.bind(this)}   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'/> 
        </div>
        </div>
        <div className="conBtnSearch">
        <button onClick={getDetailsBallotBox.bind(this)} type="button" class="btn btn-secondary btn-sm">המשך</button>
        </div>
      </div>
    {BallotBoxDetails?(
        <div className="detailsBallot">
        <div className="det">
           <label className="bTit">{selectedCluster.name} -  קלפי {selectedBallotBox.name}</label>
          <div style={{display:'flex'}}>
         <label className="countHaveVote">{BallotBoxDetails.count_voters_ballot}</label>   <label style={{marginRight:'5px'}}>בעלי זכות בחירה.</label>
          </div>
          
        </div>
      </div>
    ):''}
    
    {BallotBoxDetails?( <DetailsBallotVotes BallotBoxId={selectedBallotBox.id} details={BallotBoxDetails}></DetailsBallotVotes> ):''}
          {BallotBoxDetails?(
          
          <div className="conList">
          <label className="titParties">רשימת המפלגות</label>
        <ListPartyVotes ballotBoxId={selectedBallotBox.id} listParty={BallotBoxDetails.list_parties_ballot}></ListPartyVotes> 
        
     </div>):''}

    
      
    </div>
  )
}

export default ReportBallotBoxVotes;
