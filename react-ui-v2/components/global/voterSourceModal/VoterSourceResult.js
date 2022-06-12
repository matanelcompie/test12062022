import React from 'react';
import { connect } from 'react-redux';

import Pagination from 'components/global/Pagination';
import VoterItem from './VoterItem';

import * as GlobalActions from 'actions/GlobalActions';


class VoterSourceResult extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,

            currentPageVoters: []
        };

        this.initConstants();
    }

    initConstants() {
        this.votersPerPage = 20;

        this.maxDbRows = 100;
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.loadedVoters && nextProps.loadedVoters ) {
            this.setState({currentPage: 1});

            this.loadPageVoters(1, nextProps);
        }

        // If hiding the vote source moda;
        // then reset all the state variables
        if ( this.props.show && !nextProps.show ) {
            this.setState({currentPage: 1, currentPageVoters: []});
        }
    }

    loadPageVoters(currentPage, nextProps = null) {
        let currentPageVoters = [];
        let votersSearchResult = [];
        let totalVotersSearchResult = 0;

        let bottomIndex = (currentPage - 1) * this.votersPerPage;
        let topIndex = (currentPage * this.votersPerPage) - 1;

        if ( null == nextProps ) {
            votersSearchResult= this.props.voters;
            totalVotersSearchResult = this.props.totalVoters;
        } else {
            votersSearchResult = nextProps.voters;
            totalVotersSearchResult = nextProps.totalVoters;
        }

        if ( topIndex > (totalVotersSearchResult - 1) ) {
            topIndex = totalVotersSearchResult - 1;
        }

        for ( let voterIndex = bottomIndex; voterIndex <= topIndex; voterIndex++ ) {
            currentPageVoters.push(votersSearchResult[voterIndex]);
        }

        this.setState({currentPageVoters});
    }

    loadMoreVoters(nextPage) {
        let totalVoters = this.props.totalVoters;
        let votersSearchResult = this.props.voters;

        // total number of pages
        let totalPages = Math.ceil(totalVoters / this.votersPerPage);

        // number of voters in pages 1 - nextPage
        let nextPageNumOfBallots = nextPage * this.votersPerPage;

        // Checking if we are in the last page
        if (nextPage > totalPages) {
            return;
        }

        // If votersSearchResult contains all the search result,
        // then there is nothing to load
        if ( votersSearchResult.length == totalVoters ) {
            return;
        }

        // If number of voters in pages from 1 till next page
        // are less than votersSearchResult voters, then there
        // is nothing to load
        if (nextPageNumOfBallots <= votersSearchResult.length) {
            return;
        }

        let currentDbPage = Math.floor( (nextPage * this.votersPerPage) / this.maxRecoredsFromDb ) + 1;
        let dbConstraints = {
            current_page: currentDbPage,
            max_rows: this.maxDbRows
        };
        let searchFields = this.props.buildDbSearchFields();
        GlobalActions.searchVoterSourceVoters(this.props.dispatch, searchFields, dbConstraints);
    }

    navigateToPage(pageIndex) {
        this.setState({currentPage: pageIndex});

        this.loadPageVoters(pageIndex);

        this.loadMoreVoters(pageIndex + 1);
        this.loadMoreVoters(pageIndex + 2);
    }

    renderVoterItems() {
        let that = this;

        let currentPageVoters = this.state.currentPageVoters.map( function(item, index) {
            let currentIndex = (that.state.currentPage - 1) * that.votersPerPage + index + 1;

            return <VoterItem key={index} currentIndex={currentIndex} item={item} selectedVoterKey={that.props.selectedVoterKey}
                              selectVoterItem={that.props.selectVoterItem.bind(that)}/>;
        });

        return <tbody>{currentPageVoters}</tbody>;
    }

    getResultTitle() {
        let bottomIndex = (this.state.currentPage - 1) * this.votersPerPage + 1;
        let topIndex = (this.state.currentPage * this.votersPerPage);

        if ( topIndex > this.props.totalVoters ) {
            topIndex = this.props.totalVoters;
        }

        if ( this.props.totalVoters > 0 ) {
            return 'מציג תוצאות ' + bottomIndex + '-' + topIndex;
        } else {
            return '\u00A0';
        }
    }

    render() {
        return (
            <div className={"row containerStrip" + (this.props.loadingData ? ' hidden' : '')}>
                <div className="col-sm-8 rsltsTitle">
                    <h3 className="noBgTitle">נמצאו
                        <span className="rsltsCounter"> {this.props.totalVoters}</span> רשומות
                    </h3>
                    <div className="showingCounter">{this.getResultTitle()}</div>
                </div>

                <div className="col-sm-12 tableList dataConf">
                    <div className="table-responsive">
                        <table className="table table-striped tableNoMarginB tableTight csvTable">
                            <thead>
                            <tr>
                                <th>מספר</th>
                                <th>שם משפחה</th>
                                <th>שם פרטי</th>
                                <th>עיר</th>
                                <th>רחוב</th>
                            </tr>
                            </thead>

                            {this.renderVoterItems()}
                        </table>
                    </div>
                </div>

                {( this.props.totalVoters > this.votersPerPage ) &&
                <div className="row">
                    <Pagination resultsCount={this.props.totalVoters}
                                displayItemsPerPage={this.votersPerPage}
                                currentPage={this.state.currentPage}
                                navigateToPage={this.navigateToPage.bind(this)}/>
                </div>
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        voters: state.global.voterSourceModal.voters,
        totalVoters: state.global.voterSourceModal.totalVoters,
        loadedVoters: state.global.voterSourceModal.loadedVoters,
        loadingData: state.global.voterSourceModal.loadingData
    }
}

export default connect(mapStateToProps) (VoterSourceResult);