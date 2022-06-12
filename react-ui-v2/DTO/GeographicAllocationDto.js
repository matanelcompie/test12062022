export class GeographicAllocationDto {
  constructor(geographicType=null,geographicValue=null){
    this.geographicType=geographicType;
    this.geographicValue=geographicValue;
  }
  static geographicType;
  static geographicValue;
  static city;
  static cluster;
  static quarter;
  static ballotBox;
}
