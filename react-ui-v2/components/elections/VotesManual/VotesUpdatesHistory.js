import React, { Component } from 'react';
import VotesUpdatesHistoryRow from './VotesUpdatesHistoryRow';

const VotesUpdatesHistory = ({items , onCleanList , onDeleteVote , showDelete , tableCellStyle}) => {
    
							return(
									<div className="row">
										<div className="col-lg-12 no-padding">
											<div className="containerStrip dtlsBox box-content">
												<div className="panel-collapse flexed-center flexed-space-between">
													<div style={{width:'50%'}}>
														<a title="עדכונים אחרונים" data-toggle="collapse" href="#collapse-1" aria-expanded="true" className="collapse in">
															<div className="collapseArrow closed"></div>
															<div className="collapseArrow open"></div>
															<div className="collapseTitle">
																<span>עדכונים אחרונים</span>
															</div>
														</a>
													</div>
													<div className="flexed-center flex-end">
														<a title="נקה רשימת העידכונים" style={{cursor:'pointer'}} onClick={onCleanList}>נקה רשימת העידכונים</a>
													</div>
												</div>
                   
												<div id="collapse-1" className="collapse in" aria-expanded="true" >
													<div className="collapse-inner">
														<table className="table table-frame standard-frame table-striped first-child-border tableNoMarginB first-child-width-150 householdLIst">
															<thead>
																<tr>
																	<th   style={tableCellStyle}></th>
																	<th   style={tableCellStyle}>כרטיס</th>
																	<th   style={tableCellStyle}>תאריך ושעה</th>
																</tr>
															</thead>
															<tbody>
															    {items.length == 0 && <tr><th colSpan="3">-</th></tr>}
																	{
																		items.map(function(item , index){
																			return <VotesUpdatesHistoryRow item={item} key={index} index={index} onDeleteVote={onDeleteVote} showDelete={showDelete} tableCellStyle={tableCellStyle} />;
																		})
																	}
																
															</tbody>
														</table>
													</div>
												</div>
											</div>
										</div>
									</div>
							)
                   
}
export default VotesUpdatesHistory ;