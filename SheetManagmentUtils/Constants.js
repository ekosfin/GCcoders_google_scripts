/* Add functions to date objects in this library */
/***************************************************/
// c

/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
Date.prototype.getWeek = function() {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.epoch-calendar.com */

	const newYear = new Date(this.getFullYear(),0,1);
	let day = newYear.getDay() - 1; //the day of week the year begins on
	day = (day >= 0 ? day : day + 7);
	const daynum = Math.floor((this.getTime() - newYear.getTime() - 
	(this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
	let weeknum;
	//if the year starts before the middle of a week
	if(day < 4) {
		weeknum = Math.floor((daynum+day-1)/7) + 1;
		if(weeknum > 52) {
			nYear = new Date(this.getFullYear() + 1,0,1);
			nday = nYear.getDay() - 1;
			nday = nday >= 0 ? nday : nday + 7;
			/*if the next year starts before the middle of
 			  the week, it is week #1 of that year*/
			weeknum = nday < 4 ? 1 : 53;
		}
	}
	else {
		weeknum = Math.floor((daynum+day-1)/7);
	}
	return weeknum;
};

Date.prototype.getNextMonday = function() {
  // Loop until first day of week
  let newDate = new Date(this);
  while (newDate.getDay() != 1) {
    newDate.setDate(newDate.getDate() + 1);
  }
  return newDate;
}

Date.prototype.getNextMonth = function() {
  // Loop until it is next 1st day of month
  let newDate = new Date(this);
  while (newDate.getDate() != 1) {
    newDate.setDate(newDate.getDate() + 1);
  }
  return newDate;
}
/***************************************************/

var DATE_MODE = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month"
}

const MONTHS = ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu",
                "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"]

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
}

const LAST_DATE_PREFIX = "LAST_DATE_";
const LAST_HIDE_PREFIX = "LAST_HIDE_";

const documentProperties = PropertiesService.getDocumentProperties();
const sApp = SpreadsheetApp.getActiveSpreadsheet();