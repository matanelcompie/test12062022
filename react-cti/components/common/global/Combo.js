import React from 'react'
import _ from 'lodash'
import ComboListItem from './ComboListItem'
import ComboDisplayItem from './ComboDisplayItem'

/**
 / Combo box component for react.
 / This components will render a list of items under an input element.
 / the list can be filtered by typing in the input.
 / The component has the following props:
 / items: an array of objects as the list
 / onChange: callback function for detecting value change, selection change, or multi selection change.
 /  The event will return target with 'value' for input value, 'selectedItem' for selectedItem and 'selectedItems' for multi selected items
 / onKeyDown: callback function for keyDown events in combo
 / itemDisplayProperty: property from item object to display in list
 / itemIdProperty: unique property to identify item object
 / defaultValue: default value for input element
 / zIndex:if specified , this sets zIndex to input text of the combo.
 / value: controlled value for input element. for this props there need to be also onChange
 / multiSelect: true/false if the Combo allow multiple item selection
 / defaultSelectedItems: An array of objects for first render. need to be sub array from the items prop, otherwise, will not render
 / selectedItems: controlled array of selected items from items prop. for this props there need to be also onChange
 / maxDisplayItems: maximum number of items to display in list.  if not defined, all the items will be rendered. if not exist, a default of 10 items will be set. use -1 to set the list to all items
 / className: add css class to div element of Combo
 / style: add inline style object to element
 / inputStyle: add inline style object to input element
 / idForLabel: HTML id if the component use the <label for="id-of-the-input"> technique
 / cleanSelectedItems: if defined and true will trigger a nice cleaning(kind of reinitialise the combo)
 / itemHeight: height of an item in list
 / itemStyle: css style of item
 / disabled: disable the component
 / autoFocus: add autoFocus on the combo
 /
 **/
class Combo extends React.Component {

    /*Constructor*/
    constructor(props) {

        super(props);

        this.initCombo();
        /*
         * Add id if we need <label for="id"> to work.
         */
        this.idForLabel = (undefined == this.props.id) ? undefined : this.props.id;
    }

    /*First mounting of component*/
    componentDidMount() {
        //set click handler for closing list
        this.outsideClickHandler = this.outsideClick.bind(this);
        document.addEventListener('mousedown', this.outsideClickHandler, false);
        //set initial selected item/items
        if (this.props.multiSelect) {
            if (this.controlledSelectedItems) {
                this.setSelectedItemsFromArray(this.props.selectedItems);
            } else if (this.props.defaultSelectedItems != undefined) {
                this.setSelectedItemsFromArray(this.props.defaultSelectedItems);
            }
            this.setInputStyle();
        }
        if (this.controlledValue) {
            this.setSelectedItemFromValue(this.props.value);
        } else if (this.props.defaultValue != undefined) {
            this.setSelectedItemFromValue(this.props.defaultValue);
        }
    }

    /**
     * This method contain 100% the original code of Dror's constructor(come on guys, be serious here, if you please:-) ).
     * We need this block in order to do a proper cleaning of 'search panels'.
     * This is related to usage of the new property 'cleanSelectedItems'.
     */
    initCombo() {
        this.comboItems = [];
        var inputValue = undefined;
        if (this.props.defaultValue != undefined) {
            inputValue = this.props.defaultValue;
        }
        else if (this.props.value != undefined) {
            inputValue = this.props.value;
        }
        var currentListCount = 0;
        var maxDisplayItems = 10;
        if (this.props.maxDisplayItems != undefined) maxDisplayItems = this.props.maxDisplayItems;
        if (maxDisplayItems > 0) currentListCount = maxDisplayItems*2;
        this.state = {
            showList: false,
            inputValue: inputValue,
            selectedItems: [],
            currentListCount: currentListCount,
            maxDisplayItems: maxDisplayItems,
            multiPadding: 0,
        };
        /*
         * initialize variables
         */
        this.selectedItemsHash = [];
        this.itemsHash = [];
        this.outsideClickHandler = null;
        this.controlledValue = false;
        this.controlledSelectedItems = false;
        if (this.props.value != undefined) {
            this.controlledValue = true;
        }
        if (this.props.selectedItems != undefined) {
            this.controlledSelectedItems = true;
        }
        /*
         * generate Items hash
         */
        this.generateItemsHash(this.props.items);
    }

    /*Unmounting of component*/
    componentWillUnmount() {
        //remove click handler
        document.removeEventListener('mousedown', this.outsideClickHandler, false);
    }

