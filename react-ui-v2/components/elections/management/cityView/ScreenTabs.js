import React from 'react';


class ScreenTabs extends React.Component {

    render () {
        let tabs = this.props.tabs.map(tab => {
            return (
                <li onClick={this.props.updateCurrentTab.bind(this, tab.path)} style={{cursor:'pointer'}}>
                    {tab.name}
                </li>
            )
        });
        return (
            <ul className="nav nav-tabs main-tabs" role="tablist">
                {tabs}
            </ul>
        );
    }
}

export default ScreenTabs;