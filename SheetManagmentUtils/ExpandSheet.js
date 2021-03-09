// Expand sheet formulas to right
function expandSheetRightTo(sheet, dateMode, endDate) {
  initialize();
  checkAndUpdateSpace(sheet, endDate);

  const endCell = getCellByDate(dateMode, endDate);
  const startCellA1 = `${WAREHOUSE_START_CELL_SETTING.a1}:${WAREHOUSE_START_CELL_SETTING.columnLetter}`;
  const endCellA1 = `${WAREHOUSE_START_CELL_SETTING.a1}:${endCell.columnLetter}`;
  sheet.getRange(startCellA1).activate();
  sheet.getActiveRange().autoFill(sheet.getRange(endCellA1), SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
  sheet.getRange(`${WAREHOUSE_START_CELL_SETTING.a1}:${endCell.columnLetter}`).setBackground('#ffffff');
  Utils.Log.info(`Jatkettiin kaavoja taulokossa: "${sheet.getName()}" uuden tiedon mahduttamiseksi.`);
};