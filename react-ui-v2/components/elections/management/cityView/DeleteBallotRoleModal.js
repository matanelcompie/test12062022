import React from 'react';
import { connect } from 'react-redux';

import ModalWindow from 'components/global/ModalWindow';


class DeleteBallotRoleModal extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }
    initConstants() {
        // this.state = {
        //     deleteType: 'role_shift'
        // };
    }

    // selectDeleteType(deleteType) {
    //     this.setState({ deleteType: deleteType })
    // }
    DeleteBallotRole(){
        this.props.DeleteBallotRole(this.props.deleteType);
        this.hideModal();
    }

    hideModal(){
        // this.setState({ deleteType: 'role_shift'})
        this.props.hideModal();
    }
    render() {
        let title = '';
        let disabledRoleShiftSelect = false;
        if (this.props.roleData) {
            let roleData = this.props.roleData;
            let roleName = roleData.role_name ? roleData.role_name : roleData.election_role_name;
            // let shiftName = (this.props.isBallotRole && this.state.deleteType == 'role_shift') ? '", ' + roleData.shift_name : '" ';
            let deleteMethod = this.props.deleteType == 'election_role' ? 'מחיקת תפקיד' : 'מחיקת שיבוץ';
            if (roleData.election_role_system_name == 'captain_of_fifty') {disabledRoleShiftSelect = true;}
            title = deleteMethod + ' "' + roleName  + ' של הפעיל, ' + roleData.first_name + ' ' + roleData.last_name;
        }
        return (
            <ModalWindow
                title={title}
                show={this.props.show}

                buttonOk={this.DeleteBallotRole.bind(this)}
                buttonOkText="אישור"

                buttonX={this.hideModal.bind(this)}
                buttonCancel={this.hideModal.bind(this)}
                buttonCancelText="בטל"
            >

                <div className="form-group">
                    <div style={{fontWeight:'bold',alignItems:'center'}}>האם ברצונך למחוק שיבוץ זה?</div>
                    <div style={{fontSize:'14px',alignItems:'center'}}>* שים לב לאחר מחיקה , תמחק התפקיד לפעיל במידה ואין שיבוצים נוספים לסוג פעיל</div>
                    {/* <div className="radio-inline">
                        <label><input type="radio" name="deleteType"
                            onChange={this.selectDeleteType.bind(this, 'election_role')}
                            checked={this.state.deleteType == 'election_role'}
                        />מחק תפקיד</label>
                    </div>
                    <div className="radio-inline">
                        <label><input type="radio" name="deleteType"
                            disabled={disabledRoleShiftSelect}
                            onChange={this.selectDeleteType.bind(this, 'role_shift')}
                            checked={this.state.deleteType == 'role_shift'}
                        />ביטול שיבוץ</label>
                    </div> */}
                </div>
            </ModalWindow>
        );
    }
};


export default  DeleteBallotRoleModal;