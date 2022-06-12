import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useSelector } from "react-redux";
import GlobalListsService from "../../../../../services/globalLists.service";
import Combo from "../../../../global/Combo";
import "./UploadExcelReportVotes.scss";

const UploadExcelReportVotes = forwardRef((props, ref) => {
  const [electionCampaignList, setElectionCampaignList] = useState([]);
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState();
  const [election, setElection] = useState();
  const [errorRequireField, setErrorRequireField] = useState(false);

  useEffect(() => {
    GlobalListsService.electionCampaignList().then((data) => {
      setElectionCampaignList(data);
    });
    if (props.municipal)
      GlobalListsService.getCities().then((data) => {
        setCities(data);
      });
  }, []);

  const selectedElection = (event) => {
    setErrorRequireField(false);
    let columnSelected = event.target.selectedItem;
    setElection(columnSelected);
  };

  const selectedCity = (event) => {
    setErrorRequireField(false);
    let columnSelected = event.target.selectedItem;
    setCity(columnSelected);
  };

  useImperativeHandle(ref, () => ({
    getMoreDetails() {
      if (isSelectAllRequireMoreDetails()) {
        return getDetailsForUpload();
      } else return false;
    },
  }));

  const isSelectAllRequireMoreDetails = () => {
    if (!election) {
      setErrorRequireField(true);
      return false;
    }

    if (!city && props.municipal) {
      setErrorRequireField(true);
      return false;
    }
    setErrorRequireField(false);
    return true;
  };

  const getDetailsForUpload = () => {
    let details = {};
    if (!election) return false;
    if (props.municipal) {
      if (!city) return false;

      details.cityId = city.city_id;
    }

    details.electionCampaignId = election.id;
    return details;
  };
  return (
    <>
      <div className="option-fields">
        <div className="option">
          <label>בחר מערכת בחירות</label>
          <Combo
            onChange={(event) => {
              selectedElection(event);
            }}
            items={electionCampaignList}
            className="form-combo-table"
            itemIdProperty="id"
            itemDisplayProperty="name"
          ></Combo>
        </div>
        {props.municipal ? (
          <div className="option">
            <label>בחר עיר</label>
            <Combo
              onChange={(event) => {
                selectedCity(event);
              }}
              items={cities}
              className="form-combo-table"
              itemIdProperty="city_id"
              itemDisplayProperty="city_name"
            ></Combo>
          </div>
        ) : (
          ""
        )}
      </div>
      {errorRequireField ? (
        <div className="error-txt">* ישנם שדות חובה שלא נבחרו. </div>
      ) : (
        ""
      )}
    </>
  );
});

export default UploadExcelReportVotes;
