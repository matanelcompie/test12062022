import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "../scss/style.scss";

// import {  connect } from "react-redux";
import Header from "./components/header/Header";
import Menu from "./components/header/Menu";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard.jsx";
import { displayContext } from "./context/displayContext.jsx";
import CsvUpload from "./pages/CsvUpload.jsx";
import CsvDocumentList from "./components/UploadFile/UploadExcel/CsvDocumentList/CsvDocumentList.jsx";
import UploadExcelFile from "./components/UploadFile/UploadExcel/UploadExcelFile/UploadExcelFile.jsx";
import { BASE_URL, UPLOAD_CSV_URL } from "./routes";
import UploadExcelResult from "./components/UploadFile/UploadExcel/UploadExcelResult/UploadExcelResult.jsx";

const App = () => {
  // structure data to put into context:
  const [display, setDisplay] = useState({
    isPartyHover: null,
    isComparisonArea: false,
    isComparisonCity: false,
    currentDataDisplayed: { regular: [], compared: [] },
    ballotList: [],
    currentScreenDisplayed: { type: null, id: [] },
    currentTab: "",
    isReportVotes: false,
  });

  return (
    <>
      {/* <Router basename={window.Laravel.baseURL + 'mandates-dashboards'}> */}
      <Header></Header>
      <Menu></Menu>
      <displayContext.Provider value={{ display, setDisplay }}>
        <Routes>
          <Route exact path={BASE_URL} element={<Dashboard />} />
          <Route exact path={BASE_URL} element={<Dashboard />} />
          <Route path={UPLOAD_CSV_URL} element={<CsvUpload />}>
            <Route index element={<CsvDocumentList />}></Route>
            <Route
              path=":csv_document_key"
              element={<UploadExcelResult display_navigate={true} />}
            ></Route>
            <Route exact path="new" element={<UploadExcelFile />}></Route>
          </Route>
        </Routes>
      </displayContext.Provider>
      {/* <Breadcrombs/> */}

      {/* <Switch>
        <displayContext.Provider value={{display, setDisplay}}>
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/" component={Dashboard} />
          <Route exact path="/csv-upload" component={CsvUpload} />
          <Route exact path="/csv-upload/new" component={CsvUpload} />
        </displayContext.Provider>
      </Switch> */}
      <Footer />
      {/* </Router> */}
    </>
  );
};

export default App;
