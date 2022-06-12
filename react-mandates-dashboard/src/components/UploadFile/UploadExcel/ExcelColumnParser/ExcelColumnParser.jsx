import React, { forwardRef, useImperativeHandle, useState } from "react";
import Combo from "../../../global/Combo";
import "./ExcelColumnParser.scss";

const ExcelColumnParser = forwardRef((props, ref) => {
  const fileReader = new FileReader();
  const [array, setArray] = useState([]);
  const [headerExcel, setHeaderExcel] = useState(props.header);
  const [excelColumnArray, setExcelColumnArray] = useState();
  const headerKeys = Object.keys(Object.assign({}, ...array));
  const [errorNotSelectRequireFields, setErrorNotSelectRequireFields] =
    useState(false);
  let hashColumn = React.useRef({});

  React.useEffect(() => {
    setExcelColumnArray([...props.excelColumns]);
  }, [props.excelColumns]);

  React.useEffect(() => {
    setHeaderExcel(props.header);
  }, [props.header]);

  React.useEffect(() => {
    parseExcelFile(props.file);
  }, [props.file]);

  const csvFileToArray = (string) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");
    const array = csvRows.map((i) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });

    setArray(array);
  };

  const parseExcelFile = (file) => {
    if (file) {
      fileReader.readAsText(file, "ISO-8859-8");
      fileReader.onload = function (event) {
        const text = event.target.result;
        csvFileToArray(text);
      };
    }
  };

  const selectedColumnFile = (indexCol, event) => {
    setErrorNotSelectRequireFields(false);
    let columnSelected = event.target.selectedItem;
    let lastSelected = hashColumn.current[indexCol];
    hashColumn.current[indexCol] = { ...columnSelected };

    //un hide last selected col and hide selected col
    let a = excelColumnArray.map((col) => {
      if (lastSelected && lastSelected.nameColumn == col.nameColumn)
        col.excelColHide = false;

      if (
        columnSelected &&
        !columnSelected.multiple &&
        columnSelected.nameColumn == col.nameColumn
      )
        col.excelColHide = true;

      return col;
    });

    setExcelColumnArray(a);
  };

  useImperativeHandle(ref, () => ({
    getHashIndexExcelColumn: getHashIndexExcelColumn,
  }));

  const getHashIndexExcelColumn = () => {
    if (checkSelectedAllRequireFields()) return hashColumn.current;
    else return false;
  };

  const checkSelectedAllRequireFields = () => {
    let arrayColumnRequire = excelColumnArray
      ? excelColumnArray.filter((a) => a.require)
      : [];

    const arraySelectedFields = Object.values(hashColumn.current);
    //check if all require fields is selected
    for (let index = 0; index < arrayColumnRequire.length; index++) {
      let requireField=arrayColumnRequire[index];
      let selectedIndex = arraySelectedFields.findIndex(
        (a) => a.nameColumn == requireField.nameColumn
      );
      if (selectedIndex == -1) {
        setErrorNotSelectRequireFields(true);
        return false;
      }
    }

    setErrorNotSelectRequireFields(false);
    return true;
  };

  return (
    <div className="ExcelColumnParser" style={{ overflowY: "auto" }}>
      {errorNotSelectRequireFields ? (
        <div className="error-txt">* ישנם שדות חובה שאינם נבחרו.</div>
      ) : (
        ""
      )}
      <table className="table table-bordered table-striped table-scrollable table-responsive">
        <thead>
          <tr>
            {headerKeys.map((key, index) => (
              <th>
                <Combo
                  key={index}
                  onChange={(event) => {
                    selectedColumnFile(index, event);
                  }}
                  items={excelColumnArray.filter(
                    (excelCol) => !excelCol.excelColHide
                  )}
                  className="form-combo-table"
                  itemIdProperty="nameColumn"
                  itemDisplayProperty="displayNameColumn"
                ></Combo>
              </th>
            ))}
          </tr>
          <tr className={headerExcel ? "header" : ""}>
            {headerKeys.map((key) => (
              <th>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {array.slice(0, 5).map((item, index) => (
            <tr key={index}>
              {Object.values(item).map((val) => (
                <td>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ExcelColumnParser;
