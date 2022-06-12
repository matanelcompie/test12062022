import React from 'react';

const DisplayTabs = ({currentTab, tabs, setCurrentTab}) => {
    let tabLinkStyle = { marginRight: '2px', cursor:'pointer' };
    return (
        <ul className="nav nav-tabs tabsTransportation col-md-3" role="tablist">
            <li className={tabs.clusterResult.display ? "active" : ""}>
                <a title={tabs.clusterResult.title} onClick={setCurrentTab.bind(this, 'clusterResult')} style={tabLinkStyle}
                   data-toggle="tab" aria-expanded={currentTab == "clusterResult" ? "true" : "false"}>
                    {tabs.clusterResult.title}
                </a>
            </li>
            <li className={tabs.transportationResult.display ? "active" : ""}>
                <a title={tabs.transportationResult.title} onClick={setCurrentTab.bind(this, 'transportationResult')} style={tabLinkStyle}
                   data-toggle="tab" aria-expanded={currentTab == "clusterResult" ? "true" : "false"}>
                    {tabs.transportationResult.title}
                </a>
            </li>
            <li className={tabs.driverResult.display ? "active" : ""}>
                <a title={tabs.driverResult.title} onClick={setCurrentTab.bind(this, 'driverResult')} style={tabLinkStyle}
                   data-toggle="tab" aria-expanded={currentTab == "driverResult" ? "true" : "false"}>
                    {tabs.driverResult.title}
                </a>
            </li>
        </ul>
    );
};

export default DisplayTabs;