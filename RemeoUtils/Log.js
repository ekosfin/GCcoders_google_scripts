class Log {
  // Create log entry into log sheet
  static log(sApp, level, message) {
    const logSheet = sApp.getSheetByName(LOG_SHEET_NAME);
    const emptyRow = Cell.getFirstEmptyRow(logSheet);
    const timeColumn = Cell.getColumnByTitle(logSheet, TIME_TITLE, TITLE_ROW);
    const typeColumn = Cell.getColumnByTitle(logSheet, TYPE_TITLE, TITLE_ROW);
    const messageColumn = Cell.getColumnByTitle(logSheet, MESSAGE_TITLE, TITLE_ROW);
    logSheet.getRange(emptyRow, timeColumn).setValue(new Date()).setNumberFormat("dd.mm.yyyy hh:m");
    logSheet.getRange(emptyRow, typeColumn).setValue(level);
    logSheet.getRange(emptyRow, messageColumn).setValue(message);
  }
  
  static error(sApp, message) {
    Log.log(sApp, ERROR_LEVEL_TITLE, message);
  }
  
  static info(sApp, message) {
    Log.log(sApp, INFO_LEVEL_TITTLE, message);
  }
}
