import React from 'react';
import {connect} from 'react-redux';
import * as SystemActions from '../../actions/SystemActions';
import Main from './Main';
import Search from './Search';
import Results from './Results';

class Home extends React.Component {
    constructor(props) {
        super(props);
		this.state = {
			loadedCrmRequests:false
		}
    }
	
	onLoadedCrmRequests(){
		this.setState({loadedCrmRequests:true});
	}

    componentWillMount() {
        // Making sure that current user has been loaded
        if ( this.props.currentUser.first_name.length > 0 ) {
            // Checking if user is permitted to use the resource
            if ( !this.props.currentUser.admin && this.props.currentUser.permissions['home'] != true ) {
                this.props.router.push('/unauthorized');
            }
        }

        this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'מסך בית'});
        SystemActions.getLoginUserSummary(this.props.dispatch , this.onLoadedCrmRequests.bind(this));
    }

    componentWillReceiveProps(nextProps) {
        // Making sure that current user has been loaded
        if ( 0 == this.props.currentUser.first_name.length && nextProps.currentUser.first_name.length > 0) {
            // Checking if user is permitted to use the resource
            if ( !nextProps.currentUser.admin && nextProps.currentUser.permissions['home'] != true ) {
                this.props.router.push('/unauthorized');
            }
        }
    }

    render() {
        return (
                <div>
                    <Main loadedCrmRequests={this.state.loadedCrmRequests} summaryCount={this.props.summaryCount} displayTarget={this.props.summaryDisplayTarget} 
                          averageHandleTime={this.props.averageHandleTime}/>
                    {false && <Search />}
                    <Results loadedCrmRequests={this.state.loadedCrmRequests} />
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        summaryCount: state.system.crmHomeScreen.summaryCount,
        summaryDisplayTarget: state.system.crmHomeScreen.summaryDisplayTarget,
        averageHandleTime: state.system.crmHomeScreen.averageHandleTime,
        currentUser: state.system.currentUser
    };
}

export default connect(mapStateToProps)(Home);
