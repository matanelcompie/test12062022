import React from 'react';
import { connect } from 'react-redux';
import Collapse from 'react-collapse';

import * as ElectionsActions from 'actions/ElectionsActions';
import options from './options';
import DisplayColumn from './DisplayColumn';
import Combo from 'components/global/Combo';

class ColumnsDisplayOptions extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
        this.state = { activeTabId: options.displayColumns.options[0].key };
    }

    componentWillMount() {
		if(this.props.electionCampaigns.length > 0){
			 this.currentElectionCampaign = this.props.electionCampaigns[0];
		}
        //set default selected columns for detailed report
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.SET_DEFAULT_SELECTED_DETAILED_COLUMNS, detailColumns: options.displayColumns.defaultSelected });

    }
    componentWillReceiveProps(nextProps) {
		
        if (this.props.electionCampaigns.length == 0 && nextProps.electionCampaigns.length != 0) {
            this.currentElectionCampaign = nextProps.electionCampaigns[0];
        }
    }
    textIgniter() {
        this.labels = {
            displayColumnsOrder: 'סדר עמודות לתצוגה',
            orderDirection: 'סדר מיון',
            orderBy: 'רמת מיון',
            useDnD: '(השתמש בגרירה לשינוי הסדר)',
            electionCampaign: 'מערכת בחירות'
        };
    }

    changeActiveTab(activeTabId) {
        this.setState(prevState => ({ activeTabId }));
    }

    /**
     * Since option with per is multi
     * select, the function checks if
     * each campaign is selected in
     * detailed columns.
     *
     * @param optionName
     * @returns {boolean}
     */
    isOptionPerCampaignSelected(optionName) {
        for ( let electionCampaignIndex = 0; electionCampaignIndex < this.props.electionCampaigns.length; electionCampaignIndex++ ) {
            let electionCampaignId = this.props.electionCampaigns[electionCampaignIndex].id;

            if ( this.props.selectedDetailColumns[optionName + '_' + electionCampaignId] != undefined ) {
                return true;
            }
         }

         return false;
    }

    optionDisplayValueChanged(option) {

        var isOptionSelected;
        let optionData = {
            name: '',
            label: '',
            sortNumber: '',
            sortDirection: '',
            displayOrder: 0,
            perElectionCampaign: option.perElectionCampaign,
            electionCampaign: {}
        };

        if ( !option.perElectionCampaign ) {
            isOptionSelected = (this.props.selectedDetailColumns[option.name]) ? true : false;
        } else {
            isOptionSelected = this.isOptionPerCampaignSelected(option.name);
        }

        if (!isOptionSelected) {
            let lastColumn = _.last(_.orderBy(this.props.selectedDetailColumns, 'displayOrder'));
            let displayOrder = lastColumn ? lastColumn.displayOrder + 1 : 1;
            optionData = { name: option.name, label: option.label, sortNumber: '', sortDirection: '', displayOrder,
                           perElectionCampaign: option.perElectionCampaign };

            if (option.perElectionCampaign) {
                optionData['electionCampaign'] = this.currentElectionCampaign;
            }
        }

        if (!option.perElectionCampaign) {
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS, optionName: option.name, optionData, operation: (isOptionSelected ? 'delete' : 'add') });
        } else {
            let operation = (isOptionSelected ? 'delete' : 'add');

            switch (operation) {
                case 'add':
                    optionData.label += ' (' + this.currentElectionCampaign.name + ')';

                    this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS_WITH_ELECTION_CAMPAIGN,
                                          optionName: option.name, optionData, operation });
                    break;

                case 'delete':
                    for ( let electionCampaignIndex = 0; electionCampaignIndex < this.props.electionCampaigns.length; electionCampaignIndex++ ) {
                        optionData['electionCampaign'] = this.props.electionCampaigns[electionCampaignIndex];

                        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS_WITH_ELECTION_CAMPAIGN,
                                              optionName: option.name, optionData, operation });
                    }
                    break;
            }
        }
    }

    changeColumnsOrder(draggedItem, toItem, before) {
        let selectedDetailColumns = _.orderBy(this.props.selectedDetailColumns, 'displayOrder');
        let draggedNewPosition = toItem['displayOrder'] + (before ? 0 : 1);
        let optionsNewOrder = [];
        optionsNewOrder.push({ optionName: draggedItem.name, newDisplayOrder: draggedNewPosition });
        let updatedTarget = { ...draggedItem, displayOrder: draggedNewPosition };
        let i = draggedNewPosition + 1;

        selectedDetailColumns.map(option => {
            if (option.displayOrder >= draggedNewPosition && (option.name != draggedItem.name)) {
                optionsNewOrder.push({ optionName: option.name, newDisplayOrder: i++ });
            }
        });

        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS_ORDER, optionsNewOrder });
    }

    renderSelectedOption() {
        let selectedDetailColumns = _.orderBy(this.props.selectedDetailColumns, 'displayOrder');
        this.selectedOptions = selectedDetailColumns.map((option, key) => {
            let sortOptions = _.range(1, 10);//from 1 to 10
            selectedDetailColumns.map(item => {
                if ((option.name != item.name) && (sortOptions.indexOf(item.sortNumber) > -1)) {
                    sortOptions = _.pull(sortOptions, item.sortNumber);
                }
            });
            let sortOptionsItems = sortOptions.map(option => { return { key: option, value: option } });

            return (
                <DisplayColumn
                    key={key}
                    option={option}
                    sortOptionsItems={sortOptionsItems}
                    selectedDetailColumns={this.props.selectedDetailColumns}
                    changeColumnsOrder={this.changeColumnsOrder.bind(this)}
                />
            );
        });
    }

    buildSelectedCampaignsHash(selectedCampaigns) {
        let selectedCampaignsHash = {};

        for ( let electionCampaignIndex = 0; electionCampaignIndex < selectedCampaigns.length; electionCampaignIndex++ ) {
            selectedCampaignsHash[selectedCampaigns[electionCampaignIndex].id] = 1;
        }

        return selectedCampaignsHash;
    }

    buildElectionsCampaignsHash() {
        let campaignsHash = {};

        for ( let electionCampaignIndex = 0; electionCampaignIndex < this.props.electionCampaigns.length; electionCampaignIndex++ ) {
            campaignsHash[this.props.electionCampaigns[electionCampaignIndex].id] = this.props.electionCampaigns[electionCampaignIndex];
        }

        return campaignsHash;
    }

    setElectionCampaignForColumn(option, e) {
        let isOptionSelected = this.isOptionPerCampaignSelected(option.name);
        let electionCampaign = e.target.selectedItems ? e.target.selectedItems : [];
        let lastColumn = _.last(_.orderBy(this.props.selectedDetailColumns, 'displayOrder'));
        let displayOrder = lastColumn ? lastColumn.displayOrder: 0;
        let selectedCampaignsHash = {};
        let electionsCampaignsHash = this.buildElectionsCampaignsHash();
        let that = this;

        if ( electionCampaign.length > 0 ) {
            selectedCampaignsHash = this.buildSelectedCampaignsHash(electionCampaign);
        }

        /**
         * Loop through selected campaigns from combo.
         * If the selected campign is not in the detailed
         * column, then the option with the campaign should
         * be added to the detailed columns.
         */
        Object.keys(selectedCampaignsHash).map(selectedCampaignId => {
            if ( that.props.selectedDetailColumns[option.name + '_' + selectedCampaignId] == undefined ) {
                displayOrder++;
                let optionData = {
                    name: option.name,
                    label: option.label + ' (' + electionsCampaignsHash[selectedCampaignId].name + ')',
                    sortNumber: '',
                    sortDirection: '',
                    displayOrder,
                    electionCampaign: electionsCampaignsHash[selectedCampaignId],
                    perElectionCampaign: option.perElectionCampaign
                };

                that.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS_WITH_ELECTION_CAMPAIGN,
                                      optionName: option.name, optionData, operation: 'add' });
            }
        });

        /**
         * Loop throgh election campaigns.
         * If it's not in the selected campaigns
         * at combo and is in the detailed columns,
         * then the option with the campaign should
         * be deleted from the detailed columns.
         */
        Object.keys(electionsCampaignsHash).map(electionCampaignId => {
            if ( that.props.selectedDetailColumns[option.name + '_' + electionCampaignId] != undefined &&
                selectedCampaignsHash[electionCampaignId] == undefined ) {
                let optionData = {
                    name: option.name,
                    label: option.label,
                    sortNumber: '',
                    sortDirection: '',
                    displayOrder: 0,
                    electionCampaign: electionsCampaignsHash[electionCampaignId],
                    perElectionCampaign: option.perElectionCampaign
                };

                that.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS_WITH_ELECTION_CAMPAIGN,
                                      optionName: option.name, optionData, operation: 'delete' });
            }
        });
    }

    /**
     * This function build the selected
     * items for the election campaigns
     * combo from the selected detailed
     * columns.
     *
     * @param optionName
     * @returns {Array}
     */
    getSelectedElectionCampaignValue(optionName) {
        let selectedElectionCampaignValue = [];

        for ( let electionCampaignIndex = 0; electionCampaignIndex < this.props.electionCampaigns.length; electionCampaignIndex++ ) {
            if ( this.props.selectedDetailColumns[optionName + '_' + this.props.electionCampaigns[electionCampaignIndex].id] != undefined ) {
                selectedElectionCampaignValue.push(this.props.electionCampaigns[electionCampaignIndex]);
            }
        }

        return selectedElectionCampaignValue;
    }
    checkColumnDisplayPermissions(columnName){
        let columnNamePermission = (columnName == 'personal_id') ? 'personal_identity' : columnName;
        return ((this.props.currentUser.admin) || (this.props.currentUser.permissions['elections.reports.general.display_' + columnNamePermission]));
    }
    renderOptions() {
        this.categories = [];
        this.categoryOptions = [];

        options.displayColumns.options.map((option) => {
            this.categories.push(<li key={option.key} className={'cursor-pointer' + (this.state.activeTabId === option.key ? ' active' : '')}>
                <a onClick={this.changeActiveTab.bind(this, option.key)} data-toggle="tab">{option.name}</a>
            </li>);

            //render only the relevant options
            if (this.state.activeTabId === option.key) {
                option.columns.map((column, key) => {
                    let isOptionSelected = (this.props.selectedDetailColumns[column.name]) ? true : false;
                    let selectedElectionCampaignValue = [];

                    if ( column.perElectionCampaign ) {
                        isOptionSelected = this.isOptionPerCampaignSelected(column.name);
                    }

                    if (isOptionSelected && column.perElectionCampaign) {
                        selectedElectionCampaignValue = this.getSelectedElectionCampaignValue(column.name);
                    }
                    let isColDisabled = false;
                    if(column.name == 'personal_id'){
                        isColDisabled = !this.checkColumnDisplayPermissions(column.name);
                    }
                    this.categoryOptions.push(
                        <div key={key} className="row">
                            <div className="col-md-4">
                                <div className="checkbox">
                                    <label>
                                        <input type="checkbox" onChange={!isColDisabled ? this.optionDisplayValueChanged.bind(this, column) : null}
                                                disabled={isColDisabled} checked={isOptionSelected} />
                                        {column.label}
                                    </label>
                                </div>
                            </div>
                            {column.perElectionCampaign &&
                                <div className="col-md-7">
                                    <div className="form-group">
                                        <label className="col-sm-5 control-label">{this.labels.electionCampaign}</label>
                                        <div className="col-sm-7 no-padding">
                                            <Combo className="" items={this.props.electionCampaigns}
                                                   maxDisplayItems={10}
                                                   itemIdProperty="id"
                                                   itemDisplayProperty='name'
                                                   multiSelect={true}
                                                   selectedItems={selectedElectionCampaignValue || []}
                                                   onChange={this.setElectionCampaignForColumn.bind(this, column)} />
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    );
                });
            }
        });
    }

    render() {
        this.renderOptions();
        this.renderSelectedOption();
        return (
            <Collapse isOpened={this.props.isOpened}>
                <div className="collapse-tabs-content dividing-line">
                    <div className="row">
                        <div className="col-xs-3">
                            <ul className="nav nav-tabs tabs-right">
                                {this.categories}
                            </ul>
                        </div>
                        <div className="col-xs-9 no-padding">
                            <div className="tab-content">
                                <div className="tab-pane active">
                                    <div className="tab-content-inner flexed flexed-space-between ">
                                        <div className="tab-bg">
                                            <div className="list-checkbox">
                                                {this.categoryOptions}
                                            </div>
                                        </div>
                                        <div className="tab-bg flexed flexed-space-between ">
                                            <div className="list-items">
                                                <div className="title-list-items flexed">
                                                    <div className="title">{this.labels.displayColumnsOrder}</div>
                                                    <div className="title">{this.labels.orderBy}</div>
                                                    <div className="title">{this.labels.orderDirection}</div>
                                                </div>
                                                <ul>
                                                    {this.selectedOptions}
                                                </ul>
                                            </div>
                                            <div className="text-center">{this.labels.useDnD}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Collapse>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedDetailColumns: state.elections.reportsScreen.generalReport.selectedDetailColumns,
        electionCampaigns: state.elections.reportsScreen.electionCampaigns,
        currentUser: state.system.currentUser,
    }
}

export default connect(mapStateToProps)(ColumnsDisplayOptions);