    /*Check old props vs new*/
    componentWillReceiveProps(nextProps) {

        if (undefined != this.props.cleanSelectedItems && true == this.props.cleanSelectedItems) {
            this.initCombo();
        }

        //reselect item from input value
        if (this.controlledValue) {
            if (!_.isEqual(this.props.value, nextProps.value)) {
                this.setState({
                    inputValue: nextProps.value
                });
                if (!this.controlledSelectedItems) this.setSelectedItemFromValue(nextProps.value);
            }
        }
        //reselect items if items list is changed
        if (!_.isEqual(this.props.items, nextProps.items)) {
            this.generateItemsHash(nextProps.items);
            if (this.props.defaultSelectedItems != undefined) {
                this.setSelectedItemsFromArray(this.props.defaultSelectedItems);
            } else if (this.controlledSelectedItems) {
                var selectedItems = this.props.selectedItems;
                if (!_.isEqual(this.props.selectedItems, nextProps.selectedItems)) selectedItems = nextProps.selectedItems;
                this.setSelectedItemsFromArray(selectedItems);
            }
        }
        //reselect items of selectedItems props is changed
        if (!_.isEqual(this.props.selectedItems, nextProps.selectedItems)) this.setSelectedItemsFromArray(nextProps.selectedItems);

        //hide list if combo changed to disable
        if ((!this.props.disabled)&&(nextProps.disabled)&&(this.state.showList)) this.hideList();

    }

    componentDidUpdate() {
        if (this.multiBadge != undefined) {
            var padding = this.multiBadge.offsetWidth + 6;
            if (padding != this.state.multiPadding) {
                this.setState({
                    multiPadding: padding
                });
            }
        }
    }

    //sets hash table to check if item is in items array by item id property
    generateItemsHash(items) {
        this.itemsHash = [];
        var _this = this;
        items.forEach(function (item, index) {
            _this.itemsHash[item[_this.props.itemIdProperty]] = true;
        });
    }

    /*Close list on outside click*/
    outsideClick(e) {
        if (e.target == this.refs.list) return;
        //only close if not clicked in input
        if (this.state.showList) {
            var parentNode = e.target.parentNode;
            var foundSelfList = false;
            while (parentNode != undefined) {
                if ((parentNode == this.refs.list) || (e.target == this.refs.list.previousSibling)) {
                    foundSelfList = true;
                    break;
                }
                parentNode = parentNode.parentNode;
            }
            if (!foundSelfList) {
                this.hideList();
            }
        }
    }

