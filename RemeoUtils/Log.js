class Log {
  static checkCahce(sApp, rows) {
    // Cache log sheet
    if (!this.logSheet || rows) {
      this.logSheet = sApp.getSheetByName(LOG_SHEET_NAME);
      this.tableCache = this.logSheet.getRange(1, 1, rows ? rows : this.logSheet.getMaxRows(),
                        this.logSheet.getMaxColumns()).getValues();
    }
  }
  
  static getFirstEmptyRowInMemory(sApp) {
    if (this.tableCache [this.tableCache .length - 1][0] != "") {
      this.logSheet.insertRowsAfter(this.logSheet.getMaxRows(), LOG_INSERT_EXTRA_ROWS)
      Log.checkCahce(sApp, this.logSheet.getMaxRows() + LOG_INSERT_EXTRA_ROWS);
    }

    let index = 0;
    while ( this.tableCache [index][0] != "" ) {
      index++;
    }
    return index;
  }
  
  // Create log entry into log sheet
  static log(sApp, level, message) {
    Log.checkCahce(sApp, 0);

    const emptyRow = Log.getFirstEmptyRowInMemory(sApp);

    const timeColumn = Cell.getColumnByTitleInMemory(this.tableCache, TIME_TITLE, TITLE_ROW - 1);
    const typeColumn = Cell.getColumnByTitleInMemory(this.tableCache, TYPE_TITLE, TITLE_ROW - 1);
    const messageColumn = Cell.getColumnByTitleInMemory(this.tableCache, MESSAGE_TITLE, TITLE_ROW - 1);

    // Update real sheet
    this.logSheet.getRange(emptyRow + 1, timeColumn + 1).setValue(new Date()).setNumberFormat("dd.mm.yyyy hh:m");
    this.logSheet.getRange(emptyRow + 1, typeColumn + 1).setValue(level);
    this.logSheet.getRange(emptyRow + 1, messageColumn + 1).setValue(message);

    // Update cache table
    this.tableCache[emptyRow][timeColumn] = new Date();
    this.tableCache[emptyRow][timeColumn] = level;
    this.tableCache[emptyRow][messageColumn] = message;
  }
  
  static error(sApp, message) {
    Log.log(sApp, ERROR_LEVEL_TITLE, message);
  }
  
  static info(sApp, message) {
    Log.log(sApp, INFO_LEVEL_TITTLE, message);
  }
}
