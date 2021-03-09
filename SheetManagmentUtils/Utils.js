function timeDifferenceInDays(startDate, endDate) {
  const timeDifference = endDate - startDate;
  return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
}

function timeDifferenceInWeeks(startDate, endDate) {
  const timeDifference = endDate - startDate;
  return Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
}

function timeDifferenceInMonths(startDate, endDate) {
  let months;
  months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months += endDate.getMonth() - startDate.getMonth();
  return months;
}

function getColumnAmountByEndDate(dateMode, endDate) {
  initialize();
  switch (dateMode) {
    case DATE_MODE.DAY:
      return timeDifferenceInDays(START_DATE_SETTING, endDate)
    case DATE_MODE.WEEK:
      // Shift start date to first monday
      const startDate = START_DATE_SETTING.getNextMonday();
      return timeDifferenceInWeeks(startDate, endDate)
    case DATE_MODE.MONTH:
      return timeDifferenceInMonths(START_DATE_SETTING, endDate)
  }
}

function checkAndUpdateSpace(sheet, dateMode, endDate) {
  initialize();
  // Plus 1 just to be sure that space is large enough
  const columnsRequired = getColumnAmountByEndDate(dateMode, endDate) + START_DATE_CELL_SETTING.column + 1;
  if (sheet.getMaxColumns() < columnsRequired) {
    const neededAdditionalColumns = columnsRequired - sheet.getMaxColumns();
    sheet.insertColumnsAfter(sheet.getMaxColumns(), neededAdditionalColumns);
    Utils.Log.info(`Lisättiin ${neededAdditionalColumns} saraketta päivämäärien mahduttamiseksi.`);
  }
}

function getCellByDate(dateMode, date) {
  initialize();
  const difference = getColumnAmountByEndDate(dateMode, date);
  const column = START_DATE_CELL_SETTING.column + difference;
  const columnLetter = Utils.Cell.convertColumnIndexToLetter(column);
  const cell = {row: START_DATE_CELL_SETTING.row,
                column: column,
                columnLetter: columnLetter,
                a1: columnLetter + START_DATE_CELL_SETTING.row}
  return cell;
}