import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import * as SystemActions from '../../actions/SystemActions';
class Breadcrumbs extends React.Component {
    constructor(props) {
        super(props);
		this.state = {};
        this.textIgniter();
    }

    componentDidMount() {
        this.handleUrlBreadcrumb(this.props);
    }

    componentDidUpdate() {
        if (this.shouldBreadcrumbUpdate()) {
            this.updateBreadcrumbData();
        }
    }

    componentWillReceiveProps(nextProps) {
		 
        if (this.props.location.pathname != nextProps.location.pathname) {
            this.handleUrlBreadcrumb(nextProps);
        }
    }

    shouldBreadcrumbUpdate() {
		 
        var currentUrl = this.props.location.pathname.replace(/\/+$/, '');
        return true;
    }

    handleUrlBreadcrumb(nextProps) {

        var currentUrl = nextProps.location.pathname.replace(/\/+$/, ''); //delete the last slash from the url if exists.
        switch (true) {
			case /polls\//.test(currentUrl):
                this.addBreadcrumb(true, '/polls/search', 'סקרים', 'polls');
                if( /polls\/new/.test(currentUrl) ){ // new poll
                    this.addBreadcrumb(false, nextProps.location.pathname, 'סקר חדש', 'polls');
                }
            break;

        }
    }

    updateBreadcrumbData() {
 
        var currentUrl = this.props.location.pathname.replace(/\/+$/, '');
 
        switch (true) {
            case '':
                // this.updateBreadcrumbTitle(title);
                break;
        }
    }

    updateBreadcrumbTitle(title) {
        if (title != this.props.breadcrumbs[(this.props.breadcrumbs.length - 1)].title) {
            this.props.dispatch({ type: SystemActions.ActionTypes.BREADCRUMBS.UPDATE, title });
        }
    }

    addBreadcrumb(reset, url, title, elmentType) {
        if (reset) {
            this.resetBreadcrumbs();
        }
        this.props.dispatch({ type: SystemActions.ActionTypes.BREADCRUMBS.ADD, newLocation: { url, title, elmentType } });
    }

    resetBreadcrumbs() {
        this.props.dispatch({ type: SystemActions.ActionTypes.BREADCRUMBS.RESET });
    }

    textIgniter() {
        this.textValues = {
            toPDF: 'יצוא לPDF',
            add: 'הדפסה',
            addToFavorites: 'הוספת דף למועדפים',
            removeFromFavorites: 'הסרת דף מהמועדפים',
        };
    }

    renderFavoritesIcon() {
        var isPageInFavoritesList = false;
        var pageKey = null;
        const currentUrl = this.props.location.pathname;

        // this.props.favorites.map(function (item) {
        //     if (item.url == currentUrl) {
        //         isPageInFavoritesList = true;
        //         pageKey = item.key;
        //         return;
        //     }
        // });

        this.favoritesIcon = <i onClick={this.addToFavorites.bind(this)} className="fa fa-star-o fa-lg cursor-pointer"
            title={this.textValues.addToFavorites} style={{ color: '#498bb6' }}></i>;
        if (isPageInFavoritesList) {
            this.favoritesIcon = <i onClick={this.removeFromFavorites.bind(this, pageKey)} className="fa fa-star fa-lg cursor-pointer"
                title={this.textValues.removeFromFavorites} style={{ color: '#498bb6' }}></i>
        }
    }

    addToFavorites() {
        let currentUrl = this.props.location.pathname;
        let title = this.props.systemTitle;
        // SystemActions.addToFavorites(this.props.dispatch, currentUrl, title);
    }
    removeFromFavorites(pageKey) {
        // SystemActions.removeFromFavorites(this.props.dispatch, pageKey);
    }

    renderBreadcrumbs() {
        this.breadcrumbs = this.props.breadcrumbs.map((item, i) => {
            return <li key={i} className="breadcrumb-item"><Link to={ item.url} onClick={this.visitPage.bind(this, item.url , false)}>{item.title}</Link></li>;
        }, this);
    }

    visitPage(url , item, e) {
        // e.preventDefault();
        // this.props.history.push(url);
    }

    render() {
        this.renderFavoritesIcon();
        this.renderBreadcrumbs();
        return (
            
            // <div className="breadCrumbsStrip clearfix">
            //     {this.favoritesIcon}
            //     <ol className="breadcrumb">
            //         {this.breadcrumbs}
            //     </ol>
            // </div>
            <div className="row no-gutters">
            <div className="col-12">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb ">
                    {this.breadcrumbs}
                </ol>
              </nav>
            </div>
          </div>
        )
    }
}
function mapStateToProps(state) {
    return {
        systemTitle: state.system.systemTitle,
        breadcrumbs: state.system.breadcrumbs,
    }
}

export default connect(mapStateToProps)(withRouter(Breadcrumbs))
