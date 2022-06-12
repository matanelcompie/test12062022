
const initState ={
    searchObject:null,
    tabSelected:0
}

const functionObject={
    //set object search details
    setSearchObjectInStore:function(state,action){
        const newState = {...state};
        newState.searchObject=action.searchObject;
        return newState;
    },

    //set tab selected
    setTabSelectedInStore:function(state,action){
        const newState = {...state};
        newState.tabSelected=action.tabSelected;
        return newState;
    }

}

function SearchReducer(state = { ...initState},action) {
  
    const newState = {...state};

    if(action.type.actionName){
        var actionName=action.type.actionName;
        return  functionObject[actionName](newState,action);
    }
    else
    return newState;
}
   

export default SearchReducer

