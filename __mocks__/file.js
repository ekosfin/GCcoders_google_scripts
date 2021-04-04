export default class file {
  constructor(id, name, blob, mimeType) {
    this.id = id;
    this.name = name;
    this.blob = blob;
    this.mimeType = mimeType;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getBlob() {
    return this.blob;
  }

  getMimeType() {
    return this.mimeType;
  }
}
