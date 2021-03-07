/** @OnlyCurrentDoc */
const MAX_ROWS = 1000;

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu("Remeo")
    .addItem("Avaa muokkaus tila", "ExpandRows")
    .addItem("Sulje muokkaus tila", "CollapseRows")
    .addItem("Tyhjennä taulukko", "CopyTemplate")
    .addItem("Aseta seuraava viikko nykyiseksi", "CopyNextWeekToCurrent")
    .addToUi();
}

function CollapseRows() {
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange(`2:${MAX_ROWS}`).activate();
  spreadsheet.getActiveSheet().collapseAllRowGroups();
}

function ExpandRows() {
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange(`2:${MAX_ROWS}`).activate();
  spreadsheet.getActiveSheet().expandAllRowGroups();
}

function CopyTemplate() {
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getActiveSheet();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).activate();
  spreadsheet
    .getRange("PohjaAlue")
    .copyTo(
      spreadsheet.getActiveRange(),
      SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
      false
    );
}

function CopyNextWeekToCurrent() {
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getSheetByName("Nykyinen viikko");
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).activate();
  spreadsheet
    .getRange("SeuraavaViikkoAlue")
    .copyTo(
      spreadsheet.getActiveRange(),
      SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
      false
    );
}
