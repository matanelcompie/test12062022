import Axios from 'axios';
import _ from 'lodash';
import { SearchActivistDto } from '../DTO/SearchActivistDto';
import * as SystemActions from './SystemActions';

export const ActionTypes = {
    CHANGE_EDIT_BALLOT_BOX_ROLE_FLAG: 'ACTIVIST.CHANGE_EDIT_BALLOT_BOX_ROLE_FLAG',
    ADD_BALLOT_BOX_ROLE_TO_BALLOT_BOX: 'ACTIVIST.ADD_BALLOT_BOX_ROLE_TO_BALLOT_BOX',
    DELETE_CLUSTER_ASSIGNMENT: 'ACTIVIST.DELETE_CLUSTER_ASSIGNMENT',
    DELETE_CLUSTER_ACTIVIST_ROLE:'DELETE_CLUSTER_ACTIVIST_ROLE',
}

export function updateOrCreateBallotAllocation(dispatch, ballotBoxKey, ballotBoxRoleKey) {
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
  
    dispatch({ type: ActionTypes.CHANGE_EDIT_BALLOT_BOX_ROLE_FLAG, flag: false });
   return Axios({
        url: window.Laravel.baseURL + 'api/elections/allocation/ballot/' + ballotBoxKey + '/roles/' + ballotBoxRoleKey,
        method: 'put'
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
        dispatch({ type: ActionTypes.ADD_BALLOT_BOX_ROLE_TO_BALLOT_BOX, ballotBoxKey, balloBoxtRole: response.data.data });
        dispatch({ type: ActionTypes.CHANGE_EDIT_BALLOT_BOX_ROLE_FLAG, flag: true });
    }, function (error) {
        dispatch({ type: ActionTypes.CHANGE_EDIT_BALLOT_BOX_ROLE_FLAG, flag: true });
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
        SystemActions.displayErrorMessage(error, dispatch)
    });
}


