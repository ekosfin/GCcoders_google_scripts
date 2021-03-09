/* These functions are used for manual testing */

function testPopulateDatesUntil() {
  const sheet = sApp.getSheetByName("VaKuRa");
  const endDate = new Date("2021-2-27");
  SheetManagementUtils.populateDatesUntil(sheet, SheetManagementUtils.DATE_MODE.MONTH, endDate);
}

function testExpandSheet() {
  const sheet = sApp.getSheetByName("VaKu");
  const endDate = new Date("2031-1-1");
  SheetManagementUtils.checkAndUpdateSpace(sheet, SheetManagementUtils.DATE_MODE.MONTH, endDate);
}

function testMarkCurrentDate() {
  const sheet = sApp.getSheetByName("SaaVi");
  SheetManagementUtils.markCurrentDate(sheet, SheetManagementUtils.DATE_MODE.WEEK);

}

function testExpandSheetRightFrom() {
  const sheet = sApp.getSheetByName("Saa Vi");
  const endDate = new Date("2021-5-30");
  SheetManagementUtils.expandSheetRightTo(sheet, SheetManagementUtils.DATE_MODE.WEEK, endDate);
  sheet.getMaxColumns
}

function testResetGrouping() {
  const cell = Utils.Settings.getCellSettingByKey("Päivämäärien aloitus solu");
  const sheet = sApp.getSheetByName("Saa Vi");
  SheetManagementUtils.resetGrouping(sheet, cell);
}