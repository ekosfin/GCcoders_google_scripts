const TITLE_ROW = 1;
const LOG_SHEET_NAME = "Logi";
const TIME_TITLE = "Aikaleima";
const TYPE_TITLE = "Taso";
const MESSAGE_TITLE = "Viesti";
const ERROR_LEVEL_TITLE = "Virhe";
const INFO_LEVEL_TITTLE = "Info";

const SETTINGS_SHEET_NAME = "Asetukset";
const SETTINGS_TITLE = "Asetus:";
const VALUE_PREFIX = "Arvo #";
const VALUE_POSTFIX = ":";
const MAX_PARAMETERS = 10;

let sApp = SpreadsheetApp.getActive();

// sApp must be only set, if there is currently no open spreadsheets, or
// utilities are used for controlling another spreadsheet
function setSApp(newSApp) {
  sApp = newSApp;
}
// const sApp = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1dLMN0fMfBQdR2A2teI68NjeO0riBzta0ARtTVHLYP7c/edit#gid=565059274");