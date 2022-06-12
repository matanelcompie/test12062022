
const checkGeoPermissions = (GeographicList) => {
 
    let currentEntityType = null;
    let currentEntity = null;

    if(GeographicList.areas.length > 1){
        currentEntityType = -1;
        currentEntity = {name: "כל הארץ", id: 1}
    }else if(GeographicList.sub_areas.length > 1){
        currentEntityType = 0;
        currentEntity = GeographicList.areas[0]
    }else if(GeographicList.cities.length > 1){
        currentEntityType = 5;
        currentEntity = GeographicList.sub_areas[0]
    }else if(GeographicList.cities.length === 1){
        currentEntityType = 1;
        currentEntity = GeographicList.cities[0]
    }else{
        console.log('problem with geo permissions:', GeographicList)
    }
    return {currentEntityType, currentEntity}
}

export default checkGeoPermissions;
