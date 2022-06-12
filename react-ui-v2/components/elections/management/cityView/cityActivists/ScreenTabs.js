import React from 'react';


class ScreenTabs extends React.Component {

    render () {
        let tabs = this.props.tabs.map(tab => {
            return (
                <li key={tab.path} onClick={this.props.updateCurrentTab.bind(this, tab.path)} style={{cursor:'pointer'}}>
                    <a title={tab.name} data-toggle="tab">
                        {tab.name}
                    </a>    
                </li>
            )
        });
        return (
            <ul className="nav nav-tabs tabsRow" role="tablist">
                {tabs}
            </ul>
        );
    }
}

export default ScreenTabs;