export function deleteBallotAllocation(dispatch, ballotBoxKey) {
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    dispatch({ type: ActionTypes.CHANGE_EDIT_BALLOT_BOX_ROLE_FLAG, flag: false });
    Axios({
        url: window.Laravel.baseURL + 'api/elections/allocation/ballot/' + ballotBoxKey,
        method: 'delete'
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
        dispatch({ type: ActionTypes.ADD_BALLOT_BOX_ROLE_TO_BALLOT_BOX, ballotBoxKey, balloBoxtRole: response.data.data });
        dispatch({ type: ActionTypes.CHANGE_EDIT_BALLOT_BOX_ROLE_FLAG, flag: true });
    }, function (error) {
        dispatch({ type: ActionTypes.CHANGE_EDIT_BALLOT_BOX_ROLE_FLAG, flag: true });
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
        SystemActions.displayErrorMessage(error, dispatch)
    });
}


    //delete activist allocation assignment by id
    export function deleteActivistAllocationAssignment(dispatch, activistAssignmentId,isDeleteRoleVoter=false) {
        dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
        
        return Axios({
            url: window.Laravel.baseURL + 'api/elections/activists/geo/' + activistAssignmentId+'/'+(isDeleteRoleVoter?1:0),
            method: 'delete',   
        }).then(function (response) {
            debugger
            dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            return response.data.data;
        }).catch(error => {
            debugger
            SystemActions.displayErrorMessage(error, dispatch)
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
          });
    }


        //delete activist allocation assignment by id and connect the allocation to  another cluster leader voter
        export function deleteAssignmentClusterLeaderAndConnectAllocationToActivist(dispatch, activistAssignmentId,voterKey) {
            dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
            return Axios({
                url: window.Laravel.baseURL + 'api/elections/activists/cluster/assignment/' + activistAssignmentId+'/voter/'+voterKey,
                method: 'put',
                
            }).then(function (response) {
                dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
                return response.data.data;
            }, function (error) {
                SystemActions.displayErrorMessage(error, dispatch)
                dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
            });
        }



        export function addClusterAssignmentToActivistRole(dispatch, electionRoleByVoterKey,clusterKey){
            dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
            return Axios({
                url: window.Laravel.baseURL + 'api/elections/activists/' + electionRoleByVoterKey + '/clusters/' + clusterKey,
                method: 'post'
            }).then(function (response) {
                dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            }, function (error) {
                SystemActions.displayErrorMessage(error, dispatch)
                dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
            });
        }


        export function deleteAllocationById(dispatch,allocationId) {
          dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
         return Axios({
            url:
              window.Laravel.baseURL +
              "api/elections/allocation/" +
              allocationId,
            method: "delete",
          }).then(
            function (response) {
              dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
              return response.data.data;
            },
            function (error) {
              dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
              SystemActions.displayErrorMessage(error, dispatch);
            }
          );
        }

        export function addActivistAssignment(dispatch,activistCreateDto){
            dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
            return Axios({
                url: window.Laravel.baseURL + 'api/elections/management/city_view/' + activistCreateDto.city_id + '/activists/' + activistCreateDto.voter_key + '/roles',
                method: 'post',
                data: activistCreateDto
            }).then(function (response) {
                dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
                return response;
            }, function (error) {
                SystemActions.displayErrorMessage(error, dispatch)
                dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
            });
        }

            /**
     * 
     * @param  dispatch 
     * @param {ActivistUpdateDto} activistUpdateDto 
     * @param {boolean} displaySaveSucsess 
     * @returns Axios
     */
    export function updateActivistDto(dispatch, activistUpdateDto,displaySaveSucsess=true) {
       
        dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
       return Axios({
            url: window.Laravel.baseURL + 'api/elections/activists/update',
            method: 'put'  ,
            data: activistUpdateDto
        }).then(function (response) {
            if(displaySaveSucsess)
            dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            return response.data.data;
        }, function (error) {
            SystemActions.displayErrorMessage(error, dispatch)
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
        });   
    }


    export function getElectionRolesByGeoEntityTypeAllocation(dispatch,geographicEntityType) {

        return Axios({
             url: window.Laravel.baseURL + `api/elections/allocation/roles/${geographicEntityType}`,
             method: 'get'  
         }).then(function (response) {
             return response.data.data;
         }, function (error) {
             SystemActions.displayErrorMessage(error, dispatch)
         });
    }

    /**
     * Function get activistAllocationCreate dto and add allocation by geoEntityType
     * @param {*} activistAllocationCreate  from dto
     */
    export function addAllocationNotBallotRole(dispatch,activistAllocationCreate){
        dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
        return Axios({
            url: window.Laravel.baseURL + `api/elections/allocation/roles/{${activistAllocationCreate.GeographicEntityType}}`,
            method: 'post',
            data:activistAllocationCreate
        }).then(function (response) {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            return response.data.data;
        }, function (error) {
            SystemActions.displayErrorMessage(error, dispatch)
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
        }); 
    }


    /**
     * 
     * @param {*} dispatch 
     * @param {SearchActivistDto} searchActivist 
     * @param {string} cityKey 
     * @returns 
     */
    export function searchVoterAndCheckIfNotHasConflictRole(dispatch,searchActivist) {
       return Axios({
            url: window.Laravel.baseURL + 'api/elections/activists/voter/search'+(searchActivist.city_id?`/${searchActivist.city_id}`:''),
            method: 'get',
            params: searchActivist
        }).then(function (response) {
           return response.data.data
        }, function (error) {
            SystemActions.displayErrorMessage(error, dispatch)
        });
    }

    export function loadCityClustersAvailableAllocations(dispatch, cityKey, election_role_id) {
        debugger
    return Axios({
        url: window.Laravel.baseURL + `api/elections/activists/city/${cityKey}/allocations/available-clusters`,
        method: 'get',
        params: {election_role_id}
    }).then(function (response) {
        return response.data.data
        // dispatch({ type: ActionTypes.ACTIVIST.MODAL_UPDATE_ALLOCATION.LOADED_AVAILABLE_CLUSTERS_ALLOCATIONS, data: response.data.data });
    }, function (error) {
        SystemActions.displayErrorMessage(error, dispatch)
    });
    }   

    export function loadCityBallotsAvailableAllocations(dispatch, cityKey, election_role_id) {
        return  Axios({
             url: window.Laravel.baseURL + `api/elections/activists/city/${cityKey}/allocations/available-ballots`,
             method: 'get',
             params: {election_role_id}
         }).then(function (response) {
            return response.data.data // dispatch({ type: ActionTypes.ACTIVIST.MODAL_UPDATE_ALLOCATION.LOADED_AVAILABLE_BALLOTS_ALLOCATIONS, data: response.data.data });
         }, function (error) {
             SystemActions.displayErrorMessage(error, dispatch)
         });
     }

     export function loadCityQuarterAvailableAllocations(dispatch, cityKey, election_role_id) {
         debugger
        return  Axios({
             url: window.Laravel.baseURL + `api/elections/activists/city/${cityKey}/allocations/available-quarters`,
             method: 'get',
             params: {election_role_id}
         }).then(function (response) {
            return response.data.data 
         }, function (error) {
             SystemActions.displayErrorMessage(error, dispatch)
         });
     }


     export function getGeographicDetailsByGeographicEntityValue(dispatch,geographicAllocationDto){
        return  Axios({
            url: window.Laravel.baseURL + `api/elections/allocation/geographic`,
            method: 'get',
            params: geographicAllocationDto
        }).then(function (response) {
           return response.data.data 
        }, function (error) {
            SystemActions.displayErrorMessage(error, dispatch)
        });
     }

     export function getActivistAssignmentDetailsById(dispatch,assignmentId){
        return  Axios({
            url: window.Laravel.baseURL + `api/elections/activists/assignment/${assignmentId}`,
            method: 'get',
        }).then(function (response) {
           return response.data.data 
        }, function (error) {
            SystemActions.displayErrorMessage(error, dispatch)
        });
     }

     

     


