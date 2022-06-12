import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

 
import Pagination from '../../../components/global/Pagination';
import DashboardFileRow from './DashboardFileRow';
import FilesFilters from './FilesFilters';
import ModalWindow from '../../global/ModalWindow';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';


class ElectionsDashboard extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();

        this.state = {
			
			filterData: false,
			refreshData: true,

            searchFields: {
                from_date: null,
                to_date: null,
                file_name: null,
                execution_status: null,
                user: null
            },

			sort: {
				direction: this.sortDirections.desc,
				byField: 'date'
			},

            currentPage: 1,
            currentPageRecords: [] , 
			showConfirmDelete : false,
			deleteIndex:-1,
			firstPageLoaded: false
		};
	}

    initConstants() {
        this.displayItemsPerPage = 20;
        this.numOfRowsToLoad = 100;

        this.csvParserStatus = require('../../../libs/constants').csvParserStatus;

        this.sortFields = {
			user: 'שם מעלה',
			date: 'תאריך העלאה',
			status: 'סטטוס אישור'
		};

        this.sortDirections = {
            asc: 'asc',
            desc: 'desc'
		};

        this.thLink = {textDecoration: 'underline', color: '#333333', cursor: 'pointer'};
	}

	componentWillMount() {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: "עדכון נתונים מקובץ"});
		this.props.dispatch({type:ElectionsActions.ActionTypes.IMPORT.CLEAN_FOURTH_STAGE});
		this.startedLoadingCsvFilesInfosProcess = 1;
		let self = this;

		ElectionsActions.getCurrentCsvFilesDataStatus(self.props.dispatch, this.state.searchFields, this.state.currentPage,
			                                          this.numOfRowsToLoad, self.state.sort);

		var millisecondsToWait = 1000 * 5;
		this.loopInterval = setInterval(function () {
			//console.log(self.state.refreshData);
			//if ( self.state.refreshData ) {
                ElectionsActions.getCurrentCsvFilesDataStatus(self.props.dispatch, self.state.searchFields, self.state.currentPage,
                                                              self.displayItemsPerPage, self.state.sort, true);
			//}
		}, millisecondsToWait);
	}

	componentWillUnmount(){
		if (this.loopInterval != undefined) {
			clearInterval(this.loopInterval);
			this.loopInterval = undefined;
		}
		this.props.dispatch({ type: ElectionsActions.ActionTypes.DASHBOARD.DASHBOARD_SET_IFRAME_CSV_FILE_SRC, srcName: '' });
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin == false && nextProps.currentUser.permissions['elections.import'] != true && this.props.currentUser.permissions['elections.import'] != true && this.props.currentUser.first_name.length > 1) {
			this.props.router.replace('/unauthorized');
		}

        if ( !this.props.loadedDataFlag && nextProps.loadedDataFlag ) {
        	//load first page if just loaded rows
            if ( nextProps.totalDataRows > 0  ) {
                if (!this.state.firstPageLoaded) {
                	this.loadPageRows(1, nextProps);
                	//set "first page loaded" to true
                	this.setState({firstPageLoaded: true});
                } else {
					this.loadPageRows(this.state.currentPage, nextProps);
				}
			} else {
                this.setState({currentPage: 1, currentPageRecords: []});
			}
        }
	}

    loadPageRows(currentPage, nextProps = null) {
        let currentPageRecords = [];
        let searchResultRecords = [];
        let totalSearchResultRecords = 0;
        let numOfProcessesAtWork = 0;
        let refreshData = false;

        let bottomIndex = (currentPage - 1) * this.displayItemsPerPage;
        let topIndex = (currentPage * this.displayItemsPerPage) - 1;

        this.setState({currentPageRecords: []});

        if ( null == nextProps ) {
            searchResultRecords = this.props.allDataRows;
            totalSearchResultRecords = this.props.totalDataRows;
        } else {
            searchResultRecords = nextProps.allDataRows;
            totalSearchResultRecords = nextProps.totalDataRows;
        }

        if ( topIndex > (totalSearchResultRecords - 1) ) {
            topIndex = totalSearchResultRecords - 1;
        }

        for ( let rowIndex = bottomIndex; rowIndex <= topIndex; rowIndex++ ) {
            currentPageRecords.push(searchResultRecords[rowIndex]);

            if ( searchResultRecords[rowIndex].status == this.csvParserStatus.atWork ) {
                numOfProcessesAtWork++;
			}
        }

        if ( numOfProcessesAtWork > 0 ) {
            refreshData = true;
		} else {
            refreshData = false;
		}

        this.setState({currentPageRecords, refreshData});
    }

    loadMoreRows(nextPage) {
        // total number of pages
        let totalPages = Math.ceil(this.props.totalDataRows / this.displayItemsPerPage);

        // number of activists in pages 1 - nextPage
        let nextPageNumOfRows = nextPage * this.displayItemsPerPage;

        // Checking if we are in the last page
        if (nextPage > totalPages) {
            return;
        }

        // If activistsSearchResult contains all the search result,
        // then there is nothing to load
        if (this.props.allDataRows.length == this.props.totalDataRows) {
            return;
        }

        // If number of activists in pages from 1 till next page
        // are less than activistsSearchResult activists, then there
        // is nothing to load
        if (nextPageNumOfRows <= this.props.allDataRows.length) {
            return;
        }

        let currentDbPage = Math.floor((nextPage * this.displayItemsPerPage) / this.numOfRowsToLoad) + 1;
        ElectionsActions.loadMoreCsvFilesDataStatus(this.props.dispatch, this.state.searchFields, currentDbPage, this.numOfRowsToLoad,
			                                        this.state.sort);
	}

    filterDataChange() {
		let filterData = !this.state.filterData;
		this.setState({filterData});

		let searchFields = this.state.searchFields;
		if ( !filterData ) {
			searchFields.from_date = null;
            searchFields.to_date = null;
            searchFields.file_name = null;
            searchFields.execution_status = null;
            searchFields.user = null;

            this.setState({searchFields});

            this.setState({searchFields, currentPage: 1, refreshData: false});
            ElectionsActions.getCurrentCsvFilesDataStatus(this.props.dispatch, searchFields, 1, this.numOfRowsToLoad, this.state.sort);
		}
	}

	/*
	function that downloads file onclick
	*/
	rowFileClick(fileKey, e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.dispatch({ type: ElectionsActions.ActionTypes.DASHBOARD.DASHBOARD_SET_IFRAME_CSV_FILE_SRC, srcName: window.Laravel.baseURL + 'api/elections/imports/' + fileKey + '/filter/ALL_ROWS' });
	}
	
	 

	
    /**
	 * function that sets dynamic items in render() function :
     */
	renderPageRows() {
		let self = this;
		let unfinishedProcessesCount = 0;
		const csvParserStatus = require('../../../libs/constants').csvParserStatus;
		let deletePermission = (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.import.delete'] == true);
		let listItems = this.state.currentPageRecords.map(function (item, index) {
            return (
				<DashboardFileRow id={item.id} key={index} name={item.name}
								  createDate={self.constructCorrectDateTime(item.created_at)}
								  rowCount={item.row_count-parseInt(item.header)}
								  sizeKB={parseInt(item.file_size / 1000)}
								  fullName={item.first_name + ' ' + item.last_name}
								  currentRow={(item.current_row > 0 ? (item.current_row - item.header) : item.current_row)}
								  statusName={self.getProcessStatus(item.status , item.key)}
								  rowDblClickDelegate={self.rowDblClick.bind(self, item.key)}
								  onFileClickDelegate={self.rowFileClick.bind(self, item.key)}
								  restartCurrentProcess={((item.status==csvParserStatus.cancelled || item.status==csvParserStatus.error) ? self.restartCurrentProcess.bind(self, item.key) : null)}
								  confirmDelete ={self.confirmDelete.bind(self,index)}
								  showDeleteButton = {deletePermission && item.status!=csvParserStatus.atWork}
								 />
            );
		});

		/*if (listItems.length ==0) {
			listItems = <tr><td colSpan="10" style={{textAlign:'center' , fontSize:'25px'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים ...</td></tr>;
		}*/

		return <tbody>{listItems}</tbody>;
	}


	/*
	function that transfers user to new csv file upload :
	*/
	gotoAddNewCsvFile() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SET_IMPORT_TAB, tabName: 'loadData' });
		this.props.router.push('elections/imports/new');
	}

	/*
   function that displays date-time in nice format
   */
	constructCorrectDateTime(hhmmss_yyyymmdd) {
		if (hhmmss_yyyymmdd.length == 19) {
			let dateTimeArray = hhmmss_yyyymmdd.split(' ');
			let dateOnly = dateTimeArray[0];
			let dateOnlyArray = dateOnly.split('-');
			return dateOnlyArray[2] + '/' + dateOnlyArray[1] + '/' + dateOnlyArray[0] + ' ' + dateTimeArray[1];
		}
		else {
			return '';
		}
	}

	/*
	function that returns csv process status name by its number

    @param 	statusNumber - the id of process status
	*/
	getProcessStatus(statusNumber , itemKey) {
		switch (statusNumber) {
			case this.csvParserStatus.didNotStart:
				return 'לא התחיל';
				break;
			case this.csvParserStatus.atWork:
				return <div>בתהליך  &nbsp;<i className="glyphicon glyphicon-remove" style={{color:'#ff0000'}} title="ביטול תהליך" onClick={this.cancelCsvFileRow.bind(this,itemKey)}></i></div>;
				break;
			case this.csvParserStatus.success:
				return 'עבר בהצלחה';
				break;
			case this.csvParserStatus.error:
				return 'אירעה שגיאה';
				break;
			case this.csvParserStatus.waiting:
				return 'בהמתנה';
				break;
			case this.csvParserStatus.cancelled:
				return 'בוטל';
				break;
			case this.csvParserStatus.restarted:
				return 'הפעלה מחדש';
				break;

			default:
				return '';
				break;
		}
	}
	
	cancelCsvFileRow(csvFileKey , e){
		e.stopPropagation();
		ElectionsActions.editCsvFileStatus(this.props.dispatch, csvFileKey);
	}
	
	restartCurrentProcess(csvFileKey , e){
		e.stopPropagation();
		ElectionsActions.editCsvFileStatus(this.props.dispatch, csvFileKey , {edit_type:'reload'}) ;
	}

	/*
	function that handles double click row on specific 
	csv and loads his data by transfering it to the right path:
	*/
	rowDblClick(key, e) {
		if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.import.edit'] == true) {
			this.props.router.push('elections/imports/' + key);
		}
	}

	navigateToPage(page) {
		//this.props.dispatch({ type: ElectionsActions.ActionTypes.DASHBOARD.CHANGE_CURRENT_PAGE, currentPage: index });
        this.setState({currentPage: page});

        this.loadPageRows(page);

        this.loadMoreRows(page + 1);
        this.loadMoreRows(page + 2);
	}

	/*general function that closes all types of dialogues */
	closeModalDialog() {
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.SET_MODAL_DIALOG_DATA, visible: false, headerText: '', modalText: ''
		});
	}

	changeCsvFilters(searchObj) {
		let searchFields = this.state.searchFields;

        searchFields.from_date = (searchObj.from_date.length > 0) ? searchObj.from_date : null;
        searchFields.to_date = (searchObj.to_date.length > 0) ? searchObj.to_date : null;
        searchFields.file_name = (searchObj.file_name.length > 0) ? searchObj.file_name : null;
        searchFields.execution_status = searchObj.execution_status.id;
        searchFields.user = (searchObj.user.length > 0) ? searchObj.user : null;

        this.setState({searchFields, currentPage: 1, refreshData: false});
        ElectionsActions.getCurrentCsvFilesDataStatus(this.props.dispatch, searchFields, 1, this.numOfRowsToLoad, this.state.sort);
	}

    getFilterTButtonTitle() {
		if ( this.state.filterData ) {
			return 'בטל סינון';
		} else {
			return 'סינון רשימה';
		}
	}

	getFilterButtonClass() {
        if ( this.state.filterData ) {
            return "btn btn-filter";
        } else {
            return "btn new-btn-default";
        }
	}

    sortByField(fieldName) {
		let sort = this.state.sort;

		if ( sort.byField == fieldName ) {
            sort.direction = (sort.direction == this.sortDirections.asc) ? this.sortDirections.desc : this.sortDirections.asc;
		} else {
            sort.byField = fieldName;
            sort.direction = ('date' == fieldName ) ? this.sortDirections.desc : this.sortDirections.asc;
		}

        this.setState({sort, currentPage: 1, refreshData: false});
        ElectionsActions.getCurrentCsvFilesDataStatus(this.props.dispatch, this.state.searchFields, 1, this.numOfRowsToLoad, sort);
    }

	getSortedFieldImg(fieldName) {
		if ( this.state.sort.byField != fieldName ) {
			return;
		}

		let srcImg = '';

		if ( this.state.sort.direction == this.sortDirections.asc ) {
            srcImg = window.Laravel.baseURL + "Images/up-arrow.png";
		} else {
            srcImg = window.Laravel.baseURL + "Images/down-arrow.png";
		}

		return <img src={srcImg} style={{paddingRight: '5px'}} />;
	}
	
	/*
		Function that in case of pressing "delete" button shows confirmation modal dialog
	*/
	confirmDelete(index , e){
		//console.log("confirm delete "+index);
		e.stopPropagation(); 
		this.setState({showConfirmDelete:true,deleteIndex:index});
		//bubbling previous events
	}
	
	/*
		Function that performs real row delete via API
	*/
	doDeleteRow(){
		 
		ElectionsActions.deleteCsvFile(this.props.dispatch ,  this.state.currentPageRecords[this.state.deleteIndex].key , this.endDeletingAsyncFunction.bind(this));
		
	}
	
	endDeletingAsyncFunction(){
		//ElectionsActions.getCurrentCsvFilesDataStatus(this.props.dispatch, this.state.searchFields, this.state.currentPage,
			                                   //  this.numOfRowsToLoad, this.state.sort);
		let currentPageRecords = this.state.currentPageRecords;
		let t_deleteIndex = this.state.deleteIndex;
		 currentPageRecords.splice(t_deleteIndex,1);
		this.setState({showConfirmDelete:false,deleteIndex:-1,currentPageRecords});
	}

	/*
		Function that closes confirmation of delete dialog and doesn't do anything
	*/
	dontDelete(){
		this.setState({showConfirmDelete:false,deleteIndex:-1});
	}


	render() {
		return (
			<div className="elections-import-dashboard">
				<div className="row pageHeading1">
					<div className="col-lg-6">
						<h1>עדכון נתונים מקובץ</h1>
					</div>
					<div className="col-lg-6 OpenNewBtn text-left">
						<button title={this.getFilterTButtonTitle()} className={this.getFilterButtonClass()}
								style={{ fontSize: '25px', color: '#ffffff', paddingTop: '3px', marginLeft: '20px', paddingLeft: '6px' }}
								onClick={this.filterDataChange.bind(this)}>
							{this.getFilterTButtonTitle()}
						</button>

						{ (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.import.add'] == true) &&
							<button title="העלאת קובץ" type="submit" style={{ fontSize: '25px', padding: '3px 20px 6px 20px', color: '#ffffff' }}
									className="btn mainBtn large" data-toggle="" data-target=""
									onClick={this.gotoAddNewCsvFile.bind(this)}>
							+ העלאת קובץ</button>
						}
					</div>
				</div>

                { ( this.state.filterData ) &&
					<FilesFilters changeCsvFilters={this.changeCsvFilters.bind(this)}/>
                }

				<div className="resultsArea dataUpdate">
					<div className="row nopaddingR nopaddingL">
						<div className="col-sm-12">
							<div className="dtlsBox srchRsltsBox">
								<div className="table-responsive">
									<table className="table table-striped tableNoMarginB tableTight csvTable">
										<thead>
											<tr>
												<th>מספר</th>
												<th>
													<a onClick={this.sortByField.bind(this, 'date')} style={this.thLink}>
														{this.sortFields.date}
													</a>

													{this.getSortedFieldImg('date')}
												</th>
												<th>שם קובץ</th>
												<th>מספר שורות בקובץ</th>
												<th>גודל הקובץ</th>
												<th>
													<a onClick={this.sortByField.bind(this, 'user')} style={this.thLink}>
														{this.sortFields.user}
													</a>

                                                    {this.getSortedFieldImg('user')}
												</th>
												<th>מספר שורות עודכנו</th>
												<th style={{ minWidth: '83px' }}>מספר שורות<br />נותרו לעדכון</th>
												<th>
													<a onClick={this.sortByField.bind(this, 'status')} style={this.thLink}>
                                                        {this.sortFields.status}
													</a>

                                                    {this.getSortedFieldImg('status')}
												</th>
												<th>סטטוס</th>
												<th></th>
											</tr>
										</thead>

										{this.renderPageRows()}
									</table>
								</div>
							</div>
						</div>
					</div>

					{ this.props.totalDataRows > this.displayItemsPerPage  &&
                        <div className="row">
                        	<nav aria-label="Page navigation paginationRow">
                        		<div className="text-center">
                        			<Pagination navigateToPage={this.navigateToPage.bind(this)}
												resultsCount={this.props.allDataRows.length}
                        			            currentPage={this.state.currentPage}
												displayItemsPerPage={this.displayItemsPerPage} />
                        		</div>
                        	</nav>
                        </div>
					}
				</div>

				{this.state.showConfirmDelete && <ModalWindow show={this.state.showConfirmDelete} buttonX={this.dontDelete.bind(this)}  buttonCancel={this.dontDelete.bind(this)}
							 buttonOk={this.doDeleteRow.bind(this)} title={"מחיקת שורה"} >
					<div>האם למחוק שורה ? </div>
				</ModalWindow>}
				
				<iframe src={this.props.fileSrc} style={{ display: 'none', border: '0', height: '0px', width: '0px', borderStyle: 'none' }} />
				
				
				<ModalWindow show={this.props.showModalDialog} buttonX={this.closeModalDialog.bind(this)}
							 buttonOk={this.closeModalDialog.bind(this)} title={this.props.modalHeaderText} style={{ zIndex: '9001' }}>
					<div>{this.props.modalContentText}</div>
				</ModalWindow>
			</div>
		);
	}
}


function mapStateToProps(state) {
	return {
		allDataRows: state.elections.dashboardScreen.allDataRows,
        totalDataRows: state.elections.dashboardScreen.totalDataRows,
		fileSrc: state.elections.dashboardScreen.fileSrc,
        loadedDataFlag: state.elections.dashboardScreen.loadedDataFlag,

		currentUser: state.system.currentUser,
		currentPage: state.elections.dashboardScreen.currentPage,
		displayItemsPerPage: state.elections.dashboardScreen.displayItemsPerPage,

		showModalDialog: state.elections.showModalDialog,
		modalHeaderText: state.elections.modalHeaderText,
		modalContentText: state.elections.modalContentText,
	}
}

export default connect(mapStateToProps)(withRouter(ElectionsDashboard));