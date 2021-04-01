// Reset grouping is used for removing all grouping from specified cell onwards
function resetGrouping(sheet, startCell) {
  for (let column = startCell.column; column < sheet.getMaxColumns(); column++) {
    while (groupDepth = sheet.getColumnGroupDepth(column) > 0) {
      const columnGroup = sheet.getColumnGroup(column, groupDepth);
      columnGroup.remove();
    }
  }
  Utils.Log.info(`Poistettiin kaikki ryhmittelyt taulukosta: "${sheet.getName()}".`);
}

// Generate new date axis based on the sheet, date mode and end date
function generateDates_(sheet, dateMode, endDate) {
  // getColumnAmountByEndDate calculates column need strictly based on time difference
  // However even if the time difference is 0, there should be at least one column for that
  // specific date. Thus plus 1 is required here.
  const dateAmount = getColumnAmountByEndDate(dateMode, endDate) + 1;
  // Change amount is calculated dynamically with months (mounths don't have fixed length),
  // So only week requires change amount 7.
  const changeAmount = (dateMode == DATE_MODE.WEEK) ? 7: 1;

  // Generate big enough matrix for all data based on the date amount.
  const sheetData = new Array(3);
  for (let index = 0; index < sheetData.length; index++) {
    sheetData[index] = new Array(dateAmount);
  }

  let date = new Date(START_DATE_SETTING);
  // If mode is week, start from the first full week
  if (dateMode == DATE_MODE.WEEK) {
    date = date.getNextMonday();
  }

  // Initialize date 1 day earlier, so loop will stay consistent and
  // does not require special treatment for a first date.
  date.setDate(date.getDate() - changeAmount);

  // Memory for common printing and grouping function that are separated from main function
  // to make function more comprehensive.
  let memory;

  // Go through the dates
  for (let index = 0; index < dateAmount; index++) {
    date.setDate(date.getDate() + changeAmount);
    // Move date to next month if generating dates by month.
    if (dateMode == DATE_MODE.MONTH) {
      date = date.getNextMonth();
    }

    // Print appropriate date, month, week and year data.
    memory = handleWeekMonthYearChanges_(date, index, memory, sheetData);
  }
  // Create year grouping only, if month mode is active.
  if (dateMode == DATE_MODE.MONTH) {
    updateGrouping_(sheet, memory.yearGroupColumns, 1);
  } else {
    updateGrouping_(sheet, memory.monthGroupColumns, 1);
    updateGrouping_(sheet, memory.yearGroupColumns, 2);
  }

  // Update new changes to the sheet.
  sheet.getRange(START_DATE_CELL_SETTING.row, START_DATE_CELL_SETTING.column, 3, dateAmount).setValues(sheetData);
}

// Closely related to generateDates_
function handleWeekMonthYearChanges_(date, index, memory, sheetData) {
  // If memory is uninitialized initialize it
  /* Memory contains structure that is like following:
      {
        previousMonth: 5,
        monthGroupColumns: [1, 31, 60],
        previousYear: 2021,
        yearGroupColumns: [1, 365]
      }
  */
  if (memory == undefined) {
    memory = {previousMonth: undefined, monthGroupColumns: [],
              previousYear: undefined, yearGroupColumns: []};
  }

  // Write date to third row
  sheetData[2][index] = new Date(date);
  // Print week number, if it is monday
  if (date.getDay() == 1) {
    sheetData[1][index] = date.getWeek();
  }

  // Print month, if month has changed
  if (date.getMonth() != memory.previousMonth) {
    memory.previousMonth = date.getMonth();
    sheetData[0][index] = MONTHS[date.getMonth()];
    memory.monthGroupColumns.push(START_DATE_CELL_SETTING.column + index);
  }

  // Print year, if year has changed
  if (date.getFullYear() != memory.previousYear) {
    memory.previousYear = date.getFullYear();
    memory.yearGroupColumns.push(START_DATE_CELL_SETTING.column + index);
    sheetData[0][index] += "/" + date.getFullYear();
  }
  return memory
}

// Create groups between two values in the list
function updateGrouping_(sheet, columns, maxDepth) {
  for (let index = 1; index < columns.length; index++) {
      if (sheet.getColumnGroupDepth(columns[index - 1] + 1) >= maxDepth) {
        continue
      }
      const firstColumn = Utils.Cell.convertColumnIndexToLetter(columns[index - 1] + 1);
      const lastColumn = Utils.Cell.convertColumnIndexToLetter(columns[index] - 1);
      sheet.getRange(`${firstColumn}:${lastColumn}`).shiftColumnGroupDepth(1);
  }
}

// Show new cells
function expandPreviousHiding_(sheet, columnsRequired) {
  let previousHiding = parseInt(documentProperties.getProperty(LAST_HIDE_PREFIX + sheet.getName()));
  if (previousHiding && columnsRequired < sheet.getMaxColumns()) {
    // If nothing new will be shown
    if (columnsRequired - previousHiding <= 0) {
      return;
    }
    sheet.showColumns(previousHiding, columnsRequired);
  } else {
    sheet.showColumns(1, sheet.getMaxColumns());
  }
  documentProperties.setProperty(LAST_HIDE_PREFIX + sheet.getName(), columnsRequired + 1);
}

// Hide cells that are not needed yet. Extra cells are generated uppfront,
// because extra cells can be used for automatic graph updates.
function hideUnusedColumns_(sheet, dateMode, endDate) {
  const columnsRequired = getColumnAmountByEndDate(dateMode, endDate) + START_DATE_CELL_SETTING.column;
  expandPreviousHiding_(sheet, columnsRequired);
  sheet.hideColumns(columnsRequired + 1, sheet.getMaxColumns() - columnsRequired);
  Utils.Log.info(`Piilotettiin sarakkeet ${columnsRequired + 1}, ${sheet.getMaxColumns()} taulukosta: "${sheet.getName()}" onnistuneesti.`);
}

// Verifies that there is enough space for new dates, generates dates and hide unused space.
function populateDatesUntil(sheet, dateMode, endDate) {
  initialize();
  checkAndUpdateSpace(sheet, dateMode, endDate);
  generateDates_(sheet, dateMode, endDate);
  hideUnusedColumns_(sheet, dateMode, endDate);
  Utils.Log.info(`Päivitettiin päivä tiedot taulukossa "${sheet.getName()}"`);
}
