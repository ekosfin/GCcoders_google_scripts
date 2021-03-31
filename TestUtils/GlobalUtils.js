import * as fs from "fs";
import spreadsheetApp from "../__mocks__/spreadsheetApp";
import propertiesService from "../__mocks__/propertiesService";
import gmailApp from "../__mocks__/gmailApp";

export default class GlobalUtils {
  static importFile(file, scope) {
    const data = fs.readFileSync(file);
    if (!scope) {
      global.eval(data.toString());
    } else {
      // Hacky way to do scoped import
      // Import stuff to global namespace and then
      // move it to new namespace
      const previousGlobalKeys = {};
      for (let member in global) {
        previousGlobalKeys[member] = true;
      }

      global.eval(data.toString());
      for (let member in global) {
        if (!previousGlobalKeys[member]) {
          scope[member] = global[member];
          delete global[member];
        }
      }
    }
  }

  static maskGoogleServices() {
    global.SpreadsheetApp = spreadsheetApp;
    global.PropertiesService = propertiesService;
    global.GmailApp = new gmailApp();
  }

  static importRemeoUtils() {
    this.importFile("./RemeoUtils/Constants.js");
    this.importFile("./RemeoUtils/Log.js");
    this.importFile("./RemeoUtils/Cell.js");
    this.importFile("./RemeoUtils/Settings.js");
    this.importFile("./RemeoUtils/Instance.js");
    global.RemeoUtils = { Instance: Instance };
  }

  static importSheetManagementUtils() {
    global.SheetManagementUtils = {};
    this.importFile(
      "./SheetManagementUtils/Constants.js",
      global.SheetManagementUtils
    );
    this.importFile(
      "./SheetManagementUtils/MarkCurrentDate.js",
      global.SheetManagementUtils
    );
    this.importFile(
      "./SheetManagementUtils/ExpandSheet.js",
      global.SheetManagementUtils
    );
    this.importFile(
      "./SheetManagementUtils/GenerateDates.js",
      global.SheetManagementUtils
    );
    this.importFile(
      "./SheetManagementUtils/Utils.js",
      global.SheetManagementUtils
    );
  }
}
