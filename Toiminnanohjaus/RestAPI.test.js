import GlobalUtils from "../TestUtils/GlobalUtils";
import sheet from "../__mocks__/sheet";
import range from "../__mocks__/range";
import spreadsheetApp from "../__mocks__/spreadsheetApp";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importFile("./Toiminnanohjaus/Constants.js");
  GlobalUtils.importFile("./Toiminnanohjaus/RestAPI.js");
});

describe("Test Rest API", () => {
  let sApp, mSheet;

  function prepareTest() {
    const sApp = spreadsheetApp.getInstance();

    const settingsTable = [
      [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
      ["Työntekijän 1 oikeudet", "test1@example.com", "edit", ""],
      ["Työntekijän 2 oikeudet", "test2@example.com", "watch", ""],
      ["Työntekijän 3 oikeudet", "test3@example.com", "edit", ""],
      ["Työntekijän 4 oikeudet", "test4@example.com", "watch", ""],
      ];
    const settingsSheet = new sheet(settingsTable);

    const configTable = [
      ["Kuljettajat:", "Kuljettajatyypit:", "Kuljetettavat", "Kohteet:", "Värit:"],
      ["Driver1", "kulj", "Material1", "City1", "kulj:#41EE00"],
      ["Driver2", "vkulj", "Material2", "City2", "vkulj:#FBFF00"],
      ["Driver3", "alihank", "Material3", "City3", "alihank:#FF0000"],
      ];
    const configSheet = new sheet(configTable);
  
    const logTable = [
      [TIME_TITLE, TYPE_TITLE, MESSAGE_TITLE],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
      ];
    const logSheet = new sheet(logTable);

    const testTable = [
      ["", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai", "Sunnuntai"],
      ["Material1", "-*Driver1 City2 10:00 additional info* -", "--", "--", "--", "--", "--", "--"],
      ["#1", "*Driver1 City2 10:00 additional info*", "", "", "", "", "", ""],
      ["Kuka", "Driver1", "", "", "", "", "", ""],
      ["Minne", "City2", "", "", "", "", "", ""],
      ["Milloin", "10:00", "", "", "", "", "", ""],
      ["Meno/Meno-paluu", "Meno-paluu", "", "", "", "", "", ""],
      ["Muuta", "additional info", "", "", "", "", "", ""],
      ["#2", "", "", "", "", "", "", ""],
      ["Kuka", "", "", "", "", "", "", ""],
      ["Minne", "", "", "", "", "", "", ""],
      ["Milloin", "", "", "", "", "", "", ""],
      ["Meno/Meno-paluu", "", "", "", "", "", "", ""],
      ["Muuta", "", "", "", "", "", "", ""],
      ["Material2", "--", "-*Driver2 City1 9 * -Driver3 City3 11:30 info", "--", "--", "--", "--", "--"],
      ["#1", "", "*Driver2 City1 9 *", "", "", "", "", ""],
      ["Kuka", "", "Driver2", "", "", "", "", ""],
      ["Minne", "", "City1", "", "", "", "", ""],
      ["Milloin", "", "9", "", "", "", "", ""],
      ["Meno/Meno-paluu", "", "Meno-paluu", "", "", "", "", ""],
      ["Muuta", "", "", "", "", "", "", ""],
      ["#2", "", "Driver3 City3 11:30 info", "", "", "", "", ""],
      ["Kuka", "", "Driver3", "", "", "", "", ""],
      ["Minne", "", "City3", "", "", "", "", ""],
      ["Milloin", "", "11:30", "", "", "", "", ""],
      ["Meno/Meno-paluu", "", "Meno", "", "", "", "", ""],
      ["Muuta", "", "info", "", "", "", "", ""],
      ["Material3", "--", "--", "--", "-Driver1 City1 14 info -", "--", "--", "--"],
      ["#1", "", "", "", "Driver1 City1 14 info", "", "", ""],
      ["Kuka", "", "", "", "Driver1", "", "", ""],
      ["Minne", "", "", "", "City1", "", "", ""],
      ["Milloin", "", "", "", "14", "", "", ""],
      ["Meno/Meno-paluu", "", "", "", "Meno", "", "", ""],
      ["Muuta", "", "", "", "info", "", "", ""],
      ["#2", "", "", "", "", "", "", ""],
      ["Kuka", "", "", "", "", "", "", ""],
      ["Minne", "", "", "", "", "", "", ""],
      ["Milloin", "", "", "", "", "", "", ""],
      ["Meno/Meno-paluu", "", "", "", "", "", "", ""],
      ["Muuta", "", "", "", "", "", "", ""],
      ];

    const mSheet = new sheet(testTable);
    sApp.addSheet(SCHEDULE_SHEET_NAME, mSheet);
    sApp.addSheet(CONFIG_SHEET_NAME, configSheet);
    sApp.addSheet(SETTINGS_SHEET_NAME, settingsSheet);
    sApp.addSheet(LOG_SHEET_NAME, logSheet);
    global.sApp = sApp;
    Utils.sApp = sApp;

    global.scheduleSheet = sApp.getSheetByName(SCHEDULE_SHEET_NAME);
    global.materialSheet = sApp.getSheetByName(CONFIG_SHEET_NAME);

    // Reset log caches
    Log.logSheet = undefined;
    Log.tableCache = undefined;

    return [sApp, mSheet];
  }

  beforeEach(() => {
    [sApp, mSheet] = prepareTest();
  });

  const schedule = {
    permissions: "edit",
    schedule: [
      {
        materialName: "Material1",
        data: [[{ dayItem: "Driver1 City2 10:00", dayInfo: "additional info", twoWay:true, color:"#41EE00" }], [], [], [], [], [], []]
      },
      {
        materialName: "Material2",
        data: [[], [{ dayItem: "Driver2 City1 9", dayInfo: "", twoWay:true, color:"#FBFF00" }, { dayItem: "Driver3 City3 11:30", dayInfo: "info", twoWay:false, color:"FF0000" }], [], [], [], [], []]
      },
      {
        materialName: "Material3",
        data: [[], [], [], [{ dayItem: "Driver1 City1 14", dayInfo: "info", twoWay:false, color:"#41EE00" }], [], [], []]
      },
    ],
    drivers: [
      { driver: "Driver1", color: "#41EE00" },
      { driver: "Driver2", color: "#FBFF00" },
      { driver: "Driver3", color: "FF0000" }
    ],
    destinations: ["City1", "City2", "City3"]
  };

  describe("Test doPost", () => {
    test("Test doPost with data route", () => {
      const contentsStr = JSON.stringify({ "API": API_KEY, "email": "test1@example.com" });
      const msg = {
        parameters: { route: ["data"] }, 
        postData: { contents: contentsStr }
      };
      const responseData = JSON.parse(doPost(msg));
      expect(responseData).toStrictEqual(schedule);
    });
  });

  /*
  describe("Test ", () => {
    test("Test ", () => {

      expect().toStrictEqual();
      expect().toBe();
    });
  });
  */
});