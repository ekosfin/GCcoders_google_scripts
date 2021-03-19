const END_DATE = new Date();
const START_DATE_CELL_SETTING_NAME = "Päivämäärien aloitus solu";

// Expand one extra month forward, while updating date information.
END_DATE.setDate(END_DATE.getDate() + 31);

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('Remeo')
    .addSubMenu(ui.createMenu("Automaattisesti ajettavat toiminnot")
      .addItem("Päivitä taulujen päivät", "updateSheetsDateAxis")
      .addItem("Jatka johdettuja tauluja", "expandSheets")
      .addItem("Merkitse nykyinen päivä", "markCurrentDates")
      .addItem("Tarkista ja lähetä viestit tarkastusten vanhenemisesta", "checkServiceOverdue"))
    .addSubMenu(ui.createMenu("Huoltovalinnat")
      .addItem("Poista kaikki ryhmittelyt", "resetGroupings"))
    .addToUi();

}

/* Update date axis data.
   There are multiple separate functions to mitigate script time restriction */

function updateSheetsDateAxis() {
  UPDATE_DETAILS.forEach((detail, _) => {
    const sheet = sApp.getSheetByName(detail.sheetName);
    SheetManagementUtils.populateDatesUntil(sheet, detail.dateMode, END_DATE);
  });
}

/* expandSheets function expands derived data sheets automatically.
   For example calculations are expanded in SaaVi sheet. */
function expandSheets() {
  const expandables = UPDATE_DETAILS.slice(2, 6);
  expandables.forEach((detail, _) => {
    const sheet = sApp.getSheetByName(detail.sheetName);
    SheetManagementUtils.expandSheetRightTo(sheet, detail.dateMode, END_DATE);
  });
}

/* markCurrentDate updates green line to current date. */
function markCurrentDates() {
  const now = new Date();
  UPDATE_DETAILS.forEach((detail, _) => {
    const sheet = sApp.getSheetByName(detail.sheetName);
    SheetManagementUtils.markCurrentDate(sheet, detail.dateMode, now);
  });
}

/* Maintenance functions
   resetGroupings function removes all groups from a sheet. */
function resetGroupings() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
     'Oletko varma?',
     'Haluatko varmasti poistaa kaikki ryhmittelyt? Ryhmittelyt luodaan automaattisesti uudelleen päivämäärien päivittämisen yhteydessä.',
      ui.ButtonSet.YES_NO);
  if (result == ui.Button.NO) {
    return;
  }
  
  const cell = Utils.Settings.getCellByKey(START_DATE_CELL_SETTING_NAME);
  const sheet = sApp.getActiveSheet();
  SheetManagementUtils.resetGrouping(sheet, cell);
}

function expandTables() {
  UPDATE_DETAILS.forEach((detail, _) => {
    const endDate = new Date(2031, 1, 1);
    const sheet = sApp.getSheetByName(detail.sheetName);
    SheetManagementUtils.checkAndUpdateSpace(sheet, detail.dateMode, endDate);
  });
}