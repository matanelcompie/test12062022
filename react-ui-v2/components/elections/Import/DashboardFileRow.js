import React, { Component } from 'react';

const DashboardFileRow = ({ id, name, createDate, rowCount, sizeKB, fullName, currentRow, statusName, rowDblClickDelegate, onFileClickDelegate , restartCurrentProcess,confirmDelete , showDeleteButton }) => {
  return <tr onClick={rowDblClickDelegate} className='cursor-pointer'>
    <td>{id}</td>
    <td>{createDate}</td>
    <td><a onClick={onFileClickDelegate} className="cursor-pointer">{name}</a></td>
    <td>{rowCount}</td>
    <td>{sizeKB} KB</td>
    <td>{fullName}</td>
    <td>{currentRow}</td>
    <td>{rowCount - currentRow}</td>
    <td>{statusName}</td>
    <td>
	  <div style={{display:'inline'}}>
		<div style={{float:'right'}}>
			<div className="progress">
				<div className="progress-bar progress-bar-info progress-bar-striped" role="progressbar" aria-valuenow="20" aria-valuemin="0"
				aria-valuemax="100" style={{ width: ((currentRow * 100) / rowCount) + "%" }}>
					<span className="sr-only">{((currentRow * 100) / rowCount)}% Complete</span>
				</div>
			</div>
		</div>
		<div style={{float:'right'}}>{(restartCurrentProcess != null) && <i className="fa fa-undo fa-6" onClick={restartCurrentProcess}></i>}</div>
	  </div>
    </td>
	<th>
		{showDeleteButton && 
		<button type="button"
		 		className="btn btn-danger btn-xs"
		 		onClick={(showDeleteButton ? confirmDelete : e => e.stopPropagation())}
		 		style={{backgroundColor:"#ac2925",opacity:(showDeleteButton ? '' : '0.4'), cursor:(showDeleteButton ? 'pointer':'not-allowed')}}
		 		title="מחיקה">
		 			<i className="fa fa-trash-o"></i>
		</button>} 
	</th>
  </tr>
}
export default DashboardFileRow;