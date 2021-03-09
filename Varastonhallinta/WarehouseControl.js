function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('Remeo')
    .addItem("Tuo tiedot Pinjasta", "importPinjaData")
    .addSubMenu(ui.createMenu("Ryhmittely toiminnot")
      .addItem("Sulje kaikki ryhmät", "collapseAllGroups")
      .addItem("Avaa kaikki ryhmät", "expandAllGroups"))
    .addSubMenu(ui.createMenu("Automaattisesti ajettavat toiminnot")
      .addItem("Päivitä päivittäisten taulujen päivät", "updateDailySheetsDateAxis")
      .addItem("Päivitä viikottaisten taulujen päivät", "updateWeeklySheetsDateAxis")
      .addItem("Päivitä kuukausittaisten taulujen päivät", "updateMonthlySheetsDateAxis")
      .addItem("Jatka johdettuja tauluja", "expandSheets")
      .addItem("Merkitse nykyinen päivä", "markCurrentDates"))
    .addSubMenu(ui.createMenu("Huoltovalinnat")
      .addItem("Poista kaikki ryhmittelyt", "resetGroupings"))
    .addToUi();

}

/* Update date axis data.
   There are multiple separate functions to mitigate script time restriction */

function updateDailySheetsDateAxis() {
  updateSheetsDateAxis(UPDATE_DETAILS.slice(0, 2));
}

function updateWeeklySheetsDateAxis() {
  updateSheetsDateAxis(UPDATE_DETAILS.slice(2, 6));
}

function updateMonthlySheetsDateAxis() {
  updateSheetsDateAxis(UPDATE_DETAILS.slice(6, 10));
}

function updateSheetsDateAxis(details) {
  details.forEach((detail, _) => {
    const sheet = sApp.getSheetByName(detail.sheetName);
    SheetManagementUtils.populateDatesUntil(sheet, detail.dateMode, END_DATE);
  });
}

/* expandSheets function expands derived data sheets automatically.
   For example calculations are expanded in SaaVi sheet. */
function expandSheets() {
  const expandables = UPDATE_DETAILS.slice(2, 10);
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

/* Grouping helper functions
   Can be used for collapsing or expanding all groups. */
function collapseAllGroups() {
  const sheet = sApp.getActiveSheet();
  sheet.getRange(1, 1, sheet.getMaxRows() - 1, sheet.getMaxColumns() - 1).activate();
  sheet.collapseAllColumnGroups();
  Utils.Log.info(`Pienennettiin kaikki ryhmät taulukosta: "${sheet.getName()}" onnistuneesti.`);
};

function expandAllGroups() {
  const sheet = sApp.getActiveSheet();
  sheet.getRange(1, 1, sheet.getMaxRows() - 1, sheet.getMaxColumns() - 1).activate();
  sheet.expandAllColumnGroups();
  Utils.Log.info(`Avattiin kaikki ryhmät taulukosta: "${sheet.getName()}" onnistuneesti.`);
};

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
  
  const cell = Utils.Cell.getCellSettingByKey(START_DATE_CELL_SETTING_NAME);
  const sheet = sApp.getActiveSheet();
  SheetManagementUtils.resetGrouping(sheet, cell);
}
