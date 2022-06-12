import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';

import * as voterFilterActions from 'actions/VoterFilterActions';

import GeographicItemHeader from '../display/GeographicFilter/GeographicItemHeader';
import GeographicItemValues from '../display/GeographicFilter/GeographicItemValues';


class GeographicItem extends React.Component {
    constructor(props, context) {
        super(props, context);
        const item = props.item;

        this.state = {
            isExpanded: true,
            geoOptions: {
                area: [],
                sub_area: [],
                city: [],
                neighborhood: [],
                cluster: [],
                ballot_box: [],
            },
            selectedPath: {
                [item.entity_type]: item.entity_id,
            },
            titleParts: [],
        };

        this.onExpandClick = this.onExpandClick.bind(this);
        this.onActiveClick = this.onActiveClick.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.onResetClick = this.onResetClick.bind(this);
        this.onValueComboChange = this.onValueComboChange.bind(this);

        this.areaSelectedFlag = false;
        this.neighborhoodSelectedFlag = false;
        if (!item.isNew) {
            this.areaSelectedFlag = true;
            this.neighborhoodSelectedFlag = true;
        }
    }

    componentWillMount() {
        // componentWillReceiveProps does not fire on the second portion viewed,
        // but we mount with props already loaded so we can use the check & fill methods here
        if (!_.isEmpty(this.props.geoOptions)) {
            this.checkGeoOptions(this.props.geoOptions);
            this.fillGeoOptions(this.props.geoOptions);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (_.isEmpty(this.props.geoOptions) && !_.isEmpty(nextProps.geoOptions) && JSON.stringify(this.props.geoOptions) != JSON.stringify(nextProps.geoOptions)) {
            // we want to wait until right after the geoOptions object has gotten initialized
            this.checkGeoOptions(nextProps.geoOptions);
        }
        if (this.props.geoOptions != nextProps.geoOptions) {
            this.fillGeoOptions(nextProps.geoOptions);
        }

        if (this.props.geoOptions && this.props.item != nextProps.item) {
            // on item reset or change
            this.checkGeoOptions(this.props.geoOptions, nextProps.item.entity_type, nextProps.item.entity_id);
            this.fillGeoOptions(this.props.geoOptions, nextProps.item.entity_type, nextProps.item.entity_id);
        }

        if ( this.props.geoFilterGroupExpandedFlag == null && nextProps.geoFilterGroupExpandedFlag != this.props.geoFilterGroupExpandedFlag ) {
            this.setState({ isExpanded: nextProps.geoFilterGroupExpandedFlag });
            this.props.voterFilterActions.resetGeographicFilterGroupExpanded();
        }
    }

    checkGeoOptions(geoOptions, entityType = this.props.item.entity_type, entityId = this.props.item.entity_id) {
		let entity = _.find(geoOptions[entityType], { 'id': entityId });

        // if we haven't collected this entity yet, we must get the full option set anyway
        let isIncomplete =  false;
        let getPartial = false;
		 
        if (entity) {
			isIncomplete =  true;
            // otherwise, our behavior depends on the type, but we only need the immediate children
            getPartial = true;
            let clusters, neighborhoods, ballot_boxes;
			 
            switch (entityType) {
                case 'area':
                case 'sub_area':
                    // we already collected these in the init
                    isIncomplete = false;
					//console.log("area/sub-area " + isIncomplete);
                    break;
                case 'city':
                    // here, we could either have neighborhoods or clusters as our direct children
                    // only if both are empty we will consider this entity as incomplete
                    clusters = _.filter(geoOptions['cluster'], ['city_id', entity.id]);
                    neighborhoods = _.filter(geoOptions['neighborhood'], ['city_id', entity.id]);
                     
					isIncomplete = (_.isEmpty(clusters) && _.isEmpty(neighborhoods));
					//console.log("city " + isIncomplete);
					break;
                case 'neighborhood':
                    clusters = _.filter(geoOptions['cluster'], ['neighborhood_id', entity.id]);
                    isIncomplete = _.isEmpty(clusters);
					//console.log("neighborhood " + isIncomplete);
                    break;
                case 'cluster':
				 
                    ballot_boxes = _.filter(geoOptions['ballot_box'], ['cluster_id', entity.id]);
                    
					isIncomplete = false;
					// console.log("cluster " + isIncomplete);
                    break;
                case 'ballot_box':
                    // ballot boxes don't have any children
                    isIncomplete = false;
					 //console.log("ballot_box " + isIncomplete);
                    break;
            }
        }

        if (isIncomplete) {
		 
            this.props.voterFilterActions.getGeoOptions(entityType, entityId, getPartial);
        }
    }

    fillGeoOptions(geoOptions, entityType = this.props.item.entity_type, entityId = this.props.item.entity_id) {
        let entity = _.find(geoOptions[entityType], { 'id': entityId });
		
        let newState = {
            area: geoOptions.area,
            sub_area: [],
            city: geoOptions.city,
            neighborhood: geoOptions.neighborhood,
            cluster: geoOptions.cluster || [],
            ballot_box: geoOptions.ballot_box || [],
        };
        let selectedPath = {};
        let titleParts = [];
        if (entity) {
	 
            let skipFlag = false;
            switch (entityType) {
                case 'ballot_box':
                    selectedPath = { ...selectedPath, ballot_box: entity.id };
                    entity = _.find(geoOptions['cluster'], { 'id': entity.cluster_id });
				
                case 'cluster':
					
					//selectedPath = { ...selectedPath, cluster: entity.id , neighborhood:entity.neighborhood_id , city: entity.city_id, area: entity.area_id, sub_area: entity.sub_area_id };
                    titleParts = [entity.name, ...titleParts];
                    newState.ballot_box = _.filter(geoOptions['ballot_box'], ['cluster_id', entity.id]);
					let city = {};
					let clusterNeighborhood = {};
                    if (entity.neighborhood_id) {
                        clusterNeighborhood = _.find(geoOptions['neighborhood'], { 'id': entity.neighborhood_id });
						city =  _.find(geoOptions['city'], { 'id': clusterNeighborhood.city_id });
						newState.city = _.filter(geoOptions['city'], { 'id': clusterNeighborhood.city_id });
                    } else {
                        skipFlag = true;
                        city = _.find(geoOptions['city'], { 'id': entity.city_id });
						newState.city = _.filter(geoOptions['city'], { 'id': entity.city_id });
                    }
					
					 /*
					 if (entity.sub_area_id) {
                        entity = _.find(geoOptions['sub_area'], { 'id': entity.sub_area_id });
                    } else {
                        skipFlag = true;
                        entity = _.find(geoOptions['area'], { 'id': entity.area_id });
                    }
					newState.ballot_box =  geoOptions['ballot_box'];
					 */
					 
					selectedPath = { ...selectedPath, cluster: entity.id , neighborhood:entity.neighborhood_id , city: city.id, area: city.area_id, sub_area: city.sub_area_id };
					break;
				case 'neighborhood':
                    if (!skipFlag) {
                        selectedPath = { ...selectedPath, neighborhood: entity.id , city: entity.city_id, area: entity.area_id, sub_area: entity.sub_area_id};
                        newState.cluster = _.filter(geoOptions['cluster'], ['neighborhood_id', entity.id]);
                        let neighborhoodData = _.find(geoOptions['city'], { 'id': entity.city_id });
					 
						selectedPath = { ...selectedPath, neighborhood:entity.id ,  city: entity.city_id, area: neighborhoodData.area_id, sub_area: neighborhoodData.sub_area_id };
                    } else {
                        selectedPath = { ...selectedPath, neighborhood: null };
                    }
					
                    skipFlag = false;
					break;
                case 'city':
                    selectedPath = { ...selectedPath, city: entity.id, area: entity.area_id, sub_area: entity.sub_area_id };
                    titleParts = [entity.name, ...titleParts];
                    if (_.isEmpty(newState.cluster)) {
                        // if it's empty, then we don't come from a neighborhood
                        newState.cluster = _.filter(geoOptions['cluster'], ['city_id', entity.id]);

                    }
                    newState.neighborhood = _.filter(geoOptions['neighborhood'], ['city_id', entity.id]);
                     
					if (entity.sub_area_id) {
                        entity = _.find(geoOptions['sub_area'], { 'id': entity.sub_area_id });
                    } else {
                        skipFlag = true;
                        entity = _.find(geoOptions['area'], { 'id': entity.area_id });
                    }
					
					newState.ballot_box =  geoOptions['ballot_box'];
					//console.log(selectedPath)
                    break;
                case 'sub_area':
                    if (!skipFlag) {
                        selectedPath = { ...selectedPath, sub_area: entity.id };
                        newState.city = _.filter(geoOptions['city'], ['sub_area_id', entity.id]);
                        entity = _.find(geoOptions['area'], { 'id': entity.area_id });
                    } else {
                        selectedPath = { ...selectedPath, sub_area: null };
                    }
					//console.log(selectedPath)
					break;
                case 'area':
                    selectedPath = { ...selectedPath, area: entity.id };
                    titleParts = [entity.name, ...titleParts];


                    //  if (_.isEmpty(newState.city)) {
                    // if it's empty, then we don't come from a sub_area
                    newState.city = _.filter(geoOptions['city'], ['area_id', entity.id]);
                    // }
                    newState.sub_area = _.filter(geoOptions['sub_area'], ['area_id', entity.id]);
					//console.log(selectedPath)
            }
			 this.setState({ geoOptions: newState, selectedPath, titleParts });
			
        }
		else{
			
			switch (entityType) {
       
                case 'area':
				//case 'area':
                    
                   
                    newState.neighborhood = [];
                    newState.cluster = [];
                     
					
					newState.ballot_box =  [];

                    
                
                    
            }
			//this.setState({ geoOptions: newState, selectedPath, titleParts });
			
			 this.setState({ geoOptions: newState ,selectedPath:{area:this.state.selectedPath.area,sub_area:this.state.selectedPath.sub_areas},titleParts:this.state.titleParts });
		}
		

    }

    onExpandClick() {
        this.setState({ isExpanded: !this.state.isExpanded });
    }

    onActiveClick() {
        this.props.onActivateItem(this.props.item);
    }

    onDeleteClick() {
        if (this.props.filterIndex == 0) { return; }
        this.props.onDeleteItem(this.props.item);
    }

    onSaveClick() {
        if(!this.props.isEnableEditing){return};
        if (this.props.item.entity_id !== 0) {
            this.props.onSaveItem(this.props.item);
        }
    }

    onResetClick() {
        this.props.onResetItem(this.props.item);
    }

    onValueComboChange(e) {
		
        let entity_type = e.target.name;
        let entity_id = (e.target.selectedItem ? e.target.selectedItem.id : null);
		
        if (entity_id && this.state.selectedPath[entity_type] !== entity_id) {
            if (entity_type == 'area') { this.areaSelectedFlag = true; }
            if (entity_type == 'city') { this.neighborhoodSelectedFlag = false; }
            if (entity_type == 'neighborhood') { this.neighborhoodSelectedFlag = true; }

            let newItem = { ...this.props.item, entity_type, entity_id };
            this.props.onChangeItem(newItem);
        }
        if (entity_id == null) {
            this.updateItemBySelectedPath(entity_type);
			 
            if (entity_type == 'city') {
                let geoOptions = this.state.geoOptions;

                geoOptions.neighborhood = [];
                geoOptions.cluster = [];
                geoOptions.ballot_box = [];
                this.setState({geoOptions});

                this.props.voterFilterActions.resetCityGeoTypes();
            }
        }
    }
    updateItemBySelectedPath(entity_type) {
        let toUpdateTitle = false;
        let parentEntity = null;
        let selectedPath = this.state.selectedPath;
        let titleParts = this.state.titleParts;

        switch (entity_type) {
            case 'area':
                this.areaSelectedFlag = false;
                this.neighborhoodSelectedFlag = false;
            case 'city':
                parentEntity = 'area';
                this.neighborhoodSelectedFlag = false;
                if (!this.areaSelectedFlag || entity_type == 'area') {
                    selectedPath['area'] = 0
                } 
                break;
            case 'neighborhood':
                parentEntity = 'city';
                break;
            case 'cluster':
                parentEntity = 'city';
                if (!this.neighborhoodSelectedFlag) {
                    parentEntity = 'city';
                    delete selectedPath.neighborhood;
                }
                toUpdateTitle = true;
                break;
            case 'ballot_box':
                parentEntity = 'cluster';
                break;
        }

        // Update selected geo entities ids path

        selectedPath[entity_type] = null;
        this.setState({ selectedPath });
        // Update title patrs - need to check it out!
        if (toUpdateTitle) {
            titleParts.pop();
        }
        this.setState({ titleParts, selectedPath });

        if(parentEntity){
            let newItem = { ...this.props.item, entity_type: parentEntity, entity_id: selectedPath[parentEntity] };
            this.props.onChangeItem(newItem);
        }

    }
    render() {
        let isEnableEditing = this.props.isEnableEditing;
        let title = isEnableEditing ? this.state.titleParts.join(' - ') : '';
        return (
            <div className="geographic-item filter-type filter-type_full-width">
                <GeographicItemHeader
                    title={title}
                    filterIndex={this.props.filterIndex}
                    isNew={this.props.item.isNew}
                    isExpanded={this.state.isExpanded}
                    onExpandClick={this.onExpandClick}
                    onActiveClick={this.onActiveClick}
                    onDeleteClick={this.onDeleteClick}
                    onSaveClick={this.onSaveClick}
                    onResetClick={this.onResetClick}
                    isActive={this.props.item.active}
                    isEdited={this.props.isEdited}
                    isSaveButton={isEnableEditing && this.props.isSaveButton}
                />
                {this.state.isExpanded &&
                    <GeographicItemValues
                        selectedPath={this.state.selectedPath}
                        fieldOptions={this.state.geoOptions}
                        onChange={this.onValueComboChange}
                    />
                }
            </div>
        );
    }
}

GeographicItem.propTypes = {
    item: PropTypes.object,
    geoOptions: PropTypes.shape({
        areas: PropTypes.array,
        subAreas: PropTypes.array,
        cities: PropTypes.array,
        neighborhoods: PropTypes.array,
        clusters: PropTypes.array,
        ballots: PropTypes.array
    }),
    onChangeItem: PropTypes.func,
    onResetItem: PropTypes.func,
    onSaveItem: PropTypes.func,
    isEdited: PropTypes.bool,
};

GeographicItem.defaultProps = {
    isEdited: false,
};

function mapStateToProps(state, ownProps) {
    let geoOptions = state.global.voterFilter.geo_options;

    return {
        geoOptions,
        geoFilterGroupExpandedFlag: state.global.voterFilter.geoFilterGroupExpandedFlag
    };
}

function mapDispatchToProps(dispatch) {
    return {
        voterFilterActions: bindActionCreators(voterFilterActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GeographicItem);
