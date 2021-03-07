function removeMarkingsFromPrevious_(sheet, dateMode) {
  let lastDate = documentProperties.getProperty(LAST_DATE_PREFIX + sheet.getName());
  if (lastDate == undefined) {
    return;
  }
  lastDate = new Date(lastDate);
  const cell = getCellByDate(dateMode, lastDate);
  const columnLetter = RemeoUtils.convertColumnIndexToLetter(cell.column);
  sheet.getRange(`${columnLetter}${cell.row + 3}:${columnLetter}`).setBackground('#ffffff');
  RemeoUtils.info(`Poistettiin edelliset merkinnät nykyisestä päivästä taulukossa: "${sheet.getName()}".`);
}

function markCurrentDate(sheet, dateMode, now) {
  initialize();
  removeMarkingsFromPrevious_(sheet, dateMode);
  // now = new Date("2021-02-21T01:00:00.000+02:00");
  documentProperties.setProperty(LAST_DATE_PREFIX + sheet.getName(), now);
  const cell = getCellByDate(dateMode, now);
  const columnLetter = RemeoUtils.convertColumnIndexToLetter(cell.column);
  const currentDateColour = RemeoUtils.getSettingByKey("Nykyisen päivän väri")[0];
  sheet.getRange(`${columnLetter}${cell.row + 3}:${columnLetter}`).setBackground(currentDateColour);
  RemeoUtils.info(`Merkittiin nykyinen päivä taulokossa: "${sheet.getName()}".`);
}