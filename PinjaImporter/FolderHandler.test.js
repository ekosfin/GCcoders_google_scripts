import { jest } from "@jest/globals";
import GlobalUtils from "../TestUtils/GlobalUtils";
import { PinjaImporterTestCommon as TestCommon } from "../TestUtils/PinjaImporterTestCommon";
import driveApp from "../__mocks__/driveApp";
import file from "../__mocks__/file";
import folder from "../__mocks__/folder";
import spreadsheetApp from "../__mocks__/spreadsheetApp";

// Excel file mime type
const excelMime =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const spreadSheetMime = "application/vnd.google-apps.spreadsheet";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importFile("./PinjaImporter/Constants.js");
  GlobalUtils.importFile("./PinjaImporter/DataImporter.js");
  GlobalUtils.importFile("./PinjaImporter/FolderHandler.js");
});

describe("Test Folder Handler", () => {
  let mSheet, spyDriveAppInsert, spyDriveAppRemove;
  beforeEach(() => {
    mSheet = TestCommon.prepareTest(TestCommon.normalTestTable);
    spyDriveAppInsert = jest.spyOn(driveApp.Files, "insert");
    spyDriveAppRemove = jest.spyOn(driveApp.Files, "remove");
  });

  afterEach(() => {
    driveApp.resetFolders();
    spyDriveAppInsert.mockRestore();
    spyDriveAppRemove.mockRestore();
  });

  describe("Test convertExcelFilesToSheets_", () => {
    test("Test convertExcelFilesToSheets_ with no excel files", () => {
      const file1 = new file("ID_FILE1", "FILE1", "BLOB1", "spreadsheet");
      const folder1 = new folder();
      folder1.addFile(file1);
      driveApp.addFolder(PINJA_FOLDER_ID, folder1);
      convertExcelFilesToSheets_();
      expect(spyDriveAppInsert).toHaveBeenCalledTimes(0);
      expect(spyDriveAppRemove).toHaveBeenCalledTimes(0);
    });

    test("Test convertExcelFilesToSheets_ with excel file", () => {
      const file1 = new file("ID_FILE1", "FILE1", "BLOB1", "spreadsheet");
      const file2 = new file("ID_FILE_EXCEL", "FILE_EXCEL", "BLOB2", excelMime);
      const folder1 = new folder();
      folder1.addFile(file1);
      folder1.addFile(file2);
      driveApp.addFolder(PINJA_FOLDER_ID, folder1);
      convertExcelFilesToSheets_();
      expect(spyDriveAppInsert).toHaveBeenCalledTimes(1);
      expect(spyDriveAppRemove).toHaveBeenCalledTimes(1);
      expect(spyDriveAppInsert).toHaveBeenLastCalledWith(
        { title: "FILE_EXCEL", parents: [{ id: PINJA_FOLDER_ID }] },
        "BLOB2",
        { convert: true }
      );
      expect(spyDriveAppRemove).toHaveBeenLastCalledWith("ID_FILE_EXCEL");
      expect(driveApp.folders[PINJA_FOLDER_ID].files.length).toBe(2);
    });

    test("Test convertExcelFilesToSheets_ with only excel file", () => {
      const file1 = new file(
        "ID_FILE_EXCEL1",
        "FILE_EXCEL1",
        "BLOB1",
        excelMime
      );
      const file2 = new file(
        "ID_FILE_EXCEL2",
        "FILE_EXCEL2",
        "BLOB2",
        excelMime
      );
      const folder1 = new folder();
      folder1.addFile(file1);
      folder1.addFile(file2);
      driveApp.addFolder(PINJA_FOLDER_ID, folder1);
      convertExcelFilesToSheets_();
      expect(spyDriveAppInsert).toHaveBeenCalledTimes(2);
      expect(spyDriveAppRemove).toHaveBeenCalledTimes(2);
      expect(spyDriveAppInsert).toHaveBeenNthCalledWith(
        1,
        { title: "FILE_EXCEL1", parents: [{ id: PINJA_FOLDER_ID }] },
        "BLOB1",
        { convert: true }
      );
      expect(spyDriveAppInsert).toHaveBeenNthCalledWith(
        2,
        { title: "FILE_EXCEL2", parents: [{ id: PINJA_FOLDER_ID }] },
        "BLOB2",
        { convert: true }
      );
      expect(spyDriveAppRemove).toHaveBeenNthCalledWith(1, "ID_FILE_EXCEL1");
      expect(spyDriveAppRemove).toHaveBeenNthCalledWith(2, "ID_FILE_EXCEL2");
      expect(driveApp.folders[PINJA_FOLDER_ID].files.length).toBe(2);
    });
  });

  describe("Test importPinjasFromFolder_", () => {
    let spySpreadsheetAppById;
    beforeEach(() => {
      TestCommon.prepareTest(TestCommon.normalTestTable);
      spySpreadsheetAppById = jest.spyOn(spreadsheetApp, "openById");
    });

    afterEach(() => {
      driveApp.resetFolders();
      spySpreadsheetAppById.mockRestore();
    });

    test("Test importPinjasFromFolder_ with two folders", () => {
      const file1 = new file("ID_FILE1", "FILE1", "BLOB1", spreadSheetMime);
      const file2 = new file("ID_FILE2", "FILE2", "BLOB2", spreadSheetMime);
      const file3 = new file("ID_FILE3", "FILE3", "BLOB3", "testMime");
      const folder1 = new folder();
      folder1.addFile(file1);
      folder1.addFile(file2);
      folder1.addFile(file3);
      driveApp.addFolder(PINJA_FOLDER_ID, folder1);

      // Mock importPinjaData_ function
      global.importPinjaData_ = (param1, param2) => {
        return {};
      };

      const resutls = importPinjasFromFolder_(TestCommon.productList);
      expect(resutls).toStrictEqual([{}, {}]);
      expect(spySpreadsheetAppById).toHaveBeenCalledTimes(2);
      expect(spySpreadsheetAppById).toHaveBeenNthCalledWith(1, "ID_FILE1");
      expect(spySpreadsheetAppById).toHaveBeenNthCalledWith(2, "ID_FILE2");
    });
  });

  describe("Test mergeMultipleResults_", () => {
    // Copy from PinjaImportedTestCommon for increased clarity
    let importResults;

    beforeEach(() => {
      importResults = {
        Alite: { in: { "Mon, 01 Feb 2021 03:00:00 GMT": 25 }, out: {} },
        Betoni: {
          in: {
            "Mon, 01 Feb 2021 03:00:00 GMT": 5,
            "Tue, 02 Feb 2021 03:00:00 GMT": 30,
          },
          out: { "Mon, 01 Feb 2021 03:00:00 GMT": 2 },
        },
        Paperi: { in: { "Tue, 02 Feb 2021 03:00:00 GMT": 22.5 }, out: {} },
      };
    });

    test("Test mergeMultipleResults_ with no results", () => {
      mergeMultipleResults_([]);
    });

    test("Test mergeMultipleResults_ with one result", () => {
      const results = mergeMultipleResults_([importResults]);
      expect(results).toStrictEqual(importResults);
    });

    test("Test mergeMultipleResults_ same data", () => {
      const results = mergeMultipleResults_([
        importResults,
        importResults,
        importResults,
      ]);
      expect(results).toStrictEqual(importResults);
    });

    test("Test mergeMultipleResults_ new values", () => {
      const importResults2 = {
        Alite: { in: {}, out: { "Mon, 01 Feb 2021 03:00:00 GMT": 25 } },
        Betoni: {
          in: {},
          out: {
            "Tue, 02 Feb 2021 03:00:00 GMT": 30,
          },
        },
        Paperi: { in: {}, out: { "Tue, 02 Feb 2021 03:00:00 GMT": 22.5 } },
      };

      const results = mergeMultipleResults_([importResults, importResults2]);

      expect(results).toStrictEqual({
        Alite: {
          in: { "Mon, 01 Feb 2021 03:00:00 GMT": 25 },
          out: { "Mon, 01 Feb 2021 03:00:00 GMT": 25 },
        },
        Betoni: {
          in: {
            "Mon, 01 Feb 2021 03:00:00 GMT": 5,
            "Tue, 02 Feb 2021 03:00:00 GMT": 30,
          },
          out: {
            "Mon, 01 Feb 2021 03:00:00 GMT": 2,
            "Tue, 02 Feb 2021 03:00:00 GMT": 30,
          },
        },
        Paperi: {
          in: { "Tue, 02 Feb 2021 03:00:00 GMT": 22.5 },
          out: { "Tue, 02 Feb 2021 03:00:00 GMT": 22.5 },
        },
      });
    });

    test("Test mergeMultipleResults_ larger value", () => {
      const importResults2 = {
        Alite: { in: { "Mon, 01 Feb 2021 03:00:00 GMT": 40 }, out: {} },
      };

      const results = mergeMultipleResults_([importResults, importResults2]);
      expect(results).toStrictEqual({
        Alite: { in: { "Mon, 01 Feb 2021 03:00:00 GMT": 40 }, out: {} },
        Betoni: {
          in: {
            "Mon, 01 Feb 2021 03:00:00 GMT": 5,
            "Tue, 02 Feb 2021 03:00:00 GMT": 30,
          },
          out: { "Mon, 01 Feb 2021 03:00:00 GMT": 2 },
        },
        Paperi: { in: { "Tue, 02 Feb 2021 03:00:00 GMT": 22.5 }, out: {} },
      });
    });
  });
});
