class CsvParserStatus {
  static CSV_PARSER_STATUS_DID_NOT_START = 0;
  static CSV_PARSER_STATUS_AT_WORK = 1;
  static CSV_PARSER_STATUS_SUCCESS = 2;
  static CSV_PARSER_STATUS_ERROR = 3;
  static CSV_PARSER_STATUS_WAITING = 4;
  static CSV_PARSER_STATUS_CANCELLED = 5;
  static CSV_PARSER_STATUS_RESTARTED = 6;

  static hashStatusName = {
    0: "לא התחיל טעינה",
    1: "בטעינה",
    2: "סיים טעינה",
    3: "שגיאת טעינה",
    4: "בהמתנה",
    5: "הופסקה טעינה",
    6: "מתחיל מחדש...",
  };
}

export default CsvParserStatus;
