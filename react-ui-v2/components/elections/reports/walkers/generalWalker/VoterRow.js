import React from 'react';
class VoterRow extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let item = this.props.item;
        let first_phone = item.voter_phones.length > 0 ? item.voter_phones[0].phone_number : '';
        let second_phone = item.voter_phones.length > 1 ? item.voter_phones[1].phone_number : '';
        // console.log(item);
		let ballotBoxSTR = '';
		if(this.props.ballotBox_mi_id){
			ballotBoxSTR = ballotBoxSTR + this.props.ballotBox_mi_id;
		}
        return (
            <tr key={item.voter_id}>
                <td>{this.props.index+1}</td>
                <td>{this.props.ballotBox_mi_id ? (ballotBoxSTR.substr(0 , ballotBoxSTR.length-1)+"." + ballotBoxSTR.substr(-1)):''}</td>
                <td> {item.voter_serial_number}</td>
                <td> {item.personal_identity}</td>
                <td>{item.first_name} {item.last_name}</td>
                <td>{item.street_name ? item.street_name :  item.mi_street}</td>
                <td>{item.house}</td>
                <td>{first_phone}</td>
                <td>{second_phone}</td>
                <td>{item.supportStatusName || "ללא"}</td>
            </tr>
        );
    }

}


export default VoterRow;