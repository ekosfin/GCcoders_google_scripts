function resetGrouping(sheet, startCell) {
  for (let column = startCell.column; column < sheet.getMaxColumns(); column++) {
    while (groupDepth = sheet.getColumnGroupDepth(column) > 0) {
      const columnGroup = sheet.getColumnGroup(column, groupDepth);
      columnGroup.remove();
    }
  }
}

function generateDates_(sheet, dateMode, endDate) {
  // getColumnAmountByEndDate calculates column need strictly based on time difference
  // However even if the time difference is 0, there should be at least one column for that
  // specific date. Thus plus 1 is required here.
  const dateAmount = getColumnAmountByEndDate(dateMode, endDate) + 1;
  // Change amount is calculated dynamically with months.
  // So only week requires change amount 7
  const changeAmount = (dateMode == DATE_MODE.WEEK) ? 7: 1;

  // Generate big enough matrix for all data
  const sheetData = new Array(3);
  for (let index = 0; index < sheetData.length; index++) {
    sheetData[index] = new Array(dateAmount);
  }

  let date = new Date(START_DATE_SETTING);
  // If mode is week, start from the first full week
  if (dateMode == DATE_MODE.WEEK) {
    date = date.getNextMonday();
  }

  // Initialize date earlier, so loop will stay consistent.
  date.setDate(date.getDate() - changeAmount);

  // Memory for common printing and grouping function.
  let memory;

  for (let index = 0; index < dateAmount; index++) {
    date.setDate(date.getDate() + changeAmount);
    // Move date to next month if generating dates by month
    if (dateMode == DATE_MODE.MONTH) {
      date = date.getNextMonth();
    }

    memory = handleWeekMonthYearChanges_(date, index, memory, sheetData);
  }
  // Make year grouping only if month mode is active
  if (dateMode == DATE_MODE.MONTH) {
    updateGrouping_(sheet, memory.yearGroupColumns, 1);
  } else {
    updateGrouping_(sheet, memory.monthGroupColumns, 1);
    updateGrouping_(sheet, memory.yearGroupColumns, 2);
  }
  sheet.getRange(START_DATE_CELL_SETTING.row, START_DATE_CELL_SETTING.column, 3, dateAmount).setValues(sheetData);
}

// Closely related to generateDates_
function handleWeekMonthYearChanges_(date, index, memory, sheetData) {
  // If memory is uninitialized initialize it
  if (memory == undefined) {
    memory = {previousMonth: undefined, monthGroupColumns: [],
              previousYear: undefined, yearGroupColumns: []};
  }

  // Set date value to third row at specific index
  sheetData[2][index] = new Date(date);

  // Print also week number, if it is monday
  if (date.getDay() == 1) {
    sheetData[1][index] = date.getWeek();
  }

  // Print also month, if month has changed
  if (date.getMonth() != memory.previousMonth) {
    memory.previousMonth = date.getMonth();
    sheetData[0][index] = MONTHS[date.getMonth()];
    memory.monthGroupColumns.push(START_DATE_CELL_SETTING.column + index);
  }

  // Print also year, if year has changed
  if (date.getFullYear() != memory.previousYear) {
    memory.previousYear = date.getFullYear();
    memory.yearGroupColumns.push(START_DATE_CELL_SETTING.column + index);
    sheetData[0][index] += "/" + date.getFullYear();
  }
  return memory
}

function updateGrouping_(sheet, columns, maxDepth) {
  for (let index = 1; index < columns.length; index++) {
      if (sheet.getColumnGroupDepth(columns[index - 1] + 1) >= maxDepth) {
        continue
      }
      const firstColumn = RemeoUtils.convertColumnIndexToLetter(columns[index - 1] + 1);
      const lastColumn = RemeoUtils.convertColumnIndexToLetter(columns[index] - 1);
      sheet.getRange(`${firstColumn}:${lastColumn}`).shiftColumnGroupDepth(1);
  }
}

// Show new cells
function expandPreviousHiding_(sheet, columnsRequired) {
  let previousHiding = parseInt(documentProperties.getProperty(LAST_HIDE_PREFIX + sheet.getName()));
  if (previousHiding && columnsRequired < sheet.getMaxColumns()) {
    // If nothing new will be shown
    if (columnsRequired - previousHiding) {
      return;
    }
    sheet.showColumns(previousHiding, columnsRequired);
  } else {
    sheet.showColumns(1, sheet.getMaxColumns());
  }
}

// Hide cells that are not needed yet
function hideUnusedColumns_(sheet, dateMode, endDate) {
  const columnsRequired = getColumnAmountByEndDate(dateMode, endDate) + START_DATE_CELL_SETTING.column;
  expandPreviousHiding_(sheet, columnsRequired);
  documentProperties.setProperty(LAST_HIDE_PREFIX + sheet.getName(), columnsRequired + 1);
  sheet.hideColumns(columnsRequired + 1, sheet.getMaxColumns() - columnsRequired )
}

/**
 * Populates dates until specific date
 *
 * @param {object} Sheet, where the dates should be populated
 * @param {date} Final date that should be populated in the sheets
 * @return {void}
 */

function populateDatesUntil(sheet, dateMode, endDate) {
  initialize();
  checkAndUpdateSpace(sheet, endDate);
  generateDates_(sheet, dateMode, endDate);
  hideUnusedColumns_(sheet, dateMode, endDate);
  RemeoUtils.info(`Päivitettiin päivä tiedot taulukossa "${sheet.getName()}"`);
}
