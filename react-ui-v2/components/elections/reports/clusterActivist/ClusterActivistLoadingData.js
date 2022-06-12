import React from 'react';

const ClusterActivistLoadingData = ({cancelSearch}) => {
    return (
        <div className="container">
            <button className="btn btn-danger" title="בטל חיפוש" onClick={cancelSearch.bind(this)}>
                <i className="fa fa-chain-broken"/>
            </button>

            <i className="fa fa-spinner fa-spin pull-right" style={{marginTop: 5}}/>
        </div>
    );
};

export default ClusterActivistLoadingData;