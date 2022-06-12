import React from 'react';


class MetaDataItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // This variable points to the li
            // of the meta value that the mouse
            // is over
            metaValueOver: null
        };
    }

    /**
     * This function gets the voter meta value
     * of the meta key.
     *
     * It the voter doesn't have value for the
     * meta key, it returns null
     *
     * @returns {*}
     */
    getVoterMetaValueId() {
        let metaKeyId = this.props.item.id;
        let voterMetaValueId = null;

        if (this.props.voterMetaHash.length == 0) {
            return null;
        }

        if (this.props.voterMetaHash[metaKeyId] != undefined && this.props.voterMetaHash[metaKeyId] != null) {
            voterMetaValueId = this.props.voterMetaHash[metaKeyId].voter_meta_value_id;
        } else {
            voterMetaValueId = null;
        }

        return voterMetaValueId;
    }

    /**
     * This function resets the pointer
     * when mouse is out of the li of the
     * meta value.
     */
    mouseOutAction() {
        this.setState({ metaValueOver: null });
    }

    /**
     * This function updates the pointer
     * of the li of the meta value
     * that the mouse is over it.
     *
     * @param metaKeyValueId
     */
    mouseOverAction(metaKeyValueId) {
        let voterMetaValueId = this.getVoterMetaValueId();

        // The li css of current value support status tm
        // should not be changed
        if (metaKeyValueId != voterMetaValueId) {
            this.setState({ metaValueOver: metaKeyValueId });
        }
    }

    voterMetaKeyValueChange(metValueId) {
        let voterMetaValueId = this.getVoterMetaValueId();

        if (voterMetaValueId == metValueId) {
            this.props.voterMetaKeyValueChange(this.props.item.id);
        } else {
            this.props.voterMetaKeyValueChange(this.props.item.id, metValueId);
        }
    }

    /**
     * This functions rensers the meta key
     * values of the current meta key id.
     *
     * @returns {XML}
     */
    renderMetaValues() {
        let that = this;
        let metaKeyId = this.props.item.id;
        let voterMetaValueId = null;

        voterMetaValueId = this.getVoterMetaValueId();

        let lists = this.props.metaValuesHashKey.map(function (metaValueItem, index) {
            let statusOverStyle = {};
            let className = "additional-data__non-active-status";

            if (voterMetaValueId != metaValueItem.id) {
                // Change the background of the li which the mouse
                // is over it.
                if (metaValueItem.id == that.state.metaValueOver) {
                    statusOverStyle = {
                        backgroundColor: '#e9e9e9'
                    };
                }
            } else {
                // The class of the current value that
                // equals to the voter meta value id
                className = "additional-data__active-status";
            }
            
            if (that.props.editPermission) {
                return (
                    <li key={index} className={className} style={statusOverStyle}
                        onMouseOver={that.mouseOverAction.bind(that, metaValueItem.id)}
                        onMouseOut={that.mouseOutAction.bind(that)}
                        onClick={that.voterMetaKeyValueChange.bind(that, metaValueItem.id)}>
                        <div className="additional-data__meta-value-name">{metaValueItem.value}</div>
                    </li>
                );
            } else {
                return (
                <li key={index} className={className} style={statusOverStyle}>
                    <div className="additional-data__meta-value-name">{metaValueItem.value}</div>
                </li>
                )
            }

        });

        return <ul>{lists}</ul>;
    }

    render() {
        return (
            <div className="additional-data__column">
                <div className="additional-data__metakey-name">{this.props.item.key_name}</div>

                {this.renderMetaValues()}
            </div>
        );
    }
}


export default MetaDataItem;