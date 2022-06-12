import React from 'react';
import {connect} from 'react-redux';
import constants from '../../../../../libs/constants';
import { getGeographicEntityTypeName } from '../../../../../libs/globalFunctions';
import { getActivistsElectionsRoles } from '../../../../../libs/services/CityActivistsService';
import UpdateCityActivistsRolesModal from './modals/UpdateCityActivistsRolesModal';
import * as AllocationAndAssignmentActions from 'actions/AllocationAndAssignmentActions';
import * as ElectionsActions from 'actions/ElectionsActions';
import ModalConfirm from '../../../../global/ModalConfirm';
import { ModalConfirmDto } from '../../../../../DTO/ModalConfirmDto';
import { async } from 'validate.js';
import ModalAddAssignment from '../../../activist/ModalAddAllocation/ModalAddAssignment';
import { ElectionRoleSystemName } from '../../../../../Enums/ElectionRolesSystemName';
import { GeographicAllocationDto } from '../../../../../DTO/GeographicAllocationDto';
import  GeographicEntityType  from '../../../../../Enums/GeographicEntityType';
 import ModalUpdateActivistAssignment from '../../../activist/ModalAddAllocation/ModalUpdateActivistAssignment';
class CityQuarterActivistsDetails extends React.Component {
 

  constructor(props) {
    super(props);
    this.state = {
        showModalAddQuarterDirector: false,
        showModalUpdateQuarterDirector:false,
        geographicAllocationQuarterDirector:new GeographicAllocationDto(
          GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_QUARTER,
           this.props.entityDataSummary.entity_id),
        quarterDirectorData:this.props.entityDataSummary.quarter_director_data,
        modalConfirmDto: new ModalConfirmDto(this.hideConfirm),
      };
  }

  hideConfirm = () => {
      this.setState({modalConfirmDto:new ModalConfirmDto(this.hideConfirm)})
  };

  displayConfirm=(title,confirmMessage,nameConfirmFunc,data)=>{
    let confirmObject={...this.state.modalConfirmDto};
    confirmObject.title=title
    confirmObject.confirmMessage=confirmMessage;
    confirmObject.confirmFunc=this[nameConfirmFunc];
    confirmObject.data=data;
    confirmObject.show=true;
    this.setState({modalConfirmDto:confirmObject})
  }

  showAddQuarterDirectorModal() {
    this.setState({showModalAddQuarterDirector:true});
  }

  displayUpdateQuarterModal(modalType, quarterId) {
    this.props.displayUpdateQuarterModal(true, modalType, quarterId);
  }

