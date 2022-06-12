import React from "react";

import ModalWindow from "../../../../../global/ModalWindow";

class UpdateCityQuarterModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        currentTab: 'update_name',
        searchName:'',
        name:'',
        selectedClusters: {}
    }

  }
  
  componentDidUpdate(prevProps){
    // console.log('currentQuarterId', prevProps.currentQuarterId, this.props.currentQuarterId)
    // Update current tab, when modal type changed
    if(prevProps.modalType  != this.props.modalType ){
      let currentTab = (this.props.modalType == 'update_clusters') ? 'update_clusters' : 'update_name';
      this.updateTab(currentTab);
    } 
    if(prevProps.currentQuarterId  != this.props.currentQuarterId ){
      // console.log('this.props.cityClusters', this.props.cityClusters, this.props.currentQuarterId)
      let selectedClusters = {};
      if(this.props.cityClusters){
        // sign Current Quarter clusters.
        this.props.cityClusters.forEach(item => {
           if(item.quarter_id && item.quarter_id == this.props.currentQuarterId){ selectedClusters[item.id] = true; }
        });
  
        this.setState({selectedClusters})
      }

    } 
  }
  // Update input on change
onInputChange(fieldName, e){
      let obj = new Object;
    obj[fieldName] = e.target.value;
    this.setState(obj);
  }
  // Update checkbox input on change
  onCheckboxChange(fieldId, e){
    let selectedClusters = {...this.state.selectedClusters};
    selectedClusters[fieldId] = e.target.checked;
    this.setState({selectedClusters});
  }
  updateTab(tabName){
    this.setState({currentTab:tabName})
  }
  // Get quarter clusters
  gerQuarterClusters(){
    let clusters = [];
    let selectedClusters =this.state.selectedClusters
    for(let id in this.state.selectedClusters){
      if(selectedClusters[id]){
        clusters.push(id);
      }
    }
    return clusters;
  }
  // Get quarter data by model type:
  getQuarterData(){
    switch(this.props.modalType){
      case 'add_new':
        return {
          name: this.state.name,
          clusters_ids: this.gerQuarterClusters()
        } 
      case 'update_name':
        return {
          name: this.state.name
        };    
      case 'update_clusters':
        return {
          clusters_ids: this.gerQuarterClusters()
        } 
    }
  }
  // update/save quarter data
  saveData(){
    let newData = this.getQuarterData(newData);
    this.props.saveData(newData);
  }
  
  renderChangeQuarterName() {

    let activeClass = (this.state.currentTab == 'update_name') ? 'active' : ''
    return (
            <div role="tabpanel" className={"tab-pane " + activeClass} id="stepOne">
                <div style={{ margin: "25px 0"}}>
                    <input onChange={this.onInputChange.bind(this, 'name')} type="text" className="form-control" value={this.state.name} />
                </div>
         </div>
    )
  }
  // Dispaly city clusters - for manage quarter clusters
  renderCityClusters(){
    if(!this.props.cityClusters) { return;}
    return this.props.cityClusters.filter((item)=>{
      return !this.state.searchName || item.cluster_name.indexOf(this.state.searchName) >= 0
    }).map((item) =>{
      return (
        <tr key={item.id}>
          <td>
            <input type="checkbox"  checked={this.state.selectedClusters[item.id]} onChange={this.onCheckboxChange.bind(this, item.id)} />
          </td>
          <td>{item.cluster_name}</td>
          <td>{item.quarter_name}</td>
          <td>{item.ballot_count}</td>
          <td>{item.voter_count}</td>
      </tr>
      )
    })
  }
  renderSelectQuarterClusters() {
    let activeClass = (this.state.currentTab == 'update_clusters') ? 'active' : ''
    return (
          <div role="tabpanel" className={"tab-pane " + activeClass} id="stepTwo">
            <div style={{marginBottom: "25px"}}>
              <div className="flexed-column">
                <label htmlFor="findCluster" style={{fontWeight: "400"}}>
                  איתור אשכול <span id="areaName"> לאיזור מרכז העיר</span>
                </label>
                <div className="input-search" style={{width: "325px"}}>
                  <div>
                    <input id="findCluster" onChange={this.onInputChange.bind(this, 'searchName')} type="text" className="form-control" value={this.state.searchName}   />
                    <span title="" className="icon-search"></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12" style={{maxHeight: "265px", overflow: "auto"}}>
                <div className="table-responsive">
                  <table className="table table-striped tableNoMarginB tableTight">
                    <thead>
                      <tr>
                        <th>
                          <input type="checkbox" />
                        </th>
                        <th>שם אשכול</th>
                        <th>רובע משוייך</th>
                        <th>מספר קלפיות</th>
                        <th>מספר בוחרים</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.renderCityClusters()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
     
    );
  }
  renderAddQuarterTabs() {
    return (
        <div className="steps container">
            <div className="row nomargin Wizard"> 
                <ul className="nav nav-tabs steps-2 steps" role="tablist">
                    <li className="active" role="presentation">
                        <a aria-controls="stepOne" id='step1Tab' className='step1' data-toggle="tab" title="הגדרת שם רובע" onClick={this.updateTab.bind(this, 'update_name')}>
                            <span className="WizNumber1">1.</span><span className="WizText">הגדרת שם רובע</span>
                        </a>
                    </li>
                    <li role="presentation">
                        <a aria-controls="stepTwo" id='step2Tab'  className='step2' data-toggle="tab" title="בחירת אשכולות לרובע" onClick={this.updateTab.bind(this, 'update_clusters')}>
                            <span className="WizNumber">2.</span><span className="WizText WizTextMobile ">בחירת אשכולות לרובע</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
  }
  getModalButton(){
    return [
       {class: 'btn btn-danger', text: 'ביטול', action: this.props.hideModal.bind(this) },
       {class: 'btn btn-success', text: 'אישור', action: this.saveData.bind(this)}
    ]
  }
  render() {

      let isNew = false;

      let modalTitle ='';
      switch(this.props.modalType){
          case 'add_new':
            isNew = true;
            modalTitle = "הוספת רובע";
            break;
          case 'update_name':
            modalTitle = "עריכת שם רובע";

            break;
          case 'update_clusters':
            modalTitle = "עריכת אשכולות של רובע";
            break;
      }
    return (
      <ModalWindow
        show={this.props.show}
        title={modalTitle}
        buttonX={this.props.hideModal.bind(this)}
        modalClass='modal-lg'
        modalId='addNeighborhood'
        buttons={this.getModalButton()}
        buttonPosition={'left'}
      >
        {isNew && this.renderAddQuarterTabs()}
        <div className="tab-content">
            {this.renderChangeQuarterName()}
            {this.renderSelectQuarterClusters()}
        </div>

      </ModalWindow>
    );
  }
}

export default UpdateCityQuarterModal;
