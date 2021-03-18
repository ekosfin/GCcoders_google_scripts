import textFinder from "./textFinder";
import range from "./range";

export default class sheet {
  constructor(table) {
    this.table = table;
  }

  createTextFinder(target) {
    return new textFinder(this, target);
  }

  // getRange using A1 notation
  // getRange using row, column, rowAmount, columnAmount
  getRange(rangeRowParameter, columnParameter, rowAmountParameter, columnAmountParameter) {
    let start, end, startRow, startColumn, endRow, endColumn;
    // Is A1 or row, column or row, column, rowAmount, columnAmount
    if (!columnParameter) {
      // A1
      [start, end] = rangeRowParameter.split(":");
      startRow = start.match(/[0-9]*/)[0];
      startRow = (startRow) ? startRow : 1;
      startColumn = this.letterToColumn(start.match(/\w/)[0]);
      endRow = end.match(/[0-9]*/)[0];
      endRow = (endRow != 0) ? endRow - 1 : this.table.length;
      endColumn = this.letterToColumn(end.match(/\w/)[0]);
    } else if (!rowAmountParameter) {
      // row, column
      return new range(rangeRowParameter, columnParameter, rangeRowParameter, columnAmountParameter, this);
    } else {
      // row, column, rowAmount, columnAmount
      startRow = rangeRowParameter;
      startColumn = columnParameter;
      // start point is calculated into amount.
      // Also index difference must be taken into account
      endRow = rangeRowParameter + rowAmountParameter - 1;
      endColumn = columnParameter + columnAmountParameter - 1;
    }

    const selectedRange = new range(startRow, startColumn, endRow, endColumn, this);
    return selectedRange;
  }

  getMaxRows() {
    return this.table.length;
  }

  getMaxColumns() {
    return this.table[0].length;
  }

  getColumnGroupDepth() {
    // Dummy implementation
  }

  insertRowsAfter(row, amount) {
    // Generate new rows
    const newRows = []
    for (let rowIndex = 0; rowIndex < amount; rowIndex++) {
      newRows.push([]);
      for (let columnIndex = 0; columnIndex < this.table[0].length; columnIndex++) {
        newRows[rowIndex].push("");
      }
    }

    // Add new rows to correct place
    const beforeRows = this.table.splice(0, row);
    const afterRows = this.table.splice(row, 0);
    const updatedCells = beforeRows.concat(newRows);
    updatedCells.concat(afterRows);
    this.table = updatedCells;
    // this.updatePositions();
  }

  /* Helper functions for fake implementation */
  /********************************************/
  /*tableToCells(table) {
    const cells = [];
    table.forEach((row, rowIndex) => {
      cells.push([]);
      row.forEach((cellValue, columnIndex) => {
        cells[rowIndex].push(
          new cell(rowIndex + 1, columnIndex + 1, cellValue)
        );
      });
    });
    return cells;
  }

  cellsToTable(cells) {
    const table = [];
    cells.forEach((row, rowIndex) => {
      table.push([]);
      row.forEach(cellValue => {
        table[rowIndex].push(cellValue.getValue())
      });
    });
    return table;
  }*/

  letterToColumn(letter) {
    let column = 0,
      length = letter.length;
    for (let i = 0; i < length; i++) {
      column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
  }

  /*updatePositions() {
    this.cells.forEach((row, rowIndex) => {
      row.forEach((cellObject, columnIndex) => {
        cellObject.setRow(rowIndex);
        cellObject.setColumn(columnIndex);
      });
    });
  }*/
  /********************************************/
}
