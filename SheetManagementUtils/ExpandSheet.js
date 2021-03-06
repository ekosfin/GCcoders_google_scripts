function removeFilterCriterias(sheet) {
  let filters = [];
  for (let column = 1; column <= REMOVE_FILTERS; column++) {
    try {
      filters.push(sheet.getFilter().getColumnFilterCriteria(column));
      sheet.getFilter().removeColumnFilterCriteria(column);
    } catch (err) {
      Utils.Log.error(`Taulukon: ${sheet.getName()} filteriä ei voitu poistaa käytöstä sarakkeessa ${column}`);
    }
  }
  return filters
}

function restoreFilterCriterias(sheet, filters) {
  for (let column = 1; column <= REMOVE_FILTERS; column++) {
    try {
      sheet.getFilter().setColumnFilterCriteria(column, filters[column - 1]);
    } catch (err) {
      Utils.Log.error(`Taulukon: ${sheet.getName()} filteriä ei voitu palauttaa sarakkeessa ${column}`);
    }
  }
}

// Expand sheet formulas to right
function expandSheetRightTo(sheet, dateMode, endDate) {
  initialize();
  checkAndUpdateSpace(sheet, endDate);
  const filters = removeFilterCriterias(sheet);

  const endCell = getCellByDate(dateMode, endDate);
  const startCellA1 = `${WAREHOUSE_START_CELL_SETTING.a1}:${WAREHOUSE_START_CELL_SETTING.columnLetter}`;
  const endCellA1 = `${WAREHOUSE_START_CELL_SETTING.a1}:${endCell.columnLetter}`;
  sheet.getRange(startCellA1).activate();
  sheet.getActiveRange().autoFill(sheet.getRange(endCellA1), SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
  sheet.getRange(`${WAREHOUSE_START_CELL_SETTING.a1}:${endCell.columnLetter}`).setBackground('#ffffff');
  restoreFilterCriterias(sheet, filters);
  Utils.Log.info(`Jatkettiin kaavoja taulokossa: "${sheet.getName()}" uuden tiedon mahduttamiseksi.`);
};