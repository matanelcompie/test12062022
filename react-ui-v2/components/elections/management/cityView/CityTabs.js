import React from 'react';


class CityTabs extends React.Component {

    render () {
        return (
            <ul className="nav nav-tabs main-tabs" role="tablist">
                <li onClick={this.props.updateCurrentTab.bind(this,'cityQuarters')} style={{cursor:'pointer'}}>
                    תפקידים עירוניים
                </li>
                <li onClick={this.props.updateCurrentTab.bind(this,'municipalCoordinators')} style={{cursor:'pointer'}}>
                    אשכולות וקלפיות
                </li>
                <li onClick={this.props.updateCurrentTab.bind(this,'clusterAndBallots')} style={{cursor:'pointer'}}>
                    ניהול רובעים עירוניים
                </li>
            </ul>
        );
    }
}

export default CityTabs;