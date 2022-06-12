export class ModalConfirmDto {
  constructor(hideConfirmFunc) {
    this.hideConfirmFunc = hideConfirmFunc;
    this.show=false;
  }
  //bool
  show;
  //string
  title;
  //string
  confirmMessage;
  //string name function on confirm
  confirmFunc;
  //data send to name function on confirm message
  data;

  hideConfirmFunc;
}
