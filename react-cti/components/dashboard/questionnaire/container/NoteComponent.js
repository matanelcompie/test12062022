import {connect} from 'react-redux';

import * as callAnswerActions from 'actions/callAnswerActions';

import Note from '../display/Note';


function mapStateToProps(state, ownProps) {
    return {
    	note: state.callAnswer.callNote.note,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onNoteChange: (event) => dispatch(callAnswerActions.onCallAnswerChange(['callNote', 'note'], event.target.value))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Note);
