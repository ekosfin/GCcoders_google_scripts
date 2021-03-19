/* This class provides wrapper for all the utility functions.
   Wrapper is needed, because in some cases, SpreadSheetApp (sApp)
   must be updated. Otherwise sApp must be global variable */
Instance = class Instance {
  constructor() {
    this.sApp = SpreadsheetApp.getActiveSpreadsheet();
    this.Log = {
      info: (message) => {Log.info(this.sApp, message);},
      error: (message) => {Log.error(this.sApp, message);}
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
      getByKey: (settingKey) => {return Settings.getByKey(this.sApp, settingKey);},
      getCellByKey: (settingKey) => {return Settings.getCellByKey(this.sApp, settingKey);},
      getDateByKey: (settingKey) => {return Settings.getDateByKey(this.sApp, settingKey) ;}
    }
  }
  setSApp(sApp) {
    this.sApp = sApp
  }
}