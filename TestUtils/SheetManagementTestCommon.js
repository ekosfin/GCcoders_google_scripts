import sheet from "../__mocks__/sheet";
import spreadsheetApp from "../__mocks__/spreadsheetApp";

export default class SheetManagementTestCommon {
  // Create test environment by generating mocked objects for
  // sheet, log, settings.
  static prepareTest() {
    const sheetName = "Saa";
    const sApp = spreadsheetApp.getInstance();

    const settingsTable = [
      [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
      ["Varaston arvon solu", "A", "1", ""],
      ["Päivämäärien aloitus solu", "A", "1", ""],
      ["Aloitus päivämäärä", "2021-01-01T00:01:00.000+02:00", "", ""],
      ["Nykyisen päivän väri", "#b6d7a8", "", ""],
      ["Poista filterit sarakkeeseen asti", "0"],
    ];
    const settingsSheet = new sheet(settingsTable);

    const logTable = [
      [TIME_TITLE, TYPE_TITLE, MESSAGE_TITLE],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    const logSheet = new sheet(logTable);

    const emptyTable = Array(100);
    for (let row = 0; row < emptyTable.length; row++) {
      emptyTable[row] = Array(100);
    }

    const mSheet = new sheet(emptyTable);
    sApp.addSheet(sheetName, mSheet);
    sApp.addSheet(SETTINGS_SHEET_NAME, settingsSheet);
    sApp.addSheet(LOG_SHEET_NAME, logSheet);

    // Manually modify SheetManagementUtils sApp to current
    global.sApp = sApp;

    // Force reinitialize constants
    global.INITIALIZED = false;
    initialize();

    // Reset log caches
    Utils.LogInstance.logSheet = undefined;
    Utils.LogInstance.tableCache = undefined;

    return [sApp, mSheet];
  }
}
