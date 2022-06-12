import React from 'react';

class Unauthorized extends React.Component {
    render() {
        return (
                <div className="main-section-block">
                    <div>
                        <h1>אין לך הרשאה לגשת למשאב זה.</h1>
                    </div>
                </div>
                )
    }
}

export default Unauthorized