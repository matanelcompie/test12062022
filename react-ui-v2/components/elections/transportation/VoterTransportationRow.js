import React from 'react';
import {activists} from 'libs/constants';

class VoterTransportationRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            driverName:''
        }
    }

    render() {
        let householdsTransportData = this.props.householdsTransportData;
        let all_rows_names = householdsTransportData.all_rows_names;
        let item = this.props.item;
        let first_phone = item.voter_phones.length > 0 ? item.voter_phones[0].phone_number : '';
        let second_phone = item.voter_phones.length > 1 ? item.voter_phones[1].phone_number : '';

        let driverFullName = item.voter_driver_id ? item.driver_first_name + ' ' + item.driver_last_name : '';
        let driverPhone = item.driver_phone_number ? ' | ' + item.driver_phone_number : '';

        let crippleData = item.cripple == activists.driverCarTypes.crippled ? <img src={window.Laravel.baseURL + "Images/accessibility.png"} /> : '';
        let hasVoted = item.has_voted ? true : false;
        let commentImage = item.comment ? "Images/yes-comment.png" : "Images/no-comment.png";

        let notHasEditPermission = !this.props.hasEditPermission;
        let buttonLinkStyle = { border: 'none', backgroundColor: 'transparent' };
        let item_full_name = (item.first_name || '') + ' ' + (item.last_name || '');
        let all_rows_names_title = '';
        if(all_rows_names){
            all_rows_names_title = all_rows_names.join( " \n " );
        }
        return (

            <tr key={item.voter_key}  style={{backgroundColor:(item.executed?'#CCDAC3':'')}}>
                <td><input type="checkbox" checked={this.props.isRowSelected || false} 
                 onChange={this.props.selectTransportRow.bind(this, this.props.index )}/></td>
                <td > {item.personal_identity}</td>
                {all_rows_names  ? <td> 
                    <span data-original-title={all_rows_names_title} data-tooltip={all_rows_names_title} data-html="true">{item_full_name}</span>
                </td> : <td>{item_full_name}</td>}
                <td>{item.street + ' ' + item.house}</td>
                <td >{first_phone}</td>
                <td >{second_phone}</td>
                <td className="text-center">{crippleData}</td>
                <td className="text-center">{householdsTransportData.cnt}</td>
                <td>{item.from_time ? item.from_time.substring(0, 5) : ''}</td>
                <td>{item.to_time ? item.to_time.substring(0, 5) : ''}</td>
                <td>
                    <input type="checkbox" checked={item.executed} onChange={this.props.executeTransportation.bind(this,
                     item.executed, item.voter_key, item.transportations_key, this.props.index )} disabled={notHasEditPermission}/>
                </td>
                <td><button style={buttonLinkStyle} disabled={notHasEditPermission}
                    onClick={this.props.showCommentModal.bind(this, item.comment, item.voter_key, this.props.index)}>
                    <img src={window.Laravel.baseURL + commentImage} /></button></td>
                <td>
                    <div className="col-md-10 no-padding text-right" style={{ paddingTop: '6px' }}>
                        <a>{driverFullName}  {driverPhone}</a>
                    </div>
                    <div className="col-md-2 no-padding">
                        <button className="search-icon blue" title="חפש" disabled={item.is_driver_lock || notHasEditPermission} style={buttonLinkStyle}
                         onClick={this.props.showSearchDriverModal.bind(this,item.cluster_id,item.voter_key, item.transportations_key, this.props.index)}
                        > </button>
                    </div>
                </td>
                <td><input type="checkbox" checked={hasVoted} disabled={hasVoted || notHasEditPermission} 
                    onChange={this.props.displayVoteConfirmModal.bind(this, true, { voterKey: item.voter_key, index: this.props.index })} /></td>
            </tr>
        );
    }

}


export default VoterTransportationRow;