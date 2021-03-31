sApp = SpreadsheetApp.getActiveSpreadsheet();
documentProperties = PropertiesService.getDocumentProperties();
Utils = new RemeoUtils.Instance();

/* These values are used for updating different sheets date axes.
   Sheet names can be changed, but order should not be changed!
   Changing the ordering will lead to data loss. */
const UPDATE_DETAILS = [{
  sheetName: "Tuntikirjanpito",
  dateMode: SheetManagementUtils.DATE_MODE.DAY
}, {
  sheetName: "Kustannuslaskenta",
  dateMode: SheetManagementUtils.DATE_MODE.DAY
}, {
  sheetName: "Tuntikirjanpito viikko",
  dateMode: SheetManagementUtils.DATE_MODE.WEEK
}, {
  sheetName: "Tuntikirjanpito kuukausi",
  dateMode: SheetManagementUtils.DATE_MODE.MONTH
}, {
  sheetName: "Kustannuslaskenta viikko",
  dateMode: SheetManagementUtils.DATE_MODE.WEEK
}, {
  sheetName: "Kustannuslaskenta kuukausi",
  dateMode: SheetManagementUtils.DATE_MODE.MONTH
}];