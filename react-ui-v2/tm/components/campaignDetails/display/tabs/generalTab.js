import React from 'react';
import PropTypes from 'prop-types';
import TextArea from 'tm/components/common/TextArea';
import EditButtons from 'tm/components/common/EditButtons';
import constants from 'tm/constants/constants';
import Pie from 'components/global/D3/Pie';
import Bar from 'components/global/D3/Bar';
import { numberWithCommas ,getTmCallEndStatusName} from 'libs/globalFunctions';

const GeneralTab = ({ campaignEdits, isEditing, onEditClick, onSaveClick, onChangeField, onCancelClick, isPending, statistics }) => {
    // console.log('campaignEdits', campaignEdits);
    let generalTabClass = 'campaign-detail-tab-general campaign-detail-form tabContnt containerStrip' + (isEditing ? ' campaign-detail-form_editable' : '');

    let textValues = {
        tabTitle: 'תיאור:',
        campaignVotersLabel: 'תושבים בקמפיין',
        voters: 'תושבים',
        processedVoters: 'תושבים שטופלו',
        changedStatusVoters: 'תושבים ששינו סטטוס',
        notProcessedVoters: 'תושבים בטיפול',
        processedVotersPerStatusLabel: 'תושבים שטופלו לפי סטטוס TM',
        campaignCallTimeLabel: 'משך זמן השיחות לקמפיין הכללי (בשעות)',
        callTimeVsEmployeeAvailabilityLabel: 'משך הזמן בו היו נציגים זמנים (בשעות)',
        listsCountOnFailerLabel: "מס' רשומות שנטענו לחייגן",
		handledVotersDetails:'פירוט תושבים שטופלו',
		changedStatusVotersDetails:'פירוט תושבים ששינו סטטוס',
    };

    let styles = {
        fixedHeightBig: { minHeight: '260px' , textAlign: 'center' },
        fixedHeightSmall: { minHeight: '226px', textAlign: 'center' },
        bigSpinner: { fontSize: '38px' }
    }

    function onChangeFieldTemp(event) {
        onChangeField(event.target.name, event.target.value)
    }

    function saveDetails(e) {
        onSaveClick(e, { description: campaignEdits.description });
    }
    function renderSupportStatus() {
        if (statistics.support_status == '') {
            return <i className="fa fa-spinner fa-spin" style={styles.bigSpinner}></i>;
        } else if (statistics.support_status.length > 0) {
            return <Pie
                data={statistics.support_status}
				displayLabels={true}
                width='250'
                height='150'
            />
        } else {
            return '';
        }
    }
 
	 
    return (
        <div className={generalTabClass}>
            <div className="row panelTitle">
                <div className="col-xs-10">{textValues.tabTitle}</div>
                <EditButtons className="col-xs-2" onEditClick={onEditClick} isEditing={isEditing} onCancelClick={onCancelClick} onSaveClick={saveDetails} isPending={isPending} />
            </div>
            <div className="row">
                <div className="col-xs-10 campaign-details__field" onClick={onEditClick}>
                    <TextArea
                        name="description"
                        value={campaignEdits.description}
                        onChange={onChangeFieldTemp}
                        disabled={!isEditing}
                        className="campaign-details__input"
                    />
                    <i className="fa fa-pencil"></i>
                </div>
            </div>

            <div className="row panelContent">
                <div className="col-xs-12">
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <strong className="panel-title">{textValues.campaignVotersLabel}</strong>
                        </div>
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-xs-3 center">
                                    <img className="icon" src={window.Laravel.baseURL + 'Images/all-voters-icon.png'} />
                                    <h1>{statistics.unique_voters_count !== '' ? numberWithCommas(statistics.unique_voters_count) : <i className="fa fa-spinner fa-spin"></i>}</h1>
                                    <span className="data-label">{textValues.voters}</span>
                                </div>
                                <div className="col-xs-3 center">
                                    <img className="icon" src={window.Laravel.baseURL + 'Images/processed-voters.png'} />
                                    <h1>{statistics.unique_voters_count !== '' ? numberWithCommas(statistics.processed_count) : <i className="fa fa-spinner fa-spin"></i>}</h1>
                                    <span className="data-label">{textValues.processedVoters}</span>
                                </div>
								<div className="col-xs-3 center">
                                    <img className="icon" src={window.Laravel.baseURL + 'Images/processed-voters.png'} />
                                    <h1>{(statistics.changed_status_count  || statistics.changed_status_count==0 ) ? numberWithCommas(statistics.changed_status_count) : <i className="fa fa-spinner fa-spin"></i>}</h1>
                                    <span className="data-label">{textValues.changedStatusVoters}</span>
                                </div>
                                <div className="col-xs-3 center">
                                    <img className="icon" src={window.Laravel.baseURL + 'Images/not-processed-voters-icon.png'} />
                                    <h1>{statistics.unique_voters_count !== '' ? numberWithCommas(statistics.unique_voters_count - statistics.processed_count) : <i className="fa fa-spinner fa-spin"></i>}</h1>
                                    <span className="data-label">{textValues.notProcessedVoters}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

			<div className="row panelContent">
                <div className="col-xs-6">
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <strong className="panel-title">{textValues.handledVotersDetails}</strong>
                        </div>
                        <div className="panel-body" style={styles.fixedHeightBig}>
							{(statistics.total_processed) ? 
								 (statistics.total_processed.length==0?
											"אין נתונים"
											:
											<div className="employees-list">
												<div className="employees-list-row-data employees-list-header">
													<div className="employees-list__cell employees-list__cell_col_cell">סטטוס סיום שיחה</div>
													<div className="employees-list__cell employees-list__cell_col_cell">כמות בוחרים</div>
													<div className="employees-list__cell employees-list__cell_col_cell">אחוז</div>
												</div>
												{statistics.total_processed.map(item => (
													 <div className="employees-list-row-data employees-list-header" key={"total_processed" + item.status}>
														<div className="employees-list__cell employees-list__cell_col_cell">{getTmCallEndStatusName(item.status)}</div>
														<div className="employees-list__cell employees-list__cell_col_cell">{numberWithCommas(item.voters_count)}</div>
														<div className="employees-list__cell employees-list__cell_col_cell">{Math.round(((item.voters_count*100)/statistics.processed_count)*10)/10}%</div>
													 </div>
												))}
											</div>)
							 
                             :
							 <h1><i className="fa fa-spinner fa-spin"></i></h1>
							}
                        </div>
                    </div>
                </div>
                <div className="col-xs-6" >
                    <div className="panel panel-default"  >
                        <div className="panel-heading">
                            <strong className="panel-title">{textValues.changedStatusVotersDetails}</strong>
                        </div>
                        <div className="panel-body" style={styles.fixedHeightBig }>
                             {(statistics.total_changed_status) ? 
								 (statistics.total_changed_status.length==0?
											"אין נתונים"
											:
											<div className="employees-list">
												<div className="employees-list-row-data employees-list-header">
													<div className="employees-list__cell employees-list__cell_col_cell">סטטוס סיום שיחה</div>
													<div className="employees-list__cell employees-list__cell_col_cell">כמות בוחרים</div>
													<div className="employees-list__cell employees-list__cell_col_cell">אחוז</div>
												</div>
												{statistics.total_changed_status.map(item => (
													 <div className="employees-list-row-data employees-list-header"  key={"total_changed_status" + item.support_status_id}>
														<div className="employees-list__cell employees-list__cell_col_cell">{item.support_status_name}</div>
														<div className="employees-list__cell employees-list__cell_col_cell">{numberWithCommas(item.voters_count)}</div>
														<div className="employees-list__cell employees-list__cell_col_cell">{Math.round(10*((item.voters_count*100)/statistics.changed_status_count))/10}%</div>
													 </div>
												))}
											</div>)
							 
                             :
							<h1><i className="fa fa-spinner fa-spin"></i></h1>
							}
                        </div>
                    </div>
                </div>
			</div>

            <div className="row panelContent">
                <div className="col-xs-4">
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <strong className="panel-title">{textValues.campaignCallTimeLabel}</strong>
                        </div>
                        <div className="panel-body" style={styles.fixedHeightBig}>

                            {(statistics.calls_time_in_seconds === '' && statistics.calls_action_time_in_seconds === '') ? <i className="fa fa-spinner  fa-spin" style={styles.bigSpinner}></i> :
                                <Bar
                                    data={[{ label: 'זמן השיחות בפועל', value: statistics.calls_time_in_seconds / 3600 }, { label: 'זמן הפעלה', value: statistics.calls_action_time_in_seconds / 3600 }]}
                                    width='150'
                                    height='200'
                                />}
                        </div>
                    </div>
                </div>
                <div className="col-xs-4">
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <strong className="panel-title">{textValues.callTimeVsEmployeeAvailabilityLabel}</strong>
                        </div>
                        <div className="panel-body" style={{ ...styles.fixedHeightBig }}>
                            {(statistics.calls_time_in_seconds === '' && statistics.breaks_time_in_seconds === '') ? <i className="fa fa-spinner fa-spin" style={styles.bigSpinner}></i> :
                                <Pie
									 displayLabels={true}
                                    data={[
										{ label: 'זמן שיחה', value: Math.round(statistics.calls_time_in_seconds / 3600) }, 
										{ label: 'זמן הפסקה', value: Math.round(statistics.breaks_time_in_seconds / 3600) } , 
										{ label: 'זמן המתנה', value: Math.round(statistics.calls_waiting_time_in_seconds / 3600) }, 
										{ label: 'זמן פעולה ללא שיחה', value: Math.abs(Math.round(( statistics.calls_action_time_in_seconds-  statistics.calls_time_in_seconds )/3660 )) } 
									]}
                                    width='350'
                                    height='200'
                                />
                            }
                        </div>
                    </div>
                </div>
                <div className="col-xs-4">
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <strong className="panel-title" >{textValues.listsCountOnFailerLabel}</strong>
                        </div>
                        <div className="panel-body" style={styles.fixedHeightBig}>
                            {(statistics.answered_calls === '' && statistics.not_answered_calls === '') ? <i className="fa fa-spinner  fa-spin" style={styles.bigSpinner}></i> :
                                <Pie
                                    data={[{ label: 'שיחות שנענו', value: statistics.answered_calls }, { label: 'שיחות שלא נענו', value: statistics.not_answered_calls }]}
                                    width='350'
                                    height='200'
									displayLabels={true}
                                    donut={true}
                                />
                            }
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

GeneralTab.propTypes = {
    campaignEdits: PropTypes.object,
    isPending: PropTypes.bool
};

GeneralTab.defaultProps = {
    campaignEdits: {},
};

export default (GeneralTab);
