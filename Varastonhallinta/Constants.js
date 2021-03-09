const sApp = SpreadsheetApp.getActiveSpreadsheet();
const Utils = new RemeoUtils.Instance();

const END_DATE = new Date();
// Expand one extra month forward, while updating date information.
END_DATE.setDate(END_DATE.getDate() + 31);

// Sheet names can be changed, but order should not be changed!
// Changing the ordering will lead to data loss.
const UPDATE_DETAILS = [{
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