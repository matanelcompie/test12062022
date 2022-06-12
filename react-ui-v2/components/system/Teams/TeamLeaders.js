import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../actions/SystemActions';
import Combo from '../../global/Combo';

class TeamLeaders extends React.Component {

	componentWillMount() {
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.TABLE_CONTENT_HAS_UPDATED, hasScrollbar:false});
	}

	 //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    getScrollHeaderStyle() {
        return this.props.tableHasScrollbar ? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
    }

    componentDidUpdate() {
    	if (!this.props.display) return;
        let hasScrollbar = false;

        if (undefined != this.self && null != this.self) {
            hasScrollbar = this.self.scrollHeight > this.self.clientHeight ? true : false;
        }

        if (hasScrollbar != this.props.tableHasScrollbar) {
            this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.TABLE_CONTENT_HAS_UPDATED, hasScrollbar});
        }
    }
	
	formatDateOnlyString(strr){
		 if(strr == null){return ''}
		 else{
		 if(strr != null){
			 let strArray = strr.split(' ');
			 strArray = strArray[0].split('-');
			 if(strArray.length == 3){
				 return strArray[2] + '/' + strArray[1] + '/' + strArray[0];
			 }
			 else{
				 return strr;
			 }
		 }
		 else{
			 return strr;
		 }
		 }
	 }
	
    render() {
		 
		if(this.props.display){
			let self = this;
			this.rows = '';
			if(this.props.teamLeadersHistory != undefined){
				this.rows=this.props.teamLeadersHistory
                .map(function(item , i){
                    return <tr id={i} key={i}>
					   <td>{item.personal_identity}</td>
					   <td>{item.first_name + ' ' + item.last_name}</td>
					   <td>{self.formatDateOnlyString(item.start_date)}</td>
					   <td>{self.formatDateOnlyString(item.end_date)}</td>
					</tr>;
            });
			}
			
	       return   <div>
		           <table className="table table-bordered table-striped table-hover lists-table">
				    <thead>
					   <tr>
					       <th>ת.ז.</th>
						   <th>שם מלא</th>
						   <th>מתאריך</th>
						   <th style={{ borderLeft:'none' }}>עד תאריך</th>
						   <th style={this.getScrollHeaderStyle()}></th>						   
					   </tr>
					</thead>
					<tbody ref={this.getRef.bind(this)} style={{height:'400px'}}>
					{this.rows}
					</tbody>
				</table>
			 </div>;
	    }
		else{
	       return  <div></div>;
		}
    }
}
;

function mapStateToProps(state) {
    return {
		teamLeadersHistory : state.system.teamsScreen.teamLeadersHistory,
		tableHasScrollbar: state.system.teamsScreen.tableHasScrollbar,
		scrollbarWidth: state.system.scrollbarWidth
    };
}

export default connect(mapStateToProps)(withRouter(TeamLeaders));
