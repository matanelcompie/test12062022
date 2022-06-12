import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import VoterBookItem from './VoterBookItem';

import * as ElectionsActions from 'actions/ElectionsActions';


class LoadingVoters extends React.Component {
    constructor(props) {
        super(props);
        this.initConstants();
        this.state = {
            intervalId: null
        }
    }

    initConstants() {
        this.uploadButtonText = "העלאת קובץ";
    }

    componentWillMount() {
		var millisecondsToWait = 1000 * 5;
		let self = this;
		ElectionsActions.loadCampaignVoterBooks(self.props.dispatch, self.props.campaignKey);
		let intervalId = setInterval(function () {
			//console.log("refresh data");
			ElectionsActions.loadCampaignVoterBooks(self.props.dispatch, self.props.campaignKey);
		}, millisecondsToWait);
		this.setState({intervalId});
    }

    checkVoterBooksProgress() {
        ElectionsActions.loadCampaignVoterBooks(this.props.dispatch, this.props.campaignKey);
    }

    setVoterBookInterval() {
        if (!this.state.intervalId) {
            let intervalId = setInterval(this.checkVoterBooksProgress.bind(this), 2000);
            this.setState({
                intervalId: intervalId
            });
        }        
    }

    clearVoterBookInterval() {
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
            this.setState({
                intervalId: null
            })
        }
    }

    checkVoterBooksStatus() {
        let that = this;
        const voterBookParserStatus = constants.voterBookParserStatus;
        let needInterval = false;
        this.props.voterBooks.forEach(function(voterBook) {
            if (voterBook.status == voterBookParserStatus.didNotStart || voterBook.status == voterBookParserStatus.atWork) {
                needInterval = true;
            }
        });
        if (needInterval) {
            this.setVoterBookInterval();
        } else {
            this.clearVoterBookInterval();
        }
    }
	
	cancelStatusUpdate(voterBookUpdateKey) {
        ElectionsActions.editCampaignVoterBookUpdate(this.props.dispatch, this.props.campaignKey, voterBookUpdateKey);
    }
	
	restartCurrentProcess(voterBookUpdateKey , e){
		ElectionsActions.editCampaignVoterBookUpdate(this.props.dispatch, this.props.campaignKey, voterBookUpdateKey, {edit_type:'reload'}) ;
	}

    renderVoterBooks() {
        const voterBookParserStatus = constants.voterBookParserStatus;
        let that = this;
        let downloadPermission = (this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.voters_book.download'] == true);
		let allowedToEdit = ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.voter_book.edit'] == true );

		let voterBooks = this.props.voterBooks.map( function (item, index) {
            /*if ( item.status == voterBookParserStatus.atWork ) {
                setTimeout(that.checkVoterBookProgress(item.key), 10000);
            }*/

            return <VoterBookItem key={item.key} campaignKey={that.props.campaignKey} item={item} voterBookIndex={index}
                                  downloadPermission={downloadPermission} allowedToEdit={allowedToEdit} cancelStatusUpdate={that.cancelStatusUpdate.bind(that)}
								  restartCurrentProcess={((item.status==voterBookParserStatus.cancelled || item.status==voterBookParserStatus.error) ? that.restartCurrentProcess.bind(that , item.key) : null)}
								  />
        });

        return <tbody>{voterBooks}</tbody>;
    }

    componentWillUnmount() {
        this.clearVoterBookInterval();
    }

    componentDidUpdate() {
        if (!this.state.intervalId) this.checkVoterBooksStatus();
    }

    renderUploadButton() {
        if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.voters_book.add'] == true ) {
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
            <div role="tabpanel" className={"loading-voters tab-pane" + (this.props.display ? " active" : "")} id={"Tab-" + this.props.tabKey}>
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
                                    <th>תושבים בקובץ</th>
                                    <th>בוחרים חדשים</th>
                                    <th>סטטוס</th>
                                    <th>הורדת קובץ</th>
                                </tr>
                                </thead>

                                {this.renderVoterBooks()}
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
        voterBooks: state.elections.electionsCampaignsScreen.voterBooks
    };
}

export default connect(mapStateToProps) (LoadingVoters);