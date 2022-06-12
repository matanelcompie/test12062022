import React from 'react';
import { connect } from 'react-redux';
import VoterGroupItem from './VoterGroupItem';
import * as SystemActions from '../../../../../actions/SystemActions';

class VoterGroupList extends React.Component {
	
	/*
		Function that renders all rows
	*/
    renderRows() {
        if (this.props.items.length > 0) {
            return this.props.items.map(function (item) {
                return <VoterGroupItem key={item.key} items={item} isEditMode={this.props.isEditMode} 
                                itemInEditMode={this.props.itemInEditMode} keyInSelectMode={this.props.keyInSelectMode} itemInAddMode={this.props.itemInAddMode}
                                openVoterGroups={this.props.openVoterGroups} currentUser={this.props.currentUser} GlobalDirty={this.props.GlobalDirty}
								rgbExpandColor={this.props.rgbExpandColor} rgbRowColor={this.props.rgbRowColor}
								showAddEditNewGroupWindow={this.props.showAddEditNewGroupWindow.bind(this)}
								/>
            }, this);
        }
    }
	
    render() {
        return (<ul className='ul-list' style={this.props.ulStyle}>
                    {this.renderRows()}
                </ul>);
    }
}
export default connect()(VoterGroupList);