import GlobalUtils from "../TestUtils/GlobalUtils";
import TestCommon from "../TestUtils/SheetManagementTestCommon";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importFile("./SheetManagementUtils/Constants.js");
  GlobalUtils.importFile("./SheetManagementUtils/Utils.js");
});

describe("Test SheetManagementUtil utils", () => {
  let mSheet;

  beforeEach(() => {
    [, mSheet] = TestCommon.prepareTest();
  });

  describe("Test date difference functions", () => {
    test("Test timeDifferenceInDays", () => {
      let startDate, endDate;
      startDate = new Date("2022-07-05T00:00:00.000+00:00");
      endDate = new Date("2022-07-08T00:00:00.000+00:00");
      expect(timeDifferenceInDays(startDate, endDate)).toBe(3);
      startDate = new Date("2022-04-01T00:00:00.000+00:00");
      endDate = new Date("2022-04-05T12:00:00.000+00:00");
      expect(timeDifferenceInDays(startDate, endDate)).toBe(4);
      startDate = new Date("2021-01-01T00:00:00.000+00:00");
      endDate = new Date("2022-01-01T00:00:00.000+00:00");
      expect(timeDifferenceInDays(startDate, endDate)).toBe(365);
    });

    test("Test timeDifferenceInWeeks", () => {
      let startDate, endDate;
      startDate = new Date("2022-02-28T00:00:00.000+00:00");
      endDate = new Date("2022-03-28T00:00:00.000+00:00");
      expect(timeDifferenceInWeeks(startDate, endDate)).toBe(4);
      startDate = new Date("2022-04-01T00:00:00.000+00:00");
      endDate = new Date("2022-05-27T12:00:00.000+00:00");
      expect(timeDifferenceInWeeks(startDate, endDate)).toBe(8);
      startDate = new Date("2021-01-01T00:00:00.000+00:00");
      endDate = new Date("2022-01-01T00:00:00.000+00:00");
      expect(timeDifferenceInWeeks(startDate, endDate)).toBe(52);
    });

    test("Test timeDifferenceInMonths", () => {
      let startDate, endDate;
      startDate = new Date("2022-04-01T00:00:00.000+00:00");
      endDate = new Date("2022-05-01T00:00:00.000+00:00");
      expect(timeDifferenceInMonths(startDate, endDate)).toBe(1);
      startDate = new Date("2022-08-01T00:00:00.000+00:00");
      endDate = new Date("2022-10-01T12:00:00.000+00:00");
      expect(timeDifferenceInMonths(startDate, endDate)).toBe(2);
      startDate = new Date("2021-01-01T00:00:00.000+00:00");
      endDate = new Date("2022-01-01T00:00:00.000+00:00");
      expect(timeDifferenceInMonths(startDate, endDate)).toBe(12);
    });

    test("Test getColumnAmountByEndDate", () => {
      let endDate;
      endDate = new Date("2021-01-31T00:00:00.000+00:00");
      expect(getColumnAmountByEndDate(DATE_MODE.DAY, endDate)).toBe(30);
      endDate = new Date("2021-02-28T12:00:00.000+00:00");
      expect(getColumnAmountByEndDate(DATE_MODE.WEEK, endDate)).toBe(7);
      endDate = new Date("2021-05-01T00:00:00.000+00:00");
      expect(getColumnAmountByEndDate(DATE_MODE.MONTH, endDate)).toBe(4);
    });
  });

  describe("Test checkAndUpdateSpace", () => {
    test("Test checkAndUpdateSpace without need for a new space", () => {
      const endDate = new Date("2021-02-26T00:00:00.000+00:00");
      checkAndUpdateSpace(mSheet, DATE_MODE.DAY, endDate);
      expect(mSheet.table[0].length).toBe(100);
    });

    test("Test checkAndUpdateSpace with need for new space", () => {
      const endDate = new Date("2022-01-01T00:00:00.000+00:00");
      checkAndUpdateSpace(mSheet, DATE_MODE.DAY, endDate);
      expect(mSheet.table[0].length).toBe(367);
    });
  });

  describe("Test getCellByDate", () => {
    test("Test getCellByDate with day mode", () => {
      const date = new Date("2021-01-15T00:00:00.000+00:00");
      const cell = getCellByDate(DATE_MODE.DAY, date);
      expect(cell).toStrictEqual({
        row: 1,
        column: 15,
        columnLetter: "O",
        a1: "O1"
      });
    });

    test("Test getCellByDate with week mode", () => {
      const date = new Date("2021-01-15T00:00:00.000+00:00");
      const cell = getCellByDate(DATE_MODE.WEEK, date);
      expect(cell).toStrictEqual({
        row: 1,
        column: 2,
        columnLetter: "B",
        a1: "B1"
      });
    });

    test("Test getCellByDate with month mode", () => {
      const date = new Date("2021-07-01T00:00:00.000+00:00");
      const cell = getCellByDate(DATE_MODE.MONTH, date);
      expect(cell).toStrictEqual({
        row: 1,
        column: 7,
        columnLetter: "G",
        a1: "G1"
      });
    });
  });
});
