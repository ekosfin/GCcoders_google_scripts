import GlobalUtils from "../TestUtils/GlobalUtils";
import sheet from "../__mocks__/sheet";

const goodTestTable = [
  ["", "", "Correct title", ""],
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
];

const badTestTable = [
  ["", "", "Incorrect title", ""],
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
];

beforeAll(() => {
  GlobalUtils.importFile("./RemeoUtils/Constants.js");
  GlobalUtils.importFile("./RemeoUtils/Cell.js");
});

describe("Cell utils tests", () => {
  describe("Test getColumnByTitle", () => {
    test("Test getColumnByTitle with expected data", () => {
      const mockSheet = new sheet(goodTestTable);
      const column = Cell.getColumnByTitle(mockSheet, "Correct title", 1);
      expect(column).toBe(3);
    });

    test("Test getColumnByTitle with unexpected data", () => {
      const mockSheet = new sheet(badTestTable);
      const column = Cell.getColumnByTitle(mockSheet, "Correct title", 1);
      expect(column).toBe(undefined);
    });

    test("Test getColumnByTitle with unexpected parameters", () => {
      const mockSheet = new sheet(goodTestTable);
      const column = Cell.getColumnByTitle(mockSheet, "Correct title", 2);
      expect(column).toBe(undefined);
    });
  });

  describe("Test getColumnByTitleInMemory", () => {
    test("Test getColumnByTitleInMemory with expected data", () => {
      const column = Cell.getColumnByTitleInMemory(
        goodTestTable,
        "Correct title",
        0
      );
      expect(column).toBe(2);
    });

    test("Test getColumnByTitleInMemory with unexpected data", () => {
      const column = Cell.getColumnByTitleInMemory(
        badTestTable,
        "Correct title",
        0
      );
      expect(column).toBe(undefined);
    });

    test("Test getColumnByTitleInMemory with unexpected parameters", () => {
      const column = Cell.getColumnByTitleInMemory(
        goodTestTable,
        "Correct title",
        1
      );
      expect(column).toBe(undefined);
    });
  });

  describe("Test getRowByTitle", () => {
    test("Test getColumnByTitle with expected data", () => {
      const mockSheet = new sheet(goodTestTable);
      const row = Cell.getRowByTitle(mockSheet, "Correct title", 3);
      expect(row).toBe(1);
    });

    test("Test getRowByTitle with unexpected data", () => {
      const mockSheet = new sheet(badTestTable);
      const row = Cell.getRowByTitle(mockSheet, "Correct title", 1);
      expect(row).toBe(undefined);
    });

    test("Test getRowByTitle with unexpected parameters", () => {
      const mockSheet = new sheet(goodTestTable);
      const row = Cell.getRowByTitle(mockSheet, "Correct title", 2);
      expect(row).toBe(undefined);
    });
  });

  describe("Test getRowByTitleInMemory", () => {
    test("Test getRowByTitleInMemory with expected data", () => {
      const row = Cell.getRowByTitleInMemory(goodTestTable, "Correct title", 2);
      expect(row).toBe(0);
    });

    test("Test getRowByTitleInMemory with unexpected data", () => {
      const row = Cell.getRowByTitleInMemory(badTestTable, "Correct title", 2);
      expect(row).toBe(undefined);
    });

    test("Test getRowByTitleInMemory with unexpected parameters", () => {
      const row = Cell.getRowByTitleInMemory(goodTestTable, "Correct title", 1);
      expect(row).toBe(undefined);
    });
  });

  describe("Test getFirstEmptyRow", () => {
    test("Test getFirstEmptyRow with normal data", () => {
      const testTable = [
        ["Non empty", "", "", ""],
        ["Non empty", "", "", ""],
        ["Non empty", "", "", ""],
        ["", "", "", ""],
      ];
      const mockSheet = new sheet(testTable);
      const row = Cell.getFirstEmptyRow(mockSheet);
      expect(row).toBe(4);
    });

    test("Test getFirstEmptyRow with empty table", () => {
      const testTable = [
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
      ];
      const mockSheet = new sheet(testTable);
      const row = Cell.getFirstEmptyRow(mockSheet);
      expect(row).toBe(1);
    });

    test("Test getFirstEmptyRow with full table", () => {
      const testTable = [
        ["Full", "", "", ""],
        ["Full", "", "", ""],
        ["Full", "", "", ""],
        ["Full", "", "", ""],
      ];
      const mockSheet = new sheet(testTable);
      const row = Cell.getFirstEmptyRow(mockSheet);
      expect(row).toBe(5);
    });
  });
  
  describe("Test conversion functions", () => {
    test("Test convertColumnIndexToLetter", () => {
      expect(Cell.convertColumnIndexToLetter(1)).toBe("A");
      expect(Cell.convertColumnIndexToLetter(5)).toBe("E");
      expect(Cell.convertColumnIndexToLetter(27)).toBe("AA");
      expect(Cell.convertColumnIndexToLetter(703)).toBe("AAA");
    });

    test("Test letterToColumn", () => {
      expect(Cell.letterToColumn("A")).toBe(1);
      expect(Cell.letterToColumn("E")).toBe(5);
      expect(Cell.letterToColumn("AA")).toBe(27);
      expect(Cell.letterToColumn("AAA")).toBe(703);
    });

    test("Test inter operability", () => {
      for (let index = 0; index < 1000; index++) {
        const results = Cell.letterToColumn(Cell.convertColumnIndexToLetter(index));
        expect(results).toBe(index);
      }
    });
  });
});
