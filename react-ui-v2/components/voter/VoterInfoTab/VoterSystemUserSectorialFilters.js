import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';


class VoterSystemUserSectorialFilters extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.placeholders = {
            teamName: 'שם הקבוצה'
        };

        this.title = "מיקוד מגזרי";
    }

    renderFilters() {
        var sectorialFilters = this.props.sectorialFilters;
        var placeholder = this.placeholders.teamName;

        this.sectorialFiltersrows = sectorialFilters.map(function (filterItem, index) {

            return (
                <div className="form-group" key={index}>{filterItem.name}</div>
            )
        });

        return (
            <form>
                {this.sectorialFiltersrows}
            </form>
        )
    }

    render() {

        return (
            <div className="col-md-4">
                <div className="row focusGroup">
                    <div className="col-sm-12"><h4>{this.title}</h4></div>
                </div>

                {this.renderFilters()}
            </div>
        );
    }
}


export default connect()(VoterSystemUserSectorialFilters)