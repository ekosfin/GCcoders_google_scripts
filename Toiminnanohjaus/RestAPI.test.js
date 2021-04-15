import GlobalUtils from "../TestUtils/GlobalUtils";
import sheet from "../__mocks__/sheet";
import spreadsheetApp from "../__mocks__/spreadsheetApp";
import contentService from "../__mocks__/contentService";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importFile("./Toiminnanohjaus/Constants.js");
  GlobalUtils.importFile("./Toiminnanohjaus/RestAPI.js");
});

describe("Test Rest API", () => {
  let scheduleSheet;

  function prepareTest() {
    const sApp = spreadsheetApp.getInstance();

    const settingsTable = [
      [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
      ["Kuljetuksia päivässä", "2", "", ""],
      ["Työntekijän 1 oikeudet", "test1@example.com", "edit", ""],
      ["Työntekijän 2 oikeudet", "test2@example.com", "watch", ""],
      ["Työntekijän 3 oikeudet", "test3@example.com", "edit", ""],
      ["Työntekijän 4 oikeudet", "test4@example.com", "banana", ""],
      ];
    const settingsSheet = new sheet(settingsTable);

    const configTable = [
      ["Kuljettajat:", "Kuljettajatyypit:", "Kuljetettavat:", "Kohteet:", "Värit:", ""],
      ["Driver1", "kulj", "Material1", "City1", "kulj:#41EE00", ""],
      ["Driver2", "vkulj", "Material2", "City2", "vkulj:#FBFF00", ""],
      ["Driver3", "alihank", "Material3", "City3", "alihank:#FF0000", ""],
      ["", "", "", "", "", ""]
      ];
    const configSheet = new sheet(configTable);
  
    const logTable = [
      [TIME_TITLE, TYPE_TITLE, MESSAGE_TITLE],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
      ];
    const logSheet = new sheet(logTable);

    const scheduleTable = [
      ["", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai", "Sunnuntai", ""],
      ["Material1", "-*Driver1 City2 10:00 additional info* -", "--", "--", "--", "--", "--", "--", ""],
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
      ["Material2", "--", "-*Driver2 City1 9 * -Driver3 City3 11:30 info", "--", "--", "--", "--", "--", ""],
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
      ["Material3", "--", "--", "--", "-Driver1 City1 14 info -", "--", "--", "--", ""],
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
      ["", "", "", "", "", "", "", "", ""]
      ];

    const scheduleSheet = new sheet(scheduleTable);
    sApp.addSheet(SCHEDULE_SHEET_NAME, scheduleSheet);
    sApp.addSheet(CONFIG_SHEET_NAME, configSheet);
    sApp.addSheet(SETTINGS_SHEET_NAME, settingsSheet);
    sApp.addSheet(LOG_SHEET_NAME, logSheet);
    global.sApp = sApp;
    global.ContentService = new contentService();

    // Reset log caches
    Log.logSheet = undefined;
    Log.tableCache = undefined;

    // Initialize constants
    initialize();

    return scheduleSheet;
  }

  beforeEach(() => {
    scheduleSheet = prepareTest();
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
        data: [[], [{ dayItem: "Driver2 City1 9", dayInfo: "", twoWay:true, color:"#FBFF00" }, { dayItem: "Driver3 City3 11:30", dayInfo: "info", twoWay:false, color:"#FF0000" }], [], [], [], [], []]
      },
      {
        materialName: "Material3",
        data: [[], [], [], [{ dayItem: "Driver1 City1 14", dayInfo: "info", twoWay:false, color:"#41EE00" }], [], [], []]
      },
    ],
    drivers: [
      { driver: "Driver1", color: "#41EE00" },
      { driver: "Driver2", color: "#FBFF00" },
      { driver: "Driver3", color: "#FF0000" }
    ],
    destinations: ["City1", "City2", "City3"]
  };

  const editData = {
    edits: [{
      materialName: "Material1", 
      day: "Keskiviikko", 
      data: [
          { dayItem: "Driver1 City1 12", twoWay: true, dayInfo: "info" }
      ]}, {
      materialName: "Material3", 
      day: "Torstai", 
      data: []
      }
    ]
  };

  describe("Test doPost", () => {
    test("Test doPost with data route", () => {
      const contentsStr = JSON.stringify({ API: "REPLACE_API_KEY", email: "test1@example.com" });
      const msg = {
        parameters: { route: ["data"] }, 
        postData: { contents: contentsStr }
      };
      const responseJSON = JSON.parse(doPost(msg).getText());
      expect(responseJSON).toStrictEqual(schedule);
    });

    test("Test doPost with edit route", () => {
      const contentsStr = JSON.stringify({ API: "REPLACE_API_KEY", email: "test1@example.com", edits: editData["edits"] });
      const msg = {
        parameters: { route: ["edit"] }, 
        postData: { contents: contentsStr }
      };
      const responseJSON = doPost(msg).getText();
      expect(responseJSON).toStrictEqual("Edit successful");
    });

    test("Test doPost with edit route with watch rights", () => {
      const contentsStr = JSON.stringify({ API: "REPLACE_API_KEY", email: "test2@example.com", edits: editData["edits"] });
      const msg = {
        parameters: { route: ["edit"] }, 
        postData: { contents: contentsStr }
      };
      const responseJSON = doPost(msg).getText();
      expect(responseJSON).toStrictEqual("Access denied. Email with edit rights required");
    });

    test("Test doPost without parameters", () => {
      const responseJSON = doPost().getText();
      expect(responseJSON).toStrictEqual("400 Bad Request");
    });

    test("Test doPost without route parameter", () => {
      const contentsStr = JSON.stringify({ API: "REPLACE_API_KEY", email: "test1@example.com" });
      const msg = {
        parameters: {}, 
        postData: { contents: contentsStr }
      };
      const responseJSON = doPost(msg).getText();
      expect(responseJSON).toStrictEqual("400 Bad Request");
    });

    test("Test doPost with wrong API key", () => {
      const contentsStr = JSON.stringify({ API: "wrong-key-123", email: "test1@example.com" });
      const msg = {
        parameters: { route: ["data"] }, 
        postData: { contents: contentsStr }
      };
      const responseJSON = JSON.parse(doPost(msg).getText());
      expect(responseJSON).toStrictEqual({ message: "Key Invalid" });
    });

    test("Test doPost with invalid route", () => {
      const contentsStr = JSON.stringify({ API: "REPLACE_API_KEY", email: "test1@example.com" });
      const msg = {
        parameters: { route: ["banana"] }, 
        postData: { contents: contentsStr }
      };
      const responseMsg = doPost(msg).getText();
      expect(responseMsg).toStrictEqual("400 Bad Request");
    });
  });

  describe("Test getSchedule_", () => {
    test("Test getSchedule_ with edit as permissions", () => {
      const responseData = JSON.parse(getSchedule_("edit"));
      expect(responseData).toStrictEqual(schedule);
    });
  });

  describe("Test editSchedule_", () => {
    test("Test editSchedule_ with correct data", () => {
      const responseMsg = editSchedule_(editData);
      expect(responseMsg).toStrictEqual("Edit successful");
      expect(scheduleSheet.table[3][3]).toStrictEqual("Driver1");
      expect(scheduleSheet.table[4][3]).toStrictEqual("City1");
      expect(scheduleSheet.table[5][3]).toStrictEqual("12");
      expect(scheduleSheet.table[6][3]).toStrictEqual("Meno-paluu");
      expect(scheduleSheet.table[7][3]).toStrictEqual("info");
      expect(scheduleSheet.table[29][4]).toStrictEqual("");
      expect(scheduleSheet.table[30][4]).toStrictEqual("");
      expect(scheduleSheet.table[31][4]).toStrictEqual("");
      expect(scheduleSheet.table[32][4]).toStrictEqual("");
      expect(scheduleSheet.table[33][4]).toStrictEqual("");
    });
    
    test("Test editSchedule_ without parameters", () => {
      const responseMsg = editSchedule_();
      expect(responseMsg).toStrictEqual("Edit failed: post data didn't have property 'edits'");
    });
  });

  describe("Test verifyEmail_", () => {
    test("Test verifyEmail_ with email that has edit rights", () => {
      const response = verifyEmail_({ email: "test1@example.com" });
      expect(response).toStrictEqual("edit");
    });

    test("Test verifyEmail_ with email that has watch rights", () => {
      const response = verifyEmail_({ email: "test2@example.com" });
      expect(response).toStrictEqual("watch");
    });

    test("Test verifyEmail_ with email that is not in the system", () => {
      const response = verifyEmail_({ email: "notfound@example.com" });
      expect(response).toStrictEqual("Not found");
    });

    test("Test verifyEmail_ with email that has invalid rights", () => {
      const response = verifyEmail_({ email: "test4@example.com" });
      expect(response).toStrictEqual("Error");
    });

    test("Test verifyEmail_ without parameters", () => {
      const response = verifyEmail_();
      expect(response).toStrictEqual("No 'email' property");
    });
  });
});