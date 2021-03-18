import GlobalUtils from "../TestUtils/GlobalUtils";
import sheet from "../__mocks__/sheet";
import spreadsheetApp from "../__mocks__/spreadsheetApp";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importFile("./SheetManagementUtils/Constants.js");
  GlobalUtils.importFile("./SheetManagementUtils/GenerateDates.js");
  GlobalUtils.importFile("./SheetManagementUtils/Utils.js");
});

describe("Test GenerateDate", () => {
  const sheetName = "Saa";
  const endDate = new Date("2021-03-01T00:01:00.000+02:00");

  let sApp, mSheet;

  function prepareTest() {
    const sApp = spreadsheetApp.getInstance();

    const settingsTable = [
      [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
      ["Varaston arvon solu", "A", "1", ""],
      ["Päivämäärien aloitus solu", "A", "1", ""],
      ["Aloitus päivämäärä", "2021-01-01T00:01:00.000+02:00", "", ""],
      ["Nykyisen päivän väri", "#b6d7a8", "", ""],
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

    // Initialize constants
    initialize();

    return [sApp, mSheet];
  }

  describe("Test generateDates_", () => {
    test("Test generateDates_ day mode", () => {
      [sApp, mSheet] = prepareTest();
      generateDates_(mSheet, DATE_MODE.DAY, endDate);

      // Make some checks for dates
      expect(mSheet.table[2][0]).toEqual(new Date("2021-01-01T00:01:00.000+02:00"));
      expect(mSheet.table[0][0]).toEqual("Tammikuu/2021");
      expect(mSheet.table[2][3]).toEqual(new Date("2021-01-04T00:01:00.000+02:00"));
      expect(mSheet.table[1][3]).toEqual(1);
      expect(mSheet.table[1][10]).toEqual(2);
      expect(mSheet.table[0][31]).toEqual("Helmikuu");
      expect(mSheet.table[1][31]).toEqual(5);
      expect(mSheet.table[2][59]).toEqual(new Date("2021-03-01T00:01:00.000+02:00"));
    });
  });
});
