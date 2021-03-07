function getProductList() {
  const productStartCell = RemeoUtils.getCellSettingByKey("Tuotelistan aloitus solu");
  const sheet = sApp.getSheetByName("VaakaArvo");
  const rawProductList = sheet.getRange(`${productStartCell.a1}:${productStartCell.column}${sheet.getMaxRows()}`).getValues();
  let productList = [];
  for (const productCandidate of rawProductList) {
    if (productCandidate[0] != "") {
      productList.push(productCandidate[0]);
    }
  }
  return productList;
}

function placePinjaData(sheet, direction, productList, importedData) {
  const startCell = RemeoUtils.getCellSettingByKey("Datan aloitus solu");
  const table = sheet.getRange(startCell.row, startCell.column, sheet.getMaxRows() - startCell.row, sheet.getMaxColumns() - startCell.column).getValues();
  const changes = [];
  productList.every((product, productRow) => {
    const productData = importedData[product]
    for (const date in productData[direction]) {
      const dateObject = new Date(date);
      const dateData = productData[direction][date];
      if (!Object.prototype.hasOwnProperty.call(productData[direction], date)) {
          continue;
      }
      const dateColumn = SheetManagementUtils.getCellByDate(SheetManagementUtils.DATE_MODE.DAY, dateObject).column - startCell.column;
      // Check that new data is inside date range
      if (!(productRow < table.length && dateColumn < table[0].length)) {
        RemeoUtils.error("Pinjasta tuotu data ylitti taulukon koon. Ovathan päivät päivittyneet oikein?");
        return false;
      }

      // Do not update if there is allready value in the cell
      if (table[productRow][dateColumn]) {
        continue;
      }
      changes.push({row: productRow + startCell.row, column: dateColumn + startCell.column, value: dateData})
    }
    return true;
  })
  // Apply changes
  for (const change of changes) {
    sheet.getRange(change.row, change.column).setValue(change.value);
  }
}

function importPinjaData() {
  const productList = getProductList();
  const importedData = PinjaImporter.importPinjaData(productList);
  const saaSheet = sApp.getSheetByName("Saa");
  placePinjaData(saaSheet, PinjaImporter.DIRECTIONS.IN, productList, importedData);
  const lahSheet = sApp.getSheetByName("Läh");
  placePinjaData(lahSheet, PinjaImporter.DIRECTIONS.OUT, productList, importedData);
}