    /*Hide list if tab pressed, and send key down to parent*/
    inputKeyDown(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode == 9) {
            this.hideList();
        }
        if (this.props.onKeyDown != undefined) this.props.onKeyDown(e);
    }

    toggleList() {
        //cancel open list of disabled
        if (this.props.disabled) return;

        //show or hide list
        if (this.state.showList) {
            this.hideList();
        } else {
            this.showList();
        }
    }

    /*Show list of items*/
    showList() {
        if (!this.state.showList) {
            this.setState({
                showList: true
            });
        }
    }

    /*Hide lsit of items*/
    hideList() {
        if (this.state.showList) {
            this.setState({
                showList: false
            })
        }
    }

    /*Manage input changes*/
    valueChanged(e) {
        //if not controlled input update input value
        if (!this.controlledValue) {
            this.setState({
                inputValue: e.target.value,
            });
        }
        //reselect item from input
        if (!this.props.multiSelect) {
            var item = this.getItemFromValue(e.target.value);
            if (item != false) {
                this.refs.self.selectedItem = item;
            } else {
                this.refs.self.selectedItem = null;
            }
        }
        //update value of element and trigger onChange
        this.refs.self.value = e.target.value;
        this.pushChangeEvent();
    }

    /*Handler for item click in list*/
    itemClick(item) {
        //update selected items if in multi-select mode
        if (this.props.multiSelect) {
            this.selectedItemsHash[item[this.props.itemIdProperty]] = true;
            var selectedItems = [...this.state.selectedItems];
            selectedItems.push(item);
            if (!this.controlledSelectedItems) {
                this.setState({
                    selectedItems: selectedItems,
                    inputValue: ''
                })
            }
            //update element selectedItems property
            this.refs.self.selectedItems = selectedItems;
        }
        //update input value in not controlled value
        if ((!this.controlledValue)&&(!this.props.multiSelect)) {
            var itemValue = item[this.props.itemDisplayProperty];
            if (itemValue == null) itemValue = 'null';
            else if (itemValue == undefined) itemValue = 'undefined';
            this.setState({
                inputValue: itemValue
            })
        }
        //update element value and selectedItem
        this.refs.self.value = item[this.props.itemDisplayProperty];
        this.refs.self.selectedItem = item;
        //close list of not in multi-select mode
        if ((this.state.showList) && (!this.props.multiSelect)) this.hideList();
        //trigger onChange
        this.pushChangeEvent();
    }

    /*get item from list by display property value, only if one is found*/
    getItemFromValue(value) {
        var _this = this;
        var found = false;
        var foundItem = null;
        this.props.items.forEach(function (item, index) {
            if (item[_this.props.itemDisplayProperty] == value) {
                if (!found) {
                    found = true;
                    foundItem = item;
                } else {
                    return false;
                }
            }
        });
        if (found) {
            return foundItem;
        } else {
            return false;
        }
    }

    /*Handler for click on selected items in multi-select mode*/
    selectedItemClick(item) {
        //remove from selected items hash
        this.selectedItemsHash[item[this.props.itemIdProperty]] = false;
        var selectedItems = [...this.state.selectedItems];
        var foundIndex = -1;
        //remove from seleced items array
        for (var i = 0; i < selectedItems.length; i++) {
            if (selectedItems[i][this.props.itemIdProperty] == item[this.props.itemIdProperty]) {
                foundIndex = i;
                break;
            }
        }
        selectedItems.splice(i, 1);
        //if not controlled selected items update selected items
        if (!this.controlledSelectedItems) {
            this.setState({
                selectedItems: selectedItems
            });
        }
        //update element selectedItems property and triger onChange
        this.refs.self.selectedItems = selectedItems;
        this.pushChangeEvent();
    }

    /*trigger onChange*/
    pushChangeEvent() {
        var event = document.createEvent("HTMLEvents");
        event.initEvent("change", true, true);
        var target = this.refs.self;
        target.dispatchEvent(event);
        if (this.props.onChange != undefined) this.props.onChange(event);
    }

    /*Set selected item from input value, uses getItemFromValue() function*/
    setSelectedItemFromValue(value) {
        var item = this.getItemFromValue(value);
        if (item != false) {
            this.refs.self.selectedItem = item;
        }
    }

    /*Set selected items from array of items, leave only items that are in list*/
    setSelectedItemsFromArray(items) {
        //create selected items array from items filtered by list of items
        var selectedItems = [];
        this.selectedItemsHash = [];
        var _this = this;
        items.forEach(function (item, index) {
            if (_this.itemsHash[item[_this.props.itemIdProperty]]) {
                _this.selectedItemsHash[item[_this.props.itemIdProperty]] = true;
                selectedItems.push(item)
            }
        });
        //set element selected items property and update selected items state
        this.refs.self.selectedItems = selectedItems;
        this.setState({
            selectedItems: selectedItems
        })
    }

    //manage infinite scroll if item count > maxDisplayItems prop
    listScroll(e) {
        var node = e.target;
        var ratio = 0.8;
        if ((node.offsetHeight / (node.scrollHeight - node.scrollTop)) > ratio) {
            if (this.state.maxDisplayItems > 0) {
                this.setState({
                    currentListCount: this.state.currentListCount + this.state.maxDisplayItems
                });
            }
        }
    }

    /*Render combo items for list*/
    renderComboItems() {
        var _this = this;
        var indexStart = 0;
        var divider = 0;
        //add selected items list first
        if (this.props.multiSelect) {
            this.comboSelectedItems = this.state.selectedItems.map(function (item, index) {
                return <ComboListItem key={index} item={item} itemClick={_this.selectedItemClick.bind(_this)} itemDisplayProperty={_this.props.itemDisplayProperty} selected={true} height={_this.props.itemHeight} style={_this.props.itemStyle}/>;
            });
            indexStart = this.comboSelectedItems.length;
        }
        //add divider between selected items and remaining items
        if (indexStart > 0) {
            this.comboSelectedItems.push(<ComboListItem key={indexStart} divider={true} height={this.props.itemHeight}/>);
            indexStart++;
            divider = 1;
        }
        //add list of items, filtered by not selected already and only if input value matches, except if it has exact match
        if (!this.getItemFromValue(this.state.inputValue)) {
            this.comboItems = this.props.items.filter(function (item) {
                if (((_this.props.multiSelect) && (_this.selectedItemsHash[item[_this.props.itemIdProperty]] != true)) || (!_this.props.multiSelect)) {
                    var itemDisplayValue = item[_this.props.itemDisplayProperty];
                    if ((itemDisplayValue == undefined) || (itemDisplayValue == null)) {
                        itemDisplayValue = "";
                    } else {
                        if ((typeof(itemDisplayValue)) != 'string') itemDisplayValue = String(itemDisplayValue);
                    }
                    var inputValue = (_this.state.inputValue == undefined) ? '' : _this.state.inputValue;
                    if (itemDisplayValue.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0) {
                        return true;
                    }
                    return false;
                }
                return false;
            })
        } else {
            this.comboItems = this.props.items.filter(function(item) {
                if ((_this.props.multiSelect) && (_this.selectedItemsHash[item[_this.props.itemIdProperty]] == true)) return false;
                else return true;
            });
        }
        this.comboItems = this.comboItems.map(function (item, index) {
            return <ComboListItem key={indexStart + index} item={item} itemClick={_this.itemClick.bind(_this)} itemDisplayProperty={_this.props.itemDisplayProperty} height={_this.props.itemHeight} style={_this.props.itemStyle}/>
        });
        //combine selected items with list of items
        if (this.props.multiSelect) {
            this.comboItems = this.comboSelectedItems.concat(this.comboItems);
        }
        //Set list height if needed
        if (this.state.maxDisplayItems > 0) {
            var itemHeight = 29;
            if (this.props.itemHeight != undefined) itemHeight = this.props.itemHeight;
            this.listHeight = itemHeight*this.state.maxDisplayItems;
            if (divider == 1) this.listHeight += 4;
        } else {
            this.listHeight = 0;
        }

        //reduce list size for infinite scroll
        if ((this.state.maxDisplayItems > 0)&&(this.state.currentListCount < this.comboItems.length)) this.comboItems = this.comboItems.slice(0, this.state.currentListCount + divider);
    }

    /*Set style for input element*/
    setInputStyle() {
        var selectedItems = (this.state.selectedItems == undefined) ? [] : this.state.selectedItems;
        if (this.props.zIndex != undefined) {
            //add padding if multiply selected items exists
            if (selectedItems.length > 0) {
                this.inputStyle = {
                    paddingRight: this.state.multiPadding + "px",
                    zIndex: this.props.zIndex
                }
            }
            else {
                this.inputStyle = {zIndex: this.props.zIndex}
            }
        }
        else {
            if (selectedItems.length > 0) {
                this.inputStyle = {
                    paddingRight: this.state.multiPadding + "px"
                }
            }
            else {
                this.inputStyle = {}
            }
        }
        if (this.props.inputStyle != undefined) {
            this.inputStyle = {...this.inputStyle, ...this.props.inputStyle};
        }

    }

    /*Set input value*/
    setInputValue() {
        this.inputValue = (this.state.inputValue == undefined) ? '' : this.state.inputValue;
    }


    /*Add css class if needed*/
    setCssClass() {
        if (this.props.className != undefined) {
            this.cssClass = "form-combo" + " " + this.props.className;
        } else {
            this.cssClass = "form-combo";
        }

        //add disabled class if disabled
        if (this.props.disabled) this.cssClass = this.cssClass + " disabled";
    }

    setTabIndex() {
        if ( this.props.tabIndex != undefined ) {
            this.tabIndex = this.props.tabIndex;
        } else {
            this.tabIndex = "";
        }
    }

    /*Set render list show/hide*/
    setRenderList() {
        if ((this.state.showList)&&(this.comboItems.length > 0)) {
            this.listStyle = {
                display: "block"
            }
        } else {
            this.listStyle = {
                display: "none"
            }
        }
        if ((this.listHeight > 0)&&(this.comboItems.length > this.state.maxDisplayItems)) {
            this.listStyle.height = this.listHeight + "px";
            this.listStyle.overflowY = "auto";
        }
    }

    /*Render multi-select items icon in input*/
    renderMultiSelectedItems() {
        if ((this.props.multiSelect) && (this.state.selectedItems.length > 0)) {
            return <div className="multi-items">
                <span className="badge" ref={(span) => { this.multiBadge = span; }}>{this.comboSelectedItems.length-1}</span>
            </div>
        } else {
            return
        }
    }

    /*Render component*/
    render() {
        this.renderComboItems();
        this.setRenderList();
        this.setInputStyle();
        this.setInputValue();
        this.setCssClass();
        this.setTabIndex();
        return (
            <div ref="self" className={this.cssClass} style={this.props.style}>
                <input type="text" className="form-control" placeholder={this.props.placeholder}
                       disabled={this.props.disabled}
                       onFocus={this.showList.bind(this)} onClick={this.showList.bind(this)}
                       onChange={this.valueChanged.bind(this)} onKeyDown={this.inputKeyDown.bind(this)}
                       value={this.inputValue} style={this.inputStyle} id={this.idForLabel}
                       tabIndex={this.tabIndex}
                       autoFocus={this.props.autoFocus}/>
                <i className="fa fa-caret-down" onClick={this.toggleList.bind(this)}></i>
                <ul ref="list" style={this.listStyle} onScroll={this.listScroll.bind(this)}>
                    {this.comboItems}
                </ul>
                {this.renderMultiSelectedItems()}
            </div>
        )
    }
}

export default Combo