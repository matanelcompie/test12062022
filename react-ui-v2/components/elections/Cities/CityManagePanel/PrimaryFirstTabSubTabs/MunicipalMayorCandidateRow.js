import React, { Component } from 'react';
import Combo from '../../../../global/Combo';
import {findElementByAttr,formatPhone} from 'libs/globalFunctions';
import { Link } from 'react-router';


const MunicipalMayorCandidateRow = ({index  , item , isValidComboValue , currentParties , 
                                      isAddingMayorCandidate , isAddingCouncilCandidate , isOrderingCouncilCandidate ,   editingCount  ,
                                      setCandidateRowEditing , confirmDeleteMayorRow , 
                                      editCandidateRowItemChange , editMayorCandidateFavoriteItemChange ,isAuthorizedEdit , isAuthorizedDelete,									  
									  doRealEditRow 
									 }) => {
                        if(!item.voter_phone_number&&item.voter_phone_number!=''){
                            let phone = findElementByAttr(item.phones,'id',item.voter_phone_id);
                            item.voter_phone_number = phone?phone.phone_number:'';
                        }
   		                if(item.editing){
							let isValidatedPhone = isValidComboValue(item.phones , item.voter_phone_number , 'phone_number' , true);
							let isValidatedParty = isValidComboValue(currentParties , item.party_letters , 'letters') ;
							return(<tr key={index}>
                                        <td><span className="num-utem">{index + 1}</span>.</td>
                                        <td>{item.personal_identity}</td>
                                        <td>
                                            <a title={item.first_name + ' '+ item.last_name}    >
                                                {item.first_name + ' '+ item.last_name}
                                            </a>
                                        </td>
                                        <td><Combo items={item.phones}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='phone_number'    value={item.voter_phone_number}    onChange={editCandidateRowItemChange.bind(this , 'mayor_candidates' , index , 'voter_phone_number')}  inputStyle={{borderColor:(isValidatedPhone ?'#ccc':'#ff0000') }}    /> </td>
                                        <td><Combo items={currentParties}  maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='letters'    value={item.party_letters}    onChange={editCandidateRowItemChange.bind(this , 'mayor_candidates' , index , 'party_letters')}  inputStyle={{borderColor:(isValidatedParty?'#ccc':'#ff0000') }}    /> </td>
                                        <td><input type="checkbox" checked={item.shas == '1'} onChange={editCandidateRowItemChange.bind(this , 'mayor_candidates' , index , 'shas')}/> </td>
                                        <td>{item.voter_city}</td>
                                        <td><a title="מועדפים" className="favorites icon-ster"><img src={ window.Laravel.baseURL + "Images/"+(item.favorite == 1?"star":"star-dis") + ".png"} style={{cursor:'pointer'}} onClick={editMayorCandidateFavoriteItemChange.bind(this, index )} /></a></td>
                                        <td className="status-data">
                                            <button type="button" className="btn btn-success  btn-xs" disabled={!(isValidatedPhone && isValidatedParty)}  onClick={doRealEditRow.bind(this,'mayor_candidates',index , (isValidatedPhone && isValidatedParty))}  >
                                                <i className="fa fa-pencil-square-o" ></i>
                                            </button>
                                        </td>
                                        <td className="status-data"  >
                                            <button type="button" className="btn btn-danger btn-xs" title="ביטול" onClick={setCandidateRowEditing.bind(this,'mayor_candidates' , index , false)}>
                                                <i className="fa fa-times"></i>
                                            </button>
                                        </td>
                                </tr>)
						}
						else{
		 
						let editItem = null;
						let deleteItem = null ; 
						if(!isAddingMayorCandidate && !isAddingCouncilCandidate && !isOrderingCouncilCandidate && editingCount == 0){
							if(isAuthorizedEdit){
                                editItem = <a title="ערוך" style={{cursor:'pointer'}} onClick={setCandidateRowEditing.bind(this,'mayor_candidates' , index , true)}>
                                                                    <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                                                </a>;
                            } 
                            if(isAuthorizedDelete){
							    deleteItem = <a title="מחק" style={{cursor:'pointer' , color:'#2AB4C0'}} onClick={confirmDeleteMayorRow.bind(this,'deleteMayorCandidateIndex' , index)}>
                                                                    <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                                                                </a>;	
                            }								
						}
						 
                        return  (<tr key={index}>
                                    <td><span className="num-utem">{index + 1}</span>.</td>
                                    <td>{item.personal_identity}</td>
                                    <td>
                                    <Link title={item.first_name + ' '+ item.last_name}  to={'elections/voters/'+item.voter_key} target="_blank" >{item.first_name + ' '+ item.last_name}</Link>

                                    </td>
                                    <td>{formatPhone(item.voter_phone_number)}</td>
                                    <td>{item.party_letters}</td>
                                    <td>{item.shas == '1' ?'כן':'לא'}</td>
                                    <td>{item.voter_city}</td>
                                    <td><a title="מועדפים" className="favorites icon-ster"><img src={ window.Laravel.baseURL + "Images/"+(item.favorite == 1?"star":"star-dis") + ".png"} /></a></td>
                                    <td className="status-data">
                                        {editItem}
                                    </td>
                                    <td className="status-data">
                                        {deleteItem}
                                    </td>
                                </tr>)
						}

                  
}
export default MunicipalMayorCandidateRow ;