  renderActivistsDetails(entityDataSummary) {
    let counterSystemName = constants.electionRoleSytemNames.counter;

    const activistsItems = getActivistsElectionsRoles();

    let progressBars = activistsItems.map((item) => {
      let total =
        (entityDataSummary && entityDataSummary[item.system_name]) || 0;
      let allocated =
        (entityDataSummary &&
          entityDataSummary["allocated_" + item.system_name]) ||
        0;

      let percents = (allocated / total) * 100;
      return (
        <div className="info-items" key={item.system_name}>
          <dl>
            <dt className="data-number small">
              {total} / {allocated}
            </dt>
            <dd className="related-data-header small">{item.label}</dd>
          </dl>
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow="0"
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: percents + "%" }}
            ></div>
          </div>
        </div>
      );
    });
    return (
      <div className="secondary-numbers flexed-center flexed-space-between">
        {progressBars}
      </div>
    );
  }
  renderNavigateButton(entityDataSummary) {
    if (!entityDataSummary.entity_id) {
      return null;
    }
    let navigateToText =
      "כניסה לפירוט " +
      getGeographicEntityTypeName(entityDataSummary.entity_type);

    return (
      <div
        className="navigate-to"
        onClick={this.props.onSelectGeoEntity.bind(this, entityDataSummary)}
      >
        <t className="navigate-description">{navigateToText}</t>
        <t className="navigate-icon-wrp">
          <i className={`fa fa-chevron-left`}></i>
        </t>
      </div>
    );
  }
  renderEditQuarterButton(modalType) {
    if (this.props.entityDataSummary.entity_id) {
      let buttonClass =
        modalType == "update_name"
          ? "btn btn-link glyphicon glyphicon-pencil blue-icon"
          : "glyphicon glyphicon-pencil no-border-and-bg-btn blue-icon";
      return (
        <button
          className={buttonClass}
          onClick={this.displayUpdateQuarterModal.bind(
            this,
            modalType,
            this.props.entityDataSummary.entity_id
          )}
          style={{ color: "black" }}
        ></button>
      );
    } else {
      return null;
    }
  }
  renderClustersSummary(entitiesCounters) {
    return (
      <div className="main-numbers flexed-space-between">
        <div className="info-items flexed-center">
          <dl style={{ textAlign: "center" }}>
            <dt className="data-number big">{entitiesCounters.cluster_cnt}</dt>
            <dd className="related-data-header big">אשכולות</dd>
          </dl>
        </div>
        <div className="info-items flexed-center">
          <dl style={{ textAlign: "center" }}>
            <dt className="data-number big">
              {entitiesCounters.allocated_ballot_cnt}/
              {entitiesCounters.activists_allocations_count}
            </dt>
            <dd className="related-data-header big">קלפיות מאויישות</dd>
          </dl>
        </div>
        {this.renderEditQuarterButton("update_clusters")}
      </div>
    );
  }
  renderManagerDetails(entityDataSummary, isFakeQuarter) {
    // Empty quarter
    if (isFakeQuarter) return <div className="manager-details"> </div>;
    let quarterDirectorData = entityDataSummary.quarter_director_data;

    // Quarter with no director
    if (!quarterDirectorData) {
      return (
        <div className="manager-details">
          <dl>
            <div className="dl-item flexed">
              <dt>הגדר מנהל רובע</dt>
              <button
                className="glyphicon glyphicon-plus no-border-and-bg-btn blue-icon"
                onClick={this.showAddQuarterDirectorModal.bind(this)}
              ></button>
            </div>
          </dl>
        </div>
      );
    }
    return (
      // Quarter with director
      <div className="manager-details">
        {
          <dl>
            <div className="dl-item flexed">
              <dt>מנהל רובע</dt>
              <dd>
                <a>
                  {quarterDirectorData.first_name}{" "}
                  {quarterDirectorData.last_name}
                </a>
              </dd>
            </div>
            <div className="dl-item flexed">
              <dt>מייל</dt>
              <dd>{quarterDirectorData.email}</dd>
            </div>
            <div className="dl-item flexed">
              <dt>נייד</dt>
              <dd>{quarterDirectorData.phone_number}</dd>
            </div>
          </dl>
        }
        <button
          className="glyphicon glyphicon-pencil no-border-and-bg-btn blue-icon"
          onClick={()=>{this.setState({showModalUpdateQuarterDirector:true})}}
        ></button>
        <button
          className="no-border-and-bg-btn glyphicon glyphicon-trash blue-icon"
          onClick={this.displayConfirm.bind(this,
            'מחיקת מנהל רובע',
            'האם ברצונך למחוק את שיבוץ מנהל רובע עבור '+
            entityDataSummary.quarter_director_data.last_name+ " " +entityDataSummary.quarter_director_data.first_name+" ?",
            'deleteAssignmentQuarterDirector',
             entityDataSummary.quarter_director_data)}
        ></button>
      </div>
    );
  }

  successAddAssignmentQuarterDirector() {
    this.setState({showModalAddQuarterDirector:false,showModalUpdateQuarterDirector:false})
    this.props.successAddQuarterManager();
  }

  deleteQuarter=async (quarterDetails)=> {
    let res= await ElectionsActions.deleteCityQuarter(this.props.dispatch,quarterDetails.entity_id);
    debugger
    if(res){
              //load all quarter again
              this.props.successAddQuarterManager();
              this.hideConfirm();
    }
  }

  deleteAssignmentQuarterDirector = (quarter_director_data) => {
      debugger
    AllocationAndAssignmentActions.deleteActivistAllocationAssignment(
      this.props.dispatch,
      quarter_director_data.activists_allocations_assignment_id,
      true
    ).then((res) => {
      if (res) {
        //load all quarter again
        this.props.successAddQuarterManager();
        this.hideConfirm();
      }
    });
  };

  render() {
    let entityDataSummary = this.props.entityDataSummary;
    let entity_name = entityDataSummary ? entityDataSummary.entity_name : "";
    let entitiesCounters = entityDataSummary.entities_counters
      ? entityDataSummary.entities_counters
      : {};

    let isFakeQuarter = !entityDataSummary.entity_id;
    // If city not have clusters that not allocate to quarter:
    if (isFakeQuarter && entitiesCounters.cluster_cnt == 0) {
      return null;
    }
    // Check if parent entity is city.
    return (
      <div className="neighborhood-item">
        <div className="title-and-actions-wrapper flexed flexed-space-between">
          <div className="title-number">
            <h2>
              <a title={entity_name}>
                {entity_name}
                {this.renderEditQuarterButton("update_name")}
              </a>
              {this.renderNavigateButton(entityDataSummary)}
            </h2>
          </div>
          {
            <div className="buttons-wrapper flexed-center">
              <button
                className="btn btn-link glyphicon glyphicon-trash blue-icon"
              
                onClick={this.displayConfirm.bind(this,
                  'מחיקת רובע',
                  'האם ברצונך למחוק רובע ?',
                  'deleteQuarter',
                   entityDataSummary)}

                style={{ color: "black" }}
              ></button>
            </div>
          }
        </div>
        <div className="main-info-wrapper flexed flexed-center">
          {this.renderClustersSummary(entitiesCounters)}
          {this.renderManagerDetails(entityDataSummary, isFakeQuarter)}
          {this.renderActivistsDetails(entityDataSummary)}
        </div>

        {this.state.showModalAddQuarterDirector ? (
          <ModalAddAssignment  
          show={this.state.showModalAddQuarterDirector}
          successAddAssignment={()=>{this.successAddAssignmentQuarterDirector()}}
          hideModel={()=>{this.setState({showModalAddQuarterDirector:false})}}
          geographicAllocation={this.state.geographicAllocationQuarterDirector}
          electionRoleSystemName={ElectionRoleSystemName.QUARTER_DIRECTOR}>
          </ModalAddAssignment>
        ):''}
        <ModalConfirm
          modalConfirmDto={this.state.modalConfirmDto}
        ></ModalConfirm>
        {
          this.state.showModalUpdateQuarterDirector?
          <ModalUpdateActivistAssignment
          successUpdate={()=>{this.successAddAssignmentQuarterDirector()}}
          hideModel={()=>{this.setState({showModalUpdateQuarterDirector:false})}} 
          activistAllocationAssignmentId={this.props.entityDataSummary.quarter_director_data.activists_allocations_assignment_id} 
          show={this.state.showModalUpdateQuarterDirector}>
          </ModalUpdateActivistAssignment>:''
        }
       
      </div>
    );
  }
}

function mapStateToProps(state) {
    return {
            searchScreen:state.elections.managementCityViewScreen.searchScreen,
            electionsActivistsSummary:state.elections.managementCityViewScreen.electionsActivistsSummary,
		    allElectionsRoles: state.elections.managementCityViewScreen.allElectionsRoles,
    }
}

export default connect(mapStateToProps)(CityQuarterActivistsDetails);