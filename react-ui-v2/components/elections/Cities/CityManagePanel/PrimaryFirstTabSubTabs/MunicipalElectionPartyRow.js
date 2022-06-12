import React, { Component } from 'react';

const MunicipalElectionPartyRow = ({index  , item , mouseClickCursorStyle ,
                                     totalEditingCount , addingNewMunicipalElectionsCampaign ,
                                    municipalElectionPartyRowItemChange ,  
                                    saveMunicipalElectionPartyRow , setMunicipalElectionPartyRowEditing , 
                                    showConfirmDeleteMunicipalElectionParty , notDeletableItemID , isAuthorizedEdit , isAuthorizedDelete  }) => {
  let isShasItem = '';
				if(item.shas == '1'){
					isShasItem = <span className="glyphicon glyphicon-ok"></span>;
				}
				if(item.editing){
					let nameTextboxStyle={borderColor:'#ccc'} ;
					let lettersTextboxStyle={borderColor:'#ccc'} ;
					if(item.name.split(' ').join('') == ''){
						nameTextboxStyle = {borderColor:'#ff0000'};
					}
					if(item.letters.split(' ').join('') == ''){
						lettersTextboxStyle = {borderColor:'#ff0000'};
					}
					return(<tr id={index} key={index}>
                            <td><span className="num-utem">{index + 1}</span>.</td>
                            <td>
                            <input type="text" className="form-control" value={item.letters} style={lettersTextboxStyle} onChange={municipalElectionPartyRowItemChange.bind(this,index , 'letters' )} maxLength={10} />
                            </td>
                            <td><input type="text" className="form-control" value={item.name} style={nameTextboxStyle}  onChange={municipalElectionPartyRowItemChange.bind( this,index , 'name' )} /></td>
                            <td style={{textAlign:'center'}}><input type="checkbox"  checked={item.shas == 1}  onChange={municipalElectionPartyRowItemChange.bind(this,index , 'shas' )} /></td>
                            <td className="status-data">
                                <button type="button" className="btn btn-success  btn-xs" disabled={!(item.letters.trim() != '' && item.name.trim() != '')} title="הוספה" onClick={saveMunicipalElectionPartyRow.bind(this,index)}>
                                    <i className="fa fa-pencil-square-o"></i>
                                </button>
                            </td>
                            <td className="status-data">
                                <button type="button" className="btn btn-danger btn-xs" title="ביטול" onClick={setMunicipalElectionPartyRowEditing.bind(this,false, index)}>
                                    <i className="fa fa-times"></i>
                                </button>
                            </td>
                        </tr>)
				}
				else{
				  let editItemOption ='';
				  let deleteItemOption = '';
				  if(totalEditingCount == 0 && !addingNewMunicipalElectionsCampaign){
                    if(isAuthorizedEdit){
					  editItemOption = <a title="ערוך" style={mouseClickCursorStyle}>
                                            <span className="glyphicon glyphicon-pencil" onClick={setMunicipalElectionPartyRowEditing.bind(this,true,index)}></span>
                                        </a>;
                      }
 
                      if(item.id != notDeletableItemID){
                        if(isAuthorizedDelete){
                             deleteItemOption = <a title="מחק" style={mouseClickCursorStyle}>
                                                    <span className="glyphicon glyphicon-trash" onClick={showConfirmDeleteMunicipalElectionParty.bind(this,index)}></span>
                                                </a>;
                        }
                      }
				  }
				return (<tr id={index} key={index}>
                            <td><span className="num-utem">{index + 1}</span>.</td>
                            <td>
                            {item.letters}
                            </td>
                            <td>{item.name}</td>
                            <td style={{textAlign:'center'}}>{isShasItem}</td>
                            <td className="status-data">
                            {editItemOption}
                            </td>
                            <td className="status-data">
                            {deleteItemOption}
                            </td>
                        </tr>)
				}
}
export default MunicipalElectionPartyRow ;