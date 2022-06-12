import React from 'react';

import Combo from 'components/global/Combo';


class VoterGroupItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedGroup: {id: null, key:null, name: '', parent_id: null}
        };

        this.initConstants();
    }

    initConstants() {
        this.emptyFieldObj = {id: null, name: '', key: null};
    }

    componentWillMount() {
        if ( this.props.selectedGroups.length > 0 && this.props.selectedGroups[this.props.currentIndex] != undefined ) {
            let selectedGroup = {...this.props.selectedGroups[this.props.currentIndex]};
            this.setState({selectedGroup});
        }
    }

    componentWillReceiveProps(nextProps) {
        // If hiding the voter group  modal
        // then reset all the state variables
        if ( this.props.show && !nextProps.show ) {
            let selectedGroup = {...this.emptyFieldObj};
            this.setState({selectedGroup});
        }
        if (  nextProps.selectedGroups[this.props.currentIndex] != undefined ) {
            let selectedGroup = {...nextProps.selectedGroups[this.props.currentIndex]};
            this.setState({selectedGroup});
        }
    }

    getLabel() {
        if ( this.props.currentIndex == 0 ) {
            return 'קבוצה :';
        } else {
            return 'תת קבוצה :';
        }
    }

    groupChange(event) {
        let selectedItem = event.target.selectedItem;
        let selectedGroup = {};

        if ( null == selectedItem ) {
            selectedGroup = {...this.emptyFieldObj, name: event.target.value};
        } else {
            selectedGroup = {...selectedItem};
        }
        this.setState({selectedGroup});

        this.props.groupChange(this.props.currentIndex, selectedGroup);
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-4">{this.getLabel()}</div>
                <div className="col-md-7">
                    <Combo items={this.props.currentGroups}
                           maxDisplayItems={10}
                           itemIdProperty="id"
                           itemDisplayProperty="name"
                           className="form-combo-table"
                           value={this.state.selectedGroup.name}
                           onChange={this.groupChange.bind(this)}
                    />
                </div>
            </div>
        );
    }
}

export default VoterGroupItem;