import React from 'react';

import VoterDetailsItem from './VoterDetailsItem';
import VoterFieldsUpdateItem from './VoterFieldsUpdateItem';


class SelectedVoters extends React.Component {
    renderSelectedVoters() {
        let that = this;

        let voters = this.props.selectedVoters.map( function (item, index) {
            return [
                <VoterDetailsItem  key={item.key + "_details"} voterIndex={index} item={item} massUpdate={that.props.massUpdate}
                                  deleteSelectedVoter={that.props.deleteSelectedVoter.bind(that)}
                                  updateSelectedVoterDetails={that.props.updateSelectedVoterDetails.bind(that)}/>,
                <VoterFieldsUpdateItem key={item.key + "_update"} voterIndex={index} item={item}  massUpdate={that.props.massUpdate}
                                       updateSelectedVoterNewFieldsValues={that.props.updateSelectedVoterNewFieldsValues.bind(that)}/>
            ];
        });

        return <tbody>{voters}</tbody>
    }

    render() {
        return (
			<div>
				<div style={{float:'left'}}>
					<button className="btn btn-primary pull-left" onClick={this.props.onCleanClick}>נקה</button>
				</div>
				<br/><br/>
				<div className="containerStrip dtlsBox">
					<table className="table duplicate-rows middle-text table-frame standard-frame absorption-table">
						<thead>
						<tr>
							<th>{'\u00A0'}</th>
							<th>שם</th>
							<th>ת.ז.</th>
							<th>טלפון1</th>
							<th>טלפון2</th>
							<th>כתובת בפועל</th>
							<th>דוא"ל</th>
							<th>תפקיד</th>
							<th>סטטוס</th>
							<th>{'\u00A0'}</th>
						</tr>
						</thead>

						{this.renderSelectedVoters()}
					</table>
				</div>
			</div>
        );
    }
}

export default SelectedVoters;