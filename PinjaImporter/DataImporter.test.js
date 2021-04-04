import GlobalUtils from "../TestUtils/GlobalUtils";
import {PinjaImporterTestCommon as TestCommon} from "../TestUtils/PinjaImporterTestCommon";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importFile("./PinjaImporter/Constants.js");
  GlobalUtils.importFile("./PinjaImporter/DataImporter.js");
});

describe("Test Data importer", () => {
  describe("Test getTitleRow_", () => {
    test("Test getTitleRow_ with normal data", () => {
      const mSheet = TestCommon.prepareTest(TestCommon.normalTestTable);
      const titleRow = getTitleRow_(mSheet);
      expect(titleRow).toBe(1);
    });

    test("Test getTitleRow_ with untraditional data", () => {
      const testTableCopy = JSON.parse(JSON.stringify(TestCommon.normalTestTable));
      // Swap first and second row
      const secondRow = testTableCopy[1];
      testTableCopy[1] = testTableCopy[0];
      testTableCopy[0] = secondRow;

      const mSheet = TestCommon.prepareTest(testTableCopy);
      const titleRow = getTitleRow_(mSheet);
      expect(titleRow).toBe(2);
    });

    test("Test getTitleRow_ with missing title key title", () => {
      const testTableCopy = JSON.parse(JSON.stringify(TestCommon.normalTestTable));
      testTableCopy[0][0] = "Nothing";

      const mSheet = TestCommon.prepareTest(testTableCopy);
      expect(() => {
        getTitleRow_(mSheet);
      }).toThrow("couldn't find title row");
    });
  });

  describe("Test getProductAproximation_", () => {
    test("Test getProductAproximation_ with full match data", () => {
      expect(getProductAproximation_(TestCommon.productList, "Alite")).toBe("Alite");
    });

    test("Test getProductAproximation_ with half match data", () => {
      expect(
        getProductAproximation_(TestCommon.productList, "Betoni yli 500 mm (R314060)")
      ).toBe("Betoni");
    });

    test("Test getProductAproximation_ with not matching data", () => {
      expect(getProductAproximation_(TestCommon.productList, "Sekajäte")).toBe(undefined);
    });
  });

  describe("Test scrapeData_", () => {
    test("Test scrapeData_ with normal data", () => {
      const mSheet = TestCommon.prepareTest(TestCommon.normalTestTable);
      const scrapeResults = scrapeData_(mSheet, 1, TestCommon.productList);
      expect(scrapeResults).toStrictEqual(TestCommon.scrapedData);
    });

    test("Test scrapeData_ with bad data", () => {
      const badTestTable = [
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
          "Toimitus",
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
          "OK",
        ],
      ];
      const mSheet = TestCommon.prepareTest(badTestTable);
      const scrapeResults = scrapeData_(mSheet, 1, TestCommon.productList);
      expect(scrapeResults).toStrictEqual({
        "Mon, 01 Feb 2021 03:00:00 GMT": [],
      });
    });
  });

  describe("Test organizeByProductAndDate_", () => {
    test("Test organizeByProductAndDate_ with normal scraped data", () => {
      const mSheet = TestCommon.prepareTest([[]]);
      const organizedData = organizeByProductAndDate_(TestCommon.scrapedData, TestCommon.productList);
      expect(organizedData).toStrictEqual(TestCommon.dateByProduct);
    });
  });

  describe("Test importPinjaData_ E2E tests", () => {
    test("Test importPinjaData_ with normal data", () => {
      const mSheet = TestCommon.prepareTest(TestCommon.normalTestTable);
      const organizedData = importPinjaData_(mSheet, TestCommon.productList);
      expect(organizedData).toStrictEqual(TestCommon.dateByProduct);
    });
  });
});
