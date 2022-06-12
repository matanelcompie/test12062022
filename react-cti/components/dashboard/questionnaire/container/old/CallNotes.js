import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import _ from 'lodash';

import * as callAnswerActions from 'actions/callAnswerActions';

import SupportStatus from '../display/SupportStatus';

class CallNotes extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.initState = {
            combinedCallNotes: {
                note: '',
                email: '',
                zip: '',
                city_id: '',
                support_status_id: '',
            },
            callNoteChanges: {}
        };
        this.state = Object.assign({}, this.initState);

        this.onFieldChange = this.onFieldChange.bind(this);
        this.handleTextInputChange = this.handleTextInputChange.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.callNotesInit, nextProps.callNotesInit)) {
            let combinedCallNotes = Object.assign({}, this.initState.combinedCallNotes, nextProps.callNotesInit);
            _.forEach(combinedCallNotes, function(value, key) {
                if (value === null) {
                    // fix null values from callNotesInit
                    combinedCallNotes[key] = '';
                }
            });
            this.setState({callNoteChanges: {}, combinedCallNotes});
        }
    }

    onFieldChange(key, value) {
        let initValue = this.props.callNotesInit[key] || '';

        let isChanged = (value.toString().trim() != initValue);
        let callNoteChanges = Object.assign({}, this.state.callNoteChanges);

        if (isChanged) {
            callNoteChanges[key] = value;
        } else {
            delete callNoteChanges[key];
        }

        let combinedCallNotes = Object.assign({}, this.initState.combinedCallNotes, this.props.callNotesInit, callNoteChanges);
        _.forEach(combinedCallNotes, function(value, key) {
            if (value === null) {
                // fix null values from callNotesInit
                combinedCallNotes[key] = '';
            }
        });

        this.setState({callNoteChanges, combinedCallNotes});
        this.props.callAnswerActions.storeCallNote(callNoteChanges);
    }

    handleTextInputChange(event) {
        let key = event.target.name;
        let value = event.target.value;
        this.onFieldChange(key, value);
    }


    handleSelectChange(event) {
        let key = event.target.name;
        let options = event.target.options;
        let selected = _.find(options, 'selected');
        this.onFieldChange(key, selected.value);
    };

    render() {
        return (
            <div className="call-notes">
                <h2>Call Notes:</h2>
                <dl>
                    <dt>note:</dt>
                    <dd className="call-notes__field call-notes__field_type_note">
                        <textarea name="note" onChange={this.handleTextInputChange} value={this.state.combinedCallNotes.note} />
                    </dd>
                    <dt>email:</dt>
                    <dd className="call-notes__field call-notes__field_type_email">
                        <input type="text" name="email" onChange={this.handleTextInputChange} value={this.state.combinedCallNotes.email}/>
                    </dd>
                    <dt>zip:</dt>
                    <dd className="call-notes__field call-notes__field_type_zip">
                        <input type="text" name="zip" onChange={this.handleTextInputChange} value={this.state.combinedCallNotes.zip}/>
                    </dd>
                    <dt>city:</dt>
                    <dd className="call-notes__field call-notes__field_type_city">
                        <select name="city_id" onChange={this.handleSelectChange} value={this.state.combinedCallNotes.city_id}>
                            <option style={{display: (this.state.combinedCallNotes.city_id !== '') ? 'none' : 'block'}}/>
                            {this.props.cities.map(city =>
                                <option key={city.key} label={city.name} value={city.id} />
                            )}
                        </select>
                    </dd>
                    <SupportStatus
                        statusList={this.props.lists.support_statuses}
                        onChange={this.onFieldChange}
                        selectedId={this.state.combinedCallNotes.support_status_id}
                    />
                </dl>
            </div>
        );
    }
}

CallNotes.propTypes = {
    callNotesInit: PropTypes.object,
    lists: PropTypes.object,
    cities: PropTypes.array,
};

CallNotes.defaultProps = {
    lists: {},
};

function mapStateToProps(state, ownProps) {
    let activeCall = state.call.activeCall;
    let lists = state.system.lists;

    let callNotesInit = {};
    if (activeCall) {
        callNotesInit.email = activeCall.voter.email;
        callNotesInit.zip = activeCall.voter.zip;
        callNotesInit.city_id = activeCall.voter.city_id;
        callNotesInit.support_status_id = activeCall.voter.support_status_tm;
    }

    let cities = [];
    if(state.system.lists) {
       cities = state.system.lists.cities;
    }

    return {
        callNotesInit,
        lists,
        cities,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        callAnswerActions: bindActionCreators(callAnswerActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CallNotes);
