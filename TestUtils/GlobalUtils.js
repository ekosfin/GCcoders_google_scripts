import * as fs from "fs"
import spreadsheetApp from "../__mocks__/spreadsheetApp";
import propertiesService from "../__mocks__/propertiesService";

export default class GlobalUtils {
  static importFile(file) {
    const data = fs.readFileSync(file);
    global.eval(data.toString());
  }

  static maskGoogleServices() {
    global.SpreadsheetApp = spreadsheetApp;
    global.PropertiesService = propertiesService;
  }

  static importRemeoUtils() {
    this.importFile("./RemeoUtils/Constants.js");
    this.importFile("./RemeoUtils/Log.js");
    this.importFile("./RemeoUtils/Cell.js");
    this.importFile("./RemeoUtils/Settings.js");
    this.importFile("./RemeoUtils/Instance.js");
    global.RemeoUtils = {Instance: Instance};
  }
}
