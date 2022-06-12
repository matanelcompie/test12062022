import React, { Component } from 'react';

const VotesUpdatesHistoryRow = ({item , index , onDeleteVote , showDelete , tableCellStyle}) => {
							return(
									<tr>
										<td  style={{textAlign:'right'}}>
											{showDelete && <a title="מחק עידכון" style={{cursor:'pointer'}} onClick={onDeleteVote.bind(this,index)}><span className="icon-x"></span>מחק עידכון</a>}
										</td>
										<td style={{textAlign:'right'}}>
											<span>{item.first_name + ' ' + item.last_name}</span>
											<span>&nbsp;|&nbsp;</span>
												<span>{item.personal_identity}</span>
										</td>
										<td  style={{textAlign:'right'}}>
											<span>{item.vote.vote_date.split(' ')[0].split("-").reverse().join("/")}</span>&nbsp;&nbsp;
											<span>{item.vote.vote_date.split(' ')[1].substr(0,5)}</span>
										</td>
									</tr>
							)
}
export default VotesUpdatesHistoryRow ;