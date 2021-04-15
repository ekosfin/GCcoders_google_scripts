/* Even though it may sound silly, this file should be kept 
  above 'RestAPI.gs' in the Apps Script files. Otherwise the 
  constants won't be included in the API's namespace. */

SCHEDULE_SHEET_NAME = "Nykyinen viikko";
CONFIG_SHEET_NAME = "Kuljettajat & kohteet";
LOG_SHEET_NAME = "REST Logi";

// The script needs to be deployed in the sheet's context
sApp = SpreadsheetApp.getActiveSpreadsheet();

// Function initializes constants that can be downloaded from the settings
// Constants are lazily donwloaded to speed up start up time, because settings
// operations are expensive.
let INITIALIZED = false;
function initialize() {
  if (INITIALIZED) {
    return
  }
  INITIALIZED = true;
  Utils = new RemeoUtils.Instance();
  Utils.setLogSheetName(LOG_SHEET_NAME);
  // The maximum number of deliveries per day/material
  MAX_DELIVERIES = Utils.Settings.getByKey("Kuljetuksia päivässä")[0];
}

API_KEY = "REPLACE_API_KEY";