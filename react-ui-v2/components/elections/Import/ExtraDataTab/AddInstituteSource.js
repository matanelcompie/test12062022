import React from "react";
import { Link, withRouter } from "react-router";
import { connect } from "react-redux";

import Combo from "../../../global/Combo";
import ModalWindow from "../../../global/ModalWindow";
import VoterRow from "./VoterRow";

import * as ElectionsActions from "../../../../actions/ElectionsActions";
import * as VoterActions from "../../../../actions/VoterActions";

class AddInstituteSource extends React.Component {
  constructor(props) {
    super(props);
	this.initConstants();
	this.state={isThereFilterSelected:true};
  }

  componentWillMount() {
    // check to load first groups , types and networks once only :
    if (this.props.instituteGroups.length == 0) {
      VoterActions.getInstituteGroups(this.props.dispatch);
    }
    if (this.props.instituteNetworks.length == 0) {
      VoterActions.getInstituteNetworks(this.props.dispatch);
    }
    if (this.props.instituteTypes.length == 0) {
      VoterActions.getInstituteTypes(this.props.dispatch);
    }
    this.props.dispatch({
      type: ElectionsActions.ActionTypes.IMPORT.INSTITUTES_SEARCH_CLEAN_DATA
    }); //clean previous search results and search fields
  }

  /*
	   Init constant fields : 
	*/
  initConstants() {
    this.modalHeader = "חיפוש מוסד";

    this.renderListTitle();
  }

  /*
	   function that handles closing modal dialog of selecting institute : 
	*/
  closeModalDialog() {
    this.props.dispatch({
      type:
        ElectionsActions.ActionTypes.IMPORT.HIDE_INSTITUTE_SOURCE_MODAL_DIALOG
    });
  }

  /*
	   function that sets specific institute as selected :  
	*/
  selectInstituteSource() {
    let selectedRow = this.props.selectedInstituteIndex;
    if (selectedRow == -1) {
      this.props.dispatch({
        type:
          ElectionsActions.ActionTypes.IMPORT
            .THIRD_STEP_SEARCH_INSTITUTE_FIELD_ITEM_CHANGE,
        itemName: "bottomErrorText",
        itemValue: "יש לבחור מוסד אחד מהרשימה כדי להמשיך"
      });
    } else {
      if (this.props.searchInstituteScreen.bottomErrorText != "") {
        this.props.dispatch({
          type:
            ElectionsActions.ActionTypes.IMPORT
              .THIRD_STEP_SEARCH_INSTITUTE_FIELD_ITEM_CHANGE,
          itemName: "bottomErrorText",
          itemValue: ""
        });
      }
      this.props.dispatch({
        type: ElectionsActions.ActionTypes.IMPORT.CHOOSED_INSTITUTE_ROW,
        selectedInstitute: this.props.institutesSearchResults[selectedRow]
      });
    }
  }

  /*
	   handel "enter" keypress inside textbox as clicking search button
	*/
  handleKeyPress(event) {
    if (event.charCode == 13) {
      /*if user pressed enter*/
      this.doSearchAction();
    }
  }

  /*
	The core function that performs the really search institute action : 
	*/
  doSearchAction() {
    //check if there is at least 1 criteria for search :
    if (
      this.props.searchInstituteScreen.selectedGroup.item != null ||
      this.props.searchInstituteScreen.selectedType.item != null ||
      this.props.searchInstituteScreen.selectedNetwork.item != null ||
      this.props.searchInstituteScreen.instituteNameText.split(" ").join("")
        .length >= 2
    ) {
		this.setState({isThereFilterSelected:true});
      let params = {};
      if (this.props.searchInstituteScreen.selectedGroup.item != null) {
        params.group_key = this.props.searchInstituteScreen.selectedGroup.item.key;
      }
      if (this.props.searchInstituteScreen.selectedType.item != null) {
        params.type_key = this.props.searchInstituteScreen.selectedType.item.key;
      }
      if (this.props.searchInstituteScreen.selectedNetwork.item != null) {
        params.network_key = this.props.searchInstituteScreen.selectedNetwork.item.key;
      }

      if (
        this.props.searchInstituteScreen.instituteNameText.split(" ").join("")
          .length >= 2
      ) {
        params.institute_name_text = this.props.searchInstituteScreen.instituteNameText;
      }
      ElectionsActions.searchInstitutionByParams(this.props.dispatch, params);
    }else{
		//there is no filters selected
		this.setState({isThereFilterSelected:false});
	}
  }

  /*
	function that on single institute-row click set it selected
	*/
  searchButtonClick() {
    this.doSearchAction();
  }

  /*
	   function that renders static header to results tables : 
	*/
  renderListTitle() {
    return (this.searchVoterResultHeader = (
      <thead>
        <tr>
          <th>מספר</th>
          <th>שם מוסד</th>
          <th>סוג מוסד</th>
          <th>עיר</th>
        </tr>
      </thead>
    ));
  }

