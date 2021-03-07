const sApp = SpreadsheetApp.getActiveSpreadsheet();

const endDate = new Date();
// Expand one extra month forward, while updating date information.
endDate.setDate(endDate.getDate() + 31);

// Sheet names can be changed, but order should not be changed!
// Changing the ordering will lead to data loss.
const updateDetails = [{
  sheetName: "Saa",
  dateMode: SheetManagementUtils.DATE_MODE.DAY
}, {
  sheetName: "Läh",
  dateMode: SheetManagementUtils.DATE_MODE.DAY
}, {
  sheetName: "SaaVi",
  dateMode: SheetManagementUtils.DATE_MODE.WEEK
}, {
  sheetName: "LähVi",
  dateMode: SheetManagementUtils.DATE_MODE.WEEK
}, {
  sheetName: "VaVi",
  dateMode: SheetManagementUtils.DATE_MODE.WEEK
}, {
  sheetName: "VaViRa",
  dateMode: SheetManagementUtils.DATE_MODE.WEEK
},{
  sheetName: "SaaKu",
  dateMode: SheetManagementUtils.DATE_MODE.MONTH
}, {
  sheetName: "LähKu",
  dateMode: SheetManagementUtils.DATE_MODE.MONTH
}, {
  sheetName: "VaKu",
  dateMode: SheetManagementUtils.DATE_MODE.MONTH
}, {
  sheetName: "VaKuRa",
  dateMode: SheetManagementUtils.DATE_MODE.MONTH
}];

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
  updateSheetsDateAxis(updateDetails.slice(0, 2));
}

function updateWeeklySheetsDateAxis() {
  updateSheetsDateAxis(updateDetails.slice(2, 6));
}

function updateMonthlySheetsDateAxis() {
  updateSheetsDateAxis(updateDetails.slice(6, 10));
}

function updateSheetsDateAxis(details) {
  details.forEach((detail, _) => {
    const sheet = sApp.getSheetByName(detail.sheetName);
    SheetManagementUtils.populateDatesUntil(sheet, detail.dateMode, endDate);
  });
}

/* expandSheets expands sheets that need expanding to appropriate lengths */
function expandSheets() {
  const expandables = updateDetails.slice(2, 10);
  expandables.forEach((detail, _) => {
    const sheet = sApp.getSheetByName(detail.sheetName);
    SheetManagementUtils.expandSheetRightTo(sheet, detail.dateMode, endDate);
  });
}

/* markCurrentDate changes green line to appropriate place. */
function markCurrentDates() {
  const now = new Date();
  updateDetails.forEach((detail, _) => {
    const sheet = sApp.getSheetByName(detail.sheetName);
    SheetManagementUtils.markCurrentDate(sheet, detail.dateMode, now);
  });
}

/* Grouping helper functions */
function collapseAllGroups() {
  const sheet = sApp.getActiveSheet();
  sheet.getRange(1, 1, sheet.getMaxRows() - 1, sheet.getMaxColumns() - 1).activate();
  sheet.collapseAllColumnGroups();
};

function expandAllGroups() {
  const sheet = sApp.getActiveSheet();
  sheet.getRange(1, 1, sheet.getMaxRows() - 1, sheet.getMaxColumns() - 1).activate();
  sheet.expandAllColumnGroups();
};

/* Maintenance functions */
function resetGroupings() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
     'Oletko varma?',
     'Haluatko varmasti poistaa kaikki ryhmittelyt? Ryhmittelyt luodaan automaattisesti uudelleen päivämäärien päivittämisen yhteydessä.',
      ui.ButtonSet.YES_NO);
  if (result == ui.Button.NO) {
    return;
  }
  
  const cell = RemeoUtils.getCellSettingByKey("Päivämäärien aloitus solu");
  const sheet = sApp.getActiveSheet();
  SheetManagementUtils.resetGrouping(sheet, cell);
}
