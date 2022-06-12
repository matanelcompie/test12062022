import React from 'react';
import PropTypes from 'prop-types';


const Note = ({note, onNoteChange}) => {
    return (
        <div className="call-note">
            <textarea className="call-note__note" value={note} onChange={onNoteChange} />
        </div>
    );
};

Note.propTypes = {
    note: PropTypes.string,
    onNoteChange: PropTypes.func,
};

export default Note;
