import GlobalUtils from "../TestUtils/GlobalUtils";
import sheet from "../__mocks__/sheet";
import spreadsheetApp from "../__mocks__/spreadsheetApp";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importSheetManagementUtils();
  GlobalUtils.importFile("./SheetManagementUtils/Constants.js");
  GlobalUtils.importFile("./SheetManagementUtils/Utils.js");
  GlobalUtils.importFile("./VarastonHallinta/Constants.js");
  GlobalUtils.importFile("./VarastonHallinta/PinjaImport.js");
});

describe("Test Pinja import", () => {
  let inSheet, outSheet;
  function prepareTest() {
    const sApp = spreadsheetApp.getInstance();

    const settingsTable = [
      [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
      ["Tuotelistan aloitus solu", "A", "1", ""],
      ["Datan aloitus solu", "D", "1", ""],
      ["Päivämäärien aloitus solu", "A", "1", ""],
      ["Varaston arvon solu", "A", "1", ""],
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

    const productList = [
      ["Alite", "", ""],
      ["Betoni", "", ""],
      ["Paperi", "", ""],
      ["", "", ""],
    ];
    const productSheet = new sheet(productList);

    const inTable = [
      new Array(100),
      new Array(100),
      new Array(100),
      new Array(100),
    ];
    inSheet = new sheet(inTable);

    const outTable = [
      new Array(100),
      new Array(100),
      new Array(100),
      new Array(100),
    ];
    outSheet = new sheet(outTable);

    sApp.addSheet(SETTINGS_SHEET_NAME, settingsSheet);
    sApp.addSheet(LOG_SHEET_NAME, logSheet);
    sApp.addSheet(PRODUCT_SHEET_NAME, productSheet);
    sApp.addSheet("Saa", inSheet);
    sApp.addSheet("Läh", outSheet);
    global.sApp = sApp;
    Utils.sApp = sApp;
  }

  beforeEach(() => {
    prepareTest();
  });

  describe("Test getProductList", () => {
    test("Test getProductList with basic product list", () => {
      const productList = getProductList();
      expect(productList).toStrictEqual(["Alite", "Betoni", "Paperi"]);
    });
  });

  describe("Test placePinjaData", () => {
    const importedData = {
      Alite: {
        in: { "Fri, 01 Jan 2021 03:00:00 GMT": 25 },
        out: { "Fri, 01 Jan 2021 03:00:00 GMT": 26 },
      },
      Betoni: {
        in: {
          "Fri, 01 Jan 2021 03:00:00 GMT": 5,
          "Sat, 02 Jan 2021 03:00:00 GMT": 30,
        },
        out: {
          "Fri, 01 Jan 2021 03:00:00 GMT": 3,
          "Sat, 02 Jan 2021 03:00:00 GMT": 31,
        },
      },
      Paperi: {
        in: { "Sat, 02 Jan 2021 03:00:00 GMT": 22.5 },
        out: { "Sat, 02 Jan 2021 03:00:00 GMT": 23.5 },
      },
    };

    test("Test placePinjaData, basic information with in direction", () => {
      // See PinjaImporter.DIRECTIONS.IN
      const direction = "in";
      const productList = ["Alite", "Betoni", "Paperi"];
      placePinjaData(inSheet, direction, productList, importedData);
      expect(inSheet.table[0][0]).toBe(25);
      expect(inSheet.table[1][0]).toBe(5);
      expect(inSheet.table[1][1]).toBe(30);
      expect(inSheet.table[2][1]).toBe(22.5);
    });

    test("Test placePinjaData, basic information with out direction", () => {
      // See PinjaImporter.DIRECTIONS.OUT
      const direction = "out";
      const productList = ["Alite", "Betoni", "Paperi"];
      placePinjaData(outSheet, direction, productList, importedData);
      expect(outSheet.table[0][0]).toBe(26);
      expect(outSheet.table[1][0]).toBe(3);
      expect(outSheet.table[1][1]).toBe(31);
      expect(outSheet.table[2][1]).toBe(23.5);
    });
  });
});
