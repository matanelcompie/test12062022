import { connect } from 'react-redux';
import R from 'ramda';

import Header from '../display/Header';


function mapStateToProps(state, ownProps) {
  let userName = R.isEmpty(state.system.currentUser) ? "" : state.system.currentUser.first_name + ' ' + state.system.currentUser.last_name;
  return {
    voter: state.call.activeCall.voter,
    questionnaireName: state.campaign.questionnaire.name,
    supportStatusConstOptions: state.system.lists.support_statuses,
    nextCall: ownProps.nextCall,
    userName,
  };
}

export default connect(mapStateToProps)(Header);
