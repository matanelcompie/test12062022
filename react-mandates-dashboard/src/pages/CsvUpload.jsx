import React, { useContext, useEffect, useState, useRef } from "react";
import { ActionTypes as SystemActions } from "../actions/SystemActions";
import { useDispatch } from "react-redux";
import UploadExcelFile from "../components/UploadFile/UploadExcel/UploadExcelFile/UploadExcelFile.jsx";
import uploadExcelFileService from "../services/UploadFiles/uploadExcelFile.service.js";
import CsvDocumentList from "../components/UploadFile/UploadExcel/CsvDocumentList/CsvDocumentList.jsx";
import { Outlet } from "react-router-dom";
const CsvUpload = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: SystemActions.SET_HEADER_TITLE,
      headerTitle: "טעינת קבצים",
    });
  }, []);

  return (
    <div className="container main">
      <div
        style={{ display: "flex", flexDirection: "column" }}
        className="main-header-text"
      >
        <h1
          style={{
            cursor: "pointer",
            color: "#323a6b",
            fontSize: "37px",
            fontWeight: "600",
          }}
        >
          טעינת קבצי אקסל
        </h1>
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default CsvUpload;
