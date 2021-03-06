Log = class Log {
  checkCache(sApp, rows) {
    this.logSheet = (this.logSheet) ? this.logSheet : sApp.getSheetByName(this.sheetName);
    // Cache log sheet
    if (!this.tableCache || rows) {
      this.tableCache = this.logSheet.getRange(1, 1, rows ? rows : this.logSheet.getMaxRows(),
                        this.logSheet.getMaxColumns()).getValues();
    }
  }
  
  getFirstEmptyRowInMemory(sApp) {
    if (this.tableCache [this.tableCache.length - 1][0] != "") {
      const newMaxRows = this.logSheet.getMaxRows() + LOG_INSERT_EXTRA_ROWS;
      this.logSheet.insertRowsAfter(this.logSheet.getMaxRows(), LOG_INSERT_EXTRA_ROWS);
      this.checkCache(sApp, newMaxRows);
    }

    let index = 0;
    while ( this.tableCache [index][0] != "" ) {
      index++;
    }
    return index;
  }
  
  // Create log entry into log sheet
  log(sApp, level, message) {
    this.checkCache(sApp, 0);

    const emptyRow = this.getFirstEmptyRowInMemory(sApp);

    const timeColumn = Cell.getColumnByTitleInMemory(this.tableCache, TIME_TITLE, TITLE_ROW - 1);
    const typeColumn = Cell.getColumnByTitleInMemory(this.tableCache, TYPE_TITLE, TITLE_ROW - 1);
    const messageColumn = Cell.getColumnByTitleInMemory(this.tableCache, MESSAGE_TITLE, TITLE_ROW - 1);

    if (timeColumn == undefined || typeColumn == undefined || messageColumn == undefined) {
      throw new Error(`Jotakin otsikoista: ${TIME_TITLE}, ${TYPE_TITLE}, ${MESSAGE_TITLE} ei voitu löytää` +
      ` riviltä: ${TITLE_ROW}. Tarkista, että otsikot on merkitty taulukkoon.`);
    }

    // Update real sheet
    this.logSheet.getRange(emptyRow + 1, timeColumn + 1).setValue(new Date()).setNumberFormat("dd.mm.yyyy hh:mm");
    this.logSheet.getRange(emptyRow + 1, typeColumn + 1).setValue(level);
    this.logSheet.getRange(emptyRow + 1, messageColumn + 1).setValue(message);

    // Update cache table
    this.tableCache[emptyRow][timeColumn] = new Date();
    this.tableCache[emptyRow][typeColumn] = level;
    this.tableCache[emptyRow][messageColumn] = message;
  }

  setSheetName(sheetName) {
    this.sheetName = sheetName;
  }
}
