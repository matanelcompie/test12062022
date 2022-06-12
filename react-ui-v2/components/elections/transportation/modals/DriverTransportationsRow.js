import React from 'react';
import {activists} from 'libs/constants';

class DriverTransportationsRow extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let item = this.props.item;
        let rowClass = (this.props.selectedDriver && item.key == this.props.selectedDriver.key) ? 'success' : '';
        let starImage = <img src={window.Laravel.baseURL + "Images/star.png"} style={{ cursor: 'pointer' }} />;
        let crippleData = item.car_type == activists.driverCarTypes.crippled ? <img src={window.Laravel.baseURL + "Images/accessibility.png"} /> : '';
        let driverRowStyle = item.is_driver_lock ? { opacity: '0.8', 'backgroundColor': '#eee', cursor: 'not-allowed' } : {};
        return (
            <tr key={item.key} onClick={this.props.selectDriverRow.bind(this, item)} className={rowClass} style={driverRowStyle}>
                <td>{item.favorite ? starImage : ''} </td>
                <td>{item.first_name}</td>
                <td>{item.last_name}</td>
                <td>{item.cluster_city_name}</td>
                <td>{item.cluster_name}</td>
                <td>משובץ</td>
                <td>{crippleData}</td>
                <td>{item.voters_transportations_count}</td>
            </tr>
        );
    }

}


export default DriverTransportationsRow;