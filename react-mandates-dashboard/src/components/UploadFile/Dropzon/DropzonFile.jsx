import React, { forwardRef, useImperativeHandle, useState } from "react";
import "./DropzonFile.scss";

import Dropzone from "react-dropzone";

 const DropzonFile=forwardRef((props,ref)=>{
  const [fileNames, setFileNames] = useState([]);
  const [files, setFiles] = useState([]);
  const [errorType, setErrorType] = useState(false);
  const handleDrop = (acceptedFiles) => {
    setFileNames(acceptedFiles.map((file) => file.name));
    setFiles(acceptedFiles);
  };
   

    useImperativeHandle(ref,()=>({
        getFile (){
         return files.length?files[0]:false;
        }
        }))
  return (
    <div className="DropzonFile">
      <Dropzone
        multiple={false}
        onDrop={handleDrop}
        accept={props.fileType}
        // minSize={1024}
        // maxSize={3072000}
      >
        {({
          getRootProps,
          getInputProps,
          isDragActive,
          isDragAccept,
          isDragReject
        }) => {
          const additionalClass = isDragAccept
            ? "accept"
            : isDragReject
            ? "reject"
            : "";

          return (
            <div
              {...getRootProps({
                className: `dropzone ${additionalClass}`
              })}
            >
              <input {...getInputProps()} />
              <span>{fileNames.length>0 ? 
              <i className="fa fa-cloud-upload selected" aria-hidden="true"></i>:
              <i className="fa fa-cloud-upload" aria-hidden="true"></i>}
              </span>
              <p>{props.title}</p>
            </div>
          );
        }}
      </Dropzone>
      <div>
        <strong>קובץ שנבחר:</strong>
        <ul>
          {fileNames.map(fileName => (
            <li key={fileName}>{fileName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
})

export default DropzonFile