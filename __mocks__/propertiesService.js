export default class propertiesService {
  static documentProperties = new propertiesService();

  constructor() {
    this.properties = {};
  }

  static getDocumentProperties() {
    return this.documentProperties;
  }

  getProperty(name) {
    return this.properties[name];
  }

  setProperty(name, value) {
    this.properties[name] = value;
  }

  deleteAllProperties() {
    this.properties = {};
  }
}
