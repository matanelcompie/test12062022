import { isArray } from "lodash";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CsvParserStatus from "../../../../Enums/CsvParserStatus";
import { UPLOAD_CSV_URL } from "../../../../routes";
import uploadExcelFileService from "../../../../services/UploadFiles/uploadExcelFile.service";
import LoadingTable from "../../../global/LoadingTable/LoadingTable";
import "./CsvDocumentList.scss";

const CsvDocumentList = () => {
  const [csvDocumentList, setCsvDocumentList] = useState([]);
  const [isLoadingList, setIsLoading] = useState(false);
  const _navigate = useNavigate();
  useEffect(() => {
    getCsvDocumentList();
  }, []);

  const getCsvDocumentList = () => {
    setIsLoading(true);
    uploadExcelFileService.getAllCsvUploadedDetails().then((data) => {
       setIsLoading(false);
      if (isArray(data)) setCsvDocumentList(data);
    });
  };
  const uploadCsvDocument = () => {
    _navigate("new");
  };

  const navigateCsvResultDetails = (csvDocumentKey) => {
    _navigate(`${UPLOAD_CSV_URL}/${csvDocumentKey}`);
  };

  return (
    <div className="contentContainer">
      <div className="title-table">
        <div>רשימת טעינות</div>
        <div className="container-left-btn">
          <button
            type="button"
            onClick={uploadCsvDocument}
            className="btn btn-primary pull-left"
          >
            טען קובץ <i className="fa fa-plus" aria-hidden="true"></i>
          </button>

          <button
            type="button"
            onClick={getCsvDocumentList}
            className="btn btn-outline-primary"
          >
            רענן טבלה<i className="fa fa-refresh" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div className="table-responsive">
        {!isLoadingList &&<table className="table table-striped tableNoMarginB tableTight">
          <thead>
            <tr>
              <th>סוג טעינה</th>
              <th>תאריך העלאה</th>
              <th>משתמש</th>
              <th>שם הקובץ</th>
              <th>גודל הקובץ</th>
              <th>מס שורות</th>
              <th>קיים שורת כותרת</th>
              <th>מס שורות שגויות</th>
              <th>סטטוס טעינה</th>
            </tr>
          </thead>
          <tbody>
            {
              csvDocumentList.map((csvFile, index) => (
                <tr
                  onClick={() => {
                    navigateCsvResultDetails(csvFile.key);
                  }}
                  key={index}
                >
                  <td>{csvFile.csv_document_theme_name}</td>
                  <td>{csvFile.created_at}</td>
                  <td>{csvFile.user_creator}</td>
                  <td>{csvFile.file_name}</td>
                  <td>{csvFile.file_size / 1000}KB</td>
                  <td>{csvFile.row_count}</td>
                  <td>
                    <i
                      className={`fa fa-${csvFile.header ? "check" : "times"}`}
                      aria-hidden="true"
                    ></i>
                  </td>
                  <td>{csvFile.error_rows ? csvFile.error_rows.length : 0}</td>
                  <td className={`status${csvFile.status}`}>
                    {CsvParserStatus.hashStatusName[+csvFile.status]}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>}
        {isLoadingList ? (
          <div>
            <LoadingTable></LoadingTable>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default CsvDocumentList;
