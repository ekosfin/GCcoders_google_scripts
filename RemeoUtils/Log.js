function log(level, message) {
  const logSheet = sApp.getSheetByName(LOG_SHEET_NAME);
  const emptyRow = getFirstEmptyRow(logSheet);
  const timeColumn = getColumnByTitle(logSheet, TIME_TITLE, TITLE_ROW);
  const typeColumn = getColumnByTitle(logSheet, TYPE_TITLE, TITLE_ROW);
  const messageColumn = getColumnByTitle(logSheet, MESSAGE_TITLE, TITLE_ROW);
  logSheet.getRange(emptyRow, timeColumn).setValue(new Date()).setNumberFormat("dd.mm.yyyy hh:m");
  logSheet.getRange(emptyRow, typeColumn).setValue(level);
  logSheet.getRange(emptyRow, messageColumn).setValue(message);
}

function error(message) {
  log(ERROR_LEVEL_TITLE, message);
}

function info(message) {
  log(INFO_LEVEL_TITTLE, message);
}