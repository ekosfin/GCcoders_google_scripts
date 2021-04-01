import { jest } from "@jest/globals";
import GlobalUtils from "../TestUtils/GlobalUtils";
import TestCommon from "../TestUtils/SheetManagementTestCommon";
import sheet from "../__mocks__/sheet";
import propertiesService from "../__mocks__/propertiesService";
import range from "../__mocks__/range";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importFile("./SheetManagementUtils/Constants.js");
  GlobalUtils.importFile("./SheetManagementUtils/MarkCurrentDate.js");
  GlobalUtils.importFile("./SheetManagementUtils/Utils.js");
});

describe("Test MarkCurrentDate", () => {
  // "LAST_DATE_" taken from LAST_DATE_PREFIX
  const propertyName = "LAST_DATE_" + "Saa";

  let mSheet;
  let spySheet, spyRange;

  beforeEach(() => {
    [, mSheet] = TestCommon.prepareTest();
    // Break log support temporalily to spy range calls more easily
    Utils.Log.info = () => {};
    spySheet = jest.spyOn(sheet.prototype, "getRange");
    spyRange = jest.spyOn(range.prototype, "setBackground");
  });

  afterEach(() => {
    spySheet.mockRestore();
    spyRange.mockRestore();
  });

  describe("Test removeMarkingsFromPrevious_", () => {
    const documentProperties = propertiesService.getDocumentProperties();

    test("Test removeMarkingsFromPrevious_ without document properties", () => {
      removeMarkingsFromPrevious_(mSheet, DATE_MODE.DAY);
    });

    test("Test removeMarkingsFromPrevious_ day mode", () => {
      documentProperties.setProperty(
        propertyName,
        "2021-01-05T00:00:00.000+00:00"
      );
      removeMarkingsFromPrevious_(mSheet, DATE_MODE.DAY);
      expect(spySheet).toHaveBeenLastCalledWith("E4:E");
      expect(spyRange).toHaveBeenCalledTimes(1);
      expect(spyRange).toHaveBeenLastCalledWith("#ffffff");
    });

    test("Test removeMarkingsFromPrevious_ week mode", () => {
      documentProperties.setProperty(
        propertyName,
        "2021-01-15T00:00:00.000+00:00"
      );
      removeMarkingsFromPrevious_(mSheet, DATE_MODE.WEEK);
      expect(spySheet).toHaveBeenLastCalledWith("B4:B");
      expect(spyRange).toHaveBeenCalledTimes(1);
      expect(spyRange).toHaveBeenLastCalledWith("#ffffff");
    });

    test("Test removeMarkingsFromPrevious_ month mode", () => {
      documentProperties.setProperty(
        propertyName,
        "2021-03-01T00:00:00.000+00:00"
      );
      removeMarkingsFromPrevious_(mSheet, DATE_MODE.MONTH);
      expect(spySheet).toHaveBeenLastCalledWith("C4:C");
      expect(spyRange).toHaveBeenCalledTimes(1);
      expect(spyRange).toHaveBeenLastCalledWith("#ffffff");
    });
  });

  describe("Test markCurrentDate", () => {
    beforeEach(() => {
      // Mock removeMarkingsFromPrevious_
      removeMarkingsFromPrevious_ = () => {};
    });

    test("Test markCurrentDate without document properties", () => {
      const now = new Date("2021-01-05T00:00:00.000+00:00");
      markCurrentDate(mSheet, DATE_MODE.DAY, now);
    });

    test("Test removeMarkingsFromPrevious_ day mode", () => {
      const now = new Date("2021-01-05T00:00:00.000+00:00");
      markCurrentDate(mSheet, DATE_MODE.DAY, now);
      expect(spySheet).toHaveBeenLastCalledWith("E4:E");
      expect(spyRange).toHaveBeenCalledTimes(1);
      expect(spyRange).toHaveBeenLastCalledWith(CURRENT_DATE_COLOR);
    });

    test("Test markCurrentDate week mode", () => {
      const now = new Date("2021-01-15T00:00:00.000+00:00");
      markCurrentDate(mSheet, DATE_MODE.WEEK, now);
      expect(spySheet).toHaveBeenLastCalledWith("B4:B");
      expect(spyRange).toHaveBeenCalledTimes(1);
      expect(spyRange).toHaveBeenLastCalledWith(CURRENT_DATE_COLOR);
    });

    test("Test markCurrentDate month mode", () => {
      const now = new Date("2021-03-01T00:00:00.000+00:00");
      markCurrentDate(mSheet, DATE_MODE.MONTH, now);
      expect(spySheet).toHaveBeenLastCalledWith("C4:C");
      expect(spyRange).toHaveBeenCalledTimes(1);
      expect(spyRange).toHaveBeenLastCalledWith(CURRENT_DATE_COLOR);
    });
  });
});
