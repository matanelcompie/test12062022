import React from 'react';
import { connect } from 'react-redux';

import Pagination from 'components/global/Pagination';
import InstituteItem from './InstituteItem';


class InstitutesResult extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,

            currentPageInstitutes: []
        };

        this.initConstants();
    }

    initConstants() {
        this.institutesPerPage = 20;

        this.maxDbRows = 100;
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.loadedInstitutes && nextProps.loadedInstitutes ) {
            this.setState({currentPage: 1});

            this.loadPageInstitutes(1, nextProps);
        }

        // If hiding the institute moda;
        // then reset all the state variables
        if ( this.props.show && !nextProps.show ) {
            this.setState({currentPage: 1, currentPageInstitutes: []});
        }
    }

    loadPageInstitutes(currentPage, nextProps = null) {
        let currentPageInstitutes = [];
        let institutesSearchResult = [];
        let totalInstitutesSearchResult = 0;

        let bottomIndex = (currentPage - 1) * this.institutesPerPage;
        let topIndex = (currentPage * this.institutesPerPage) - 1;

        if ( null == nextProps ) {
            institutesSearchResult= this.props.institutes;
            totalInstitutesSearchResult = this.props.totalInstitutes;
        } else {
            institutesSearchResult = nextProps.institutes;
            totalInstitutesSearchResult = nextProps.totalInstitutes;
        }

        if ( topIndex > (totalInstitutesSearchResult - 1) ) {
            topIndex = totalInstitutesSearchResult - 1;
        }

        for ( let instituteIndex = bottomIndex; instituteIndex <= topIndex; instituteIndex++ ) {
            currentPageInstitutes.push(institutesSearchResult[instituteIndex]);
        }

        this.setState({currentPageInstitutes});
    }

    navigateToPage(pageIndex) {
        this.setState({currentPage: pageIndex});

        this.loadPageInstitutes(pageIndex);
    }

    renderInstituteItems() {
        let that = this;

        let currentPageInstitutes = this.state.currentPageInstitutes.map( function(item, index) {
            let currentIndex = (that.state.currentPage - 1) * that.institutesPerPage + index;

            return <InstituteItem key={index} currentIndex={currentIndex} item={item} selectedInstituteKey={that.props.selectedInstituteKey}
                                  selectInstituteItem={that.props.selectInstituteItem.bind(that)}/>;
        });

        return <tbody>{currentPageInstitutes}</tbody>;
    }

    render() {
        return(
            <div className={"row containerStrip" + (this.props.loadingInstitutes ? ' hidden' : '')}>
                <div className="col-sm-8 rsltsTitle">
                    <h3 className="noBgTitle">נמצאו <span className="rsltsCounter">5</span> רשומות</h3>
                    <div className="showingCounter">מציג תוצאות 1-5</div>
                </div>

                <div className="col-sm-12 tableList dataConf">
                    <div className="table-responsive">
                        <table className="table table-striped tableNoMarginB tableTight csvTable">
                            <thead>
                            <tr>
                                <th>מספר סדורי</th>
                                <th>שם מוסד</th>
                                <th>סוג מוסד</th>
                                <th>עיר</th>
                            </tr>
                            </thead>

                            {this.renderInstituteItems()}
                        </table>
                    </div>
                </div>

                {( this.props.totalInstitutes > this.institutesPerPage ) &&
                <div className="row">
                    <Pagination resultsCount={this.props.totalInstitutes}
                                displayItemsPerPage={this.institutesPerPage}
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
        institutes: state.global.institueModal.institutes,
        totalInstitutes: state.global.institueModal.totalInstitutes,
        loadedInstitutes: state.global.institueModal.loadedInstitutes,
        loadingInstitutes: state.global.institueModal.loadingInstitutes
    }
}

export default connect(mapStateToProps) (InstitutesResult);