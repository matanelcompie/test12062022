import React ,{useState,useContext,useEffect  } from 'react';
import { connect,useDispatch } from 'react-redux';
import { withRouter } from 'react-router';

import constants from '../../libs/constants';
import * as staticLists from '../../libs/staticLists.js';
import * as validationFunction from '../../libs/validation';
import { arraySort, isLandPhone, isMobilePhone } from '../../libs/globalFunctions';

import Combo from '../../components/global/Combo';
import * as ElectionsActions from '../../actions/ElectionsActions';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Button from '@material-ui/core/Button';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useSelector } from 'react-redux'
import {searchObject} from '../../services/SearchActivist/ObjectSearch.jsx'


//action
import * as SystemActions from '../../actions/SystemActions.js';
import * as GlobalListAction from '../../actions/GlobalListAction.js';
//reducer
import SearchReducer  from '../../reducers/SearchReducer.js'





export default function SearchActivistPayment(props) {
 
  const [openSearch, setOpenSearch] =useState(true);
  const [openAnotherSearch, setOpenAnotherSearch]=useState(false);
  const [validSearch, setValidSearch]=useState(false);
  
  const [LoadList,setLoadList]=useState(false);
  //redux
  const dispatch = useDispatch()
  const currentCampaign=useSelector(state=>state.system.currentCampaign);
  

  //list combo
  const [assignmentStatusArr]=useState(staticLists.assignmentStatusArr());
  const [paymentElectionRoleArr]=useState(staticLists.paymentStatus());
  const [bankVerifyStatusArr]=useState(staticLists.bankVerifyStatusArr());
  const [closeActivistRoleArr]=useState(staticLists.closeActivistRoleArr());

  const [geoArr, setGeoArr]=useState([]);
  const [areaArr, setAreaArr]=useState([]);
  const [citiesArr, setCitiesArr]=useState([]);
  const [subAreaArr, setSubAreaArr]=useState([]);
  const [electionRoleArr, setElectionRoleArr]=useState([]);
  const [electionCampaignArr, setElectionCampaignArr]=useState([]);
  const [paymentTypeAdditionalArr, setPaymentTypeAdditionalArr]=useState([]);
  const [cleanAllSelect, setCleanAllSelect] = useState(false)
  const [resetAllCombo, setResetAllCombo] = useState(false)

  

  //--searchObjectDetails
  const [MySearchObject,setMySearchObject]=useState(new searchObject());

  useEffect(() => {
      if(!LoadList && currentCampaign.id)
        LoadDetailsListForSearch();
  }, [currentCampaign]);

  useEffect(() => {
    isValidSearch();
}, [MySearchObject]);

useEffect(() => {
    if(cleanAllSelect==true)
    setResetAllCombo(true);
}, [cleanAllSelect]);

  
  const LoadDetailsListForSearch=()=>{
     //list geo details
    SystemActions.loadUserGeographicFilteredLists(dispatch, 'elections.activists').then(function(listGeo){
        setGeoArr(listGeo);
        setAreaArr(listGeo.areas);
        setCitiesArr(listGeo.cities);
        setLoadList(true);
        
    });
    //list election Role
    GlobalListAction.electionRoles().then(list=>{
        //only all election role option;
        var listAnotherOption=staticLists.electionRolesAdditionsList().filter(a=>a.id!=-2 && a.id!=-1);
        list=listAnotherOption.concat(list);
        setElectionRoleArr(list)
    });

    //list election campaign
    GlobalListAction.electionCampaignList().then(list=>{
        var index=list.findIndex(a=>a.id==currentCampaign.id);
        setDefaultValueInSearchObject('election_campaign_id',list[index].id,list[index].name);
        setElectionCampaignArr(list)
    });

    //list payment additional
    GlobalListAction.paymentTypeAdditionalList().then(list=>{
        debugger
        setPaymentTypeAdditionalArr(list)
    });
    
    
  }


    const setDefaultValueInSearchObject=(nameFiled,valueId,valueName)=>{
        var searchObject={...MySearchObject};
        searchObject[nameFiled]={id:valueId,name:valueName};
        setMySearchObject(searchObject);
    }

    const openSearchDetails=(e)=>{
   
    var open=openSearch;
    setOpenSearch(!open);
    }

    const openAnotherDetails=(e)=>{
   
        var open=openAnotherSearch;
        setOpenAnotherSearch(!open);
        }

    const changeArea=(list,fieldSearchObject,idField,nameField,event)=>{
        var areaSelect=comboChange(list,fieldSearchObject,idField,nameField,event);
        //filter subArea
        var subAreaList=[...geoArr.sub_areas];
        if(subAreaList.length>0){
            var subAreaList=areaSelect?subAreaList.filter(a=>a.area_id==areaSelect.id):[];
            setSubAreaArr(subAreaList);
        }
        //filter city
        if(geoArr.cities.length>0){
            var cities=areaSelect?geoArr.cities.filter(a=>a.area_id==areaSelect.id):[];
            setCitiesArr([...cities]);
        }
      
    }

    const changeSubArea=(list,fieldSearchObject,idField,nameField,event)=>{
        var SubAreaSelect=comboChange(list,fieldSearchObject,idField,nameField,event);
        //filter city
        if(geoArr.cities.length>0){
            var cities=SubAreaSelect?geoArr.cities.filter(a=>a.sub_area_id==SubAreaSelect.id):[];
            setCitiesArr([...cities]);
        }
    }


    const comboChange=(list,fieldSearchObject,idField,nameField,event)=>{
        debugger
        let fieldValue = event.target.value;
        let index=list.findIndex(a=>a[nameField]==fieldValue)
        var itemCombo=list[index];
       
        var objectSearch={...MySearchObject};
        if(!itemCombo)
        objectSearch[fieldSearchObject]={id:null,name:fieldValue};
        else
        objectSearch[fieldSearchObject]={id:itemCombo[idField],name:itemCombo[nameField]};
        setMySearchObject(objectSearch);

        return itemCombo;
    }  

   
    const comboMultiChange=(fieldSearchObject,nameIdItem,nameFieldItem, event)=>{
		
            let arrSelected=event.target.selectedItems;
            let stringValue='';
            let arrValueIdSelect=arrSelected.map(item=>{return item[nameIdItem]})
            //string of value element select
            arrSelected.forEach(element => {
                stringValue=stringValue==''?element[nameFieldItem]:stringValue+', '+element[nameFieldItem];
            });

            var objectSearch={...MySearchObject};
            objectSearch[fieldSearchObject]={id:arrValueIdSelect,name:stringValue}
            setMySearchObject(objectSearch);
        }
    

    //function event on change input search the function change the attribute id
    const inputChange=(fieldSearchObject,nameValidationFunction=false,event)=>{
        var isValid=true;
        let fieldValue = event.target.value;
        if(nameValidationFunction)
        isValid=validationFunction[nameValidationFunction](fieldValue);

        
        var objectSearch={...MySearchObject};
        objectSearch[fieldSearchObject].id=fieldValue;
        objectSearch[fieldSearchObject].error=isValid?false:true;
     
        setMySearchObject(objectSearch);
    } 

    
    const resetSearchFields=()=>{
        var resetSearchObject=new searchObject();
        setMySearchObject(resetSearchObject);
        setCleanAllSelect(true);
    }

    const searchElectionsActivists=()=>{
        var searchIdObject={};
        
        Object.keys(MySearchObject).forEach((fieldSearch) => {
            searchIdObject[fieldSearch]=MySearchObject[fieldSearch].id;
        });

        dispatch({type:{actionName:'setSearchObjectInStore'},searchObject:searchIdObject});
        //openSearchDetails()
    }



    const isValidSearch=()=>{
        if(MySearchObject.reference_id.id && MySearchObject.reference_id!='')
        return true;

        if(MySearchObject.election_role_id.id=='' || !MySearchObject.election_role_id.id || MySearchObject.election_role_id.id.length==0)
        return false;

        if(MySearchObject.election_campaign_id.id=='' || !MySearchObject.election_campaign_id.id)
        return false;
       
        if(MySearchObject.election_role_id.id && MySearchObject.election_role_id.id[0]==-1)//ללא תפקיד
        {
            var needError=MySearchObject.phone_number.id=='' && (MySearchObject.last_name.id=='' ||  MySearchObject.first_name.id=='') &&MySearchObject.personal_identity.id=='';
            if(!MySearchObject.election_role_id.error && needError )
            {       var objectSearch={...MySearchObject};
                    objectSearch.election_role_id.error="ללא תפקיד מחייב- תז/טלפון/שם מלא";
                    setMySearchObject(objectSearch);
                    return false;
            }
            else if(!needError && MySearchObject.election_role_id.error){
                var objectSearch={...MySearchObject};
                objectSearch.election_role_id.error="";
                setMySearchObject(objectSearch);
                return true;
            }
           
        }
        else
        return true;

    }

  const renderActivistsSearch=()=> {
    // this.initVariables();
    // this.validateVariables();
    return (
    <>
    <div style={{marginBottom:'10px',display:'flex',marginTop:'14px'}}>
    <div  className="search-tit">אפשרויות חיפוש</div>
        <IconButton aria-label="expand row" size="small" onClick={openSearchDetails.bind(this)}>
        {openSearch ? <KeyboardArrowUpIcon  /> : <KeyboardArrowDownIcon />}
        </IconButton>
    </div>
      
      <Collapse className="con-search-det" in={openSearch} timeout="auto" >
       
        <form style={{padding:'15px'}}>
        <div className="row">
        <div className="col-lg-3 col-md-3">
            <div className="form-group">
                <label  htmlFor="statusInput" className="control-label tit-det-search">בחירות</label>
                <Combo items={electionCampaignArr}
                    id="statusInput"
                    maxDisplayItems={10}
                    showFilteredList={false}
                    itemIdProperty="id"
                    itemDisplayProperty="name"
                    className="form-combo-table"
                    value={MySearchObject.election_campaign_id.name}
                    onChange={comboChange.bind(this,electionCampaignArr,'election_campaign_id','id','name')}
                />
                    <div className="warning-label">* שדה חובה </div>
            </div>
        </div>

         <div className="col-lg-3 col-md-3">
                    <div className="form-group">
                        <label htmlFor="staff" className="control-label tit-det-search">אזור שיבוץ</label>
                        <Combo items={areaArr}
                            id="staff"
                            maxDisplayItems={10}
                            itemIdProperty="id"
                            itemDisplayProperty="name"
                            className="form-combo-table"
                            value={MySearchObject.assigned_area_id.name}
                            onChange={changeArea.bind(this,areaArr,'assigned_area_id','id','name')}
                        />
                    </div>
                </div>
                    <div className="col-lg-3 col-md-3">
                    <div className="form-group">
                        <label htmlFor="sub-staff" className="control-label tit-det-search">תת אזור שיבוץ</label>
                        <Combo items={subAreaArr}
                            id="sub-staff"
                            maxDisplayItems={10}
                            itemIdProperty="id"
                            itemDisplayProperty="name"
                            className="form-combo-table"
                            value={MySearchObject.assigned_subarea_id.name}
                            onChange={changeSubArea.bind(this,subAreaArr,'assigned_subarea_id','id','name')}
                            // disabled={true}
                        />
                    </div>
                </div>
        
            <div className="col-lg-3 col-md-3">
                    <div className="form-group">
                        <label htmlFor="searchByRoleCity" className="control-label tit-det-search">עיר שיבוץ</label>
                        <Combo items={citiesArr}
                            id="searchByRoleCity"
                            maxDisplayItems={10}
                            autoFocus={false}
                            itemIdProperty="id"
                            itemDisplayProperty="name"
                            className="form-combo-table"
                            value={MySearchObject.assigned_city_id.name}
                            onChange={comboChange.bind(this,citiesArr,'assigned_city_id','id','name')}
                        />
                    </div>
                </div>
        
            </div>
                <div className="row">
                    <div className="col-lg-3 col-md-3">
                        <div className="form-group">
                            <label htmlFor="searchByID" className="control-label tit-det-search">ת"ז</label>
                            <input type="text" className="form-control input-style"  id="searchByID"
                                value={MySearchObject.personal_identity.id}
                                onChange={inputChange.bind(this,'personal_identity','validatePersonalIdentity')} />
                                {MySearchObject.personal_identity.error && <div className="error-label">* תעודת זהות שגויה </div>}
                        </div>
                    </div>
                 <div className="col-lg-3 col-md-3">

                        <div className="form-group">
                            <label htmlFor="first-name" className="control-label tit-det-search">שם פרטי</label>
                            <input type="text" className="form-control input-style" id="first-name" 
                                value={MySearchObject.first_name.id}
                                onChange={inputChange.bind(this,'first_name',null)} />
                        </div>
                    </div>
                   <div className="col-lg-3 col-md-3">
                        <div className="form-group">
                            <label htmlFor="family" className="control-label tit-det-search">שם משפחה</label>
                            <input type="text" className="form-control input-style" id="family" 
                                value={MySearchObject.last_name.id}
                                onChange={inputChange.bind(this,'last_name',null)} />
                        </div>
                    </div>
                      <div className="col-lg-3 col-md-3">
                        <div className="form-group">
                            <label htmlFor="searchByPhone" className="control-label tit-det-search">מס' טלפון</label>
                            <input type="text" className="form-control input-style" id="searchByPhone" 
                                 value={MySearchObject.phone_number.id}
                                 onChange={inputChange.bind(this,'phone_number','validatePhoneNumber')} />
                             {MySearchObject.phone_number.error && <div className="error-label">* מספר טלפון שגוי </div>}
                        </div>
                    </div>
                </div>
             <div className="row">

                <div className="col-lg-3 col-md-3">
                    <div className="form-group">
                        <label htmlFor="member-type" className="control-label tit-det-search">סוג פעיל</label>
                        <Combo items={electionRoleArr}
                            arrItemForReset={[-1,0,-2,-3,-4]}
                            id="member-type"
                            multiSelect={true}
                            maxDisplayItems={10}
                            showFilteredList={false}
                            itemIdProperty="id"
                            itemDisplayProperty="name"
                            className="form-combo-table"
                            value={MySearchObject.election_role_id.name}
                            cleanSelectedItems={resetAllCombo}
                            resetCleanAll={()=>{setResetAllCombo(false),setCleanAllSelect(false)}}
                            onChange={comboMultiChange.bind(this,'election_role_id','id','name')}
                        />
                          {!MySearchObject.election_role_id.error && <div className="warning-label">* שדה חובה </div>}
                          {MySearchObject.election_role_id.error && <div className="error-label">* {MySearchObject.election_role_id.error} </div>}
                    </div>
                </div>
            
               <div className="col-lg-3 col-md-3">
                    <div className="form-group">
                        <label htmlFor="bank-verification-status" className="control-label tit-det-search">סוג תשלום מיוחד</label>
                        <Combo items={paymentTypeAdditionalArr}
                            id="bank-verification-status"
                            multiSelect={true}
                            maxDisplayItems={10}
                            showFilteredList={false}
                            itemIdProperty="id"
                            itemDisplayProperty="name"
                            className="form-combo-table"
                            value={MySearchObject.payment_type_additional.name}
                            cleanSelectedItems={resetAllCombo}
                            resetCleanAll={()=>{setResetAllCombo(false),setCleanAllSelect(false)}}
                            onChange={comboMultiChange.bind(this,'payment_type_additional','id','name')}
                        />
                    </div>
                </div>	
             <div className="col-lg-3 col-md-3">
                    <div className="form-group">
                        <label htmlFor="bank-verification-status" className="control-label tit-det-search">נעילת תשלום</label>
                        <Combo items={closeActivistRoleArr}
                            id="bank-verification-status"
                            maxDisplayItems={10}
                            showFilteredList={false}
                            itemIdProperty="id"
                            itemDisplayProperty="name"
                            className="form-combo-table"
                            value={MySearchObject.activistLocked.name}
                            onChange={comboChange.bind(this, closeActivistRoleArr,'activistLocked','id','name')}
                        />
                    </div>
                </div>

                 <div className="col-lg-3 col-md-3">

                    <div className="form-group">
                        <label htmlFor="verification-status" className="control-label tit-det-search">סטטוס תשלום</label>
                        <Combo items={paymentElectionRoleArr}
                            id="verification-status"
                            arrItemForReset={[2]}
                            multiSelect={true}
                            maxDisplayItems={10}
                            showFilteredList={false}
                            itemIdProperty="id"
                            itemDisplayProperty="name"
                            className="form-combo-table"
                            value={MySearchObject.paid.name}
                            cleanSelectedItems={resetAllCombo}
                            resetCleanAll={()=>{setResetAllCombo(false),setCleanAllSelect(false)}}
                            onChange={comboMultiChange.bind(this,'paid','id','name')}
                        />
                        
                    </div>
                </div>	
           
                </div> 
                <div  onClick={openAnotherDetails.bind(this)} className="search-addition"><i className="fa fa-chevron-left" aria-hidden="true"></i>חיפוש מתקדם</div>
                <Collapse  in={openAnotherSearch} timeout="auto" >
                        <div className="row ">
                                <div className="col-lg-3 col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="first-name" className="control-label tit-det-search">מספר אסמכתא</label>
                                            <input type="text" className="form-control input-style" id="first-name" 
                                                value={MySearchObject.reference_id.id}
                                                onChange={inputChange.bind(this,'reference_id',null)} />
                                        </div>
                                </div>
                                <div className="col-lg-3 col-md-3">
                        <div className="form-group">
                            <label htmlFor="bank-verification-status" className="control-label tit-det-search">סטטוס אימות חשבון</label>
                            <Combo items={bankVerifyStatusArr}
                                id="bank-verification-status"
                                maxDisplayItems={10}
                                showFilteredList={false}
                                itemIdProperty="id"
                                itemDisplayProperty="name"
                                className="form-combo-table"
                                value={MySearchObject.verify_bank_status.name}
                                onChange={comboChange.bind(this, bankVerifyStatusArr,'verify_bank_status','id','name')}
                            />
                        </div>
                            </div>
                        </div>
                        
                </Collapse>
         
            <div  className="con-btn-search" >
            
            <Button disabled={isValidSearch()==true?false:true} style={{marginRight:'7px'}} onClick={searchElectionsActivists.bind(this)}  variant="contained" color="primary">
                חפש
            </Button>
            <Button onClick={resetSearchFields.bind(this)} variant="outlined" color="primary">
            נקה הכל
            </Button>
            </div> 
        </form>
        </Collapse>
        </>

    );
}

        return(
            renderActivistsSearch()
            //return <div>searching...</div>
        //   (props.currentUser.admin || props.currentUser.permissions['elections.activists.search'] == true) ?
        //          renderActivistsSearch()
        //    :
        //        <div className="row">{'\u00A0'}</div>
            
        );
}
