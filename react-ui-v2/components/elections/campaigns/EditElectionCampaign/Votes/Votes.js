import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import VotesFileItem from './VotesFileItem';

import * as ElectionsActions from 'actions/ElectionsActions';


class Votes extends React.Component {
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
			//console.log("refresh 4");
			ElectionsActions.loadCampaignVoteFiles(self.props.dispatch, self.props.campaignKey);
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

    checkVoteFileProgress(voteFileKey) {
        ElectionsActions.getCampaignVoteFile(this.props.dispatch, this.props.campaignKey, voteFileKey)
    }

	cancelUpdate(itemKey) {
        ElectionsActions.editCampaignVotesFile(this.props.dispatch, this.props.campaignKey, itemKey);
    }
	
	restartCurrentProcess(itemKey){
		ElectionsActions.editCampaignVotesFile(this.props.dispatch, this.props.campaignKey, itemKey, {edit_type:'reload'}) ;
	}
	
    renderVotesFiles() {
        const voteFileParserStatus = constants.voteFileParserStatus;
        let that = this;
        let downloadPermission = (this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.vote_results.download'] == true);
		let allowedToEdit = ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.vote_results.edit'] == true );
		
        let voteFiles = this.props.voteFiles.map( function (item, index) {
            if ( item.status == voteFileParserStatus.atWork ) {
                setTimeout(that.checkVoteFileProgress(item.key), 5000);
            }

            return <VotesFileItem key={item.key} campaignKey={that.props.campaignKey} item={item} fileIndex={index}
                                  downloadPermission={downloadPermission} allowedToEdit={allowedToEdit} cancelUpdate={that.cancelUpdate.bind(that)}
									restartCurrentProcess={((item.status==voteFileParserStatus.cancelled || item.status==voteFileParserStatus.error) ? that.restartCurrentProcess.bind(that , item.key) : null)}
								  />
        });

        return <tbody>{voteFiles}</tbody>;
    }

    renderUploadButton() {
        if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.vote_results.add'] == true ) {
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
            <div role="tabpanel" className={"votes tab-pane" + (this.props.display ? " active" : "")} id={"Tab-" + this.props.tabKey}>
                <div className="container-tab">
                    <div className="row rsltsTitleRow">
                        <div className="col-md-2 pull-left text-left">{this.renderUploadButton()}</div>
                    </div>

                    <div className="table-elections-low">
                        <div className="table-responsive">
                            <table className="table table-frame2 table-striped">
                                <thead>
                                <tr>
                                    <th>מס"ד</th>
                                    <th>שם הקובץ</th>
                                    <th>גודל קובץ</th>
                                    <th>משתמש מבצע</th>
                                    <th>מועד ביצוע</th>
                                    <th>סטטוס</th>
                                    <th>הורדת קובץ</th>
                                </tr>
                                </thead>

                                {this.renderVotesFiles()}
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
        voteFiles: state.elections.electionsCampaignsScreen.voteFiles
    };
}

export default connect(mapStateToProps) (Votes);