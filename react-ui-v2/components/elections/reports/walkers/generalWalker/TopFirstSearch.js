import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import store from 'store';
import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import Combo from 'components/global/Combo';


class TopFirstSearch extends React.Component {
	constructor(props) {
		super(props);

		this.initConstants();
	}

	componentWillMount() {
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission, { cities: true });
		// key -> input key after choosen 
		// val -> input value
		this.setState({
			ballotBoxes: [],
			cluster_ids_hash: {},
            selectedClusters: [],
            cluster_keys: [],
			cityName: '',
			city_key: null,
			ballotbox_key: null,
			cityVal: '',
			clusterVal: '',
			ballotBoxVal: ''
		});
	}

    initConstants() {
		this.displayButton = {
			style: {borderWidth:'2px', position: 'relative', right: '10px', top: '10px'},
			text: 'הצג'
		};
		this.screenPermission = 'elections.reports.walkers.general';
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.first_name && (this.props.currentUser.admin == false && nextProps.currentUser.permissions[this.screenPermission] != true)) {
			this.props.router.replace('/unauthorized');
		}
		if (this.props.ballotBoxes != nextProps.ballotBoxes) {
			this.setState({ ballotBoxes: nextProps.ballotBoxes })
			this.setState({ clusters: nextProps.clusters })
		}
	}

	/**
	 * @method onSearch
	 * - get new data from the server.
	 * - set the search data in the reducer.
	 * (for print files, and for get pagination more data).
	 * @var (obj) requestData -> define the search data that will be use in the pagination.
	 * @var (string) cityName -> city name to display in the search screen. 
	 * @returns void
	 */
	onSearch() {
		if (!this.state.city_key) {
			return
		}

		let requestData = this.getReportRequestData();
        this.props.dispatch({
            type: ElectionsActions.ActionTypes.REPORTS.WALKERS.GENERAL_REPORT.SET_REQEST_DATA,
            cityName: this.state.cityName, requestData: requestData
        });

		ElectionsActions.getVotersByBallotBoxes(this.props.dispatch, requestData, true);
	}

	getReportRequestData() {
		let searchFields = {
            city_key: this.state.city_key,
            cluster_keys: this.state.cluster_keys,
            ballotbox_key: this.state.ballotbox_key
		};
		return searchFields;
	}

	/** 
	 * @method searchFieldComboValueChange
	 * Handles change in one of comboes 
	 * @param (string) fieldName - field name that had changed
	 * @param (object) e - change event of js.
	 * switch:
	 * 	case 'city': get the city clusters
	 * 		-> reset the cluster and the ballotBox values.
	 * -> the data will reset in the state and in the reducer
	 * @returns void
    */
	searchFieldComboValueChange(fieldName, e) {
		let filedKey;
		if (e.target.selectedItem) {
			filedKey = e.target.selectedItem.key;
		}
		let obj = {};
		obj[fieldName + 'Val'] = e.target.value;
		this.setState(obj)
		switch (fieldName) {
			case 'city':
				this.setState({
					city_key: filedKey, selectedClusters: [], cluster_keys: [],
					cluster_ids_hash: {}, 'clusterVal': '', ballotbox_key: null, 'ballotBoxVal': ''
				});
				if (filedKey) {
					let cityName = e.target.selectedItem ? e.target.selectedItem.name : null;
					this.setState({ cityName });
					ElectionsActions.getClustersNeighborhoodsBallotsByCity(this.props.dispatch, filedKey, 'GeneralWalkerReport');
				} 
				break
			case 'ballotBox':
				this.setState({ ballotbox_key: filedKey });
				break
		}

	}

	clusterKeysChange(event) {
		let selectedClusters = event.target.selectedItems;
		let ballotBoxes = [];
		let cluster_keys = [];
		let cluster_ids_hash = {};

		selectedClusters.forEach(function (clusterData) {

			cluster_keys.push(clusterData.key)
			cluster_ids_hash[clusterData.id] = clusterData.id;
		});

		if (cluster_keys.length == 0) { // Not selected clusters!
			ballotBoxes = this.props.ballotBoxes;
		} else { // Get only ballots for selected clsuters.
			ballotBoxes = this.props.ballotBoxes.filter(function (ballot) {
				if (cluster_ids_hash[ballot.cluster_id]) {
					return true;
				}
				return false;
			});
		}
		this.setState({ cluster_keys, cluster_ids_hash, selectedClusters: selectedClusters, ballotBoxes });
	}

	render() {
		return (
			<div className="containerTabs first-box-on-page" style={{ marginTop: '15px' }}>
				<ul className="nav nav-tabs tabsRow" role="tablist">
					<li className="active" role="presentation">
						<a title="נתונים למערכת הבחירות ברשויות" href="#Tab1" data-toggle="tab">
							צור דו"ח חדש
                            </a>
					</li>
				</ul>
				<div className="tab-content tabContnt">
					<div role="tabpanel" className="tab-pane active" id="Tab1">
						<div className="containerStrip">
							<table width="100%">
								<tbody>
									<tr>
										<td width="20%">
											<label className="control-label">עיר</label>
											<div className="row"><div className="col-md-11">
												<Combo items={this.props.cities}
													placeholder="בחר עיר" maxDisplayItems={5}
													itemIdProperty="key" itemDisplayProperty='name'
													value={this.state.cityVal || ''}
													onChange={this.searchFieldComboValueChange.bind(this, 'city')}
													inputStyle={{ borderColor: (this.state.city_key ? '#ccc' : '#ff0000') }}
												/>
											</div></div>
										</td>
										<td width="20%">
											<label className="control-label">אשכול</label>
											<div className="row"><div className="col-md-11">
												<Combo items={this.props.clusters}
													   placeholder="בחר אשכול" maxDisplayItems={5}
													   itemIdProperty="key" itemDisplayProperty='name'
													   multiSelect={true}
													   selectedItems={this.state.selectedClusters}
													   onChange={this.clusterKeysChange.bind(this)}
												/>
											</div></div>
										</td>
										<td width="20%">
											<label className="control-label">קלפי</label>
											<div className="row"><div className="col-md-11">
												<Combo items={this.state.ballotBoxes}
													placeholder="בחר קלפי" maxDisplayItems={5}
													itemIdProperty="id" itemDisplayProperty='mi_id'
													value={this.state.ballotBoxVal || ''}
													onChange={this.searchFieldComboValueChange.bind(this, 'ballotBox')}
												/></div></div>
										</td>
										<td width="5%">
											<button className="item-space btn btn-primary srchBtn btn-negative"
																style={this.displayButton.style}
																disabled={!this.state.city_key}
																onClick={this.onSearch.bind(this)}>
												{this.displayButton.text}
											</button>
										</td>
									</tr>
									<tr><td colSpan="5" style={{ height: '15px' }}>{'\u00A0'}</td></tr>
								</tbody>
							</table>

						</div>
					</div>
				</div>
			</div>
		);
	}


}


function mapStateToProps(state) {
	// console.log(state.system.lists.ballotBoxes);
	return {
		currentUser: state.system.currentUser,
		cities: state.system.currentUserGeographicalFilteredLists.cities,
		clusters: state.elections.reportsScreen.generalWalkerReport.clusters,
		ballotBoxes: state.elections.reportsScreen.generalWalkerReport.ballotBoxes,
	}
}

export default connect(mapStateToProps)(withRouter(TopFirstSearch));