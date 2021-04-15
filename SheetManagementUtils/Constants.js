/* Add functions to date objects in this library.
   These function would be better somewhere else,
   but they can't be moved due to App Script restrictions */
/*******************************************************************************************/
// c

// https://github.com/commenthol/weeknumber/blob/master/src/index.js
Date.prototype.getWeek = function() {
  const MINUTE = 60000
  const WEEK = 604800000 // = 7 * 24 * 60 * 60 * 1000 = 7 days in ms
  const tzDiff = (first, second) => (first.getTimezoneOffset() - second.getTimezoneOffset()) * MINUTE

  // day 0 is monday
  const day = (this.getDay() + 6) % 7
  // get thursday of present week
  const thursday = new Date(this);
  thursday.setDate(this.getDate() - day + 3)
  // set 1st january first
  const firstThursday = new Date(thursday.getFullYear(), 0, 1)
  // if Jan 1st is not a thursday...
  if (firstThursday.getDay() !== 4) {
    firstThursday.setMonth(0, 1 + (11 /* 4 + 7 */ - firstThursday.getDay()) % 7)
  }
  const weekNumber = 1 + Math.floor((thursday - firstThursday + tzDiff(firstThursday, thursday)) / WEEK)
  return weekNumber
};

// Return date of next monday, unless current date is monday
Date.prototype.getNextMonday = function() {
  // Loop until first day of week
  let newDate = new Date(this);
  while (newDate.getDay() != 1) {
    newDate.setDate(newDate.getDate() + 1);
  }
  return newDate;
}


// Return date of next month, unless current date is 1 day of the month
Date.prototype.getNextMonth = function() {
  // Loop until it is next 1st day of month
  let newDate = new Date(this);
  while (newDate.getDate() != 1) {
    newDate.setDate(newDate.getDate() + 1);
  }
  return newDate;
}
/*******************************************************************************************/

// Different date modes, that are currently supported
DATE_MODE = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month"
}

// Month names used for printing
MONTHS = ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu",
                "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"]

// Function initializes constants that can be downloaded from the settings
// Constants are lazely donwloaded to speed up start up time, because settings
// operations are expensive.
let INITIALIZED = false;
function initialize() {
  if (INITIALIZED) {
    return
  }
  INITIALIZED = true;
  Utils = new RemeoUtils.Instance();
  WAREHOUSE_START_CELL_SETTING = Utils.Settings.getCellByKey("Varaston arvon solu");
  START_DATE_CELL_SETTING = Utils.Settings.getCellByKey("Päivämäärien aloitus solu");
  START_DATE_SETTING = new Date(Utils.Settings.getDateByKey("Aloitus päivämäärä"));
  CURRENT_DATE_COLOR = Utils.Settings.getByKey("Nykyisen päivän väri")[0];
  REMOVE_FILTERS = Utils.Settings.getByKey("Filttereitä sarakkeeseen asti")[0];
}

LAST_DATE_PREFIX = "LAST_DATE_";
LAST_HIDE_PREFIX = "LAST_HIDE_";

documentProperties = PropertiesService.getDocumentProperties();
sApp = SpreadsheetApp.getActiveSpreadsheet();