/* Even though it may sound silly, this file should be kept 
  above 'RestAPI.gs' in the Apps Script files. Otherwise the 
  constants won't be included in the API's namespace. */

SCHEDULE_SHEET_NAME = "Nykyinen viikko";
CONFIG_SHEET_NAME = "Kuljettajat & kohteet";
LOG_SHEET_NAME = "REST Logi";

// The script needs to be deployed in the sheet's context
sApp = SpreadsheetApp.getActiveSpreadsheet();
Utils = new RemeoUtils.Instance();
Utils.setSApp(sApp);
Utils.setLogSheetName(LOG_SHEET_NAME);

API_KEY = "REPLACE_API_KEY";

scheduleSheet = sApp.getSheetByName(SCHEDULE_SHEET_NAME);
materialSheet = sApp.getSheetByName(CONFIG_SHEET_NAME);
// range = scheduleSheet.getRange(1, 1, scheduleSheet.getMaxRows(), scheduleSheet.getMaxColumns());
// materialRange = materialSheet.getRange(1, 1, scheduleSheet.getMaxRows(), scheduleSheet.getMaxColumns());