import { ExcelColumn } from "./ExcelColumn";

export class UploadFileDto{
    fileUploader:Blob;
    fileName:string;
    isHeaderRow:boolean;
    excelColumns:ExcelColumn[];
}