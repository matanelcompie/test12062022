import React from 'react';

const TabItem = ({tabKey, tabItem, currentTab, setCurrentTab , tabsLocked}) => {
    function getLinkHref() {
        return 'Tab-' + tabKey;
    }

    function getClass() {
        if ( tabKey == currentTab ) {
            return "active";
        } else {
            return "";
        }
    }

    function setTab() {
        if ( tabKey != currentTab ) {
            setCurrentTab(tabKey);
        }
    }
	if(tabsLocked){
		return (
			<li className={getClass()}>
				<a title={tabItem.title}  >{tabItem.title}</a>
			</li>
		);
	}
	else{
		return (
			<li className={getClass()}>
				<a title={tabItem.title} href={getLinkHref()} data-toggle="tab" onClick={setTab.bind(this)}>{tabItem.title}</a>
			</li>
		);
	}
};

export default TabItem;