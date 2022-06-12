export default class GeographicEntityType {
    
  static GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP = -1;
  static GEOGRAPHIC_ENTITY_TYPE_AREA = 0;
  static GEOGRAPHIC_ENTITY_TYPE_CITY = 1;
  static GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD = 2;
  static GEOGRAPHIC_ENTITY_TYPE_CLUSTER = 3;
  static GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX = 4;
  static GEOGRAPHIC_ENTITY_TYPE_SUB_AREA = 5;
  static GEOGRAPHIC_ENTITY_TYPE_QUARTER = 6;
  static GEOGRAPHIC_ENTITY_TYPE_CAPTAIN_100 = 100;

  static getTitleByGeographicEntityType(geographicEntityType) {
    let name;
    switch (geographicEntityType) {
      case GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP:
        name = "ארצי";
        break;
      case GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_AREA:
        name = "אזור";
        break;
      case GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA:
        name = "תת אזור";
        break;
      case GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_CITY:
        name = "עיר";
        break;
      case GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD:
        name = "שכונה";
        break;
      case GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_CLUSTER:
        name = "אשכול";
        break;
      case GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX:
        name = "קלפי";
        break;

      case GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_QUARTER:
        name = "רובע";
        break;
      case GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_CAPTAIN_100:
        name = "שר מאה";
        break;

      default:
        name = "לא הוגדר סוג גאוגרפי";
        break;
    }
    
    return name;
  }

}
