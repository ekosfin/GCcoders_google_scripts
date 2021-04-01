import GlobalUtils from "../TestUtils/GlobalUtils";
import sheet from "../__mocks__/sheet";
import spreadsheetApp from "../__mocks__/spreadsheetApp";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importFile("./RemeoUtils/Constants.js");
  GlobalUtils.importFile("./RemeoUtils/Instance.js");
  GlobalUtils.importFile("./RemeoUtils/Log.js");
  GlobalUtils.importFile("./RemeoUtils/Cell.js");
  GlobalUtils.importFile("./RemeoUtils/Settings.js");
});

afterEach(() => {
  Log.logSheet = undefined;
  Log.tableCache = undefined;
  Settings.tableCache = undefined;
});

describe("Setting utils tests", () => {
  let sApp, mSheet, instance;

  function prepareTest(testTable) {
    const logTable = [
      [TIME_TITLE, TYPE_TITLE, MESSAGE_TITLE],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    sApp = new spreadsheetApp();
    mSheet = new sheet(testTable);
    sApp.addSheet(SETTINGS_SHEET_NAME, mSheet);

    const logSheet = new sheet(logTable);
    sApp.addSheet(LOG_SHEET_NAME, logSheet);
    instance = new Instance();
    instance.sApp = sApp;
    instance.LogInstance.checkCache(sApp, 0);
  }

  describe("Test getByKey", () => {
    test("Test getByKey with one value", () => {
      const testTable = [
        [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
        ["Test setting key", "Test123", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
      ];
      prepareTest(testTable);
      const resultArray = instance.Settings.getByKey("Test setting key");
      expect(resultArray.length).toBe(MAX_PARAMETERS);
      expect(resultArray[0]).toBe("Test123");
    });

    test("Test getByKey with several values", () => {
      const testTable = [
        [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
        ["Test setting key", "Test3", "Test2", "Test1"],
        ["", "", "", ""],
        ["", "", "", ""],
      ];
      prepareTest(testTable);
      const resultArray = instance.Settings.getByKey("Test setting key");
      expect(resultArray[0]).toBe("Test3");
      expect(resultArray[1]).toBe("Test2");
      expect(resultArray[2]).toBe("Test1");
    });

    test("Test getByKey with unordered titles", () => {
      const testTable = [
        [SETTINGS_TITLE, "Arvo #3:", "Arvo #1:", "Arvo #2:"],
        ["Test setting key", "Test3", "Test1", "Test2"],
        ["", "", "", ""],
        ["", "", "", ""],
      ];
      prepareTest(testTable);
      const resultArray = instance.Settings.getByKey("Test setting key");
      expect(resultArray[0]).toBe("Test1");
      expect(resultArray[1]).toBe("Test2");
      expect(resultArray[2]).toBe("Test3");
    });

    test("Test getByKey with missing setting key identifier", () => {
      const testTable = [
        ["", "Arvo #3:", "Arvo #1:", "Arvo #2:"],
        ["Test setting key", "Test3", "Test1", "Test2"],
        ["", "", "", ""],
        ["", "", "", ""],
      ];
      prepareTest(testTable);
      expect(() => {
        instance.Settings.getByKey("Test setting key");
      }).toThrow("Asetusavainten saraketta ei pystytty löytämään.");
    });

    test("Test getByKey with unknown setting", () => {
      const testTable = [
        [SETTINGS_TITLE, "Arvo #3:", "Arvo #1:", "Arvo #2:"],
        ["Unknown setting", "Test3", "Test1", "Test2"],
        ["", "", "", ""],
        ["", "", "", ""],
      ];
      prepareTest(testTable);
      expect(() => {
        instance.Settings.getByKey("Test setting key");
      }).toThrow("Asetusta ei löytynyt");
    });

    describe("Test getCellByKey", () => {
      test("Test getCellByKey normally", () => {
        const testTable = [
          [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
          ["Test setting key", "C", "4", ""],
          ["", "", "", ""],
          ["", "", "", ""],
        ];
        prepareTest(testTable);
        const foundCell = instance.Settings.getCellByKey("Test setting key");
        expect(foundCell.row).toBe(4);
        expect(foundCell.column).toBe(3);
        expect(foundCell.columnLetter).toBe("C");
        expect(foundCell.a1).toBe("C4");
      });

      test("Test getCellByKey with broken data", () => {
        const testTable = [
          [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
          ["Test setting key", "C4", "", ""],
          ["", "", "", ""],
          ["", "", "", ""],
        ];
        prepareTest(testTable);
        expect(() => {instance.Settings.getCellByKey("Test setting key")}).toThrow("Asetuksen:");
      });

      test("Test getCellByKey with empty data", () => {
        const testTable = [
          [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
          ["Test setting key", "", "", ""],
          ["", "", "", ""],
          ["", "", "", ""],
        ];
        prepareTest(testTable);
        expect(() => {instance.Settings.getCellByKey("Test setting key")}).toThrow("Asetuksen:");
      });
    });
  });
});
