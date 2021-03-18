import range from "./range";

export default class textFinder {
    constructor(sheet, target) {
        this.sheet = sheet;
        this.target = target;
    }

    findAll() {
        const results = [];
        for (const [rowIndex, row] of this.sheet.table.entries()) {
            for (const [columnIndex, cell] of row.entries()) {
                if (cell == this.target) {
                    results.push(new range(rowIndex + 1, columnIndex + 1, rowIndex + 1, columnIndex + 1, cell));
                }
            }
        }
        return results;
    }
}