  /*
	function that handles row  click - row selection of institute : 
	*/
  setRowSelected(index, e) {
    this.props.dispatch({
      type:
        ElectionsActions.ActionTypes.IMPORT.INSTITUTE_SEARCH_SET_ROW_SELECTED,
      selectedRowIdx: index
    });
  }

  /*
	function that creates rows for search-result array  : 
	*/
  renderListRows() {
    let self = this;
    this.scrollTRlist = this.props.institutesSearchResults.map(function(
      institute,
      i
    ) {
      let className = "";
      if (institute.isSelected) {
        className = "success request-select-row";
      }
      return (
        <VoterRow
          id={i}
          key={i}
          className={className}
          instituteName={institute.name}
          typeName={institute.type_name}
          cityName={institute.city_name}
          rowClickDelegate={self.setRowSelected.bind(self, i)}
          rowDblClickDelegate={self.selectInstituteSource.bind(self)}
        />
      );
    });

    return (this.searchVoterResultRows = (
      <tbody style={{ height: "100px" }}>
        {this.scrollTRlist}
        <tr
          style={{ display: this.props.searchInstitutesLoading ? "" : "none" }}
        >
          <td colSpan="5" style={{ textAlign: "center" }}>
            <div
              className={
                "fa fa-spinner fa-spin pull-right" +
                (this.props.searchInstitutesLoading ? "" : " hidden")
              }
            />{" "}
            טוען ...
          </td>
        </tr>
      </tbody>
    ));
  }

  /*
	function that handles institute group combo value change : 
	*/
  instituteGroupChange(e) {
    this.props.dispatch({
      type:
        ElectionsActions.ActionTypes.IMPORT
          .THIRD_STEP_SEARCH_INSTITUTE_COMBO_ITEM_CHANGE,
      comboName: "selectedGroup",
      comboValue: e.target.value,
      comboReference: e.target.selectedItem
    });
    this.props.dispatch({
      type:
        ElectionsActions.ActionTypes.IMPORT
          .THIRD_STEP_SEARCH_INSTITUTE_COMBO_ITEM_CHANGE,
      comboName: "selectedType",
      comboValue: "",
      comboReference: null
    });
  }

  /*
	function that handles institute type combo value change : 
	*/
  instituteTypeChange(e) {
    this.props.dispatch({
      type:
        ElectionsActions.ActionTypes.IMPORT
          .THIRD_STEP_SEARCH_INSTITUTE_COMBO_ITEM_CHANGE,
      comboName: "selectedType",
      comboValue: e.target.value,
      comboReference: e.target.selectedItem
    });
    // if it changes from full types list - then will set the correct group name by type name :
    if (
      e.target.selectedItem != null &&
      this.props.searchInstituteScreen.selectedGroup.item == null
    ) {
      for (let i = 0; i < this.props.instituteGroups.length; i++) {
        if (
          this.props.instituteGroups[i].id ==
          e.target.selectedItem.institute_group_id
        ) {
          this.props.dispatch({
            type:
              ElectionsActions.ActionTypes.IMPORT
                .THIRD_STEP_SEARCH_INSTITUTE_COMBO_ITEM_CHANGE,
            comboName: "selectedGroup",
            comboValue: this.props.instituteGroups[i].name,
            comboReference: this.props.instituteGroups[i]
          });
          break;
        }
      }
    }
  }

  /*
	function that handles institute network combo value change : 
	*/
  instituteNetworkChange(e) {
    this.props.dispatch({
      type:
        ElectionsActions.ActionTypes.IMPORT
          .THIRD_STEP_SEARCH_INSTITUTE_COMBO_ITEM_CHANGE,
      comboName: "selectedNetwork",
      comboValue: e.target.value,
      comboReference: e.target.selectedItem
    });
  }

  /*
	function that handles institute free search text value change : 
	*/
  searchComboValueChange(comboName, e) {
    this.props.dispatch({
      type:
        ElectionsActions.ActionTypes.IMPORT
          .THIRD_STEP_SEARCH_INSTITUTE_COMBO_ITEM_CHANGE,
      comboName,
      comboValue: e.target.value,
      comboReference: e.target.selectedItem
    });
  }

  /*
	function that handles general field change in state  : 
	*/
  searchFieldValueChange(itemName, e) {
    this.props.dispatch({
      type:
        ElectionsActions.ActionTypes.IMPORT
          .THIRD_STEP_SEARCH_INSTITUTE_FIELD_ITEM_CHANGE,
      itemName,
      itemValue: e.target.value
    });
  }

