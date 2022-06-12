import React from "react";
import { connect } from "react-redux";
import * as SystemActions from "../../actions/SystemActions";
import { Motion, spring } from "react-motion";
import Collapse from "react-collapse";
import { Link } from "react-router-dom";
import LastViewedVoterItem from "./LastViewedVoterItem";
import HeaderSearchItem from "./HeaderSearchItem";
import FavoritesItem from "./FavoritesItem";
import ModalHeaderChangePassword from "./ModalHeaderChangePassword";

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.outsideClickHandler = null;
    this.dropDownOpenStyle = {
      position: 'absolute',
      willChange: 'transform',
      top: '0px',
      left: '0px',
      transform: 'translate3d(-91px, 63px, 0px)',
    }
    this.dropDownOpenNameStyle = {
      ...this.dropDownOpenStyle,
      transform: 'translate3d(62px, 63px, 0px)',
    }
  }

  componentDidMount() {
    // set click handler for closing list
    // this.outsideClickHandler = this.outsideClick.bind(this);
    // document.addEventListener("mousedown", this.outsideClickHandler, false);
  }
  /*Close list on outside click*/
  outsideClick(e) {
    if (this.props.open && e.target != this.refs.ToggleMenu) {
      var sidebarWrapperClassName = "SidebarWrapper";
      var isInternalClick = false;
      var parentNode = e.target;

      while (parentNode.nodeName != "BODY") {
        var nodeClasses = parentNode.className.toString().split(" ");
        if (nodeClasses.indexOf(sidebarWrapperClassName) > -1) {
          isInternalClick = true;
          break;
        }
        parentNode = parentNode.parentNode;
      }
      if (!isInternalClick) {
        this.toggleMenu();
      }
    }

    if (this.props.lastViewedVotersMenuOpen && e.target != this.refs.lastViewed) {
      var topNavClassName = "lastViewed";
      var isInternalClick = false;
      var parentNode = e.target;

      while (parentNode.nodeName != "BODY") {
        var nodeClasses = parentNode.className.toString().split(" ");

        if (nodeClasses.indexOf(topNavClassName) > -1) {
          isInternalClick = true;
          break;
        }
        parentNode = parentNode.parentNode;
      }

      if (!isInternalClick) {
        // this.toggleLastViewedMenu();
      }
    }

    if (this.props.userMenuOpen && e.target != this.refs.logout) {
      var topNavClassName = "userLogin";
      var isInternalClick = false;
      var parentNode = e.target;

      while (parentNode.nodeName != "BODY") {
        var nodeClasses = parentNode.className.toString().split(" ");

        if (nodeClasses.indexOf(topNavClassName) > -1) {
          isInternalClick = true;
          break;
        }
        parentNode = parentNode.parentNode;
      }

      if (!isInternalClick) {
        this.toggleUserMenu();
      }
    }

    if (this.props.searchResult.length > 0 && e.target != this.refs.search) {
      var topNavClassName = "TopSearchArea";
      var isInternalClick = false;
      var parentNode = e.target;

      while (parentNode.nodeName != "BODY") {
        var nodeClasses = parentNode.className.toString().split(" ");

        if (nodeClasses.indexOf(topNavClassName) > -1) {
          isInternalClick = true;
          break;
        }
        parentNode = parentNode.parentNode;
      }

      if (!isInternalClick) {
        this.props.dispatch({
          type: SystemActions.ActionTypes.HEADER.CLEAR_SEARCH,
        });
      }
    }

    if (this.props.isFavoritesMenuOpen && e.target != this.refs.favorites) {
      var topNavClassName = "favoritesList";
      var isInternalClick = false;
      var parentNode = e.target;

      while (parentNode.nodeName != "BODY") {
        var nodeClasses = parentNode.className.toString().split(" ");

        if (nodeClasses.indexOf(topNavClassName) > -1) {
          isInternalClick = true;
          break;
        }
        parentNode = parentNode.parentNode;
      }

      if (!isInternalClick) {
        this.toggleFavorites(e);
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.outsideClickHandler, false);
  }

  toggleSearch() {
    // this.props.dispatch({type: SystemActions.ActionTypes.HEADER.TOGGLE_CURRENT_CAMPAIGN_NAME,display:false});
    this.props.dispatch({
      type: SystemActions.ActionTypes.MENU.TOGGLE_HEADER_SEARCH,
    });
    if (this.props.showSearch)
      this.props.dispatch({
        type: SystemActions.ActionTypes.HEADER.CLEAR_SEARCH,
      });
  }

  toggleMenu() {
    this.props.dispatch({ type: SystemActions.ActionTypes.MENU.TOGGLE_MENU });
  }

  toggleUserMenu() {
    this.props.dispatch({
      type: SystemActions.ActionTypes.MENU.TOGGLE_USER_MENU,
    });
  }

  toggleLastViewedMenu() {
    this.props.dispatch({
      type: SystemActions.ActionTypes.HEADER.TOGGLE_LAST_VIEWED_VOTERS_MENU,
    });
  }

  deleteLastViewedMenu() {
    SystemActions.deleteLastViewedVoters(this.props.dispatch);
    this.toggleLastViewedMenu();
  }

  toggleFavorites(e) {
    e.preventDefault();
    this.props.dispatch({type: SystemActions.ActionTypes.HEADER.TOGGLE_FAVORITES_MENU,});
  }

  setSearchStyle() {
    if (this.props.showSearch) {
      this.searchMotion = {width: 300};
      this.searchStyle = {};
    } else {
      this.searchMotion = {width: 0,};
      this.searchStyle = {padding: "0px"};
    }
    // this.searchStyle.overflowX = "hidden";
  }

  setUserStyle() {
    if (
      this.props.currentUser.first_name == "" &&
      this.props.currentUser.last_name == ""
    ) {
      this.userStyle = {
        display: "none",
      };
    } else {
      this.userStyle = {};
    }
  }

  isUserAdmin() {
    if (this.props.currentUser.admin != true) {
      this.adminStyle = {
        display: "none",
      };
    } else {
      this.adminStyle = {};
    }
  }

  setCurrentUserName() {
    this.userName =
      this.props.currentUser.first_name +
      " " +
      this.props.currentUser.last_name;
  }

  setLastViewedVoterItems() {
    this.lastViewedVoterItems = this.props.lastViewedVoters.map(function (
      voterItem
    ) {
      return <LastViewedVoterItem key={voterItem.key} voter={voterItem} />;
    });
  }

  setHeaderSearchItems() {
    var _this = this;
    this.headerSearchItems = this.props.searchResult.map(function (item) {
      return (
        <HeaderSearchItem
          key={item.key}
          item={item}
          searchType={_this.props.searchType}
          searchInput={_this.props.searchInput}
        />
      );
    });
  }

  setSearchText() {
    if (this.props.searching) {
      this.searchButtonText = (
        <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
      );
    } else {
      this.searchButtonText = "חפש";
    }
  }

  logout(e) {
    e.preventDefault();
    window.location = window.Laravel.baseURL + "logout";
  }

  changePassword() {
    this.openChangePWDDialog();
    //    e.preventDefault();
    //     window.location = window.Laravel.baseURL + "logout";
  }

  /*general function that closes all types of dialogues */
  closeModalDialog() {
    this.props.dispatch({
      type: SystemActions.ActionTypes.USERS.CLOSE_MODAL_DIALOG,
    });
  }

  /*open change password dialog */
  openChangePWDDialog() {
    this.props.dispatch({
      type: SystemActions.ActionTypes.HEADER.OPEN_CHANGE_PASSWORD_MODAL,
    });
  }

  /*close change password dialog */
  closeChangePWDDialog() {
    this.props.dispatch({
      type: SystemActions.ActionTypes.USERS.CLOSE_CHANGE_PASSWORD_MODAL,
    });
  }

  changeSearchType(e) {
    this.props.dispatch({
      type: SystemActions.ActionTypes.HEADER.SET_SEARCH_TYPE,
      searchType: e.target.value,
    });
    this.props.dispatch({
      type: SystemActions.ActionTypes.HEADER.SEARCHED,
      searchResult: [],
    });
  }

  changeSearchInput(e) {
    this.props.dispatch({
      type: SystemActions.ActionTypes.HEADER.SET_SEARCH_INPUT,
      searchInput: e.target.value,
    });
  }

  searchInputKeyPress(e) {
    if (e.key == "Enter") this.search();
  }

  search(e) {
    SystemActions.headerSearch(
      this.props.dispatch,
      this.props.searchType,
      this.props.searchInput
    );
  }

  setFavoritesItems() {
    this.favoriteItems = this.props.favorites.map(function (item) {
      return <FavoritesItem key={item.key} item={item} />;
    }, this);
  }

  setEnv() {
    if (window.Laravel.env == "production") {
      this.menuTitle = " ניהול קשרי בוחרים ";
      this.logo = "logo-shas.png";
    } else {
      this.menuTitle = " ניהול קשרי בוחרים - DEV";
      this.logo = "dev-logo.png";
    }
  }

  updateAllVotersSwitch(e) {
    const target = e.target;
    const value = target.checked;

    SystemActions.updateViewAllVoters(this.props.dispatch, value);
  }

  /*validate change password form , and then send request to api */
  changeToNewPassword() {
    let password = this.refs.password;
    let passwordAgain = this.refs.passwordAgain;
    if (password.value.trim() == "" && passwordAgain.value.trim() == "") {
      password.style.borderColor = "#ff0000";
      passwordAgain.style.borderColor = "#ff0000";
    } else {
      if (password.value.trim() == "") {
        password.style.borderColor = "#ff0000";
      } else {
        password.style.borderColor = "#ccc";
      }
      if (passwordAgain.value.trim() == "") {
        passwordAgain.style.borderColor = "#ff0000";
      } else {
        passwordAgain.style.borderColor = "#ccc";
      }
      if (password.value.trim() != passwordAgain.value.trim()) {
        password.style.borderColor = "#ff0000";
        passwordAgain.style.borderColor = "#ff0000";
      } else {
        /*this is the scenario where passwords are ok */
        password.style.borderColor = "#ccc";
        passwordAgain.style.borderColor = "#ccc";
        this.props.dispatch({
          type: SystemActions.ActionTypes.USERS.USER_CHANGE_PASSWORD,
          randomUserPassword: password.value,
        });
        if (this.props.router.params.userKey != "new") {
          SystemActions.savePassword(
            this.props.dispatch,
            this.props.router,
            this.props.selectedUserData.key,
            password.value
          );
        } else {
          this.props.dispatch({
            type: SystemActions.ActionTypes.USERS.PASSWORD_CHANGED_SUCCESSFULLY,
            data: password.value,
          });
        }
      }
    }
  }

  render() {
    this.setSearchStyle();
    this.setUserStyle();
    this.isUserAdmin();
    this.setCurrentUserName();
    this.setLastViewedVoterItems();
    this.setSearchText();
    this.setHeaderSearchItems();
    this.setFavoritesItems();
    this.setEnv();
    let marginLeft = document.body.offsetWidth / 5 - 150;
    let searchInlineBox = 400;
    if (this.refs.searchInlineBox) {
      searchInlineBox = this.refs.searchInlineBox.offsetWidth;
    }
    if (this.refs.searchBox) {
      let searchBoxWidth = this.refs.searchBox.offsetWidth;
      if (this.props.showSearch && searchBoxWidth < 1320) {
        marginLeft = (searchBoxWidth - searchInlineBox - 300 - 100) / 2;
      } else {
        marginLeft = (searchBoxWidth - searchInlineBox) / 2;
      }
    }
    let currentCampaignClass =
      this.props.currentCampaign["name"] != undefined
        ? "currentCampaign"
        : "hidden";
    return (
      <React.Fragment>
        <header>
            <div className="header-content">
                  <div className="r-side">
                      <nav className="hamburger-menu">
                          <button onClick={this.toggleMenu.bind(this)} className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                              <span className="navbar-toggler-icon"></span>
                          </button>
                      </nav>
                      
                      <div className="main-menu">
                          <Link to="/" title={this.menuTitle}>
                              <img src={window.Laravel.baseURL + "Images/" + this.logo } alt="לוגו שס" aria-label="לוגו שס" />
                          </Link>

                          <h1>{this.props.headerTitle}</h1>
                          <nav>
                              <div className="dropdown">
                                  <button onClick={this.toggleLastViewedMenu.bind(this)}  className="dropdown-toggle" id="last-voters" title="בוחרים אחרונים" aria-label="בוחרים אחרונים" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                      <img src={window.Laravel.baseURL + "Images/polls/icon-schedue.svg" }  alt="בוחרים אחרונים" aria-hidden="true"/>
                                  </button>
                                  <div className={"dropdown-menu " + (this.props.lastViewedVotersMenuOpen ? 'show': '')} aria-labelledby="last-voters" style={this.dropDownOpenStyle}>
                                    {this.lastViewedVoterItems}
                                      
                                      <div className="dropdown-divider"></div>
                                      <a onClick={this.deleteLastViewedMenu.bind(this)} className="dropdown-item drodown-w-icon-item" href="#" title="מחק רשימה">
                                          <img src={window.Laravel.baseURL + "Images/polls/trash-white.svg" } alt="מחק רשימה" />   
                                          מחק רשימה
                                      </a>
                                  </div> 
                              </div>
                              <div className="dropdown">
                                  <button onClick={this.toggleFavorites.bind(this)}  className="dropdown-toggle" id="favorite-list" title="רשימת המועדפים" aria-label="רשימת המועדפים" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                      <img src={window.Laravel.baseURL + "Images/polls/icon-star.svg" }  alt="רשימת המועדפים" aria-hidden="true" />
                                  </button>
                                  <div className={"dropdown-menu " + (this.props.isFavoritesMenuOpen ? 'show': '')} aria-labelledby="last-voters" style={this.dropDownOpenStyle}>
                                    {this.favoriteItems}
                                  </div>
                              </div>
                              <button type="button" className="top-search-btn" title="חיפוש" aria-label="חיפוש" onClick={this.toggleSearch.bind(this)}>
                                  <img src={window.Laravel.baseURL + "Images/polls/icon-search.svg" } alt="" aria-hidden="true" />
                              </button>
                              {/* <Motion style={{ width: spring(this.searchMotion.width) }}>
                                {(value) => ( */}
                                    <div className="top-search-area-wrapper" >
                                    {/* <div className="top-search-area-wrapper" style={{  width: value.width }}> */}
                                        <div className={"top-search-area "} style={ (this.props.showSearch ? {display: 'flex'}: {})}>
                                            <input
                                                type="search"
                                                placeholder="חפש"
                                                value={this.props.searchInput}
                                                onChange={this.changeSearchInput.bind(this)}
                                                onKeyPress={this.searchInputKeyPress.bind(this)}
                                            />
                                            <select
                                              onChange={this.changeSearchType.bind(this)}
                                              value={this.props.searchType}
                                            >
                                              <option value="voter">בוחר</option>
                                              <option value="request">פניה</option>
                                            </select>
                                            <button onClick={this.search.bind(this)} className="show-search-result" type="button" aria-label="חפש" title="חפש">{this.searchButtonText}</button>
                                        </div>
                                        <div className="search-result" style={this.props.searchResult.length > 0 ? {display: 'block'} : {}}>
                                            <div className="search-result-inner">
                                                {this.headerSearchItems}
                                            </div>
                                        </div>  
                                    </div>
                                  {/* )} */}
                              {/* </Motion> */}
                          </nav>
                      </div>
                  </div>
                  <div className={"group-name "+currentCampaignClass}><h2> {this.props.currentCampaign['name'] || ''} </h2></div>

                  <nav className="user-menu">
                      <div className="dropdown">
                          <button onClick={this.toggleUserMenu.bind(this)}  className="dropdown-toggle" id="user-bar" title="סרגל המשתמש" aria-label="סרגל המשתמש" data-toggle="dropdown" aria-expanded="false">
                                שלום <b>{this.userName}</b>
                          </button>
                          <div aria-labelledby="user-bar" id="dropdown-menu-user" className={"dropdown-menu " +(this.props.userMenuOpen ? "show" : "")} style={this.dropDownOpenNameStyle}>
                              <div className="custom-control custom-switch">
                                  <input type="checkbox" className="custom-control-input" id="customSwitchVoter"
                                      onChange={this.updateAllVotersSwitch.bind(this)} checked={this.props.currentUser.is_view_all_voters}/>
                                  <label className="custom-control-label" htmlFor="customSwitchVoter">כל הבוחרים</label>
                                </div>
                              <a onClick={this.openChangePWDDialog.bind(this)} className="dropdown-item" href="#" title="שנה סיסמה">שנה סיסמה</a>
                              <a onClick={this.logout.bind(this)} className="dropdown-item" href={window.Laravel.baseURL + "logout"} title="התנתק">התנתק</a>
                          </div>
                      </div>
                  </nav>
              </div>

        </header>
        <ModalHeaderChangePassword></ModalHeaderChangePassword>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    open: state.system.menus.open,
    showSearch: state.system.header.showSearch,
    currentUser: state.system.currentUser,
    currentCampaign: state.system.currentCampaign,
    userMenuOpen: state.system.menus.userMenuOpen,
    lastViewedVoters: state.system.header.lastViewedVoters,
    lastViewedVotersMenuOpen: state.system.header.lastViewedVotersMenuOpen,
    searchInput: state.system.header.searchInput,
    searchType: state.system.header.searchType,
    searchResult: state.system.header.searchResult,
    searching: state.system.header.searching,
    favorites: state.system.header.favorites,
    headerTitle:state.system.header.headerTitle,
    isFavoritesMenuOpen: state.system.header.isFavoritesMenuOpen,
    displayCurrentCampaign: state.system.header.displayCurrentCampaignName,
    oldPassword: state.system.userScreen.oldUserPassword,
    showChangePasswordModal: state.system.userScreen.showHeaderChangePasswordModal,
    showModalDialog: state.system.userScreen.showModalDialog,
    closeModalDialog: state.system.userScreen.closeModalDialog,
    modalHeaderText: state.system.userScreen.modalHeaderText,
    modalContentText: state.system.userScreen.modalContentText,
  };
}

export default connect(mapStateToProps)(Header);
