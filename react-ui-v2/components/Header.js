import React from 'react';
import { connect } from 'react-redux';
import * as SystemActions from '../actions/SystemActions';
import {Motion, spring} from 'react-motion';
import Collapse from 'react-collapse';
import { Link } from 'react-router';
import LastViewedVoterItem from './LastViewedVoterItem';
import HeaderSearchItem from './HeaderSearchItem';
import FavoritesItem from './FavoritesItem';
import ModalWindow from './global/ModalWindow';
import ModalHeaderChangePassword from './global/ModalHeaderChangePassword';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.outsideClickHandler = null;
    }

    componentDidMount() {
        //set click handler for closing list
        this.outsideClickHandler = this.outsideClick.bind(this);
        document.addEventListener('mousedown', this.outsideClickHandler, false);
    }
        /*Close list on outside click*/
    outsideClick(e) {
        if (this.props.open && (e.target != this.refs.ToggleMenu)) {
            var sidebarWrapperClassName='SidebarWrapper';
            var isInternalClick=false;
            var parentNode = e.target;

            while (parentNode.nodeName != 'BODY') {
                var nodeClasses=parentNode.className.toString().split(' ');
                if (nodeClasses.indexOf(sidebarWrapperClassName)>-1) {
                    isInternalClick = true;
                    break;
                }
                parentNode = parentNode.parentNode;
            }
            if (!isInternalClick) {
                this.toggleMenu();
            }
        }
        
        if (this.props.lastViewedVotersMenuOpen && (e.target != this.refs.lastViewed)) {
            var topNavClassName='lastViewed';
            var isInternalClick=false;
            var parentNode = e.target;

            while (parentNode.nodeName != 'BODY') {
                var nodeClasses=parentNode.className.toString().split(' ');
                
                if (nodeClasses.indexOf(topNavClassName)>-1) {
                    isInternalClick = true;
                    break;
                }
                parentNode = parentNode.parentNode;
            }

            if (!isInternalClick) {
                this.toggleLastViewedMenu();
            }
        }
        
        if (this.props.userMenuOpen && (e.target != this.refs.logout)) {
            var topNavClassName='userLogin';
            var isInternalClick=false;
            var parentNode = e.target;

            while (parentNode.nodeName != 'BODY') {
                var nodeClasses=parentNode.className.toString().split(' ');
                
                if (nodeClasses.indexOf(topNavClassName)>-1) {
                    isInternalClick = true;
                    break;
                }
                parentNode = parentNode.parentNode;
            }

            if (!isInternalClick) {
                this.toggleUserMenu();
            }
            
        }
        
        if ((this.props.searchResult.length>0) && (e.target != this.refs.search)) {
            var topNavClassName='TopSearchArea';
            var isInternalClick=false;
            var parentNode = e.target;

            while (parentNode.nodeName != 'BODY') {
                var nodeClasses=parentNode.className.toString().split(' ');
                
                if (nodeClasses.indexOf(topNavClassName)>-1) {
                    isInternalClick = true;
                    break;
                }
                parentNode = parentNode.parentNode;
            }

            if (!isInternalClick) {
                this.props.dispatch({type: SystemActions.ActionTypes.HEADER.CLEAR_SEARCH});
            }
        }
        
        if (this.props.isFavoritesMenuOpen && (e.target != this.refs.favorites)) {
            var topNavClassName='favoritesList';
            var isInternalClick=false;
            var parentNode = e.target;

            while (parentNode.nodeName != 'BODY') {
                var nodeClasses=parentNode.className.toString().split(' ');
                
                if (nodeClasses.indexOf(topNavClassName)>-1) {
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
        document.removeEventListener('mousedown', this.outsideClickHandler, false);
    }

    toggleSearch() {
        // this.props.dispatch({type: SystemActions.ActionTypes.HEADER.TOGGLE_CURRENT_CAMPAIGN_NAME,display:false});
            this.props.dispatch({type: SystemActions.ActionTypes.TOGGLE_HEADER_SEARCH});
            if (this.props.showSearch) this.props.dispatch({type: SystemActions.ActionTypes.HEADER.CLEAR_SEARCH});
    }

    toggleMenu() {  
            this.props.dispatch({type: SystemActions.ActionTypes.MENU.TOGGLE_MENU});
    }

    toggleUserMenu() {
            this.props.dispatch({type: SystemActions.ActionTypes.MENU.TOGGLE_USER_MENU});
    }

    toggleLastViewedMenu() {
            this.props.dispatch({type: SystemActions.ActionTypes.HEADER.TOGGLE_LAST_VIEWED_VOTERS_MENU});
    }

    deleteLastViewedMenu() {
        SystemActions.deleteLastViewedVoters(this.props.dispatch);
        this.toggleLastViewedMenu();
    }
    
    toggleFavorites(e){
        e.preventDefault();
        this.props.dispatch({type: SystemActions.ActionTypes.HEADER.TOGGLE_FAVORITES_MENU});
    }

    setSearchStyle() {
            if (this.props.showSearch) {
                    this.searchMotion = {
                            width: 300
                    } 
                    this.searchStyle = {};
            }else {
                    this.searchMotion = {
                            width: 0
                    }
                    this.searchStyle = {
                            padding: "0px"
                    };
            }
            this.searchStyle.overflowX = 'hidden';
    }

    setUserStyle() {
            if ((this.props.currentUser.first_name == '')&&(this.props.currentUser.last_name == '')) {
                    this.userStyle = {
                            display: "none"
                    }
            } else {
                    this.userStyle = {}
            }
    }
    
    isUserAdmin() {
            if (this.props.currentUser.admin != true) {
                    this.adminStyle = {
                            display: "none"
                    }
            } else {
                    this.adminStyle = {}
            }
    }    

    setCurrentUserName() {
            this.userName = this.props.currentUser.first_name + " " + this.props.currentUser.last_name;
    }

    setLastViewedVoterItems() {
            this.lastViewedVoterItems = this.props.lastViewedVoters.map(function(voterItem) {
                    return <LastViewedVoterItem key={voterItem.key} voter={voterItem}/>
            });
    }

    setHeaderSearchItems() {
            var _this = this;
            this.headerSearchItems = this.props.searchResult.map(function(item) {
                    return <HeaderSearchItem key={item.key} item={item} searchType={_this.props.searchType} searchInput={_this.props.searchInput}/>
            });
    }

    setSearchText() {
            if (this.props.searching) {
                    this.searchButtonText = <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>;
            } else {
                    this.searchButtonText = "חפש";
            }
    }

    logout(e) {
            e.preventDefault();
            window.location = window.Laravel.baseURL + "logout";
    }

    changePassword(){
        this.openChangePWDDialog();
        //    e.preventDefault();
       //     window.location = window.Laravel.baseURL + "logout";
    }

    /*general function that closes all types of dialogues */
    closeModalDialog() {
        this.props.dispatch({
            type: SystemActions.ActionTypes.USERS.CLOSE_MODAL_DIALOG
        });

    }    

    /*open change password dialog */
    openChangePWDDialog() {
        this.props.dispatch({
            type: SystemActions.ActionTypes.HEADER.OPEN_CHANGE_PASSWORD_MODAL
        });
    }

    /*close change password dialog */
    closeChangePWDDialog() {
        this.props.dispatch({
            type: SystemActions.ActionTypes.USERS.CLOSE_CHANGE_PASSWORD_MODAL
        });
    }

    changeSearchType(e) {
            this.props.dispatch({type: SystemActions.ActionTypes.HEADER.SET_SEARCH_TYPE, searchType: e.target.value});
            this.props.dispatch({type: SystemActions.ActionTypes.HEADER.SEARCHED, searchResult: []});
    }

    changeSearchInput(e) {
            this.props.dispatch({type: SystemActions.ActionTypes.HEADER.SET_SEARCH_INPUT, searchInput: e.target.value});
    }

    searchInputKeyPress(e) {
            if (e.key == 'Enter') this.search();
    }

    search(e) {
            SystemActions.headerSearch(this.props.dispatch, this.props.searchType, this.props.searchInput);
    }

    setFavoritesItems(){
        this.favoriteItems = this.props.favorites.map(function(item) {
            return <FavoritesItem key={item.key} item={item}/>
        },this);
    }

    setEnv() {
        if (window.Laravel.env == 'production') {
            this.menuTitle = " ניהול קשרי תושבים ";
            this.logo = "logo-shas.png";
        } else {
            this.menuTitle = " ניהול קשרי תושבים - DEV";
            this.logo = 'dev-logo.png';
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
        if (password.value.trim() == '' && passwordAgain.value.trim() == '') {
            password.style.borderColor = "#ff0000";
            passwordAgain.style.borderColor = "#ff0000";
        } else {
            if (password.value.trim() == '') {
                password.style.borderColor = "#ff0000";
            } else {
                password.style.borderColor = "#ccc";
            }
            if (passwordAgain.value.trim() == '') {
                passwordAgain.style.borderColor = "#ff0000";
            } else {
                passwordAgain.style.borderColor = "#ccc";
            }
            if (password.value.trim() != passwordAgain.value.trim()) {
                password.style.borderColor = "#ff0000";
                passwordAgain.style.borderColor = "#ff0000";
            } else { /*this is the scenario where passwords are ok */
                password.style.borderColor = "#ccc";
                passwordAgain.style.borderColor = "#ccc";
                this.props.dispatch({
                    type: SystemActions.ActionTypes.USERS.USER_CHANGE_PASSWORD,
                    randomUserPassword: password.value
                });
                if(this.props.router.params.userKey != 'new'){
                     SystemActions.savePassword(this.props.dispatch, this.props.router, this.props.selectedUserData.key, password.value);
                }
                else{
                    this.props.dispatch({type: SystemActions.ActionTypes.USERS.PASSWORD_CHANGED_SUCCESSFULLY , data:password.value});
                }
            }
        }
    }

    
    render() {
		if(this.refs.searchBox){
			//console.log(document.body.offsetWidth/5)
		//	console.log(this.refs.searchBox.offsetWidth-document.body.offsetWidth );
		}
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
        if(this.refs.searchInlineBox){
            searchInlineBox = this.refs.searchInlineBox.offsetWidth
        }
        if (this.refs.searchBox) {
            let searchBoxWidth =this.refs.searchBox.offsetWidth;
            if (this.props.showSearch && searchBoxWidth < 1320) {
                marginLeft = (searchBoxWidth - searchInlineBox - 300 - 100) / 2;
            } else {
                marginLeft = (searchBoxWidth - searchInlineBox) / 2;
            }
        }
        let currentCampaignClass = this.props.currentCampaign['name'] != undefined ? 'currentCampaign' : 'hidden';
        return (
        <div>
            <header>
                    <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-9" id="searchBox" ref="searchBox">
                                <div ref="searchInlineBox" style={{display:'inline-block'}}>
                                        <a className="ToggleMenu" ref="ToggleMenu" onClick={this.toggleMenu.bind(this)}>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </a>
                                        <div className="systemName"> <Link to="./" title="לדף הבית"> <img src={window.Laravel.baseURL + "Images/" + this.logo} alt="לוגו שס" />{this.menuTitle}</Link></div>
                                        <ul className="RowIcons hidden-xs">
                                            <li>
                                                <a onClick={this.toggleLastViewedMenu.bind(this)} className="Icon TopNavIcon Recent PopoverTriger" title="נצפו לאחרונה">
                                                    <img ref="lastViewed" src={window.Laravel.baseURL + "Images/ico-recent.svg"} />
                                                </a>
                                                <ul className={"drop-down-menu TopNavIcon lastViewed" + (this.props.lastViewedVotersMenuOpen ? '' : ' hidden')}>
                                                    {this.lastViewedVoterItems}
                                                    <li onClick={this.deleteLastViewedMenu.bind(this)} style={{ borderTop: '1px solid #edf3f7', color: '#fff' }} className={(this.props.lastViewedVoters.length > 0 ? '' : 'hidden')}>
                                                        <i className="fa fa-trash-o"></i>&nbsp;&nbsp;מחק רשימה
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <a onClick={this.toggleFavorites.bind(this)} className="Icon TopNavIcon Favorites PopoverTriger" title="מועדפים">
                                                    <img src={window.Laravel.baseURL + "Images/ico-favourite.svg"} ref="favorites" />
                                                </a>
                                                <ul className={"drop-down-menu TopNavIcon favoritesList" + (this.props.isFavoritesMenuOpen ? '' : ' hidden')}>
                                                    {this.favoriteItems}
                                                </ul>
                                            </li>
                                            <li><a className="Icon TopNavIcon Search" title="חפש" ref="search" onClick={this.toggleSearch.bind(this)}><img src={window.Laravel.baseURL + "Images/ico-search.svg"} /></a>
                                            </li>
                                        </ul>
                                    </div>
                                        <Motion style={{ width: spring(this.searchMotion.width) }} >
                                            {value => <div className="TopSearchArea" ref="TopSearchArea" style={{ ...this.searchStyle, width: value.width }}>
                                                <input type="search" placeholder="חפש" value={this.props.searchInput} onChange={this.changeSearchInput.bind(this)} onKeyPress={this.searchInputKeyPress.bind(this)} />
                                                <select onChange={this.changeSearchType.bind(this)} value={this.props.searchType}>
                                                    <option value="voter">תושב</option>
                                                    <option value="request">פניה</option>
                                                </select>
                                                <button type="button" onClick={this.search.bind(this)} className="btn btn-primary navBtn">{this.searchButtonText}</button>
                                                <Collapse isOpened={true}>
                                                    <table className="drop-down-menu searchResults">
                                                        <tbody>{this.headerSearchItems}</tbody>
                                                    </table>
                                                </Collapse>
                                            </div>}
                                        </Motion>
                                        {this.props.currentCampaign &&
                                            <span style={{marginLeft, marginTop: '12px' }} className={currentCampaignClass}>{this.props.currentCampaign['name'] || ''}</span>
                                        }
                                    </div>
                                <div className="col-sm-4 col-md-3 hidden-xs">
                                    <div className="userLogin" style={this.userStyle}>
                                        <a href="javascript:void(0)" onClick={this.toggleUserMenu.bind(this)} title="התנתק" className="PopoverTriger" ref="logout">שלום &nbsp;
                                             <span className="userName">{this.userName}</span><span className="glyphicon glyphicon-triangle-bottom"></span>
                                        </a> 
                                                    {/*<span className="FloatPopover PagesList">
                                                     <a href="#">התנתק</a>                                                             
                                                     </span>*/}
                                        <ul className={"drop-down-menu" + (this.props.userMenuOpen? '' : ' hidden')}>
                                            <li style={this.adminStyle} > 
                                                <label className="switch" style={{top: '6px'}}>
                                                    <input className="slider" type="checkbox" onChange={this.updateAllVotersSwitch.bind(this)} checked={this.props.currentUser.is_view_all_voters} />
                                                    <span className="slider round" ></span>
                                                </label>
                                                <span> כל התושבים</span>
                                            </li>
                                            <li onClick={this.openChangePWDDialog.bind(this)}><a>שנה סיסמה</a></li>                                                            
                                            <li onClick={this.logout.bind(this)}><a href={window.Laravel.baseURL + "logout"}>התנתק</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </nav>
					</header>
                <ModalHeaderChangePassword />
		</div>
            )
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
        isFavoritesMenuOpen: state.system.header.isFavoritesMenuOpen,
        displayCurrentCampaign: state.system.header.displayCurrentCampaignName,
        oldPassword: state.system.userScreen.oldUserPassword,
        showChangePasswordModal: state.system.userScreen.showHeaderChangePasswordModal,
        showModalDialog: state.system.userScreen.showModalDialog,        
        closeModalDialog: state.system.userScreen.closeModalDialog,         
        modalHeaderText: state.system.userScreen.modalHeaderText,
        modalContentText: state.system.userScreen.modalContentText,
    }
}

export default connect(mapStateToProps)(Header);