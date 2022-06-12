import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import constants from 'libs/constants';
import * as ElectionsActions from 'actions/ElectionsActions';
import Pagination from 'components/global/Pagination';

class CombinedResults extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
        this.reportType = constants.generalReportTypes.COMBINED;
        this.supportStatus = [
            { key: "no_status", name: "ללא סטטוס" },
            { key: "status_1", name: "תומך בטוח" },
            { key: "status_2", name: "תומך" },
            { key: "status_3", name: "מהסס" },
            { key: "status_4", name: "לא תומך" },
            { key: "status_5", name: "פוטנציאל" },
            { key: "status_6", name: "יחד" }
        ];
        this.votesHeaders = [
            { key: "count_did_not_vote", name: "לא הצביעו" },
            { key: "count_voted", name: "הצביעו" },
        ];

        this.state = {
            filteredSupportStatus: []
        };
    }

    componentWillMount() {
       this.createFilteredSupportStatus(this.props.combinedSums); 
    }

    textIgniter() {
        this.tableLabels = {
            number: 'מ"ס',
            votersCount: "מס' תושבים",
            householdersCount: "מס' בתי אב",
            mi_city_id: "מזהה עיר",
            mi_ballot_id: "מזהה קלפי",
            captain_fifty_city_name: "מטה שיבוץ שר מאה"
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.combinedSums != nextProps.combinedSums) {
            this.createFilteredSupportStatus(nextProps.combinedSums);
        }
    }

    /**
     * Create filtered support status from combined result
     *
     * @param object combinedSums
     * @return void
     */
    createFilteredSupportStatus(combinedSums) {
            let filteredSupportStatus = this.props.supportStatus.filter(status => {
                if (combinedSums.hasOwnProperty(status.key)) return true;
            })

            this.setState({
                filteredSupportStatus
            });        
    }

    renderResults() {
        let currentPage = this.props.results.currentDisplayPaginationIndex[this.reportType];
        let startIndex = (currentPage - 1) * this.props.results.displayItemsPerPage[this.reportType];
        let lastIndex = currentPage * this.props.results.displayItemsPerPage[this.reportType];
        let releventResults = this.props.results.data[this.reportType].slice(startIndex, lastIndex);
        let combineByName = this.props.combineOptions.combineBy.name;

        return releventResults.map((item, i) => {
            let index = startIndex + i + 1;
            if (this.props.combineOptions.combineBy.allowCombineColumns && this.props.combineOptions.combineColumns.key > 0) {
                let combineColumnName = this.props.combineOptions.combineColumns.name;

                if ( combineColumnName.includes("support") ) {
                    return <tr key={index}>
                        <td>{index}</td>
                        <td>{item.combine_name}</td>
                        {(combineByName == 'ballot_boxes') && <td>{item.city_mi_id}</td>}
                        {(combineByName == 'ballot_boxes') && <td>{item.ballot_mi_id}</td>}
                        {(combineByName == 'captains_of_fifty') && <td>{item.captain_fifty_city_name}</td>}
                        {this.state.filteredSupportStatus.map(
                            status => {
                                if (item[status.key] > 0) {
                                    return <td key={status.key}><a className='cursor-pointer' onClick={this.props.displayCombineRowDetailes.bind(this, item, status.key, status.name)}>{item[status.key].toLocaleString()}</a></td>;
                                } else {
                                    return <td key={status.key}>{item[status.key]}</td>;
                                }
                            }
                        )}
                    </tr>
                } else {
                    return <tr key={index}>
                        <td>{index}</td>
                        <td>{item.combine_name}</td>
                        {(combineByName == 'ballot_boxes') && <td>{item.city_mi_id}</td>}
                        {(combineByName == 'ballot_boxes') && <td>{item.ballot_mi_id}</td>}
                        {(combineByName == 'captains_of_fifty') && <td>{item.captain_fifty_city_name}</td>}
                        {this.votesHeaders.map(
                            votesHeader => {
                                return <td key={votesHeader.key}>{item[votesHeader.key]}</td>
                            }
                        )}
                    </tr>
                }
            } else {
                return <tr key={index}>
                    <td>{index}</td>
                    <td>{item.combine_name}</td>
                    {(combineByName == 'ballot_boxes') && <td>{item.city_mi_id}</td>}
                    {(combineByName == 'ballot_boxes') && <td>{item.ballot_mi_id}</td>}
                    {(combineByName == 'captains_of_fifty') && <td>{item.captain_fifty_city_name}</td>}
                    <td><a className='cursor-pointer' onClick={this.props.displayCombineRowDetailes.bind(this, item, item.combine_id,'')}>{item.voters_count.toLocaleString()}</a></td>
                    <td>{item.households_count.toLocaleString()}</td>
                </tr>
            }
        }
        );
    }

    renderDynamicTableHeaders() {
        let self = this;
        let headers = [
            this.tableLabels.number,
            this.props.combineOptions.combineBy.label
        ];
        let combineByName = this.props.combineOptions.combineBy.name;

        if((combineByName == 'ballot_boxes')){ //If combined bi ballots:
            headers.push(this.tableLabels.mi_city_id);
            headers.push(this.tableLabels.mi_ballot_id);
        }else if((combineByName == 'captains_of_fifty')){
            headers.push(this.tableLabels.captain_fifty_city_name);
        }
        if (this.props.combineOptions.combineBy.allowCombineColumns && this.props.combineOptions.combineColumns.key > 0) {
            let combineColumnName = this.props.combineOptions.combineColumns.name;
            if ( combineColumnName.includes("support") ) {
                this.state.filteredSupportStatus.forEach(status => {
                    if (self.props.combinedSums.hasOwnProperty(status.key)) {
                        headers.push(status.name);
                    }
                });           
                
            } else {
                this.votesHeaders.map(votesHeader => headers.push(votesHeader.name));
            }
        } else {
            headers.push(this.tableLabels.votersCount);
            headers.push(this.tableLabels.householdersCount);
        }


        return headers.map(
            (header, i) => <th key={i}>{header}</th>
        );
    }
    renderCombinedSums() {
		let self = this;
        let combineByName = this.props.combineOptions.combineBy.name;

        let combinedSums = [];

        if((combineByName == 'ballot_boxes')){
            combinedSums.push(<th></th>);
            combinedSums.push(<th></th>);
        }else if((combineByName == 'captains_of_fifty')){
            combinedSums.push(<th></th>);
        }
        let combineColumnName = (this.props.combineOptions.combineColumns.name)? this.props.combineOptions.combineColumns.name : '';
        if ( combineColumnName.includes("support") ) {
            this.state.filteredSupportStatus.forEach(status => {
                if (self.props.combinedSums.hasOwnProperty(status.key)) {
                    combinedSums.push(<th key={status.key}>{parseInt(self.props.combinedSums[status.key]).toLocaleString()}</th>)
                }
            });
        } else {
            for (let key in this.props.combinedSums) {
                if (key != 'combine_name' && key != 'combine_id') {
                    combinedSums.push(<th key={key}>{parseInt(this.props.combinedSums[key]).toLocaleString()}</th>)
                }
            }
        }

        return (
            <tfoot>
                <tr>
                    <th></th>
                    <th>סה"כ</th>
                    {combinedSums}
                </tr>
            </tfoot>
        )
    }
    render() {
        return (
            <div>
                <div className="table-responsive">
                    <table className="table table-striped tableTight table-fixed">
                        <thead>
                            <tr>
                                {this.renderDynamicTableHeaders()}
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderResults()}
                        </tbody>
                        {this.props.results.data[this.reportType].length > 0 && this.props.combinedSums != undefined && this.renderCombinedSums()}
                    </table>
                </div>
				<div style={{color:'#ff0000' , fontSize:'16px' , fontWeight:'600'}}>
				{
					(this.props.results.resultsCount[this.reportType]/this.props.results.displayItemsPerPage[this.reportType]) > 1 ? 
					<span>*נתוני שורת הסיכום מתייחסים לכל עמודי התוצאה</span> : ""
				}
				&nbsp;&nbsp;&nbsp;
				{
					(["election_roles"].indexOf(this.props.combineOptions.combineBy.name) != -1) ? <span>*ישנם תושבים המופיעים ביותר מאשר קבוצה אחת, הם נספרים כיחידים בשורת הסיכום</span> : ""
				}
				{
					((this.props.results.resultsCount[this.reportType]/this.props.results.displayItemsPerPage[this.reportType]) > 1|| (["election_roles"].indexOf(this.props.combineOptions.combineBy.name) != -1)) ? <div><br/><br/></div>:null
				}
			
				
				</div> 
                <div className="row">
                    <div className="col-md-3">
                        {this.props.children}
                    </div>
                    <div className="col-md-6">
                        <Pagination
                            resultsCount={this.props.results.resultsCount[this.reportType]}
                            displayItemsPerPage={this.props.results.displayItemsPerPage[this.reportType]}
                            currentPage={this.props.results.currentDisplayPaginationIndex[this.reportType]}
                            navigateToPage={this.props.navigateToPage.bind(this, this.reportType)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
		combinedSums:state.elections.reportsScreen.generalReport.combineOptions.sums,
        supportStatus: state.elections.reportsScreen.generalReport.supportStatus, 
    }
}

export default connect(mapStateToProps)(withRouter(CombinedResults));