// Remove previous current date markings based on the date value stored in the document properties.
function removeMarkingsFromPrevious_(sheet, dateMode) {
  let lastDate = documentProperties.getProperty(
    LAST_DATE_PREFIX + sheet.getName()
  );
  if (lastDate == undefined) {
    return;
  }
  lastDate = new Date(lastDate);
  const cell = getCellByDate(dateMode, lastDate);
  const columnLetter = Utils.Cell.convertColumnIndexToLetter(cell.column);
  sheet
    .getRange(`${columnLetter}${cell.row + 3}:${columnLetter}`)
    .setBackground("#ffffff");
  Utils.Log.info(
    `Poistettiin edelliset merkinnät nykyisestä päivästä taulukossa: "${sheet.getName()}".`
  );
}

function markCurrentDate(sheet, dateMode, now) {
  initialize();
  removeMarkingsFromPrevious_(sheet, dateMode);
  // Update previous date storage value
  documentProperties.setProperty(LAST_DATE_PREFIX + sheet.getName(), now);
  const cell = getCellByDate(dateMode, now);
  const columnLetter = Utils.Cell.convertColumnIndexToLetter(cell.column);
  sheet
    .getRange(`${columnLetter}${cell.row + 3}:${columnLetter}`)
    .setBackground(CURRENT_DATE_COLOR);
  Utils.Log.info(`Merkittiin nykyinen päivä taulokossa: "${sheet.getName()}".`);
}
