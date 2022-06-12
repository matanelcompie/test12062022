import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import * as SystemActions from '../../actions/SystemActions';

class FavoritesItem extends React.Component {
    visitFavoritePage(e) {
        e.preventDefault();
        this.props.router.push(this.props.item.url);
        this.props.dispatch({type: SystemActions.ActionTypes.HEADER.TOGGLE_FAVORITES_MENU});
    }

    render() {
        return (
                    <Link key={this.props.item.key} to={ this.props.item.url} className="dropdown-item"
                     onClick={this.visitFavoritePage.bind(this)}>{this.props.item.title}</Link>
                );
    }
}

export default connect()(withRouter(FavoritesItem))