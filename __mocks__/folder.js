import fileIterator from "./fileIterator";

export default class folder {
  constructor() {
    this.files = [];
  }

  getFiles() {
    return new fileIterator(this.files);
  }

  addFile(file) {
    this.files.push(file);
  }
}
