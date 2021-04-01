/* This class provides wrapper for all the utility functions.
   Wrapper is needed, because in some cases, SpreadSheetApp (sApp)
   must be updated. Otherwise sApp must be global variable */
Instance = class Instance {
  constructor() {
    this.sApp = SpreadsheetApp.getActiveSpreadsheet();
    this.LogInstance = new Log();
    this.LogInstance.setSheetName(LOG_SHEET_NAME);
    this.SettingsInstance = new Settings(this);
    // this.logSheetName = LOG_SHEET_NAME;
    this.Log = {
      info: (message) => {this.LogInstance.log(this.sApp, INFO_LEVEL_TITTLE, message);},
      error: (message) => {this.LogInstance.log(this.sApp, ERROR_LEVEL_TITLE, message);}
    }
    this.Cell = {
      getRowByTitle: (sheet, title, titleColumn) => {return Cell.getRowByTitle(sheet, title, titleColumn);},
      getRowByTitleInMemory: (table, title, titleRow) => {return Cell.getRowByTitleInMemory(table, title, titleRow);},
      getColumnByTitle: (sheet, title, titleRow) => {return Cell.getColumnByTitle(sheet, title, titleRow);},
      getColumnByTitleInMemory: (table, title, titleRow) => {return Cell.getColumnByTitleInMemory(table, title, titleRow);},
      getFirstEmptyRow: (sheet) => {return Cell.getFirstEmptyRow(sheet);},
      convertColumnIndexToLetter: (column) => {return Cell.convertColumnIndexToLetter(column);}
    }
    this.Settings = {
      getByKey: (settingKey) => {return this.SettingsInstance.getByKey(this.sApp, settingKey);},
      getCellByKey: (settingKey) => {return this.SettingsInstance.getCellByKey(this.sApp, settingKey);},
      getDateByKey: (settingKey) => {return this.SettingsInstance.getDateByKey(this.sApp, settingKey);}
    }
  }
  setSApp(sApp) {
    this.sApp = sApp
  }
  setLogSheetName(sheetName) {
    this.LogInstance.setSheetName(sheetName);
  }
}