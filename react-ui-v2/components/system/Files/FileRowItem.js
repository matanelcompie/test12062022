import React, { Component } from 'react';

const FileRowItem = ({item , innerItem,fileIndex , formatFileSize , showConfirmDeleteFile , showEditFileScreen , isAdmin}) => {
   		return <tr>
                                        <td>
                                            <a title={innerItem.name} href={window.Laravel.baseURL + "api/system/files/" + innerItem.key} target="_blank">{innerItem.name}</a>
                                        </td>
                                        <td>{innerItem.type}</td>
                                        <td>{formatFileSize(innerItem.size)}</td>
                                        {isAdmin?<td><a title={innerItem.first_name + ' '+innerItem.last_name} style={{cursor:'pointer'}}>{innerItem.first_name + ' '+innerItem.last_name}</a></td>:null}
                                        {isAdmin?<td>{(innerItem.created_at.split(' ')[0]).split('-').reverse().join('/')}</td>:null}
										{isAdmin?<td className="status-data">
                                            <a title="ערוך" data-toggle="modal" style={{cursor:'pointer'}} onClick={showEditFileScreen.bind(this,item.id , fileIndex)}>
                                                <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                            </a>
                                        </td>:null}
										{isAdmin?
                                        <td className="status-data">
                                            <a title="מחק" data-toggle="modal" style={{cursor:'pointer'}} onClick={showConfirmDeleteFile.bind(this,item.id , fileIndex)}>
                                                <span className="glyphicon glyphicon-trash"></span>
                                            </a>
                                        </td>:null}
                                    </tr>
                  
}
export default FileRowItem ;