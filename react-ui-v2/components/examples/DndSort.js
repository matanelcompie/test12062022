import React from 'react'
import { connect } from 'react-redux'
import * as SystemActions from '../../actions/SystemActions';

import DndSortItem from './DndSortItem'

class DndSort extends React.Component {
    
    componentWillMount() {
                SystemActions.loadCities(this.props.dispatch);
    }

	//Load items from cities list
	componentWillReceiveProps(nextProps) {
		if ((this.props.cities.length == 0)&&(nextProps.cities.length> 0)) {
			this.props.dispatch({type: SystemActions.ActionTypes.EXAMPLES.LOAD_DND_SORT_ITEMS, cities: nextProps.cities});
		}
	}

	//move items in hover - only if needed
	move(fromItem, toItem, before) {
		if (fromItem.city_key != toItem.city_key) {
			var i=0;
			for (i=0; i<this.props.items.length; i++) {
				if (this.props.items[i].city_key == fromItem.city_key) break;
			}
			if (before) {
				if ((this.props.items.length == i + 1)||((this.props.items.length > i + 1)&&(this.props.items[i+1].city_key != toItem.city_key))) {
					this.props.dispatch({type: SystemActions.ActionTypes.EXAMPLES.SORT_ITEMS, fromItem: fromItem, toItem: toItem, before: before});
				}
			}else {
				if ((i == 0)||(( i > 0)&&(this.props.items[i-1].city_key != toItem.city_key))) {
					this.props.dispatch({type: SystemActions.ActionTypes.EXAMPLES.SORT_ITEMS, fromItem: fromItem, toItem: toItem, before: before});
				}
			}
		}
		
	}

	//return items to original state if not dropped on another item
	revertToOriginal() {
		this.props.dispatch({type: SystemActions.ActionTypes.EXAMPLES.SORT_ITEMS_REVERT_TO_ORIGINAL});
	}

	//set drop callback - maybe send data to server
	drop() {
		this.props.dispatch({type: SystemActions.ActionTypes.EXAMPLES.SORT_ITEMS_DROP});
	}

	renderItems() {
		var _this = this;
		this.items = this.props.items.map(function(item) {
			return <DndSortItem key={item.city_key} item={item} move={_this.move.bind(_this)} revertToOriginal={_this.revertToOriginal.bind(_this)} drop={_this.drop.bind(_this)}/>
		});
	}

	render() {
		this.renderItems();
		return (
			<div className="main-section-block">
				{this.items}
			</div>
		)
	}
}

function mapStateToProps(state) {

	return {

		cities: state.system.lists.cities,
		items: state.system.examples.dndSortScreen.items
	}
}

export default connect(mapStateToProps)(DndSort)