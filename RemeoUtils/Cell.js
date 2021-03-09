class Cell {
  // Get column index based on the sheet and string and title row
  static getColumnByTitle(sheet, title, titleRow) {
    const textFinder = sheet.createTextFinder(title)
    const columnCandidates = textFinder.findAll();

    let results;
    columnCandidates.forEach((columnCandidate) => {
      if (columnCandidate.getRow() == titleRow) {
        results = columnCandidate.getColumn();
      }
    })
    return results;
  }

  static getColumnByTitleInMemory(table, title, titleRow) {
    let result;
    table[titleRow].forEach((cell, column) => {
      if (cell == title) {
        result = column;
      }
    })
    return result;
  }

  static getRowByTitle(sheet, title, titleColumn) {
    const textFinder = sheet.createTextFinder(title)
    const rowCandidates = textFinder.findAll();

    let results;
    rowCandidates.forEach((rowCandidate) => {
      if (rowCandidate.getColumn() == titleColumn) {
        results = rowCandidate.getRow()
      }
    })
    return results;
  }

  static getRowByTitleInMemory(table, title, titleColumn) {
    let result;
    table.forEach((row, rowIndex) => {
      if (row[titleColumn] == title) {
        result = rowIndex;
      }
    })
    return result;
  }

  // Get first row that has empty A column
  static getFirstEmptyRow(sheet) {
    const column = sheet.getRange('A:A');
    const values = column.getValues();
    // Check is the final row full, if yes create several new rows and return
    if (values[sheet.getMaxRows() - 1][0] != "") {
      sheet.insertRowsAfter(sheet.getMaxRows(), 1)
      return sheet.getMaxRows();
    }

    let index = 0;
    while ( values[index][0] != "" ) {
      index++;
    }
    return (index+1);
  }

  // https://stackoverflow.com/questions/21229180/convert-column-index-into-corresponding-column-letter
  static convertColumnIndexToLetter(column) {
    let remainder, letter = '';
    while (column > 0)
    {
      remainder = (column - 1) % 26;
      letter = String.fromCharCode(remainder + 65) + letter;
      column = (column - remainder - 1) / 26;
    }
    return letter;
  }

  static letterToColumn(letter) {
    let column = 0, length = letter.length;
    for (let i = 0; i < length; i++)
    {
      column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
  }
}