  /*
	   function that dynamically filter institute groups and types comboes list
	*/
  filterInstituteTypes() {
    this.filteredTypesList = this.props.instituteTypes;

    if (this.props.searchInstituteScreen.selectedGroup.item != null) {
      let selectedGroupID = this.props.searchInstituteScreen.selectedGroup.item
        .id;

      this.filteredTypesList = this.props.instituteTypes.filter(function(
        instituteTypes
      ) {
        return instituteTypes.institute_group_id == selectedGroupID;
      });
    }
  }

  render() {
    this.filterInstituteTypes();
    this.renderListRows();
    return (
      <ModalWindow
        show={this.props.showChooseInstituteModalDialog}
        buttonOk={this.selectInstituteSource.bind(this)}
        buttonCancel={this.closeModalDialog.bind(this)}
        buttonX={this.closeModalDialog.bind(this)}
        overlayClick={this.closeModalDialog.bind(this)}
        title={this.modalHeader}
        style={{ zIndex: "9001" }}
      >
        <div className="row containerStrip">
          <div className="col-lg-5">
            <div className="row form-group">
              <label
                htmlFor="inputModalFamily"
                className="col-lg-3 control-label"
              >
                קבוצה
              </label>
              <div className="col-sm-9">
                <Combo
                  items={this.props.instituteGroups}
                  maxDisplayItems={5}
                  itemIdProperty="id"
                  itemDisplayProperty="name"
                  value={this.props.searchInstituteScreen.selectedGroup.value}
                  onChange={this.instituteGroupChange.bind(this)}
                />
              </div>
            </div>
            <div className="row form-group">
              <label
                htmlFor="inputModalName"
                className="col-lg-3 control-label"
              >
                סוג
              </label>
              <div className="col-sm-9">
                <Combo
                  items={this.filteredTypesList || this.props.instituteTypes}
                  maxDisplayItems={5}
                  itemIdProperty="id"
                  itemDisplayProperty="name"
                  value={this.props.searchInstituteScreen.selectedType.value}
                  onChange={this.instituteTypeChange.bind(this)}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="row form-group">
              <label
                htmlFor="inputModalCity"
                className="col-lg-3 control-label"
              >
                רשת
              </label>
              <div className="col-sm-9">
                <Combo
                  items={this.props.instituteNetworks}
                  maxDisplayItems={5}
                  itemIdProperty="id"
                  itemDisplayProperty="name"
                  value={this.props.searchInstituteScreen.selectedNetwork.value}
                  onChange={this.instituteNetworkChange.bind(this)}
                />
              </div>
            </div>
            <div className="row form-group">
              <label
                htmlFor="inputModalStreet"
                className="col-lg-3 control-label"
              >
                שם
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  className="form-control"
                  id="inputModalName"
                  value={this.props.searchInstituteScreen.instituteNameText}
                  onChange={this.searchFieldValueChange.bind(this,"instituteNameText")}
                  onKeyPress={this.handleKeyPress.bind(this)}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-2 no-padding">
            <div>
              <button type="button" className="btn btn-primary"
                onClick={this.searchButtonClick.bind(this)} disabled={false}>
                חפש
              </button>
            </div>
            {!this.state.isThereFilterSelected && <div>
              <span style={{ color: "#ff0000" }}>
                <i>יש לבחור לפי מה לחפש </i>
              </span>
            </div>}
          </div>
        </div>
        <div className="row containerStrip">
          <div className="col-sm-12 rsltsTitle">
            <h3 className="noBgTitle">
              נמצאו{" "}
              <span className="rsltsCounter">
                {this.props.institutesSearchResults.length}
              </span>{" "}
              רשומות
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div id="scrollContainer" className="table-responsive">
              <table
                className="table table-striped tableNoMarginB table-hover tableTight csvTable table-scrollable"
                style={{ height: "100px" }}
              >
                {this.searchVoterResultHeader}
                {this.searchVoterResultRows}
              </table>
              <span style={{ color: "#ff0000" }}>
                {this.props.searchInstituteScreen.bottomErrorText}
              </span>
            </div>
          </div>
        </div>
      </ModalWindow>
    );
  }
}

function mapStateToProps(state) {
  return {
    searchInstituteScreen:
      state.elections.importScreen.extraData.searchInstituteScreen,
    showChooseInstituteModalDialog:
      state.elections.importScreen.extraData.showChooseInstituteModalDialog,
    instituteGroups: state.voters.voterScreen.instituteGroups,
    instituteTypes: state.voters.voterScreen.instituteTypes,
    instituteNetworks: state.voters.voterScreen.instituteNetworks,
    institutesSearchResults:
      state.elections.importScreen.extraData.institutesSearchResults,
    searchInstitutesLoading:
      state.elections.importScreen.extraData.searchInstitutesLoading,
    selectedInstituteIndex:
      state.elections.importScreen.extraData.selectedInstituteIndex
  };
}

export default connect(mapStateToProps)(withRouter(AddInstituteSource));
