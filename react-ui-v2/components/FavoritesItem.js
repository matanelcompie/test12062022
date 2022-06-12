import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import * as SystemActions from '../actions/SystemActions';

class FavoritesItem extends React.Component {
    visitFavoritePage(e) {
        e.preventDefault();
        this.props.router.push(this.props.item.url);
        this.props.dispatch({type: SystemActions.ActionTypes.HEADER.TOGGLE_FAVORITES_MENU});
    }

    render() {
        return (
                <li>
                    <a key={this.props.item.key} href={this.props.router.location.basename + this.props.item.url} onClick={this.visitFavoritePage.bind(this)}>{this.props.item.title}</a>
                </li>
                );
    }
}

export default connect()(withRouter(FavoritesItem))