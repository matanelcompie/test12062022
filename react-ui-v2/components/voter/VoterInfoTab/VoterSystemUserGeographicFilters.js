import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';


class VoterSystemUserGeographicFilters extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.placeholders = {
            teamName: 'שם הקבוצה'
        };

        this.title = "מיקוד גאוגרפי";
    }

    renderFilters() {
        var geographicFilters = this.props.geographicFilters;
        var placeholder = this.placeholders.teamName;

        this.geographicFiltersrows = geographicFilters.map(function (filterItem, index) {

            return (
                <div className="form-group" key={index}>{filterItem.name}</div>
            );
        });

        return (
            <form>
                {this.geographicFiltersrows}
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


export default connect()(VoterSystemUserGeographicFilters);