// getProductList retrieves list of products that should be imported from Pinja.
// List is needed, because unknown products should be skipped.
function getProductList() {
  const productStartCell = Utils.Settings.getCellByKey(PRODUCT_LIST_START_CELL_NAME);
  const sheet = sApp.getSheetByName(PRODUCT_SHEET_NAME);
  const rawProductList = sheet.getRange(`${productStartCell.a1}:${productStartCell.column}${sheet.getMaxRows()}`).getValues();
  let productList = [];
  for (const productCandidate of rawProductList) {
    if (productCandidate[0] != "") {
      productList.push(productCandidate[0]);
    }
  }
  Utils.Log.info(`Noudettiin tiedot eri tuotteista pinjaa varten taulukosta: "${sheet.getName()}" onnistuneesti.`);
  return productList;
}

// placePinjaData places imported data to Saa and Läh sheets
function placePinjaData(sheet, direction, productList, importedData) {
  const startCell = Utils.Settings.getCellByKey(DATA_START_CELL_NAME);
  // Load all sheet data into memory
  const table = sheet.getRange(startCell.row, startCell.column, sheet.getMaxRows() - startCell.row, sheet.getMaxColumns() - startCell.column).getValues();
  // List of new data will be located in a changes variable.
  // This kind of data structure is used for improving performance significantly.
  const changes = [];
  productList.every((product, productRow) => {
    const productData = importedData[product]
    for (const date in productData[direction]) {
      const dateObject = new Date(date);
      const dateData = productData[direction][date];
      // If certain product does not have any data on certain date, skip it
      if (!Object.prototype.hasOwnProperty.call(productData[direction], date)) {
          continue;
      }
      const dateColumn = SheetManagementUtils.getCellByDate(SheetManagementUtils.DATE_MODE.DAY, dateObject).column - startCell.column;
      // Check that new data is inside sheet's date range
      if (!(productRow < table.length && dateColumn < table[0].length)) {
        Utils.Log.error("Pinjasta tuotu data ylitti taulukon koon. Ovathan päivät päivittyneet oikein?");
        return false;
      }

      // Do not update if there is allready value in the sheets cell
      if (table[productRow][dateColumn]) {
        continue;
      }
      // Add new value to list of changes
      changes.push({row: productRow + startCell.row, column: dateColumn + startCell.column, value: dateData})
    }
    return true;
  })
  // Apply changes to the table
  for (const change of changes) {
    sheet.getRange(change.row, change.column).setValue(change.value);
  }
  Utils.Log.info(`Asetettiin pinjasta tuotu tieto taulukkoon: "${sheet.getName()}" onnistuneesti.`);
}

// importPinjaData function imports data from Pinja sheets and places values in this sheet
function importPinjaData() {
  const productList = getProductList();
  const importedData = PinjaImporter.importPinjaData(productList);
  // update Saa and Läh sheets using data imported from Pinja sheets
  const saaSheet = sApp.getSheetByName("Saa");
  placePinjaData(saaSheet, PinjaImporter.DIRECTIONS.IN, productList, importedData);
  const lahSheet = sApp.getSheetByName("Läh");
  placePinjaData(lahSheet, PinjaImporter.DIRECTIONS.OUT, productList, importedData);
}
