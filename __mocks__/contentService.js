export default class contentService {
  constructor() {
    this.MimeType = { JSON: null };
    this.text;
  }
  
  createTextOutput(text) {
    this.text = text;
    return this;
  }

  setMimeType(mimeType) {
    return this;
  }

  getText() {
    return this.text;
  }
}