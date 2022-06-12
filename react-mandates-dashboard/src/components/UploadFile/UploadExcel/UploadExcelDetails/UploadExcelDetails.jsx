import React, { useEffect, useRef, useState } from "react";
import { Collapse } from "react-collapse";
import CsvFileTheme from "../../../../Enums/CsvFileTheme.js";
import ExcelColumnParser from "../ExcelColumnParser/ExcelColumnParser.jsx";
import UploadExcelReportVotes from "../UploadExcelMoreDetails/UploadExcelReportVotes/UploadExcelReportVotes.jsx";
import "./UploadExcelDetails.scss";
const UploadExcelDetails = (props) => {
  const refMoreDetails = useRef();
  const refExcelColumnParser = useRef();
  const [headerExcel, setHeaderExcel] = useState(false);
  const [collapseUploadExcelDetails, setCollapseUploadExcelDetails] =
    useState(false);

  useEffect(() => {
    if (props.fileThemeSelected) {
      setCollapseUploadExcelDetails(true);
      setHeaderExcel(props.fileThemeSelected.mustHeader);
    }
  }, [props.fileThemeSelected]);

  const getMoreDetailsByCsvTheme = () => {
    switch (props.fileThemeSelected.fileThemeId) {
      case CsvFileTheme.ELECTION_BALLOT_VOTES:
        return (
          <UploadExcelReportVotes
            municipal={false}
            ref={refMoreDetails}
          ></UploadExcelReportVotes>
        );
      case CsvFileTheme.ELECTION_MUNICIPAL_BALLOT_VOTES:
        return (
          <UploadExcelReportVotes
            municipal={true}
            ref={refMoreDetails}
          ></UploadExcelReportVotes>
        );
      default:
        return false;
    }
  };

  const getMoreDetails = () => {
    return (
      <div className="option-value-container">
        {getMoreDetailsByCsvTheme()}
        <div className="header-excel">
          <label
            style={{ fontWeight: headerExcel ? "bold" : "normal" }}
            htmlFor="all-campaigns"
            className="control-label pull-right"
          >
            <input
              disabled={
                props.fileThemeSelected && props.fileThemeSelected.mustHeader
              }
              onClick={() => {
                setHeaderExcel(!headerExcel);
              }}
              checked={headerExcel}
              type="checkbox"
            />{" "}
            הקובץ מכיל שורת כותרת
          </label>
        </div>
      </div>
    );
  };

  const uploadFile = () => {
    let moreDetails = refMoreDetails.current.getMoreDetails();
    let hashColumnExcelFields =
      refExcelColumnParser.current.getHashIndexExcelColumn();
    if (hashColumnExcelFields && moreDetails)
      props.uploadFile(hashColumnExcelFields, headerExcel, moreDetails);
  };

  return (
    <div className="ContainerCollapse">
      <div className="contentContainer">
        <div
          className="tit-contentContainer"
          onClick={() => {
            setCollapseUploadExcelDetails(!collapseUploadExcelDetails);
          }}
        >
          סיווג עמודות לטעינה{" "}
          <i className="fa fa-angle-left" aria-hidden="true"></i>
        </div>
        <Collapse isOpened={collapseUploadExcelDetails}>
          {props.fileThemeSelected && props.file ? (
            <>
              <label className="title-excel">
                {props.fileThemeSelected.name}
              </label>
              {getMoreDetails()}
              <ExcelColumnParser
                ref={refExcelColumnParser}
                header={headerExcel}
                file={props.file}
                excelColumns={
                  props.fileThemeSelected
                    ? props.fileThemeSelected.excelColumns
                    : []
                }
              ></ExcelColumnParser>
              <div style={{ paddingTop: "15px",height:'50px' }}>
                <button
                  onClick={uploadFile}
                  type="button"
                  className="btn btn-outline-primary"
                >
                  טען קובץ
                </button>
              </div>
            </>
          ) : (
            <div className="no-file">לא נבחר קובץ לטעינה</div>
          )}
        </Collapse>
      </div>
    </div>
  );
};

export default UploadExcelDetails;
