import { isArray } from "lodash";
import React, { useEffect, useState } from "react";
import { Collapse } from "react-collapse";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CsvDocumentErrorRowType } from "../../../../Enums/CsvDocumentErrorRowType";
import CsvParserStatus from "../../../../Enums/CsvParserStatus";
import { UPLOAD_CSV_URL } from "../../../../routes";
import uploadExcelFileService from "../../../../services/UploadFiles/uploadExcelFile.service";
import "./UploadExcelResult.scss";

const UploadExcelResult = (props) => {
  const _navigate = useNavigate();
  const [excelFileResultData, setExcelFileResultData] = useState(null);
  const [collapseIsOpen, setCollapseIsOpen] = useState(false);
  const [hashErrorRowsType, setHashErrorRowsType] = useState({});
  const _params = useParams();

  useEffect(() => {
    if (props.excelFileDataResult) {
      displayCsvDetails(props.excelFileDataResult);
    }
  }, [props.excelFileDataResult]);

  useEffect(() => {
    if (_params.csv_document_key) {
      uploadExcelFileService
        .getCsvDocumentDetailsByKey(_params.csv_document_key)
        .then((data) => {
          displayCsvDetails(data);
        });
    }
  }, [_params]);

  const displayCsvDetails = (csvDetails) => {
    setCollapseIsOpen(true);
    setExcelFileResultData(csvDetails);
    setHashErrorListRow(csvDetails.error_rows);
  };

  const getStatusUpload = () => {
    let status = excelFileResultData ? excelFileResultData.status : 0;
    let icon = null;
    let title = CsvParserStatus.hashStatusName[+status];
    switch (status) {
      case CsvParserStatus.CSV_PARSER_STATUS_DID_NOT_START:
        icon = <i className="fa fa-check-circle" aria-hidden="true"></i>;
      case CsvParserStatus.CSV_PARSER_STATUS_AT_WORK:
        icon = (
          <i className="fa fa-check-circle working" aria-hidden="true"></i>
        );
        break;
      case CsvParserStatus.CSV_PARSER_STATUS_SUCCESS:
        icon = (
          <i className="fa fa-check-circle success" aria-hidden="true"></i>
        );
        break;
      case CsvParserStatus.CSV_PARSER_STATUS_CANCELLED:
        icon = <i className="fa fa-minus-circle" aria-hidden="true"></i>;
        break;
      case CsvParserStatus.CSV_PARSER_STATUS_ERROR:
        icon = <i className="fa fa-exclamation-circle" aria-hidden="true"></i>;
        break;

      default:
        break;
    }
    return (
      <div className="icon-result">
        <div>{icon}</div>
        <label>{title}</label>
      </div>
    );
  };

  const navigateCsvList = () => {
    _navigate(UPLOAD_CSV_URL);
  };

  const getDetailsUpload = () => {
    return excelFileResultData ? (
      <div className="details-result">
        <div
          onClick={() => {
            uploadExcelFileService.downloadCsvByDocumentId(
              excelFileResultData.id
            );
          }}
          className="col"
        >
          <span>{excelFileResultData.file_name}</span>
          <label>שם הקובץ</label>
        </div>
        {/* <div className="col">
          <span>{excelFileResultData.csv_document_theme_name}</span>
          <label>סוג טעינה</label>
        </div> */}
        <div className="col">
          <span>{excelFileResultData.row_count}</span>
          <label>מספר שורות</label>
        </div>
        <div className="col">
          <span>{excelFileResultData.file_size / 1000} KB</span>
          <label>גודל הקובץ</label>
        </div>
        <div className="col">
          <span>{excelFileResultData.user_creator}</span>
          <label>מייצר הקובץ</label>
        </div>
        <div className="col">
          <span>
            {excelFileResultData.error_rows
              ? excelFileResultData.error_rows.length
              : 0}
          </span>
          <label>מספר רשומות שגויות</label>
        </div>
      </div>
    ) : (
      ""
    );
  };

  const setHashErrorListRow = (errorRows) => {
    let hashErrorNameField = {};
    let globalErrorRow = "מידע כללי שגוי";
    if (errorRows && isArray(errorRows))
      errorRows.forEach((errorRow) => {
        //its error row
        if (errorRow.error_type == CsvDocumentErrorRowType.ROW) {
          if (!hashErrorNameField[globalErrorRow])
            hashErrorNameField[globalErrorRow] = [];

          hashErrorNameField[globalErrorRow].push(errorRow);
        }

        //its error field
        else {
          if (!hashErrorNameField[errorRow.name_field_error])
            hashErrorNameField[errorRow.name_field_error] = [];

          hashErrorNameField[errorRow.name_field_error].push(errorRow);
        }
      });
    setHashErrorRowsType(hashErrorNameField);
  };

  const displayErrorRow = () => {
    let a = Object.keys(hashErrorRowsType).map((errorType) => {
      return (
        <div
          onClick={() => {
            downloadExcelGroupError(errorType);
          }}
          className="error-group"
        >
          <span>{errorType}</span>
          <label>{hashErrorRowsType[errorType].length} רשומות שגויות</label>
        </div>
      );
    });
    return a;
  };

  const downloadExcelGroupError = (errorType) => {
    debugger;
    let arrayErrorsRowType = hashErrorRowsType[errorType];
    let firstError = arrayErrorsRowType[0];
    let csvDocumentErrorRow = firstError.error_type;
    let nameFieldError = firstError.name_field_error;
    uploadExcelFileService.downloadExcelErrorRowsByTypeErrorAndNameField(
      excelFileResultData.id,
      csvDocumentErrorRow,
      nameFieldError
    );
  };

  const stopUploadFile = () => {
    uploadExcelFileService.stopUploadExcelFile(excelFileResultData.id);
  };

  return (
    <div className="ContainerCollapse">
      <div className="contentContainer">
        <div
          className="tit-contentContainer"
          onClick={() => {
            setCollapseIsOpen(!collapseIsOpen);
          }}
        >
          תוצאות טעינה <i className="fa fa-angle-left" aria-hidden="true"></i>
          {props.display_navigate ? (
            <button
              onClick={navigateCsvList}
              style={{ float: "left" }}
              className="btn btn-primary"
            >
              חזור לרשימת הקבצים
            </button>
          ) : (
            ""
          )}
        </div>
        <Collapse isOpened={collapseIsOpen}>
          {getStatusUpload()}
          {getDetailsUpload()}
          {excelFileResultData && excelFileResultData.error_rows ? (
            <div className="error-container">
              <label className="tit">
                פירוט שגיאות <i class="fa fa-angle-left" aria-hidden="true"></i>
              </label>
              <div>{displayErrorRow()}</div>
            </div>
          ) : (
            ""
          )}

          <div style={{ paddingTop: "15px" }}>
            {excelFileResultData &&
            excelFileResultData.status ==
              CsvParserStatus.CSV_PARSER_STATUS_AT_WORK ? (
              <button
                onClick={stopUploadFile}
                type="button"
                className="btn btn-outline-primary"
              >
                הפסק טעינה
              </button>
            ) : (
              ""
            )}
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default UploadExcelResult;
