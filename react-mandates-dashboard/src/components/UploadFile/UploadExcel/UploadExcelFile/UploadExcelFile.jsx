import * as React from "react";
import { useState } from "react";
import Combo from "../../../global/Combo.js";
import uploadExcelFileService from "../../../../services/UploadFiles/uploadExcelFile.service";
import { csvParserStatus } from "../../../../../../react-ui-v2/libs/constants.js";
import "./UploadExcelFile.scss";
import DropzonFile from "../../Dropzon/DropzonFile.jsx";
import UploadExcelDetails from "../UploadExcelDetails/UploadExcelDetails.jsx";
import { Collapse } from "react-collapse";
import UploadExcelResult from "../UploadExcelResult/UploadExcelResult.jsx";
import { useNavigate } from "react-router-dom";
import { UPLOAD_CSV_URL } from "../../../../routes.js";

// type UploadExcelFileProps={
//   excelColumns:ExcelColumn[];
// }
const UploadExcelFile = (props) => {
  const _navigate = useNavigate();
  const [fileThemeList, setFileThemeList] = useState([]);
  const [fileThemeSelected, setFileThemeSelected] = useState(null);
  const [file, setFile] = useState();
  const [idTimer, setIdTimer] = useState(null);
  const [excelFileDataResult, setExcelFileData] = useState(null);
  const [errorUploadFile, setErrorUploadFile] = useState(null);
  const [collapseUploadFile, setCollapseUploadFile] = useState(true);
  let refDropzone = React.useRef();

  React.useEffect(() => {
    uploadExcelFileService.getCsvDocumentThemeList().then((data) => {
      setFileThemeList(data);
    });
  }, []);

  React.useEffect(() => {
    let arrayStatsClearTimerDetails = [
      csvParserStatus.success,
      csvParserStatus.error,
      csvParserStatus.cancelled,
    ];
    if (
      excelFileDataResult &&
      arrayStatsClearTimerDetails.includes(excelFileDataResult.status)
    ) {
      clearInterval(idTimer);
      setIdTimer(null);
    }
  }, [excelFileDataResult]);

  const handleOnSubmit = (e) => {
    let file = refDropzone.current.getFile();
    if (file) {
      setFile(file);
    }
  };

  const getArrExcelColumnByHashExcelColumn = (hashColumnIndexField) => {
    let excelColumnArray = [];
    Object.keys(hashColumnIndexField).forEach((excelCol) => {
      let field = hashColumnIndexField[excelCol];
      if (field && field.nameColumn) {
        field.excelIndexColumn = excelCol;
        excelColumnArray.push(field);
      }
    });

    return excelColumnArray;
  };

  /**
   *
   * @param {*} hashColumnIndexField an hash index col in excel and value excel column dto
   * @param {*} moreDetails an object include more details for upload file
   */
  const uploadFile = (hashColumnIndexField, isHeaderRow, moreDetails) => {
    //validateUploadFile();
    if (idTimer) setIdTimer(null);

    let excelColumns = getArrExcelColumnByHashExcelColumn(hashColumnIndexField);
    if (!errorUploadFile) {
      var data = new FormData();
      data.append("fileName", file.name);
      data.append("isHeaderRow", isHeaderRow ? 1 : 0);
      data.append("fileUploader", file);
      data.append("moreDetails", JSON.stringify(moreDetails));
      data.append("excelColumns", JSON.stringify(excelColumns));

      uploadExcelFileService
        .uploadExcelFile(data, fileThemeSelected.fileThemeId)
        .then((data) => {
          setExcelFileData(data);
          let idTimer = setInterval(() => {
            uploadExcelFileService
              .getCsvDocumentDetailsByKey(data.key)
              .then((dataFile) => {
                setExcelFileData(dataFile);
              });
          }, 3000);
          setIdTimer(idTimer);
        });
    }
  };

  const selectCsvTheme = (event) => {
    let columnSelected = event.target.selectedItem;
    setFileThemeSelected(columnSelected);
  };

  const navigateCsvList = () => {
    _navigate(UPLOAD_CSV_URL)
  };

  return (
    <>
      <div className="top-btn-navigate">
        <button
          onClick={navigateCsvList}
          type="button"
          className="btn btn-outline-primary"
        >
          חזור לרשימת הקבצים<i className="fa fa-arrow-right right" aria-hidden="true"></i>
        </button>
      </div>

      <div className="ContainerCollapse">
        <div className="contentContainer">
          <div
            className="tit-contentContainer"
            onClick={() => {
              setCollapseUploadFile(!collapseUploadFile);
            }}
          >
            טעינת קובץ <i className="fa fa-angle-left" aria-hidden="true"></i>
          </div>
          <Collapse isOpened={collapseUploadFile}>
            <div>
              <DropzonFile fileType={'text/csv'} title="לחץ או גרור קובץ CSV לטעינה" ref={refDropzone}></DropzonFile>
              <div className="comboExcelType">
                <label>בחר סוג קובץ אקסל לטעינה</label>
                <Combo
                  onChange={(event) => {
                    selectCsvTheme(event);
                  }}
                  items={fileThemeList}
                  className="form-combo-table"
                  itemIdProperty="fileThemeId"
                  itemDisplayProperty="name"
                ></Combo>
              </div>
            </div>
            <div style={{height:'50px'}}>
              <button
                disabled={!fileThemeSelected}
                type="button"
                onClick={handleOnSubmit}
                className="btn btn-primary pull-left"
              >
                הצג פרטי קובץ לטעינה
              </button>
            </div>
          </Collapse>
        </div>
      </div>
      <UploadExcelDetails
        file={file}
        fileThemeSelected={fileThemeSelected}
        uploadFile={uploadFile}
      ></UploadExcelDetails>

      <UploadExcelResult
        excelFileDataResult={excelFileDataResult}
      ></UploadExcelResult>
    </>
  );
};

export default UploadExcelFile;
