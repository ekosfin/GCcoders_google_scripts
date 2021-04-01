import MockDate from "mockdate";
import GlobalUtils from "../TestUtils/GlobalUtils";
import sheet from "../__mocks__/sheet";
import spreadsheetApp from "../__mocks__/spreadsheetApp";

const testTable = [
  ["Log entry #1", "", "", ""],
  ["Log entry #2", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
];

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importFile("./RemeoUtils/Constants.js");
  GlobalUtils.importFile("./RemeoUtils/Log.js");
  GlobalUtils.importFile("./RemeoUtils/Cell.js");
  GlobalUtils.importFile("./RemeoUtils/Settings.js");
  GlobalUtils.importFile("./RemeoUtils/Instance.js");
});

let logInstance;
beforeEach(() => {
  logInstance = new Log();
  logInstance.setSheetName(LOG_SHEET_NAME);
})

afterEach(() => {
  logInstance.logSheet = undefined;
  logInstance.tableCache = undefined;
});

describe("Log utils tests", () => {
  function prepareTest(testTable) {
    const sApp = new spreadsheetApp();
    const mSheet = new sheet(testTable);
    sApp.addSheet(LOG_SHEET_NAME, mSheet);
    logInstance.checkCache(sApp, 0);
    return [sApp, mSheet];
  }
  describe("Test checkCache", () => {
    let mSheet, sApp;
    beforeEach(() => {
      mSheet = new sheet(testTable);
      sApp = new spreadsheetApp();
      sApp.addSheet(LOG_SHEET_NAME, mSheet);
    });

    test("Test checkCache initial caching", () => {
      // Cache should be empty before first call
      expect(logInstance.logSheet).toBe(undefined);
      expect(logInstance.tableCache).toBe(undefined);
      logInstance.checkCache(sApp, 0);

      // After first call cache should be populated
      expect(logInstance.logSheet).toBe(mSheet);
      expect(logInstance.tableCache).not.toBe(undefined);
    });

    test("Test checkCache forced refresh", () => {
      logInstance.checkCache(sApp, 0);

      // Modify table
      logInstance.logSheet.insertRowsAfter(4, 2);

      expect(logInstance.tableCache).toHaveLength(4);

      // Force update cache
      logInstance.checkCache(sApp, 6);
      expect(logInstance.tableCache).toHaveLength(6);
    });
  });

  // Similar to "Test getFirstEmptyRow" tests in Cell.test.js
  describe("Test getFirstEmptyRowInMemory", () => {
    test("Test getFirstEmptyRowInMemory with normal data", () => {
      const testTable = [
        ["Non empty", "", "", ""],
        ["Non empty", "", "", ""],
        ["Non empty", "", "", ""],
        ["", "", "", ""],
      ];
      let sApp, mSheet;
      [sApp, mSheet] = prepareTest(testTable);
      logInstance.checkCache(sApp, 0);
      expect(logInstance.getFirstEmptyRowInMemory(sApp)).toBe(3);
    });

    test("Test getFirstEmptyRowInMemory with empty table", () => {
      const testTable = [
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
      ];
      let sApp, mSheet;
      [sApp, mSheet] = prepareTest(testTable);
      expect(logInstance.getFirstEmptyRowInMemory(sApp)).toBe(0);
    });

    test("Test getFirstEmptyRowInMemory with full table", () => {
      const testTable = [
        ["Full", "", "", ""],
        ["Full", "", "", ""],
        ["Full", "", "", ""],
        ["Full", "", "", ""],
      ];
      let sApp, mSheet;
      [sApp, mSheet] = prepareTest(testTable);
      expect(logInstance.getFirstEmptyRowInMemory(sApp)).toBe(4);
    });
  });

  describe("Test log", () => {
    const date = new Date(2021, 10, 10, 10, 10, 10);
    const dateString = "10.10.2021 10:10";
    const level = "Info";
    const message = "Test message";
    function checkLogRow(row, mSheet) {
      // Is message added to table and cache?
      expect(mSheet.table[row][0]).toBe(dateString);
      expect(mSheet.table[row][1]).toBe(level);
      expect(mSheet.table[row][2]).toBe(message);

      expect(logInstance.tableCache[row][0]).toStrictEqual(date);
      expect(logInstance.tableCache[row][1]).toBe(level);
      expect(logInstance.tableCache[row][2]).toBe(message);
    }

    beforeAll(() => {
      MockDate.set(date);
    });

    test("Test normal logging", () => {
      const testTable = [
        [TIME_TITLE, TYPE_TITLE, MESSAGE_TITLE, ""],
        [
          "09.03.2021 18:50",
          "Info",
          'Piilotettiin sarakkeet 105, 3658 taulukosta: "Saa" onnistuneesti.',
          "",
        ],
        ["", "", "", ""],
        ["", "", "", ""],
      ];
      let sApp, mSheet;
      [sApp, mSheet] = prepareTest(testTable);
      logInstance.log(sApp, level, message);
      checkLogRow(2, mSheet);
    });

    test("Test logging on table that does not have one title", () => {
      const testTable = [
        ["", TYPE_TITLE, MESSAGE_TITLE, ""],
        [
          "09.03.2021 18:50",
          "Info",
          'Piilotettiin sarakkeet 105, 3658 taulukosta: "Saa" onnistuneesti.',
          "",
        ],
        ["", "", "", ""],
        ["", "", "", ""],
      ];
      let sApp, mSheet;
      [sApp, mSheet] = prepareTest(testTable);
      expect(() => {
        logInstance.log(sApp, level, message);
      }).toThrow("Jotakin otsikoista:");
    });

    test("Test table full during logging", () => {
      const testTable = [
        [TIME_TITLE, TYPE_TITLE, MESSAGE_TITLE, ""],
        ["09.03.2021 18:50", "Info", "Test log", ""],
        ["09.03.2021 18:51", "Info", "Test log", ""],
        ["09.03.2021 18:52", "Info", "Test log", ""],
      ];
      let sApp, mSheet;
      [sApp, mSheet] = prepareTest(testTable);
      logInstance.log(sApp, level, message);
      checkLogRow(4, mSheet);
      expect(mSheet.table.length).toBe(4 + LOG_INSERT_EXTRA_ROWS);
    });

    test("Test logging to multiple tables", () => {
      const testTableNormal = [
        [TIME_TITLE, TYPE_TITLE, MESSAGE_TITLE, ""],
        ["09.03.2021 18:50", "Info", "Test log", ""],
        ["09.03.2021 18:51", "Info", "Test log", ""],
        ["", "", "", ""],
      ];
      const testTableExtra = [
        [TIME_TITLE, TYPE_TITLE, MESSAGE_TITLE, ""],
        ["09.03.2021 18:50", "Info", "Test log", ""],
        ["09.03.2021 18:51", "Info", "Test log", ""],
        ["", "", "", ""],
      ];
      const sApp = new spreadsheetApp();
      const mSheetNormal = new sheet(testTableNormal);
      const mSheetExtra = new sheet(testTableExtra);
      sApp.addSheet(LOG_SHEET_NAME, mSheetNormal);
      sApp.addSheet("Extra", mSheetExtra);

      const instanceNormal = new Instance();
      instanceNormal.sApp = sApp;
      const instanceExtra = new Instance();
      instanceExtra.sApp = sApp;
      instanceExtra.setLogSheetName("Extra");

      instanceNormal.Log.info("Normal message");
      instanceExtra.Log.info("Extra message");
      expect(mSheetNormal.table[3][1]).toBe("Info");
      expect(mSheetNormal.table[3][2]).toBe("Normal message");
      expect(mSheetExtra.table[3][1]).toBe("Info");
      expect(mSheetExtra.table[3][2]).toBe("Extra message");
    });
  });
});
