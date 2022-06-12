
export function validNumber(ballotId) {
    return /^([0-9]*)$/.test(ballotId);
}
export function formatBallotMiId(mi_id){
    if(mi_id){
        return (mi_id).toString().substr(0, (mi_id + '').length - 1) + "." + (mi_id + '').substr(-1);
    }else{
        return mi_id;
    }
}