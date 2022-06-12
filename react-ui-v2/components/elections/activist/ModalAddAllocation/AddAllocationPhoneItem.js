import React from 'react';


class AddAllocationPhoneItem extends React.Component {
    constructor(props) {
        super(props);

        this.icons = {
            exists: {class: 'phone-exists phone-icon', title: 'מספר קיים'},
            new:    {class: 'add-phone phone-icon', title: 'מספר חדש'}
        };
    }

    setRolePhoneNumber() {
        this.props.setRolePhoneNumber(this.props.phoneIndex);
    }

    deleteNewPhoneNumber=() =>{
        this.props.deleteNewPhoneNumber(this.props.phoneIndex);
    }

    render() {
        let buttonDisabled = false;
        let phoneToCheck = this.props.item.phone_number.split('-').join('');
        let rolePhoneNumberToCheck = '';
        if (this.props.rolePhoneNumber && this.props.rolePhoneNumber.length > 0 ) {
            rolePhoneNumberToCheck = this.props.rolePhoneNumber.split('-').join('');

            if ( phoneToCheck == rolePhoneNumberToCheck ) {
                buttonDisabled = true;
            }
        }

        return (
            <div className="col-lg-offset-3 col-lg-9 flexed-center flexed-space-between no-padding" style={{marginBottom: '13px'}}>
                <div>
                    <span onClick={this.deleteNewPhoneNumber}
                    className={this.props.item.key?this.icons.exists.class:this.icons.new.class} 
                    title={this.props.item.key?this.icons.exists.title:this.icons.new.title} />
                    <span className="phone-num item-space">{this.props.item.phone_number}</span>
                </div>
                <button disabled={buttonDisabled} title="השתמש במספר זה" type="button"
                        className="btn srch-btn-mini pull-left" onClick={this.setRolePhoneNumber.bind(this)}>השתמש במספר זה
                </button>
            </div>
        );
    }
}

export default AddAllocationPhoneItem;