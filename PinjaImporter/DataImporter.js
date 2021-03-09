function getTitleRow_(sheet) {
  const textFinder = sheet.createTextFinder(PINJA_TITLE_ROW_IDENTIFIER);
  const candidates = textFinder.findAll();
  if (candidates.length == 0) {
    Utils.Log.error(`Otsake rivin sijaintia ei löytynyt avaimella ${TITLE_ROW_IDENTIFIER}`);
    throw ("couldn't find title row with the specified key")
  }
  return candidates[0].getRow();
}

function getProductAproximation_(productList, string) {
  // Try first full match
  for (const productCandidate of productList) {
    if (productCandidate == string) {
      return productCandidate;
    }
  };

  // Then wider match
  for (const productCandidate of productList) {
    if (string.includes(productCandidate)) {
      return productCandidate;
    }
  };
  return undefined;
}

function scrapeData_(sheet, titleRow, productList) {
  // Minus 1, because in memory table indexing starts from zero
  const productColumn = Utils.Cell.getColumnByTitle(sheet, PINJA_PRODUCT_COLUMN_IDENTIFIER, titleRow) - 1;
  const typeColumn = Utils.Cell.getColumnByTitle(sheet, PINJA_TYPE_COLUMN_IDENTIFIER, titleRow) - 1;
  const weightColumn = Utils.Cell.getColumnByTitle(sheet, PINJA_WEIGHT_COLUMN_IDENTIFIER, titleRow) - 1;

  // Read whole table into memory to speed up reading
  const table = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).getValues();

  const results = {};
  let currentDate;
  for (let row = titleRow; row < table.length; row++) {
    const newDateCandidate = table[row][PINJA_DATE_COLUMN - 1].match(PINJA_DATE_REGEX);
    if (newDateCandidate != null) {
      const newDateSplit = newDateCandidate[0].split(".");
      // Months start from 0
      currentDate = new Date(newDateSplit[2], newDateSplit[1] - 1, newDateSplit[0], 5)
      currentDate = currentDate.toUTCString();
      if (!results[currentDate]) {
        results[currentDate] = [];
      }
    }
    // Skip if date is still not defined
    if (!currentDate) {
      continue;
    }

    const productRaw = table[row][productColumn].match(PINJA_PRODUCT_CLEANUP_REGEX);
    // No empty products
    if (!productRaw) {
      continue;
    }
    const product = getProductAproximation_(productList, productRaw[0].trim());
    if (!product) {
      continue;
    }

    let type;
    const rawType = table[row][typeColumn];
    if (rawType.match(PINJA_TYPE_IN_REGEX)) {
      type = DIRECTIONS.IN;
    } else if (rawType.match(PINJA_TYPE_OUT_REGEX)) {
      type = DIRECTIONS.OUT;
    } else {
      // There must be a proper type
      continue;
    }

    const weight = table[row][weightColumn];
    
    const entry = {product: product, type: type, weight: weight};
    // Save under current date as last entry
    results[currentDate].push(entry);
  }
  return results;
}

function organizeByProductAndDate_(scrapedData, productList) {
  // Convert product list to object keys
  const dataByProduct = productList.reduce((item,index)=> (item[index]={out: {}, in: {}},item),{});
  
  // Go through scraped data and organize entries to correct places
  // https://stackoverflow.com/questions/8312459/iterate-through-object-properties
  for (let date in scrapedData) {
    if (!Object.prototype.hasOwnProperty.call(scrapedData, date)) {
        continue;
    }
    const dateData = scrapedData[date];
    dateData.forEach((entry, _) => {
      // Check is it a proper product that can be imported
      if (!dataByProduct[entry.product]) {
        return;
      }

      // Is this product initialized on this date?
      if (!dataByProduct[entry.product][entry.type][date]) {
        dataByProduct[entry.product][entry.type][date] = 0;
      }
      dataByProduct[entry.product][entry.type][date] += entry.weight;
    });
  }
  return dataByProduct;
}

function importPinjaData_(sheet, productList) {
  const titleRow = getTitleRow_(sheet);
  const scrapedData = scrapeData_(sheet, titleRow, productList);
  const organizedData = organizeByProductAndDate_(scrapedData, productList);
  return organizedData;
}
