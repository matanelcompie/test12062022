import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import BallotBoxFileItem from './BallotBoxFileItem';

import * as ElectionsActions from 'actions/ElectionsActions';


class Ballots extends React.Component {
    constructor(props) {
        super(props);
		this.state = {
            intervalId: null
        }
        this.initConstants();
    }

    initConstants() {
        this.uploadButtonText = "העלאת קובץ";
    }

    componentWillMount() {
		var millisecondsToWait = 1000 * 5;
		let self = this;
		let intervalId = setInterval(function () {
			//console.log("refresh data1");
			ElectionsActions.loadCampaignBallotBoxesFiles(self.props.dispatch, self.props.campaignKey);
		
		}, millisecondsToWait);
		this.setState({intervalId});
    }
	
	componentWillUnmount() {
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
            this.setState({
                intervalId: null
            })
        }
    }
	

    checkBallotBoxFileProgress(ballotBoxFileKey) {
        ElectionsActions.getCampaignBallotBoxFile(this.props.dispatch, this.props.campaignKey, ballotBoxFileKey);
    }
	
	cancelUpdate(itemKey) {
        ElectionsActions.editCampaignBallotBoxFile(this.props.dispatch, this.props.campaignKey, itemKey);
    }
	
	restartCurrentProcess(itemKey){
		ElectionsActions.editCampaignBallotBoxFile(this.props.dispatch, this.props.campaignKey, itemKey, {edit_type:'reload'}) ;
	}

    renderBallotBoxesFiles() {
        const ballotBoxFileParserStatus = constants.ballotBoxFileParserStatus;
        let that = this;
        let downloadPermission = (this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.ballots.ballot_files.download'] == true);
		let allowedToEdit = ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.ballots.ballot_files.edit'] == true );
		
        let ballotBoxesFiles = this.props.ballotBoxesFiles.map( function (item, index) {
            if ( item.status == ballotBoxFileParserStatus.atWork ) {
                setTimeout(that.checkBallotBoxFileProgress(item.key), 5000);
            }

            return <BallotBoxFileItem key={item.key} campaignKey={that.props.campaignKey} item={item} ballotBoxFileIndex={index}
                                      downloadPermission={downloadPermission} allowedToEdit={allowedToEdit} cancelUpdate={that.cancelUpdate.bind(that)}
									  restartCurrentProcess = {(item.status==ballotBoxFileParserStatus.cancelled || item.status==ballotBoxFileParserStatus.error) ? that.restartCurrentProcess.bind(that,item.key) : null}
									  />
        });

        return <tbody>{ballotBoxesFiles}</tbody>;
    }

    checkBallotFilesPermissions() {
        return (this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.ballots.ballot_files'] == true);
    }

    renderUploadButton() {
        if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.ballots.ballot_files.add'] == true ) {
            return (
                <button className="btn new-btn-default btn-sm upload-file" data-target="#upload-file"
                        data-toggle="modal" onClick={this.props.showUploadModal.bind(this, this.props.tabKey)}>
                    {this.uploadButtonText}
                </button>
            );
        } else {
            return '\u00A0';
        }
    }

    render() {
        return (
            <div role="tabpanel" className={"bsllots tab-pane" + (this.props.display ? " active" : "")} id={"Tab-" + this.props.tabKey}>
                <div className="container-tab">
                    <div className={"row rsltsTitleRow" + (this.checkBallotFilesPermissions() ? '' : ' hidden')}>
                        <div className="col-md-8 pull-right text-right blue-title ">טעינת קובץ קלפיות</div>
                        <div className="col-md-3 pull-left text-left ">
                            <div className="pull-left">{this.renderUploadButton()}</div>
                        </div>
                    </div>

                    <div className={"table-elections-low" + (this.checkBallotFilesPermissions() ? '' : ' hidden')}>
                        <div className="table-responsive">
                            <table className="table table-frame2 table-striped">
                                <thead>
                                <tr>
                                    <th>מס"ד</th>
                                    <th>שם הקובץ</th>
                                    <th>גודל הקובץ</th>
                                    <th>משתמש מבצע</th>
                                    <th>מועד ביצוע</th>
                                    <th>קלפיות בקובץ</th>
                                    <th>אשכולות חדשים</th>
                                    <th>אשכולות שעודכנו</th>
                                    <th>סטטוס</th>
                                    <th>הורדת קובץ</th>
                                </tr>
                                </thead>

                                {this.renderBallotBoxesFiles()}
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        ballotBoxesFiles: state.elections.electionsCampaignsScreen.ballots.ballotBoxesFiles
    };
}

export default connect(mapStateToProps) (Ballots);