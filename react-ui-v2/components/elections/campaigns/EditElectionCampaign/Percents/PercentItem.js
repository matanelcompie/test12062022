import React from 'react';
import { connect } from 'react-redux';
import { numberWithCommas } from 'libs/globalFunctions';

import * as ElectionsActions from 'actions/ElectionsActions';


class PercentItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editMode: false,
            percentage: ''
        };

        this.initConstants()
    }

    initConstants() {
        this.invalidColor = '#cc0000';

        this.cursorStyle = {cursor: 'pointer'};
    }

    componentWillMount() {
        this.setState({percentage: this.props.item.percentage});
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.loadedPercentsFlag && nextProps.loadedPercentsFlag ) {
            this.setState({percentage: nextProps.item.percentage});
        }
    }

    // displayTime() {
    //     let timeArr = this.props.item.time.split(':');

    //     return (timeArr[0] + ':' + timeArr[1]);
    // }

    getPartOfDay() {
        if ( this.props.item.time < 12 ) {
            return 'בוקר';
        } else if ( this.props.item.time < 17 ) {
            return 'צהריים'
        } else {
            return 'ערב';
        }
    }

    resetState() {
        this.setState({editMode: false});
    }

    deletePercentage(event) {
        // Prevent page refresh
        event.preventDefault();

        this.resetState();
        this.props.deleteFromTimeHash(this.props.item.time)
        ElectionsActions.deleteCampaignVotePercentage(this.props.dispatch, this.props.campaignKey, this.props.item.key);
    }

    updatePercentage(event) {
        // Prevent page refresh
        event.preventDefault();

        let formFields = {
            percentage: this.state.percentage
        };

        this.resetState();

        if ( this.props.item.key == null ) {
            formFields.time = this.props.item.time;
            ElectionsActions.addCampaignVotePercentage(this.props.dispatch, this.props.campaignKey, formFields);
        } else {
            ElectionsActions.editCampaignVotePercentage(this.props.dispatch, this.props.campaignKey, this.props.item.key, formFields)
        }
    }

    percentageChange(event) {
        this.setState({percentage: event.target.value});
    }

    disableEditMode() {
        this.setState({editMode: false, percentage: this.props.item.percentage});
    }

    enableEditMode() {
        this.setState({editMode: true});
    }


    checkPermission(action) {
        let permission = 'elections.campaigns.vote_percentage.' + action;

        return (this.props.currentUser.admin || this.props.currentUser.permissions[permission] == true);
    }

    renderButtons() {
        let buttons = [];

        if ( this.state.editMode ) {
            return [
                <button key={0} className="btn btn-success btn-xs" style={this.validInput ? this.cursorStyle : {}} title="שמירה"
                        onClick={this.updatePercentage.bind(this)} disabled={!this.validInput}>
                    <i className="fa fa-floppy-o"/>
                </button>,
                <button key={1} className="btn btn-danger btn-xs" style={this.cursorStyle} title="ביטול"
                        onClick={this.disableEditMode.bind(this)}>
                    <i className="fa fa-times"/>
                </button>
            ];
        } else {
            if ( this.props.item.key ) {
                if ( this.checkPermission('delete') ) {
                    buttons.push(<span key={3} className="glyphicon glyphicon-trash green-icon" style={this.cursorStyle}
                                       onClick={this.deletePercentage.bind(this)}/>);
                }

                if ( this.checkPermission('edit') ) {
                    buttons.push(<span key={4} className="edit-group edit-group-icon" style={this.cursorStyle}
                                       onClick={this.enableEditMode.bind(this)}/>);
                }

                return buttons;
            } else {
                if ( this.checkPermission('add') ) {
                    return <span key={4} className="edit-group edit-group-icon" style={this.cursorStyle}
                                 onClick={this.enableEditMode.bind(this)}/>;
                } else {
                    return <span key={4}>{'\u00A0'}</span>;
                }
            }
        }
    }

    renderPercentsCols(){
        let item  = this.props.item;

        let fieldsNames = [
            'reported_votes_total' , 'reported_supporters_votes_total',
            'reporting_ballot_reported_votes_total', 'reporting_ballot_reported_supporters_votes_total'
        ];

         let itemCols = fieldsNames.map((fieldName) => {
             let total = item[fieldName + '_total'];
             let value = item[fieldName];
             let percent = (total > 0) ? (value / total) * 100 :0;
            return (<td><span title={numberWithCommas(item[fieldName]) + '/' + numberWithCommas(total)} style={{cursor: 'help'}}>% {percent.toFixed(1)}</span></td>)
        })
        return itemCols;
    }
    render() {
        return (
            <tr>
                <td>{this.props.time}</td>
                {this.renderPercentsCols()}
                <td>{this.getPartOfDay()}</td>
                {/* <td className="pull-left">{this.renderButtons()}</td> */}
            </tr>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        loadedPercentsFlag: state.elections.electionsCampaignsScreen.percents.loadedPercentsFlag,
    };
}

export default connect(mapStateToProps) (PercentItem);