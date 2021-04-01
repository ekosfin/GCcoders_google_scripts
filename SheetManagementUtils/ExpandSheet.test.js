import { jest } from "@jest/globals";
import GlobalUtils from "../TestUtils/GlobalUtils";
import TestCommon from "../TestUtils/SheetManagementTestCommon";
import sheet from "../__mocks__/sheet";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importFile("./SheetManagementUtils/Constants.js");
  GlobalUtils.importFile("./SheetManagementUtils/ExpandSheet.js");
  GlobalUtils.importFile("./SheetManagementUtils/Utils.js");
});

describe("Test MarkCurrentDate", () => {
  let mSheet, spySheet;

  beforeEach(() => {
    [, mSheet] = TestCommon.prepareTest();
    // Break log support temporalily to spy range calls more easily
    Utils.Log.info = () => {};
    // Break checkAndUpdateSpace to spy range calls more easily
    checkAndUpdateSpace = () => {};
    spySheet = jest.spyOn(sheet.prototype, "getRange");
  });

  afterEach(() => {
    spySheet.mockRestore();
  });

  describe("Test expandSheetRightTo", () => {
    test("Test expandSheetRightTo day mode #1", () => {
      const endDate = new Date("2021-01-10T00:00:00.000+00:00");
      expandSheetRightTo(mSheet, DATE_MODE.DAY, endDate);
      expect(spySheet).toHaveBeenCalledTimes(3);
      expect(spySheet).toHaveBeenNthCalledWith(2, "A1:J");
    });

    test("Test expandSheetRightTo day mode #2", () => {
      const endDate = new Date("2021-03-10T00:00:00.000+00:00");
      expandSheetRightTo(mSheet, DATE_MODE.DAY, endDate);
      expect(spySheet).toHaveBeenCalledTimes(3);
      expect(spySheet).toHaveBeenNthCalledWith(2, "A1:BQ");
    });
  });
});
