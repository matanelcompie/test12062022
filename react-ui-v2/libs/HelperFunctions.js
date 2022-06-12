import React from 'react';
export function renderLoaderIcon(){
    return (
        <div className='text-center loading-report cursor-pointer' >
             <i className={"fa fa-spinner fa-pulse fa-3x fa-fw"} style={{ fontSize: '30px', margin: '0 auto', 'marginBottom': '10px', marginTop: '-10px', display: 'block' }} />
             טוען...
        </div>
    )
}
export function serializeUrl(obj, prefix) {
    var str = [], p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
            str.push((v !== null && typeof v === "object") ?
                serializeUrl(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}