import React from 'react';
import { connect } from 'react-redux';
import Collapse from 'react-collapse';

import * as SystemActions from '../../../../actions/SystemActions';


class UpdateActivistsAllocations extends React.Component {
    componentWillMount() {
        this.types = ['default', 'telemarkting']
        this.initState = {
            activistsAllocationsFile: {file: null},
            inLoading: false
        }
        this.state = { ...this.initState }
    }
    componentWillReceiveProps(nextPorps) {

    }
    textIgniter() {
        this.textValues = {
            title: 'העלאת קובץ הקצאות'
        };
    }
    updateCollapseStatus(container) {
        if (false == this.props.dirty) {
            this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container });
        } else {
            this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY });
        }
    }
    /**
     * @method uploadFile
     * - Upload bank verify document
     * @param {event} e - Upload bank verify doc event 
     */
    uploadFile(e) {
        var file = null;
        if (e.target.files != undefined ) {
            file = e.target.files[0]; 
        }

        let fileName = "";
        let documentName = "";
        let arrOfFileElements = [];
        let activistsAllocationsFile = {};

        if (file) {
            fileName = file.name;
            arrOfFileElements = fileName.split('.');
            documentName = arrOfFileElements[0];
        } 
        activistsAllocationsFile.file = file;
        activistsAllocationsFile.document_name = documentName;
        activistsAllocationsFile.fileName = fileName;
        console.log('activistsAllocationsFile', activistsAllocationsFile)
        this.setState({activistsAllocationsFile})
    }
 
    updateActivistsAllocationsFile(){
        let file = this.state.activistsAllocationsFile.file;
        if(file){
            this.setState({activistsAllocationsFile:{file: null}, inLoading: true})

            SystemActions.updateActivistsAllocationsFile(this.props.dispatch, file).then( (response) => {
                this.setState({ inLoading: false})
            },(error) => {
                this.setState({ inLoading: false})
            });
        }
    }
    renderSpinner(){ 
        return (
                <i className="fa fa-spinner fa-spin" style={{marginRight:'40px'}}></i>
        )
    }

    render() {
        this.textIgniter();
        let hasTabPermission = (this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.sms_providers']);
        return (
            <div className={"ContainerCollapse" + (hasTabPermission ? '' : ' hidden')}>
                <a onClick={this.updateCollapseStatus.bind(this, 'ActivistsAllocations')} aria-expanded={this.props.containerCollapseStatus.ActivistsAllocations}>
                    <div className="collapseArrow closed"></div>
                    <div className="collapseArrow open"></div>
                    <span className="collapseTitle">{this.textValues.title}</span>
                </a>
                <Collapse isOpened={this.props.containerCollapseStatus.ActivistsAllocations}>
                    <div className="CollapseContent">
                        <form className="form-horizontal">
                                <div className="row form-group">
                                    <div className="col-md-12">
                                        <button type="button" className="btn btn-primary">
                                            <label htmlFor="file" id="label">בחירת קובץ </label> 
                                        </button>

                                        <span style={{display: 'none'}}>
                                            <input type="file" id="file" onChange={this.uploadFile.bind(this)}/>
                                        </span>
                                        <span style={{margin: '0 20px'}}>{this.state.activistsAllocationsFile.fileName} </span>
                                        <button style={{margin: '0 20px'}} type="button" className="btn btn-success" onClick={this.updateActivistsAllocationsFile.bind(this)}>שלח</button>
                                        
                                        <a href={window.Laravel.baseURL + 'activists_allocations_format.csv'} target="_blank"> הורד פורמט הקצאות</a>
                                        
                                        {this.state.inLoading && this.renderSpinner()}
                                    </div>
                                </div>
                        </form>

                    </div>
                </Collapse>
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        currentUser: state.system.currentUser,
        dirty: state.system.listsScreen.dirty,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(UpdateActivistsAllocations);