export default class spreadsheetApp {
  static instance = new spreadsheetApp();

  constructor() {
    this.sheets = {};
    this.activeSpreadsheet = this;
  }

  getSheetByName(name) {
    return this.sheets[name];
  }

  static getActiveSpreadsheet() {
    return this.instance;
  }

  /* Helper functions for fake implementation */
  /********************************************/
  addSheet(name, sheet) {
    this.sheets[name] = sheet;
    return this;
  }

  static getInstance() {
      return this.instance;
  }

  /********************************************/
}
