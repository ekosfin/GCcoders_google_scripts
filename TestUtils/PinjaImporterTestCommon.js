import sheet from "../__mocks__/sheet";
import spreadsheetApp from "../__mocks__/spreadsheetApp";

export default class PinjaImporterTestCommon {
  static normalTestTable = [
    [
      "Käyttöpaikka",
      "Kuormanumero",
      "!",
      "Raportointiaika",
      "Asiakas/Toimittaja",
      "Tuote",
      "Purkupaikka",
      "Kuljetusväline",
      "Liikennöitsijä",
      "Tyyppi",
      "Tila",
      "Netto (t)",
    ],
    ["01.02.2021   (Lkm: 27)", "", "", "", "", "", "", "", "", ""],
    [
      "Lahti",
      "2059611000002",
      "0",
      "01.02. 12:45",
      "",
      "Alite 0-20 mm kevyt (R314055)",
      "",
      "PTC-007",
      "PTC - liikennöitsijä",
      "Toimitus, sisään",
      "VALMIS",
      "15.000",
    ],
    [
      "Lahti",
      "2059611000002",
      "0",
      "01.02. 12:45",
      "",
      "Alite 0-20 mm kevyt (R314055)",
      "",
      "PTC-007",
      "PTC - liikennöitsijä",
      "Toimitus, sisään",
      "VALMIS",
      "10.000",
    ],
    [
      "Lahti",
      "2059611000002",
      "0",
      "01.02. 12:45",
      "",
      "Betoni yli 500 mm (R314060)",
      "",
      "PTC-007",
      "PTC - liikennöitsijä",
      "Toimitus, sisään",
      "VALMIS",
      "5.000",
    ],
    [
      "Lahti",
      "2059611000002",
      "0",
      "01.02. 12:45",
      "",
      "Betoni yli 500 mm (R314060)",
      "",
      "PTC-007",
      "PTC - liikennöitsijä",
      "Toimitus, ulos",
      "VALMIS",
      "2.000",
    ],
    ["02.02.2021   (Lkm: 27)", "", "", "", "", "", "", "", "", ""],
    [
      "Lahti",
      "2059611000002",
      "0",
      "02.02. 12:45",
      "",
      "Paperi (R314202)",
      "",
      "PTC-007",
      "PTC - liikennöitsijä",
      "Toimitus, sisään",
      "VALMIS",
      "22.500",
    ],
    [
      "Lahti",
      "2059611000002",
      "0",
      "02.02. 12:45",
      "",
      "Sellu",
      "",
      "PTC-007",
      "PTC - liikennöitsijä",
      "Toimitus, sisään",
      "VALMIS",
      "22.000",
    ],
    [
      "Lahti",
      "2059611000002",
      "0",
      "02.02. 12:45",
      "",
      "Betoni yli 500 mm (R314060)",
      "",
      "PTC-007",
      "PTC - liikennöitsijä",
      "Toimitus, sisään",
      "VALMIS",
      "30.000",
    ],
  ];

  static scrapedData = {
    "Mon, 01 Feb 2021 03:00:00 GMT": [
      { product: "Alite", type: "in", weight: 15 },
      { product: "Alite", type: "in", weight: 10 },
      { product: "Betoni", type: "in", weight: 5 },
      { product: "Betoni", type: "out", weight: 2 },
    ],
    "Tue, 02 Feb 2021 03:00:00 GMT": [
      { product: "Paperi", type: "in", weight: 22.5 },
      { product: "Betoni", type: "in", weight: 30 },
    ],
  };

  static dateByProduct = {
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

  static productList = ["Alite", "Betoni", "Paperi"];

  static prepareTest(testTable) {
    let mSheet;
    const sApp = spreadsheetApp.getInstance();

    const settingsTable = [
      [SETTINGS_TITLE, "Arvo #1:", "Arvo #2:", "Arvo #3:"],
      ["Pinja kansion ID", "1V2f5x-HgQKhLWF60b6-pkfk3OZShyoAm", "", ""],
      ["Pinja otsikkorivin avain", "Käyttöpaikka", "", ""],
      ["Pinja päivämäärä sarake", "1", "", ""],
      ["Pinja tuotteen otsikko", "Tuote", "", ""],
      ["Pinja suunnan otsikko", "Tyyppi", "", ""],
      ["Pinja suunta sisään", "Toimitus, sisään", "", ""],
      ["Pinja suunta ulos", "Toimitus, ulos", "", ""],
      ["Pinja painon otsikko", "Netto (t)", "", ""],
      ["Pinja päivämäärän tunnistus", "[0-9]{1,2}.[0-9]{1,2}.[0-9]{4}", "", ""],
      ["Pinja tuotenimen puhdistus", "[^(]+", "", ""],
    ];
    const settingsSheet = new sheet(settingsTable);

    const logTable = [
      [TIME_TITLE, TYPE_TITLE, MESSAGE_TITLE],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    const logSheet = new sheet(logTable);

    mSheet = new sheet(testTable);
    sApp.addSheet(SETTINGS_SHEET_NAME, settingsSheet);
    sApp.addSheet(LOG_SHEET_NAME, logSheet);
    sApp.addSheet("Sheet", mSheet);
    global.sApp = sApp;

    // Force reinitialize Pinja constants
    INITIALIZED = false;
    initialize();
    return mSheet;
  }
}

export {PinjaImporterTestCommon};