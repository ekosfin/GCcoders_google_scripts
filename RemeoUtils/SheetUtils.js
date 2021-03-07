function getColumnByTitle(sheet, title, titleRow) {
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

function getRowByTitle(sheet, title, titleColumn) {
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

function getFirstEmptyRow(sheet) {
  const column = sheet.getRange('A:A');
  const values = column.getValues();
  // Check is the final row full, if yes create new row and return that
  if (values[sheet.getMaxRows() - 1][0] != "") {
    sheet.insertRowsAfter(sheet.getMaxRows(), 1)
    return sheet.getMaxRows();
  }

  var index = 0;
  while ( values[index][0] != "" ) {
    index++;
  }
  return (index+1);
}

// https://stackoverflow.com/questions/21229180/convert-column-index-into-corresponding-column-letter
function convertColumnIndexToLetter(column) {
  let remainder, letter = '';
  while (column > 0)
  {
    remainder = (column - 1) % 26;
    letter = String.fromCharCode(remainder + 65) + letter;
    column = (column - remainder - 1) / 26;
  }
  return letter;
}