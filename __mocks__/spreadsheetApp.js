export default class spreadsheetApp {
  static AutoFillSeries = {
    DEFAULT_SERIES: "DEFAULT_SERIES"
  }

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

  static openById(id) {
    // Mock implementation
    return this.instance;
  }

  getSheets() {
    // Mock implementation
    return new Array(10);
  }

  /* Helper functions for fake implementation */
  /********************************************/
  addSheet(name, sheet) {
    this.sheets[name] = sheet;
    sheet.name = name;
    return this;
  }

  static getInstance() {
      return this.instance;
  }

  /********************************************/
}
