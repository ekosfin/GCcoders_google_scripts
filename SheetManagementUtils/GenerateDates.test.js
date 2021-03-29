import { jest } from "@jest/globals";
import GlobalUtils from "../TestUtils/GlobalUtils";
import TestCommon from "../TestUtils/SheetManagementTestCommon";
import sheet from "../__mocks__/sheet";
import range from "../__mocks__/range";
import propertiesService from "../__mocks__/propertiesService";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importFile("./SheetManagementUtils/Constants.js");
  GlobalUtils.importFile("./SheetManagementUtils/GenerateDates.js");
  GlobalUtils.importFile("./SheetManagementUtils/Utils.js");
});

describe("Test GenerateDate", () => {
  const endDate = new Date("2021-03-01T00:01:00.000+02:00");

  let sApp, mSheet;

  beforeEach(() => {
    [sApp, mSheet] = TestCommon.prepareTest();
  });

  describe("Test generateDates_", () => {
    test("Test generateDates_ day mode", () => {
      generateDates_(mSheet, DATE_MODE.DAY, endDate);

      // Make some checks for dates
      expect(mSheet.table[2][0]).toEqual(
        new Date("2021-01-01T00:01:00.000+02:00")
      );
      expect(mSheet.table[0][0]).toEqual("Tammikuu/2021");
      expect(mSheet.table[2][3]).toEqual(
        new Date("2021-01-04T00:01:00.000+02:00")
      );
      expect(mSheet.table[1][3]).toEqual(1);
      expect(mSheet.table[1][10]).toEqual(2);
      expect(mSheet.table[0][31]).toEqual("Helmikuu");
      expect(mSheet.table[1][31]).toEqual(5);
      expect(mSheet.table[2][59]).toEqual(
        new Date("2021-03-01T00:01:00.000+02:00")
      );
    });

    test("Test generateDates_ week mode", () => {
      generateDates_(mSheet, DATE_MODE.WEEK, endDate);

      // Make some checks for dates
      expect(mSheet.table[2][0]).toEqual(
        new Date("2021-01-04T00:01:00.000+02:00")
      );
      expect(mSheet.table[0][0]).toEqual("Tammikuu/2021");
      expect(mSheet.table[2][1]).toEqual(
        new Date("2021-01-11T00:01:00.000+02:00")
      );
      expect(mSheet.table[2][2]).toEqual(
        new Date("2021-01-18T00:01:00.000+02:00")
      );
      expect(mSheet.table[2][3]).toEqual(
        new Date("2021-01-25T00:01:00.000+02:00")
      );
      expect(mSheet.table[2][4]).toEqual(
        new Date("2021-02-01T00:01:00.000+02:00")
      );
      expect(mSheet.table[1][0]).toEqual(1);
      expect(mSheet.table[1][1]).toEqual(2);
      expect(mSheet.table[1][2]).toEqual(3);
      expect(mSheet.table[1][3]).toEqual(4);
      expect(mSheet.table[1][4]).toEqual(5);
      expect(mSheet.table[0][4]).toEqual("Helmikuu");
      expect(mSheet.table[2][8]).toEqual(
        new Date("2021-03-01T00:01:00.000+02:00")
      );
    });

    test("Test generateDates_ month mode", () => {
      generateDates_(mSheet, DATE_MODE.MONTH, endDate);

      // Make some checks for dates
      expect(mSheet.table[2][0]).toEqual(
        new Date("2021-01-01T00:01:00.000+02:00")
      );
      expect(mSheet.table[2][1]).toEqual(
        new Date("2021-02-01T00:01:00.000+02:00")
      );
      expect(mSheet.table[2][2]).toEqual(
        new Date("2021-03-01T00:01:00.000+02:00")
      );
      expect(mSheet.table[0][0]).toEqual("Tammikuu/2021");
      expect(mSheet.table[0][1]).toEqual("Helmikuu");
      expect(mSheet.table[0][2]).toEqual("Maaliskuu");
      expect(mSheet.table[1][1]).toEqual(5);
      expect(mSheet.table[1][2]).toEqual(9);
    });
  });

  describe("Test generateDates_", () => {
    let sheetData;
    beforeEach(() => {
      const columns = 15;
      const rows = 3;
      sheetData = new Array(rows);
      for (let row = 0; row < rows; row++) {
        sheetData[row] = new Array(columns);
      }
    });

    test("Test handleWeekMonthYearChanges_ write day information", () => {
      const date = new Date("2021-01-01T00:00:00.000+00:00");
      const memory = handleWeekMonthYearChanges_(date, 0, undefined, sheetData);
      expect(memory).toEqual({
        previousMonth: 0,
        monthGroupColumns: [1],
        previousYear: 2021,
        yearGroupColumns: [1],
      });
      expect(sheetData[2][0]).toEqual(date);
    });

    test("Test handleWeekMonthYearChanges_ write week information", () => {
      const date = new Date("2021-01-04T00:00:00.000+00:00");
      const memory = handleWeekMonthYearChanges_(date, 0, undefined, sheetData);
      expect(memory).toEqual({
        previousMonth: 0,
        monthGroupColumns: [1],
        previousYear: 2021,
        yearGroupColumns: [1],
      });
      expect(sheetData[1][0]).toEqual(1);
    });

    test("Test handleWeekMonthYearChanges_ write month / year information", () => {
      const date = new Date("2021-01-01T00:00:00.000+00:00");
      const memory = handleWeekMonthYearChanges_(date, 0, undefined, sheetData);
      expect(memory).toEqual({
        previousMonth: 0,
        monthGroupColumns: [1],
        previousYear: 2021,
        yearGroupColumns: [1],
      });
      expect(sheetData[0][0]).toEqual("Tammikuu/2021");
    });

    test("Test handleWeekMonthYearChanges_ month grouping", () => {
      const monthStart = new Date("2021-01-01T00:00:00.000+00:00");
      const monthEnd = new Date("2021-02-01T00:00:00.000+00:00");
      let memory = handleWeekMonthYearChanges_(
        monthStart,
        0,
        undefined,
        sheetData
      );
      memory = handleWeekMonthYearChanges_(monthEnd, 1, memory, sheetData);
      expect(memory).toEqual({
        previousMonth: 1,
        monthGroupColumns: [1, 2],
        previousYear: 2021,
        yearGroupColumns: [1],
      });
    });

    test("Test handleWeekMonthYearChanges_ year grouping", () => {
      const monthStart = new Date("2021-01-01T00:00:00.000+00:00");
      const monthEnd = new Date("2022-01-01T00:00:00.000+00:00");
      let memory = handleWeekMonthYearChanges_(
        monthStart,
        0,
        undefined,
        sheetData
      );
      memory = handleWeekMonthYearChanges_(monthEnd, 1, memory, sheetData);
      expect(memory).toEqual({
        previousMonth: 0,
        monthGroupColumns: [1],
        previousYear: 2022,
        yearGroupColumns: [1, 2],
      });
    });

    test("Test handleWeekMonthYearChanges_ series of days", () => {
      const date = new Date("2021-01-01T00:00:00.000+00:00");
      let memory;
      for (let index = 0; index < 366; index++) {
        memory = handleWeekMonthYearChanges_(date, index, memory, sheetData);
        date.setDate(date.getDate() + 1);
      }

      expect(memory).toEqual({
        previousMonth: 0,
        monthGroupColumns: [
          1,
          32,
          60,
          91,
          121,
          152,
          182,
          213,
          244,
          274,
          305,
          335,
          366,
        ],
        previousYear: 2022,
        yearGroupColumns: [1, 366],
      });
    });

    test("Test handleWeekMonthYearChanges_ series of weeks", () => {
      const date = new Date("2021-01-04T00:00:00.000+00:00");
      let memory;
      for (let index = 0; index < 53; index++) {
        memory = handleWeekMonthYearChanges_(date, index, memory, sheetData);
        date.setDate(date.getDate() + 7);
      }

      expect(memory).toEqual({
        previousMonth: 0,
        monthGroupColumns: [1, 5, 9, 14, 18, 23, 27, 31, 36, 40, 44, 49, 53],
        previousYear: 2022,
        yearGroupColumns: [1, 53],
      });
    });
  });

  describe("Test updateGrouping_", () => {
    test("Test updateGrouping_ with a basic column list", () => {
      const spySheet = jest.spyOn(sheet.prototype, "getRange");
      const spyRange = jest.spyOn(range.prototype, "shiftColumnGroupDepth");

      const columnGroupList = [1, 5, 8, 15, 20];
      updateGrouping_(mSheet, columnGroupList, 1);

      expect(spySheet).toHaveBeenCalledTimes(4);
      expect(spySheet).toHaveBeenNthCalledWith(1, "B:D");
      expect(spySheet).toHaveBeenNthCalledWith(2, "F:G");
      expect(spySheet).toHaveBeenNthCalledWith(3, "I:N");
      expect(spySheet).toHaveBeenNthCalledWith(4, "P:S");

      expect(spyRange).toHaveBeenCalledTimes(4);
      expect(spyRange).toHaveBeenNthCalledWith(1, 1);

      spySheet.mockRestore();
      spyRange.mockRestore();
    });
  });

  describe("Test expandPreviousHiding_", () => {
    const documentProperties = propertiesService.getDocumentProperties();
    // "LAST_HIDE_" taken from LAST_HIDE_PREFIX
    const propertyName = "LAST_HIDE_" + "Saa";

    let spySheet;

    beforeEach(() => {
      spySheet = jest.spyOn(sheet.prototype, "showColumns");
    });

    afterEach(() => {
      spySheet.mockRestore();
    });

    test("Test expandPreviousHiding_ with undefined document property", () => {
      documentProperties.deleteAllProperties();
      expandPreviousHiding_(mSheet, 5);

      expect(spySheet).toHaveBeenCalledTimes(1);
      expect(spySheet).toHaveBeenLastCalledWith(1, 100);
      expect(documentProperties.getProperty(propertyName)).toEqual(6);
    });

    test("Test expandPreviousHiding_ with predefined document property", () => {
      documentProperties.setProperty(propertyName, 5);

      expandPreviousHiding_(mSheet, 10);

      expect(spySheet).toHaveBeenCalledTimes(1);
      expect(spySheet).toHaveBeenLastCalledWith(5, 10);
      expect(documentProperties.getProperty(propertyName)).toEqual(11);
    });

    test("Test expandPreviousHiding_, nothing to expand", () => {
      documentProperties.setProperty(propertyName, 10);

      expandPreviousHiding_(mSheet, 10);

      expect(spySheet).toHaveBeenCalledTimes(0);
      expect(documentProperties.getProperty(propertyName)).toEqual(10);
    });
  });

  describe("Test hideUnusedColumns_", () => {
    const endDate = new Date("2021-02-01T00:00:00.000+00:00");

    let spySheet;
    beforeEach(() => {
      spySheet = jest.spyOn(sheet.prototype, "hideColumns");
    });

    afterEach(() => {
      spySheet.mockRestore();
    });

    test("Test hideUnusedColumns_ day mode", () => {
      hideUnusedColumns_(mSheet, DATE_MODE.DAY, endDate);

      expect(spySheet).toHaveBeenCalledTimes(1);
      expect(spySheet).toHaveBeenLastCalledWith(33, 100 - 32);
    });

    test("Test hideUnusedColumns_ week mode", () => {
      hideUnusedColumns_(mSheet, DATE_MODE.WEEK, endDate);

      expect(spySheet).toHaveBeenCalledTimes(1);
      expect(spySheet).toHaveBeenLastCalledWith(6, 95);
    });

    test("Test hideUnusedColumns_ month mode", () => {
      hideUnusedColumns_(mSheet, DATE_MODE.MONTH, endDate);

      expect(spySheet).toHaveBeenCalledTimes(1);
      expect(spySheet).toHaveBeenLastCalledWith(3, 98);
    });
  });

  describe("Test Generate dates E2E tests", () => {
    const endDate = new Date("2035-01-01T00:00:00.000+00:00");

    afterEach(() => {
      const expectSheet = sApp.getSheetByName("Logi");
      expect(expectSheet.table[3][2]).toEqual('Päivitettiin päivä tiedot taulukossa "Saa"')
    });

    test("Test populateDatesUntil day mode", () => {
      populateDatesUntil(mSheet, DATE_MODE.DAY, endDate);
    });

    test("Test populateDatesUntil week mode", () => {
      populateDatesUntil(mSheet, DATE_MODE.WEEK, endDate);
    });

    test("Test populateDatesUntil month mode", () => {
      populateDatesUntil(mSheet, DATE_MODE.MONTH, endDate);
    });
  });
});
