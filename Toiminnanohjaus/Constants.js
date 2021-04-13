/* Even though it may sound silly, this file should be kept 
  above 'RestAPI.gs' in the Apps Script files. Otherwise the 
  constants won't be included in the API's namespace. */

SCHEDULE_SHEET_NAME = "Nykyinen viikko";
CONFIG_SHEET_NAME = "Kuljettajat & kohteet";
LOG_SHEET_NAME = "REST Logi";

// The script needs to be deployed in the sheet's context
sApp = SpreadsheetApp.getActiveSpreadsheet();
scheduleSheet = sApp.getSheetByName(SCHEDULE_SHEET_NAME);
configSheet = sApp.getSheetByName(CONFIG_SHEET_NAME);
Utils = new RemeoUtils.Instance();
Utils.setSApp(sApp);
Utils.setLogSheetName(LOG_SHEET_NAME);

// The maximum number of deliveries per day/material
MAX_DELIVERIES = Utils.Settings.getByKey("Kuljetuksia päivässä")[0];

API_KEY = "REPLACE_API_KEY";