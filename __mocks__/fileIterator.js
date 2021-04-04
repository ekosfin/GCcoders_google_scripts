export default class fileIterator {
  constructor(files) {
    this.files = files;
    this.iteratorIndex = 0;
  }

  hasNext() {
    return this.files.length > this.iteratorIndex
  }

  next() {
    return this.files[this.iteratorIndex++];
  }
}
