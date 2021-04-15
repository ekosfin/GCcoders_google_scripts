export default class range {
  constructor(startRow, startColumn, endRow, endColumn, sheet) {
    this.startRow = startRow;
    this.startColumn = startColumn;
    this.endRow = endRow;
    this.endColumn = endColumn;
    this.sheet = sheet;
  }

  getRow() {
    return this.startRow;
  }

  getColumn() {
    return this.startColumn;
  }

  getValue() {
    return this.sheet.table[this.startRow - 1][this.startColumn - 1];
  }

  getValues() {
    const subTable = [];
    for (let row = this.startRow - 1; row < this.endRow; row++) {
      subTable.push(
        this.sheet.table[row].slice(this.startColumn - 1, this.endColumn)
      );
    }
    return subTable;
  }

  setValue(newValue) {
    if (newValue === undefined) {
      newValue = "";
    }
    this.sheet.table[this.startRow - 1][this.startColumn - 1] = newValue;
    return this;
  }

  setValues(newValues) {
    for (let rowIndex = 0; rowIndex < newValues.length; rowIndex++) {
      for (
        let columnIndex = 0;
        columnIndex < newValues[rowIndex].length;
        columnIndex++
      ) {
        this.sheet.table[this.startRow - 1 + rowIndex][
          this.startColumn - 1 + columnIndex
        ] = newValues[rowIndex][columnIndex];
      }
    }
    return this;
  }

  offset(rowOffset, columnOffset) {
    const newStartRow = this.startRow + rowOffset;
    const newStartColumn = this.startColumn + columnOffset;
    const newEndRow = this.endRow + rowOffset;
    const offsetRange = new range(newStartRow, newStartColumn, newEndRow, null, this.sheet);
    return offsetRange;
  }

  activate() {
    this.sheet.activeRange = this;
  }

  shiftColumnGroupDepth(amount) {
    // Dummy implementation
  }

  setBackground(color) {
    // Dummy implementation
  }

  autoFill(autoFillRange, autoFillType) {
    // Dummy implementation
  }

  setNumberFormat(format) {
    // Just hack, since formatting is always same
    const date = this.sheet.table[this.startRow - 1][this.startColumn - 1];
    this.sheet.table[this.startRow - 1][
      this.startColumn - 1
    ] = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  }

  /* Helper functions for fake implementation */
  /********************************************/
  /*setRow(row) {
    this.row = row;
  }

  setColumn(column) {
    this.column = column;
  }*/
  /********************************************/
}
