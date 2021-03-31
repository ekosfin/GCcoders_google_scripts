import { jest } from "@jest/globals";
import MockDate from "mockdate";
import GlobalUtils from "../TestUtils/GlobalUtils";
import propertiesService from "../__mocks__/propertiesService";
import sheet from "../__mocks__/sheet";
import spreadsheetApp from "../__mocks__/spreadsheetApp";
import gmailApp from "../__mocks__/gmailApp";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importSheetManagementUtils();
  GlobalUtils.importFile("./AjoneuvojenHallinta/Constants.js");
  GlobalUtils.importFile("./AjoneuvojenHallinta/VehicleNotifications.js");
});

beforeEach(() => {
  MockDate.set(new Date("2021-01-01T00:00:00.000Z"));
});

describe("Test Vehicle Notifications", () => {
  let sApp, mSheet;

  function prepareTest() {
    const sheetName = "Ajoneuvot";
    const sApp = spreadsheetApp.getInstance();

    // Check VehicleNotifications.js
    const settingsTable = [
      [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
      ["Muistutukset", "Katsastus", "Määräaikaishuolto", ""],
      ["Muistutukset ennen", "30", "30", ""],
      ["Viimeinen muistutus", "7", "", ""],
      ["Muistutukset osoitteisiin", "test@example.com", "", ""],
    ];
    const settingsSheet = new sheet(settingsTable);

    const logTable = [
      [TIME_TITLE, TYPE_TITLE, MESSAGE_TITLE],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    const logSheet = new sheet(logTable);

    const testTable = [
      [
        "Tunniste",
        "Nimi",
        "Merkki",
        "Ajoneuvonumero",
        "Valmistenumero",
        "Rekisterinumero",
        "Katsastus",
        "Määräaikaishuolto",
      ],
      [
        "Test vehicle #1 101",
        "Test vehicle #1",
        "Testian",
        "101",
        "1",
        "abc-123",
        "5.1.2021",
        "1.1.2022",
      ],
      [
        "Test vehicle #2 102",
        "Test vehicle #2",
        "Jestian",
        "102",
        "2",
        "def-456",
        "10.1.2021",
        "1.1.2022",
      ],
      [
        "Test vehicle #3 103",
        "Test vehicle #3",
        "Chestian",
        "103",
        "3",
        "ghi-789",
        "1.2.2021",
        "15.1.2021",
      ],
      [
        "Test vehicle #4 104",
        "Test vehicle #4",
        "Festian",
        "104",
        "4",
        "jkl-abc",
        "12.1.2021",
        "12.1.2021",
      ],
    ];

    const mSheet = new sheet(testTable);
    sApp.addSheet(sheetName, mSheet);
    sApp.addSheet(SETTINGS_SHEET_NAME, settingsSheet);
    sApp.addSheet(LOG_SHEET_NAME, logSheet);

    // Manually modify SheetManagementUtils sApp to current
    global.sApp = sApp;

    // Reset log caches
    Log.logSheet = undefined;
    Log.tableCache = undefined;

    return [sApp, mSheet];
  }

  beforeEach(() => {
    [sApp, mSheet] = prepareTest();
  });

  const vehicleList = [
    {
      name: "Test vehicle #1",
      notifications: [
        {
          before: 30,
          date: new Date("2021-01-05T03:00:00.000Z"),
          name: "Katsastus",
        },
        {
          before: 30,
          date: new Date("2022-01-01T03:00:00.000Z"),
          name: "Määräaikaishuolto",
        },
      ],
      number: "101",
      registerNumber: "abc-123",
    },
    {
      name: "Test vehicle #2",
      notifications: [
        {
          before: 30,
          date: new Date("2021-01-10T03:00:00.000Z"),
          name: "Katsastus",
        },
        {
          before: 30,
          date: new Date("2022-01-01T03:00:00.000Z"),
          name: "Määräaikaishuolto",
        },
      ],
      number: "102",
      registerNumber: "def-456",
    },
    {
      name: "Test vehicle #3",
      notifications: [
        {
          before: 30,
          date: new Date("2021-02-01T03:00:00.000Z"),
          name: "Katsastus",
        },
        {
          before: 30,
          date: new Date("2021-01-15T03:00:00.000Z"),
          name: "Määräaikaishuolto",
        },
      ],
      number: "103",
      registerNumber: "ghi-789",
    },
    {
      name: "Test vehicle #4",
      notifications: [
        {
          before: 30,
          date: new Date("2021-01-12T03:00:00.000Z"),
          name: "Katsastus",
        },
        {
          before: 30,
          date: new Date("2021-01-12T03:00:00.000Z"),
          name: "Määräaikaishuolto",
        },
      ],
      number: "104",
      registerNumber: "jkl-abc",
    },
  ];

  const expiringVehiclesList = [
    {
      expiryDate: new Date("2021-01-05T03:00:00.000Z"),
      expiryName: "Katsastus",
      name: "Test vehicle #1",
      number: "101",
      registerNumber: "abc-123",
      urgent: true,
    },
    {
      expiryDate: new Date("2021-01-10T03:00:00.000Z"),
      expiryName: "Katsastus",
      name: "Test vehicle #2",
      number: "102",
      registerNumber: "def-456",
      urgent: false,
    },
    {
      expiryDate: new Date("2021-01-15T03:00:00.000Z"),
      expiryName: "Määräaikaishuolto",
      name: "Test vehicle #3",
      number: "103",
      registerNumber: "ghi-789",
      urgent: false,
    },
    {
      expiryDate: new Date("2021-01-12T03:00:00.000Z"),
      expiryName: "Katsastus",
      name: "Test vehicle #4",
      number: "104",
      registerNumber: "jkl-abc",
      urgent: false,
    },
    {
      expiryDate: new Date("2021-01-12T03:00:00.000Z"),
      expiryName: "Määräaikaishuolto",
      name: "Test vehicle #4",
      number: "104",
      registerNumber: "jkl-abc",
      urgent: false,
    },
  ];

  describe("Test load notification configurations", () => {
    test("Test timeDifferenceInDays", () => {
      let notificationSettings,
        notificationFinalRemainder,
        notificationEmailList;
      [
        notificationSettings,
        notificationFinalRemainder,
        notificationEmailList,
      ] = loadNotificationConfigurations();
      expect(notificationSettings).toStrictEqual([
        { name: "Katsastus", before: 30 },
        { name: "Määräaikaishuolto", before: 30 },
      ]);
      expect(notificationFinalRemainder).toBe(7);
      expect(notificationEmailList).toStrictEqual(["test@example.com"]);
    });
  });

  describe("Test getVehicleDetails", () => {
    test("Test getVehicleDetails with default data", () => {
      const notificationSettings = [
        { name: "Katsastus", before: 30 },
        { name: "Määräaikaishuolto", before: 30 },
      ];
      const vehicles = getVehicleDetails(notificationSettings);
      expect(vehicles).toStrictEqual(vehicleList);
    });
  });

  describe("Test filterOnlyExpiring", () => {
    const documentProperties = propertiesService.getDocumentProperties();

    beforeEach(() => {
      documentProperties.deleteAllProperties();
    });

    test("Test filterOnlyExpiring without document properties", () => {
      const expiringVehicles = filterOnlyExpiring(vehicleList, 7);
      expect(expiringVehicles).toStrictEqual(expiringVehiclesList);
    });

    test("Test filterOnlyExpiring with document properties", () => {
      documentProperties.setProperty(
        "NOTIFICATION_SEND_Test vehicle #1_101_Katsastus",
        "2020-12-25T00:00:00.000+00:00"
      );
      documentProperties.setProperty(
        "NOTIFICATION_SENT_Test vehicle #2_102_Katsastus",
        "2021-01-01T00:00:00.000+00:00"
      );
      documentProperties.setProperty(
        "NOTIFICATION_SENT_Test vehicle #3_103_Katsastus",
        "2021-01-01T00:00:00.000+00:00"
      );
      documentProperties.setProperty(
        "NOTIFICATION_SENT_Test vehicle #3_103_Määräaikaishuolto",
        "2021-01-01T00:00:00.000+00:00"
      );
      documentProperties.setProperty(
        "NOTIFICATION_SENT_Test vehicle #4_104_Katsastus",
        "2021-01-01T00:00:00.000+00:00"
      );

      const expiringVehicles = filterOnlyExpiring(vehicleList, 7);
      expect(expiringVehicles).toStrictEqual([
        {
          expiryDate: new Date("2021-01-05T03:00:00.000Z"),
          expiryName: "Katsastus",
          name: "Test vehicle #1",
          number: "101",
          registerNumber: "abc-123",
          urgent: true,
        },
        {
          expiryDate: new Date("2021-01-12T03:00:00.000Z"),
          expiryName: "Määräaikaishuolto",
          name: "Test vehicle #4",
          number: "104",
          registerNumber: "jkl-abc",
          urgent: false,
        },
      ]);
    });
  });

  describe("Test sendMessages", () => {
    let spyMail;
    beforeEach(() => {
      spyMail = jest.spyOn(gmailApp.prototype, "sendEmail");
    });
  
    afterEach(() => {
      spyMail.mockRestore();
    });

    test("Test sendMessages", () => {
      const customExpiringVehiclesList = [
        {
          expiryDate: new Date("2021-01-05T03:00:00.000Z"),
          expiryName: "Katsastus",
          name: "Test vehicle #1",
          number: "101",
          registerNumber: "abc-123",
          urgent: true,
        },
        {
          expiryDate: new Date("2021-01-10T03:00:00.000Z"),
          expiryName: "Katsastus",
          name: "Test vehicle #2",
          number: "102",
          registerNumber: "def-456",
          urgent: false,
        },
      ];
      sendMessages(customExpiringVehiclesList, ["test1@example.com", "test2@example.com"]);
      expect(spyMail).toHaveBeenCalledTimes(4);
      expect(spyMail).toHaveBeenNthCalledWith(1, "test1@example.com", "Tärkeä: Katsastus on vanhetumassa 101/abc-123", expect.anything());
      expect(spyMail).toHaveBeenNthCalledWith(2, "test2@example.com", "Tärkeä: Katsastus on vanhetumassa 101/abc-123", expect.anything());
      expect(spyMail).toHaveBeenNthCalledWith(3, "test1@example.com", "Katsastus on vanhetumassa 102/def-456", expect.anything());
      expect(spyMail).toHaveBeenNthCalledWith(4, "test2@example.com", "Katsastus on vanhetumassa 102/def-456", expect.anything());
    });
  });
});
